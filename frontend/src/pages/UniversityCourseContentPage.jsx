import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { apiFetch } from '../api/api';
import DocumentViewerModal from '../components/DocumentViewerModal';
import PaymentMethodModal from '../components/PaymentMethodModal';
import { downloadApprovedResource } from '../utils/downloadApprovedResource';

export default function UniversityCourseContentPage() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [accessLocked, setAccessLocked] = useState(false);
  const backToCourses = course?.level === 'highschool' ? `/highschool/grade/${course.grade || ''}` : '/university';
  const [lockedMessage, setLockedMessage] = useState('');
  const [downloadResource, setDownloadResource] = useState(null);
  const requestDownload = (resource) => downloadApprovedResource(resource, setDownloadResource);
  useEffect(() => {
    let active = true;
    async function load() {
      try {
        setLoading(true); setError('');
        const response = await apiFetch('content/' + encodeURIComponent(courseId), { cache: 'no-store' });
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.message || 'Unable to load this course.');
        if (active) { setCourse(result.data); setAccessLocked(Boolean(result.accessLocked)); setLockedMessage(result.message || ''); }
      } catch (err) { if (active) setError(err.message || 'Unable to load this course.'); }
      finally { if (active) setLoading(false); }
    }
    load();
    return () => { active = false; };
  }, [courseId]);
  if (loading) return <div className="p-8 text-center text-slate-300">Loading course…</div>;
  if (error || !course) return <div role="alert" className="mx-auto max-w-4xl rounded-2xl border border-red-800 bg-red-950/40 p-6 text-red-200">{error || 'Course not found.'}</div>;
  return (
    <div className="mx-auto max-w-6xl space-y-8 p-6">
      <section className="rounded-3xl border border-slate-800 bg-slate-900 p-8">
        <Link to={backToCourses} className="text-sm text-sky-400 hover:text-sky-300">← Back to University Courses</Link>
        <h1 className="mt-4 text-3xl font-semibold text-white">{course.course}</h1>
        <div className="mt-3 flex flex-wrap gap-2 text-sm text-slate-400">{course.courseCode && <span className="rounded-full bg-slate-800 px-3 py-1">Code: {course.courseCode}</span>}{course.faculty && <span className="rounded-full bg-slate-800 px-3 py-1">{course.faculty}</span>}{course.studyStage && <span className="rounded-full bg-slate-800 px-3 py-1">{course.studyStage}</span>}{course.department && <span className="rounded-full bg-slate-800 px-3 py-1">{course.department}</span>}<span className="rounded-full bg-slate-800 px-3 py-1">{course.year && course.year !== 'All Years' ? course.year : 'All academic years'}</span></div>
        {course.description && <p className="mt-4 text-slate-300">{course.description}</p>}
      </section>
      {accessLocked && <section className="rounded-3xl border border-amber-500/40 bg-amber-500/10 p-8 text-amber-100"><div className="text-3xl">🔒</div><h2 className="mt-3 text-xl font-semibold">Premium course — approval required</h2><p className="mt-2 text-amber-200/90">{lockedMessage || 'An administrator must approve this course for your account before you can open its learning materials.'}</p><p className="mt-3 text-sm text-amber-200/70">The course information is visible, but videos, PDF notes, and PowerPoint files remain locked until approval.</p><button type="button" onClick={() => setDownloadResource({ title: course.course, type: 'course materials', accessType: 'premium' })} className="mt-5 rounded-xl bg-amber-500 px-5 py-3 font-semibold text-slate-950 hover:bg-amber-400">View payment instructions</button></section>}
      <PaymentMethodModal open={Boolean(downloadResource)} resource={downloadResource} onClose={() => setDownloadResource(null)} />

      {!accessLocked && course.contentType === 'exit-exam' && <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6"><h2 className="text-xl font-semibold text-white">Exit Exam Questions</h2>{course.questions?.length ? <ol className="mt-5 space-y-5">{course.questions.map((item, index) => <li key={index} className="rounded-xl border border-slate-800 bg-slate-950 p-4"><p className="font-medium text-white">{index + 1}. {item.question}</p><p className="mt-2 text-sm text-emerald-300">Answer: {item.answer}</p></li>)}</ol> : <p className="mt-3 text-slate-400">No questions have been added yet.</p>}</section>}
      {!accessLocked && course.contentType !== 'exit-exam' && <>
      {course.notes?.length > 0 && <MaterialSection title="PDF Notes" items={course.notes} courseId={courseId} getUrl={(_item, index) => 'content/' + courseId + '/material/notes/' + index} protectedDownload onDownloadRequest={requestDownload} />}
      {course.videos?.length > 0 && <MaterialSection title="Video Lessons" items={course.videos} courseId={courseId} getUrl={(item) => item.url} onDownloadRequest={requestDownload} />}
      {course.ppts?.length > 0 && <MaterialSection title="PowerPoint Presentations" items={course.ppts} courseId={courseId} getUrl={(_item, index) => 'content/' + courseId + '/material/ppts/' + index} protectedDownload onDownloadRequest={requestDownload} />}
      {!course.notes?.length && !course.videos?.length && !course.ppts?.length && <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-300">No learning materials have been uploaded for this course yet.</div>}
      </>}
    </div>
  );
}

function MaterialSection({ title, items, getUrl, courseId, protectedDownload = false, onDownloadRequest }) {
  const [documentFile, setDocumentFile] = useState(null);

  const openProtectedFile = async (event, item, index) => {
    event.preventDefault();
    try {
      const response = await apiFetch(getUrl(item, index));
      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.message || 'Unable to open this file.');
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const fallbackExtension = title.toLowerCase().includes('powerpoint') ? '.pptx' : '.pdf';
      const fileName = item.fileName || item.originalFileName || item.title || (title + fallbackExtension);
      setDocumentFile({ title: item.title || title, fileName, mimeType: blob.type, url, downloadEndpoint: getUrl(item, index) + '?download=1' });
    } catch (error) {
      window.alert(error.message || 'Unable to open this file.');
    }
  };

  const closeViewer = () => {
    if (documentFile?.url?.startsWith('blob:')) URL.revokeObjectURL(documentFile.url);
    setDocumentFile(null);
  };

  return (
    <>
      <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        <ul className="mt-4 space-y-3">
          {items.map((item, index) => (
            <li key={index}>
              {protectedDownload ? (
                <button type="button" onClick={(event) => openProtectedFile(event, item, index)} className="text-left text-sky-400 hover:underline">
                  Open {item.title || title} →
                </button>
              ) : (
                <button type="button" onClick={() => setDocumentFile({ title: item.title || title, fileName: item.fileName || item.title || 'lesson.mp4', mimeType: item.mimeType || 'video/mp4', url: getUrl(item, index), downloadEndpoint: `content/${courseId}/video/${index}/download` })} className="text-left text-sky-400 hover:underline">
                  Watch {item.title || title} →
                </button>
              )}
              <button type="button" onClick={() => onDownloadRequest({ title: item.title || title, fileName: item.fileName || item.originalFileName, type: title.toLowerCase().includes('video') ? 'video' : title.toLowerCase().includes('powerpoint') ? 'presentation' : 'PDF', downloadEndpoint: title.toLowerCase().includes('video') ? `content/${courseId}/video/${index}/download` : getUrl(item, index) + '?download=1' })} className="ml-3 rounded-lg border border-amber-500/60 px-3 py-1.5 text-xs font-semibold text-amber-200 hover:bg-amber-500/10">Download</button>
            </li>
          ))}
        </ul>
      </section>
      <DocumentViewerModal file={documentFile} onClose={closeViewer} onDownloadRequest={onDownloadRequest} />
    </>
  );
}
