import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { apiFetch } from '../api/api';

function titleFromSlug(value = '') {
  return value.split('-').filter(Boolean).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

export default function CourseContent() {
  const { name = '' } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const faculty = searchParams.get('faculty') || '';
  const academicLevel = searchParams.get('level') || (faculty === 'Natural' || faculty === 'Social' ? 'Senior Undergraduate' : faculty);
  const department = searchParams.get('department') || '';
  const year = searchParams.get('year') || '';
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!department || !year) {
        setError('Department and academic year are required. Please select them again.');
        setLoading(false);
        return;
      }
      setLoading(true);
      setError('');
      try {
        const params = new URLSearchParams({
          category: 'university',
          university: titleFromSlug(name),
          academicLevel,
          department,
          year
        });
        const response = await apiFetch('content?' + params.toString());
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.message || 'Unable to load course materials.');
        if (!cancelled) setCourses(result.data || []);
      } catch (e) {
        if (!cancelled) setError(e.message || 'Unable to load course materials.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [name, academicLevel, department, year]);

  const visible = courses.filter(course => [course.course, course.courseCode, course.description].some(value => String(value || '').toLowerCase().includes(search.toLowerCase())));

  return (
    <div className="min-h-screen space-y-6 bg-slate-950 p-5 text-white sm:p-8">
      <header className="rounded-3xl border border-slate-800 bg-slate-900 p-7">
        <button type="button" onClick={() => navigate(-1)} className="mb-4 text-sm text-sky-400">← Back to year selection</button>
        <h1 className="text-3xl font-bold">{department} · {year}</h1>
        <p className="mt-2 text-slate-400">{titleFromSlug(name)} · {academicLevel}</p>
        <p className="mt-1 text-sm text-slate-500">Choose a course to open its notes, videos, PowerPoint presentations and questions.</p>
      </header>

      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search courses..." className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-sky-500" />

      {loading && <p className="py-12 text-center text-slate-400">Loading courses…</p>}
      {error && <div role="alert" className="rounded-xl border border-red-800 bg-red-950/50 p-5 text-red-200">{error}</div>}
      {!loading && !error && visible.length === 0 && <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center"><h2 className="text-xl font-semibold">No courses available yet</h2><p className="mt-2 text-slate-400">The administrator has not published courses for this exact university, department, year and academic level.</p></div>}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map(course => (
          <Link key={course._id} to={'/university/' + name + '/course/' + course._id + '?department=' + encodeURIComponent(department) + '&year=' + encodeURIComponent(year) + '&level=' + encodeURIComponent(academicLevel)} className="rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:border-sky-500 hover:bg-slate-800">
            <div className="flex items-start justify-between gap-3"><h2 className="text-xl font-semibold">{course.course}</h2>{course.courseCode && <span className="rounded bg-slate-800 px-2 py-1 text-xs text-slate-300">{course.courseCode}</span>}</div>
            <p className="mt-3 line-clamp-3 text-sm text-slate-400">{course.description || 'Course learning materials'}</p>
            <div className="mt-5 flex flex-wrap gap-3 text-xs text-slate-400"><span>{course.notes?.length || 0} PDFs</span><span>{course.videos?.length || 0} videos</span><span>{course.ppts?.length || 0} presentations</span></div>
            <span className="mt-5 inline-block font-medium text-sky-400">Open course →</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
