import Link from 'next/link';
import { site } from '@/content/site';
import { listSessions } from '@/lib/db';
import Reveal from '@/components/Reveal';
import Mascot from '@/components/Mascot';
import Wave from '@/components/Wave';
import TiltCard from '@/components/TiltCard';
import CountUp from '@/components/CountUp';
import { PossMark } from '@/components/PossLogo';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';

export const dynamic = 'force-dynamic';

const activityStyles = [
  { blob: 'bg-pink/15', ring: 'group-hover:ring-pink/30', bar: 'bg-pink', badge: 'bg-pink text-white' },
  { blob: 'bg-teal/20', ring: 'group-hover:ring-teal/40', bar: 'bg-teal', badge: 'bg-teal text-indigo' },
  { blob: 'bg-indigo/10', ring: 'group-hover:ring-indigo/30', bar: 'bg-indigo', badge: 'bg-indigo text-white' },
  { blob: 'bg-plum/10', ring: 'group-hover:ring-plum/30', bar: 'bg-plum', badge: 'bg-plum text-white' },
];

const marqueeItems = [
  '🐐 Animal care',
  '✨ Immersive room',
  '🗺️ Treasure hunts',
  '🧁 Chipmunks bake-off',
  '🏆 Games & competitions',
  '🎨 Arts & craft',
  '💦 Water fight day',
  '🐿️ New friends',
];

const dayEmojis = ['👋', '🎯', '🐐', '🥪', '✨', '🏆', '🏠'];

function dayNum(iso: string) {
  return iso.slice(8, 10).replace(/^0/, '');
}
function monthShort(iso: string) {
  return new Intl.DateTimeFormat('en-GB', { month: 'short', timeZone: 'Europe/London' }).format(
    new Date(iso + 'T12:00:00Z')
  );
}
function weekdayLong(iso: string) {
  return new Intl.DateTimeFormat('en-GB', { weekday: 'long', timeZone: 'Europe/London' }).format(
    new Date(iso + 'T12:00:00Z')
  );
}

function Kicker({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className="flex justify-center">
      <span className={`sticker bg-white ${className}`}>{children}</span>
    </div>
  );
}

