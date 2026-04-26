import { Link } from 'react-router-dom';
import PreviewPage from './PreviewPage';

export default function HighSchoolPage() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const grades = [9, 10, 11, 12];

  if (!token) {
    return (
      <PreviewPage
        title="High School Learning"
        description="Explore high school course previews and see the tools available for learning, practice, and review."
      />
    );
  }

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-10 shadow-xl shadow-slate-950/40">
        <h1 className="text-4xl font-semibold text-white">High School Grades</h1>
        <p className="mt-4 text-slate-400">Choose a high school grade to continue.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {grades.map((grade) => (
          <Link
            key={grade}
            to={`/highschool/grade/${grade}`}
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
