import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { apiFetch } from '../api/api';

function titleFromSlug(value = '') {
  return value.split('-').filter(Boolean).map(word => word[0]?.toUpperCase() + word.slice(1)).join(' ');
}
function academicLevel(value) {
  if (value === 'Senior') return 'Senior Undergraduate';
  if (value === 'Masters' || value === 'MBA') return "Master's Degree";
  if (value === 'Doctoral Research' || value === 'Academic Seminar') return 'PhD';
  return value || '';
}

export default function CourseList() {
  const { name = '' } = useParams();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const faculty = searchParams.get('faculty') || searchParams.get('category') || '';
  const level = searchParams.get('level') || searchParams.get('selection') || '';
  const department = searchParams.get('department') || '';
  const year = searchParams.get('year') || '';
  const semester = searchParams.get('semester') || '';

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const params = new URLSearchParams();
        params.set('category', 'university');
        if (name) params.set('university', titleFromSlug(name));
        if (level) params.set('academicLevel', academicLevel(level));
        if (department) params.set('department', department);
        if (year) params.set('year', year);
        if (semester) params.set('semester', semester);
        const response = await apiFetch('content?' + params.toString());
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.message || 'Unable to load courses.');
        if (!cancelled) setCourses(result.data || []);
      } catch (e) {
        if (!cancelled) setError(e.message || 'Unable to load courses.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [name, level, department, year, semester]);

  const visibleCourses = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return courses;
    return courses.filter(course =>
      [course.course, course.courseCode, course.description, course.department].some(value => String(value || '').toLowerCase().includes(term))
    );
  }, [courses, searchTerm]);

  const heading = department ? department + (year ? ' · ' + year : '') : academicLevel(level) || 'University Courses';

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-xl">
        <h1 className="text-3xl font-semibold text-white">{heading}</h1>
        <p className="mt-2 text-slate-400">Published courses from {titleFromSlug(name)}.</p>
        <div className="mt-5 flex flex-wrap gap-2 text-sm text-slate-300">
          {department && <span className="rounded-full bg-slate-800 px-3 py-1">{department}</span>}
          {year && <span className="rounded-full bg-slate-800 px-3 py-1">{year}</span>}
          {semester && <span className="rounded-full bg-slate-800 px-3 py-1">{semester}</span>}
        </div>
        <button type="button" onClick={() => window.history.back()} className="mt-5 rounded-full border border-slate-700 px-5 py-2 text-sm text-slate-200 hover:border-sky-500">← Back</button>
      </section>

      <section className="rounded-3xl border border-slate-800 bg-slate-900 p-5">
        <input value={searchTerm} onChange={event => setSearchTerm(event.target.value)} placeholder="Search published courses..." className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-sky-500" />
      </section>

      {loading && <p className="p-8 text-center text-slate-400">Loading published courses…</p>}
      {error && <div role="alert" className="rounded-xl border border-red-800 bg-red-950/50 p-4 text-red-200">{error}</div>}
      {!loading && !error && !visibleCourses.length && <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-300">No published courses match this academic selection yet.</div>}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {visibleCourses.map(course => (
          <Link key={course._id} to={'/university/' + name + '/course/' + course._id + '?department=' + encodeURIComponent(course.department || '') + '&year=' + encodeURIComponent(course.year || '') + '&level=' + encodeURIComponent(course.academicLevel || '')} className="rounded-3xl border border-slate-800 bg-slate-900 p-6 transition hover:border-sky-500 hover:bg-slate-800">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-xl font-semibold text-white">{course.course}</h2>
              {course.courseCode && <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">{course.courseCode}</span>}
            </div>
            <p className="mt-3 line-clamp-3 text-sm text-slate-400">{course.description || 'Learning materials and resources for this course.'}</p>
            <div className="mt-5 flex flex-wrap gap-2 text-xs text-slate-400">
              <span>{course.notes?.length || 0} notes</span><span>·</span><span>{course.videos?.length || 0} videos</span><span>·</span><span>{course.ppts?.length || 0} presentations</span>
            </div>
            <span className="mt-5 inline-block font-medium text-sky-400">Open course →</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
