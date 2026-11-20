import { Link } from 'react-router-dom';

const linkClass = "text-sm text-[var(--app-muted)] transition hover:text-[var(--app-text)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 rounded-sm";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-[var(--app-border)] bg-[var(--app-sidebar)] text-[var(--app-text)]">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 sm:px-6 md:grid-cols-[1.3fr_1fr_1fr]">
        <div>
          <Link to="/" className="inline-flex items-center gap-2 text-lg font-extrabold tracking-tight text-[var(--app-text)]">
            <span aria-hidden="true">🎓</span> AHADU TECH ACADEMY
          </Link>
          <p className="mt-3 max-w-sm text-sm leading-7 text-[var(--app-muted)]">
            A digital learning space for school, university and coding resources. Explore available courses and build a steady learning routine.
          </p>
        </div>
        <nav aria-label="Useful links">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--app-text)]">Useful Links</h2>
          <ul className="mt-4 space-y-3">
            <li><Link className={linkClass} to="/contact">Contact Us</Link></li>
            <li><Link className={linkClass} to="/faq">Frequently Asked Questions</Link></li>
            <li><Link className={linkClass} to="/privacy">Privacy Policy</Link></li>
            <li><Link className={linkClass} to="/terms">Terms Of Use</Link></li>
            <li><Link className={linkClass} to="/login">Login</Link></li>
          </ul>
        </nav>
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-white">Contact</h2>
          <p className="mt-4 text-sm text-[var(--app-muted)]">Questions or feedback? Email our team.</p>
          <a className="mt-3 inline-flex break-all text-sm font-semibold text-sky-600 hover:text-sky-500 hover:underline" href="mailto:derbewmolla14@gmail.com">derbewmolla14@gmail.com</a>
          <div className="mt-4 space-y-2 text-sm text-slate-300">
            <a className="block hover:text-white" href="tel:+251924122893">+251 924 12 28 93</a>
            <a className="block hover:text-white" href="tel:+251937100547">+251 937 10 05 47</a>
          </div>
        </div>
      </div>
      <div className="border-t border-[var(--app-border)] px-4 py-4 text-center text-xs text-[var(--app-muted)]">
        © {new Date().getFullYear()} Ahadu Tech Academy. All rights reserved.
      </div>
    </footer>
  );
}
