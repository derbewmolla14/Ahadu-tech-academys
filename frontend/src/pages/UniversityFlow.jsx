import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '../api/api';

const initial = { stream: '', level: '', department: '', course: '', kind: '', academicYear: '' };

export default function UniversityFlow() {
  const [selection, setSelection] = useState(initial);
  const [history, setHistory] = useState([]);
  const [catalog, setCatalog] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [courseSearch, setCourseSearch] = useState('');

  const load = useCallback(async (next) => {
    if (!next.stream) { setCatalog({}); return; }
    const params = new URLSearchParams();
    Object.entries(next).forEach(([key, value]) => { if (value) params.set(key, value); });
    setLoading(true); setError('');
    try {
      const response = await apiFetch('university-learning/catalog?' + params.toString());
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Unable to load learning content.');
      setCatalog(data);
    } catch (err) { setError(err.message); setCatalog({}); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(selection); }, [selection, load]);

  const move = (patch) => {
    setHistory((items) => [...items, selection]);
    setSelection((current) => ({ ...current, ...patch }));
  };
  const back = () => {
    if (!history.length) return;
    setSelection(history[history.length - 1]);
    setHistory((items) => items.slice(0, -1));
  };
  const reset = () => { setHistory([]); setSelection(initial); };

  const heading = selection.academicYear ? selection.academicYear + ' Exam Questions'
    : selection.kind === 'exit-exam' ? 'Exit Exam'
    : selection.kind === 'course-material' ? 'Course Materials'
    : selection.course ? selection.course
    : selection.department ? selection.department
    : selection.level || 'Choose a stream';

  const choose = (label, onClick, description = '') => (
    <button key={label} onClick={onClick} className="rounded-2xl border border-slate-700 bg-slate-900 p-5 text-left text-white transition hover:border-sky-500 hover:bg-slate-800">
      <span className="block text-lg font-semibold">{label}</span>
      {description && <span className="mt-1 block text-sm text-slate-400">{description}</span>}
    </button>
  );

  const resources = catalog.resources || [];
  return (
    <main className="mx-auto min-h-[70vh] max-w-6xl space-y-6 p-5 text-white sm:p-8">
      <header className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><p className="text-sm font-semibold uppercase tracking-widest text-sky-400">Ahadu Tech Academy</p><h1 className="mt-2 text-3xl font-bold">University Learning</h1></div>
          <button onClick={reset} className="rounded-lg border border-slate-700 px-4 py-2 text-sm">Start over</button>
        </div>
        <p className="mt-3 text-slate-400">{heading}</p>
        <div className="mt-4 flex gap-2">
          <button onClick={back} disabled={!history.length} className="rounded-lg bg-slate-800 px-4 py-2 text-sm disabled:opacity-40">← Back</button>
          <span className="self-center text-xs text-slate-500">{[selection.stream, selection.level, selection.department, selection.course, selection.kind, selection.academicYear].filter(Boolean).join(' / ')}</span>
        </div>
      </header>

      {error && <p role="alert" className="rounded-xl border border-red-800 bg-red-950 p-4 text-red-200">{error}</p>}
      {loading && <p className="py-8 text-center text-slate-400">Loading approved content…</p>}

      {!loading && !selection.stream && <section className="grid gap-4 sm:grid-cols-2">{['Natural', 'Social', 'Health', 'Diploma'].map((stream) => choose(stream, () => move({ stream })))}</section>}
      {!loading && selection.stream && !selection.level && <section className="grid gap-4 sm:grid-cols-3">{['Freshman', 'Remedial', 'Senior', 'Diploma'].map((level) => choose(level, () => move({ level })))}</section>}

      {!loading && selection.level === 'Senior' && !selection.department && <section className="space-y-3"><h2 className="text-xl font-semibold">Choose Department</h2><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{(catalog.departments || []).map((department) => choose(department, () => move({ department })))}</div>{!catalog.departments?.length && <p className="text-slate-400">No active departments are configured for this stream yet.</p>}</section>}

      {!loading && ['Freshman', 'Remedial', 'Diploma'].includes(selection.level) && !selection.course && <section className="space-y-3"><h2 className="text-xl font-semibold">Choose Course</h2><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{(catalog.courses || []).map((course) => choose(course, () => move({ course })))}</div>{!catalog.courses?.length && <p className="text-slate-400">No approved courses are available yet.</p>}</section>}

      {!loading && selection.level === 'Senior' && selection.department && !selection.kind && <section className="grid gap-4 sm:grid-cols-2">{(catalog.options || []).map((option) => choose(option.label, () => move({ kind: option.id })))}</section>}

      {!loading && selection.level === 'Senior' && selection.kind === 'course-material' && !selection.course && <section className="space-y-3"><h2 className="text-xl font-semibold">Department Courses</h2><input type="search" value={courseSearch} onChange={(event) => setCourseSearch(event.target.value)} placeholder="Search courses by name or keyword…" className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-sky-500" /><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{(catalog.courses || []).filter((course) => course.toLowerCase().includes(courseSearch.trim().toLowerCase())).map((course) => choose(course, () => move({ course })))}</div>{catalog.courses?.length > 0 && !catalog.courses.filter((course) => course.toLowerCase().includes(courseSearch.trim().toLowerCase())).length && <p className="text-slate-400">No courses match your search.</p>}</section>}

      {!loading && ['Freshman', 'Remedial'].includes(selection.level) && selection.course && !selection.kind && <section className="grid gap-4 sm:grid-cols-2">{(catalog.options || []).map((option) => choose(option.label, () => move({ kind: option.id })))}</section>}

      {!loading && selection.kind === 'exam-question' && !selection.academicYear && <section className="space-y-3"><h2 className="text-xl font-semibold">Choose Academic Year</h2><div className="grid gap-3 sm:grid-cols-3">{(catalog.years || []).map((year) => choose(year, () => move({ academicYear: year })))}</div>{!catalog.years?.length && <p className="text-slate-400">No approved exam years are available yet.</p>}</section>}

      {!loading && (resources.length > 0 || (selection.kind && (selection.kind === 'exit-exam' || selection.course && selection.kind === 'course-material' || selection.academicYear))) && <section className="space-y-3"><h2 className="text-xl font-semibold">Approved Resources</h2>{resources.map((resource) => <article key={resource._id} className="rounded-2xl border border-slate-800 bg-slate-900 p-5"><h3 className="font-semibold">{resource.title}</h3><p className="mt-1 text-xs uppercase text-sky-400">{resource.resourceType}</p>{resource.textContent && <p className="mt-3 whitespace-pre-wrap text-slate-300">{resource.textContent}</p>}{resource.answer && <p className="mt-3 text-slate-300"><strong>Answer:</strong> {resource.answer}</p>}{resource.solution && <p className="mt-2 whitespace-pre-wrap text-slate-300"><strong>Solution:</strong> {resource.solution}</p>}{resource.resourceType !== 'text' && <a className="mt-4 inline-block text-sky-400 underline" href={apiFetch ? '#file-access-requires-authenticated-download' : '#'} onClick={async (event) => { event.preventDefault(); const popup = window.open('about:blank', '_blank'); try { const response = await apiFetch('university-learning/resources/' + resource._id + '/file'); if (!response.ok) throw new Error('Unable to open approved file.'); const blob = await response.blob(); const url = URL.createObjectURL(blob); if (popup) popup.location.href = url; else { const link = document.createElement('a'); link.href = url; link.download = resource.originalFileName || resource.title; link.click(); } } catch (err) { if (popup) popup.close(); setError(err.message); } }}>Open {resource.resourceType}</a>}</article>)}</section>}
      {!loading && selection.kind && !resources.length && !catalog.years?.length && !catalog.courses?.length && <p className="text-slate-400">No approved resources are available at this step.</p>}
    </main>
  );
}
