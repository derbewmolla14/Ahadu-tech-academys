import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { apiFetch } from '../api/api';

const configById = {
  'natural-science': { faculty: 'Natural Science', title: 'Natural Science', stages: ['Remedial', 'Freshman', 'Senior'] },
  'social-science': { faculty: 'Social Science', title: 'Social Science', stages: ['Remedial', 'Freshman', 'Senior'] },
  'health-science': { faculty: 'Health Science', title: 'Health Science', stages: ['Remedial', 'Freshman', 'Senior'] },
  masters: { faculty: "Master's Degree", title: "Master's Degree", stages: [] },
  phd: { faculty: 'PhD', title: 'PhD', stages: [] },
};
const decodeSegment = (value) => { try { return decodeURIComponent(value || ''); } catch { return value || ''; } };

export default function UniversityLearningPage() {
  const { faculty: routeFaculty } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const categoryId = routeFaculty || decodeSegment(location.pathname.split('/').filter(Boolean)[1]);
  const config = configById[categoryId];
  const parts = location.pathname.split('/').filter(Boolean).slice(2);
  const rawStage = decodeSegment(parts[0]);
  const stage = ({ remedial: 'Remedial', freshman: 'Freshman', senior: 'Senior' })[rawStage.toLowerCase()] || rawStage;
  const department = decodeSegment(parts[1]);
  const contentType = decodeSegment(parts[2]);
  const [allCourses, setAllCourses] = useState([]);
  const [configuredDepartments, setConfiguredDepartments] = useState([]);
  const [departmentLoading, setDepartmentLoading] = useState(true);
  const [departmentError, setDepartmentError] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [departmentSearch, setDepartmentSearch] = useState('');

  useEffect(() => {
    let active = true;
    async function loadDepartments() {
      if (!config) { setDepartmentError('Academic category not found.'); setDepartmentLoading(false); return; }
      try {
        setDepartmentLoading(true);
        setDepartmentError('');
        const response = await apiFetch('departments?' + new URLSearchParams({ category: config.faculty }).toString());
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Unable to load departments.');
        if (!Array.isArray(result)) throw new Error('The departments API returned an unexpected response.');
        if (active) setConfiguredDepartments(result.filter(item => item && item.isActive === true && item.category === config.faculty).map(item => item.name).filter(Boolean));
      } catch (err) {
        if (active) { setConfiguredDepartments([]); setDepartmentError(err.message || 'Unable to load departments.'); }
      } finally { if (active) setDepartmentLoading(false); }
    }
    loadDepartments();
    return () => { active = false; };
  }, [categoryId]);

  useEffect(() => {
    let active = true;
    async function loadCourses() {
      if (!config) { setError('Academic category not found.'); setLoading(false); return; }
      try {
        setLoading(true); setError('');
        const response = await apiFetch('content?' + new URLSearchParams({ level: 'university', faculty: config.faculty }).toString());
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.message || 'Unable to load courses.');
        if (active) setAllCourses(Array.isArray(result.data) ? result.data : []);
      } catch (err) {
        if (active) { setAllCourses([]); setError(err.message || 'Unable to load courses.'); }
      } finally { if (active) setLoading(false); }
    }
    loadCourses();
    return () => { active = false; };
  }, [categoryId]);

  const stageCourses = useMemo(() => config && config.stages.length === 0 ? allCourses : allCourses.filter(course => (course.studyStage || course.year) === stage), [allCourses, config, stage]);
  const departments = useMemo(() => configuredDepartments.slice().sort((a, b) => a.localeCompare(b)), [configuredDepartments]);
  const visibleDepartments = useMemo(() => departments.filter(name => name.toLowerCase().includes(departmentSearch.trim().toLowerCase())), [departments, departmentSearch]);
  const courses = useMemo(() => {
    let result = stageCourses;
    if (stage === 'Senior' && department) result = result.filter(course => course.department === department);
    if (stage === 'Senior' && contentType) result = result.filter(course => (course.contentType || 'course-materials') === contentType);
    const term = search.trim().toLowerCase();
    if (term) result = result.filter(course => [course.course, course.courseCode, course.department, course.year, course.description].some(value => String(value || '').toLowerCase().includes(term)));
    return result;
  }, [stageCourses, stage, department, contentType, search]);

  if (!config) return <div className="mx-auto max-w-4xl rounded-3xl border border-slate-800 bg-slate-900 p-8 text-white">Academic category not found.</div>;
  const listVisible = !config.stages.length || stage === 'Remedial' || stage === 'Freshman' || (stage === 'Senior' && department && contentType);
  const heading = !stage ? config.title : stage === 'Senior' ? (contentType === 'exit-exam' ? department + ' · Exit Exam' : contentType === 'course-materials' ? department + ' · Course Materials' : department || 'Senior Departments') : config.title + ' · ' + stage;
  const basePath = '/university/' + categoryId + '/senior';
  const categoryCards = [
    { id: 'exit-exam', title: 'Exit Exam', description: 'Practice and review administrator-uploaded exit exam questions.', icon: '📝' },
    { id: 'course-materials', title: 'Course Materials', description: 'Open PDF notes, PowerPoint presentations, and video lessons.', icon: '📚' },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-6">
      <section className="rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-xl shadow-slate-950/40">
        <Link to="/university" className="text-sm text-sky-400 hover:text-sky-300">← All University Categories</Link>
        <h1 className="mt-4 text-3xl font-semibold text-white">{heading}</h1>
        <p className="mt-2 text-slate-400">{stage === 'Senior' ? (!department ? 'Select your department.' : !contentType ? 'Choose Exit Exam or Course Materials.' : 'Courses uploaded for this department and category are shown below.') : 'Courses published by the administrator are shown here.'}</p>
        <div className="mt-5 flex flex-wrap gap-3">
          {stage && <button type="button" onClick={() => navigate('/university/' + categoryId)} className="rounded-full border border-slate-700 px-5 py-2 text-sm text-slate-200">← Back to category</button>}
          {stage === 'Senior' && department && <button type="button" onClick={() => navigate(basePath)} className="rounded-full border border-slate-700 px-5 py-2 text-sm text-slate-200">← Departments</button>}
          {stage === 'Senior' && contentType && <button type="button" onClick={() => navigate(basePath + '/' + encodeURIComponent(department))} className="rounded-full border border-slate-700 px-5 py-2 text-sm text-slate-200">← Content types</button>}
        </div>
      </section>
      {loading && <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-300">Loading university courses…</div>}
      {!loading && error && <div role="alert" className="rounded-2xl border border-red-800 bg-red-950/40 p-6 text-red-200">{error}</div>}
      {!stage && config.stages.length > 0 && <div className="grid gap-5 sm:grid-cols-3">{config.stages.map(item => <button key={item} type="button" onClick={() => navigate('/university/' + categoryId + '/' + item.toLowerCase())} className="rounded-3xl border border-slate-800 bg-slate-900 p-8 text-left text-white transition hover:border-sky-500 hover:bg-slate-800"><h2 className="text-2xl font-semibold">{item}</h2><p className="mt-3 text-slate-400">{item === 'Senior' ? 'Browse departments.' : 'Open available courses directly.'}</p></button>)}</div>}
      {stage === 'Senior' && !department && departmentLoading && <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 text-center text-slate-300">Loading active departments…</div>}
      {stage === 'Senior' && !department && !departmentLoading && departmentError && <div role="alert" className="rounded-2xl border border-red-800 bg-red-950/40 p-6 text-red-200">{departmentError}</div>}
      {!departmentLoading && !departmentError && stage === 'Senior' && !department && (departments.length ? <>
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <label htmlFor="department-search" className="mb-2 block text-sm font-medium text-slate-300">Search departments</label>
          <input id="department-search" value={departmentSearch} onChange={event => setDepartmentSearch(event.target.value)} placeholder="Search department name…" className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-sky-500" />
          <p className="mt-2 text-sm text-slate-400">{visibleDepartments.length} active departments</p>
        </section>
        <div className="divide-y divide-slate-800 rounded-2xl border border-slate-800 bg-slate-900 px-5">
          {visibleDepartments.map(item => <button key={item} type="button" onClick={() => navigate(basePath + '/' + encodeURIComponent(item))} className="flex w-full items-center justify-between gap-4 py-5 text-left text-white transition hover:text-sky-300"><span><span className="block text-lg font-semibold">{item}</span><span className="mt-1 block text-sm text-slate-400">{config.faculty} · Active</span></span><span className="shrink-0 text-sm font-medium text-sky-400">Select department →</span></button>)}
        </div>
      </> : <Empty message="No active departments are configured for this category yet." />)}
      {stage === 'Senior' && department && !contentType && <div className="grid gap-5 sm:grid-cols-2">{categoryCards.map(item => <button key={item.id} type="button" onClick={() => navigate(basePath + '/' + encodeURIComponent(department) + '/' + item.id)} className="rounded-3xl border border-slate-800 bg-slate-900 p-8 text-left text-white transition hover:border-sky-500 hover:bg-slate-800"><span className="text-4xl">{item.icon}</span><h2 className="mt-5 text-2xl font-semibold">{item.title}</h2><p className="mt-3 text-slate-400">{item.description}</p><span className="mt-6 inline-flex text-sm font-semibold text-sky-400">Continue →</span></button>)}</div>}
      {!loading && !error && listVisible && <>
        <section className="rounded-3xl border border-slate-800 bg-slate-900 p-5">
          <label htmlFor="university-course-search" className="mb-2 block text-sm font-medium text-slate-300">Search by course name, code, department, or keyword</label>
          <input id="university-course-search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Search university courses…" className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-sky-500" />
          <p className="mt-2 text-sm text-slate-400">{courses.length} course(s) found</p>
        </section>
        {courses.length ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{courses.map(course => <Link key={course._id} to={'/university/course/' + course._id} className="group rounded-3xl border border-slate-800 bg-slate-900 p-6 text-white shadow-lg transition duration-200 hover:-translate-y-1 hover:border-sky-500 hover:bg-slate-800 hover:shadow-xl"><div className="flex items-center justify-between gap-3"><p className="text-xs font-semibold uppercase tracking-widest text-sky-400">{course.courseCode || course.department}</p>{course.isPremium && <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300">🔒 Premium</span>}</div><h2 className="mt-3 line-clamp-2 text-xl font-bold leading-snug group-hover:text-sky-300">{course.course || 'Untitled course'}</h2><p className="mt-2 text-sm text-slate-400">{course.year && course.year !== 'All Years' ? course.year : 'Available to all academic years'}</p>{course.description && <p className="mt-2 text-sm text-slate-400">{course.description}</p>}<p className="mt-4 text-sm font-semibold text-sky-400">{course.isPremium ? 'View premium access →' : 'Open free course →'}</p></Link>)}</div> : <Empty message="No courses match this selection yet." />}
      </>}
    </div>
  );
}

function Empty({ message }) { return <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-300">{message}</div>; }
