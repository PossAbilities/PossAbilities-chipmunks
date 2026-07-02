import Link from 'next/link';
import { site } from '@/content/site';

export default function SiteFooter() {
  return (
    <footer className="bg-ink text-white mt-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14 grid gap-10 sm:grid-cols-3">
        <div>
          <div className="flex items-center gap-2 text-2xl font-display font-extrabold">
            <span>🐿️</span> {site.clubName}
          </div>
          <p className="mt-3 text-white/60 text-sm leading-relaxed max-w-xs">
            {site.strapline}. Run with love by {site.orgName}.
          </p>
        </div>
        <div>
          <div className="font-display font-bold text-sunshine mb-3">Find us</div>
          <p className="text-white/70 text-sm leading-relaxed">
            {site.venue.name}
            <br />
            {site.venue.addressLines.map((l) => (
              <span key={l}>
                {l}
                <br />
              </span>
            ))}
            {site.venue.postcode}
          </p>
        </div>
        <div>
          <div className="font-display font-bold text-sunshine mb-3">Get in touch</div>
          <p className="text-white/70 text-sm leading-relaxed">
            <a className="hover:text-white underline decoration-white/30" href={`mailto:${site.contact.email}`}>
              {site.contact.email}
            </a>
            <br />
            {site.contact.phone}
            <br />
            <a className="hover:text-white underline decoration-white/30" href={site.contact.website}>
              possabilities.org.uk
            </a>
          </p>
          <div className="mt-4 flex gap-4 text-xs text-white/40">
            <Link href="/admin" className="hover:text-white/70">
              Admin
            </Link>
            <Link href="/champion" className="hover:text-white/70">
              Activity Champions
            </Link>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-white/40">
        © {new Date().getFullYear()} {site.orgName}. Made with 🧡 for brilliant kids.
      </div>
    </footer>
  );
}
