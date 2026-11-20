import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const linkClass = "text-sm text-[var(--app-muted)] transition hover:text-[var(--app-text)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 rounded-sm";

const socialLinks = [
  { href: "https://www.facebook.com/share/1Gno8odoVq/", label: "Facebook", mark: "f" },
  { href: "https://www.linkedin.com/in/molla-hydro-os-dev", label: "LinkedIn", mark: "in" },
  { href: "https://youtu.be/6G3CzmEyZPM?si=Stwdn9uBhoeHHn1x", label: "YouTube", mark: "▶" },
  { href: "https://whatsapp.com/dl/", label: "WhatsApp", mark: "📱" },
  { href: "https://t.me/alluniversity11fastinfo", label: "Telegram", mark: "✈" },
];

function useBrowserLocation() {
  const [location, setLocation] = useState("Location not shared");

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return undefined;

    let active = true;
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        if (!active) return;
        setLocation(`GPS: ${coords.latitude.toFixed(3)}, ${coords.longitude.toFixed(3)}`);
      },
      () => {
        if (active) setLocation("Location not shared");
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 }
    );

    return () => { active = false; };
  }, []);

  return location;
}

export default function Footer() {
  const location = useBrowserLocation();

  return (
    <footer className="mt-auto border-t border-[var(--app-border)] bg-[var(--app-sidebar)] text-[var(--app-text)]">
      <div className="mx-auto grid max-w-6xl gap-9 px-4 py-10 sm:px-6 md:grid-cols-[1fr_1.2fr_1fr] md:items-start">
        <nav aria-label="Useful links">
          <h2 className="text-lg font-semibold">Useful Links</h2>
          <ul className="mt-4 space-y-3">
            <li><Link className={linkClass} to="/contact">Contact Us</Link></li>
            <li><Link className={linkClass} to="/faq">Frequently Asked Questions</Link></li>
            <li><Link className={linkClass} to="/privacy">Privacy Policy</Link></li>
            <li><Link className={linkClass} to="/terms">Terms Of Use</Link></li>
            <li><Link className={linkClass} to="/about">About Us</Link></li>
            <li><Link className={linkClass} to="/login">Login</Link></li>
          </ul>
        </nav>

        <div className="text-center md:border-x md:border-[var(--app-border)] md:px-6">
          <Link to="/" className="inline-flex items-center justify-center gap-3 text-xl font-extrabold tracking-wide text-[var(--app-text)]">
            <span className="text-3xl" aria-hidden="true">🎓</span>
            <span>AHADU <span className="block">TECH ACADEMY</span></span>
          </Link>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[var(--app-muted)]">
            A digital learning space for school, university and coding resources. Explore available courses and build a steady learning routine.
          </p>
          <nav aria-label="Social and community links" className="mt-5 flex flex-wrap justify-center gap-3">
            {socialLinks.map(({ href, label, mark }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                title={label}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--app-border)] bg-[var(--app-card)] text-sm font-bold text-[var(--app-text)] transition hover:-translate-y-0.5 hover:border-sky-500 hover:text-sky-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
              >
                {mark}
              </a>
            ))}
          </nav>
          <p className="mt-5 text-xs text-[var(--app-muted)]">
            © {new Date().getFullYear()} ahadutechacademy.com
          </p>
          <p className="mt-2 text-sm font-medium text-orange-500">Powered by Ahadu Tech Academy</p>
        </div>

        <div>
          <h2 className="text-lg font-semibold">Contact</h2>
          <div className="mt-4 space-y-3 text-sm text-[var(--app-muted)]">
            <p aria-live="polite">📍 {location}</p>
            <a className="block hover:text-[var(--app-text)]" href="tel:+251924122893">📞 +251-924-12-28-93</a>
            <a className="block hover:text-[var(--app-text)]" href="tel:+251937100547">📞 +251-937-10-05-47</a>
            <a className="block break-all font-semibold text-sky-600 hover:text-sky-500 hover:underline" href="mailto:derbewmolla14@gmail.com">✉ derbewmolla14@gmail.com</a>
          </div>
        </div>
      </div>
      <div className="border-t border-[var(--app-border)] px-4 py-4 text-center text-xs text-[var(--app-muted)]">
        All rights reserved.
      </div>
    </footer>
  );
}
