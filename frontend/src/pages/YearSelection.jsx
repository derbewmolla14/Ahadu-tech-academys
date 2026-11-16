import { useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

function yearsFor(level) {
  if (level === 'Freshman') return ['Freshman'];
  if (level === 'Remedial') return ['Remedial'];
  if (level === "Master's Degree") return ['Year 1', 'Year 2'];
  if (level === 'PhD') return ['Year 1', 'Year 2', 'Year 3', 'Year 4'];
  return ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'];
}

export default function YearSelection() {
  const { name } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const faculty = searchParams.get('faculty');
  const academicLevel = searchParams.get('level') || 'Senior Undergraduate';
  const department = searchParams.get('department');
  const availableYears = yearsFor(academicLevel);

  useEffect(() => {
    if (!faculty || !department) {
      navigate('/university/' + name + '/department' + (faculty ? '?faculty=' + encodeURIComponent(faculty) : ''));
    }
  }, [faculty, department, name, navigate]);

  const onYearSelect = (year) => {
    navigate('/university/' + name + '/content?faculty=' + encodeURIComponent(faculty) + '&level=' + encodeURIComponent(academicLevel) + '&department=' + encodeURIComponent(department) + '&year=' + encodeURIComponent(year));
  };

  if (!faculty || !department) return null;

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-10 shadow-xl shadow-slate-950/40">
        <h1 className="text-4xl font-semibold text-white">Select Academic Year</h1>
        <p className="mt-4 text-slate-400">Choose your current year in {department} to view course materials.</p>
        <p className="mt-2 text-sm text-slate-500">Academic level: {academicLevel}</p>
        <button type="button" onClick={() => navigate(-1)} className="mt-6 rounded-full border border-slate-700 px-5 py-3 text-sm text-slate-200 transition hover:border-slate-500">← Back to Department</button>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {availableYears.map(year => (
          <button key={year} type="button" onClick={() => onYearSelect(year)} className="rounded-3xl border border-slate-800 bg-slate-900 p-8 text-white transition hover:border-sky-500 hover:bg-slate-800">
            <h2 className="text-2xl font-semibold">{year}</h2>
            <p className="mt-3 text-slate-400">View {year} courses for {department}.</p>
          </button>
        ))}
      </div>
    </div>
  );
}
