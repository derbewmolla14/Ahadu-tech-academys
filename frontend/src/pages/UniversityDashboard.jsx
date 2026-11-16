import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../api/api';

const categories = [
  { id: 'natural-science', name: 'Natural Science', description: 'Science, biology, chemistry, physics, and related programs.', icon: '🔬' },
  { id: 'social-science', name: 'Social Science', description: 'Economics, history, sociology, psychology, and related programs.', icon: '🌍' },
  { id: 'health-science', name: 'Health Science', description: 'Medicine, public health, nursing, and related programs.', icon: '🩺' },
];

const otherPrograms = [
  { id: 'masters', title: "Master's Degree", description: 'Browse available master’s degree courses.', icon: '🎓' },
  { id: 'phd', title: 'PhD', description: 'Browse available doctoral courses.', icon: '📚' },
];

export default function UniversityDashboard() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    let active = true;

    async function loadDepartments() {
      try {
        setLoading(true);
        setError('');
        // The public endpoint returns active departments from every category.
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

  const groupedDepartments = useMemo(() => {
    const term = search.trim().toLowerCase();
    return categories.map((category) => ({
      ...category,
      departments: departments
        .filter((item) =>
          item.category === category.name &&
          item.name.toLowerCase().includes(term)
        )
        .sort((a, b) => a.name.localeCompare(b.name)),
    }));
  }, [departments, search]);

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-6">
      <section className="rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-xl shadow-slate-950/40">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-400">University Learning</p>
        <h1 className="mt-3 text-3xl font-semibold text-white md:text-4xl">University Departments</h1>
        <p className="mt-3 text-slate-400">
          Browse all active departments added by the administrator. Choose a department to view its available academic years and courses.
        </p>
        <label htmlFor="university-department-search" className="mt-6 block text-sm font-medium text-slate-300">
          Search departments
        </label>
        <input
          id="university-department-search"
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by department name…"
          className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-sky-500"
        />
        {!loading && !error && (
          <p className="mt-2 text-sm text-slate-400">
            {groupedDepartments.reduce((total, category) => total + category.departments.length, 0)} active departments available
          </p>
        )}
      </section>

      {loading && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-300">
          Loading university departments…
        </div>
      )}

      {!loading && error && (
        <div role="alert" className="rounded-2xl border border-red-800 bg-red-950/40 p-6 text-red-200">
          {error}
        </div>
      )}

      {!loading && !error && groupedDepartments.map((category) => (
        <section key={category.id} className="space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="flex items-center gap-3">
              <span className="text-3xl" aria-hidden="true">{category.icon}</span>
              <div>
                <h2 className="text-2xl font-semibold text-white">{category.name}</h2>
                <p className="mt-1 text-sm text-slate-400">{category.description}</p>
              </div>
            </div>
            <p className="mt-3 text-sm text-sky-400">{category.departments.length} active department(s)</p>
          </div>

          {category.departments.length ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {category.departments.map((department) => (
                <Link
                  key={department._id}
                  to={'/university/' + category.id + '/senior/' + encodeURIComponent(department.name)}
                  className="rounded-2xl border border-slate-800 bg-slate-900 p-6 text-white transition hover:border-sky-500 hover:bg-slate-800"
                >
                  <h3 className="text-lg font-semibold">{department.name}</h3>
                  <p className="mt-2 text-sm text-slate-400">View academic years and available courses</p>
                  <span className="mt-4 inline-flex text-sm font-semibold text-sky-400">Open department →</span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="rounded-2xl border border-dashed border-slate-700 p-6 text-center text-slate-400">
              {search.trim() ? 'No departments match your search in this category.' : 'No active departments are available in this category yet.'}
            </p>
          )}
        </section>
      ))}

      {!loading && !error && (
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
      )}
    </div>
  );
}
