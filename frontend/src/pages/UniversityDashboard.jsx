import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

const universityList = [
  'Addis Ababa University',
  'Bahir Dar University',
  'Gondar University',
  'Jimma University',
  'Mekelle University',
  'Wollo University',
  'Woldia University',
  'Debre Berhan University',
  'Debre Markos University',
  'Hawassa University',
  'Adama Science and Technology University',
  'Bule Hora University',
  'Arba Minch University',
  'Haramaya University',
  'Dire Dawa University',
  'Dilla University',
  'Debre Tabor University',
  'Axum University',
  'Wolaita Sodo University',
  'Hawassa University of Technology',
];

function buildSlug(name) {
  return name.toLowerCase().replace(/\s+/g, '-');
}

export default function UniversityDashboard() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filteredUniversities = useMemo(() => {
    return universityList.filter((university) => university.toLowerCase().includes(search.toLowerCase()));
  }, [search]);

  return (
    <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
      <aside className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl shadow-slate-950/50">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-sky-400">University System</p>
            <h1 className="mt-3 text-3xl font-semibold text-white">University Dashboard</h1>
          </div>
          <button
            type="button"
            onClick={() => setMenuOpen((current) => !current)}
            className="rounded-full bg-slate-800 p-3 text-xl text-slate-300 transition hover:bg-slate-700"
            aria-label="Browse Universities"
          >
            ⋮
          </button>
        </div>

        {menuOpen ? (
          <div className="mt-6 rounded-3xl border border-slate-800 bg-slate-950/80 p-4">
            <h2 className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-400">Browse Universities</h2>
            <div className="mt-4 flex items-center gap-3 rounded-3xl border border-slate-800 bg-slate-900 px-4 py-3">
              <span className="text-slate-500">🔍</span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search universities"
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
              />
            </div>
            <div className="mt-4 max-h-[320px] space-y-2 overflow-y-auto pr-2">
              {filteredUniversities.length ? (
                filteredUniversities.map((university) => (
                  <Link
                    key={university}
                    to={`/university/${buildSlug(university)}`}
                    className="block rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-200 transition hover:border-sky-500 hover:bg-slate-800"
                  >
                    {university}
                  </Link>
                ))
              ) : (
                <div className="rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-500">No universities found.</div>
              )}
            </div>
          </div>
        ) : null}

        <div className="mt-8 rounded-3xl border border-slate-800 bg-slate-950/80 p-5">
          <h2 className="text-lg font-semibold text-white">How it works</h2>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Search and select a university, then choose your academic path and level to view course materials.
          </p>
        </div>
      </aside>

      <section className="space-y-6">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-10 shadow-xl shadow-slate-950/40">
          <h2 className="text-3xl font-semibold text-white">Browse Ethiopian Universities</h2>
          <p className="mt-3 text-slate-400">Tap any university to continue to the academic selection and course list.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="rounded-full border border-slate-700 px-5 py-3 text-sm text-slate-200 transition hover:border-slate-500"
            >
              ← Back
            </button>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {universityList.map((university) => (
            <Link
              key={university}
              to={`/university/${buildSlug(university)}`}
              className="group rounded-3xl border border-slate-800 bg-slate-900 p-8 text-white transition hover:border-sky-500 hover:bg-slate-800"
            >
              <h3 className="text-2xl font-semibold group-hover:text-sky-400">{university}</h3>
              <p className="mt-3 text-slate-400">Select this university to explore academic programs.</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
