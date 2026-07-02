# 🐿️ The Chipmunks — PossAbilities holiday club

A complete website and booking system for **The Chipmunks**, the school-holiday club at PossAbilities in Heywood: landing page, family booking flow, automated emails, an admin area, and a check-in register for Activity Champions.

## What's included

| Area | URL | Who it's for |
|---|---|---|
| **Landing page** | `/` | Families — the club's activities (farm, immersive room, games), a typical day, live upcoming dates with availability, kit list and FAQs |
| **Booking** | `/book` | Parents/carers — 5-step form: choose days → child details (with photo, taken straight from the phone camera) → contacts & next of kin → medical info → consents |
| **Admin area** | `/admin` | Staff — manage bookings (search, filter, cancel/restore), manage club days & capacity, CSV exports, view every email sent, trigger reminders |
| **Champion register** | `/champion` | Activity Champions — today's expected children **with their photos**, medical flags, one-tap check-in / home-time, who's allowed to collect |

### Emails (fully designed HTML)
- **Confirmation** — sent the moment a booking is made, with reference, booked days, kit list and drop-off times
- **Reminder** — "see you tomorrow" email, sent automatically for the next day's session (idempotent — safe to run repeatedly)
- **Cancellation** — sent when a booking is cancelled in the admin area

Without SMTP configured, every email is stored in the **Admin → Emails** outbox so you can preview exactly what families receive. Configure SMTP (below) to actually send.

## Running it

```bash
npm install
npm run dev        # development
# or
npm run build && npm start   # production
```

The SQLite database and child photos are created automatically in `./data/` on first run (change with `CHIPMUNKS_DATA_DIR`). A set of sample 2026 summer dates is seeded — replace them in **Admin → Days**.

## Configuration

Copy `.env.example` to `.env` and set:

| Variable | Purpose |
|---|---|
| `SESSION_SECRET` | Signs login cookies — set to a long random string |
| `ADMIN_PASSWORD` | Admin area password (dev default: `chipmunks-admin`) |
| `CHAMPION_PIN` | PIN for the Champion register (dev default: `2468`) |
| `CRON_SECRET` | Protects the reminder endpoint |
| `SMTP_HOST/PORT/USER/PASS/FROM` | Email sending — leave empty to keep emails in the outbox |

## Daily reminder emails

Schedule one of these once a day (late afternoon works well):

```bash
# Option A — call the endpoint from any scheduler / uptime service
curl -X POST -H "x-cron-secret: $CRON_SECRET" https://your-site/api/cron/reminders

# Option B — cron on the server (app must be running)
0 16 * * *  cd /path/to/app && CRON_SECRET=... npm run reminders
```

There's also a **"Send tomorrow's reminders"** button in the admin area.

## Changing the branding & content

- **Colours**: one place — the CSS variables at the top of `app/globals.css` (the email colours mirror them in `lib/email/templates.ts`). Swap in the official PossAbilities palette when ready.
- **Fonts**: loaded in `app/layout.tsx` (currently Baloo 2 + Nunito from Google Fonts).
- **All copy, prices, contact details, activities, FAQs**: `content/site.ts`.
- **Club dates & capacity**: Admin area → Days.

## Data & safeguarding notes

- Child photos are **private**: served only to signed-in admins and Activity Champions, never publicly.
- Medical details appear on the register behind a ⚕️ MEDICAL flag and in CSV exports for the day.
- CSV exports (`Admin → Export`) include full booking data (contacts, medical, consents) for one booking per row, or one row per child per day including check-in/out times.
- `data/` is excluded from git — back it up separately and remember it contains personal data (UK GDPR applies).
