import { useState } from "react";
import { Link } from "react-router-dom";

const EMAIL = "derbewmolla14@gmail.com";

export default function ContactUs() {
  const [sent, setSent] = useState(false);
  function handleSubmit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const sender = String(form.get("email") || "").trim();
    const subject = String(form.get("subject") || "").trim();
    const message = String(form.get("message") || "").trim();
    const body = `From: ${sender}\n\n${message}`;
    window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  }
  const field = "mt-2 w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-card)] px-4 py-3 text-sm text-[var(--app-text)] placeholder:text-[var(--app-muted)] focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20";
  return (
    <div className="mx-auto max-w-4xl space-y-8 text-[var(--app-text)]">
      <header className="rounded-3xl bg-gradient-to-br from-[#0f1b3d] to-sky-900 p-7 text-white sm:p-10">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-300">We are here to help</p>
        <h1 className="mt-3 text-3xl font-extrabold sm:text-4xl">Contact Ahadu Tech Academy</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-200">Send a question, report an issue or share feedback. Your email application will open with your message prepared for our contact address.</p>
      </header>
      <div className="grid gap-6 md:grid-cols-[1.2fr_.8fr]">
        <section className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-card)] p-6 shadow-sm">
          <h2 className="text-xl font-bold">Send us a message</h2>
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div><label htmlFor="contact-email" className="text-sm font-semibold">Your email</label><input id="contact-email" name="email" type="email" autoComplete="email" required className={field} placeholder="you@example.com" /></div>
            <div><label htmlFor="contact-subject" className="text-sm font-semibold">Subject</label><input id="contact-subject" name="subject" required maxLength={140} className={field} placeholder="How can we help?" /></div>
            <div><label htmlFor="contact-message" className="text-sm font-semibold">Message / details</label><textarea id="contact-message" name="message" required minLength={10} maxLength={5000} rows={6} className={field} placeholder="Please describe your question or issue…" /></div>
            <button type="submit" className="rounded-xl bg-sky-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-sky-500">Prepare email message</button>
          </form>
          {sent && <p role="status" className="mt-4 rounded-xl bg-emerald-500/10 p-3 text-sm text-emerald-600">Your email app should open with the message prepared. Review it and press Send there. If it did not open, email us directly using the address shown.</p>}
          <p className="mt-4 text-xs leading-6 text-[var(--app-muted)]">This form prepares a message in your device's email app; it does not send or store your message on this website.</p>
        </section>
        <aside className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-card)] p-6">
          <h2 className="text-xl font-bold">Direct contact</h2>
          <p className="mt-3 text-sm leading-7 text-[var(--app-muted)]">You can contact the academy directly using these published details.</p>
          <a href="mailto:derbewmolla14@gmail.com" className="mt-4 block break-all font-semibold text-sky-600 hover:underline">derbewmolla14@gmail.com</a>
          <a href="tel:+251924122893" className="mt-4 block text-sm text-[var(--app-text)] hover:text-sky-600">+251 924 12 28 93</a>
          <a href="tel:+251937100547" className="mt-2 block text-sm text-[var(--app-text)] hover:text-sky-600">+251 937 10 05 47</a>
          <div className="mt-6 border-t border-[var(--app-border)] pt-5">
            <p className="text-sm text-[var(--app-muted)]">Need quick guidance?</p>
            <Link to="/faq" className="mt-2 inline-flex text-sm font-semibold text-sky-600 hover:underline">Visit Frequently Asked Questions</Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
