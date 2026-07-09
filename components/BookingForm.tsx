'use client';

import { useMemo, useRef, useState } from 'react';
import { site } from '@/content/site';
import SignaturePad from '@/components/SignaturePad';

interface SessionOption {
  id: number;
  date: string;
  label: string;
  note?: string;
  spacesLeft: number;
}

interface CollectorEntry {
  id: string;
  name: string;
  relationship: string;
  photoPreview: string;
}

function newCollector(): CollectorEntry {
  return { id: crypto.randomUUID(), name: '', relationship: '', photoPreview: '' };
}

const STEPS = ['Days', 'Your child', 'Grown-ups', 'Health', 'Confirm'] as const;

function formatDate(iso: string) {
  return new Date(iso + 'T12:00:00Z').toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'Europe/London',
  });
}

/** Downscale a photo client-side so phone-camera shots upload quickly. */
async function shrinkPhoto(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return file;
  const MAX = 900;
  const scale = Math.min(1, MAX / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext('2d');
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.85));
  return blob || file;
}

export default function BookingForm({ sessions }: { sessions: SessionOption[] }) {
  const [step, setStep] = useState(0);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [doneRef, setDoneRef] = useState('');

  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [photoPreview, setPhotoPreview] = useState('');
  const photoBlob = useRef<Blob | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const signatureBlob = useRef<Blob | null>(null);
  const [signedName, setSignedName] = useState('');
  const [hasSignature, setHasSignature] = useState(false);

  const [collectors, setCollectors] = useState<CollectorEntry[]>([newCollector()]);
  const collectorBlobs = useRef<Map<string, Blob>>(new Map());
  const collectorInputs = useRef<Map<string, HTMLInputElement>>(new Map());

  const [f, setF] = useState({
    child_first: '',
    child_last: '',
    child_dob: '',
    child_address: '',
    support_needs: '',
    parent_name: '',
    relationship: '',
    employee_name: '',
    employee_id: '',
    employee_relation: '',
    employee_email: '',
    parent_email: '',
    parent_phone: '',
    parent_phone2: '',
    kin_name: '',
    kin_phone: '',
    kin_relationship: '',
    kin_address: '',
    collection_password: '',
    medical_conditions: '',
    allergies: '',
    dietary: '',
    medication: '',
    gp_details: '',
    anything_else: '',
    consent_activities: false,
    consent_medical: false,
    consent_photo: false,
  });

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setF((prev) => ({
      ...prev,
      [k]: e.target instanceof HTMLInputElement && e.target.type === 'checkbox' ? e.target.checked : e.target.value,
    }));

  const chosenDates = useMemo(
    () => sessions.filter((s) => selectedDays.includes(s.id)).map((s) => s.date).sort(),
    [selectedDays, sessions]
  );

  async function onPhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const blob = await shrinkPhoto(file);
    photoBlob.current = blob;
    setPhotoPreview(URL.createObjectURL(blob));
  }

  function addCollector() {
    setCollectors((prev) => [...prev, newCollector()]);
  }
  function removeCollector(id: string) {
    collectorBlobs.current.delete(id);
    collectorInputs.current.delete(id);
    setCollectors((prev) => prev.filter((c) => c.id !== id));
  }
  function updateCollector(id: string, field: 'name' | 'relationship', value: string) {
    setCollectors((prev) => prev.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
  }
  async function onCollectorPhotoChange(id: string, file?: File) {
    if (!file) return;
    const blob = await shrinkPhoto(file);
    collectorBlobs.current.set(id, blob);
    setCollectors((prev) => prev.map((c) => (c.id === id ? { ...c, photoPreview: URL.createObjectURL(blob) } : c)));
  }
  function clearCollectorPhoto(id: string) {
    collectorBlobs.current.delete(id);
    const input = collectorInputs.current.get(id);
    if (input) input.value = '';
    setCollectors((prev) => prev.map((c) => (c.id === id ? { ...c, photoPreview: '' } : c)));
  }

  function validateStep(current: number): string {
    switch (current) {
      case 0:
        return selectedDays.length ? '' : 'Pick at least one day to continue.';
      case 1: {
        if (!f.child_first.trim() || !f.child_last.trim()) return 'Please tell us your child’s name.';
        if (!f.child_dob) return 'Please tell us your child’s date of birth — Chipmunks must be 8 or over.';
        const firstDay = chosenDates[0];
        if (firstDay) {
          const age =
            (new Date(firstDay).getTime() - new Date(f.child_dob).getTime()) /
            (365.25 * 24 * 3600 * 1000);
          if (age < 8) return 'Cherwell Chipmunks must be 8 years old or over — sorry, little ones!';
        }
        return '';
      }
      case 2:
        if (!f.parent_name.trim()) return 'Please tell us your name.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.parent_email)) return 'Please enter a valid email address.';
        if (!f.parent_phone.trim()) return 'Please enter a phone number we can reach you on.';
        if (!f.employee_name.trim())
          return 'Please tell us which PossAbilities employee your child belongs to — the camp is for staff families.';
        if (!f.employee_id.trim())
          return 'Please enter the employee’s payroll or Element Suite ID so we can verify the booking.';
        if (!f.employee_relation) return 'Please choose the child’s relationship to the PossAbilities employee.';
        if (!collectors.some((c) => c.name.trim()))
          return 'Please tell us who is allowed to collect your child — at least one person.';
        if (!f.collection_password.trim())
          return 'Please set a collection password, in case someone not listed needs to collect your child.';
        if (f.collection_password.trim().length < 4) return 'Please make the collection password at least 4 characters.';
        return '';
      case 3:
        return '';
      case 4:
        if (!f.consent_activities || !f.consent_medical)
          return 'The two required consents are needed before we can take the booking.';
        if (!(signedName || f.parent_name).trim()) return 'Please type your full name to sign.';
        if (!hasSignature) return 'Please add your signature in the box to complete the booking.';
        return '';
    }
    return '';
  }

  function next() {
    const msg = validateStep(step);
    setError(msg);
    if (!msg) {
      setStep((s) => Math.min(s + 1, STEPS.length - 1));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
  function back() {
    setError('');
    setStep((s) => Math.max(0, s - 1));
  }

  async function submit() {
    const msg = validateStep(4);
    setError(msg);
    if (msg) return;
    setSubmitting(true);
    try {
      const fd = new FormData();
      for (const [k, v] of Object.entries(f)) {
        fd.set(k, typeof v === 'boolean' ? (v ? 'yes' : 'no') : v);
      }
      fd.set('session_ids', JSON.stringify(selectedDays));
      fd.set('signed_name', (signedName || f.parent_name).trim());
      if (photoBlob.current) fd.set('photo', photoBlob.current, 'child.jpg');
      if (signatureBlob.current) fd.set('signature', signatureBlob.current, 'signature.png');

      const namedCollectors = collectors.filter((c) => c.name.trim());
      fd.set(
        'collectors_meta',
        JSON.stringify(namedCollectors.map((c) => ({ name: c.name.trim(), relationship: c.relationship.trim() })))
      );
      namedCollectors.forEach((c, i) => {
        const blob = collectorBlobs.current.get(c.id);
        if (blob) fd.set(`collector_photo_${i}`, blob, `collector_${i}.jpg`);
      });
      const res = await fetch('/api/bookings', { method: 'POST', body: fd });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || 'Something went wrong — please try again.');
      setDoneRef(body.ref);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong — please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  /* ── Success screen ─────────────────────────────────── */
  if (doneRef) {
    return (
      <div className="animate-pop-in rounded-blob bg-white border border-teal/20 shadow-lift p-8 sm:p-12 text-center">
        <div className="text-7xl animate-wiggle inline-block">🎉</div>
        <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-teal">You’re booked in!</h2>
        <p className="mt-4 text-lg text-ink/70 max-w-md mx-auto">
          {f.child_first} is coming to Chipmunks! Your booking reference is
        </p>
        <div className="mt-4 inline-block rounded-2xl bg-teal/15 border-2 border-teal px-8 py-3 font-display text-2xl font-extrabold tracking-widest text-indigo">
          {doneRef}
        </div>
        <p className="mt-6 text-ink/60 max-w-md mx-auto">
          A confirmation email with all the details is on its way to <strong>{f.parent_email}</strong>. We’ll
          also send a reminder the day before each visit.
        </p>
        <a href="/" className="btn-primary mt-8">
          Back to the Chipmunks page
        </a>
      </div>
    );
  }

  const inputCls = 'field-input';

  return (
    <div className="rounded-blob bg-white border border-ink/5 shadow-lift overflow-hidden">
      {/* Progress */}
      <div className="bg-indigo px-6 sm:px-10 pt-6 pb-5">
        <div className="flex justify-between">
          {STEPS.map((label, i) => (
            <div key={label} className="flex flex-col items-center gap-1.5 flex-1">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full font-display font-extrabold text-sm transition-all duration-300 ${
                  i < step
                    ? 'bg-teal text-white'
                    : i === step
                      ? 'bg-pink text-white scale-110 shadow-pink'
                      : 'bg-white/15 text-white/50'
                }`}
              >
                {i < step ? '✓' : i + 1}
              </div>
              <span className={`text-[11px] font-bold hidden sm:block ${i === step ? 'text-white' : 'text-white/40'}`}>
                {label}
              </span>
            </div>
          ))}
        </div>
        <div className="relative mt-5">
          <div className="h-1.5 rounded-full bg-white/15 overflow-hidden">
            <div
              className="h-full rounded-full bg-pink transition-all duration-500"
              style={{ width: `${(step / (STEPS.length - 1)) * 100}%` }}
            />
          </div>
          {/* squirrel scampers along as you make progress */}
          <span
            className="absolute -top-5 text-xl transition-all duration-500 -translate-x-1/2"
            style={{ left: `${(step / (STEPS.length - 1)) * 100}%` }}
            aria-hidden
          >
            🐿️
          </span>
        </div>
      </div>

      <div className="p-6 sm:p-10">
        {error && (
          <div className="mb-6 animate-pop-in rounded-2xl bg-plum/10 border border-plum/30 px-5 py-3.5 font-bold text-plum">
            {error}
          </div>
        )}

        {/* Step 0 — days */}
        {step === 0 && (
          <div className="animate-pop-in">
            <h2 className="text-2xl font-extrabold text-ink">Which days would you like?</h2>
            <p className="mt-1 text-ink/55">
              Pick as many as you like — £{site.session.pricePerDay} per day, lunch included. Places are
              first come, first served.
            </p>
            {sessions.length === 0 && (
              <p className="mt-6 text-ink/60">
                No dates are open for booking right now — email{' '}
                <a href={`mailto:${site.contact.email}`} className="text-pink font-bold underline">
                  {site.contact.email}
                </a>{' '}
                and we’ll let you know as soon as new dates land.
              </p>
            )}
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {sessions.map((s) => {
                const active = selectedDays.includes(s.id);
                const full = s.spacesLeft === 0;
                return (
                  <button
                    key={s.id}
                    type="button"
                    disabled={full}
                    onClick={() =>
                      setSelectedDays((prev) =>
                        active ? prev.filter((id) => id !== s.id) : [...prev, s.id]
                      )
                    }
                    className={`flex items-center justify-between gap-3 rounded-2xl border-2 p-4 text-left transition-all duration-200 ${
                      full
                        ? 'opacity-50 cursor-not-allowed border-ink/10 bg-mist'
                        : active
                          ? 'border-pink bg-pink/5 shadow-soft -translate-y-0.5'
                          : 'border-ink/10 bg-white hover:border-pink/40 hover:-translate-y-0.5'
                    }`}
                  >
                    <span>
                      <span className="block font-display font-extrabold text-ink">{formatDate(s.date)}</span>
                      <span className="text-sm text-ink/55 font-bold">
                        {full ? 'Fully booked' : s.label || 'Day camp'}
                      </span>
                      {!full && s.note && (
                        <span className="block text-xs font-bold text-pink mt-0.5">{s.note}</span>
                      )}
                    </span>
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-sm font-extrabold transition-all ${
                        active ? 'bg-pink border-pink text-white' : 'border-ink/20 text-transparent'
                      }`}
                    >
                      ✓
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 1 — child */}
        {step === 1 && (
          <div className="animate-pop-in space-y-5">
            <div>
              <h2 className="text-2xl font-extrabold text-ink">Tell us about your child</h2>
              <p className="mt-1 text-ink/55">So our Activity Champions can give them the warmest welcome.</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="field-label" htmlFor="child_first">First name *</label>
                <input id="child_first" className={inputCls} value={f.child_first} onChange={set('child_first')} />
              </div>
              <div>
                <label className="field-label" htmlFor="child_last">Last name *</label>
                <input id="child_last" className={inputCls} value={f.child_last} onChange={set('child_last')} />
              </div>
            </div>
            <div className="sm:w-1/2">
              <label className="field-label" htmlFor="child_dob">Date of birth *</label>
              <input id="child_dob" type="date" className={inputCls} value={f.child_dob} onChange={set('child_dob')} />
              <p className="field-hint">Chipmunks must be 8 years old or over.</p>
            </div>
            <div>
              <label className="field-label" htmlFor="child_address">Home address</label>
              <textarea
                id="child_address"
                rows={2}
                className={inputCls}
                placeholder="House number, street, town, postcode"
                value={f.child_address}
                onChange={set('child_address')}
              />
            </div>

            {/* Photo */}
            <div className="rounded-2xl bg-teal/5 border border-teal/20 p-5">
              <div className="flex items-start gap-4">
                {photoPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={photoPreview}
                    alt="Preview of your child's photo"
                    className="h-24 w-24 rounded-2xl object-cover border-2 border-teal/40 shadow-soft"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-teal/10 text-4xl">📸</div>
                )}
                <div className="flex-1">
                  <div className="font-bold text-ink">Add a photo of your child</div>
                  <p className="text-sm text-ink/55 mt-0.5">
                    This appears on the Activity Champion’s check-in list so the team recognises {f.child_first || 'your child'} at drop-off. On a phone you can take one right now with the camera.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button type="button" className="btn-secondary btn-small" onClick={() => fileInput.current?.click()}>
                      {photoPreview ? 'Change photo' : '📷 Take or choose a photo'}
                    </button>
                    {photoPreview && (
                      <button
                        type="button"
                        className="btn-small text-ink/50 hover:text-plum font-bold"
                        onClick={() => {
                          photoBlob.current = null;
                          setPhotoPreview('');
                          if (fileInput.current) fileInput.current.value = '';
                        }}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <input
                    ref={fileInput}
                    type="file"
                    accept="image/*"
                    capture="user"
                    className="hidden"
                    onChange={onPhotoChange}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="field-label" htmlFor="support_needs">
                Anything that helps us support them? <span className="font-normal text-ink/45">(optional)</span>
              </label>
              <textarea
                id="support_needs"
                rows={3}
                className={inputCls}
                placeholder="e.g. additional needs, things they love, things they find tricky…"
                value={f.support_needs}
                onChange={set('support_needs')}
              />
            </div>
          </div>
        )}

        {/* Step 2 — grown-ups */}
        {step === 2 && (
          <div className="animate-pop-in space-y-5">
            <div>
              <h2 className="text-2xl font-extrabold text-ink">Grown-ups & emergency contacts</h2>
              <p className="mt-1 text-ink/55">Who we should talk to about the booking and in an emergency.</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="field-label" htmlFor="parent_name">Your name *</label>
                <input id="parent_name" className={inputCls} value={f.parent_name} onChange={set('parent_name')} />
              </div>
              <div>
                <label className="field-label" htmlFor="relationship">Relationship to child</label>
                <input id="relationship" className={inputCls} placeholder="e.g. Mum, Dad, Carer" value={f.relationship} onChange={set('relationship')} />
              </div>
              <div>
                <label className="field-label" htmlFor="parent_email">Email address *</label>
                <input id="parent_email" type="email" className={inputCls} value={f.parent_email} onChange={set('parent_email')} />
                <p className="field-hint">Booking confirmation and reminders go here.</p>
              </div>
              <div>
                <label className="field-label" htmlFor="parent_phone">Phone number *</label>
                <input id="parent_phone" type="tel" className={inputCls} value={f.parent_phone} onChange={set('parent_phone')} />
              </div>
              <div>
                <label className="field-label" htmlFor="parent_phone2">
                  Other contact number <span className="font-normal text-ink/45">(optional)</span>
                </label>
                <input id="parent_phone2" type="tel" className={inputCls} value={f.parent_phone2} onChange={set('parent_phone2')} />
              </div>
            </div>

            <div className="rounded-2xl bg-pink/5 border border-pink/20 p-5 space-y-4">
              <div className="font-bold text-ink">PossAbilities family connection *</div>
              <p className="text-sm text-ink/55 -mt-2">
                Cherwell Chipmunks is for children and grandchildren of PossAbilities employees.
              </p>
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="field-label" htmlFor="employee_name">Name of the PossAbilities employee</label>
                  <input id="employee_name" className={inputCls} value={f.employee_name} onChange={set('employee_name')} />
                </div>
                <div>
                  <label className="field-label" htmlFor="employee_id">Payroll / Element Suite ID</label>
                  <input id="employee_id" className={inputCls} value={f.employee_id} onChange={set('employee_id')} />
                  <p className="field-hint">So we can verify the booking.</p>
                </div>
                <div>
                  <label className="field-label" htmlFor="employee_relation">The child is their…</label>
                  <select
                    id="employee_relation"
                    className={inputCls}
                    value={f.employee_relation}
                    onChange={set('employee_relation')}
                  >
                    <option value="">Choose…</option>
                    <option value="child">Child</option>
                    <option value="grandchild">Grandchild</option>
                  </select>
                </div>
              </div>
              <div className="sm:w-2/3">
                <label className="field-label" htmlFor="employee_email">
                  Employee’s email <span className="font-normal text-ink/45">(optional)</span>
                </label>
                <input
                  id="employee_email"
                  type="email"
                  className={inputCls}
                  placeholder="Their PossAbilities work email, if they have one"
                  value={f.employee_email}
                  onChange={set('employee_email')}
                />
              </div>
            </div>

            <div className="rounded-2xl bg-mist border border-ink/8 p-5 space-y-4">
              <div className="font-bold text-ink">Second emergency contact (next of kin)</div>
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="field-label" htmlFor="kin_name">Name</label>
                  <input id="kin_name" className={inputCls} value={f.kin_name} onChange={set('kin_name')} />
                </div>
                <div>
                  <label className="field-label" htmlFor="kin_phone">Phone</label>
                  <input id="kin_phone" type="tel" className={inputCls} value={f.kin_phone} onChange={set('kin_phone')} />
                </div>
                <div>
                  <label className="field-label" htmlFor="kin_relationship">Relationship</label>
                  <input id="kin_relationship" className={inputCls} placeholder="e.g. Grandma" value={f.kin_relationship} onChange={set('kin_relationship')} />
                </div>
              </div>
              <div>
                <label className="field-label" htmlFor="kin_address">
                  Their address <span className="font-normal text-ink/45">(optional)</span>
                </label>
                <input
                  id="kin_address"
                  className={inputCls}
                  placeholder="House number, street, town, postcode"
                  value={f.kin_address}
                  onChange={set('kin_address')}
                />
              </div>
            </div>

            <div className="rounded-2xl bg-mist border border-ink/8 p-5 space-y-4">
              <div>
                <div className="font-bold text-ink">Who can collect {f.child_first || 'your child'}? *</div>
                <p className="text-sm text-ink/55 mt-1">
                  Add everyone who might drop off or collect. A photo helps our Activity Champions check who’s
                  picking up — especially handy if it’s someone new to us. We’ll only release{' '}
                  {f.child_first || 'your child'} to the people listed here.
                </p>
              </div>

              {collectors.map((c, idx) => (
                <div key={c.id} className="rounded-xl border border-ink/10 bg-white p-4">
                  <div className="flex items-start gap-4">
                    {c.photoPreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={c.photoPreview}
                        alt=""
                        className="h-16 w-16 shrink-0 rounded-xl object-cover border-2 border-teal/40"
                      />
                    ) : (
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-teal/10 text-2xl">
                        📸
                      </div>
                    )}
                    <div className="flex-1 grid sm:grid-cols-2 gap-3">
                      <div>
                        <label className="field-label">Name {idx === 0 && '*'}</label>
                        <input
                          className={inputCls}
                          value={c.name}
                          onChange={(e) => updateCollector(c.id, 'name', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="field-label">Relationship</label>
                        <input
                          className={inputCls}
                          placeholder="e.g. Mum, Grandad, Childminder"
                          value={c.relationship}
                          onChange={(e) => updateCollector(c.id, 'relationship', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      className="btn-secondary btn-small"
                      onClick={() => collectorInputs.current.get(c.id)?.click()}
                    >
                      {c.photoPreview ? 'Change photo' : '📷 Add a photo'}
                    </button>
                    {c.photoPreview && (
                      <button
                        type="button"
                        className="btn-small text-ink/50 hover:text-plum font-bold"
                        onClick={() => clearCollectorPhoto(c.id)}
                      >
                        Remove photo
                      </button>
                    )}
                    {collectors.length > 1 && (
                      <button
                        type="button"
                        className="ml-auto btn-small text-plum/70 hover:text-plum font-bold"
                        onClick={() => removeCollector(c.id)}
                      >
                        Remove person
                      </button>
                    )}
                  </div>
                  <input
                    ref={(el) => {
                      if (el) collectorInputs.current.set(c.id, el);
                    }}
                    type="file"
                    accept="image/*"
                    capture="user"
                    className="hidden"
                    onChange={(e) => onCollectorPhotoChange(c.id, e.target.files?.[0])}
                  />
                </div>
              ))}

              <button type="button" className="btn-secondary btn-small" onClick={addCollector}>
                + Add another person
              </button>
            </div>

            <div className="rounded-2xl bg-pink/5 border border-pink/20 p-5">
              <label className="field-label" htmlFor="collection_password">Collection password *</label>
              <p className="text-sm text-ink/55 -mt-1 mb-3">
                If someone who isn’t listed above ever needs to collect {f.child_first || 'your child'} — say, in
                an emergency — we’ll ask them for this password before releasing them to you. Choose a word or
                phrase that’s easy to share with someone you trust.
              </p>
              <input
                id="collection_password"
                className={inputCls}
                placeholder="e.g. a memorable word or phrase"
                value={f.collection_password}
                onChange={set('collection_password')}
              />
              <p className="field-hint">At least 4 characters. Not used for anyone already listed above.</p>
            </div>
          </div>
        )}

        {/* Step 3 — health */}
        {step === 3 && (
          <div className="animate-pop-in space-y-5">
            <div>
              <h2 className="text-2xl font-extrabold text-ink">Health & medical information</h2>
              <p className="mt-1 text-ink/55">
                Leave anything blank that doesn’t apply. This is shared only with the team looking after your child.
              </p>
            </div>
            <div>
              <label className="field-label" htmlFor="medical_conditions">Medical conditions</label>
              <textarea id="medical_conditions" rows={2} className={inputCls} placeholder="e.g. asthma, epilepsy, diabetes…" value={f.medical_conditions} onChange={set('medical_conditions')} />
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="field-label" htmlFor="allergies">Allergies</label>
                <textarea id="allergies" rows={2} className={inputCls} placeholder="e.g. nuts, penicillin, animal hair…" value={f.allergies} onChange={set('allergies')} />
              </div>
              <div>
                <label className="field-label" htmlFor="dietary">Dietary requirements</label>
                <textarea id="dietary" rows={2} className={inputCls} placeholder="e.g. vegetarian, halal, gluten-free…" value={f.dietary} onChange={set('dietary')} />
              </div>
            </div>
            <div>
              <label className="field-label" htmlFor="medication">Medication they take (and when)</label>
              <textarea id="medication" rows={2} className={inputCls} placeholder="e.g. inhaler — two puffs before exercise" value={f.medication} onChange={set('medication')} />
            </div>
            <div>
              <label className="field-label" htmlFor="gp_details">GP name & surgery</label>
              <input id="gp_details" className={inputCls} value={f.gp_details} onChange={set('gp_details')} />
            </div>
            <div>
              <label className="field-label" htmlFor="anything_else">Anything else we should know?</label>
              <textarea id="anything_else" rows={2} className={inputCls} value={f.anything_else} onChange={set('anything_else')} />
            </div>
          </div>
        )}

        {/* Step 4 — confirm */}
        {step === 4 && (
          <div className="animate-pop-in space-y-6">
            <div>
              <h2 className="text-2xl font-extrabold text-ink">Nearly there — check & consent</h2>
            </div>

            <div className="rounded-2xl bg-mist border border-ink/8 p-5 text-sm leading-7">
              <div className="font-display font-extrabold text-lg text-indigo mb-1">
                {f.child_first} {f.child_last}
              </div>
              <div>
                <strong>{chosenDates.length}</strong> day{chosenDates.length === 1 ? '' : 's'}:{' '}
                {chosenDates.map(formatDate).join(' · ')}
              </div>
              <div>
                Total: <strong>£{chosenDates.length * site.session.pricePerDay}</strong> — lunch included
              </div>
              <div className="text-ink/55">
                Contact: {f.parent_name} · {f.parent_email} · {f.parent_phone}
              </div>
              <div className="text-ink/55">
                PossAbilities employee: {f.employee_name} · ID {f.employee_id} ({f.employee_relation || '—'})
              </div>
              <div className="text-ink/55">
                Collection: {collectors.filter((c) => c.name.trim()).length} person
                {collectors.filter((c) => c.name.trim()).length === 1 ? '' : 's'} named
              </div>
              <div className="mt-2 rounded-xl bg-pink/10 border border-pink/25 px-3 py-2 text-xs font-bold text-pink-deep">
                Payment is in advance and we’re unable to refund cancellations. We’ll send payment details with
                your confirmation.
              </div>
            </div>

            <div className="space-y-3">
              {(
                [
                  {
                    key: 'consent_activities' as const,
                    required: true,
                    label: `I give permission for my child to take part in all Chipmunks activities, including farm animal contact and the immersive room.`,
                  },
                  {
                    key: 'consent_medical' as const,
                    required: true,
                    label: `In an emergency, I authorise the ${site.orgName} team to seek medical treatment for my child if I can’t be reached.`,
                  },
                  {
                    key: 'consent_photo' as const,
                    required: false,
                    label: `I’m happy for photos of my child to be used by ${site.orgName} to celebrate what we get up to (optional).`,
                  },
                ] as const
              ).map((c) => (
                <label
                  key={c.key}
                  className={`flex items-start gap-3.5 rounded-2xl border-2 p-4 cursor-pointer transition-colors ${
                    f[c.key] ? 'border-teal bg-teal/5' : 'border-ink/10 bg-white hover:border-ink/25'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={f[c.key]}
                    onChange={set(c.key)}
                    className="mt-1 h-5 w-5 accent-[rgb(var(--pa-teal))]"
                  />
                  <span className="text-sm leading-relaxed text-ink/75">
                    {c.label} {c.required && <strong className="text-plum">*</strong>}
                  </span>
                </label>
              ))}
            </div>

            {/* Signature */}
            <div className="rounded-2xl bg-mist border border-indigo/10 p-5">
              <div className="font-bold text-ink">Sign to confirm *</div>
              <p className="mt-1 text-sm text-ink/55 leading-relaxed">
                By signing below I confirm that the information I’ve given is accurate and complete, that I’m
                authorised to book for this child, and that I agree to the booking terms — £
                {site.session.pricePerDay} per day paid in advance, with no refunds for cancellations.
              </p>
              <div className="mt-4">
                <label className="field-label" htmlFor="signed_name">Full name</label>
                <input
                  id="signed_name"
                  className={inputCls}
                  placeholder={f.parent_name || 'Your full name'}
                  value={signedName}
                  onChange={(e) => setSignedName(e.target.value)}
                />
              </div>
              <div className="mt-4">
                <SignaturePad
                  onChange={(blob) => {
                    signatureBlob.current = blob;
                    setHasSignature(!!blob);
                  }}
                />
              </div>
              <p className="mt-1 text-xs text-ink/45">
                Signed {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} —
                we record the date and time with your booking.
              </p>
            </div>
          </div>
        )}

        {/* Nav buttons */}
        <div className="mt-8 flex items-center justify-between">
          {step > 0 ? (
            <button type="button" onClick={back} className="btn-secondary">
              ← Back
            </button>
          ) : (
            <span />
          )}
          {step < STEPS.length - 1 ? (
            <button type="button" onClick={next} className="btn-primary">
              Continue →
            </button>
          ) : (
            <button type="button" onClick={submit} disabled={submitting} className="btn-primary disabled:opacity-60">
              {submitting ? 'Booking…' : `Confirm booking 🐿️`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
