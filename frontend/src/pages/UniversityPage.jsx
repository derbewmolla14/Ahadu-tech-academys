import { Link } from 'react-router-dom';
import PreviewPage from './PreviewPage';

export default function UniversityPage() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  if (!token) {
    return (
      <PreviewPage
        title="University Learning"
        description="Preview university courses and materials before logging in. Full department and year access is available once you sign in."
      />
    );
  }

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-10 shadow-xl shadow-slate-950/40">
        <h1 className="text-4xl font-semibold text-white">University / College</h1>
        <p className="mt-4 text-slate-400">Start by choosing a university and then select your program level.</p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          to="/universities"
          className="rounded-3xl border border-slate-800 bg-slate-900 px-8 py-10 text-center text-white transition hover:border-blue-500 hover:bg-slate-800"
        >
          <h2 className="text-2xl font-semibold">Browse Universities</h2>
          <p className="mt-3 text-slate-400">Explore Ethiopian universities and pick the campus you want to study at.</p>
        </Link>
        <Link
          to="/university/department/natural-science"
          className="rounded-3xl border border-slate-800 bg-slate-900 px-8 py-10 text-center text-white transition hover:border-blue-500 hover:bg-slate-800"
        >
          <h2 className="text-2xl font-semibold">Natural Science</h2>
          <p className="mt-3 text-slate-400">Science, biology, chemistry, and physics learning paths.</p>
        </Link>
        <Link
          to="/university/department/social-science"
          className="rounded-3xl border border-slate-800 bg-slate-900 px-8 py-10 text-center text-white transition hover:border-blue-500 hover:bg-slate-800"
        >
          <h2 className="text-2xl font-semibold">Social Science</h2>
          <p className="mt-3 text-slate-400">Economics, history, sociology, and social studies content.</p>
        </Link>
      </div>
    </div>
  );
}
