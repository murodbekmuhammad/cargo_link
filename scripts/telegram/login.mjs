// Run once on your own computer: `npm run telegram:login`.
// Logs in to your Telegram account and prints a session string for the TELEGRAM_SESSION secret.
// Anyone with that string can read your Telegram account, so store it only as a GitHub secret.

import { createInterface } from 'node:readline/promises';
import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions/index.js';

const rl = createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => rl.question(q);

const apiId = Number(process.env.TELEGRAM_API_ID || (await ask('API ID (from my.telegram.org): ')));
const apiHash = process.env.TELEGRAM_API_HASH || (await ask('API hash: '));

const client = new TelegramClient(new StringSession(''), apiId, apiHash, { connectionRetries: 3 });
client.setLogLevel('error');
await client.start({
  phoneNumber: () => ask('Phone number (+998…): '),
  phoneCode: () => ask('Code Telegram sent you: '),
  password: () => ask('Two-step verification password (if set): '),
  onError: (err) => console.error(err.message),
});

console.log('\nTELEGRAM_SESSION — paste this into GitHub → Settings → Secrets → Actions:\n');
console.log(client.session.save());
await client.disconnect();
rl.close();
process.exit(0);
