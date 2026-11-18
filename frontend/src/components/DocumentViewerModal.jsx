import { useEffect, useRef, useState } from 'react';

const getExtension = (name = '', url = '') => {
  const clean = String(name || url).split('?')[0].split('#')[0];
  return clean.includes('.') ? clean.split('.').pop().toLowerCase() : '';
};

const getYouTubeEmbedUrl = (value = '') => {
  try {
    const parsed = new URL(value);
    const host = parsed.hostname.toLowerCase().replace(/^www\\./, '');
    let videoId = '';
    if (host === 'youtu.be') videoId = parsed.pathname.split('/').filter(Boolean)[0] || '';
    else if (['youtube.com', 'm.youtube.com', 'youtube-nocookie.com', 'www.youtube-nocookie.com'].includes(host)) {
      if (parsed.pathname === '/watch') videoId = parsed.searchParams.get('v') || '';
      else if (/^\\/(embed|shorts|live)\\//.test(parsed.pathname)) videoId = parsed.pathname.split('/')[2] || '';
    }
    return /^[a-zA-Z0-9_-]{11}$/.test(videoId)
      ? `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&playsinline=1`
      : '';
  } catch {
    return '';
  }
};

export default function DocumentViewerModal({ file, onClose, onDownloadRequest }) {
  const frameRef = useRef(null);
  const videoRef = useRef(null);
  const [fullscreenError, setFullscreenError] = useState('');

  useEffect(() => {
    if (!file) return undefined;
    const previousOverflow = document.body.style.overflow;
    const scrollY = window.scrollY;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (event) => { if (event.key === 'Escape' && !document.fullscreenElement) onClose?.(); };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      window.scrollTo(0, scrollY);
    };
  }, [file, onClose]);

  if (!file) return null;
  const url = file.url || file.src || '';
  const fileName = file.fileName || file.title || 'document';
  const extension = getExtension(fileName, url);
  const youtubeEmbedUrl = getYouTubeEmbedUrl(url);
  const isLocalVideo = Boolean(String(file.mimeType || '').startsWith('video/') || /\\.(mp4|webm|ogg|mov|m4v)([?#]|$)/i.test(url || fileName));
  const isVideo = Boolean(youtubeEmbedUrl || isLocalVideo);
  const isPdf = extension === 'pdf' || file.mimeType === 'application/pdf';
  const isOffice = ['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'].includes(extension)
    || /officedocument|msword|ms-powerpoint|ms-excel/.test(file.mimeType || '');
  const previewUrl = isPdf && url && !url.startsWith('blob:')
    ? (url.includes('res.cloudinary.com') && !/\\.pdf([?#]|$)/i.test(url) ? url.replace('/upload/', '/upload/fl_attachment:false/') : url)
    : url;

  const downloadFile = () => onDownloadRequest?.({
    title: file.title || fileName, fileName, type: isVideo ? 'video' : extension || 'document',
    resourceType: isVideo ? 'video' : extension, accessType: file.accessType,
    hasAccess: file.hasAccess, isPremium: file.isPremium, pricingTier: file.pricingTier || file.category || file.level,
    downloadEndpoint: file.downloadEndpoint, courseContentId: file.courseContentId,
    materialKind: file.materialKind, materialIndex: file.materialIndex,
  });

  const toggleFullscreen = async () => {
    setFullscreenError('');
    const target = youtubeEmbedUrl ? frameRef.current : videoRef.current;
    if (!target) return;
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (target.requestFullscreen) await target.requestFullscreen();
      else if (target.webkitEnterFullscreen) target.webkitEnterFullscreen();
      else if (target.webkitRequestFullscreen) target.webkitRequestFullscreen();
      else setFullscreenError('Fullscreen is not supported by this browser. Use the player controls instead.');
    } catch {
      setFullscreenError('Fullscreen could not start. Use the player controls instead.');
    }
  };

  const printFile = () => {
    if (frameRef.current?.contentWindow) { frameRef.current.contentWindow.focus(); frameRef.current.contentWindow.print(); }
    else window.print();
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-slate-950/95 p-2 sm:p-4" role="dialog" aria-modal="true" aria-label={file.title || 'Document viewer'}>
      <header className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-2 rounded-t-xl border border-slate-700 bg-slate-900 px-3 py-3 sm:px-5">
        <div className="min-w-0 flex-1"><h2 className="truncate text-sm font-semibold text-white sm:text-base">{file.title || fileName}</h2><p className="text-xs text-slate-400">{youtubeEmbedUrl ? 'YOUTUBE VIDEO' : extension.toUpperCase() || 'DOCUMENT'}</p></div>
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
          {isVideo && <button type="button" onClick={toggleFullscreen} className="rounded-lg border border-slate-600 px-3 py-2 text-xs font-semibold text-slate-100 hover:bg-slate-800 sm:text-sm">Fullscreen</button>}
          <button type="button" onClick={downloadFile} className="rounded-lg bg-sky-600 px-3 py-2 text-xs font-semibold text-white hover:bg-sky-500 sm:text-sm">Download</button>
          {!isVideo && <button type="button" onClick={printFile} className="rounded-lg border border-slate-600 px-3 py-2 text-xs font-semibold text-slate-100 hover:bg-slate-800 sm:text-sm">Print</button>}
          <button type="button" onClick={onClose} className="rounded-lg bg-slate-700 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-600 sm:text-sm">Close</button>
        </div>
      </header>
      <section className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col overflow-auto rounded-b-xl border-x border-b border-slate-700 bg-slate-900 xl:flex-row">
        {youtubeEmbedUrl ? <>
          <div className="flex min-h-[40vh] w-full items-center justify-center bg-black xl:min-h-0 xl:w-1/2">
            <iframe ref={frameRef} title={file.title || 'YouTube video'} src={youtubeEmbedUrl} className="aspect-video w-full max-h-full bg-black" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />
          </div>
          <aside className="w-full space-y-3 overflow-y-auto p-4 sm:p-6 xl:w-1/2">
            <h3 className="text-lg font-semibold text-white">Video lesson</h3>
            <p className="break-words text-sm leading-6 text-slate-300">{file.title || fileName}</p>
            <p className="text-sm text-slate-400">Use the YouTube player controls for playback, sound, captions, and fullscreen.</p>
            {fullscreenError && <p role="status" className="text-sm text-amber-300">{fullscreenError}</p>}
            <button type="button" onClick={toggleFullscreen} className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-500">Enter fullscreen</button>
          </aside>
        </> : isLocalVideo && url ? <>
          <div className="flex min-h-[40vh] w-full items-center justify-center bg-black xl:min-h-0 xl:w-1/2">
            <video ref={videoRef} controls playsInline preload="metadata" src={url} className="max-h-full w-full bg-black object-contain" />
          </div>
          <aside className="w-full space-y-3 overflow-y-auto p-4 sm:p-6 xl:w-1/2">
            <h3 className="text-lg font-semibold text-white">Video lesson</h3>
            <p className="break-words text-sm leading-6 text-slate-300">{file.title || fileName}</p>
            <p className="text-sm text-slate-400">Use the video controls to play, pause, seek, adjust volume, or enter fullscreen.</p>
            {fullscreenError && <p role="status" className="text-sm text-amber-300">{fullscreenError}</p>}
            <button type="button" onClick={toggleFullscreen} className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-500">Enter fullscreen</button>
          </aside>
        </> : url && !isOffice ? <iframe ref={frameRef} title={file.title || fileName} src={previewUrl} className="h-full min-h-0 w-full bg-white" allow="fullscreen" /> :
          <div className="m-auto max-w-lg p-6 text-center text-slate-200"><div className="text-4xl">📄</div><h3 className="mt-3 text-lg font-semibold">{isOffice ? 'Office document ready' : 'Preview unavailable'}</h3><p className="mt-2 text-sm leading-6 text-slate-400">{isOffice ? 'This file type may not preview in every browser. Download it to open it with a compatible document application.' : 'The document preview could not be loaded. You can still download the original file.'}</p><button type="button" onClick={downloadFile} className="mt-4 rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-500">Download document</button></div>}
      </section>
    </div>
  );
}
