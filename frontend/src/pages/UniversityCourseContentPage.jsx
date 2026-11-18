import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { apiFetch } from '../api/api';
import DocumentViewerModal from '../components/DocumentViewerModal';

export default function UniversityCourseContentPage() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [accessLocked, setAccessLocked] = useState(false);
  const backToCourses = course?.level === 'highschool' ? `/highschool/grade/${course.grade || ''}` : '/university';
  const [lockedMessage, setLockedMessage] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const paymentDetails = {
    bankName: import.meta.env.VITE_PAYMENT_BANK_NAME || '',
    accountName: import.meta.env.VITE_PAYMENT_ACCOUNT_NAME || '',
    accountNumber: import.meta.env.VITE_PAYMENT_ACCOUNT_NUMBER || '',
    telebirrName: import.meta.env.VITE_TELEBIRR_ACCOUNT_NAME || '',
    telebirrNumber: import.meta.env.VITE_TELEBIRR_PHONE || '',
    telegramUsername: (import.meta.env.VITE_PAYMENT_TELEGRAM_USERNAME || '').replace(/^@/, ''),
  };
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
      {accessLocked && <section className="rounded-3xl border border-amber-500/40 bg-amber-500/10 p-8 text-amber-100"><div className="text-3xl">🔒</div><h2 className="mt-3 text-xl font-semibold">Premium course — approval required</h2><p className="mt-2 text-amber-200/90">{lockedMessage || 'An administrator must approve this course for your account before you can open its learning materials.'}</p><p className="mt-3 text-sm text-amber-200/70">The course information is visible, but videos, PDF notes, and PowerPoint files remain locked until approval.</p><button type="button" onClick={() => setShowPayment(true)} className="mt-5 rounded-xl bg-amber-500 px-5 py-3 font-semibold text-slate-950 hover:bg-amber-400">View payment instructions</button></section>}
      {showPayment && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4" role="dialog" aria-modal="true" aria-labelledby="course-payment-title"><section className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-widest text-amber-400">Premium course</p><h2 id="course-payment-title" className="mt-2 text-2xl font-bold text-white">Payment instructions</h2></div><button type="button" onClick={() => setShowPayment(false)} className="rounded-lg px-3 py-2 text-slate-300 hover:bg-slate-800">✕</button></div><p className="mt-4 text-sm leading-6 text-slate-300">Complete payment externally using the configured bank or Telebirr details. Then send your receipt, student account email or ID, and course name to the academy on Telegram. An administrator will verify the payment and unlock this course for your account.</p><div className="mt-4 rounded-xl border border-slate-700 bg-slate-950 p-4"><h3 className="font-semibold text-white">Bank transfer</h3>{paymentDetails.bankName && <p className="mt-2 text-sm text-slate-300">Bank: <strong>{paymentDetails.bankName}</strong></p>}{paymentDetails.accountName && <p className="mt-1 text-sm text-slate-300">Account name: <strong>{paymentDetails.accountName}</strong></p>}{paymentDetails.accountNumber && <p className="mt-1 text-sm text-slate-300">Account number: <strong>{paymentDetails.accountNumber}</strong></p>}{!paymentDetails.bankName && !paymentDetails.accountNumber && <p className="mt-2 text-sm text-amber-200">Bank account details have not been configured.</p>}</div><div className="mt-3 rounded-xl border border-slate-700 bg-slate-950 p-4"><h3 className="font-semibold text-white">Telebirr</h3>{paymentDetails.telebirrName && <p className="mt-2 text-sm text-slate-300">Account name: <strong>{paymentDetails.telebirrName}</strong></p>}{paymentDetails.telebirrNumber && <p className="mt-1 text-sm text-slate-300">Telebirr number: <strong>{paymentDetails.telebirrNumber}</strong></p>}{!paymentDetails.telebirrName && !paymentDetails.telebirrNumber && <p className="mt-2 text-sm text-amber-200">Telebirr details have not been configured.</p>}</div><ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-slate-300"><li>Pay the amount communicated by the academy.</li><li>Save your transaction receipt.</li><li>Send your payment screenshot, student account email or ID, course title, and payment method to the Telegram contact.</li><li>Wait for manual verification and course unlocking.</li></ol>{paymentDetails.telegramUsername ? <a href={`https://t.me/${paymentDetails.telegramUsername}`} target="_blank" rel="noreferrer" className="mt-5 block rounded-xl bg-sky-600 px-4 py-3 text-center font-semibold text-white hover:bg-sky-500">Open Telegram to send payment screenshot & details</a> : <p className="mt-5 rounded-lg border border-amber-700 bg-amber-950/50 p-3 text-sm text-amber-200">Telegram contact is not configured. Set VITE_PAYMENT_TELEGRAM_USERNAME.</p>}<button type="button" onClick={() => setShowPayment(false)} className="mt-3 w-full rounded-xl border border-slate-700 px-4 py-3 text-sm text-slate-300 hover:bg-slate-800">Close</button></section></div>}
      {!accessLocked && course.contentType === 'exit-exam' && <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6"><h2 className="text-xl font-semibold text-white">Exit Exam Questions</h2>{course.questions?.length ? <ol className="mt-5 space-y-5">{course.questions.map((item, index) => <li key={index} className="rounded-xl border border-slate-800 bg-slate-950 p-4"><p className="font-medium text-white">{index + 1}. {item.question}</p><p className="mt-2 text-sm text-emerald-300">Answer: {item.answer}</p></li>)}</ol> : <p className="mt-3 text-slate-400">No questions have been added yet.</p>}</section>}
      {!accessLocked && course.contentType !== 'exit-exam' && <>
      {course.notes?.length > 0 && <MaterialSection title="PDF Notes" items={course.notes} getUrl={(_item, index) => 'content/' + courseId + '/material/notes/' + index} protectedDownload />}
      {course.videos?.length > 0 && <MaterialSection title="Video Lessons" items={course.videos} getUrl={(item) => item.url} />}
      {course.ppts?.length > 0 && <MaterialSection title="PowerPoint Presentations" items={course.ppts} getUrl={(_item, index) => 'content/' + courseId + '/material/ppts/' + index} protectedDownload />}
      {!course.notes?.length && !course.videos?.length && !course.ppts?.length && <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-300">No learning materials have been uploaded for this course yet.</div>}
      </>}
    </div>
  );
}

function MaterialSection({ title, items, getUrl, protectedDownload = false }) {
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
      setDocumentFile({ title: item.title || title, fileName, mimeType: blob.type, url });
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
                <a href={getUrl(item, index)} target="_blank" rel="noreferrer" className="text-sky-400 hover:underline">
                  {item.title || title} ↗
                </a>
              )}
            </li>
          ))}
        </ul>
      </section>
      <DocumentViewerModal file={documentFile} onClose={closeViewer} />
    </>
  );
}
