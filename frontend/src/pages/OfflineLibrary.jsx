import { useEffect, useState } from 'react';
import { deleteOfflineResource, formatBytes, listOfflineResources } from '../utils/offlineLibrary';

export default function OfflineLibrary() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(true);
  const [activeUrl, setActiveUrl] = useState('');

  const refresh = async () => {
    setBusy(true);
    try { setItems(await listOfflineResources()); setError(''); }
    catch (err) { setError(err.message || 'Could not load offline library.'); }
    finally { setBusy(false); }
  };

  useEffect(() => { refresh(); return () => { if (activeUrl) URL.revokeObjectURL(activeUrl); }; }, []);
  const openItem = (item) => {
    if (activeUrl) URL.revokeObjectURL(activeUrl);
    const url = URL.createObjectURL(item.blob);
    setActiveUrl(url);
    if (item.resourceType === 'video' || item.mimeType?.startsWith('video/')) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };
  const removeItem = async (id) => { await deleteOfflineResource(id); await refresh(); };

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6">
      <header className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-sky-400">Offline learning</p>
        <h1 className="mt-2 text-2xl font-bold text-white">My Offline Library</h1>
        <p className="mt-2 text-sm text-slate-400">Files you have downloaded while online are saved on this device and can be opened without an internet connection.</p>
        <button type="button" onClick={refresh} className="mt-4 rounded-lg border border-slate-700 px-4 py-2 text-sm text-white hover:bg-slate-800">Refresh library</button>
      </header>
      {error && <p role="alert" className="rounded-lg bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
      {busy ? <p className="text-slate-400">Loading saved files…</p> : !items.length ? (
        <div className="rounded-2xl border border-dashed border-slate-700 p-10 text-center text-slate-400">No offline files yet. Open an approved course resource and choose Download while online.</div>
      ) : (
        <section className="grid gap-3 sm:grid-cols-2">
          {items.map((item) => (
            <article key={item.id} className="rounded-xl border border-slate-800 bg-slate-900 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0"><h2 className="truncate font-semibold text-white">{item.title}</h2><p className="mt-1 text-xs text-slate-400">{item.mimeType} · {formatBytes(item.size)}</p><p className="mt-1 text-xs text-slate-500">Saved {new Date(item.savedAt).toLocaleString()}</p></div>
                <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-xs text-emerald-300">On device</span>
              </div>
              <div className="mt-4 flex gap-2"><button type="button" onClick={() => openItem(item)} className="rounded-lg bg-sky-600 px-3 py-2 text-sm font-semibold text-white">Open</button><button type="button" onClick={() => removeItem(item.id)} className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300">Delete</button></div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
