import { useEffect, useState } from 'react';
import { apiFetch } from '../api/api';

const tiers = [
  { tier: 'elementary', label: 'Elementary' },
  { tier: 'highschool', label: 'High School' },
  { tier: 'university', label: 'University / College' },
  { tier: 'phd', label: 'PhD' },
  { tier: 'general', label: 'General / Skills & Training' },
];
const blank = {
  tiers: tiers.map((item) => ({ ...item, amountETB: '' })),
  paymentInstructions: { bankName: '', accountName: '', accountNumber: '', telebirrName: '', telebirrNumber: '', telegramUrl: '' },
};

export default function AdminPaymentPricing() {
  const [settings, setSettings] = useState(blank);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;
    apiFetch('payment-pricing/admin')
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Unable to load pricing.');
        if (active) setSettings({
          tiers: tiers.map((tier) => ({ ...tier, amountETB: data.tiers?.find((item) => item.tier === tier.tier)?.amountETB ?? '' })),
          paymentInstructions: { ...blank.paymentInstructions, ...(data.paymentInstructions || {}) },
        });
      })
      .catch((err) => { if (active) setError(err.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const updateTier = (tier, amountETB) => setSettings((old) => ({
    ...old, tiers: old.tiers.map((item) => item.tier === tier ? { ...item, amountETB } : item),
  }));
  const updateInstruction = (key, value) => setSettings((old) => ({
    ...old, paymentInstructions: { ...old.paymentInstructions, [key]: value },
  }));

  const save = async (event) => {
    event.preventDefault(); setSaving(true); setError(''); setMessage('');
    try {
      const response = await apiFetch('payment-pricing/admin', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Unable to save pricing.');
      setMessage(data.message || 'Pricing saved.');
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  if (loading) return <main className="mx-auto max-w-4xl p-6 text-slate-300">Loading payment settings…</main>;

  return (
    <main className="mx-auto max-w-4xl space-y-6 p-5 text-white">
      <header><p className="text-xs font-bold uppercase tracking-widest text-sky-400">Admin settings</p><h1 className="mt-2 text-3xl font-bold">Access Pricing & Payment Instructions</h1><p className="mt-2 text-slate-400">Set the Premium access amount for each education tier. Leave an amount empty if pricing has not been decided yet.</p></header>
      <form onSubmit={save} className="space-y-6">
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <h2 className="text-xl font-semibold">Access amounts (ETB)</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {settings.tiers.map((item) => <label key={item.tier} className="block text-sm text-slate-300">{item.label}<div className="mt-1 flex items-center rounded-xl border border-slate-700 bg-slate-950 px-3"><input type="number" min="0" step="0.01" value={item.amountETB ?? ''} onChange={(event) => updateTier(item.tier, event.target.value)} placeholder="Not set" className="min-w-0 flex-1 bg-transparent py-3 text-white outline-none" /><span className="text-xs text-slate-500">ETB</span></div></label>)}
          </div>
        </section>
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <h2 className="text-xl font-semibold">Payment instructions</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {[
              ['bankName', 'Bank name'], ['accountName', 'Bank account name'], ['accountNumber', 'Bank account number'],
              ['telebirrName', 'Telebirr account name'], ['telebirrNumber', 'Telebirr number'], ['telegramUrl', 'Telegram payment submission URL'],
            ].map(([key, label]) => <label key={key} className="block text-sm text-slate-300">{label}<input value={settings.paymentInstructions[key] || ''} onChange={(event) => updateInstruction(key, event.target.value)} placeholder={label} className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-white" /></label>)}
          </div>
        </section>
        {error && <p role="alert" className="rounded-lg bg-red-950 p-3 text-red-200">{error}</p>}
        {message && <p role="status" className="rounded-lg bg-green-950 p-3 text-green-200">{message}</p>}
        <button disabled={saving} className="rounded-xl bg-sky-600 px-6 py-3 font-semibold hover:bg-sky-500 disabled:opacity-50">{saving ? 'Saving…' : 'Save pricing & payment instructions'}</button>
      </form>
    </main>
  );
}
