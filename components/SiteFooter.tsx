import Link from 'next/link';
import { site } from '@/content/site';
import Wave from '@/components/Wave';

export default function SiteFooter() {
  return (
    <footer className="mt-24">
      <Wave className="h-[70px] sm:h-[90px]" indigo="#362B74" teal="#4BC1B9" />
      <div className="bg-indigo text-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-12 pb-14 grid gap-10 sm:grid-cols-3">
          <div>
            <div className="font-display font-bold text-2xl">
              🐿️ Cherwell Chipmunks
              <span className="block text-sm mt-1">
                <span className="text-white/60">at </span>
                <span className="text-pink">Poss</span>
                <span className="text-white">Abilities</span>
              </span>
            </div>
            <p className="mt-4 text-white/60 text-sm leading-relaxed max-w-xs">{site.strapline}.</p>
            <p className="mt-3 font-display font-bold text-teal">“{site.tagline}”</p>
          </div>
          <div>
            <div className="font-display font-bold text-teal mb-3">Find us</div>
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
            <div className="font-display font-bold text-teal mb-3">Get in touch</div>
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
          © {new Date().getFullYear()} PossAbilities CIC. Made with 💗 for brilliant kids.
        </div>
      </div>
    </footer>
  );
}
