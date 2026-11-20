import { Link } from "react-router-dom";

const questions = [
  ["How do I start learning?", "Open Home and choose Elementary, High School, University or Coding. Select the grade, department, year or course options that are available, then open a lesson or resource."],
  ["Do I need an account?", "You can explore public areas without signing in. An account is needed for account-based features such as your dashboard, profile and other learner tools."],
  ["How do I create an account or sign in?", "Use Register to create an account with your name, email and password. Use Login with the same registered email and password to access your account."],
  ["I cannot sign in. What should I check?", "Check your email spelling, password and internet connection. If your session has expired, sign in again. If you forgot your password, use the Forgot password link on the Login page."],
  ["How does password recovery work?", "The recovery page supports an email reset link and a Telegram one-time code for accounts that have linked Telegram. Check your spam folder for email. Email links expire after one hour; Telegram codes are single-use and valid for 60 seconds."],
  ["Can I study offline in the Android app?", "The app includes an offline study-material library for supported materials that have been saved or made available offline. Not every course or resource is necessarily available offline. Connect to the internet to sign in, load new content and check updates."],
  ["How do I update the Android app?", "Open Settings and visit App & Web Updates to check for available updates. Web bundle updates can be delivered over the air. Updates requiring native Android code or permissions need a separately published app installation."],
  ["Where can I change my theme or language?", "After signing in, open Dashboard Settings. Use Appearance to select Light, Dark or System default, and Language to select your available language preference."],
  ["Are all courses, subjects and progress tools available to everyone?", "Availability depends on what has been published and enabled for each learning area or account. The options shown in the platform are the best guide to currently available content."],
  ["Who teaches the courses?", "Course authors, instructors or mentors are identified with individual course materials when that information is provided. The academy does not claim unverified instructor identities or credentials."],
  ["How do I contact the academy?", "Email derbewmolla14@gmail.com or use the Contact Us page. The contact form prepares a message in your email application for you to review and send."]
];

export default function FAQ() {
  return (
    <div className="mx-auto max-w-4xl space-y-7 text-[var(--app-text)]">
      <header className="rounded-3xl bg-gradient-to-br from-[#0f1b3d] to-sky-900 p-7 text-white sm:p-10">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-300">Help centre</p>
        <h1 className="mt-3 text-3xl font-extrabold sm:text-4xl">Frequently Asked Questions</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-200">Clear answers to common questions about courses, accounts, password recovery, offline learning and app updates.</p>
      </header>
      <section className="space-y-3" aria-label="Frequently asked questions">
        {questions.map(([question, answer], index) => (
          <details key={question} className="group rounded-2xl border border-[var(--app-border)] bg-[var(--app-card)] p-5 shadow-sm" open={index === 0}>
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold"><span>{question}</span><span aria-hidden="true" className="text-sky-600 transition group-open:rotate-45">＋</span></summary>
            <p className="mt-4 border-t border-[var(--app-border)] pt-4 text-sm leading-7 text-[var(--app-muted)]">{answer}</p>
          </details>
        ))}
      </section>
      <p className="text-sm text-[var(--app-muted)]">Still need help? <Link className="font-semibold text-sky-600 hover:underline" to="/contact">Contact the academy</Link>.</p>
    </div>
  );
}
