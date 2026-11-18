import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { apiFetch, apiBaseURL } from '../api/api';
import DocumentViewerModal from '../components/DocumentViewerModal';

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
        if (active) setCourses(Array.isArray(result.data) ? result.data.filter((item) => item && item.isActive !== false) : []);
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
    <div className="mx-auto max-w-6xl space-y-8 p-6">
      <DocumentViewerModal file={selectedPdf} onClose={() => setSelectedPdf(null)} />
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8">
        <Link to="/elementary" className="text-sm text-blue-400 hover:text-blue-300">← All Elementary grades</Link>
        <h1 className="mt-4 text-3xl font-bold text-white">Elementary — Grade {id}</h1>
        <p className="mt-2 text-slate-400">Courses and learning materials uploaded for Grade {id} appear here.</p>
      </div>

      {loading && <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-300">Loading Grade {id} courses…</div>}
      {!loading && error && <div role="alert" className="rounded-2xl border border-red-800 bg-red-950/40 p-6 text-red-200">{error}</div>}
      {!loading && !error && courses.length === 0 && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
          <div className="text-4xl">📚</div>
          <h2 className="mt-3 text-xl font-semibold text-white">No courses uploaded yet</h2>
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
                      <li key={index}><button type="button" onClick={() => setSelectedPdf({ title: ppt.title || 'Presentation', fileName: ppt.fileName || ppt.originalFileName || ppt.title || 'presentation.pptx', url: getUploadedFileUrl(ppt.fileUrl) })} className="text-left text-sm text-blue-400 hover:underline">Open {ppt.title || 'presentation'} ↗</button></li>
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
