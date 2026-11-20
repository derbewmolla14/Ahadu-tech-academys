import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../api/api';

export default function PremiumCourseAccessAdmin() {
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState({});
  const [transactionReferences, setTransactionReferences] = useState({});
  const [loading, setLoading] = useState(true);
  const [busyKey, setBusyKey] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const downloadableCourses = useMemo(() => courses.filter(course => course.isActive !== false), [courses]);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [coursesResponse, studentsResponse] = await Promise.all([
        apiFetch('content/admin/all'),
        apiFetch('content/admin/students')
      ]);
      const [coursesResult, studentsResult] = await Promise.all([coursesResponse.json(), studentsResponse.json()]);
      if (!coursesResponse.ok || !coursesResult.success) throw new Error(coursesResult.message || 'Unable to load courses.');
      if (!studentsResponse.ok || !studentsResult.success) throw new Error(studentsResult.message || 'Unable to load students.');
      setCourses(coursesResult.data || []);
      setStudents(studentsResult.data || []);
    } catch (err) {
      setError(err.message || 'Unable to load premium access data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const hasAccess = (student, courseId) => (student.unlockedCourseContents || []).some(item => String(item?._id || item) === String(courseId));

  const toggleCoursePremium = async (course) => {
    setError(''); setMessage('');
    try {
      const response = await apiFetch(`content/${course._id}/premium`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isPremium: !course.isPremium }) });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || 'Unable to change course access type.');
      setMessage(result.message); await load();
    } catch (err) { setError(err.message || 'Unable to change course access type.'); }
  };

  const changeAccess = async (course, student, grant) => {
    const key = course._id + ':' + student._id;
    setBusyKey(key);
    setError('');
    setMessage('');
    try {
      const response = await apiFetch(
        grant ? `content/${course._id}/unlock` : `content/${course._id}/unlock/${student._id}`,
        grant
          ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: student._id, transactionReference: transactionReferences[course._id] || '' }) }
          : { method: 'DELETE' }
      );
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || 'Unable to update course access.');
      setMessage(result.message);
      await load();
    } catch (err) {
      setError(err.message || 'Unable to update course access.');
    } finally {
      setBusyKey('');
    }
  };

  return (
    <main className="mx-auto min-h-screen max-w-7xl space-y-7 bg-slate-950 p-6 text-white">
      <header className="rounded-3xl border border-slate-800 bg-slate-900 p-8">
        <Link to="/admin/dashboard" className="text-sm text-sky-400 hover:underline">← Admin Dashboard</Link>
        <h1 className="mt-4 text-3xl font-bold">Course Download Access Approval</h1>
        <p className="mt-2 text-slate-400">After checking a student's payment receipt sent through Telegram, approve or revoke downloads for that specific course for that student.</p>
      </header>
      {error && <div role="alert" className="rounded-xl border border-red-700 bg-red-950/40 p-4 text-red-200">{error}</div>}
      {message && <div role="status" className="rounded-xl border border-emerald-700 bg-emerald-950/30 p-4 text-emerald-200">{message}</div>}
      {loading ? <div className="rounded-2xl bg-slate-900 p-8 text-center text-slate-300">Loading courses and students…</div> :
        downloadableCourses.length === 0 ? <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-300">No active courses are available to approve yet.</div> :
        <div className="space-y-5">
          {downloadableCourses.map(course => (
            <section key={course._id} className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300">Download approval · {course.isActive ? 'Active' : 'Inactive'}</span>
                  <h2 className="mt-3 text-xl font-semibold">{course.course}</h2>
                  <span className={course.isPremium ? 'mt-2 inline-flex rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-300' : 'mt-2 inline-flex rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-300'}>{course.isPremium ? '🔒 PREMIUM' : 'FREE'}</span>
                  <button type="button" onClick={() => toggleCoursePremium(course)} className="mt-3 block rounded-lg border border-amber-500/50 px-3 py-2 text-sm text-amber-200">{course.isPremium ? 'Set Free' : 'Make Premium'}</button>
                  <p className="mt-1 text-sm text-slate-400">{course.faculty} · {course.studyStage} · {course.department} · {course.year}</p>
                  {course.description && <p className="mt-2 text-sm text-slate-300">{course.description}</p>}
                </div>
              </div>
              {course.isPremium && <label className="mt-5 block text-sm font-medium text-slate-300">Verified bank / Telebirr transaction reference<input value={transactionReferences[course._id] || ""} onChange={event => setTransactionReferences(prev => ({ ...prev, [course._id]: event.target.value }))} placeholder="Enter receipt transaction ID" className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white" /></label>}
              <div className="mt-5 grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
                <select value={selectedStudent[course._id] || ''} onChange={event => setSelectedStudent(prev => ({ ...prev, [course._id]: event.target.value }))} className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white">
                  <option value="">Select a student</option>
                  {students.map(student => <option key={student._id} value={student._id}>{student.fullName || student.email} — {student.email}</option>)}
                </select>
                <button type="button" disabled={!selectedStudent[course._id] || Boolean(busyKey) || (course.isPremium && String(transactionReferences[course._id] || '').trim().length < 5)} onClick={() => { const student = students.find(item => item._id === selectedStudent[course._id]); if (student) changeAccess(course, student, !hasAccess(student, course._id)); }} className="rounded-xl bg-sky-600 px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">
                  {busyKey.startsWith(course._id + ':') ? 'Updating…' : selectedStudent[course._id] && hasAccess(students.find(item => item._id === selectedStudent[course._id]) || {}, course._id) ? 'Revoke access' : 'Approve Download Access'}
                </button>
              </div>
              <p className="mt-3 text-xs text-slate-400">For Premium: verify the bank/Telebirr receipt, enter its transaction reference, then approve. Duplicate references are rejected. Free-course approvals do not create payments or referral commissions.</p>
            </section>
          ))}
        </div>
      }
    </main>
  );
}
