import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { detectCategory, detectCity, detectSalaryUsd, fingerprint, isVacancy, makeTitle, toVacancy } from './parse.mjs';

const uz = `#vakansiya
🚛 Fura haydovchisi kerak!
📍 Manzil: Samarqand shahri
💰 Oylik: 1500-2000$
Talablar: C, CE toifali guvohnoma, 3 yil tajriba
📞 +998 90 123 45 67`;

const ru = `ВАКАНСИЯ
Требуется диспетчер в логистическую компанию (Ташкент)
З/п от $800
Звоните: +998 71 200 00 00`;

test('recognises vacancies and skips other posts', () => {
  assert.equal(isVacancy(uz), true);
  assert.equal(isVacancy(ru), true);
  assert.equal(isVacancy('Hammaga xayrli tong! Bugun havo ochiq bo‘ladi, yaxshi kun tilaymiz.'), false);
  assert.equal(isVacancy('Ish bor'), false); // too short to be useful
});

test('reads title, category, city and salary', () => {
  assert.equal(makeTitle(uz), 'Fura haydovchisi kerak!');
  assert.equal(makeTitle(ru), 'Требуется диспетчер в логистическую компанию (Ташкент)');
  assert.equal(detectCategory(uz), 'Truck driver');
  assert.equal(detectCategory(ru), 'Dispatcher');
  assert.equal(detectCategory('Logistika kompaniyasiga haydovchi kerak'), 'Truck driver');
  assert.equal(detectCategory('Tajribali logist kerak'), 'Logistics manager');
  assert.equal(detectCategory('Ofisga kotiba kerak, ish vaqti 9-18'), 'Other');
  assert.equal(detectCity(uz), 'Samarkand');
  assert.equal(detectCity(ru), 'Tashkent');
  assert.equal(detectCity("Farg‘ona viloyatida ish"), 'Fergana');
  assert.equal(detectCity('Toshkentdan Moskvaga reys'), 'Tashkent');
  assert.equal(detectCity('Reys Moskva - Minsk'), undefined);
  assert.deepEqual(detectSalaryUsd(uz), { salaryMin: 1500, salaryMax: 2000 });
  assert.deepEqual(detectSalaryUsd(ru), { salaryMin: 800, salaryMax: 800 });
  assert.deepEqual(detectSalaryUsd('Oylik 1 200 USD'), { salaryMin: 1200, salaryMax: 1200 });
  assert.deepEqual(detectSalaryUsd('Oylik 8 000 000 so‘m'), {});
});

test('the same post forwarded elsewhere has the same fingerprint', () => {
  assert.equal(fingerprint(uz), fingerprint(`${uz.toUpperCase()}\n\n`));
  assert.notEqual(fingerprint(uz), fingerprint(ru));
});

test('city labels exist on the site', () => {
  const cities = readFileSync(new URL('../../src/data/cities.ts', import.meta.url), 'utf8');
  const v = toVacancy(
    { text: uz, date: new Date('2026-10-15T08:00:00Z'), messageId: 42 },
    { key: 'logistika_ish', title: 'Logistika Ish', url: (id) => `https://t.me/logistika_ish/${id}` },
  );
  assert.equal(v.id, 'tg-logistika_ish-42');
  assert.equal(v.source.url, 'https://t.me/logistika_ish/42');
  for (const label of ['Tashkent', 'Samarkand', 'Bukhara', 'Namangan', 'Andijan', 'Fergana', 'Qarshi', 'Navoiy', 'Jizzakh', 'Gulistan', 'Termez', 'Urgench', 'Nukus']) {
    assert.ok(cities.includes(`'${label}'`), label);
  }
});
