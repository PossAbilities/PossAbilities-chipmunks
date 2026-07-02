import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';

const DATA_DIR = process.env.CHIPMUNKS_DATA_DIR || path.join(process.cwd(), 'data');
export const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (db) return db;
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  db = new Database(path.join(DATA_DIR, 'chipmunks.db'));
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  migrate(db);
  seed(db);
  return db;
}

function migrate(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL UNIQUE,          -- YYYY-MM-DD
      label TEXT NOT NULL DEFAULT '',     -- e.g. "Farm Friday"
      capacity INTEGER NOT NULL DEFAULT 20,
      notes TEXT NOT NULL DEFAULT '',
      active INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ref TEXT NOT NULL UNIQUE,
      status TEXT NOT NULL DEFAULT 'confirmed',   -- confirmed | cancelled
      created_at TEXT NOT NULL DEFAULT (datetime('now')),

      child_first TEXT NOT NULL,
      child_last TEXT NOT NULL,
      child_dob TEXT NOT NULL DEFAULT '',
      photo TEXT NOT NULL DEFAULT '',              -- filename in uploads dir

      parent_name TEXT NOT NULL,
      parent_email TEXT NOT NULL,
      parent_phone TEXT NOT NULL,
      relationship TEXT NOT NULL DEFAULT '',

      kin_name TEXT NOT NULL DEFAULT '',           -- second emergency contact
      kin_phone TEXT NOT NULL DEFAULT '',
      kin_relationship TEXT NOT NULL DEFAULT '',

      medical_conditions TEXT NOT NULL DEFAULT '',
      allergies TEXT NOT NULL DEFAULT '',
      dietary TEXT NOT NULL DEFAULT '',
      medication TEXT NOT NULL DEFAULT '',
      support_needs TEXT NOT NULL DEFAULT '',
      gp_details TEXT NOT NULL DEFAULT '',

      pickup_names TEXT NOT NULL DEFAULT '',       -- who may collect the child
      consent_photo INTEGER NOT NULL DEFAULT 0,
      consent_medical INTEGER NOT NULL DEFAULT 0,
      consent_activities INTEGER NOT NULL DEFAULT 0,
      anything_else TEXT NOT NULL DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS booking_days (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_id INTEGER NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
      session_id INTEGER NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
      checked_in_at TEXT,
      checked_in_by TEXT NOT NULL DEFAULT '',
      checked_out_at TEXT,
      UNIQUE (booking_id, session_id)
    );

    CREATE TABLE IF NOT EXISTS emails (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_id INTEGER REFERENCES bookings(id) ON DELETE SET NULL,
      session_id INTEGER,                          -- set for reminders (dedupe)
      kind TEXT NOT NULL,                          -- confirmation | reminder | cancellation
      to_email TEXT NOT NULL,
      subject TEXT NOT NULL,
      html TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'outbox',       -- outbox | sent | failed
      error TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
}

/** Seed a few sample holiday dates so the site works out of the box.
 *  Real dates are managed in the Admin area. */
function seed(db: Database.Database) {
  const count = db.prepare('SELECT COUNT(*) AS n FROM sessions').get() as { n: number };
  if (count.n > 0) return;
  const insert = db.prepare(
    'INSERT INTO sessions (date, label, capacity) VALUES (?, ?, ?)'
  );
  // Sample: Tue/Wed/Thu across the 2026 summer holidays — replace in Admin.
  const weeks = ['2026-07-27', '2026-08-03', '2026-08-10', '2026-08-17'];
  const labels = ['Farmyard Fun', 'Wild Wednesday', 'Big Adventure Day'];
  for (const monday of weeks) {
    const base = new Date(monday + 'T12:00:00Z');
    for (let i = 0; i < 3; i++) {
      const d = new Date(base);
      d.setUTCDate(base.getUTCDate() + 1 + i); // Tue, Wed, Thu
      insert.run(d.toISOString().slice(0, 10), labels[i], 20);
    }
  }
}

export interface SessionRow {
  id: number;
  date: string;
  label: string;
  capacity: number;
  notes: string;
  active: number;
  booked?: number;
}

export function listSessions(opts: { upcomingOnly?: boolean; activeOnly?: boolean } = {}) {
  const db = getDb();
  const where: string[] = [];
  const params: string[] = [];
  if (opts.upcomingOnly) {
    where.push('s.date >= ?');
    params.push(todayISO());
  }
  if (opts.activeOnly) where.push('s.active = 1');
  const sql = `
    SELECT s.*, (
      SELECT COUNT(*) FROM booking_days bd
      JOIN bookings b ON b.id = bd.booking_id
      WHERE bd.session_id = s.id AND b.status = 'confirmed'
    ) AS booked
    FROM sessions s
    ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
    ORDER BY s.date ASC`;
  return db.prepare(sql).all(...params) as SessionRow[];
}

/** Today's date in the club's timezone (Europe/London), as YYYY-MM-DD. */
export function todayISO(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/London',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

export function formatDateLong(iso: string): string {
  const d = new Date(iso + 'T12:00:00Z');
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Europe/London',
  }).format(d);
}

export function formatDateShort(iso: string): string {
  const d = new Date(iso + 'T12:00:00Z');
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: 'Europe/London',
  }).format(d);
}

export function makeRef(): string {
  const db = getDb();
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no confusable chars
  for (;;) {
    let ref = 'CHIP-';
    for (let i = 0; i < 5; i++) ref += alphabet[Math.floor(Math.random() * alphabet.length)];
    const exists = db.prepare('SELECT 1 FROM bookings WHERE ref = ?').get(ref);
    if (!exists) return ref;
  }
}
