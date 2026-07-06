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

## Deploying to Render

This app stores its database and uploaded photos/signatures as local files, so it needs a host with a **persistent disk** rather than a serverless platform (Vercel/Netlify will silently lose data). [Render](https://render.com) works well and has a generous free/low-cost tier. A `render.yaml` blueprint is included, so most of the setup is automatic:

1. **Push this repo to GitHub** if it isn't already (it is — branch `claude/chipmunks-landing-page-dqph1h`). Render deploys from a single branch, so either merge this branch into `main`, or edit the `branch:` line in `render.yaml` to point at the branch you want live.
2. **Sign up at [render.com](https://render.com)** and connect your GitHub account.
3. Click **New +** → **Blueprint**, choose this repository. Render reads `render.yaml` and shows you everything it's about to create: one web service plus a 1 GB persistent disk.
4. Render will ask you to fill in a few secret values before deploying:
   - `ADMIN_PASSWORD` — the password for `/admin`
   - `CHAMPION_PIN` — the PIN for `/champion`
   - `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` — leave these blank for now if you don't have email sending details yet; confirmation/reminder emails will simply sit in the **Admin → Emails** outbox until you add them later (Render → your service → Environment tab)
   - `SESSION_SECRET` and `CRON_SECRET` are generated for you automatically
5. Click **Apply** / **Deploy**. The first build takes a few minutes (it compiles the SQLite native module). You'll get a live URL like `https://chipmunks.onrender.com`.
6. **Set up daily reminders**: Render's dashboard has its own **Cron Jobs** feature (New + → Cron Job). Point it at your live URL:
   ```bash
   curl -X POST -H "x-cron-secret: YOUR_CRON_SECRET_VALUE" https://chipmunks.onrender.com/api/cron/reminders
   ```
   scheduled for once a day (e.g. `0 16 * * *` for 4pm). Find `CRON_SECRET`'s generated value in Render → your service → Environment tab.
7. **Custom domain**: Render → your service → Settings → Custom Domains, then add a CNAME record with your domain registrar pointing at the address Render gives you (e.g. `chipmunks.possabilities.org.uk`).

Prefer Railway or Fly.io instead? Both also offer persistent volumes and work the same way in principle — create a service from this GitHub repo, mount a volume at a path, and set `CHIPMUNKS_DATA_DIR` to that path alongside the same environment variables listed above.

**Before sharing the live link with anyone**, replace the dev-default `ADMIN_PASSWORD`/`CHAMPION_PIN` with real ones (done automatically above) and fill in real SMTP details so families actually receive confirmation and reminder emails rather than them sitting in the outbox.

## Branding & content

The site follows **PossAbilities Brand Manual 1.1**: pink `#E43092`, indigo `#362B74`, teal `#4BC1B9`, duck-egg `#D6EEEE`, plum `#7B3179`, the signature double-wave motif (`components/Wave.tsx`), the logo mark (`components/PossLogo.tsx`) and the "Live The Life You Choose" tagline.

- **Colours**: one place — the CSS variables at the top of `app/globals.css` (the email colours mirror them in `lib/email/templates.ts`).
- **Fonts**: loaded in `app/layout.tsx` (Quicksand for headings + Nunito for body, the closest Google Fonts to the brand's rounded type).
- **All copy, prices, contact details, activities, FAQs**: `content/site.ts`.
- **Club dates & capacity**: Admin area → Days.

## Data & safeguarding notes

- Child photos are **private**: served only to signed-in admins and Activity Champions, never publicly.
- Medical details appear on the register behind a ⚕️ MEDICAL flag and in CSV exports for the day.
- CSV exports (`Admin → Export`) include full booking data (contacts, medical, consents) for one booking per row, or one row per child per day including check-in/out times.
- `data/` is excluded from git — back it up separately and remember it contains personal data (UK GDPR applies).
