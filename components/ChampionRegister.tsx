'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

interface Child {
  booking_day_id: number;
  checked_in_at: string | null;
  checked_in_by: string;
  checked_out_at: string | null;
  checked_out_by: string;
  booking_id: number;
  ref: string;
  child_first: string;
  child_last: string;
  child_dob: string;
  photo: string;
  parent_name: string;
  parent_phone: string;
  kin_name: string;
  kin_phone: string;
  kin_relationship: string;
  employee_name: string;
  employee_relation: string;
  medical_conditions: string;
  allergies: string;
  dietary: string;
  medication: string;
  support_needs: string;
  anything_else: string;
  collectors: { id: number; name: string; relationship: string; photo: string }[];
}

function todayLocalISO() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/London',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

function timeOf(iso: string | null) {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/London' });
}

export default function ChampionRegister({
  championName,
  isAdmin,
}: {
  championName: string;
  isAdmin: boolean;
}) {
  const [date, setDate] = useState(todayLocalISO());
  const [children, setChildren] = useState<Child[]>([]);
  const [sessionInfo, setSessionInfo] = useState<{ label: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [openCard, setOpenCard] = useState<number | null>(null);
  const [filter, setFilter] = useState<'all' | 'expected' | 'here'>('all');
  const [checkoutFor, setCheckoutFor] = useState<number | null>(null);
  const [otherName, setOtherName] = useState('');
  const [otherPassword, setOtherPassword] = useState('');
  const [checkoutError, setCheckoutError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/register?date=${date}`);
    const body = await res.json().catch(() => ({}));
    setChildren(body.children || []);
    setSessionInfo(body.session);
    setLoading(false);
  }, [date]);

  useEffect(() => {
    load();
  }, [load]);

  async function act(bookingDayId: number, action: 'in' | 'undo-in' | 'undo-out') {
    await fetch('/api/checkin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingDayId, action }),
    });
    load();
  }

  async function confirmCheckout(bookingDayId: number, collectedBy: string, password?: string) {
    if (!collectedBy.trim()) return;
    setCheckoutError('');
    const res = await fetch('/api/checkin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingDayId, action: 'out', collectedBy: collectedBy.trim(), password: password?.trim() }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setCheckoutError(body.error || 'Could not check out — please try again.');
      return;
    }
    setCheckoutFor(null);
    setOtherName('');
    setOtherPassword('');
    load();
  }

  async function logout() {
    await fetch('/api/login', { method: 'DELETE' });
    location.reload();
  }

  const stats = useMemo(() => {
    const here = children.filter((c) => c.checked_in_at && !c.checked_out_at).length;
    const gone = children.filter((c) => c.checked_out_at).length;
    return { total: children.length, here, gone, expected: children.length - here - gone };
  }, [children]);

  const visible = children.filter((c) => {
    const here = !!c.checked_in_at && !c.checked_out_at;
    const expected = !c.checked_in_at;
    if (filter === 'here') return here;
    if (filter === 'expected') return expected;
    return true;
  });

  return (
    <main className="min-h-screen bg-mist pb-24">
      <header className="bg-indigo text-white sticky top-0 z-30 shadow-lift">
        <div className="mx-auto max-w-3xl px-4 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-2xl">🐿️</span>
            <div className="min-w-0">
              <div className="font-display font-extrabold leading-tight truncate">Champion register</div>
              {championName && <div className="text-xs text-white/60 truncate">Hi {championName}! 👋</div>}
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {isAdmin && (
              <a href="/admin" className="text-sm font-bold text-white/70 hover:text-white">
                Admin
              </a>
            )}
            <button onClick={logout} className="text-sm font-bold text-white/70 hover:text-white">
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 pt-6">
        {/* Date + stats */}
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="date"
            className="field-input !w-auto font-bold"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          {sessionInfo?.label && <span className="font-display font-bold text-indigo">{sessionInfo.label}</span>}
          <div className="ml-auto flex gap-2 text-center">
            <div className="rounded-xl bg-white border border-ink/5 shadow-soft px-3.5 py-1.5">
              <div className="font-display font-extrabold text-teal text-lg leading-none">{stats.here}</div>
              <div className="text-[10px] font-bold text-ink/50 uppercase">Here</div>
            </div>
            <div className="rounded-xl bg-white border border-ink/5 shadow-soft px-3.5 py-1.5">
              <div className="font-display font-extrabold text-plum text-lg leading-none">{stats.expected}</div>
              <div className="text-[10px] font-bold text-ink/50 uppercase">Due</div>
            </div>
            <div className="rounded-xl bg-white border border-ink/5 shadow-soft px-3.5 py-1.5">
              <div className="font-display font-extrabold text-ink/60 text-lg leading-none">{stats.gone}</div>
              <div className="text-[10px] font-bold text-ink/50 uppercase">Gone home</div>
            </div>
          </div>
        </div>

        {/* filter pills */}
        <div className="mt-4 flex gap-2">
          {(
            [
              ['all', `Everyone (${stats.total})`],
              ['expected', `Still due (${stats.expected})`],
              ['here', `Here now (${stats.here})`],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`rounded-full px-4 py-1.5 text-sm font-extrabold transition-colors ${
                filter === key ? 'bg-pink text-white' : 'bg-white text-ink/60 border border-ink/10'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* register */}
        <div className="mt-5 space-y-3">
          {loading && <p className="text-center text-ink/40 py-10 font-bold">Loading register…</p>}
          {!loading && children.length === 0 && (
            <div className="text-center py-14 rounded-blob bg-white border border-ink/5 shadow-soft">
              <div className="text-5xl">🍂</div>
              <p className="mt-3 font-display font-bold text-lg text-ink/60">
                {sessionInfo ? 'No children booked for this day yet.' : 'No Chipmunks session on this date.'}
              </p>
            </div>
          )}
          {visible.map((c) => {
            const here = !!c.checked_in_at && !c.checked_out_at;
            const gone = !!c.checked_out_at;
            const hasMedical = !!(c.medical_conditions || c.allergies || c.medication);
            const open = openCard === c.booking_day_id;
            return (
              <div
                key={c.booking_day_id}
                className={`rounded-blob bg-white border-2 shadow-soft overflow-hidden transition-colors ${
                  gone ? 'border-ink/10 opacity-70' : here ? 'border-teal/50' : 'border-ink/5'
                }`}
              >
                <div className="flex items-center gap-4 p-4">
                  {/* photo */}
                  {c.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`/api/uploads/${c.photo}`}
                      alt={`${c.child_first} ${c.child_last}`}
                      className="h-16 w-16 rounded-2xl object-cover border-2 border-pink/20 shrink-0"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-2xl bg-pink/10 flex items-center justify-center text-2xl font-display font-extrabold text-pink shrink-0">
                      {c.child_first[0]}
                      {c.child_last[0]}
                    </div>
                  )}
                  <button className="flex-1 min-w-0 text-left" onClick={() => setOpenCard(open ? null : c.booking_day_id)}>
                    <div className="font-display font-extrabold text-lg text-ink leading-tight flex items-center gap-2">
                      <span className="truncate">
                        {c.child_first} {c.child_last}
                      </span>
                      {hasMedical && (
                        <span className="shrink-0 rounded-full bg-plum/15 text-plum text-[10px] font-extrabold px-2 py-0.5">
                          ⚕️ MEDICAL
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-ink/50 font-bold mt-0.5">
                      {here && `Checked in ${timeOf(c.checked_in_at)}${c.checked_in_by ? ` by ${c.checked_in_by}` : ''}`}
                      {gone && `Went home ${timeOf(c.checked_out_at)}${c.checked_out_by ? ` with ${c.checked_out_by}` : ''}`}
                      {!c.checked_in_at && `Due today · ${c.ref}`}
                      <span className="ml-1 text-pink/60">{open ? '▴ less' : '▾ details'}</span>
                    </div>
                  </button>
                  {/* action button */}
                  {!c.checked_in_at && (
                    <button
                      onClick={() => act(c.booking_day_id, 'in')}
                      className="btn bg-teal text-white px-5 py-3 text-base font-extrabold shrink-0 hover:bg-teal/85 active:scale-95"
                    >
                      ✓ Check in
                    </button>
                  )}
                  {here && checkoutFor !== c.booking_day_id && (
                    <button
                      onClick={() => {
                        setCheckoutError('');
                        setCheckoutFor(c.booking_day_id);
                      }}
                      className="btn bg-indigo text-white px-5 py-3 text-base font-extrabold shrink-0 hover:bg-indigo-deep active:scale-95"
                    >
                      Home time
                    </button>
                  )}
                  {gone && (
                    <button
                      onClick={() => act(c.booking_day_id, 'undo-out')}
                      className="btn-small text-ink/50 font-bold shrink-0"
                    >
                      Undo
                    </button>
                  )}
                </div>

                {here && checkoutFor === c.booking_day_id && (
                  <div className="border-t border-ink/5 bg-indigo/5 p-4 animate-pop-in">
                    <div className="text-sm font-bold text-ink mb-2">Who’s collecting {c.child_first}?</div>
                    {c.collectors.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {c.collectors.map((p) => (
                          <button
                            key={p.id}
                            onClick={() => confirmCheckout(c.booking_day_id, p.name)}
                            className="flex items-center gap-2 rounded-xl bg-white border-2 border-ink/10 hover:border-teal px-3 py-2 transition-colors"
                          >
                            {p.photo ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={`/api/uploads/${p.photo}`}
                                alt={p.name}
                                className="h-9 w-9 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-pink/10 text-sm font-bold text-pink">
                                {p.name[0]}
                              </div>
                            )}
                            <span className="text-sm font-bold text-ink">{p.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                    <div className="text-xs font-bold text-ink/45 mb-1.5">
                      Not one of the people above? They’ll need the collection password.
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <input
                        className="field-input flex-1 min-w-[140px] !py-2"
                        placeholder="Their name"
                        value={otherName}
                        onChange={(e) => setOtherName(e.target.value)}
                      />
                      <input
                        className="field-input flex-1 min-w-[140px] !py-2"
                        placeholder="Collection password"
                        value={otherPassword}
                        onChange={(e) => setOtherPassword(e.target.value)}
                      />
                      <button
                        onClick={() => confirmCheckout(c.booking_day_id, otherName, otherPassword)}
                        disabled={!otherName.trim() || !otherPassword.trim()}
                        className="btn-small bg-indigo text-white font-bold rounded-full disabled:opacity-40"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => {
                          setCheckoutFor(null);
                          setOtherName('');
                          setOtherPassword('');
                          setCheckoutError('');
                        }}
                        className="btn-small text-ink/50 font-bold"
                      >
                        Cancel
                      </button>
                    </div>
                    {checkoutError && (
                      <div className="mt-2 rounded-lg bg-plum/10 border border-plum/30 px-3 py-2 text-sm font-bold text-plum">
                        {checkoutError}
                      </div>
                    )}
                  </div>
                )}

                {open && (
                  <div className="border-t border-ink/5 bg-mist/50 p-4 grid sm:grid-cols-2 gap-x-6 gap-y-2.5 text-sm animate-pop-in">
                    <Info label="Parent / guardian" value={`${c.parent_name} · ${c.parent_phone}`} strong />
                    <Info label="Next of kin" value={[c.kin_name, c.kin_phone, c.kin_relationship].filter(Boolean).join(' · ')} />
                    <div className="sm:col-span-2">
                      <div className="text-[10px] font-extrabold uppercase tracking-wide text-ink/40 mb-1.5">
                        Who can collect {c.child_first} — check photo ID at pickup
                      </div>
                      {c.collectors.length === 0 ? (
                        <div className="text-sm font-bold text-plum">
                          No one listed — check with the office before releasing this child.
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {c.collectors.map((p) => (
                            <div
                              key={p.id}
                              className="flex items-center gap-2 rounded-xl bg-white border border-ink/10 px-2.5 py-1.5"
                            >
                              {p.photo ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={`/api/uploads/${p.photo}`}
                                  alt={p.name}
                                  className="h-10 w-10 rounded-lg object-cover border border-ink/10"
                                />
                              ) : (
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pink/10 text-sm font-bold text-pink">
                                  {p.name[0]}
                                </div>
                              )}
                              <div>
                                <div className="text-sm font-bold text-ink leading-tight">{p.name}</div>
                                {p.relationship && (
                                  <div className="text-[11px] text-ink/50 leading-tight">{p.relationship}</div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <Info
                      label="PossAbilities employee"
                      value={c.employee_name ? `${c.employee_name} (${c.employee_relation || '—'})` : ''}
                    />
                    <Info label="Medical conditions" value={c.medical_conditions} warn />
                    <Info label="Allergies" value={c.allergies} warn />
                    <Info label="Medication" value={c.medication} warn />
                    <Info label="Dietary" value={c.dietary} />
                    <Info label="Support needs" value={c.support_needs} />
                    <Info label="Anything else" value={c.anything_else} />
                    {c.checked_in_at && (
                      <div className="sm:col-span-2 pt-1">
                        <button onClick={() => act(c.booking_day_id, 'undo-in')} className="text-xs font-bold text-plum/70 hover:text-plum">
                          Undo check-in (marked by mistake)
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}

function Info({ label, value, warn = false, strong = false }: { label: string; value: string; warn?: boolean; strong?: boolean }) {
  if (!value) return null;
  return (
    <div>
      <div className={`text-[10px] font-extrabold uppercase tracking-wide ${warn ? 'text-plum/70' : 'text-ink/40'}`}>
        {label}
      </div>
      <div className={`${warn ? 'text-plum font-bold' : strong ? 'text-ink font-bold' : 'text-ink/75'}`}>{value}</div>
    </div>
  );
}
