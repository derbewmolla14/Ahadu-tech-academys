import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';

export default function DepartmentSelection() {
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    api.get('/departments')
      .then((response) => setDepartments(response.data.departments || []))
      .catch(console.error);
  }, []);

  return (
    <div className="space-y-6 pr-0 mt-0">
      <div className="rounded-3xl border border-slate-800 bg-slate-900 shadow-xl shadow-slate-950/50">
        <h1 className="text-3xl font-semibold text-white">Choose Your Department</h1>
        <p className="mt-2 text-slate-400">Select the department that matches your university program.</p>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {departments.map((department) => (
          <Link
            key={department._id}
            to={`/university/${department._id}`}
            className="rounded-3xl border border-slate-800 bg-slate-900 p-6 text-left transition hover:border-blue-500 hover:bg-slate-800"
          >
            <h2 className="text-xl font-semibold text-white">{department.name}</h2>
            <p className="mt-2 text-slate-400">{department.description || 'View available academic years.'}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
