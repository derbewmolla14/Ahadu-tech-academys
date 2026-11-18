import { useContext, useEffect, useMemo, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { apiFetch } from '../api/api';

const normalizeTier = (resource) => {
  const raw = String(resource?.pricingTier || resource?.category || resource?.level || '').trim().toLowerCase();
  if (raw.includes('phd') || raw.includes('doctor')) return 'phd';
  if (raw.includes('elementary') || raw.includes('primary')) return 'elementary';
  if (raw.includes('highschool') || raw.includes('high school') || raw.includes('secondary')) return 'highschool';
  if (raw.includes('coding') || raw.includes('general') || raw.includes('training') || raw.includes('skill')) return 'general';
  if (raw.includes('university') || raw.includes('college') || raw.includes('freshman') || raw.includes('remedial') || raw.includes('senior') || raw.includes('diploma') || resource?.faculty) return 'university';
  return '';
};

export default function PaymentMethodModal({ open, onClose, resource }) {
  const { user } = useContext(AuthContext);
  const [pricing, setPricing] = useState(null);
  const [pricingError, setPricingError] = useState('');
  const tier = useMemo(() => normalizeTier(resource), [resource]);

  useEffect(() => {
    if (!open) return undefined;
    let active = true;
    setPricingError('');
    apiFetch('payment-pricing')
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Unable to load payment details.');
        if (active) setPricing(data);
      })
      .catch((error) => { if (active) setPricingError(error.message); });
    return () => { active = false; };
  }, [open]);

  if (!open) return null;

  const tierPrice = pricing?.tiers?.find((item) => item.tier === tier)?.amountETB;
  const instructions = pricing?.paymentInstructions || {};
  const bankName = instructions.bankName || import.meta.env.VITE_PAYMENT_BANK_NAME || '';
  const accountName = instructions.accountName || import.meta.env.VITE_PAYMENT_ACCOUNT_NAME || '';
  const accountNumber = instructions.accountNumber || import.meta.env.VITE_PAYMENT_ACCOUNT_NUMBER || '';
  const telebirrName = instructions.telebirrName || import.meta.env.VITE_TELEBIRR_ACCOUNT_NAME || '';
  const telebirrNumber = instructions.telebirrNumber || import.meta.env.VITE_TELEBIRR_PHONE || '';
  const envTelegram = import.meta.env.VITE_PAYMENT_TELEGRAM_URL || (import.meta.env.VITE_PAYMENT_TELEGRAM_USERNAME ? `https://t.me/${String(import.meta.env.VITE_PAYMENT_TELEGRAM_USERNAME).replace(/^@/, '')}` : '');
  const telegramUrl = instructions.telegramUrl || envTelegram || 'https://t.me/';
  const hasTelegramContact = Boolean(instructions.telegramUrl || envTelegram);
  const tierLabel = pricing?.tiers?.find((item) => item.tier === tier)?.label || resource?.category || resource?.level || 'Selected learning tier';

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/75 p-3 sm:p-5" role="dialog" aria-modal="true" aria-labelledby="download-payment-title">
      <section className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-2xl sm:p-6">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-widest text-amber-400">Access request</p>
          <h2 id="download-payment-title" className="mt-2 text-xl font-bold text-white sm:text-2xl">Payment method</h2>
          <p className="mt-1 break-words text-sm text-slate-400">{resource?.title || resource?.fileName || 'Selected learning resource'}</p>
          <p className="mt-1 text-xs text-slate-500">{tierLabel} · {resource?.type || resource?.resourceType || 'Learning resource'}</p>
        </div>
        <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-300">Premium access amount</p>
          {pricingError ? <p className="mt-2 text-sm text-amber-100">Payment amount is currently unavailable. Please contact the administrator.</p>
            : tierPrice !== null && tierPrice !== undefined && tierPrice !== '' ? <p className="mt-1 text-3xl font-bold text-white">{Number(tierPrice).toLocaleString()} ETB</p>
              : <p className="mt-2 text-sm text-amber-100">Pricing for this category is being updated by the administrator. Please check again later before making a payment.</p>}
        </div>
        <p className="mt-4 text-sm leading-6 text-slate-300">Access is unlocked after an administrator verifies the payment and approves your account for this resource. Do not send payment if the amount has not been configured.</p>
        <div className="mt-4 space-y-3 rounded-xl border border-slate-700 bg-slate-950 p-4">
          <h3 className="font-semibold text-white">Bank transfer</h3>
          {bankName && <p className="text-sm text-slate-300">Bank: <strong>{bankName}</strong></p>}
          {accountName && <p className="text-sm text-slate-300">Account name: <strong>{accountName}</strong></p>}
          {accountNumber && <p className="text-sm text-slate-300">Account number: <strong>{accountNumber}</strong></p>}
          {!bankName && !accountNumber && <p className="text-sm text-amber-200">Bank details have not been configured.</p>}
        </div>
        <div className="mt-3 space-y-2 rounded-xl border border-slate-700 bg-slate-950 p-4">
          <h3 className="font-semibold text-white">Telebirr</h3>
          {telebirrName && <p className="text-sm text-slate-300">Account name: <strong>{telebirrName}</strong></p>}
          {telebirrNumber && <p className="text-sm text-slate-300">Telebirr number: <strong>{telebirrNumber}</strong></p>}
          {!telebirrName && !telebirrNumber && <p className="text-sm text-amber-200">Telebirr details have not been configured.</p>}
        </div>
        <section className="mt-4 rounded-xl border border-sky-500/30 bg-sky-500/10 p-4">
          <h3 className="font-semibold text-white">Send payment screenshot via Telegram</h3>
          <p className="mt-2 text-sm leading-6 text-slate-200">After making the configured payment, send the receipt screenshot and include:</p>
          <ul className="mt-2 space-y-1 text-sm text-slate-200">
            <li><strong>Registered name:</strong> {user?.fullName || 'Your account name'}</li>
            <li><strong>Registered email:</strong> {user?.email || 'Your account email'}</li>
            <li><strong>Resource:</strong> {resource?.title || 'Selected learning resource'}</li>
            <li><strong>Category:</strong> {tierLabel}</li>
          </ul>
          <a href={telegramUrl} target="_blank" rel="noopener noreferrer" className="mt-4 block rounded-xl bg-sky-600 px-4 py-3 text-center font-semibold text-white hover:bg-sky-500">Send Payment Screenshot via Telegram</a>
          {!hasTelegramContact && <p className="mt-2 text-xs text-amber-200">Telegram submission link has not been configured by the administrator.</p>}
        </section>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-slate-300">
          <li>Confirm the amount and payment details with the academy.</li>
          <li>Send your receipt screenshot using the Telegram button.</li>
          <li>Wait for administrator verification and approval.</li>
          <li>Return to the resource after approval to open or download it.</li>
        </ol>
        <button type="button" onClick={onClose} className="mt-5 w-full rounded-xl bg-slate-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-slate-900">Close</button>
      </section>
    </div>
  );
}
