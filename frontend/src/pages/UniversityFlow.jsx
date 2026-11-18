import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../api/api';
import DocumentViewerModal from '../components/DocumentViewerModal';
import PaymentMethodModal from '../components/PaymentMethodModal';
import { AuthContext } from '../context/AuthContext';
import { downloadApprovedResource } from '../utils/downloadApprovedResource';

const initial = { stream: '', level: '', department: '', course: '', kind: '' };
const mainCategories = [
  { title: 'Foundation Building', description: 'Build strong foundations with school-level learning resources.', icon: '📚', to: '/elementary', color: 'from-blue-500 to-cyan-500' },
  { title: 'Development Skills', description: 'Practice coding and develop practical technology skills.', icon: '💻', to: '/coding', color: 'from-orange-500 to-amber-500' },
  { title: 'Natural Sciences', description: 'Explore science programs, departments, exams, and course materials.', icon: '🔬', stream: 'Natural', color: 'from-emerald-500 to-teal-500' },
  { title: 'Social Sciences', description: 'Explore social science departments, exams, and learning materials.', icon: '🌍', stream: 'Social', color: 'from-violet-500 to-purple-500' },
  { title: 'Health Sciences', description: 'Explore health science departments and academic resources.', icon: '🩺', stream: 'Health', color: 'from-rose-500 to-pink-500' },
  { title: "Master's Degree", description: 'Continue to postgraduate learning and advanced study.', icon: '🎓', to: '/university/masters', color: 'from-indigo-500 to-blue-500' },
  { title: 'PhD', description: 'Explore doctoral study and research learning resources.', icon: '📖', to: '/university/phd', color: 'from-slate-500 to-slate-700' },
  { title: 'Diploma', description: 'Browse diploma programs and their learning materials.', icon: '📘', stream: 'Diploma', color: 'from-amber-500 to-yellow-500' },
];

