import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';

const inputClass = 'rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white';
const money = (value) => new Intl.NumberFormat('en-ET', { style: 'currency', currency: 'ETB', maximumFractionDigits: 2 }).format(Number(value || 0));

export default function AdminReferrals() {
  const [users, setUsers] = useState([]);
  const [rates, setRates] = useState({ direct: 10, indirect: 5 });
  const [financials, setFinancials] = useState({});
  const [assignments, setAssignments] = useState({});
  const [payoutDrafts, setPayoutDrafts] = useState({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = async () => {
    setLoading(true); setError('');
    try {
      const response = await api.get('/referrals/admin');
      const nextUsers = response.data.users || [];
      setUsers(nextUsers);
      setRates(response.data.rates || { direct: 10, indirect: 5 });
      setFinancials(response.data.financials || {});
      setAssignments(Object.fromEntries(nextUsers.map(user => [user._id, user.referrer?._id || ''])));
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

  const recordPayout = async (userId) => {
    const draft = payoutDrafts[userId] || {};
    setBusy(true); setError(''); setMessage('');
    try {
      const response = await api.post('/referrals/admin/' + userId + '/payout', {
        amountETB: draft.amountETB,
        transactionReference: draft.transactionReference,
        note: draft.note || '',
      });
      setMessage(response.data.message || 'Payout recorded.');
      setPayoutDrafts(prev => ({ ...prev, [userId]: { amountETB: '', transactionReference: '', note: '' } }));
      await load();
    } catch (err) { setError(err.response?.data?.message || 'Unable to record this payout.'); }
    finally { setBusy(false); }
  };

  return <main className="mx-auto min-h-screen max-w-7xl space-y-6 bg-slate-950 p-6 text-white">
    <header className="rounded-3xl border border-slate-800 bg-slate-900 p-7">
      <Link to="/admin/dashboard" className="text-sm text-sky-400 hover:underline">← Admin Dashboard</Link>
      <h1 className="mt-3 text-3xl font-bold">Referral Administration</h1>
      <p className="mt-2 text-sm text-slate-400">Manage referral attribution, commission rates, and verified commission payouts. Payout records are admin-only and require a unique transfer reference.</p>
      <div className="mt-5 flex flex-wrap gap-3">
        <Link to="/admin/payment-pricing" className="rounded-lg border border-sky-500/40 bg-sky-500/10 px-4 py-2.5 text-sm font-semibold text-sky-300 hover:bg-sky-500/20">Configure course prices</Link>
        <Link to="/admin/premium-course-access" className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-2.5 text-sm font-semibold text-emerald-300 hover:bg-emerald-500/20">Verify receipts & approve access</Link>
      </div>
    </header>
    {error && <div role="alert" className="rounded-xl border border-red-700 bg-red-950/40 p-4 text-red-200">{error}</div>}
    {message && <div role="status" className="rounded-xl border border-emerald-700 bg-emerald-950/30 p-4 text-emerald-200">{message}</div>}
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <h2 className="text-xl font-bold">Commission rates</h2>
      <p className="mt-1 text-sm text-slate-400">Applied to verified premium-course payments. Combined rates cannot exceed 100%. Second-level commission remains based on the payer's level-2 referrer; deeper descendants are included in downline counts.</p>
      <form onSubmit={saveRates} className="mt-4 flex flex-wrap items-end gap-4">
        <label className="text-sm">Direct referral (%)<input type="number" min="0" max="100" step="0.01" value={rates.direct} onChange={e => setRates(prev => ({ ...prev, direct: e.target.value }))} className={inputClass + ' mt-1 block'}/></label>
        <label className="text-sm">Second-level referral (%)<input type="number" min="0" max="100" step="0.01" value={rates.indirect} onChange={e => setRates(prev => ({ ...prev, indirect: e.target.value }))} className={inputClass + ' mt-1 block'}/></label>
        <button disabled={busy} className="rounded-lg bg-sky-600 px-5 py-2.5 font-semibold disabled:opacity-50">{busy ? 'Saving…' : 'Save rates'}</button>
      </form>
    </section>
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-bold">User referral attribution & payouts</h2><button onClick={load} className="rounded-lg border border-slate-700 px-4 py-2 text-sm">Refresh</button></div>
      {loading ? <p className="py-8 text-center text-slate-400">Loading referral users…</p> : <div className="mt-4 space-y-4">
        {users.map(user => {
          const totals = financials[user._id] || {};
          const draft = payoutDrafts[user._id] || {};
          return <article key={user._id} className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div><h3 className="font-semibold">{user.fullName || 'User'}</h3><p className="text-xs text-slate-400">{user.email} · Code: {user.referralCode || '—'}</p><p className="mt-1 text-xs text-slate-400">Current referrer: {user.referrer?.fullName || user.referrer?.email || 'None'}</p><p className="mt-1 text-xs text-slate-400">Payout account: {user.payoutAccount?.provider ? user.payoutAccount.provider + ' · ' + user.payoutAccount.accountName + ' · ' + user.payoutAccount.accountNumber : 'Not provided'}</p></div>
              <div className="grid grid-cols-3 gap-2 text-right text-xs">
                <div><p className="text-slate-400">Earned</p><p className="mt-1 font-bold text-emerald-300">{money(totals.earnedETB)}</p></div>
                <div><p className="text-slate-400">Paid out</p><p className="mt-1 font-bold">{money(totals.paidOutETB)}</p></div>
                <div><p className="text-slate-400">Remaining</p><p className="mt-1 font-bold text-amber-300">{money(totals.remainingETB)}</p></div>
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <select aria-label={'Referrer for ' + user.email} className={inputClass + ' min-w-52 flex-1'} value={assignments[user._id] || ''} onChange={e => setAssignments(prev => ({ ...prev, [user._id]: e.target.value }))}>
                <option value="">No referrer</option>{users.filter(item => item._id !== user._id).map(item => <option key={item._id} value={item._id}>{item.fullName || item.email} — {item.email}</option>)}
              </select>
              <button disabled={busy || assignments[user._id] === (user.referrer?._id || '')} onClick={() => saveReferrer(user._id)} className="rounded-lg bg-fuchsia-700 px-4 py-2 font-semibold disabled:opacity-40">Save referrer</button>
            </div>
            <form onSubmit={event => { event.preventDefault(); recordPayout(user._id); }} className="mt-4 grid gap-2 sm:grid-cols-[1fr_1.5fr_1fr_auto]">
              <input aria-label="Payout amount ETB" type="number" min="0.01" step="0.01" max={totals.remainingETB || 0} required placeholder="Amount (ETB)" value={draft.amountETB || ''} onChange={e => setPayoutDrafts(prev => ({ ...prev, [user._id]: { ...prev[user._id], amountETB: e.target.value } }))} className={inputClass}/>
              <input aria-label="Bank or wallet transfer reference" required maxLength="80" placeholder="Unique transfer reference" value={draft.transactionReference || ''} onChange={e => setPayoutDrafts(prev => ({ ...prev, [user._id]: { ...prev[user._id], transactionReference: e.target.value } }))} className={inputClass}/>
              <input aria-label="Payout note" maxLength="240" placeholder="Note (optional)" value={draft.note || ''} onChange={e => setPayoutDrafts(prev => ({ ...prev, [user._id]: { ...prev[user._id], note: e.target.value } }))} className={inputClass}/>
              <button type="submit" disabled={busy || !(totals.remainingETB > 0)} className="rounded-lg bg-emerald-700 px-4 py-2 font-semibold disabled:opacity-40">Record payout</button>
            </form>
          </article>;
        })}
        {!users.length && <p className="p-6 text-center text-slate-400">No users found.</p>}
      </div>}
    </section>
  </main>;
}
