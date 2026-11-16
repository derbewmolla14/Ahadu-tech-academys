import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { apiFetch } from '../api/api';

function toEmbedUrl(value = '') {
  try {
    const url = new URL(value);
    if (url.hostname.includes('youtu.be')) return 'https://www.youtube.com/embed/' + url.pathname.slice(1);
    if (url.hostname.includes('youtube.com')) {
      const id = url.searchParams.get('v');
      return id ? 'https://www.youtube.com/embed/' + id : value;
    }
    return value;
  } catch { return value; }
}

export default function CourseDetail() {
  const { name = '', courseId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('notes');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const response = await apiFetch('content/' + courseId);
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.message || 'Course not found.');
        if (!cancelled) setCourse(result.data);
      } catch (e) {
        if (!cancelled) setError(e.message || 'Unable to load course.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [courseId]);

  const tabs = [
    { id: 'notes', label: 'Notes', count: course?.notes?.length || 0 },
    { id: 'videos', label: 'Videos', count: course?.videos?.length || 0 },
    { id: 'ppts', label: 'PowerPoints', count: course?.ppts?.length || 0 },
    { id: 'questions', label: 'Questions', count: course?.questions?.length || 0 }
  ];

  if (loading) return <div className="p-10 text-center text-slate-400">Loading course materials…</div>;
  if (error || !course) return <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center text-red-300">{error || 'Course not found.'}<button onClick={() => navigate(-1)} className="mt-4 block w-full text-sky-400">Go back</button></div>;

  const fileUrl = path => path?.startsWith('http') ? path : (import.meta.env.VITE_API_URL || 'https://ahadu-tech-academys.onrender.com/api').replace(/\/api\/?$/, '') + path;

  return (
    <div className="space-y-6">
      <header className="rounded-3xl border border-slate-800 bg-slate-900 p-8">
        <button onClick={() => navigate(-1)} className="mb-4 text-sm text-sky-400">← Back to courses</button>
        <h1 className="text-3xl font-semibold text-white">{course.course}</h1>
        <p className="mt-2 text-slate-400">{course.university} · {course.department} · {course.year} · {course.semester}</p>
        {course.description && <p className="mt-4 text-slate-300">{course.description}</p>}
      </header>

      <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
        <div className="flex flex-wrap gap-2 border-b border-slate-700 pb-4">
          {tabs.map(item => <button key={item.id} onClick={() => setTab(item.id)} className={'rounded-lg px-4 py-2 text-sm ' + (tab === item.id ? 'bg-sky-600 text-white' : 'text-slate-400 hover:bg-slate-800')}>{item.label} ({item.count})</button>)}
        </div>
        <div className="mt-6 space-y-4">
          {tab === 'notes' && (course.notes || []).map((item, i) => <div key={i} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-700 bg-slate-800 p-4"><span>{item.title}</span><a className="rounded-lg bg-sky-600 px-4 py-2 text-sm text-white" href={fileUrl(item.fileUrl)} target="_blank" rel="noreferrer">Preview / Download</a></div>)}
          {tab === 'videos' && (course.videos || []).map((item, i) => <div key={i} className="rounded-xl border border-slate-700 bg-slate-800 p-4"><h3 className="mb-3 font-medium">{item.title}</h3><div className="aspect-video overflow-hidden rounded-lg bg-black"><iframe className="h-full w-full" src={toEmbedUrl(item.url)} title={item.title} allowFullScreen /></div></div>)}
          {tab === 'ppts' && (course.ppts || []).map((item, i) => <div key={i} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-700 bg-slate-800 p-4"><span>{item.title}</span><a className="rounded-lg bg-sky-600 px-4 py-2 text-sm text-white" href={fileUrl(item.fileUrl)} target="_blank" rel="noreferrer" download>Download presentation</a></div>)}
          {tab === 'questions' && (course.questions || []).map((item, i) => <div key={i} className="rounded-xl border border-slate-700 bg-slate-800 p-4"><h3 className="font-semibold">{item.question}</h3><p className="mt-2 text-slate-300">{item.answer}</p></div>)}
          {tabs.find(item => item.id === tab)?.count === 0 && <p className="py-8 text-center text-slate-400">No {tab} have been added to this course yet.</p>}
        </div>
      </section>
    </div>
  );
}
