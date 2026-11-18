import { useContext, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { apiFetch } from '../api/api';
import { AuthContext } from '../context/AuthContext';
import PaymentMethodModal from '../components/PaymentMethodModal';

export default function HighSchoolGradePage() {
  const { id } = useParams();
  const { user, language } = useContext(AuthContext);
  const selectedLanguage = String(language || user?.preferences?.language || 'en').trim().toLowerCase();
  const isAmharic = ['am', 'amharic', 'አማርኛ'].includes(selectedLanguage);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloadResource, setDownloadResource] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    async function loadCourses() {
      setLoading(true);
      setError('');
      try {
        const params = new URLSearchParams({ level: 'highschool', grade: String(id) });
        if (isAmharic) params.set('language', 'am');
        const response = await apiFetch('content?' + params.toString(), { signal: controller.signal });
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.message || 'Unable to load High School courses.');
        if (!controller.signal.aborted) setCourses(Array.isArray(result.data) ? result.data : []);
      } catch (err) {
        if (!controller.signal.aborted) setError(err.message || 'Unable to load courses.');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    loadCourses();
    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') loadCourses();
    };
    window.addEventListener('focus', refreshWhenVisible);
    document.addEventListener('visibilitychange', refreshWhenVisible);
    return () => {
      controller.abort();
      window.removeEventListener('focus', refreshWhenVisible);
      document.removeEventListener('visibilitychange', refreshWhenVisible);
    };
  }, [id, isAmharic]);

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-5 text-white">
      <PaymentMethodModal open={Boolean(downloadResource)} resource={downloadResource} onClose={() => setDownloadResource(null)} />
      <header className="rounded-3xl border border-slate-800 bg-slate-900 p-8">
        <Link to="/highschool" className="text-sm text-sky-400 hover:underline">← All High School grades</Link>
        <h1 className="mt-4 text-3xl font-bold">High School — Grade {id}</h1>
        <p className="mt-2 text-slate-400">Published courses and learning materials for this grade.</p>
      </header>
      {loading && <p className="rounded-xl border border-slate-800 bg-slate-900 p-6 text-center text-slate-300">Loading courses…</p>}
      {error && <p role="alert" className="rounded-xl border border-red-800 bg-red-950/40 p-4 text-red-200">{error}</p>}
      {!loading && !error && courses.length === 0 && <p className="rounded-xl border border-slate-800 bg-slate-900 p-6 text-slate-400">No published courses are available for Grade {id} yet.</p>}
      {!loading && courses.length > 0 && <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <div key={course._id} role="button" tabIndex={0} onClick={() => { if (course.isPremium && !course.hasAccess) setDownloadResource({ title: course.course, type: 'course materials', accessType: 'premium' }); else window.location.assign(`/university/course/${course._id}`); }} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); if (course.isPremium && !course.hasAccess) setDownloadResource({ title: course.course, type: 'course materials', accessType: 'premium' }); else window.location.assign(`/university/course/${course._id}`); } }} className="cursor-pointer rounded-2xl border border-slate-800 bg-slate-900 p-5 transition hover:border-sky-500">
            <p className="text-xs font-semibold uppercase tracking-widest text-sky-400">{course.subject || course.department || 'High School'}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2"><h2 className="text-xl font-semibold">{course.course}</h2>{course.isPremium && <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-300">🔒 PREMIUM</span>}{course.isPremium && course.hasAccess && <span className="rounded-full bg-green-500/10 px-2.5 py-1 text-xs font-bold text-green-300">✓ UNLOCKED</span>}</div>
            {course.description && <p className="mt-2 line-clamp-3 text-sm text-slate-400">{course.description}</p>}
            <p className="mt-4 text-sm text-sky-400">{course.isPremium && !course.hasAccess ? '🔒 View payment options →' : 'Open course materials →'}</p>
          </div>
        ))}
      </section>}
    </main>
  );
}
