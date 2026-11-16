import { Link } from 'react-router-dom';

const categories = [
  { id: 'natural-science', title: 'Natural Science', description: 'Explore Remedial, Freshman, and Senior science courses.', icon: '🔬' },
  { id: 'social-science', title: 'Social Science', description: 'Explore Remedial, Freshman, and Senior social science courses.', icon: '🌍' },
  { id: 'health-science', title: 'Health Science', description: 'Explore Remedial, Freshman, and Senior health science courses.', icon: '🩺' },
  { id: 'masters', title: "Master's Degree", description: 'Browse available master’s degree courses.', icon: '🎓' },
  { id: 'phd', title: 'PhD', description: 'Browse available doctoral courses.', icon: '📚' },
];

export default function UniversityDashboard() {
  return (
    <div className="mx-auto max-w-6xl space-y-8 p-6">
      <section className="rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-xl shadow-slate-950/40">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-400">University Learning</p>
        <h1 className="mt-3 text-3xl font-semibold text-white md:text-4xl">Choose an Academic Category</h1>
        <p className="mt-3 text-slate-400">Select a category to view the courses available in the academy. No university selection is required.</p>
      </section>
      <div className="grid gap-5 sm:grid-cols-2">
        {categories.map((category) => (
          <Link key={category.id} to={'/university/' + category.id} className="group rounded-3xl border border-slate-800 bg-slate-900 p-8 text-white transition hover:border-sky-500 hover:bg-slate-800">
            <span className="text-4xl" aria-hidden="true">{category.icon}</span>
            <h2 className="mt-5 text-2xl font-semibold group-hover:text-sky-400">{category.title}</h2>
            <p className="mt-3 text-slate-400">{category.description}</p>
            <span className="mt-6 inline-flex text-sm font-semibold text-sky-400">Continue →</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
