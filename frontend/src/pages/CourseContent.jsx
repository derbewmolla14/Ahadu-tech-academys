import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { apiBaseURL, apiFetch } from '../api/api';
import DocumentViewerModal from '../components/DocumentViewerModal';
import PaymentMethodModal from '../components/PaymentMethodModal';
import { downloadApprovedResource } from '../utils/downloadApprovedResource';
import { findOfflineResourceByEndpoint, createOfflineObjectUrl } from '../utils/offlineStore';

export default function CourseContent() {
  const { name } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const faculty = searchParams.get('faculty');
  const department = searchParams.get('department');
  const year = searchParams.get('year');

  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [documentFile, setDocumentFile] = useState(null);
  const [downloadResource, setDownloadResource] = useState(null);
  const requestDownload = (resource) => downloadApprovedResource(resource, setDownloadResource);

  const openCourseVideo = async (index, video) => {
    const endpoint = `content/${courseData._id}/video/${index}`;
    try {
      const cached = await findOfflineResourceByEndpoint(endpoint + '/download');
      if (cached) { setDocumentFile({ title: cached.title, fileName: cached.fileName, mimeType: cached.mimeType, url: createOfflineObjectUrl(cached), isOffline: true }); return; }
      if (navigator.onLine === false) throw new Error('This video is not saved offline yet.');
      if (!String(video.url || '').startsWith('/uploads/')) {
        setDocumentFile({ title: video.title || 'Video lesson', fileName: video.title || 'lesson.mp4', mimeType: video.mimeType || 'video/mp4', url: video.url, downloadEndpoint: endpoint + '/download' });
        return;
      }
      const response = await apiFetch(endpoint);
      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        if (response.status === 403) setDownloadResource({ title: courseData.course, type: 'course materials', accessType: 'premium', isPremium: true, hasAccess: false, pricingTier: courseData.pricingTier || 'university' });
        else throw new Error(result.message || 'Unable to open this video.');
        return;
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setDocumentFile({ title: video.title || 'Video lesson', fileName: video.title || 'lesson.mp4', mimeType: blob.type || video.mimeType || 'video/mp4', url, downloadEndpoint: endpoint + '/download' });
    } catch (error) {
      window.alert(error.message || 'Unable to open this video.');
    }
  };

  const openCourseFile = async (kind, index, item) => {
    try {
      const endpoint = `content/${courseData._id}/material/${kind}/${index}`;
      const cached = await findOfflineResourceByEndpoint(endpoint + '?download=1');
      if (cached) { setDocumentFile({ title: cached.title, fileName: cached.fileName, mimeType: cached.mimeType, url: createOfflineObjectUrl(cached), isOffline: true }); return; }
      if (navigator.onLine === false) throw new Error('This material is not saved offline yet.');
      const response = await apiFetch(endpoint);
      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.message || 'Unable to open this material.');
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setDocumentFile({ title: item.title || 'Course material', fileName: item.title || (kind === 'notes' ? 'note.pdf' : 'presentation.pptx'), mimeType: blob.type, url, downloadEndpoint: endpoint + '?download=1' });
    } catch (error) {
      window.alert(error.message || 'Unable to open this material.');
    }
  };

  useEffect(() => {
    // If missing required parameters, redirect to university page
    if (!faculty || !department || !year) {
      navigate(`/university/${name}`);
      return;
    }

    fetchCourseData();
  }, [faculty, department, year, name, navigate]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        university: name,
        department,
        year,
      });
      const response = await apiFetch(`content?${params.toString()}`);
      const data = await response.json();

      if (data.success && data.data.length > 0) {
        const selectedCourse = data.data[0];
        setCourseData(selectedCourse);
        if (selectedCourse.isPremium && selectedCourse.hasAccess === false) {
          setDownloadResource({
            title: selectedCourse.course,
            type: 'course materials',
            accessType: 'premium',
            isPremium: true,
            hasAccess: false,
            pricingTier: selectedCourse.pricingTier || 'university',
          });
        }
      } else {
        setError('Course content not found or not available');
      }
    } catch (err) {
      setError('Error loading course content');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Don't render if missing required data
  if (!faculty || !department || !year) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white text-xl">Loading course content...</div>
      </div>
    );
  }

  if (error || !courseData) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-red-900/50 border border-red-700 text-red-200 p-6 rounded-xl">
            <h2 className="text-xl font-semibold mb-2">Content Not Available</h2>
            <p>{error || 'This course content is not currently available.'}</p>
            <button
              onClick={() => navigate(-1)}
              className="mt-4 bg-red-700 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
            >
              ← Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <DocumentViewerModal file={documentFile} onClose={() => { if (documentFile?.url?.startsWith('blob:')) URL.revokeObjectURL(documentFile.url); setDocumentFile(null); }} onDownloadRequest={requestDownload} />
      <PaymentMethodModal open={Boolean(downloadResource)} resource={downloadResource} onClose={() => setDownloadResource(null)} />
      {/* HEADER */}
      <div className="bg-slate-900 border-b border-slate-800 p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-semibold text-white">{courseData.course}</h1>
          <p className="mt-2 text-slate-400">
            University: {courseData.university} | Faculty: {faculty} Sciences | Department: {courseData.department} | Year: {courseData.year}
          </p>
          {courseData.description && (
            <p className="mt-2 text-slate-300">{courseData.description}</p>
          )}
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-full border border-slate-700 px-5 py-3 text-sm text-slate-200 transition hover:border-slate-500"
            >
              ← Back to Year Selection
            </button>
          </div>
        </div>
      </div>

      {courseData.isPremium && courseData.hasAccess === false && (
        <section className="mx-auto mt-6 max-w-6xl rounded-2xl border border-amber-500/40 bg-amber-500/10 p-6 text-amber-100">
          <h2 className="text-xl font-semibold">🔒 Premium course — approval required</h2>
          <p className="mt-2 text-sm text-amber-200">An administrator must approve your payment for this course before lessons can be opened or downloaded.</p>
          <button type="button" onClick={() => setDownloadResource({ title: courseData.course, type: 'course materials', accessType: 'premium', isPremium: true, hasAccess: false, pricingTier: courseData.pricingTier || 'university' })} className="mt-4 rounded-lg bg-amber-500 px-4 py-2 font-semibold text-slate-950">View payment instructions</button>
        </section>
      )}
      {(!courseData.isPremium || courseData.hasAccess !== false) && (
      {/* CONTENT SECTIONS */}
      <div className="max-w-6xl mx-auto p-6 space-y-8">

        {/* NOTES SECTION */}
        {courseData.notes && courseData.notes.length > 0 && (
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-xl shadow-slate-950/40">
            <h2 className="text-3xl font-semibold text-white mb-6">📄 Notes</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {courseData.notes.map((note, index) => (
                <article
                  key={index}
                  className="rounded-2xl border border-slate-700 bg-slate-800 p-4 transition hover:border-slate-600 hover:bg-slate-700"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">📄</span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white text-sm leading-tight">{note.title}</h3>
                      <p className="text-slate-400 text-xs mt-1">PDF Document</p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2"><button type="button" onClick={() => openCourseFile('notes', index, note)} className="text-blue-400 text-xs">Open / Read →</button><button type="button" onClick={() => requestDownload({ title: note.title || 'PDF note', type: 'PDF', downloadEndpoint: `content/${courseData._id}/material/notes/${index}?download=1` })} className="rounded-lg border border-amber-500/60 px-3 py-1 text-xs font-semibold text-amber-200">Download</button></div>
                </article>
              ))}
            </div>
          </div>
        )}

        {/* VIDEOS SECTION */}
        {courseData.videos && courseData.videos.length > 0 && (
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-xl shadow-slate-950/40">
            <h2 className="text-3xl font-semibold text-white mb-6">🎥 Videos</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {courseData.videos.map((video, index) => (
                <article
                  key={index}
                  className="rounded-2xl border border-slate-700 bg-slate-800 p-4 transition hover:border-slate-600 hover:bg-slate-700"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">🎥</span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white text-sm leading-tight">{video.title}</h3>
                      <p className="text-slate-400 text-xs mt-1">Video Content</p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2"><button type="button" onClick={() => openCourseVideo(index, video)} className="text-red-400 text-xs">Watch video →</button><button type="button" onClick={() => requestDownload({ title: video.title || 'Video lesson', type: 'video', downloadEndpoint: `content/${courseData._id}/video/${index}/download` })} className="rounded-lg border border-amber-500/60 px-3 py-1 text-xs font-semibold text-amber-200">Download</button></div>
                </article>
              ))}
            </div>
          </div>
        )}

        {/* PPTS SECTION */}
        {courseData.ppts && courseData.ppts.length > 0 && (
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-xl shadow-slate-950/40">
            <h2 className="text-3xl font-semibold text-white mb-6">📊 Presentations</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {courseData.ppts.map((ppt, index) => (
                <article
                  key={index}
                  className="rounded-2xl border border-slate-700 bg-slate-800 p-4 transition hover:border-slate-600 hover:bg-slate-700"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">📊</span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white text-sm leading-tight">{ppt.title}</h3>
                      <p className="text-slate-400 text-xs mt-1">PowerPoint Presentation</p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2"><button type="button" onClick={() => openCourseFile('ppts', index, ppt)} className="text-purple-400 text-xs">Open / Read →</button><button type="button" onClick={() => requestDownload({ title: ppt.title || 'Presentation', type: 'PPT', downloadEndpoint: `content/${courseData._id}/material/ppts/${index}?download=1` })} className="rounded-lg border border-amber-500/60 px-3 py-1 text-xs font-semibold text-amber-200">Download</button></div>
                </article>
              ))}
            </div>
          </div>
        )}

        {/* NO CONTENT MESSAGE */}
        {(!courseData.notes || courseData.notes.length === 0) &&
         (!courseData.videos || courseData.videos.length === 0) &&
         (!courseData.ppts || courseData.ppts.length === 0) && (
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-xl shadow-slate-950/40 text-center">
            <div className="text-6xl mb-4">📚</div>
            <h2 className="text-2xl font-semibold text-white mb-4">Content Coming Soon</h2>
            <p className="text-slate-400">This course is currently being prepared. Materials will be available soon.</p>
          </div>
        )}

      </div>)}
    </div>
  );
}
