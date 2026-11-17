import { Link } from 'react-router-dom';

const streams = [
  { id: 'natural-science', title: 'Natural Science', description: 'Freshman, Remedial, and Senior natural science learning.', icon: '🔬' },
  { id: 'social-science', title: 'Social Science', description: 'Freshman, Remedial, and Senior social science learning.', icon: '🌍' },
];

export default function UniversityDashboard() {
  return (
    <div className="mx-auto max-w-6xl space-y-8 p-6">
      <section className="rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-xl shadow-slate-950/40">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-400">Ahadu Tech Academy · University</p>
        <h1 className="mt-3 text-3xl font-semibold text-white md:text-4xl">Select Your Stream</h1>
        <p className="mt-3 text-slate-400">Choose Natural or Social Science to continue to your academic level.</p>
      </section>
      <div className="grid gap-5 sm:grid-cols-2">
        {streams.map((stream) => (
          <Link key={stream.id} to={'/university/' + stream.id}
            className="group rounded-3xl border border-slate-800 bg-slate-900 p-8 text-white transition hover:border-sky-500 hover:bg-slate-800">
            <span className="text-4xl" aria-hidden="true">{stream.icon}</span>
            <h2 className="mt-5 text-2xl font-semibold group-hover:text-sky-400">{stream.title}</h2>
            <p className="mt-3 text-slate-400">{stream.description}</p>
            <span className="mt-6 inline-flex text-sm font-semibold text-sky-400">Continue →</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
