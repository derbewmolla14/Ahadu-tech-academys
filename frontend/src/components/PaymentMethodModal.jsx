import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function PaymentMethodModal({ open, onClose, resource }) {
  const { user } = useContext(AuthContext);
  if (!open) return null;

  const telegramUsername = (import.meta.env.VITE_PAYMENT_TELEGRAM_USERNAME || '').replace(/^@/, '');
  const telegramUrl = import.meta.env.VITE_PAYMENT_TELEGRAM_URL
    || (telegramUsername ? `https://t.me/${telegramUsername}` : 'https://t.me/HorizonHydroOstechbot');
  const paymentDetails = {
    bankName: import.meta.env.VITE_PAYMENT_BANK_NAME || '',
    accountName: import.meta.env.VITE_PAYMENT_ACCOUNT_NAME || '',
    accountNumber: import.meta.env.VITE_PAYMENT_ACCOUNT_NUMBER || '',
    telebirrName: import.meta.env.VITE_TELEBIRR_ACCOUNT_NAME || '',
    telebirrNumber: import.meta.env.VITE_TELEBIRR_PHONE || '',
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/75 p-3 sm:p-5" role="dialog" aria-modal="true" aria-labelledby="download-payment-title">
      <section className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-2xl sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-widest text-amber-400">Download access request</p>
            <h2 id="download-payment-title" className="mt-2 text-xl font-bold text-white sm:text-2xl">Payment method</h2>
            <p className="mt-1 break-words text-sm text-slate-400">{resource?.title || resource?.fileName || 'Selected learning resource'}</p>
            <p className="mt-1 text-xs text-slate-500">{resource?.type || resource?.resourceType || 'File'} · {resource?.accessType === 'free' ? 'Free resource' : resource?.accessType === 'premium' ? 'Premium resource' : 'Download access'}</p>
          </div>
          <button type="button" onClick={onClose} className="shrink-0 rounded-lg px-3 py-2 text-slate-300 hover:bg-slate-800" aria-label="Close payment instructions">✕</button>
        </div>
        <p className="mt-4 text-sm leading-6 text-slate-300">Download access is granted only after an administrator approves your request. This applies to free and premium resources.</p>
        <div className="mt-4 space-y-3 rounded-xl border border-slate-700 bg-slate-950 p-4">
          <h3 className="font-semibold text-white">Bank transfer</h3>
          {paymentDetails.bankName && <p className="text-sm text-slate-300">Bank: <strong>{paymentDetails.bankName}</strong></p>}
          {paymentDetails.accountName && <p className="text-sm text-slate-300">Account name: <strong>{paymentDetails.accountName}</strong></p>}
          {paymentDetails.accountNumber && <p className="text-sm text-slate-300">Account number: <strong>{paymentDetails.accountNumber}</strong></p>}
          {!paymentDetails.bankName && !paymentDetails.accountNumber && <p className="text-sm text-amber-200">Bank details have not been configured.</p>}
        </div>
        <div className="mt-3 space-y-2 rounded-xl border border-slate-700 bg-slate-950 p-4">
          <h3 className="font-semibold text-white">Telebirr</h3>
          {paymentDetails.telebirrName && <p className="text-sm text-slate-300">Account name: <strong>{paymentDetails.telebirrName}</strong></p>}
          {paymentDetails.telebirrNumber && <p className="text-sm text-slate-300">Telebirr number: <strong>{paymentDetails.telebirrNumber}</strong></p>}
          {!paymentDetails.telebirrName && !paymentDetails.telebirrNumber && <p className="text-sm text-amber-200">Telebirr details have not been configured.</p>}
        </div>
        <section className="mt-4 rounded-xl border border-sky-500/30 bg-sky-500/10 p-4">
          <h3 className="font-semibold text-white">Send payment screenshot via Telegram</h3>
          <p className="mt-2 text-sm leading-6 text-slate-200">Send a clear receipt screenshot and include the following details in your message:</p>
          <ul className="mt-2 space-y-1 text-sm text-slate-200">
            <li><strong>Registered name:</strong> {user?.fullName || 'Your account name'}</li>
            <li><strong>Registered email:</strong> {user?.email || 'Your account email'}</li>
            <li><strong>Selected resource:</strong> {resource?.title || resource?.fileName || 'Selected learning resource'}</li>
            <li><strong>Payment method:</strong> Bank transfer or Telebirr</li>
          </ul>
          <a href={telegramUrl} target="_blank" rel="noopener noreferrer" className="mt-4 block rounded-xl bg-sky-600 px-4 py-3 text-center font-semibold text-white hover:bg-sky-500">Send Payment Screenshot via Telegram</a>
          <p className="mt-2 break-all text-xs text-slate-400">Telegram contact: {telegramUrl}</p>
        </section>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-slate-300">
          <li>Pay the amount communicated by the academy, or ask whether the free resource requires a fee.</li>
          <li>Send the receipt screenshot and account/resource details through Telegram.</li>
          <li>Wait for an administrator to verify and approve your download access.</li>
          <li>After approval, click Download again to receive the file.</li>
        </ol>
        <button type="button" onClick={onClose} className="mt-3 w-full rounded-xl border border-slate-700 px-4 py-3 text-sm text-slate-300 hover:bg-slate-800">Close</button>
      </section>
    </div>
  );
}
