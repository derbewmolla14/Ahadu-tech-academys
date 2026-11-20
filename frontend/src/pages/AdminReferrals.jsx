import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';

const inputClass = 'rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white';

export default function AdminReferrals() {
  const [users, setUsers] = useState([]);
  const [rates, setRates] = useState({ direct: 10, indirect: 5 });
  const [assignments, setAssignments] = useState({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = async () => {
    setLoading(true); setError('');
    try {
      const response = await api.get('/referrals/admin');
      setUsers(response.data.users || []);
      setRates(response.data.rates || { direct: 10, indirect: 5 });
      setAssignments(Object.fromEntries((response.data.users || []).map(user => [user._id, user.referrer?._id || ''])));
    } catch (err) { setError(err.response?.data?.message || 'Unable to load referral records.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const saveReferrer = async (userId) => {
    setBusy(true); setError(''); setMessage('');
    try {
      const response = await api.patch('/referrals/admin/' + userId + '/referrer', { referrerId: assignments[userId] || null });
      setMessage(response.data.message || 'Referral attribution updated.');
      await load();
    } catch (err) { setError(err.response?.data?.message || 'Unable to update this referrer.'); }
    finally { setBusy(false); }
  };

  const saveRates = async (event) => {
    event.preventDefault(); setBusy(true); setError(''); setMessage('');
    try {
      const response = await api.put('/referrals/admin/settings', rates);
      setRates(response.data.rates);
      setMessage(response.data.message || 'Commission rates saved.');
    } catch (err) { setError(err.response?.data?.message || 'Unable to save commission rates.'); }
    finally { setBusy(false); }
  };

  return <main className="mx-auto min-h-screen max-w-7xl space-y-6 bg-slate-950 p-6 text-white">
    <header className="rounded-3xl border border-slate-800 bg-slate-900 p-7">
      <Link to="/admin/dashboard" className="text-sm text-sky-400 hover:underline">← Admin Dashboard</Link>
      <h1 className="mt-3 text-3xl font-bold">Referral Administration</h1>
      <p className="mt-2 text-sm text-slate-400">Only administrators can assign or change referral attribution. Users cannot edit referral relationships.</p>
    </header>
    {error && <div role="alert" className="rounded-xl border border-red-700 bg-red-950/40 p-4 text-red-200">{error}</div>}
    {message && <div role="status" className="rounded-xl border border-emerald-700 bg-emerald-950/30 p-4 text-emerald-200">{message}</div>}
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <h2 className="text-xl font-bold">Commission rates</h2>
      <p className="mt-1 text-sm text-slate-400">Applied to verified premium-course payments. Combined rates cannot exceed 100%.</p>
      <form onSubmit={saveRates} className="mt-4 flex flex-wrap items-end gap-4">
        <label className="text-sm">Direct referral (%)<input type="number" min="0" max="100" step="0.01" value={rates.direct} onChange={e => setRates(prev => ({ ...prev, direct: e.target.value }))} className={inputClass + ' mt-1 block'}/></label>
        <label className="text-sm">Second-level referral (%)<input type="number" min="0" max="100" step="0.01" value={rates.indirect} onChange={e => setRates(prev => ({ ...prev, indirect: e.target.value }))} className={inputClass + ' mt-1 block'}/></label>
        <button disabled={busy} className="rounded-lg bg-sky-600 px-5 py-2.5 font-semibold disabled:opacity-50">{busy ? 'Saving…' : 'Save rates'}</button>
      </form>
    </section>
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-bold">User referral attribution</h2><button onClick={load} className="rounded-lg border border-slate-700 px-4 py-2 text-sm">Refresh</button></div>
      {loading ? <p className="py-8 text-center text-slate-400">Loading referral users…</p> : <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm"><thead><tr className="border-b border-slate-700 text-slate-400"><th className="p-3">User</th><th className="p-3">Referral code</th><th className="p-3">Current referrer</th><th className="p-3">Change attribution</th></tr></thead><tbody>
          {users.map(user => <tr key={user._id} className="border-b border-slate-800"><td className="p-3"><div className="font-semibold">{user.fullName || 'User'}</div><div className="text-xs text-slate-400">{user.email}</div></td><td className="p-3">{user.referralCode || '—'}</td><td className="p-3">{user.referrer?.fullName || user.referrer?.email || 'No referrer'}</td><td className="p-3"><div className="flex gap-2"><select className={inputClass + ' min-w-52'} value={assignments[user._id] || ''} onChange={e => setAssignments(prev => ({ ...prev, [user._id]: e.target.value }))}><option value="">No referrer</option>{users.filter(item => item._id !== user._id).map(item => <option key={item._id} value={item._id}>{item.fullName || item.email} — {item.email}</option>)}</select><button disabled={busy || assignments[user._id] === (user.referrer?._id || '')} onClick={() => saveReferrer(user._id)} className="rounded-lg bg-fuchsia-700 px-3 py-2 font-semibold disabled:opacity-40">Save</button></div></td></tr>)}
          {!users.length && <tr><td colSpan="4" className="p-6 text-center text-slate-400">No users found.</td></tr>}
        </tbody></table>
      </div>}
    </section>
  </main>;
}
