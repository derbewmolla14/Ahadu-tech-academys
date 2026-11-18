import { useContext, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { apiFetch } from '../api/api';
import DocumentViewerModal from '../components/DocumentViewerModal';
import PaymentMethodModal from '../components/PaymentMethodModal';
import { AuthContext } from '../context/AuthContext';
import { downloadApprovedResource } from '../utils/downloadApprovedResource';

export default function ElementaryGradePage() {
  const { id } = useParams();
  const { user, language } = useContext(AuthContext);
  const selectedLanguage = String(language || user?.preferences?.language || 'en').trim().toLowerCase();
  const isAmharic = ['am', 'amharic', 'አማርኛ'].includes(selectedLanguage);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [downloadResource, setDownloadResource] = useState(null);

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
        if (isAmharic) params.set('language', 'am');
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
  }, [id, isAmharic]);

  const requestDownload = (resource) => downloadApprovedResource(resource, setDownloadResource);

  const openCourseFile = async (course, kind, index, item) => {
    if (course.isPremium && !course.hasAccess) {
      setDownloadResource({ title: course.course, type: 'course materials', accessType: 'premium', pricingTier: 'elementary' });
      return;
    }
    try {
      const endpoint = `content/${course._id}/material/${kind}/${index}`;
      const response = await apiFetch(endpoint);
      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.message || 'Unable to open this material.');
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const fileName = item.title || (kind === 'notes' ? 'note.pdf' : 'presentation.pptx');
      setSelectedPdf({ title: item.title || 'Course material', fileName, mimeType: blob.type, url, downloadEndpoint: endpoint + '?download=1' });
    } catch (error) {
      window.alert(error.message || 'Unable to open this material.');
    }
  };

  const closeViewer = () => {
    if (selectedPdf?.url?.startsWith('blob:')) URL.revokeObjectURL(selectedPdf.url);
    setSelectedPdf(null);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-6">
      <DocumentViewerModal file={selectedPdf} onClose={closeViewer} onDownloadRequest={requestDownload} />
      <PaymentMethodModal open={Boolean(downloadResource)} resource={downloadResource} onClose={() => setDownloadResource(null)} />
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
              <div className="mt-3 flex flex-wrap items-center gap-2">{course.isPremium ? <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-300">🔒 PREMIUM</span> : <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">FREE</span>}{course.isPremium && course.hasAccess && <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-300">✓ APPROVED / UNLOCKED</span>}</div>
              {course.isPremium && !course.hasAccess && <button type="button" onClick={() => setDownloadResource({ title: course.course, type: 'course materials', accessType: 'premium' })} className="mt-3 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white">🔒 View payment options</button>}

              {course.notes?.length > 0 && (
                <section className="mt-5">
                  <h3 className="mb-2 font-semibold text-slate-200">📄 Notes</h3>
                  <ul className="space-y-2">
                    {course.notes.map((note, index) => (
                      <li key={index} className="flex flex-wrap items-center gap-3"><button type="button" onClick={() => openCourseFile(course, 'notes', index, note)} className="text-left text-sm text-blue-400 hover:underline">{note.title || 'Open PDF note'} ↗</button><button type="button" onClick={() => requestDownload({ title: note.title || 'PDF note', fileName: note.title || 'note.pdf', type: 'PDF', downloadEndpoint: `content/${course._id}/material/notes/${index}?download=1` })} className="rounded-lg border border-amber-500/60 px-3 py-1 text-xs font-semibold text-amber-200 hover:bg-amber-500/10">Download</button></li>
                    ))}
                  </ul>
                </section>
              )}
              {course.videos?.length > 0 && (
                <section className="mt-5">
                  <h3 className="mb-2 font-semibold text-slate-200">🎥 Videos</h3>
                  <ul className="space-y-2">
                    {course.videos.map((video, index) => (
                      <li key={index} className="flex flex-wrap items-center gap-3"><button type="button" onClick={() => { if (course.isPremium && !course.hasAccess) { setDownloadResource({ title: course.course, type: 'video lesson', accessType: 'premium' }); return; } setSelectedPdf({ title: video.title || 'Video lesson', fileName: video.fileName || video.title || 'lesson.mp4', mimeType: video.mimeType || 'video/mp4', url: video.url, downloadEndpoint: `content/${course._id}/video/${index}/download` }); }} className="text-left text-sm text-blue-400 hover:underline">Watch {video.title || 'video'} →</button><button type="button" onClick={() => requestDownload({ title: video.title || 'Video lesson', fileName: video.fileName || 'lesson.mp4', type: 'video', downloadEndpoint: `content/${course._id}/video/${index}/download` })} className="rounded-lg border border-amber-500/60 px-3 py-1 text-xs font-semibold text-amber-200 hover:bg-amber-500/10">Download</button></li>
                    ))}
                  </ul>
                </section>
              )}
              {course.ppts?.length > 0 && (
                <section className="mt-5">
                  <h3 className="mb-2 font-semibold text-slate-200">📊 Presentations</h3>
                  <ul className="space-y-2">
                    {course.ppts.map((ppt, index) => (
                      <li key={index} className="flex flex-wrap items-center gap-3"><button type="button" onClick={() => openCourseFile(course, 'ppts', index, ppt)} className="text-left text-sm text-blue-400 hover:underline">Open {ppt.title || 'presentation'} ↗</button><button type="button" onClick={() => requestDownload({ title: ppt.title || 'Presentation', fileName: ppt.fileName || ppt.originalFileName, type: 'PPT', downloadEndpoint: `content/${course._id}/material/ppts/${index}?download=1` })} className="rounded-lg border border-amber-500/60 px-3 py-1 text-xs font-semibold text-amber-200 hover:bg-amber-500/10">Download</button></li>
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
