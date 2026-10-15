# CargoLink — Logistics Hiring

Hiring platform connecting logistics companies with drivers, dispatchers and warehouse staff.

## Roles

| Role      | Can                                                | Sign up                  |
|-----------|----------------------------------------------------|--------------------------|
| Guest     | Browse vacancies and candidates (no contact info)  | —                        |
| Applicant | Apply to vacancies, track applications             | Self sign-up             |
| Company   | Post vacancies, review applicants (coming soon)    | Self sign-up             |
| Admin     | Moderate companies, jobs and users (coming soon)   | Provisioned (login only) |

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:5173. You land on the public vacancies list. Guests can browse vacancies (`/vacancies`) and candidates (`/candidates`). Clicking "Sign up to apply" takes them to applicant sign-up and then back to the vacancy.

Demo accounts:

| Role      | Email                     | Password   |
|-----------|---------------------------|------------|
| Admin     | `admin@cargolink.com`     | `admin123` |
| Company   | `hr@silkroadfreight.demo` | `demo123`  |
| Applicant | `jasur@demo.uz`           | `demo123`  |

## Current state

- Auth is **mocked in localStorage** (`src/auth/storage.ts`) until a backend exists. Passwords are stored in plain text — not for production.
- Vacancies are demo data (`src/data/seed.ts`) until companies can post them. Applications are saved in localStorage.
- The public candidate list shows first name + last initial, desired position, city, experience and licenses — never email or phone.
- **Vacancies have an optional location** (a city, or the company's current position). Applicants have no location.
- The vacancies list has a **List / Map** switch (`/vacancies?view=map`) and a "Near" filter (a city or the visitor's current location, never saved) that sorts by distance and can limit to a radius. Each vacancy page shows its location on a map.
- Maps only show pins (no routes or directions) and are **free**: [Leaflet](https://leafletjs.com) + OpenStreetMap tiles, no API key or paid account.
  - OpenStreetMap's tile server is free under a [fair-use policy](https://operations.osmfoundation.org/policies/tiles/) meant for light use. If traffic grows large, self-host the tiles (still free, e.g. [OpenMapTiles](https://openmaptiles.org/) or [Protomaps](https://protomaps.com/) with an Uzbekistan extract) and set `VITE_MAP_TILE_URL` to your tile URL — no code change needed.
- Companies can post vacancies from their dashboard (saved in localStorage).
- Each role has its own protected dashboard (`/admin`, `/company`, `/applicant`); visiting another role's route redirects to your own.
- Most dashboard features are still placeholders.

## Stack

React 19 + TypeScript + Vite, React Router.

## Telegram import

Every hour a GitHub Action (`.github/workflows/telegram-sync.yml`) reads new posts from the logistics
vacancy channels your Telegram account has joined, keeps the ones that look like vacancies, and saves
them to `public/data/telegram-vacancies.json`. The site loads that file on start and lists the posts
next to the vacancies companies post here, tagged **via Telegram**, with a link back to the original
post. It is free: Telegram's API, GitHub Actions and plain text rules, with no paid AI.

What gets read from each post: a title (its first line), the job type, the city (one of the 13 cities
on the map) and a salary if it's in US dollars. The full post text is always shown. Posts that are only
an image, or that don't mention a job, are skipped. The same post forwarded to several channels is
listed once. Imported vacancies are kept for 30 days.

Setup (once):

1. Get an **API ID** and **API hash** at <https://my.telegram.org> → *API development tools*.
2. On your computer, in this folder: `npm install`, then `npm run telegram:login`. Enter the API ID,
   API hash, your phone number and the code Telegram sends you. It prints a long **session string**.
   That string gives full access to your Telegram account: never share it or commit it.
3. In GitHub → *Settings* → *Secrets and variables* → *Actions*:
   - Secrets: `TELEGRAM_API_ID`, `TELEGRAM_API_HASH`, `TELEGRAM_SESSION`.
   - Variable: `TELEGRAM_CHANNELS`, the channels to read, separated by commas. Use the channel's
     username (`logistika_ish` or `https://t.me/logistika_ish`) or, for a private channel, its id
     (`-1001234567890`).
4. *Actions* → *Import Telegram vacancies* → *Run workflow* to try it right away.

Until it is set up, the hourly run does nothing and passes. To sign the session out, end it in
Telegram → *Settings* → *Devices*. Run `npm test` to check the post parser.
