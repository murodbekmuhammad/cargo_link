// Turns a free-text Telegram post (Uzbek, Russian or English) into a CargoLink vacancy.
// Plain heuristics, no paid AI: anything we can't read confidently is left out and the full
// post text is kept as the description, with a link back to the original post.

import { createHash } from 'node:crypto';

// Labels must match CITIES in src/data/cities.ts; the site turns the label into coordinates.
const CITY_ALIASES = {
  Tashkent: ['toshkent', 'tashkent', 'ташкент', 'тошкент'],
  Samarkand: ['samarqand', 'samarkand', 'самарканд', 'самарқанд'],
  Bukhara: ['buxoro', 'bukhara', 'buhara', 'бухара', 'бухоро'],
  Namangan: ['namangan', 'наманган'],
  Andijan: ['andijon', 'andijan', 'андижан', 'андижон'],
  Fergana: ["farg'ona", 'fargona', 'fergana', 'фергана', 'фарғона', 'фаргона'],
  Qarshi: ['qarshi', 'karshi', 'карши', 'қарши'],
  Navoiy: ['navoiy', 'navoi', 'навои', 'навоий'],
  Jizzakh: ['jizzax', 'jizzakh', 'djizak', 'джизак', 'жиззах'],
  Gulistan: ['guliston', 'gulistan', 'гулистан', 'гулистон'],
  Termez: ['termiz', 'termez', 'термез', 'термиз'],
  Urgench: ['urganch', 'urgench', 'ургенч', 'урганч'],
  Nukus: ['nukus', 'нукус'],
};

// Checked in this order; the first category whose word appears earliest in the post wins.
const CATEGORY_PATTERNS = {
  'Truck driver': ['haydovchi', 'ҳайдовчи', 'хайдовчи', 'водител', 'driver', 'shofyor', 'шофер', 'дальнобой', 'fura', 'фура'],
  Dispatcher: ['dispetcher', 'диспетчер', 'dispatcher'],
  Forwarder: ['ekspeditor', 'экспедитор', 'forwarder'],
  Mechanic: ['mexanik', 'механик', 'mechanic', 'avtoelektrik', 'автоэлектрик'],
  Warehouse: ['ombor', 'склад', 'кладовщик', 'warehouse', 'yuk ortuvchi', 'грузчик'],
  // "logist" but not "logistika"/"логистика" (the industry, which every post mentions).
  'Logistics manager': ['logist(?!ika|ik)', 'логист(?!ик)', 'logistics manager', 'menejer', 'менеджер'],
};

const VACANCY_WORDS = [
  'vakansiya', 'вакансия', 'вакансии', 'ish', 'иш', 'ishga', 'talab', 'kerak', 'керак', 'требует', 'нужен', 'нужны',
  'ищем', 'hiring', 'job', 'maosh', 'маош', 'oylik', 'ойлик', 'зарплат', 'з/п', 'salary',
  ...Object.values(CATEGORY_PATTERNS).flat(),
];

// Words that make a poor title on their own ("ВАКАНСИЯ", "Ish bor!").
const GENERIC_TITLES = /^(vakansiya|вакансия|vacancy|job|ish|ish bor|иш бор|срочно|shoshilinch|e'lon|объявление)\W*$/iu;

const normalize = (text) => text.toLowerCase().replace(/[ʻʼ‘’`]/g, "'");

/** Position of the earliest word in `words` that starts a word in `text`, or -1. */
function firstIndex(text, words) {
  let best = -1;
  for (const w of words) {
    const m = new RegExp(`(?<![\\p{L}'])${w}`, 'u').exec(text);
    if (m && (best === -1 || m.index < best)) best = m.index;
  }
  return best;
}

export function isVacancy(text) {
  return text.trim().length >= 40 && firstIndex(normalize(text), VACANCY_WORDS) !== -1;
}

export function detectCity(text) {
  const t = normalize(text);
  let found;
  for (const [label, aliases] of Object.entries(CITY_ALIASES)) {
    const i = firstIndex(t, aliases);
    if (i !== -1 && (!found || i < found.i)) found = { label, i };
  }
  return found?.label;
}

export function detectCategory(text) {
  const t = normalize(text);
  let found;
  for (const [category, patterns] of Object.entries(CATEGORY_PATTERNS)) {
    const i = firstIndex(t, patterns);
    if (i !== -1 && (!found || i < found.i)) found = { category, i };
  }
  return found?.category ?? 'Other';
}

/** US-dollar amounts only ("$1500", "1 500$", "1500-2000 USD"). Other currencies stay in the text. */
export function detectSalaryUsd(text) {
  const amounts = [];
  const num = String.raw`\d{1,3}(?:[ .,]\d{3})+|\d{3,5}`;
  const re = new RegExp(
    String.raw`\$\s?(${num})(?:\s?[-–]\s?\$?\s?(${num}))?|(${num})(?:\s?[-–]\s?(${num}))?\s?(?:\$|usd|dollar|доллар)`,
    'giu',
  );
  for (const m of text.matchAll(re)) {
    for (const g of [m[1], m[2], m[3], m[4]]) {
      if (!g) continue;
      const n = Number(g.replace(/[ .,]/g, ''));
      if (n >= 100 && n <= 20000) amounts.push(n);
    }
    if (amounts.length) break; // first salary mention only
  }
  if (!amounts.length) return {};
  return { salaryMin: Math.min(...amounts), salaryMax: Math.max(...amounts) };
}

function cleanLine(line) {
  return line
    .replace(/#[\p{L}\p{N}_]+/gu, '') // hashtags
    .replace(/[*_~`|]/g, '') // markdown
    .replace(/^[^\p{L}\p{N}]+/u, '') // leading emoji, bullets
    .replace(/\s+/g, ' ')
    .trim();
}

export function makeTitle(text) {
  const lines = text.split('\n').map(cleanLine).filter((l) => /\p{L}/u.test(l));
  const line = lines.find((l) => !GENERIC_TITLES.test(l)) ?? lines[0] ?? 'Vacancy';
  if (line.length <= 80) return line;
  const cut = line.slice(0, 80);
  return `${cut.slice(0, cut.lastIndexOf(' ') > 40 ? cut.lastIndexOf(' ') : 80)}…`;
}

/** Same post forwarded to several channels → same fingerprint, so it's listed once. */
export function fingerprint(text) {
  const key = normalize(text).replace(/[^\p{L}\p{N}]+/gu, '');
  return createHash('sha1').update(key).digest('hex').slice(0, 16);
}

/**
 * @param {{ text: string, date: Date, messageId: number }} post
 * @param {{ key: string, title: string, url: (messageId: number) => string }} channel
 */
export function toVacancy(post, channel) {
  const text = post.text.trim();
  const city = detectCity(text);
  return {
    id: `tg-${channel.key}-${post.messageId}`,
    companyId: `telegram:${channel.key}`,
    companyName: channel.title,
    title: makeTitle(text),
    category: detectCategory(text),
    ...(city && { city }),
    ...detectSalaryUsd(text),
    description: text,
    requirements: [],
    postedAt: post.date.toISOString(),
    fingerprint: fingerprint(text),
    source: { kind: 'telegram', channel: channel.title, url: channel.url(post.messageId) },
  };
}
