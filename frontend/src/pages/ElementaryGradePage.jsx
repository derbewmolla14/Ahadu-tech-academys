import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { apiFetch, apiBaseURL } from '../api/api';

const getUploadedFileUrl = (fileUrl) => {
  if (!fileUrl) return '#';
  if (/^https?:\/\//i.test(fileUrl)) return fileUrl;
  const backendOrigin = apiBaseURL.replace(/\/api\/?$/, '');
  return backendOrigin + '/' + String(fileUrl).replace(/^\/+/, '');
};

export default function ElementaryGradePage() {
  const { id } = useParams();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPdf, setSelectedPdf] = useState(null);

  useEffect(() => {
    let active = true;
    const loadCourses = async () => {
      if (!/^[1-8]$/.test(String(id))) {
        setError('Please select a valid Elementary grade (1–8).');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError('');
        const params = new URLSearchParams({ level: 'elementary', grade: String(id) });
        const response = await apiFetch(`content?${params.toString()}`);
        const result = await response.json();
        if (!response.ok || !result.success) {
          throw new Error(result.message || 'Could not load courses for this grade.');
        }
        if (active) setCourses(Array.isArray(result.data) ? result.data : []);
      } catch (err) {
        if (active) setError(err.message || 'Unable to load courses. Please try again.');
      } finally {
        if (active) setLoading(false);
      }
    };
    loadCourses();
    return () => { active = false; };
  }, [id]);

  return (
    <div className="mx-auto max-w-6xl space-y-5 p-4 sm:space-y-8 sm:p-6">
      {selectedPdf && <div className="fixed inset-0 z-50 flex flex-col bg-slate-950/95 p-3 sm:p-6" role="dialog" aria-modal="true" aria-label={selectedPdf.title}>
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 pb-3"><h2 className="truncate text-lg font-semibold text-white">{selectedPdf.title}</h2><button type="button" onClick={() => setSelectedPdf(null)} className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700">Close ×</button></div>
        <iframe title={selectedPdf.title} src={selectedPdf.url} className="mx-auto min-h-0 w-full max-w-6xl flex-1 rounded-xl border border-slate-700 bg-white" />
      </div>}
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4 sm:p-6 lg:p-8">
        <Link to="/elementary" className="text-sm text-blue-400 hover:text-blue-300">← All Elementary grades</Link>
        <h1 className="mt-4 text-2xl font-bold text-white sm:text-3xl">Elementary — Grade {id}</h1>
        <p className="mt-2 text-slate-400">Courses and learning materials uploaded for Grade {id} appear here.</p>
      </div>

      {loading && <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 text-center sm:p-8 text-slate-300">Loading Grade {id} courses…</div>}
      {!loading && error && <div role="alert" className="rounded-2xl border border-red-800 bg-red-950/40 p-6 text-red-200">{error}</div>}
      {!loading && !error && courses.length === 0 && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
          <div className="text-4xl">📚</div>
          <h2 className="mt-3 text-lg font-semibold text-white sm:text-xl">No courses uploaded yet</h2>
          <p className="mt-2 text-slate-400">There are currently no published courses for Grade {id}. Please check again later.</p>
        </div>
      )}

      {!loading && !error && courses.length > 0 && (
        <div className="grid gap-5 md:grid-cols-2">
          {courses.map((course) => (
            <article key={course._id} className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">{course.subject || course.department || 'Elementary'}</p>
              <h2 className="mt-2 text-xl font-semibold text-white">{course.course}</h2>
              {course.description && <p className="mt-2 text-sm text-slate-400">{course.description}</p>}

              {course.notes?.length > 0 && (
                <section className="mt-5">
                  <h3 className="mb-2 font-semibold text-slate-200">📄 Notes</h3>
                  <ul className="space-y-2">
                    {course.notes.map((note, index) => (
                      <li key={index}><button type="button" onClick={() => setSelectedPdf({ title: note.title || 'PDF note', url: getUploadedFileUrl(note.fileUrl) })} className="text-left text-sm text-blue-400 hover:underline">{note.title || 'Open PDF note'} ↗</button></li>
                    ))}
                  </ul>
                </section>
              )}
              {course.videos?.length > 0 && (
                <section className="mt-5">
                  <h3 className="mb-2 font-semibold text-slate-200">🎥 Videos</h3>
                  <ul className="space-y-2">
                    {course.videos.map((video, index) => (
                      <li key={index}><a className="text-sm text-blue-400 hover:underline" href={video.url} target="_blank" rel="noreferrer">{video.title || 'Watch video'} ↗</a></li>
                    ))}
                  </ul>
                </section>
              )}
              {course.ppts?.length > 0 && (
                <section className="mt-5">
                  <h3 className="mb-2 font-semibold text-slate-200">📊 Presentations</h3>
                  <ul className="space-y-2">
                    {course.ppts.map((ppt, index) => (
                      <li key={index}><a className="text-sm text-blue-400 hover:underline" href={getUploadedFileUrl(ppt.fileUrl)} target="_blank" rel="noreferrer">{ppt.title || 'Open presentation'} ↗</a></li>
                    ))}
                  </ul>
                </section>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