export default function HomePage() {
  const sessions = listSessions({ upcomingOnly: true, activeOnly: true });

  return (
    <>
      <SiteHeader />
      <main className="overflow-x-clip">
        {/* ══ HERO ═══════════════════════════════════════════ */}
        <section className="relative bg-white">
          {/* floating brand confetti */}
          <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -top-24 -left-28 h-80 w-80 bg-teal/15 animate-blob" />
            <div className="absolute top-40 right-[4%] h-28 w-28 rounded-full bg-teal/25 animate-float" />
            <div className="absolute top-16 right-[24%] h-10 w-32 rotate-[14deg] rounded-md bg-pink/15 animate-float-slow" />
            <div className="absolute bottom-48 left-[3%] h-8 w-24 rotate-[14deg] rounded-md bg-pink/20 animate-float" />
            <span className="absolute top-28 left-[16%] text-2xl text-teal animate-sparkle">✦</span>
            <span className="absolute top-64 right-[38%] text-xl text-pink animate-sparkle [animation-delay:0.9s]">✦</span>
            <span className="absolute bottom-64 right-[12%] text-2xl text-indigo/60 animate-sparkle [animation-delay:1.6s]">✦</span>
          </div>

          <div className="relative mx-auto max-w-6xl px-4 sm:px-6 pt-10 pb-4 sm:pt-14 grid lg:grid-cols-[1.15fr_1fr] gap-10 items-center">
            <div>
              <Reveal>
                <div className="flex flex-wrap gap-3">
                  <span className="sticker border-teal/50 text-indigo -rotate-2">☀️ 3–7 & 10–14 August</span>
                  <span className="sticker border-pink/40 text-pink rotate-1">Ages {site.session.ageRange}</span>
                  <span className="sticker border-indigo/20 text-indigo -rotate-1">📍 The Cherwell Centre</span>
                </div>
              </Reveal>
              <Reveal delay={100}>
                <h1 className="mt-6 text-5xl sm:text-6xl lg:text-[4.6rem] font-bold leading-[1.04] text-indigo">
                  School holidays…
                  <br />
                  <span className="hl hl-teal text-pink">don’t panic!</span>
                </h1>
              </Reveal>
              <Reveal delay={180}>
                <svg viewBox="0 0 240 14" className="mt-4 w-56 text-pink" aria-hidden>
                  <path
                    d="M4 10 Q 22 2 40 8 T 76 8 T 112 8 T 148 8 T 184 8 T 220 8"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                    className="squiggle"
                  />
                </svg>
              </Reveal>
              <Reveal delay={240}>
                <p className="mt-5 text-lg sm:text-xl text-ink/70 leading-relaxed max-w-xl">{site.intro}</p>
              </Reveal>
              <Reveal delay={320}>
                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <Link href="/book" className="btn-primary text-xl !px-9 !py-4 group">
                    Book your child’s place
                    <span className="inline-block transition-transform duration-200 group-hover:translate-x-1.5">→</span>
                  </Link>
                  <a href="#activities" className="btn-secondary">
                    See what we get up to
                    <span className="animate-bounce-soft inline-block">👇</span>
                  </a>
                </div>
              </Reveal>
              <Reveal delay={400}>
                <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-bold text-ink/55">
                  <span>🕘 Drop off {site.session.dropOffFrom} · pick up {site.session.endTime}</span>
                  <span>💷 £{site.session.pricePerDay} a day, lunch included</span>
                </div>
                <p className="mt-3 text-sm font-bold text-pink">
                  💗 Exclusively for children & grandchildren of {site.orgName} employees
                </p>
              </Reveal>
            </div>

            {/* mascot on morphing brand blob */}
            <Reveal delay={200} className="hidden lg:block">
              <div className="relative mx-auto w-full max-w-sm pb-6">
                {/* logo-echo composition: pink bar crossing the teal circle, Orla in front */}
                <div className="absolute left-[12%] -top-6 h-72 w-14 rotate-[14deg] rounded-lg bg-pink/90 animate-float-slow" aria-hidden />
                <div className="absolute left-1/2 top-[4%] h-[380px] w-[380px] -translate-x-1/2 bg-teal/90 animate-blob" aria-hidden />
                <span className="absolute -top-4 right-10 text-3xl text-pink animate-sparkle" aria-hidden>✦</span>
                <span className="absolute top-[55%] -left-6 text-2xl text-teal animate-sparkle [animation-delay:1.2s]" aria-hidden>✦</span>
                <Mascot className="relative z-10 w-[72%] mx-auto animate-float drop-shadow-2xl" />
                <div className="absolute right-[-8%] top-[-9%] z-20 rotate-2 rounded-2xl rounded-bl-none border-[3px] border-teal/60 bg-white shadow-lift px-4 py-2 text-sm font-display font-bold text-indigo animate-float-slow">
                  “{site.tagline}” 💬
                </div>
              </div>
            </Reveal>
          </div>

          <Wave className="h-[70px] sm:h-[100px]" drift />
        </section>

        {/* ══ DOUBLE TICKER ══════════════════════════════════ */}
        <div className="bg-indigo -mt-px pt-1 pb-2 space-y-2 overflow-hidden" aria-hidden>
          <div className="flex w-max animate-marquee gap-4 whitespace-nowrap">
            {[...marqueeItems, ...marqueeItems].map((item, i) => (
              <span
                key={i}
                className="rounded-full border-2 border-white/15 bg-white/[0.07] px-5 py-1.5 font-display font-bold text-white/90"
              >
                {item}
              </span>
            ))}
          </div>
          <div className="flex w-max animate-marquee-rev gap-4 whitespace-nowrap">
            {[...marqueeItems.slice(3), ...marqueeItems.slice(0, 3), ...marqueeItems.slice(3), ...marqueeItems.slice(0, 3)].map(
              (item, i) => (
                <span
                  key={i}
                  className={`rounded-full px-5 py-1.5 font-display font-bold ${i % 3 === 0 ? 'bg-pink text-white' : i % 3 === 1 ? 'bg-teal text-indigo' : 'border-2 border-white/15 bg-white/[0.07] text-white/90'}`}
                >
                  {item}
                </span>
              )
            )}
          </div>
        </div>

        {/* ══ STATS ══════════════════════════════════════════ */}
        <section className="bg-indigo pb-16 pt-10 text-white relative overflow-hidden">
          <div aria-hidden className="absolute inset-0 opacity-[0.06] text-8xl">
            <span className="absolute top-6 left-[8%]">🐿️</span>
            <span className="absolute bottom-2 right-[10%]">🌰</span>
          </div>
          <div className="relative mx-auto max-w-5xl px-4 sm:px-6 grid grid-cols-2 lg:grid-cols-4 gap-5 text-center">
            {[
              { end: 10, suffix: ' days', label: 'of summer day camp across two August weeks' },
              { end: 15, prefix: '£', suffix: ' a day', label: 'with lunch included — pay in advance' },
              { end: 20, suffix: ' places', label: 'a day — first come, first served' },
              { end: 8, suffix: '+', label: 'years old — this camp is for the big kids' },
            ].map((s, i) => (
              <Reveal key={s.label} delay={i * 80} className="zoom">
                <div className="group rounded-blob bg-white/[0.07] border border-white/10 px-4 py-6 backdrop-blur-sm transition-all duration-300 hover:bg-white/[0.14] hover:-translate-y-1">
                  <div className="font-display font-bold text-3xl sm:text-4xl text-teal">
                    <CountUp end={s.end} prefix={'prefix' in s ? s.prefix : ''} suffix={s.suffix} />
                  </div>
                  <div className="mt-1.5 text-sm text-white/65 font-bold">{s.label}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
        <Wave flip className="h-[60px] sm:h-[80px] bg-white" />

        {/* ══ ACTIVITIES ═════════════════════════════════════ */}
        <section id="activities" className="bg-white pb-24 pt-8">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <Reveal>
              <Kicker className="border-pink/40 text-pink -rotate-2">🎪 THE FUN STUFF</Kicker>
              <h2 className="mt-5 text-4xl sm:text-5xl font-bold text-indigo text-center">
                A day here is <span className="hl hl-pink">never</span> boring
              </h2>
              <p className="mt-4 text-center text-lg text-ink/60 max-w-2xl mx-auto">
                Every Chipmunks day mixes farm time, sensory adventures and good old-fashioned fun — all led by
                our brilliant Activity Champions.
              </p>
            </Reveal>
            <div className="mt-14 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
              {site.activities.map((a, i) => {
                const s = activityStyles[i % activityStyles.length];
                return (
                  <Reveal key={a.title} delay={(i % 3) * 90} className={i % 2 ? 'from-right' : 'from-left'}>
                    <TiltCard
                      className={`group h-full rounded-blob bg-mist border border-indigo/5 p-7 shadow-soft ring-0 ring-transparent hover:shadow-lift hover:ring-4 ${s.ring} ${i % 2 ? 'rotate-[0.6deg]' : '-rotate-[0.6deg]'}`}
                    >
                      <span className={`absolute left-0 top-7 bottom-7 w-1.5 rounded-r-full ${s.bar}`} aria-hidden />
                      <div className="flex items-start justify-between">
                        <div
                          className={`flex h-20 w-20 items-center justify-center text-5xl animate-blob transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6 ${s.blob}`}
                        >
                          {a.emoji}
                        </div>
                        <span className={`sticker !border-0 !px-3 !py-1 !text-xs rotate-3 ${s.badge}`}>
                          {['every day', 'fan favourite', 'big energy', 'get messy'][i % 4]}
                        </span>
                      </div>
                      <h3 className="mt-5 text-2xl font-bold text-indigo">{a.title}</h3>
                      <p className="mt-2 text-ink/60 leading-relaxed">{a.blurb}</p>
                    </TiltCard>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* ══ TYPICAL DAY ════════════════════════════════════ */}
        <Wave className="h-[60px] sm:h-[80px] bg-white" />
        <section className="bg-indigo text-white pt-14 pb-20 relative overflow-hidden -mt-px">
          <div aria-hidden className="absolute inset-0 opacity-10">
            <span className="absolute top-10 left-[10%] text-6xl animate-float-slow">🐐</span>
            <span className="absolute bottom-16 right-[8%] text-6xl animate-float">🎨</span>
            <span className="absolute top-1/2 right-[28%] text-5xl animate-float-slow">⚽</span>
          </div>
          <div className="relative mx-auto max-w-4xl px-4 sm:px-6">
            <Reveal>
              <Kicker className="!bg-white/10 border-teal/50 text-teal rotate-1">🗺️ PLAN OF ATTACK</Kicker>
              <h2 className="mt-5 text-4xl sm:text-5xl font-bold text-center">
                What does a <span className="text-teal">Chipmunks day</span> look like?
              </h2>
            </Reveal>
            <div className="mt-14">
              {site.typicalDay.map((step, i) => (
                <Reveal key={step.time} delay={i * 60} className={i % 2 ? 'from-right' : 'from-left'}>
                  <div className="group relative flex gap-6 pb-9 last:pb-0">
                    {i < site.typicalDay.length - 1 && (
                      <svg className="absolute left-[43px] top-[92px] bottom-0 w-2 -translate-x-1/2" aria-hidden>
                        <line x1="4" y1="0" x2="4" y2="100%" stroke="#4BC1B9" strokeWidth="3" strokeLinecap="round" strokeDasharray="1 10" opacity="0.6" />
                      </svg>
                    )}
                    <div className="relative z-10 flex h-[88px] w-[88px] shrink-0 flex-col items-center justify-center rounded-2xl bg-white/10 border border-teal/30 backdrop-blur transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-2">
                      <span className="text-2xl leading-none">{dayEmojis[i]}</span>
                      <span className="mt-1 font-display font-bold text-sm text-teal">{step.time}</span>
                    </div>
                    <div className="pt-3">
                      <h3 className="text-xl font-bold">
                        {step.title}
                        {i === 0 && (
                          <span className="ml-2 rounded-full bg-pink px-2.5 py-0.5 text-xs align-middle">check-in 📋</span>
                        )}
                      </h3>
                      <p className="text-white/65 mt-1">{step.detail}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
        <Wave flip className="h-[60px] sm:h-[80px] bg-duck" />

        {/* ══ DATES — ticket wall ════════════════════════════ */}
        <section id="dates" className="bg-duck pb-24 pt-8 -mt-px">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <Reveal>
              <Kicker className="border-indigo/20 text-indigo rotate-1">🎟️ GRAB A TICKET</Kicker>
              <h2 className="mt-5 text-4xl sm:text-5xl font-bold text-indigo text-center">Summer 2026 dates</h2>
              <p className="mt-4 text-center text-lg text-ink/60">
                £{site.session.pricePerDay} per child per day, lunch included · drop off{' '}
                {site.session.dropOffFrom}, pick up {site.session.endTime}
              </p>
              <p className="mt-2 text-center text-sm font-bold text-pink">
                Payment in advance · no refunds for cancellations · first come, first served
              </p>
            </Reveal>
            {sessions.length === 0 ? (
              <Reveal>
                <p className="mt-10 text-center text-ink/60 text-lg">
                  New dates are being planned — check back soon or email{' '}
                  <a className="text-pink font-bold underline" href={`mailto:${site.contact.email}`}>
                    {site.contact.email}
                  </a>
                  .
                </p>
              </Reveal>
            ) : (
              <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {sessions.map((s, i) => {
                  const left = Math.max(0, s.capacity - (s.booked || 0));
                  const full = left === 0;
                  return (
                    <Reveal key={s.id} delay={(i % 6) * 60} className="zoom">
                      <TiltCard
                        max={5}
                        className={`ticket flex items-stretch rounded-2xl bg-white shadow-soft hover:shadow-lift ${full ? 'opacity-55' : ''} ${i % 2 ? 'rotate-[0.4deg]' : '-rotate-[0.4deg]'}`}
                      >
                        {/* stub */}
                        <div className="flex w-[74px] shrink-0 flex-col items-center justify-center rounded-l-2xl bg-indigo py-4 text-white">
                          <span className="font-display font-bold text-3xl leading-none">{dayNum(s.date)}</span>
                          <span className="mt-0.5 text-xs font-bold uppercase tracking-wider text-teal">
                            {monthShort(s.date)}
                          </span>
                        </div>
                        {/* perforation */}
                        <div className="w-0 border-l-2 border-dashed border-indigo/15" aria-hidden />
                        <div className="flex flex-1 items-center justify-between gap-2 p-4">
                          <div>
                            <div className="font-display font-bold text-indigo">{weekdayLong(s.date)}</div>
                            <div className="text-sm text-ink/55 font-bold">{s.label || 'Day camp'}</div>
                            {s.notes && <div className="text-xs font-bold text-pink mt-0.5">💦 {s.notes}</div>}
                          </div>
                          {full ? (
                            <span className="rounded-full bg-indigo/10 px-3 py-1.5 text-xs font-bold text-indigo/60">
                              FULL
                            </span>
                          ) : (
                            <span
                              className={`rounded-full px-3 py-1.5 text-xs font-bold ${left <= 5 ? 'bg-pink text-white animate-bounce-soft' : 'bg-teal/20 text-indigo'}`}
                            >
                              {left <= 5 ? `Only ${left} left!` : `${left} spaces`}
                            </span>
                          )}
                        </div>
                      </TiltCard>
                    </Reveal>
                  );
                })}
              </div>
            )}
            <Reveal>
              <div className="mt-12 text-center">
                <Link href="/book" className="btn-primary text-xl !px-10 !py-4">
                  Book now — it takes 3 minutes ⏱️
                </Link>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ══ TESTIMONIALS ═══════════════════════════════════ */}
        <section className="bg-white py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <Reveal>
              <Kicker className="border-teal/50 text-indigo -rotate-1">💬 WORD ON THE PLAYGROUND</Kicker>
              <h2 className="mt-5 text-4xl sm:text-5xl font-bold text-indigo text-center">
                What families <span className="hl hl-teal text-pink">tell us</span>
              </h2>
            </Reveal>
            <div className="mt-14 grid gap-10 md:grid-cols-3">
              {site.testimonials.map((t, i) => {
                const looks = [
                  { border: 'border-pink/40', quote: 'text-pink', face: '🧑', tilt: '-rotate-1' },
                  { border: 'border-teal/50', quote: 'text-teal', face: '👩', tilt: 'rotate-1' },
                  { border: 'border-indigo/25', quote: 'text-indigo', face: '👨', tilt: '-rotate-2' },
                ][i % 3];
                return (
                  <Reveal key={t.name} delay={i * 100} className="zoom">
                    <figure className={`h-full ${looks.tilt} transition-transform duration-300 hover:rotate-0 hover:-translate-y-1`}>
                      <blockquote className={`relative rounded-blob border-[3px] bg-mist p-7 shadow-soft ${looks.border}`}>
                        <span className={`font-display text-6xl leading-none ${looks.quote}`} aria-hidden>
                          “
                        </span>
                        <p className="mt-1 text-ink/75 leading-relaxed font-semibold">{t.quote}</p>
                        <span
                          className={`absolute -bottom-[14px] left-10 h-6 w-6 rotate-45 border-b-[3px] border-r-[3px] bg-mist ${looks.border}`}
                          aria-hidden
                        />
                      </blockquote>
                      <figcaption className="mt-7 ml-8 flex items-center gap-3 text-sm font-bold text-ink/55">
                        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-duck text-xl border-2 border-teal/40">
                          {looks.face}
                        </span>
                        {t.name}
                      </figcaption>
                    </figure>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* ══ KIT LIST ═══════════════════════════════════════ */}
        <section className="bg-white pb-24">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <Reveal className="zoom">
              <div className="relative overflow-hidden rounded-blob bg-duck border-[3px] border-teal/40 p-8 sm:p-10">
                <div className="absolute -right-10 -top-10 h-40 w-40 bg-teal/25 animate-blob" aria-hidden />
                <span className="absolute right-8 bottom-6 text-2xl text-pink animate-sparkle" aria-hidden>✦</span>
                <h2 className="relative text-3xl font-bold text-indigo flex items-center gap-3">
                  <span className="text-4xl animate-bounce-soft inline-block">🎒</span> The Chipmunks kit list
                </h2>
                <ul className="relative mt-6 grid sm:grid-cols-2 gap-3">
                  {site.whatToBring.map((item, i) => (
                    <li key={item} className="flex items-center gap-3 font-bold text-ink/75">
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm text-white ${i % 2 ? 'bg-teal' : 'bg-pink'}`}
                      >
                        ✓
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ══ FAQS ═══════════════════════════════════════════ */}
        <section id="faqs" className="py-24 bg-mist">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <Reveal>
              <Kicker className="border-pink/40 text-pink rotate-1">🙋 GOOD QUESTIONS</Kicker>
              <h2 className="mt-5 text-4xl sm:text-5xl font-bold text-indigo text-center">We’ve got you.</h2>
            </Reveal>
            <div className="mt-10 space-y-4">
              {site.faqs.map((f, i) => (
                <Reveal key={f.q} delay={i * 50} className={i % 2 ? 'from-right' : 'from-left'}>
                  <details className="group rounded-2xl bg-white border border-indigo/5 shadow-soft open:shadow-lift open:border-teal/40 transition-all">
                    <summary className="cursor-pointer list-none flex items-center gap-4 p-5 font-display font-bold text-lg text-indigo">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo text-white text-sm font-display group-open:bg-pink transition-colors">
                        {i + 1}
                      </span>
                      <span className="flex-1">{f.q}</span>
                      <span className="shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-pink/10 text-pink transition-transform duration-300 group-open:rotate-45">
                        +
                      </span>
                    </summary>
                    <p className="px-5 pb-5 pl-[72px] text-ink/65 leading-relaxed">{f.a}</p>
                  </details>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ══ FINAL CTA ══════════════════════════════════════ */}
        <section className="mx-auto max-w-6xl px-4 sm:px-6 pt-6">
          <Reveal className="zoom">
            <div className="relative overflow-hidden rounded-blob bg-indigo text-white text-center shadow-lift">
              <div aria-hidden className="absolute inset-0">
                <div className="absolute -left-12 -top-16 h-52 w-52 bg-teal/20 animate-blob" />
                <div className="absolute right-10 top-6 h-8 w-28 rotate-[14deg] rounded-md bg-pink/40 animate-float" />
                <span className="absolute bottom-8 left-10 text-6xl opacity-20 animate-float">🌰</span>
                <span className="absolute top-10 left-[30%] text-2xl text-teal animate-sparkle">✦</span>
                <span className="absolute bottom-16 right-[26%] text-2xl text-pink animate-sparkle [animation-delay:1s]">✦</span>
              </div>
              <div className="relative m-3 rounded-[2rem] border-2 border-dashed border-white/25 p-8 sm:p-14">
                <div className="mx-auto mb-5 w-24 animate-bounce-soft">
                  <Mascot className="w-full" />
                </div>
                <h2 className="text-4xl sm:text-5xl font-bold">
                  Ready for the <span className="text-teal">best school holiday</span> ever?
                </h2>
                <p className="mt-4 text-lg text-white/75 max-w-xl mx-auto">
                  Spaces fill up fast — grab your child’s place at {site.clubName} today. Next stop: the farm!
                </p>
                <div className="mt-8">
                  <Link href="/book" className="btn-primary !text-xl !px-10 !py-4">
                    Book a day at Chipmunks 🐿️
                  </Link>
                </div>
                <p className="mt-6 font-display font-bold text-teal">“{site.tagline}”</p>
              </div>
            </div>
          </Reveal>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
