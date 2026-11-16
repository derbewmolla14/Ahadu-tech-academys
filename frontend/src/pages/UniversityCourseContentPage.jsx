import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { apiFetch, apiPath } from '../api/api';

export default function UniversityCourseContentPage() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    async function load() {
      try {
        setLoading(true); setError('');
        const response = await apiFetch('content/' + encodeURIComponent(courseId));
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.message || 'Unable to load this course.');
        if (active) setCourse(result.data);
      } catch (err) { if (active) setError(err.message || 'Unable to load this course.'); }
      finally { if (active) setLoading(false); }
    }
    load();
    return () => { active = false; };
  }, [courseId]);
  const fileUrl = (url) => /^https?:\/\//i.test(url || '') ? url : apiPath(String(url || '').replace(/^\/+/, ''));
  if (loading) return <div className="p-8 text-center text-slate-300">Loading course…</div>;
  if (error || !course) return <div role="alert" className="mx-auto max-w-4xl rounded-2xl border border-red-800 bg-red-950/40 p-6 text-red-200">{error || 'Course not found.'}</div>;
  return (
    <div className="mx-auto max-w-6xl space-y-8 p-6">
      <section className="rounded-3xl border border-slate-800 bg-slate-900 p-8">
        <Link to="/university" className="text-sm text-sky-400 hover:text-sky-300">← University Categories</Link>
        <h1 className="mt-4 text-3xl font-semibold text-white">{course.course}</h1>
        <p className="mt-2 text-slate-400">{course.courseCode ? 'Code: ' + course.courseCode + ' · ' : ''}{course.department} · {course.year}</p>
        {course.description && <p className="mt-4 text-slate-300">{course.description}</p>}
      </section>
      {course.notes?.length > 0 && <MaterialSection title="PDF Notes" items={course.notes} getUrl={(item) => fileUrl(item.fileUrl)} />}
      {course.videos?.length > 0 && <MaterialSection title="Video Lessons" items={course.videos} getUrl={(item) => item.url} />}
      {course.ppts?.length > 0 && <MaterialSection title="PowerPoint Presentations" items={course.ppts} getUrl={(item) => fileUrl(item.fileUrl)} />}
      {!course.notes?.length && !course.videos?.length && !course.ppts?.length && <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-300">No learning materials have been uploaded for this course yet.</div>}
    </div>
  );
}

function MaterialSection({ title, items, getUrl }) {
  return <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6"><h2 className="text-xl font-semibold text-white">{title}</h2><ul className="mt-4 space-y-3">{items.map((item, index) => <li key={index}><a href={getUrl(item)} target="_blank" rel="noreferrer" className="text-sky-400 hover:underline">{item.title || title} ↗</a></li>)}</ul></section>;
}
