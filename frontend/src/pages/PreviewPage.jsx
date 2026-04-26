import { Link } from 'react-router-dom';

export default function PreviewPage({ title, description }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-12 sm:px-6">
      <div className="w-full max-w-3xl rounded-3xl border border-slate-800 bg-slate-900 p-10 shadow-xl shadow-slate-950/40">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.35em] text-sky-400">Ahadu Tech Academy</p>
          <h1 className="mt-4 text-4xl font-semibold text-white">{title}</h1>
          <p className="mt-4 text-slate-400">{description}</p>
        </div>
        <div className="grid gap-4 rounded-3xl border border-slate-800 bg-slate-950/80 p-6">
          <p className="text-lg font-semibold text-white">Features</p>
          <ul className="space-y-3 text-slate-300">
            <li>• Video lessons</li>
            <li>• PPT materials</li>
            <li>• Notes</li>
            <li>• Practice exercises</li>
          </ul>
        </div>
        <div className="mt-8 rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center">
          <p className="text-lg text-slate-300">Please login to access full content.</p>
          <Link
            to="/login"
            className="mt-6 inline-flex rounded-full bg-sky-500 px-8 py-4 text-lg font-semibold text-slate-950 transition hover:bg-sky-400"
          >
            Login Now
          </Link>
        </div>
      </div>
    </div>
  );
}
