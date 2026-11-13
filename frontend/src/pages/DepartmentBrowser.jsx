import { useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

const departmentMap = {
  Natural: [
    'Software Engineering', 'Computer Science', 'Information Technology',
    'Civil Engineering', 'Water Resources and Irrigation Engineering',
    'Electrical Engineering', 'Mechanical Engineering'
  ],
  Social: [
    'Accounting', 'Business Management', 'Economics',
    'Law', 'Sociology', 'Political Science'
  ]
};

export default function DepartmentBrowser() {
  const { name } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const faculty = searchParams.get('faculty') || 'Natural';
  const academicLevel = searchParams.get('level') || 'Senior Undergraduate';
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [search, setSearch] = useState('');

  const departments = useMemo(() => departmentMap[faculty] || [], [faculty]);
  const filteredDepartments = useMemo(
    () => departments.filter(department => department.toLowerCase().includes(search.trim().toLowerCase())),
    [departments, search]
  );

  const continueToYears = () => {
    if (!selectedDepartment) return;
    const params = new URLSearchParams({
      faculty,
      level: academicLevel,
      department: selectedDepartment
    });
    navigate('/university/' + name + '/years?' + params.toString());
  };

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <nav aria-label="Progress" className="flex flex-wrap items-center gap-2 text-sm text-slate-400">
          <button type="button" onClick={() => navigate('/university')} className="hover:text-sky-400">Universities</button>
          <span aria-hidden="true">/</span>
          <button type="button" onClick={() => navigate('/university/' + name)} className="hover:text-sky-400">Academic path</button>
          <span aria-hidden="true">/</span>
          <span className="text-white">Department</span>
        </nav>

        <header className="rounded-3xl border border-slate-800 bg-slate-900 p-6 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-sky-400">Step 3 of 5 · Department</p>
          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">Choose your department</h1>
          <p className="mt-3 max-w-2xl text-slate-400">
            Select the department you study in. We will use this choice to find the correct courses and learning materials.
          </p>
          <div className="mt-5 flex flex-wrap gap-2 text-sm">
            <span className="rounded-full bg-slate-800 px-3 py-1.5">{faculty} Sciences</span>
            <span className="rounded-full bg-slate-800 px-3 py-1.5">{academicLevel}</span>
          </div>
        </header>

        <section className="rounded-3xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
          <label htmlFor="department-search" className="mb-2 block text-sm font-medium text-slate-300">Search departments</label>
          <input
            id="department-search"
            type="search"
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder="Type a department name..."
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
          />
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredDepartments.map(department => {
              const selected = selectedDepartment === department;
              return (
                <button
                  key={department}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setSelectedDepartment(department)}
                  className={'flex min-h-24 items-center justify-between gap-3 rounded-2xl border p-4 text-left transition focus:outline-none focus:ring-2 focus:ring-sky-500 ' + (selected ? 'border-sky-500 bg-sky-500/10' : 'border-slate-700 bg-slate-950 hover:border-slate-500')}
                >
                  <span className="font-medium text-slate-100">{department}</span>
                  <span className={'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs ' + (selected ? 'border-sky-400 bg-sky-500 text-white' : 'border-slate-600 text-transparent')}>✓</span>
                </button>
              );
            })}
          </div>
          {filteredDepartments.length === 0 && (
            <p className="py-10 text-center text-slate-400">No departments match “{search}”. Try another search.</p>
          )}
        </section>

        <footer className="sticky bottom-3 flex flex-col-reverse gap-3 rounded-2xl border border-slate-800 bg-slate-900/95 p-4 shadow-2xl backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <button type="button" onClick={() => navigate('/university/' + name)} className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-medium text-slate-200 hover:bg-slate-800">
            Back
          </button>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <p className="text-sm text-slate-400">{selectedDepartment || 'Select one department to continue'}</p>
            <button
              type="button"
              disabled={!selectedDepartment}
              onClick={continueToYears}
              className="rounded-xl bg-sky-600 px-6 py-3 font-semibold text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Continue to year selection →
            </button>
          </div>
        </footer>
      </div>
    </main>
  );
}
