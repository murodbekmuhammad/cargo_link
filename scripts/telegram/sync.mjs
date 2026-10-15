// Hourly job: read new posts from the Telegram channels you've joined and save the vacancies
// to public/data/telegram-vacancies.json, which the website loads on start.
//
// Needs (GitHub → Settings → Secrets and variables → Actions):
//   secrets   TELEGRAM_API_ID, TELEGRAM_API_HASH  from https://my.telegram.org → API development tools
//             TELEGRAM_SESSION                    printed by `npm run telegram:login`
//   variable  TELEGRAM_CHANNELS                   e.g. "logistika_ish, https://t.me/yuk_vakansiya, -1001234567890"

import { readFileSync, writeFileSync } from 'node:fs';
import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions/index.js';
import { isVacancy, toVacancy } from './parse.mjs';

const OUT = new URL('../../public/data/telegram-vacancies.json', import.meta.url);
const KEEP_DAYS = 30;
const MAX_VACANCIES = 1000;
const FIRST_RUN_LIMIT = 50; // posts per channel the first time we see it
const BATCH_LIMIT = 200; // posts per channel per run after that

const { TELEGRAM_API_ID, TELEGRAM_API_HASH, TELEGRAM_SESSION, TELEGRAM_CHANNELS = '' } = process.env;
const channels = TELEGRAM_CHANNELS.split(/[\s,]+/)
  .map((c) => c.replace(/^(https?:\/\/)?t\.me\//, '').replace(/^@/, '').replace(/\/$/, ''))
  .filter(Boolean);

if (!TELEGRAM_API_ID || !TELEGRAM_API_HASH || !TELEGRAM_SESSION || !channels.length) {
  // Not set up yet: skip quietly instead of failing every hour. See README → Telegram import.
  console.log('::warning::Telegram import is not configured yet; skipping. See README → Telegram import.');
  process.exit(0);
}

function readStore() {
  try {
    return JSON.parse(readFileSync(OUT, 'utf8'));
  } catch {
    return { channels: {}, vacancies: [] };
  }
}

const client = new TelegramClient(new StringSession(TELEGRAM_SESSION), Number(TELEGRAM_API_ID), TELEGRAM_API_HASH, {
  connectionRetries: 3,
});
client.setLogLevel('error');

let dialogs;
async function resolve(ref) {
  if (!/^-?\d+$/.test(ref)) return client.getEntity(ref);
  // Private channels have no username: find them by id among the chats this account has joined.
  dialogs ??= await client.getDialogs({});
  const id = ref.replace(/^-100/, '');
  const dialog = dialogs.find((d) => d.entity?.id?.toString() === id);
  if (!dialog) throw new Error('this account is not a member of that channel');
  return dialog.entity;
}

const store = readStore();
const known = new Set(store.vacancies.map((v) => v.fingerprint));
const added = [];
let failures = 0;

await client.connect();
for (const ref of channels) {
  try {
    const entity = await resolve(ref);
    const key = entity.username ?? entity.id.toString();
    const channel = {
      key,
      title: entity.title ?? key,
      url: (msgId) =>
        entity.username ? `https://t.me/${entity.username}/${msgId}` : `https://t.me/c/${entity.id}/${msgId}`,
    };
    const lastId = store.channels[key]?.lastMessageId ?? 0;
    const messages = await client.getMessages(entity, lastId ? { limit: BATCH_LIMIT, minId: lastId } : { limit: FIRST_RUN_LIMIT });

    let found = 0;
    for (const m of messages) {
      const text = m.message ?? '';
      if (!isVacancy(text)) continue;
      const vacancy = toVacancy({ text, date: new Date(m.date * 1000), messageId: m.id }, channel);
      if (known.has(vacancy.fingerprint)) continue;
      known.add(vacancy.fingerprint);
      added.push(vacancy);
      found++;
    }
    const newest = Math.max(lastId, ...messages.map((m) => m.id));
    store.channels[key] = { title: channel.title, lastMessageId: newest };
    console.log(`${channel.title}: ${messages.length} new posts, ${found} vacancies`);
  } catch (err) {
    failures++;
    console.log(`::error::${ref}: ${err.message}`);
  }
}
await client.disconnect();

const cutoff = Date.now() - KEEP_DAYS * 86_400_000;
store.vacancies = [...added, ...store.vacancies]
  .filter((v) => new Date(v.postedAt).getTime() >= cutoff)
  .sort((a, b) => b.postedAt.localeCompare(a.postedAt))
  .slice(0, MAX_VACANCIES);
writeFileSync(OUT, `${JSON.stringify(store, null, 2)}\n`);
console.log(`Added ${added.length}, now listing ${store.vacancies.length} Telegram vacancies.`);

// Fail the run only if every channel failed (e.g. the session was revoked).
process.exit(failures && failures === channels.length ? 1 : 0);
