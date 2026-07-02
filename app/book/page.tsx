import type { Metadata } from 'next';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import BookingForm from '@/components/BookingForm';
import { listSessions } from '@/lib/db';
import { site } from '@/content/site';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: `Book a day — ${site.clubName} at ${site.orgName}`,
};

export default function BookPage() {
  const sessions = listSessions({ upcomingOnly: true, activeOnly: true }).map((s) => ({
    id: s.id,
    date: s.date,
    label: s.label,
    spacesLeft: Math.max(0, s.capacity - (s.booked || 0)),
  }));

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 sm:px-6 py-10 sm:py-14">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-indigo">Book a day at Chipmunks</h1>
          <p className="mt-3 text-lg text-ink/60">
            One form per child — it takes about 3 minutes. £{site.session.pricePerDay} per day,{' '}
            {site.session.startTime}–{site.session.endTime}.
          </p>
        </div>
        <div className="mt-10">
          <BookingForm sessions={sessions} />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
