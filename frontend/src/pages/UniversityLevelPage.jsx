import { useParams, Link } from 'react-router-dom';

const levelOptions = [
  {
    id: 'natural-science',
    title: 'Natural Science',
    description: 'Biology, chemistry, physics, and science-focused majors.',
  },
  {
    id: 'social-science',
    title: 'Social Science',
    description: 'Economics, history, sociology, and social studies tracks.',
  },
  {
    id: 'masters',
    title: 'Masters Programs',
    description: 'Advanced graduate degrees for specialized academic growth.',
  },
  {
    id: 'phd',
    title: 'PhD Programs',
    description: 'Doctoral research and dissertation-focused study paths.',
  },
];

export default function UniversityLevelPage() {
  const { universityName } = useParams();
  const formattedName = universityName?.split('-').map((word) => word[0].toUpperCase() + word.slice(1)).join(' ') || 'Selected University';

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-10 shadow-xl shadow-slate-950/40">
        <h1 className="text-4xl font-semibold text-white">{formattedName}</h1>
        <p className="mt-4 text-slate-400">Select an academic stream or program level for this university.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
        {levelOptions.map((level) => (
          <Link
            key={level.id}
            to={`/universities/${universityName}/levels/${level.id}`}
            className="rounded-3xl border border-slate-800 bg-slate-900 p-8 transition hover:border-sky-500 hover:bg-slate-800"
          >
            <h2 className="text-2xl font-semibold text-white">{level.title}</h2>
            <p className="mt-3 text-slate-400">{level.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
