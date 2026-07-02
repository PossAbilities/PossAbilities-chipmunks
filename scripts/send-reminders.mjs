/**
 * CLI reminder sender for cron, e.g.:
 *   0 16 * * *  cd /path/to/app && npm run reminders
 * It calls the running app's reminder endpoint, which shares the
 * database and email templates.
 *
 * Env: APP_URL (default http://localhost:3000), CRON_SECRET
 */
const base = process.env.APP_URL || 'http://localhost:3000';
const secret = process.env.CRON_SECRET || '';

const res = await fetch(`${base}/api/cron/reminders`, {
  method: 'POST',
  headers: { 'x-cron-secret': secret },
});
const body = await res.json().catch(() => ({}));
if (!res.ok) {
  console.error('Reminder run failed:', res.status, body);
  process.exit(1);
}
console.log(`Reminders sent: ${body.sent} for ${body.date}`);
