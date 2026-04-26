import { useParams } from 'react-router-dom';

export default function ElementaryGradePage() {
  const { id } = useParams();

  return (
    <div className="mx-auto max-w-4xl rounded-3xl border border-slate-800 bg-slate-900 p-10 shadow-xl shadow-slate-950/50">
      <h1 className="text-4xl font-semibold text-white">Elementary Grade {id}</h1>
      <p className="mt-4 text-slate-400">You are viewing the Elementary learning path for Grade {id}. This page can be extended with grade-specific lessons and resources.</p>
      <div className="mt-8 rounded-3xl border border-slate-800 bg-slate-950 p-6 text-slate-300">
        <p>Lessons, video content, PPTs, and practice exercises will appear here.</p>
      </div>
    </div>
  );
}
