import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../api/api';

const categories = [
  { id: 'natural-science', name: 'Natural Science', description: 'Science, biology, chemistry, physics, and related programs.' },
  { id: 'social-science', name: 'Social Science', description: 'Economics, history, sociology, psychology, and related programs.' },
  { id: 'health-science', name: 'Health Science', description: 'Medicine, public health, nursing, and related programs.' },
];

const otherPrograms = [
  { id: 'masters', title: "Master's Degree", description: 'Browse available master’s degree courses.', icon: '🎓' },
  { id: 'phd', title: 'PhD', description: 'Browse available doctoral courses.', icon: '📚' },
];

export default function UniversityDashboard() {
  const [departments, setDepartments] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(categories[0].name);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    let active = true;

    async function loadDepartments() {
      try {
        setLoading(true);
        setError('');
        const response = await apiFetch('departments');
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || 'Unable to load university departments.');
        }
        if (!Array.isArray(result)) {
          throw new Error('The departments API returned an unexpected response.');
        }

        if (active) {
          setDepartments(result.filter((item) =>
            item &&
            item.isActive === true &&
            categories.some((category) => category.name === item.category) &&
            typeof item.name === 'string' &&
            item.name.trim()
          ));
        }
      } catch (err) {
        if (active) {
          setDepartments([]);
          setError(err.message || 'Unable to load university departments.');
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadDepartments();
    return () => { active = false; };
  }, []);

  const selectedCategoryInfo = categories.find((item) => item.name === selectedCategory) || categories[0];
  const visibleDepartments = useMemo(() => {
    const term = search.trim().toLowerCase();
    return departments
      .filter((item) =>
        item.category === selectedCategory &&
        item.name.toLowerCase().includes(term)
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [departments, selectedCategory, search]);

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-6">
      <section className="rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-xl shadow-slate-950/40">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-400">University Learning</p>
        <h1 className="mt-3 text-3xl font-semibold text-white md:text-4xl">Department Directory</h1>
        <p className="mt-3 text-slate-400">
          Select an academic category to display the departments added by the administrator.
        </p>

        <div className="mt-6 flex flex-wrap gap-3" role="tablist" aria-label="University department categories">
          {categories.map((category) => {
            const selected = selectedCategory === category.name;
            const count = departments.filter((item) => item.category === category.name).length;
            return (
              <button
                key={category.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => { setSelectedCategory(category.name); setSearch(''); }}
                className={'rounded-full px-6 py-3 font-medium transition ' + (
                  selected
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                )}
              >
                {category.name}{!loading && <span className="ml-2 text-xs opacity-80">({count})</span>}
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold text-white">{selectedCategoryInfo.name}</h2>
            <p className="mt-1 text-sm text-slate-400">{selectedCategoryInfo.description}</p>
          </div>
          {!loading && !error && (
            <span className="text-sm text-slate-400">{visibleDepartments.length} active department(s)</span>
          )}
        </div>

        <label htmlFor="university-department-search" className="mt-5 block text-sm font-medium text-slate-300">
          Search departments
        </label>
        <input
          id="university-department-search"
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search departments…"
          className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-sky-500"
        />

        {loading && (
          <p className="py-8 text-center text-slate-300">Loading departments…</p>
        )}
        {!loading && error && (
          <p role="alert" className="mt-5 rounded-xl border border-red-800 bg-red-950/40 p-4 text-red-200">
            {error}
          </p>
        )}
        {!loading && !error && visibleDepartments.length > 0 && (
          <div className="mt-4 divide-y divide-slate-800">
            {visibleDepartments.map((department) => (
              <Link
                key={department._id}
                to={'/university/' + selectedCategoryInfo.id + '/senior/' + encodeURIComponent(department.name)}
                className="block py-5 text-white transition hover:text-sky-300"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-lg font-semibold">{department.name}</h3>
                  <span className="text-sm text-sky-400">View academic years →</span>
                </div>
              </Link>
            ))}
          </div>
        )}
        {!loading && !error && visibleDepartments.length === 0 && (
          <p className="py-8 text-center text-slate-400">
            {search.trim()
              ? 'No departments match your search in this category.'
              : 'No active departments are available in this category yet.'}
          </p>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-white">Postgraduate Programs</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          {otherPrograms.map((program) => (
            <Link
              key={program.id}
              to={'/university/' + program.id}
              className="rounded-3xl border border-slate-800 bg-slate-900 p-7 text-white transition hover:border-sky-500 hover:bg-slate-800"
            >
              <span className="text-3xl" aria-hidden="true">{program.icon}</span>
              <h3 className="mt-4 text-xl font-semibold">{program.title}</h3>
              <p className="mt-2 text-slate-400">{program.description}</p>
              <span className="mt-5 inline-flex text-sm font-semibold text-sky-400">Continue →</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