export default function UniversityFlow() {
  const { user, language } = useContext(AuthContext);
  const selectedLanguage = String(language || user?.preferences?.language || 'en').trim().toLowerCase();
  const isAmharic = ['am', 'amharic', 'አማርኛ'].includes(selectedLanguage);
  const [selection, setSelection] = useState(initial);
  const [history, setHistory] = useState([]);
  const [catalog, setCatalog] = useState({});
  const catalogRequestId = useRef(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [courseSearch, setCourseSearch] = useState('');
  const [departmentSearch, setDepartmentSearch] = useState('');
  const [resourceSearch, setResourceSearch] = useState('');
  const [paymentResource, setPaymentResource] = useState(null);
  const [documentFile, setDocumentFile] = useState(null);
  const [downloadResource, setDownloadResource] = useState(null);
  const paymentDetails = {
    bankName: import.meta.env.VITE_PAYMENT_BANK_NAME || '',
    accountName: import.meta.env.VITE_PAYMENT_ACCOUNT_NAME || '',
    accountNumber: import.meta.env.VITE_PAYMENT_ACCOUNT_NUMBER || '',
    telebirrName: import.meta.env.VITE_TELEBIRR_ACCOUNT_NAME || '',
    telebirrNumber: import.meta.env.VITE_TELEBIRR_PHONE || '',
    telegramUsername: (import.meta.env.VITE_PAYMENT_TELEGRAM_USERNAME || '').replace(/^@/, ''),
  };

  const load = useCallback(async (next) => {
    const requestId = ++catalogRequestId.current;
    if (!next.stream) { setCatalog({}); setLoading(false); return; }
    const params = new URLSearchParams();
    Object.entries(next).forEach(([key, value]) => { if (value) params.set(key, value); });
    if (isAmharic) params.set('language', 'am');
    setCatalog({});
    setLoading(true); setError('');
    try {
      const response = await apiFetch('university-learning/catalog?' + params.toString(), { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Unable to load learning content.');
      if (requestId === catalogRequestId.current) setCatalog(data);
    } catch (err) {
      if (requestId === catalogRequestId.current) { setError(err.message); setCatalog({}); }
    } finally {
      if (requestId === catalogRequestId.current) setLoading(false);
    }
  }, [isAmharic]);

  useEffect(() => {
    load(selection);
    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') load(selection);
    };
    window.addEventListener('focus', refreshWhenVisible);
    document.addEventListener('visibilitychange', refreshWhenVisible);
    return () => {
      catalogRequestId.current += 1;
      window.removeEventListener('focus', refreshWhenVisible);
      document.removeEventListener('visibilitychange', refreshWhenVisible);
    };
  }, [selection, load]);

  const move = (patch) => {
    setHistory((items) => [...items, selection]);
    setSelection((current) => ({ ...current, ...patch }));
  };
  const back = () => {
    if (!history.length) return;
    setSelection(history[history.length - 1]);
    setHistory((items) => items.slice(0, -1));
  };
  const reset = () => { setHistory([]); setSelection(initial); setError(''); };

  const heading = selection.kind === 'exam-question' ? 'Exam Questions'
    : selection.kind === 'exit-exam' ? 'Exit Exam'
    : selection.kind === 'course-material' ? 'Course Materials'
    : selection.course ? selection.course
    : selection.department ? selection.department
    : selection.level || 'Choose an Academic Category';

  const choose = (label, onClick, description = '') => (
    <button key={label} type="button" onClick={onClick} className="group flex min-h-36 w-full flex-col rounded-2xl border border-slate-700 bg-slate-900 p-6 text-left text-white shadow-lg transition duration-200 hover:-translate-y-1 hover:border-sky-500 hover:bg-slate-800 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-sky-500">
      <span className="block text-lg font-bold leading-snug group-hover:text-sky-300">{label}</span>
      {description && <span className="mt-2 block text-sm leading-6 text-slate-400">{description}</span>}
      <span className="mt-4 block text-sm font-semibold text-sky-400">Continue →</span>
    </button>
  );

  const resources = catalog.resources || [];
  const filteredCourses = (catalog.courses || []).filter((course) => String(course || '').toLowerCase().includes(courseSearch.trim().toLowerCase()));
  const filteredDepartments = (catalog.departments || []).filter((department) => department.toLowerCase().includes(departmentSearch.trim().toLowerCase()));
  const filteredResources = resources.filter((resource) => [resource.title, resource.originalFileName, resource.resourceType, resource.textContent].join(' ').toLowerCase().includes(resourceSearch.trim().toLowerCase()));

  const requestDownload = (resource) => {
    const downloadEndpoint = resource.source === 'course-content'
      ? (resource.resourceType === 'video' ? `content/${resource.courseContentId}/video/${resource.materialIndex}/download` : `content/${resource.courseContentId}/material/${resource.materialKind}/${resource.materialIndex}?download=1`)
      : `university-learning/resources/${resource._id}/file?download=1`;
    return downloadApprovedResource({ ...resource, downloadEndpoint }, setDownloadResource);
  };

  const openResource = async (resource) => {
    if (!resource.hasAccess) {
      setError('Premium access is required. Complete the payment or subscription process with the academy administrator, then ask the administrator to unlock this resource for your account.');
      return;
    }
    if (resource.source === 'course-content' && resource.resourceType === 'video') {
      setDocumentFile({ title: resource.title || 'Video lesson', fileName: resource.originalFileName || resource.title || 'lesson.mp4', mimeType: 'video/mp4', url: resource.videoUrl, downloadEndpoint: `content/${resource.courseContentId}/video/${resource.materialIndex}/download` });
      return;
    }
    try {
      const endpoint = resource.source === 'course-content'
        ? `content/${resource.courseContentId}/material/${resource.materialKind}/${resource.materialIndex}`
        : 'university-learning/resources/' + resource._id + '/file';
      const response = await apiFetch(endpoint);
      const data = response.headers.get('content-type')?.includes('application/json') ? await response.json() : null;
      if (!response.ok) throw new Error(data?.message || 'Unable to open this approved file.');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setDocumentFile({
        title: resource.title || 'Learning resource',
        fileName: resource.originalFileName || resource.title || 'document',
        mimeType: blob.type,
        url,
        downloadEndpoint: resource.source === 'course-content' ? `content/${resource.courseContentId}/material/${resource.materialKind}/${resource.materialIndex}?download=1` : `university-learning/resources/${resource._id}/file?download=1`,
      });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <main className="mx-auto min-h-[70vh] max-w-7xl space-y-7 p-5 text-white sm:p-8">
      {!selection.stream ? <>
        <header className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 p-8 shadow-xl sm:p-10">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-sky-400">Ahadu Tech Academy</p>
          <h1 className="mt-3 text-3xl font-bold md:text-4xl">Choose an Academic Category</h1>
          <p className="mt-3 max-w-3xl leading-7 text-slate-400">Select a learning path to explore organized courses, examinations, and approved study materials.</p>
        </header>
        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {mainCategories.map((category) => category.to ? (
            <Link key={category.title} to={category.to} className="group overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-lg transition hover:-translate-y-1 hover:border-sky-500 hover:shadow-2xl">
              <div className={`flex h-32 items-center justify-center bg-gradient-to-br ${category.color}`}><span className="text-6xl">{category.icon}</span></div>
              <div className="p-7"><h2 className="text-xl font-bold group-hover:text-sky-300">{category.title}</h2><p className="mt-3 min-h-[3.5rem] text-sm leading-6 text-slate-400">{category.description}</p><span className="mt-5 inline-flex font-semibold text-sky-400">Explore learning path →</span></div>
            </Link>
          ) : (
            <button key={category.title} type="button" onClick={() => move({ stream: category.stream })} className="group overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 text-left shadow-lg transition hover:-translate-y-1 hover:border-sky-500 hover:shadow-2xl">
              <div className={`flex h-32 items-center justify-center bg-gradient-to-br ${category.color}`}><span className="text-6xl">{category.icon}</span></div>
              <div className="p-7"><h2 className="text-xl font-bold group-hover:text-sky-300">{category.title}</h2><p className="mt-3 min-h-[3.5rem] text-sm leading-6 text-slate-400">{category.description}</p><span className="mt-5 inline-flex font-semibold text-sky-400">Explore learning path →</span></div>
            </button>
          ))}
        </section>
      </> : <>
        <header className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div><p className="text-sm font-semibold uppercase tracking-widest text-sky-400">Ahadu Tech Academy</p><h1 className="mt-2 text-3xl font-bold">University Learning</h1></div>
            <button type="button" onClick={reset} className="rounded-lg border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800">All Categories</button>
          </div>
          <p className="mt-3 text-slate-400">{heading}</p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button type="button" onClick={back} disabled={!history.length} className="rounded-lg bg-slate-800 px-4 py-2 text-sm disabled:opacity-40">← Back</button>
            <span className="text-xs text-slate-500">{[selection.stream, selection.level, selection.department, selection.course, selection.kind].filter(Boolean).join(' / ')}</span>
          </div>
        </header>
        {error && <p role="alert" className="rounded-xl border border-amber-800 bg-amber-950/60 p-4 text-amber-200">{error}</p>}
        {loading && <p className="py-8 text-center text-slate-400">Loading approved content…</p>}
        {!loading && !selection.level && <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{['Freshman', 'Remedial', 'Senior', 'Diploma'].map((level) => choose(level, () => move({ level }), level === 'Senior' ? 'Browse departments, course materials, and exit exams.' : 'Browse courses and approved learning resources.'))}</section>}
        {!loading && selection.level === 'Senior' && !selection.department && <section className="space-y-4"><h2 className="text-xl font-semibold">Choose Department</h2><input type="search" value={departmentSearch} onChange={(event) => setDepartmentSearch(event.target.value)} placeholder="Search departments by name…" className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-sky-500" /><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{filteredDepartments.map((department) => choose(department, () => move({ department })))}</div>{!catalog.departments?.length && <p className="text-slate-400">No active departments are configured for this stream yet.</p>}{catalog.departments?.length > 0 && !filteredDepartments.length && <p className="text-slate-400">No departments match your search.</p>}</section>}
        {!loading && ['Freshman', 'Remedial', 'Diploma'].includes(selection.level) && !selection.course && <section className="space-y-4"><h2 className="text-xl font-semibold">Choose Course</h2><input type="search" value={courseSearch} onChange={(event) => setCourseSearch(event.target.value)} placeholder="Search courses by name or keyword…" className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-sky-500" /><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{filteredCourses.map((course) => choose(course, () => move({ course })))}</div>{!catalog.courses?.length && <p className="text-slate-400">No approved courses are available yet.</p>}{catalog.courses?.length > 0 && !filteredCourses.length && <p className="text-slate-400">No courses match your search.</p>}</section>}
        {!loading && selection.level === 'Senior' && selection.department && !selection.kind && <section className="grid gap-5 sm:grid-cols-2">{choose('Exit Exam', () => move({ kind: 'exit-exam' }), 'Open approved exit exam questions, answers, and solutions.')}{choose('Course Material', () => move({ kind: 'course-material' }), 'Browse department courses and approved PDFs, presentations, and videos.')}</section>}
        {!loading && selection.level === 'Senior' && selection.kind === 'course-material' && !selection.course && <section className="space-y-4"><h2 className="text-xl font-semibold">Department Courses</h2><input type="search" value={courseSearch} onChange={(event) => setCourseSearch(event.target.value)} placeholder="Search courses by name or keyword…" className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-sky-500" /><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{filteredCourses.map((course) => choose(course, () => move({ course })))}</div>{!catalog.courses?.length && <p className="text-slate-400">No approved department courses are available yet.</p>}</section>}
        {!loading && ['Freshman', 'Remedial', 'Diploma'].includes(selection.level) && selection.course && !selection.kind && <section className="grid gap-5 sm:grid-cols-2">{choose('Exam Question', () => move({ kind: 'exam-question' }), 'Open approved exam questions across all academic years.')}{choose('Course Material', () => move({ kind: 'course-material' }), 'Open approved PDF, PPT, and video materials.')}</section>}
        {!loading && selection.kind && (selection.kind === 'exit-exam' || selection.course && ['course-material', 'exam-question'].includes(selection.kind)) && <section className="space-y-4"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-semibold">Approved Resources</h2>{selection.kind === 'course-material' && <input type="search" value={resourceSearch} onChange={(event) => setResourceSearch(event.target.value)} placeholder="Search materials…" className="w-full max-w-sm rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-sky-500" />}</div>
          {filteredResources.map((resource) => <article key={resource._id} className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-md"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-semibold">{resource.title}</h3><p className="mt-1 text-xs uppercase text-sky-400">{resource.resourceType}</p></div><span className={resource.accessType === 'premium' ? 'rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300' : 'rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300'}>{resource.accessType === 'premium' ? (resource.hasAccess ? 'Premium · Unlocked' : 'Premium · Locked') : 'Free'}</span></div>
            {resource.hasAccess && resource.textContent && <p className="mt-3 whitespace-pre-wrap text-slate-300">{resource.textContent}</p>}
            {resource.hasAccess && resource.answer && <p className="mt-3 text-slate-300"><strong>Answer:</strong> {resource.answer}</p>}
            {resource.hasAccess && resource.solution && <p className="mt-2 whitespace-pre-wrap text-slate-300"><strong>Solution:</strong> {resource.solution}</p>}
            {!resource.hasAccess && <><p className="mt-3 text-sm text-amber-200">Premium access is required. Complete payment and send your receipt for manual verification.</p><button type="button" onClick={() => setDownloadResource(resource)} className="mt-4 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-500">Pay &amp; Request Access</button></>}
            {resource.resourceType !== 'text' && <div className="mt-4 flex flex-wrap gap-2">
              {resource.hasAccess && <button type="button" onClick={() => openResource(resource)} className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold hover:bg-sky-500">Open {resource.resourceType}</button>}
              <button type="button" onClick={() => requestDownload(resource)} className="rounded-lg border border-amber-500/60 px-4 py-2 text-sm font-semibold text-amber-200 hover:bg-amber-500/10">Download</button>
            </div>}
          </article>)}
          {resources.length > 0 && !filteredResources.length && <p className="text-slate-400">No approved resources match your search.</p>}
          {!resources.length && <p className="text-slate-400">No approved resources are available at this step yet.</p>}
        </section>}
      </>}
      <DocumentViewerModal
        file={documentFile}
        onDownloadRequest={requestDownload}
        onClose={() => {
          if (documentFile?.url?.startsWith('blob:')) URL.revokeObjectURL(documentFile.url);
          setDocumentFile(null);
        }}
      />
      <PaymentMethodModal open={Boolean(downloadResource)} resource={downloadResource} onClose={() => setDownloadResource(null)} />

    </main>
  );
}
