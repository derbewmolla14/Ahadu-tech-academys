export default function PaymentMethodModal({ open, onClose, resource }) {
  if (!open) return null;

  const paymentDetails = {
    bankName: import.meta.env.VITE_PAYMENT_BANK_NAME || '',
    accountName: import.meta.env.VITE_PAYMENT_ACCOUNT_NAME || '',
    accountNumber: import.meta.env.VITE_PAYMENT_ACCOUNT_NUMBER || '',
    telebirrName: import.meta.env.VITE_TELEBIRR_ACCOUNT_NAME || '',
    telebirrNumber: import.meta.env.VITE_TELEBIRR_PHONE || '',
    telegramUsername: (import.meta.env.VITE_PAYMENT_TELEGRAM_USERNAME || '').replace(/^@/, ''),
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
        <p className="mt-4 text-sm leading-6 text-slate-300">Downloading is handled through the academy's payment and approval process, including free resources. No file has been downloaded. Use the configured payment details and contact the academy to request download access for this resource.</p>
        <div className="mt-4 space-y-3 rounded-xl border border-slate-700 bg-slate-950 p-4">
          <h3 className="font-semibold text-white">Bank transfer</h3>
          {paymentDetails.bankName && <p className="text-sm text-slate-300">Bank: <strong>{paymentDetails.bankName}</strong></p>}
          {paymentDetails.accountName && <p className="text-sm text-slate-300">Account name: <strong>{paymentDetails.accountName}</strong></p>}
          {paymentDetails.accountNumber && <p className="text-sm text-slate-300">Account number: <strong>{paymentDetails.accountNumber}</strong></p>}
          {!paymentDetails.bankName && !paymentDetails.accountNumber && <p className="text-sm text-amber-200">Bank details have not been configured by the academy.</p>}
        </div>
        <div className="mt-3 space-y-2 rounded-xl border border-slate-700 bg-slate-950 p-4">
          <h3 className="font-semibold text-white">Telebirr</h3>
          {paymentDetails.telebirrName && <p className="text-sm text-slate-300">Account name: <strong>{paymentDetails.telebirrName}</strong></p>}
          {paymentDetails.telebirrNumber && <p className="text-sm text-slate-300">Telebirr number: <strong>{paymentDetails.telebirrNumber}</strong></p>}
          {!paymentDetails.telebirrName && !paymentDetails.telebirrNumber && <p className="text-sm text-amber-200">Telebirr details have not been configured by the academy.</p>}
        </div>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-slate-300">
          <li>Ask the academy for the applicable download-access fee or confirmation that no payment is due.</li>
          <li>Keep your payment receipt if a payment is required.</li>
          <li>Send your student account details, resource title, and payment method to the academy.</li>
          <li>Wait for the administrator to verify and approve download access.</li>
        </ol>
        {paymentDetails.telegramUsername
          ? <a href={`https://t.me/${paymentDetails.telegramUsername}`} target="_blank" rel="noreferrer" className="mt-5 block rounded-xl bg-sky-600 px-4 py-3 text-center font-semibold text-white hover:bg-sky-500">Contact academy on Telegram</a>
          : <p className="mt-5 rounded-lg border border-amber-700 bg-amber-950/50 p-3 text-sm text-amber-200">Telegram contact is not configured. Set VITE_PAYMENT_TELEGRAM_USERNAME.</p>}
        <button type="button" onClick={onClose} className="mt-3 w-full rounded-xl border border-slate-700 px-4 py-3 text-sm text-slate-300 hover:bg-slate-800">Close</button>
      </section>
    </div>
  );
}
