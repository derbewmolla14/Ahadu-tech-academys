import { Link } from 'react-router-dom';

const categories = [
  { id: 'foundation', title: 'Foundation Building', description: 'Explore school-level learning resources and build strong foundations.', icon: '📚', to: '/elementary' },
  { id: 'development', title: 'Development Skills', description: 'Learn programming, AI, design, and practical digital skills.', icon: '💻', to: '/coding' },
  { id: 'natural-science', title: 'Natural Science', description: 'Explore Remedial, Freshman, and Senior science departments and courses.', icon: '🔬' },
  { id: 'social-science', title: 'Social Science', description: 'Explore Remedial, Freshman, and Senior social science departments and courses.', icon: '🌍' },
  { id: 'health-science', title: 'Health Science', description: 'Explore Remedial, Freshman, and Senior health science departments and courses.', icon: '🩺' },
  { id: 'masters', title: "Master's Degree", description: 'Browse postgraduate courses and advanced learning resources.', icon: '🎓' },
  { id: 'phd', title: 'PhD', description: 'Explore doctoral learning and research resources.', icon: '📖' },
  { id: 'diploma', title: 'Diploma', description: 'Browse diploma programs and learning materials.', icon: '📘', to: '/university' },
];

export default function UniversityDashboard() {
  return (
    <div className="mx-auto max-w-7xl space-y-8 p-5 sm:p-8">
      <section className="rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-xl shadow-slate-950/40">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-400">University Learning</p>
        <h1 className="mt-3 text-3xl font-semibold text-white md:text-4xl">Choose an Academic Category</h1>
        <p className="mt-3 text-slate-400">Select a category to continue to its academic levels and available courses.</p>
      </section>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <Link
            key={category.id}
            to={category.to || '/university/' + category.id}
            className="group rounded-3xl border border-slate-800 bg-slate-900 p-7 text-white shadow-lg transition duration-200 hover:-translate-y-1 hover:border-sky-500 hover:bg-slate-800 hover:shadow-xl"
          >
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
