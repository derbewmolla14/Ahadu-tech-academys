import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import universityApi from '../api/universityApi';

export default function UniversityLevel() {
  const { name } = useParams();
  const [levels, setLevels] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    universityApi.getLevels(name)
      .then(setLevels)
      .catch(() => setError('Unable to load academic levels.'));
  }, [name]);

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-10 shadow-xl shadow-slate-950/40">
        <h1 className="text-4xl font-semibold text-white">Select an Academic Level</h1>
        <p className="mt-4 text-slate-400">Choose the level that fits your program, then continue to department selection.</p>
      </div>

      {error ? (
        <div className="rounded-3xl border border-rose-500/20 bg-rose-500/10 p-6 text-rose-200">{error}</div>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {(levels.length ? levels : ['Undergraduate', 'Graduate', 'Diploma']).map((level) => (
          <button
            key={level}
            type="button"
            onClick={() => navigate(`/university/${name}/department?level=${encodeURIComponent(level)}`)}
            className="rounded-3xl border border-slate-800 bg-slate-900 p-8 text-left text-white transition hover:border-sky-500 hover:bg-slate-800"
          >
            <h2 className="text-2xl font-semibold">{level}</h2>
            <p className="mt-3 text-slate-400">Browse departments available for {level.toLowerCase()} programs.</p>
          </button>
        ))}
      </div>
    </div>
  );
}
