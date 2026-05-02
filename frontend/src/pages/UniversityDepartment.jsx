import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import universityApi from '../api/universityApi';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function UniversityDepartment() {
  const { name } = useParams();
  const navigate = useNavigate();
  const query = useQuery();
  const level = query.get('level') || 'Undergraduate';
  const [departments, setDepartments] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    universityApi.getDepartments(name, level)
      .then(setDepartments)
      .catch(() => setError('Unable to load departments.'));
  }, [name, level]);

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-10 shadow-xl shadow-slate-950/40">
        <h1 className="text-4xl font-semibold text-white">{level} Departments</h1>
        <p className="mt-4 text-slate-400">Choose a department in {name.replace(/-/g, ' ')} to view available courses.</p>
      </div>

      {error ? (
        <div className="rounded-3xl border border-rose-500/20 bg-rose-500/10 p-6 text-rose-200">{error}</div>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {(departments.length ? departments : ['Computer Science', 'Business', 'Engineering', 'Education']).map((department) => (
          <button
            key={department}
            type="button"
            onClick={() => navigate(`/university/${name}/courses?level=${encodeURIComponent(level)}&department=${encodeURIComponent(department)}`)}
            className="rounded-3xl border border-slate-800 bg-slate-900 p-8 text-left text-white transition hover:border-sky-500 hover:bg-slate-800"
          >
            <h2 className="text-2xl font-semibold">{department}</h2>
            <p className="mt-3 text-slate-400">View courses for {department.toLowerCase()} programs.</p>
          </button>
        ))}
      </div>
    </div>
  );
}
