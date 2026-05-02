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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filteredUniversities = useMemo(() => {
    return universityList.filter((university) => university.toLowerCase().includes(search.toLowerCase()));
  }, [search]);

  return (
    <div className="min-h-screen bg-slate-950">
      {/* HAMBURGER MENU BUTTON - Top Left Corner */}
      <button
        type="button"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-6 left-6 z-50 rounded-lg bg-slate-800 p-3 text-2xl text-white shadow-lg transition hover:bg-slate-700 lg:hidden"
        aria-label="Toggle menu"
      >
        ☰
      </button>

      {/* SIDEBAR - Fixed positioning, slides from left */}
      <aside className={`fixed left-0 top-0 z-40 h-full w-80 transform bg-slate-900 shadow-2xl transition-transform duration-300 ease-in-out lg:translate-x-0 lg:shadow-none ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex h-full flex-col p-6">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-sky-400">University System</p>
              <h1 className="mt-3 text-2xl font-semibold text-white">University Dashboard</h1>
            </div>
            {/* Close button for mobile */}
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="rounded-full bg-slate-800 p-2 text-xl text-slate-300 transition hover:bg-slate-700 lg:hidden"
              aria-label="Close menu"
            >
              ✕
            </button>
          </div>

          {/* Browse Universities Section */}
          <div className="mt-8 rounded-3xl border border-slate-800 bg-slate-950/80 p-4">
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
                    onClick={() => setSidebarOpen(false)} // Close sidebar on mobile after selection
                  >
                    {university}
                  </Link>
                ))
              ) : (
                <div className="rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-500">No universities found.</div>
              )}
            </div>
          </div>

          {/* How it works section */}
          <div className="mt-8 rounded-3xl border border-slate-800 bg-slate-950/80 p-5">
            <h2 className="text-lg font-semibold text-white">How it works</h2>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Search and select a university, then choose your academic path and level to view course materials.
            </p>
          </div>
        </div>
      </aside>

      {/* OVERLAY for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* MAIN CONTENT */}
      <main className="lg:ml-80 pr-0 mt-0">
        <section className="space-y-6 pt-6 pr-0 pb-6 pl-6 lg:pt-8 lg:pr-0 lg:pb-8 lg:pl-8">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 pr-0 shadow-xl shadow-slate-950/40">
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
    </main>
    </div>
  );
}
