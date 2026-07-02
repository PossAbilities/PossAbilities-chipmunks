import Link from 'next/link';
import { ChipmunksLockup } from '@/components/PossLogo';

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-indigo/5">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 flex items-center justify-between h-[72px]">
        <Link href="/" className="group">
          <ChipmunksLockup />
        </Link>
        <nav className="flex items-center gap-2 sm:gap-6">
          <a href="/#activities" className="hidden sm:block font-bold text-ink/70 hover:text-pink transition-colors">
            Activities
          </a>
          <a href="/#dates" className="hidden sm:block font-bold text-ink/70 hover:text-pink transition-colors">
            Dates
          </a>
          <a href="/#faqs" className="hidden md:block font-bold text-ink/70 hover:text-pink transition-colors">
            FAQs
          </a>
          <Link href="/book" className="btn-primary !px-5 !py-2.5 !text-base">
            Book a day
          </Link>
        </nav>
      </div>
    </header>
  );
}
