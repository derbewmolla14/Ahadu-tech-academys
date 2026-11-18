import { useEffect, useRef } from 'react';

const getExtension = (name = '', url = '') => {
  const clean = String(name || url).split('?')[0].split('#')[0];
  return clean.includes('.') ? clean.split('.').pop().toLowerCase() : '';
};

export default function DocumentViewerModal({ file, onClose }) {
  const frameRef = useRef(null);

  useEffect(() => {
    if (!file) return undefined;
    const previousOverflow = document.body.style.overflow;
    const scrollY = window.scrollY;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      window.scrollTo({ top: scrollY, behavior: 'instant' });
    };
  }, [file, onClose]);

  if (!file) return null;

  const url = file.url || file.src || '';
  const fileName = file.fileName || file.title || 'document';
  const extension = getExtension(fileName, url);
  const isPdf = extension === 'pdf' || file.mimeType === 'application/pdf';
  const isOffice = ['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'].includes(extension);
  const previewUrl = isPdf && url && !url.startsWith('blob:')
    ? (url.includes('res.cloudinary.com') && !/\.pdf([?#]|$)/i.test(url)
      ? url.replace('/upload/', '/upload/fl_attachment:false/')
      : url)
    : url;

  const downloadFile = () => {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const printFile = () => {
    if (frameRef.current?.contentWindow) {
      frameRef.current.contentWindow.focus();
      frameRef.current.contentWindow.print();
    } else {
      window.print();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-slate-950/95 p-2 sm:p-4" role="dialog" aria-modal="true" aria-label={file.title || 'Document viewer'}>
      <header className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-2 rounded-t-xl border border-slate-700 bg-slate-900 px-3 py-3 sm:px-5">
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-semibold text-white sm:text-base">{file.title || fileName}</h2>
          <p className="text-xs text-slate-400">{extension.toUpperCase() || 'DOCUMENT'}</p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
          <button type="button" onClick={downloadFile} className="rounded-lg bg-sky-600 px-3 py-2 text-xs font-semibold text-white hover:bg-sky-500 sm:text-sm">Download</button>
          <button type="button" onClick={printFile} className="rounded-lg border border-slate-600 px-3 py-2 text-xs font-semibold text-slate-100 hover:bg-slate-800 sm:text-sm">Print</button>
          <button type="button" onClick={onClose} className="rounded-lg bg-slate-700 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-600 sm:text-sm">Close ×</button>
        </div>
      </header>
      <section className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 overflow-hidden rounded-b-xl border-x border-b border-slate-700 bg-slate-800">
        {url && !isOffice ? (
          <iframe ref={frameRef} title={file.title || fileName} src={previewUrl} className="h-full min-h-0 w-full bg-white" allow="fullscreen" />
        ) : (
          <div className="m-auto max-w-lg p-6 text-center text-slate-200">
            <div className="text-4xl">📄</div>
            <h3 className="mt-3 text-lg font-semibold">{isOffice ? 'Office document ready' : 'Preview unavailable'}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              {isOffice
                ? 'This file type may not preview in every browser. Download it to open it with a compatible document application.'
                : 'The document preview could not be loaded. You can still download the original file.'}
            </p>
            <button type="button" onClick={downloadFile} className="mt-4 rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-500">Download document</button>
          </div>
        )}
      </section>
    </div>
  );
}
