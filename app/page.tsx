import Link from 'next/link';
import { site } from '@/content/site';
import { listSessions, formatDateShort, formatDateLong } from '@/lib/db';
import Reveal from '@/components/Reveal';
import Chipmunk from '@/components/Chipmunk';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';

export const dynamic = 'force-dynamic';

const cardColors: Record<string, string> = {
  brand: 'bg-brand/10 text-brand-deep',
  leaf: 'bg-leaf/10 text-leaf',
  sky: 'bg-sky/10 text-sky',
  acorn: 'bg-acorn/10 text-acorn',
  sunshine: 'bg-sunshine/20 text-acorn',
};

export default function HomePage() {
  const sessions = listSessions({ upcomingOnly: true, activeOnly: true });

  return (
    <>
      <SiteHeader />
      <main>
        {/* ── Hero ─────────────────────────────────────────── */}
        <section className="relative overflow-hidden">
          {/* floating background blobs */}
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-brand/10 animate-float-slow" />
            <div className="absolute top-40 -right-20 h-56 w-56 rounded-full bg-sunshine/25 animate-float" />
            <div className="absolute bottom-0 left-1/3 h-40 w-40 rounded-full bg-leaf/10 animate-float-slow" />
            <span className="absolute top-24 left-[12%] text-4xl animate-float">🍂</span>
            <span className="absolute top-52 right-[18%] text-3xl animate-float-slow">🌰</span>
            <span className="absolute bottom-24 left-[8%] text-3xl animate-float">🌻</span>
          </div>

          <div className="relative mx-auto max-w-6xl px-4 sm:px-6 pt-14 pb-20 sm:pt-20 sm:pb-28 grid lg:grid-cols-[1.2fr_1fr] gap-12 items-center">
            <div>
              <Reveal>
                <span className="inline-flex items-center gap-2 rounded-full bg-sunshine/30 border border-sunshine px-4 py-1.5 font-bold text-sm text-ink">
                  ☀️ School holidays, ages {site.session.ageRange}
                </span>
              </Reveal>
              <Reveal delay={100}>
                <h1 className="mt-5 text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.02] text-brand-deep">
                  Big adventures.
                  <br />
                  <span className="text-acorn">Muddy wellies.</span>
                  <br />
                  Happy chipmunks.
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
                  {site.venue.name}, {site.venue.addressLines[0]}
                </p>
              </Reveal>
            </div>
            <Reveal delay={200} className="hidden lg:block">
              <div className="relative">
                <div className="absolute inset-6 rounded-full bg-sunshine/30 blur-2xl" aria-hidden />
                <Chipmunk className="relative w-full max-w-md mx-auto animate-float" />
              </div>
            </Reveal>
          </div>

          {/* wave divider */}
          <svg viewBox="0 0 1440 90" className="block w-full text-white" preserveAspectRatio="none" aria-hidden>
            <path
              fill="currentColor"
              d="M0,48 C240,90 480,6 720,30 C960,54 1200,84 1440,42 L1440,90 L0,90 Z"
            />
          </svg>
        </section>

        {/* ── Activities ───────────────────────────────────── */}
        <section id="activities" className="bg-white pb-20 pt-4">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <Reveal>
              <h2 className="text-4xl sm:text-5xl font-extrabold text-brand-deep text-center">
                A day at Chipmunks is <span className="text-acorn">never</span> boring
              </h2>
              <p className="mt-4 text-center text-lg text-ink/60 max-w-2xl mx-auto">
                Every day mixes farm time, sensory adventures and good old-fashioned fun — all led by our
                brilliant Activity Champions.
              </p>
            </Reveal>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {site.activities.map((a, i) => (
                <Reveal key={a.title} delay={i * 80}>
                  <div className="group h-full rounded-blob bg-cream border border-ink/5 p-7 shadow-soft transition-all duration-300 hover:shadow-lift hover:-translate-y-1.5 hover:rotate-[0.5deg]">
                    <div
                      className={`inline-flex h-16 w-16 items-center justify-center rounded-2xl text-4xl transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6 ${cardColors[a.color] || cardColors.brand}`}
                    >
                      {a.emoji}
                    </div>
                    <h3 className="mt-4 text-2xl font-bold text-ink">{a.title}</h3>
                    <p className="mt-2 text-ink/60 leading-relaxed">{a.blurb}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── Typical day ──────────────────────────────────── */}
        <section className="bg-brand-deep text-white py-20 relative overflow-hidden">
          <div aria-hidden className="absolute inset-0 opacity-10">
            <span className="absolute top-10 left-[10%] text-6xl">🐐</span>
            <span className="absolute bottom-16 right-[8%] text-6xl">🎨</span>
            <span className="absolute top-1/2 right-[30%] text-5xl">⚽</span>
          </div>
          <div className="relative mx-auto max-w-4xl px-4 sm:px-6">
            <Reveal>
              <h2 className="text-4xl sm:text-5xl font-extrabold text-center">
                What does a <span className="text-sunshine">Chipmunks day</span> look like?
              </h2>
            </Reveal>
            <div className="mt-14 space-y-0">
              {site.typicalDay.map((step, i) => (
                <Reveal key={step.time} delay={i * 60}>
                  <div className="relative flex gap-6 pb-8 last:pb-0">
                    {/* timeline rail */}
                    {i < site.typicalDay.length - 1 && (
                      <span className="absolute left-[43px] top-12 bottom-0 w-1 rounded bg-white/15" aria-hidden />
                    )}
                    <div className="relative z-10 flex h-[88px] w-[88px] shrink-0 flex-col items-center justify-center rounded-2xl bg-white/10 border border-white/15 backdrop-blur">
                      <span className="font-display font-extrabold text-sunshine">{step.time}</span>
                    </div>
                    <div className="pt-3">
                      <h3 className="text-xl font-bold">{step.title}</h3>
                      <p className="text-white/65 mt-1">{step.detail}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── Upcoming dates ───────────────────────────────── */}
        <section id="dates" className="py-20 bg-cream">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <Reveal>
              <h2 className="text-4xl sm:text-5xl font-extrabold text-brand-deep text-center">Upcoming dates</h2>
              <p className="mt-4 text-center text-lg text-ink/60">
                £{site.session.pricePerDay} per child per day · {site.session.startTime}–{site.session.endTime} · drop-off
                from {site.session.dropOffFrom}
              </p>
            </Reveal>
            {sessions.length === 0 ? (
              <Reveal>
                <p className="mt-10 text-center text-ink/60 text-lg">
                  New dates are being planned — check back soon or email{' '}
                  <a className="text-brand font-bold underline" href={`mailto:${site.contact.email}`}>
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
                        className={`flex items-center justify-between gap-3 rounded-2xl border bg-white p-5 shadow-soft transition-all duration-300 hover:shadow-lift hover:-translate-y-1 ${full ? 'opacity-60 border-ink/10' : 'border-brand/15'}`}
                      >
                        <div>
                          <div className="font-display font-extrabold text-lg text-ink">{formatDateShort(s.date)}</div>
                          <div className="text-sm text-ink/55 font-bold">{s.label || 'Holiday club day'}</div>
                        </div>
                        {full ? (
                          <span className="rounded-full bg-ink/10 px-3 py-1.5 text-xs font-extrabold text-ink/60">
                            FULL
                          </span>
                        ) : (
                          <span
                            className={`rounded-full px-3 py-1.5 text-xs font-extrabold ${left <= 5 ? 'bg-acorn/15 text-acorn' : 'bg-leaf/15 text-leaf'}`}
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

        {/* ── What to bring ────────────────────────────────── */}
        <section className="bg-white py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <Reveal>
              <div className="rounded-blob bg-leaf/10 border border-leaf/20 p-8 sm:p-10">
                <h2 className="text-3xl font-extrabold text-leaf flex items-center gap-3">
                  <span className="text-4xl">🎒</span> The Chipmunks kit list
                </h2>
                <ul className="mt-6 grid sm:grid-cols-2 gap-3">
                  {site.whatToBring.map((item) => (
                    <li key={item} className="flex items-center gap-3 font-bold text-ink/75">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-leaf text-white text-sm">
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

        {/* ── FAQs ─────────────────────────────────────────── */}
        <section id="faqs" className="py-20 bg-cream">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <Reveal>
              <h2 className="text-4xl sm:text-5xl font-extrabold text-brand-deep text-center">
                Questions? We’ve got you.
              </h2>
            </Reveal>
            <div className="mt-10 space-y-4">
              {site.faqs.map((f, i) => (
                <Reveal key={f.q} delay={i * 50}>
                  <details className="group rounded-2xl bg-white border border-ink/5 shadow-soft open:shadow-lift transition-shadow">
                    <summary className="cursor-pointer list-none flex items-center justify-between gap-4 p-5 font-display font-bold text-lg text-ink">
                      {f.q}
                      <span className="shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-brand/10 text-brand transition-transform duration-300 group-open:rotate-45">
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

        {/* ── Final CTA ────────────────────────────────────── */}
        <section className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <div className="relative overflow-hidden rounded-blob bg-brand text-white p-10 sm:p-16 text-center shadow-lift">
              <div aria-hidden className="absolute inset-0 opacity-15">
                <span className="absolute -top-4 left-8 text-7xl animate-float-slow">🌰</span>
                <span className="absolute bottom-2 right-10 text-7xl animate-float">🍂</span>
              </div>
              <h2 className="relative text-4xl sm:text-5xl font-extrabold">
                Ready for the best school holiday ever?
              </h2>
              <p className="relative mt-4 text-lg text-white/80 max-w-xl mx-auto">
                Spaces fill up fast — grab your child’s place at {site.clubName} today. Next stop: the farm!
              </p>
              <div className="relative mt-8">
                <Link
                  href="/book"
                  className="btn bg-sunshine text-ink px-10 py-4 text-xl font-extrabold shadow-lift hover:-translate-y-1 hover:bg-white transition-all"
                >
                  Book a day at Chipmunks 🐿️
                </Link>
              </div>
            </div>
          </Reveal>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
