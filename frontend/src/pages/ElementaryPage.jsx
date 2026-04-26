import { Link } from 'react-router-dom';
import PreviewPage from './PreviewPage';

export default function ElementaryPage() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const grades = [1, 2, 3, 4, 5, 6, 7, 8];

  if (!token) {
    return (
      <PreviewPage
        title="Elementary Learning"
        description="See what’s available in Elementary before you log in. Unlock lessons, notes, and practice exercises after signing in."
      />
    );
  }

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-10 shadow-xl shadow-slate-950/40">
        <h1 className="text-4xl font-semibold text-white">Elementary Grades</h1>
        <p className="mt-4 text-slate-400">Choose a grade to explore the Elementary curriculum.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {grades.map((grade) => (
          <Link
            key={grade}
            to={`/elementary/grade/${grade}`}
            className="rounded-3xl border border-slate-800 bg-slate-900 px-6 py-8 text-center text-white transition hover:border-blue-500 hover:bg-slate-800"
          >
            <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Grade</p>
            <h2 className="mt-3 text-3xl font-semibold">{grade}</h2>
          </Link>
        ))}
      </div>
    </div>
  );
}
