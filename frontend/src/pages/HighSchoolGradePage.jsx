import { useParams } from 'react-router-dom';

export default function HighSchoolGradePage() {
  const { id } = useParams();

  return (
    <div className="mx-auto max-w-4xl rounded-3xl border border-slate-800 bg-slate-900 p-10 shadow-xl shadow-slate-950/50">
      <h1 className="text-4xl font-semibold text-white">High School Grade {id}</h1>
      <p className="mt-4 text-slate-400">This is the High School learning path for Grade {id}. More grade-specific content can be added here.</p>
      <div className="mt-8 rounded-3xl border border-slate-800 bg-slate-950 p-6 text-slate-300">
        <p>Use this space for tutorials, practice problems, and lesson summaries.</p>
      </div>
    </div>
  );
}
