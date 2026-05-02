import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import universityApi from '../api/universityApi';

export default function UniversityContent() {
  const { name, courseId } = useParams();
  const [searchParams] = useSearchParams();
  const courseTitle = searchParams.get('title') || 'Course Content';
  const [content, setContent] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    universityApi.getContent(courseId)
      .then(setContent)
      .catch(() => setError('Unable to load course content.'));
  }, [courseId]);

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-10 shadow-xl shadow-slate-950/40">
        <h1 className="text-4xl font-semibold text-white">{courseTitle}</h1>
        <p className="mt-4 text-slate-400">Watch the lecture, read the course PDF, download the presentation, and review notes.</p>
      </div>

      {error ? (
        <div className="rounded-3xl border border-rose-500/20 bg-rose-500/10 p-6 text-rose-200">{error}</div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl shadow-slate-950/40">
            <h2 className="text-2xl font-semibold text-white">Video Lesson</h2>
            <div className="mt-5 overflow-hidden rounded-3xl border border-slate-800 bg-slate-950">
              <video
                controls
                poster={content?.poster || ''}
                src={content?.videoUrl || 'https://www.w3schools.com/html/mov_bbb.mp4'}
                className="w-full bg-black"
              />
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl shadow-slate-950/40">
            <h2 className="text-2xl font-semibold text-white">PDF Viewer</h2>
            <div className="mt-5 h-[420px] overflow-hidden rounded-3xl border border-slate-800 bg-slate-950">
              <iframe
                title="Course PDF"
                src={content?.pdfUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'}
                className="h-full w-full"
              />
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl shadow-slate-950/40">
            <h2 className="text-2xl font-semibold text-white">Download</h2>
            <p className="mt-3 text-slate-400">Get the slides for offline review.</p>
            <a
              href={content?.pptUrl || 'https://file-examples.com/wp-content/uploads/2017/08/file_example_PPT_500kB.ppt'}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex rounded-full bg-sky-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400"
            >
              Download PPT
            </a>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl shadow-slate-950/40">
            <h2 className="text-2xl font-semibold text-white">Notes</h2>
            <div className="mt-4 space-y-4 text-slate-300">
              <p>{content?.notes || 'No notes available for this course yet. Please check back later for instructor notes and key summaries.'}</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
