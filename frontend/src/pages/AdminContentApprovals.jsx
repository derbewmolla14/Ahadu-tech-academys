import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../api/api';

export default function AdminContentApprovals() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiFetch('content/admin/all');
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || 'Unable to load uploads.');
      setItems(Array.isArray(result.data) ? result.data : []);
    } catch (err) {
      setError(err.message || 'Unable to load uploads.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const setStatus = async (id, status) => {
    try {
      setBusyId(id); setError(''); setMessage('');
      const response = await apiFetch('content/' + id + '/approval', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || 'Unable to update approval.');
      setMessage(result.message || 'Approval updated.');
      await load();
    } catch (err) {
      setError(err.message || 'Unable to update approval.');
    } finally {
      setBusyId('');
    }
  };

  const pending = items.filter(item => item.status !== 'approved');

  return (
    <main className="min-h-screen bg-slate-950 p-5 text-white sm:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <Link to="/admin/dashboard" className="text-sm text-sky-400 hover:text-sky-300">← Admin Dashboard</Link>
          <h1 className="mt-3 text-3xl font-bold">Course & Resource Approvals</h1>
          <p className="mt-2 text-slate-400">Only content explicitly approved here is visible to students.</p>
          <p className="mt-3 text-sm text-slate-300">Total uploads: {items.length} · Awaiting review: {pending.length}</p>
        </header>
        {error && <p role="alert" className="rounded-xl border border-red-800 bg-red-950/40 p-4 text-red-200">{error}</p>}
        {message && <p className="rounded-xl border border-green-800 bg-green-950/30 p-4 text-green-200">{message}</p>}
        {loading ? <p className="py-12 text-center text-slate-400">Loading uploads…</p> : items.length ? (
          <section className="space-y-3">
            {items.map(item => (
              <article key={item._id} className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="text-lg font-semibold">{item.course}</h2>
                    <p className="mt-1 text-sm text-slate-400">{item.level} · {item.faculty} · {item.studyStage} · {item.department}</p>
                    <p className="mt-1 text-xs text-slate-500">Uploader: {item.createdBy || 'Legacy upload'} · Type: {item.contentType || 'course-materials'}</p>
                    <p className="mt-2 text-sm">Status: <span className={(item.status === 'approved' || item.isApproved) ? 'text-green-300' : item.status === 'rejected' ? 'text-red-300' : 'text-amber-300'}>{item.isApproved || item.status === 'approved' ? 'approved' : (item.status || 'legacy / unapproved')}</span></p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button disabled={busyId === item._id || !item.createdBy} onClick={() => setStatus(item._id, 'approved')} className="rounded-lg bg-green-700 px-4 py-2 text-sm font-medium hover:bg-green-600 disabled:opacity-40">Approve</button>
                    <button disabled={busyId === item._id || !item.createdBy} onClick={() => setStatus(item._id, 'rejected')} className="rounded-lg bg-red-900 px-4 py-2 text-sm font-medium hover:bg-red-800 disabled:opacity-40">Reject</button>
                    {item.status !== 'pending' && item.createdBy && <button disabled={busyId === item._id} onClick={() => setStatus(item._id, 'pending')} className="rounded-lg bg-slate-700 px-4 py-2 text-sm hover:bg-slate-600 disabled:opacity-40">Set pending</button>}
                  </div>
                </div>
                {!item.createdBy && <p className="mt-3 text-sm text-amber-300">This older record has no uploader identity. Re-upload it through the admin account before approving.</p>}
              </article>
            ))}
          </section>
        ) : <p className="rounded-xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">No uploads found.</p>}
      </div>
    </main>
  );
}
