import { useCallback, useEffect, useState } from 'react';
import { Download, FileText, Film, Presentation, Trash2, WifiOff } from 'lucide-react';
import DocumentViewerModal from '../components/DocumentViewerModal';
import { createOfflineObjectUrl, deleteOfflineResource, listOfflineResources } from '../utils/offlineStore';

function IconFor({ type }) {
  const Icon = type === 'video' ? Film : type === 'ppt' ? Presentation : FileText;
  return <Icon size={20} />;
}
const sizeLabel = (bytes = 0) => bytes < 1048576 ? `${Math.round(bytes / 1024)} KB` : `${(bytes / 1048576).toFixed(1)} MB`;

export default function OfflineLibrary() {
  const [items, setItems] = useState([]);
  const [viewer, setViewer] = useState(null);
  const [error, setError] = useState('');
  const refresh = useCallback(async () => {
    try {
      setItems((await listOfflineResources()).sort((a, b) => new Date(b.downloadedAt) - new Date(a.downloadedAt)));
      setError('');
    } catch (err) { setError(err.message || 'Offline storage is unavailable.'); }
  }, []);
  useEffect(() => {
    refresh();
    window.addEventListener('ahadu:offline-library-updated', refresh);
    return () => window.removeEventListener('ahadu:offline-library-updated', refresh);
  }, [refresh]);
  const close = () => {
    if (viewer?.url?.startsWith('blob:')) URL.revokeObjectURL(viewer.url);
    setViewer(null);
  };
  const open = (item) => setViewer({
    title: item.title, fileName: item.fileName, mimeType: item.mimeType,
    url: createOfflineObjectUrl(item), isOffline: true,
  });
  const remove = async (id) => { await deleteOfflineResource(id); await refresh(); };
  return (
    <section className="space-y-5">
      <DocumentViewerModal file={viewer} onClose={close} />
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-400"><Download size={14} /> My learning</p>
          <h1 className="mt-1 text-2xl font-bold text-white md:text-3xl">My Offline Library</h1>
          <p className="mt-1 text-sm text-slate-400">Saved lessons stay on this device and open without internet.</p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-slate-700 px-3 py-2 text-xs text-slate-300"><WifiOff size={14} /> {items.length} saved</span>
      </header>
      {error && <p role="alert" className="rounded-xl border border-rose-700/50 bg-rose-950/30 p-3 text-sm text-rose-200">{error}</p>}
      {!items.length ? (
        <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/60 p-8 text-center">
          <Download className="mx-auto text-slate-500" size={32} />
          <h2 className="mt-3 text-base font-semibold text-white">No offline lessons yet</h2>
          <p className="mt-1 text-sm text-slate-400">Download an approved video, PDF, or PowerPoint while online.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <article key={item.id} className="rounded-xl border border-slate-800 bg-slate-900 p-4">
              <div className="flex items-start gap-3">
                <span className="rounded-lg bg-sky-500/10 p-2 text-sky-300"><IconFor type={item.fileType} /></span>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-sm font-semibold text-white">{item.title || item.fileName}</h2>
                  <p className="mt-1 text-xs uppercase text-slate-500">{item.fileType} Â· {sizeLabel(item.fileSize)}</p>
                  <p className="mt-1 text-xs text-slate-500">{new Date(item.downloadedAt).toLocaleString()}</p>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <button type="button" onClick={() => open(item)} className="min-h-10 flex-1 rounded-lg bg-sky-600 px-3 py-2 text-xs font-semibold text-white hover:bg-sky-500">Open offline</button>
                <button type="button" onClick={() => remove(item.id)} aria-label={`Delete ${item.title}`} className="min-h-10 rounded-lg border-slate-700 px-3 text-xs text-slate-300 hover:bg-rose-950/40">Delete</button>
              </div>
            </article>
          ))}
        </div>
       )}
    </section>
  );
}
