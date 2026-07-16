'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

interface Day {
  id: number;
  session_id: number;
  date: string;
  label: string;
  checked_in_at: string | null;
  checked_out_at: string | null;
}
interface Booking {
  id: number;
  ref: string;
  status: string;
  created_at: string;
  child_first: string;
  child_last: string;
  child_dob: string;
  child_address: string;
  photo: string;
  parent_name: string;
  parent_email: string;
  parent_phone: string;
  parent_phone2: string;
  relationship: string;
  kin_name: string;
  kin_phone: string;
  kin_relationship: string;
  kin_address: string;
  collection_password: string;
  employee_email: string;
  signature: string;
  signed_name: string;
  signed_at: string;
  medical_conditions: string;
  allergies: string;
  dietary: string;
  medication: string;
  support_needs: string;
  gp_details: string;
  employee_name: string;
  employee_id: string;
  employee_relation: string;
  paid: number;
  paid_at: string | null;
  payment_method: string;
  payment_date: string;
  payment_note: string;
  consent_photo: number;
  anything_else: string;
  days: Day[];
  collectors: { id: number; name: string; relationship: string; photo: string }[];
}
interface SessionRow {
  id: number;
  date: string;
  label: string;
  notes: string;
  capacity: number;
  active: number;
  booked: number;
}
interface EmailRow {
  id: number;
  kind: string;
  to_email: string;
  subject: string;
  status: string;
  error: string;
  created_at: string;
  ref: string | null;
}
interface AdminRow {
  id: number;
  email: string;
  name: string;
  created_at: string;
}
interface ChampionRow {
  id: number;
  name: string;
  pin: string;
  active: number;
  created_at: string;
}

const TABS = ['Bookings', 'Days', 'Emails', 'Team', 'Staff Emails'] as const;

const STAFF_CAMPAIGN = [
  {
    key: 'teaser',
    label: '1. Save the date',
    blurb: 'Sent weeks ahead, before booking opens — builds excitement with the dates and a sneak peek.',
  },
  {
    key: 'booking-open',
    label: '2. Booking is open',
    blurb: 'The main event — full details, the deal, and a step-by-step on how to book.',
  },
  {
    key: 'filling-up',
    label: '3. Places filling up',
    blurb: 'Mid-campaign nudge with a parent testimonial, for anyone who hasn’t booked yet.',
  },
  {
    key: 'final-call',
    label: '4. Final call',
    blurb: 'A short, urgent last reminder a few days before the diary fills up.',
  },
] as const;

