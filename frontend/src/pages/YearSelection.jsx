import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api/api';

export default function YearSelection() {
  const { departmentId } = useParams();
  const [years, setYears] = useState([]);
  const [department, setDepartment] = useState(null);

  useEffect(() => {
    if (!departmentId) return;
    api.get(`/departments/${departmentId}`)
      .then((response) => setDepartment(response.data.department))
      .catch(console.error);

    api.get('/university-years')
      .then((response) => {
        const filtered = (response.data.years || []).filter(
          (year) => String(year.departmentRef) === String(departmentId)
        );
        setYears(filtered);
      })
      .catch(console.error);
  }, [departmentId]);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-xl shadow-slate-950/50">
        <h1 className="text-3xl font-semibold text-white">Select Your Year</h1>
        <p className="mt-2 text-slate-400">Pick the correct year to view the available courses.</p>
        {department ? <p className="mt-3 text-slate-300">Department: {department.name}</p> : null}
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {years.map((year) => (
          <Link
            key={year._id}
            to={`/university/${departmentId}/${year._id}`}
            className="rounded-3xl border border-slate-800 bg-slate-900 p-6 text-left transition hover:border-blue-500 hover:bg-slate-800"
          >
            <h2 className="text-xl font-semibold text-white">{year.name}</h2>
            <p className="mt-2 text-slate-400">{year.description || 'View courses for this year.'}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
