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
- Each role has its own protected dashboard (`/admin`, `/company`, `/applicant`); visiting another role's route redirects to your own.
- Most dashboard features are still placeholders.

## Stack

React 19 + TypeScript + Vite, React Router.
