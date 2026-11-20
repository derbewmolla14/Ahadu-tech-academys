import { useEffect, useState } from 'react';
import { Copy, Share2, Users, Wallet, TrendingUp } from 'lucide-react';
import api from '../api/api';

const money = (value) => new Intl.NumberFormat('en-ET', { style: 'currency', currency: 'ETB', maximumFractionDigits: 2 }).format(Number(value || 0));

export default function ReferralDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let active = true;
    api.get('/referrals/mine').then((response) => { if (active) setData(response.data); })
      .catch((err) => { if (active) setError(err.response?.data?.message || 'Unable to load referral dashboard.'); });
    return () => { active = false; };
  }, []);

  const link = data?.referralLink?.startsWith('/') ? window.location.origin + data.referralLink : data?.referralLink || '';
  const copyLink = async () => {
    await navigator.clipboard.writeText(link);
    setCopied(true);
  };
  const shareLink = async () => {
    if (navigator.share) await navigator.share({ title: 'Join Ahadu Tech Academy', text: 'Register using my referral link.', url: link });
    else await copyLink();
  };

  return <main className="mx-auto max-w-6xl space-y-6 text-[var(--app-text)]">
    <header className="rounded-3xl border border-[var(--app-border)] bg-[var(--app-card)] p-6 sm:p-8">
      <p className="text-xs font-bold uppercase tracking-widest text-sky-500">Community growth</p>
      <h1 className="mt-2 text-3xl font-bold">My Referrals</h1>
      <p className="mt-2 text-sm text-[var(--app-muted)]">Share your link, follow direct and second-level referrals, and track commissions from verified premium-course payments.</p>
    </header>
    {error && <div role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-rose-600">{error}</div>}
    {!data ? <div className="rounded-2xl border border-[var(--app-border)] p-8">Loading referral information…</div> : <>
      <section className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-card)] p-5">
        <h2 className="font-bold">Your personal referral link</h2>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <input readOnly value={link} className="min-w-0 flex-1 rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] px-4 py-3 text-sm" />
          <button onClick={copyLink} className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-3 font-semibold text-white"><Copy size={16}/>{copied ? 'Copied' : 'Copy link'}</button>
          <button onClick={shareLink} className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--app-border)] px-4 py-3 font-semibold"><Share2 size={16}/>Share</button>
        </div>
        <p className="mt-2 text-xs text-[var(--app-muted)]">Referral code: {data.referralCode}</p>
      </section>
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Stat icon={Users} label="Direct referrals" value={data.counts?.direct || 0}/>
        <Stat icon={Users} label="Second-level+ referrals" value={data.counts?.indirect || 0}/>
        <Stat icon={Wallet} label="Total earned commission" value={money(data.earningsETB)}/>
        <Stat icon={Wallet} label="Paid out / sent" value={money(data.paidOutETB)}/>
        <Stat icon={Wallet} label="Remaining balance" value={money(data.remainingBalanceETB)}/>
        <Stat icon={TrendingUp} label="Commission records" value={data.commissions?.length || 0}/>
      </section>
      <section className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-card)] p-5">
        <h2 className="text-lg font-bold">Commission history</h2>
        <p className="mt-1 text-sm text-[var(--app-muted)]">Commissions appear only after an administrator verifies a payment receipt and approves premium access.</p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[620px] text-left text-sm"><thead><tr className="border-b border-[var(--app-border)] text-[var(--app-muted)]"><th className="p-3">Transaction</th><th className="p-3">Level</th><th className="p-3">Paid amount</th><th className="p-3">Rate</th><th className="p-3">Commission</th><th className="p-3">Date</th></tr></thead>
            <tbody>{(data.commissions || []).map((item, index) => <tr key={item.transactionReference + index} className="border-b border-[var(--app-border)]"><td className="p-3">{item.transactionReference}</td><td className="p-3">{item.level === 1 ? 'Direct' : 'Second level'}</td><td className="p-3">{money(item.paidAmountETB)}</td><td className="p-3">{item.commissionPercent}%</td><td className="p-3 font-semibold">{money(item.commissionETB)}</td><td className="p-3">{new Date(item.createdAt).toLocaleDateString()}</td></tr>)}
              {!data.commissions?.length && <tr><td colSpan="6" className="p-6 text-center text-[var(--app-muted)]">No verified referral commissions yet.</td></tr>}</tbody>
          </table>
        </div>
      </section>
    </>}
  </main>;
}

function Stat({ icon: Icon, label, value }) {
  return <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-card)] p-5"><Icon className="text-sky-500" size={20}/><p className="mt-3 text-sm text-[var(--app-muted)]">{label}</p><p className="mt-1 text-2xl font-bold">{value}</p></div>;
}
