import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { apiFetch } from '../api/api';

const categoryName = { Natural: 'Natural Science', Social: 'Social Science' };

export default function DepartmentBrowser() {
  const { name } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const faculty = searchParams.get('faculty') || 'Natural';
  const category = categoryName[faculty] || faculty;
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState(searchParams.get('department') || '');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    async function loadDepartments() {
      try {
        setLoading(true);
        setError('');
        const response = await apiFetch('departments?' + new URLSearchParams({ category }).toString());
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Unable to load departments.');
        if (!Array.isArray(data)) throw new Error('Unexpected departments response.');
        if (active) setDepartments(data.filter(item => item?.isActive === true && item.category === category).map(item => item.name).filter(Boolean));
      } catch (err) {
        if (active) { setDepartments([]); setError(err.message || 'Unable to load departments.'); }
      } finally {
        if (active) setLoading(false);
      }
    }
    loadDepartments();
    return () => { active = false; };
  }, [category]);

  const filteredDepartments = useMemo(
    () => departments.filter(dept => dept.toLowerCase().includes(search.trim().toLowerCase())),
    [departments, search]
  );

  const chooseContentType = (contentType) => {
    const params = new URLSearchParams({
      faculty,
      level: 'Senior',
      department: selectedDepartment,
      contentType
    });
    navigate(`/university/${name}/courses?${params.toString()}`);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-6">
      <section className="rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-xl shadow-slate-950/40">
        <button type="button" onClick={() => navigate(`/university/${name}`)} className="rounded-full border border-slate-700 px-5 py-2 text-sm text-slate-200 hover:border-slate-500">← Back</button>
        <h1 className="mt-5 text-3xl font-semibold text-white">{faculty} · Senior Department Selection</h1>
        <p className="mt-2 text-slate-400">Select your department. You will then see Exit Exam and Course Materials.</p>
      </section>

      {!selectedDepartment ? (
        <section className="space-y-5 rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <div>
            <label htmlFor="department-search" className="mb-2 block text-sm font-medium text-slate-300">Search departments</label>
            <input id="department-search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Search department…" className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-sky-500" />
          </div>
          {loading && <p className="py-8 text-center text-slate-300">Loading active departments…</p>}
          {error && <p role="alert" className="rounded-xl border border-red-800 bg-red-950/40 p-4 text-red-200">{error}</p>}
          {!loading && !error && filteredDepartments.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredDepartments.map(department => (
                <button key={department} type="button" onClick={() => setSelectedDepartment(department)} className="rounded-2xl border border-slate-700 bg-slate-950 p-5 text-left text-white transition hover:border-sky-500 hover:bg-slate-800">
                  <span className="block text-lg font-semibold">{department}</span>
                  <span className="mt-2 block text-sm text-slate-400">{category} · Senior</span>
                  <span className="mt-4 block text-sm font-semibold text-sky-400">Select department →</span>
                </button>
              ))}
            </div>
          )}
          {!loading && !error && !filteredDepartments.length && <p className="rounded-xl border border-slate-800 p-6 text-center text-slate-400">No active departments found. Please contact the administrator.</p>}
        </section>
      ) : (
        <section className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div>
              <p className="text-sm text-slate-400">Selected department</p>
              <h2 className="mt-1 text-xl font-semibold text-white">{selectedDepartment}</h2>
            </div>
            <button type="button" onClick={() => setSelectedDepartment('')} className="rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:border-sky-500">Change department</button>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <button type="button" onClick={() => chooseContentType('exit-exam')} className="rounded-3xl border border-slate-800 bg-slate-900 p-8 text-left text-white transition hover:border-sky-500 hover:bg-slate-800">
              <span className="text-4xl" aria-hidden="true">📝</span>
              <h3 className="mt-5 text-2xl font-semibold">Exit Exam</h3>
              <p className="mt-3 text-slate-400">Access uploaded exit exam questions.</p>
              <span className="mt-6 inline-flex text-sm font-semibold text-sky-400">View Exit Exam →</span>
            </button>
            <button type="button" onClick={() => chooseContentType('course-materials')} className="rounded-3xl border border-slate-800 bg-slate-900 p-8 text-left text-white transition hover:border-sky-500 hover:bg-slate-800">
              <span className="text-4xl" aria-hidden="true">📚</span>
              <h3 className="mt-5 text-2xl font-semibold">Course Materials</h3>
              <p className="mt-3 text-slate-400">Access course lists and PDF, PPT, and video lessons.</p>
              <span className="mt-6 inline-flex text-sm font-semibold text-sky-400">View Course Materials →</span>
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
