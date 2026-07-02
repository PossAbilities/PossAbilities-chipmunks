import Link from 'next/link';
import { site } from '@/content/site';
import { listSessions, formatDateShort } from '@/lib/db';
import Reveal from '@/components/Reveal';
import Chipmunk from '@/components/Chipmunk';
import Wave from '@/components/Wave';
import { PossMark } from '@/components/PossLogo';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';

export const dynamic = 'force-dynamic';

const activityStyles = [
  { chip: 'bg-pink/10', ring: 'group-hover:ring-pink/30', bar: 'bg-pink' },
  { chip: 'bg-teal/15', ring: 'group-hover:ring-teal/40', bar: 'bg-teal' },
  { chip: 'bg-indigo/10', ring: 'group-hover:ring-indigo/30', bar: 'bg-indigo' },
  { chip: 'bg-plum/10', ring: 'group-hover:ring-plum/30', bar: 'bg-plum' },
];

const marqueeItems = [
  '🐐 Farm animals',
  '✨ Immersive room',
  '🎨 Arts & crafts',
  '⚽ Games galore',
  '🌱 Growing & nature',
  '🧁 Snacks & baking',
  '🐿️ New friends',
];

export default function HomePage() {
  const sessions = listSessions({ upcomingOnly: true, activeOnly: true });

  return (
    <>
      <SiteHeader />
      <main>
        {/* ══ HERO ═══════════════════════════════════════════ */}
        <section className="relative overflow-hidden bg-white">
          {/* floating brand shapes — echoes of the PossAbilities logo */}
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="absolute -top-20 -left-24 h-64 w-64 rounded-full bg-teal/15 animate-float-slow" />
            <div className="absolute top-36 right-[6%] h-24 w-24 rounded-full bg-teal/25 animate-float" />
            <div className="absolute top-16 right-[26%] h-10 w-32 rotate-[14deg] rounded-md bg-pink/15 animate-float-slow" />
            <div className="absolute bottom-40 left-[4%] h-8 w-24 rotate-[14deg] rounded-md bg-pink/20 animate-float" />
            <div className="absolute bottom-56 right-[40%] h-14 w-14 rounded-full bg-indigo/10 animate-float-slow" />
          </div>

          <div className="relative mx-auto max-w-6xl px-4 sm:px-6 pt-12 pb-8 sm:pt-16 grid lg:grid-cols-[1.15fr_1fr] gap-10 items-center">
            <div>
              <Reveal>
                <span className="inline-flex items-center gap-2 rounded-full bg-duck border border-teal/40 px-4 py-1.5 font-bold text-sm text-indigo">
                  ☀️ School holidays · ages {site.session.ageRange} · {site.venue.addressLines[1] ?? 'Heywood'}
                </span>
              </Reveal>
              <Reveal delay={100}>
                <h1 className="mt-5 text-5xl sm:text-6xl lg:text-[4.4rem] font-bold leading-[1.03] text-indigo">
                  School holidays,
                  <br />
                  the <span className="relative text-pink">
                    Chipmunks
                    <svg viewBox="0 0 220 12" className="absolute -bottom-2 left-0 w-full" aria-hidden>
                      <path d="M3 9 C60 2 160 2 217 8" stroke="#4BC1B9" strokeWidth="5" strokeLinecap="round" fill="none" />
                    </svg>
                  </span>
                  <br />
                  way.
                </h1>
              </Reveal>
              <Reveal delay={200}>
                <p className="mt-6 text-lg sm:text-xl text-ink/70 leading-relaxed max-w-xl">{site.intro}</p>
              </Reveal>
              <Reveal delay={300}>
                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <Link href="/book" className="btn-primary text-xl !px-9 !py-4">
                    Book your child’s place →
                  </Link>
                  <a href="#activities" className="btn-secondary">
                    See what we get up to
                  </a>
                </div>
              </Reveal>
              <Reveal delay={400}>
                <p className="mt-5 text-sm font-bold text-ink/50">
                  {site.session.startTime}–{site.session.endTime} · £{site.session.pricePerDay} per day ·{' '}
                  {site.venue.name}
                </p>
              </Reveal>
            </div>

            {/* mascot in a logo-style composition */}
            <Reveal delay={200} className="hidden lg:block">
              <div className="relative mx-auto w-full max-w-md">
                <div className="absolute right-6 top-2 h-72 w-72 rounded-full bg-teal/90" aria-hidden />
                <div className="absolute left-16 top-10 h-64 w-16 rotate-[14deg] rounded-lg bg-pink/90 shadow-pink" aria-hidden />
                <Chipmunk className="relative z-10 w-[88%] mx-auto animate-float drop-shadow-xl" />
                <div className="absolute -bottom-3 right-2 z-20 rounded-2xl bg-white shadow-lift px-4 py-2.5 font-display font-bold text-indigo animate-float-slow">
                  “{site.tagline}” 💬
                </div>
              </div>
            </Reveal>
          </div>

          {/* signature wave into the ticker */}
          <Wave className="h-[70px] sm:h-[100px]" drift />
        </section>

        {/* ══ TICKER ═════════════════════════════════════════ */}
        <div className="bg-indigo overflow-hidden py-3.5 -mt-px" aria-hidden>
          <div className="flex w-max animate-marquee gap-10 whitespace-nowrap font-display font-bold text-white/90">
            {[...marqueeItems, ...marqueeItems].map((item, i) => (
              <span key={i} className="flex items-center gap-10">
                {item}
                <span className="text-pink text-xl leading-none">●</span>
              </span>
            ))}
          </div>
        </div>

        {/* ══ STATS ══════════════════════════════════════════ */}
        <section className="bg-indigo pb-14 pt-10 text-white relative overflow-hidden">
          <div aria-hidden className="absolute inset-0 opacity-[0.06] text-8xl">
            <span className="absolute top-6 left-[8%]">🐿️</span>
            <span className="absolute bottom-2 right-[10%]">🌰</span>
          </div>
          <div className="relative mx-auto max-w-5xl px-4 sm:px-6 grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            {[
              ['6 hours', 'of non-stop fun, every day'],
              ['20 places', 'a day, so no one gets lost in a crowd'],
              ['1 farm', 'full of animals to meet & feed'],
              ['100%', 'run by trained Activity Champions'],
            ].map(([big, small], i) => (
              <Reveal key={big} delay={i * 80}>
                <div className="rounded-blob bg-white/[0.07] border border-white/10 px-4 py-6 backdrop-blur-sm hover:bg-white/[0.12] transition-colors">
                  <div className="font-display font-bold text-3xl sm:text-4xl text-teal">{big}</div>
                  <div className="mt-1.5 text-sm text-white/65 font-bold">{small}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
        <Wave flip className="h-[60px] sm:h-[80px] bg-white" indigo="#362B74" teal="#4BC1B9" />

        {/* ══ ACTIVITIES ═════════════════════════════════════ */}
        <section id="activities" className="bg-white pb-20 pt-10">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <Reveal>
              <div className="flex items-center justify-center gap-3">
                <PossMark className="h-12 w-auto" />
                <h2 className="text-4xl sm:text-5xl font-bold text-indigo text-center">
                  A day here is <span className="text-pink">never</span> boring
                </h2>
              </div>
              <p className="mt-4 text-center text-lg text-ink/60 max-w-2xl mx-auto">
                Every Chipmunks day mixes farm time, sensory adventures and good old-fashioned fun — all led by
                our brilliant Activity Champions.
              </p>
            </Reveal>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {site.activities.map((a, i) => {
                const s = activityStyles[i % activityStyles.length];
                return (
                  <Reveal key={a.title} delay={(i % 3) * 80}>
                    <div
                      className={`group relative h-full overflow-hidden rounded-blob bg-mist border border-indigo/5 p-7 shadow-soft ring-0 ring-transparent transition-all duration-300 hover:shadow-lift hover:-translate-y-1.5 hover:ring-4 ${s.ring}`}
                    >
                      <span className={`absolute left-0 top-7 bottom-7 w-1.5 rounded-r-full ${s.bar}`} aria-hidden />
                      <div
                        className={`inline-flex h-16 w-16 items-center justify-center rounded-2xl text-4xl transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6 ${s.chip}`}
                      >
                        {a.emoji}
                      </div>
                      <h3 className="mt-4 text-2xl font-bold text-indigo">{a.title}</h3>
                      <p className="mt-2 text-ink/60 leading-relaxed">{a.blurb}</p>
                    </div>
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
            <span className="absolute top-10 left-[10%] text-6xl">🐐</span>
            <span className="absolute bottom-16 right-[8%] text-6xl">🎨</span>
            <span className="absolute top-1/2 right-[30%] text-5xl">⚽</span>
          </div>
          <div className="relative mx-auto max-w-4xl px-4 sm:px-6">
            <Reveal>
              <h2 className="text-4xl sm:text-5xl font-bold text-center">
                What does a <span className="text-teal">Chipmunks day</span> look like?
              </h2>
            </Reveal>
            <div className="mt-14">
              {site.typicalDay.map((step, i) => (
                <Reveal key={step.time} delay={i * 60}>
                  <div className="relative flex gap-6 pb-8 last:pb-0">
                    {i < site.typicalDay.length - 1 && (
                      <span className="absolute left-[43px] top-12 bottom-0 w-1 rounded bg-teal/25" aria-hidden />
                    )}
                    <div className="relative z-10 flex h-[88px] w-[88px] shrink-0 flex-col items-center justify-center rounded-2xl bg-white/10 border border-teal/30 backdrop-blur">
                      <span className="font-display font-bold text-teal">{step.time}</span>
                    </div>
                    <div className="pt-3">
                      <h3 className="text-xl font-bold">
                        {step.title}
                        {i === 0 && <span className="ml-2 rounded-full bg-pink px-2.5 py-0.5 text-xs align-middle">check-in 📋</span>}
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

        {/* ══ DATES ══════════════════════════════════════════ */}
        <section id="dates" className="bg-duck pb-20 pt-8 -mt-px">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <Reveal>
              <h2 className="text-4xl sm:text-5xl font-bold text-indigo text-center">Upcoming dates</h2>
              <p className="mt-4 text-center text-lg text-ink/60">
                £{site.session.pricePerDay} per child per day · {site.session.startTime}–{site.session.endTime} ·
                drop-off from {site.session.dropOffFrom}
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
              <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {sessions.map((s, i) => {
                  const left = Math.max(0, s.capacity - (s.booked || 0));
                  const full = left === 0;
                  return (
                    <Reveal key={s.id} delay={(i % 6) * 60}>
                      <div
                        className={`flex items-center justify-between gap-3 rounded-2xl border-2 bg-white p-5 shadow-soft transition-all duration-300 hover:shadow-lift hover:-translate-y-1 ${full ? 'opacity-60 border-indigo/10' : 'border-white hover:border-teal/50'}`}
                      >
                        <div>
                          <div className="font-display font-bold text-lg text-indigo">{formatDateShort(s.date)}</div>
                          <div className="text-sm text-ink/55 font-bold">{s.label || 'Holiday club day'}</div>
                        </div>
                        {full ? (
                          <span className="rounded-full bg-indigo/10 px-3 py-1.5 text-xs font-bold text-indigo/60">
                            FULL
                          </span>
                        ) : (
                          <span
                            className={`rounded-full px-3 py-1.5 text-xs font-bold ${left <= 5 ? 'bg-pink/15 text-pink' : 'bg-teal/20 text-indigo'}`}
                          >
                            {left <= 5 ? `Only ${left} left!` : `${left} spaces`}
                          </span>
                        )}
                      </div>
                    </Reveal>
                  );
                })}
              </div>
            )}
            <Reveal>
              <div className="mt-12 text-center">
                <Link href="/book" className="btn-primary text-xl !px-10 !py-4">
                  Book now — it takes 3 minutes
                </Link>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ══ TESTIMONIALS ═══════════════════════════════════ */}
        <section className="bg-white py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <Reveal>
              <h2 className="text-4xl sm:text-5xl font-bold text-indigo text-center">
                What families <span className="text-pink">tell us</span>
              </h2>
            </Reveal>
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              {site.testimonials.map((t, i) => {
                const accents = ['border-pink/30 text-pink', 'border-teal/40 text-teal', 'border-indigo/20 text-indigo'];
                return (
                  <Reveal key={t.name} delay={i * 100}>
                    <figure className="h-full">
                      <blockquote
                        className={`relative rounded-blob border-2 bg-mist p-7 shadow-soft ${accents[i % 3].split(' ')[0]}`}
                      >
                        <span className={`font-display text-6xl leading-none ${accents[i % 3].split(' ')[1]}`} aria-hidden>
                          “
                        </span>
                        <p className="mt-1 text-ink/75 leading-relaxed font-semibold">{t.quote}</p>
                        {/* speech-bubble tail */}
                        <span
                          className={`absolute -bottom-3 left-10 h-6 w-6 rotate-45 border-b-2 border-r-2 bg-mist ${accents[i % 3].split(' ')[0]}`}
                          aria-hidden
                        />
                      </blockquote>
                      <figcaption className="mt-6 ml-10 text-sm font-bold text-ink/50">— {t.name}</figcaption>
                    </figure>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* ══ KIT LIST ═══════════════════════════════════════ */}
        <section className="bg-white pb-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <Reveal>
              <div className="relative overflow-hidden rounded-blob bg-duck border border-teal/30 p-8 sm:p-10">
                <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-teal/20" aria-hidden />
                <h2 className="relative text-3xl font-bold text-indigo flex items-center gap-3">
                  <span className="text-4xl">🎒</span> The Chipmunks kit list
                </h2>
                <ul className="relative mt-6 grid sm:grid-cols-2 gap-3">
                  {site.whatToBring.map((item) => (
                    <li key={item} className="flex items-center gap-3 font-bold text-ink/75">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-pink text-white text-sm">
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
        <section id="faqs" className="py-20 bg-mist">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <Reveal>
              <h2 className="text-4xl sm:text-5xl font-bold text-indigo text-center">Questions? We’ve got you.</h2>
            </Reveal>
            <div className="mt-10 space-y-4">
              {site.faqs.map((f, i) => (
                <Reveal key={f.q} delay={i * 50}>
                  <details className="group rounded-2xl bg-white border border-indigo/5 shadow-soft open:shadow-lift transition-shadow">
                    <summary className="cursor-pointer list-none flex items-center justify-between gap-4 p-5 font-display font-bold text-lg text-indigo">
                      {f.q}
                      <span className="shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-pink/10 text-pink transition-transform duration-300 group-open:rotate-45">
                        +
                      </span>
                    </summary>
                    <p className="px-5 pb-5 text-ink/65 leading-relaxed">{f.a}</p>
                  </details>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ══ FINAL CTA ══════════════════════════════════════ */}
        <section className="mx-auto max-w-6xl px-4 sm:px-6 pt-6">
          <Reveal>
            <div className="relative overflow-hidden rounded-blob bg-indigo text-white text-center shadow-lift">
              <div aria-hidden className="absolute inset-0">
                <div className="absolute -left-10 -top-14 h-48 w-48 rounded-full bg-teal/20 animate-float-slow" />
                <div className="absolute right-10 top-6 h-8 w-28 rotate-[14deg] rounded-md bg-pink/40 animate-float" />
                <span className="absolute bottom-6 left-10 text-6xl opacity-20 animate-float">🌰</span>
              </div>
              <div className="relative p-10 sm:p-16">
                <h2 className="text-4xl sm:text-5xl font-bold">Ready for the best school holiday ever?</h2>
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
              <Wave className="h-[50px] opacity-60" drift />
            </div>
          </Reveal>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