function fmt(date: string) {
  return new Date(date + 'T12:00:00Z').toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function AdminDashboard() {
  const [tab, setTab] = useState<(typeof TABS)[number]>('Bookings');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [emails, setEmails] = useState<EmailRow[]>([]);
  const [admins, setAdmins] = useState<AdminRow[]>([]);
  const [champions, setChampions] = useState<ChampionRow[]>([]);
  const [search, setSearch] = useState('');
  const [dayFilter, setDayFilter] = useState('');
  const [open, setOpen] = useState<number | null>(null);
  const [notice, setNotice] = useState('');

  const reload = useCallback(async () => {
    const [b, s, e, a, c] = await Promise.all([
      fetch('/api/bookings').then((r) => r.json()),
      fetch('/api/sessions?all=1').then((r) => r.json()),
      fetch('/api/emails').then((r) => r.json()),
      fetch('/api/admins').then((r) => r.json()),
      fetch('/api/champions').then((r) => r.json()),
    ]);
    setBookings(b.bookings || []);
    setSessions(s.sessions || []);
    setEmails(e.emails || []);
    setAdmins(a.admins || []);
    setChampions(c.champions || []);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return bookings.filter((b) => {
      if (dayFilter && !b.days.some((d) => d.date === dayFilter)) return false;
      if (!q) return true;
      return [b.ref, b.child_first, b.child_last, b.parent_name, b.parent_email, b.parent_phone]
        .join(' ')
        .toLowerCase()
        .includes(q);
    });
  }, [bookings, search, dayFilter]);

  async function setStatus(id: number, status: 'confirmed' | 'cancelled') {
    if (status === 'cancelled' && !confirm('Cancel this booking? The family will get a cancellation email.'))
      return;
    await fetch(`/api/bookings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    reload();
  }

  async function setPaid(
    id: number,
    paid: boolean,
    details?: { method: string; date: string; note: string; sendReceipt?: boolean }
  ) {
    const sendReceipt = paid && !!details?.sendReceipt;
    const res = await fetch(`/api/bookings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paid,
        sendReceipt,
        paymentMethod: details?.method,
        paymentDate: details?.date,
        paymentNote: details?.note,
      }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setNotice(body.error || 'Could not update payment.');
      return;
    }
    setNotice(paid ? `Booking marked as paid${sendReceipt ? ' — receipt email sent.' : '.'}` : 'Booking marked as unpaid.');
    reload();
  }

  async function sendPaymentEmail(id: number) {
    const res = await fetch(`/api/bookings/${id}/payment-email`, { method: 'POST' });
    setNotice(res.ok ? 'Payment email sent — view it in the Emails tab.' : 'Could not send the payment email.');
    reload();
  }

  async function sendReminders() {
    const res = await fetch('/api/cron/reminders', { method: 'POST' });
    const body = await res.json().catch(() => ({}));
    setNotice(res.ok ? `Reminders queued for ${body.date}: ${body.sent} email(s).` : 'Reminder run failed.');
    reload();
  }

  async function logout() {
    await fetch('/api/login', { method: 'DELETE' });
    location.reload();
  }

  const chip = (status: string) =>
    ({
      confirmed: 'bg-teal/15 text-teal',
      cancelled: 'bg-plum/15 text-plum',
      sent: 'bg-teal/15 text-teal',
      outbox: 'bg-duck text-indigo/70',
      failed: 'bg-plum/15 text-plum',
    })[status] || 'bg-ink/10 text-ink/60';

  return (
    <main className="min-h-screen bg-mist">
      <header className="bg-indigo text-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🐿️</span>
            <span className="font-display font-extrabold text-lg">Chipmunks Admin</span>
          </div>
          <div className="flex items-center gap-3">
            <a href="/champion" className="text-sm font-bold text-white/70 hover:text-white">
              Check-in register →
            </a>
            <button onClick={logout} className="text-sm font-bold text-white/70 hover:text-white">
              Sign out
            </button>
          </div>
        </div>
        <div className="mx-auto max-w-6xl px-4 sm:px-6 flex gap-1">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-t-xl px-5 py-2.5 font-display font-bold text-sm transition-colors ${
                tab === t ? 'bg-mist text-indigo' : 'text-white/60 hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
        {notice && (
          <div className="mb-5 rounded-2xl bg-teal/10 border border-teal/25 px-5 py-3 font-bold text-teal flex justify-between items-center">
            {notice}
            <button className="text-teal/60" onClick={() => setNotice('')}>✕</button>
          </div>
        )}

        {/* ── Bookings ── */}
        {tab === 'Bookings' && (
          <>
            <div className="flex flex-wrap items-center gap-3 mb-5">
              <input
                className="field-input !w-64"
                placeholder="Search name, ref, email…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <select className="field-input !w-auto" value={dayFilter} onChange={(e) => setDayFilter(e.target.value)}>
                <option value="">All days</option>
                {sessions.map((s) => (
                  <option key={s.id} value={s.date}>
                    {fmt(s.date)}
                  </option>
                ))}
              </select>
              <div className="ml-auto flex flex-wrap gap-2">
                <button onClick={sendReminders} className="btn-secondary btn-small">
                  ⏰ Send tomorrow’s reminders
                </button>
                <a href="/api/export" className="btn-secondary btn-small">
                  ⬇ Export bookings CSV
                </a>
                <a
                  href={`/api/export?mode=days${dayFilter ? `&date=${dayFilter}` : ''}`}
                  className="btn-secondary btn-small"
                >
                  ⬇ Export register CSV
                </a>
              </div>
            </div>

            <div className="rounded-2xl bg-white border border-ink/5 shadow-soft overflow-x-auto">
              <table className="admin-table w-full min-w-[760px]">
                <thead>
                  <tr>
                    <th>Ref</th>
                    <th>Child</th>
                    <th>Days</th>
                    <th>Parent / guardian</th>
                    <th>Status</th>
                    <th>Paid</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((b) => (
                    <FragmentRow
                      key={b.id}
                      b={b}
                      open={open === b.id}
                      toggle={() => setOpen(open === b.id ? null : b.id)}
                      chip={chip}
                      setStatus={setStatus}
                      setPaid={setPaid}
                      sendPaymentEmail={sendPaymentEmail}
                    />
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center text-ink/40 py-10">
                        No bookings found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ── Days ── */}
        {tab === 'Days' && <DaysTab sessions={sessions} reload={reload} />}

        {/* ── Emails ── */}
        {tab === 'Emails' && (
          <div className="rounded-2xl bg-white border border-ink/5 shadow-soft overflow-x-auto">
            <table className="admin-table w-full min-w-[700px]">
              <thead>
                <tr>
                  <th>Sent</th>
                  <th>Type</th>
                  <th>To</th>
                  <th>Subject</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {emails.map((e) => (
                  <tr key={e.id}>
                    <td className="whitespace-nowrap text-ink/60">{e.created_at}</td>
                    <td className="capitalize font-bold">{e.kind}</td>
                    <td>{e.to_email}</td>
                    <td className="max-w-[280px] truncate">{e.subject}</td>
                    <td>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-extrabold ${chip(e.status)}`} title={e.error}>
                        {e.status}
                      </span>
                    </td>
                    <td>
                      <a className="text-pink font-bold text-sm hover:underline" href={`/api/emails/${e.id}`} target="_blank">
                        View
                      </a>
                    </td>
                  </tr>
                ))}
                {emails.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center text-ink/40 py-10">
                      No emails yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Team ── */}
        {tab === 'Team' && <TeamTab admins={admins} champions={champions} reload={reload} setNotice={setNotice} />}

        {/* ── Staff Emails ── */}
        {tab === 'Staff Emails' && <StaffEmailsTab setNotice={setNotice} />}
      </div>
    </main>
  );
}

function FragmentRow({
  b,
  open,
  toggle,
  chip,
  setStatus,
  setPaid,
  sendPaymentEmail,
}: {
  b: Booking;
  open: boolean;
  toggle: () => void;
  chip: (s: string) => string;
  setStatus: (id: number, s: 'confirmed' | 'cancelled') => void;
  setPaid: (
    id: number,
    paid: boolean,
    details?: { method: string; date: string; note: string; sendReceipt?: boolean }
  ) => void;
  sendPaymentEmail: (id: number) => void;
}) {
  const [payingOpen, setPayingOpen] = useState(false);
  return (
    <>
      <tr className={`cursor-pointer hover:bg-mist/60 ${b.status === 'cancelled' ? 'opacity-50' : ''}`} onClick={toggle}>
        <td className="font-mono font-bold text-indigo whitespace-nowrap">{b.ref}</td>
        <td className="font-bold whitespace-nowrap">
          {b.child_first} {b.child_last}
          {(b.medical_conditions || b.allergies || b.medication) && (
            <span title="Has medical notes" className="ml-1.5">⚕️</span>
          )}
        </td>
        <td className="text-ink/70">{b.days.map((d) => fmt(d.date)).join(', ')}</td>
        <td>
          <div className="font-bold">{b.parent_name}</div>
          <div className="text-xs text-ink/55">{b.parent_email} · {b.parent_phone}</div>
        </td>
        <td>
          <span className={`rounded-full px-2.5 py-1 text-xs font-extrabold ${chip(b.status)}`}>{b.status}</span>
        </td>
        <td>
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-extrabold ${b.paid ? 'bg-teal/15 text-teal' : 'bg-pink/10 text-pink'}`}
            title={b.paid ? `Paid via ${b.payment_method || '—'}${b.payment_date ? ' on ' + b.payment_date : ''}` : ''}
          >
            {b.paid ? 'PAID' : 'UNPAID'}
          </span>
        </td>
        <td className="text-right text-ink/40">{open ? '▴' : '▾'}</td>
      </tr>
      {open && (
        <tr>
          <td colSpan={7} className="!bg-mist/50">
            <div className="p-4 pb-0">
              <div className="rounded-2xl border-2 border-pink/30 bg-pink/5 p-4">
                <div className="font-display font-extrabold text-pink flex items-center gap-2 mb-3">
                  📞 Emergency contacts & collection
                </div>
                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-[11px] font-extrabold uppercase tracking-wide text-ink/40">
                      Parent / guardian
                    </div>
                    <div className="font-bold text-ink">{b.parent_name}</div>
                    <div className="text-ink/70">
                      {b.parent_phone}
                      {b.parent_phone2 ? ` · ${b.parent_phone2}` : ''}
                    </div>
                    <div className="text-ink/70">{b.parent_email}</div>
                  </div>
                  <div>
                    <div className="text-[11px] font-extrabold uppercase tracking-wide text-ink/40">Next of kin</div>
                    {b.kin_name ? (
                      <>
                        <div className="font-bold text-ink">
                          {b.kin_name} {b.kin_relationship && `(${b.kin_relationship})`}
                        </div>
                        <div className="text-ink/70">{b.kin_phone}</div>
                        {b.kin_address && <div className="text-ink/70">{b.kin_address}</div>}
                      </>
                    ) : (
                      <div className="text-ink/30">— none given —</div>
                    )}
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-[11px] font-extrabold uppercase tracking-wide text-ink/40 mb-2">
                    Who can collect {b.child_first}
                  </div>
                  {b.collectors.length === 0 ? (
                    <div className="text-sm text-plum font-bold">— none listed —</div>
                  ) : (
                    <div className="flex flex-wrap gap-3">
                      {b.collectors.map((c) => (
                        <div
                          key={c.id}
                          className="flex items-center gap-2 rounded-xl bg-white border border-pink/20 px-3 py-2"
                        >
                          {c.photo ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={`/api/uploads/${c.photo}`}
                              alt={c.name}
                              className="h-10 w-10 rounded-lg object-cover border border-ink/10"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pink/10 text-sm font-bold text-pink">
                              {c.name[0]}
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-bold text-ink">{c.name}</div>
                            {c.relationship && <div className="text-xs text-ink/50">{c.relationship}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="mt-4">
                  <div className="text-[11px] font-extrabold uppercase tracking-wide text-ink/40 mb-1">
                    Collection password
                  </div>
                  <PasswordReveal value={b.collection_password} />
                  <p className="text-xs text-ink/45 mt-1">
                    Only needed if someone not listed above turns up to collect {b.child_first}.
                  </p>
                </div>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-3 p-4 text-sm">
              <Detail label="Date of birth" value={b.child_dob} />
              <Detail label="Child's address" value={b.child_address} />
              <Detail label="Relationship" value={b.relationship} />
              <Detail label="Medical conditions" value={b.medical_conditions} />
              <Detail label="Allergies" value={b.allergies} />
              <Detail label="Dietary" value={b.dietary} />
              <Detail label="Medication" value={b.medication} />
              <Detail label="Support needs" value={b.support_needs} />
              <Detail label="GP" value={b.gp_details} />
              <Detail
                label="PossAbilities employee"
                value={b.employee_name ? `${b.employee_name} (${b.employee_relation || '—'})` : ''}
              />
              <Detail label="Payroll / Element Suite ID" value={b.employee_id} />
              <Detail label="Employee email" value={b.employee_email} />
              <Detail
                label="Payment"
                value={
                  b.paid
                    ? `Paid via ${b.payment_method || '—'}${b.payment_date ? ' on ' + b.payment_date : ''}${b.payment_note ? ' — ' + b.payment_note : ''}`
                    : 'Not yet paid'
                }
              />
              <Detail label="Photo consent" value={b.consent_photo ? 'Yes' : 'No'} />
              <Detail label="Anything else" value={b.anything_else} />
              <Detail label="Booked" value={b.created_at} />
              <div>
                <div className="text-[11px] font-extrabold uppercase tracking-wide text-ink/40">Signed</div>
                {b.signature ? (
                  <div className="text-ink/80">
                    {b.signed_name} · {b.signed_at.slice(0, 16).replace('T', ' ')}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/api/uploads/${b.signature}`}
                      alt={`Signature of ${b.signed_name}`}
                      className="mt-1 h-12 rounded-lg border border-ink/10 bg-white px-2"
                    />
                  </div>
                ) : (
                  <div className="text-ink/30">—</div>
                )}
              </div>
            </div>
            {!b.paid && payingOpen && (
              <div className="px-4 pb-3">
                <PaymentForm
                  onConfirm={(d) => {
                    setPaid(b.id, true, d);
                    setPayingOpen(false);
                  }}
                  onCancel={() => setPayingOpen(false)}
                />
              </div>
            )}
            <div className="px-4 pb-4 flex flex-wrap gap-2">
              {!b.paid ? (
                !payingOpen && (
                  <>
                    <button
                      className="btn-small bg-teal/15 text-teal font-bold rounded-full"
                      onClick={() => setPayingOpen(true)}
                    >
                      ✓ Mark as paid
                    </button>
                    <button
                      className="btn-small bg-pink/10 text-pink font-bold rounded-full"
                      onClick={() => sendPaymentEmail(b.id)}
                    >
                      💷 Send payment email
                    </button>
                  </>
                )
              ) : (
                <button
                  className="btn-small bg-ink/5 text-ink/60 font-bold rounded-full"
                  onClick={() => setPaid(b.id, false)}
                >
                  Mark as unpaid
                </button>
              )}
              {b.status === 'confirmed' ? (
                <button className="btn-small bg-plum/10 text-plum font-bold rounded-full" onClick={() => setStatus(b.id, 'cancelled')}>
                  Cancel booking
                </button>
              ) : (
                <button className="btn-small bg-teal/10 text-teal font-bold rounded-full" onClick={() => setStatus(b.id, 'confirmed')}>
                  Restore booking
                </button>
              )}
              <a className="btn-small bg-pink/10 text-pink font-bold rounded-full" href={`mailto:${b.parent_email}`}>
                Email parent
              </a>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

const PAYMENT_METHODS = ['Card', 'Cash', 'Bank transfer', 'Salary sacrifice', 'Other'];

function PaymentForm({
  onConfirm,
  onCancel,
}: {
  onConfirm: (details: { method: string; date: string; note: string; sendReceipt: boolean }) => void;
  onCancel: () => void;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const [method, setMethod] = useState(PAYMENT_METHODS[0]);
  const [date, setDate] = useState(today);
  const [note, setNote] = useState('');
  const [sendReceipt, setSendReceipt] = useState(true);
  return (
    <div className="rounded-xl border-2 border-teal/30 bg-teal/5 p-3 flex flex-wrap items-end gap-3">
      <div>
        <label className="text-[11px] font-extrabold uppercase tracking-wide text-ink/40">Paid via</label>
        <select
          className="field-input !py-1.5 !px-3 !rounded-lg !w-auto"
          value={method}
          onChange={(e) => setMethod(e.target.value)}
        >
          {PAYMENT_METHODS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-[11px] font-extrabold uppercase tracking-wide text-ink/40">Date paid</label>
        <input
          type="date"
          className="field-input !py-1.5 !px-3 !rounded-lg !w-auto"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>
      <div className="flex-1 min-w-[160px]">
        <label className="text-[11px] font-extrabold uppercase tracking-wide text-ink/40">Note (optional)</label>
        <input
          className="field-input !py-1.5 !px-3 !rounded-lg"
          placeholder="e.g. reference number"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>
      <label className="flex items-center gap-2 text-xs font-bold text-ink/70 pb-1.5 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={sendReceipt}
          onChange={(e) => setSendReceipt(e.target.checked)}
          className="h-4 w-4 rounded border-ink/30 accent-teal"
        />
        Email a receipt to the family
      </label>
      <button
        type="button"
        className="btn-small bg-teal text-white font-bold rounded-full"
        onClick={() => onConfirm({ method, date, note, sendReceipt })}
      >
        ✓ Confirm payment
      </button>
      <button type="button" className="btn-small text-ink/50 font-bold" onClick={onCancel}>
        Cancel
      </button>
    </div>
  );
}

function PasswordReveal({ value }: { value: string }) {
  const [show, setShow] = useState(false);
  if (!value) return <div className="text-sm text-ink/30">— not set —</div>;
  return (
    <div className="flex items-center gap-2">
      <span className="font-bold text-ink font-mono">{show ? value : '•'.repeat(Math.min(value.length, 12))}</span>
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="text-xs font-bold text-pink hover:underline"
      >
        {show ? 'Hide' : 'Show'}
      </button>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] font-extrabold uppercase tracking-wide text-ink/40">{label}</div>
      <div className="text-ink/80">{value || <span className="text-ink/30">—</span>}</div>
    </div>
  );
}

function DaysTab({ sessions, reload }: { sessions: SessionRow[]; reload: () => void }) {
  const [date, setDate] = useState('');
  const [label, setLabel] = useState('');
  const [capacity, setCapacity] = useState(20);
  const [err, setErr] = useState('');

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    const res = await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, label, capacity }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setErr(body.error || 'Could not add day.');
      return;
    }
    setDate('');
    setLabel('');
    reload();
  }

  async function patch(id: number, body: Record<string, unknown>) {
    await fetch(`/api/sessions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    reload();
  }

  async function remove(id: number) {
    if (!confirm('Delete this day?')) return;
    const res = await fetch(`/api/sessions/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setErr(body.error || 'Could not delete.');
    }
    reload();
  }

  return (
    <>
      <form onSubmit={add} className="mb-6 flex flex-wrap items-end gap-3 rounded-2xl bg-white border border-ink/5 shadow-soft p-5">
        <div>
          <label className="field-label" htmlFor="new-date">Date</label>
          <input id="new-date" type="date" required className="field-input !w-auto" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="flex-1 min-w-[160px]">
          <label className="field-label" htmlFor="new-label">Label (optional)</label>
          <input id="new-label" className="field-input" placeholder="e.g. Farmyard Fun" value={label} onChange={(e) => setLabel(e.target.value)} />
        </div>
        <div>
          <label className="field-label" htmlFor="new-cap">Capacity</label>
          <input id="new-cap" type="number" min={1} className="field-input !w-24" value={capacity} onChange={(e) => setCapacity(Number(e.target.value))} />
        </div>
        <button className="btn-primary !py-3">+ Add day</button>
        {err && <div className="w-full text-sm font-bold text-plum">{err}</div>}
      </form>

      <div className="rounded-2xl bg-white border border-ink/5 shadow-soft overflow-x-auto">
        <table className="admin-table w-full min-w-[620px]">
          <thead>
            <tr>
              <th>Date</th>
              <th>Label</th>
              <th>Note to families (shown on site & in reminder emails)</th>
              <th>Booked / capacity</th>
              <th>Visible</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((s) => (
              <tr key={s.id} className={s.active ? '' : 'opacity-50'}>
                <td className="font-bold whitespace-nowrap">{fmt(s.date)}</td>
                <td>
                  <input
                    className="field-input !py-1.5 !px-3 !rounded-lg"
                    defaultValue={s.label}
                    onBlur={(e) => e.target.value !== s.label && patch(s.id, { label: e.target.value })}
                  />
                </td>
                <td>
                  <input
                    className="field-input !py-1.5 !px-3 !rounded-lg min-w-[220px]"
                    placeholder="e.g. Bring spare clothes for the water fight!"
                    defaultValue={s.notes}
                    onBlur={(e) => e.target.value !== s.notes && patch(s.id, { notes: e.target.value })}
                  />
                </td>
                <td className="whitespace-nowrap">
                  <span className={`font-extrabold ${s.booked >= s.capacity ? 'text-plum' : 'text-teal'}`}>{s.booked}</span>
                  {' / '}
                  <input
                    type="number"
                    min={1}
                    className="field-input !py-1.5 !px-2 !rounded-lg !w-20 inline-block"
                    defaultValue={s.capacity}
                    onBlur={(e) => Number(e.target.value) !== s.capacity && patch(s.id, { capacity: Number(e.target.value) })}
                  />
                </td>
                <td>
                  <button
                    onClick={() => patch(s.id, { active: !s.active })}
                    className={`rounded-full px-3 py-1 text-xs font-extrabold ${s.active ? 'bg-teal/15 text-teal' : 'bg-ink/10 text-ink/50'}`}
                  >
                    {s.active ? 'Bookable' : 'Hidden'}
                  </button>
                </td>
                <td className="text-right">
                  <button onClick={() => remove(s.id)} className="text-plum/70 hover:text-plum font-bold text-sm">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function TeamTab({
  admins,
  champions,
  reload,
  setNotice,
}: {
  admins: AdminRow[];
  champions: ChampionRow[];
  reload: () => void;
  setNotice: (s: string) => void;
}) {
  return (
    <div className="grid lg:grid-cols-2 gap-6 items-start">
      <AdminsCard admins={admins} reload={reload} setNotice={setNotice} />
      <ChampionsCard champions={champions} reload={reload} setNotice={setNotice} />
    </div>
  );
}

function AdminsCard({
  admins,
  reload,
  setNotice,
}: {
  admins: AdminRow[];
  reload: () => void;
  setNotice: (s: string) => void;
}) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [err, setErr] = useState('');

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    const res = await fetch('/api/admins', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setErr(body.error || 'Could not add admin.');
      return;
    }
    setNotice(`${name} can now sign in with a magic link sent to ${email}.`);
    setEmail('');
    setName('');
    reload();
  }

  async function remove(id: number, label: string) {
    if (!confirm(`Remove ${label} as an admin?`)) return;
    const res = await fetch(`/api/admins/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setNotice(body.error || 'Could not remove admin.');
      return;
    }
    reload();
  }

  return (
    <div className="rounded-2xl bg-white border border-ink/5 shadow-soft p-5">
      <div className="font-display font-extrabold text-indigo text-lg mb-1">👤 Admins</div>
      <p className="text-sm text-ink/55 mb-4">
        Named admins sign in with a link emailed to them — no password to share or forget.
      </p>
      <form onSubmit={add} className="flex flex-wrap items-end gap-3 mb-4">
        <div className="flex-1 min-w-[160px]">
          <label className="field-label" htmlFor="admin-name">Name</label>
          <input
            id="admin-name"
            required
            className="field-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Samie Howlett"
          />
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="field-label" htmlFor="admin-email">Email</label>
          <input
            id="admin-email"
            type="email"
            required
            className="field-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@possabilities.org.uk"
          />
        </div>
        <button className="btn-primary !py-3 whitespace-nowrap">+ Add admin</button>
      </form>
      {err && <div className="mb-3 text-sm font-bold text-plum">{err}</div>}
      <div className="space-y-2">
        {admins.map((a) => (
          <div key={a.id} className="flex items-center justify-between rounded-xl bg-mist/60 px-4 py-2.5">
            <div>
              <div className="font-bold text-ink">{a.name}</div>
              <div className="text-xs text-ink/55">{a.email}</div>
            </div>
            <button onClick={() => remove(a.id, a.name)} className="text-plum/70 hover:text-plum font-bold text-sm">
              Remove
            </button>
          </div>
        ))}
        {admins.length === 0 && <div className="text-sm text-ink/40 py-4 text-center">No admins yet.</div>}
      </div>
    </div>
  );
}

function ChampionsCard({
  champions,
  reload,
  setNotice,
}: {
  champions: ChampionRow[];
  reload: () => void;
  setNotice: (s: string) => void;
}) {
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [err, setErr] = useState('');

  function randomPin() {
    setPin(String(Math.floor(1000 + Math.random() * 9000)));
  }

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    const res = await fetch('/api/champions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, pin }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setErr(body.error || 'Could not add champion.');
      return;
    }
    setNotice(`${name} added — they can now sign in to the register with their own PIN.`);
    setName('');
    setPin('');
    reload();
  }

  async function toggle(c: ChampionRow) {
    await fetch(`/api/champions/${c.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !c.active }),
    });
    reload();
  }

  async function remove(id: number, label: string) {
    if (!confirm(`Remove ${label} as an Activity Champion?`)) return;
    await fetch(`/api/champions/${id}`, { method: 'DELETE' });
    reload();
  }

  return (
    <div className="rounded-2xl bg-white border border-ink/5 shadow-soft p-5">
      <div className="font-display font-extrabold text-indigo text-lg mb-1">🐿️ Activity Champions</div>
      <p className="text-sm text-ink/55 mb-4">
        Give each champion their own PIN so the register always knows exactly who checked a child in or out.
      </p>
      <form onSubmit={add} className="flex flex-wrap items-end gap-3 mb-4">
        <div className="flex-1 min-w-[160px]">
          <label className="field-label" htmlFor="champ-name">Name</label>
          <input
            id="champ-name"
            required
            className="field-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Jamie"
          />
        </div>
        <div>
          <label className="field-label" htmlFor="champ-pin">PIN</label>
          <div className="flex gap-2">
            <input
              id="champ-pin"
              required
              className="field-input !w-28"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="4+ digits"
            />
            <button type="button" onClick={randomPin} className="btn-secondary btn-small whitespace-nowrap" title="Generate a random PIN">
              🎲
            </button>
          </div>
        </div>
        <button className="btn-primary !py-3 whitespace-nowrap">+ Add champion</button>
      </form>
      {err && <div className="mb-3 text-sm font-bold text-plum">{err}</div>}
      <div className="space-y-2">
        {champions.map((c) => (
          <div
            key={c.id}
            className={`flex items-center justify-between rounded-xl bg-mist/60 px-4 py-2.5 ${c.active ? '' : 'opacity-50'}`}
          >
            <div>
              <div className="font-bold text-ink">{c.name}</div>
              <PasswordReveal value={c.pin} />
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => toggle(c)}
                className={`rounded-full px-3 py-1 text-xs font-extrabold ${c.active ? 'bg-teal/15 text-teal' : 'bg-ink/10 text-ink/50'}`}
              >
                {c.active ? 'Active' : 'Disabled'}
              </button>
              <button onClick={() => remove(c.id, c.name)} className="text-plum/70 hover:text-plum font-bold text-sm">
                Remove
              </button>
            </div>
          </div>
        ))}
        {champions.length === 0 && (
          <div className="text-sm text-ink/40 py-4 text-center">
            No champions added yet — the shared team PIN still works as a fallback.
          </div>
        )}
      </div>
    </div>
  );
}

function StaffEmailsTab({ setNotice }: { setNotice: (s: string) => void }) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  async function copyHtml(key: string) {
    const res = await fetch(`/api/staff-emails/${key}?format=json`);
    if (!res.ok) {
      setNotice('Could not load that email.');
      return;
    }
    const { html } = await res.json();
    await navigator.clipboard.writeText(html);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey((k) => (k === key ? null : k)), 2000);
  }

  return (
    <div>
      <div className="rounded-2xl bg-white border border-ink/5 shadow-soft p-5 mb-6">
        <div className="font-display font-extrabold text-indigo text-lg mb-1">📣 Staff campaign emails</div>
        <p className="text-sm text-ink/55">
          A ready-made, branded email series to remind staff that Chipmunks is on and how to book — sent to the
          all-staff distribution list from your usual email tool (Outlook, Mailchimp, etc.), since that list lives
          outside this booking system. Preview each one, or copy the HTML straight into your email tool.
        </p>
      </div>
      <div className="grid sm:grid-cols-2 gap-5">
        {STAFF_CAMPAIGN.map((c) => (
          <div key={c.key} className="rounded-2xl bg-white border border-ink/5 shadow-soft p-5 flex flex-col">
            <div className="font-display font-extrabold text-ink">{c.label}</div>
            <p className="text-sm text-ink/55 mt-1 flex-1">{c.blurb}</p>
            <div className="flex gap-2 mt-4">
              <a
                href={`/api/staff-emails/${c.key}`}
                target="_blank"
                rel="noreferrer"
                className="btn-secondary btn-small"
              >
                👁 Preview
              </a>
              <button type="button" onClick={() => copyHtml(c.key)} className="btn-secondary btn-small">
                {copiedKey === c.key ? '✓ Copied!' : '📋 Copy HTML'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
