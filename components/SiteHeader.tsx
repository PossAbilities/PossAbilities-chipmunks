import Link from 'next/link';
import { site } from '@/content/site';

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 bg-cream/85 backdrop-blur border-b border-ink/5">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2.5 group">
          <span className="text-3xl group-hover:animate-wiggle inline-block">🐿️</span>
          <span className="font-display font-extrabold text-xl text-brand-deep leading-none">
            {site.clubName}
            <span className="block text-[11px] font-body font-bold text-ink/50 tracking-wide uppercase">
              at {site.orgName}
            </span>
          </span>
        </Link>
        <nav className="flex items-center gap-2 sm:gap-5">
          <a href="/#activities" className="hidden sm:block font-bold text-ink/70 hover:text-brand transition-colors">
            Activities
          </a>
          <a href="/#dates" className="hidden sm:block font-bold text-ink/70 hover:text-brand transition-colors">
            Dates
          </a>
          <a href="/#faqs" className="hidden md:block font-bold text-ink/70 hover:text-brand transition-colors">
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
