import { useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

const years = ['Year 1', 'Year 2', 'Year 3', 'Year 4'];

export default function YearSelection() {
  const { name } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const faculty = searchParams.get('faculty');
  const department = searchParams.get('department');

  useEffect(() => {
    // If no required data is passed, redirect back to Department Browser
    if (!faculty || !department) {
      navigate(`/university/${name}/department${faculty ? `?faculty=${encodeURIComponent(faculty)}` : ''}`);
    }
  }, [faculty, department, name, navigate]);

  const onYearSelect = (year) => {
    navigate(`/university/${name}/content?faculty=${encodeURIComponent(faculty)}&department=${encodeURIComponent(department)}&year=${encodeURIComponent(year)}`);
  };

  // Don't render if missing required data
  if (!faculty || !department) {
    return null;
  }

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-10 shadow-xl shadow-slate-950/40">
        <h1 className="text-4xl font-semibold text-white">Select Academic Year</h1>
        <p className="mt-4 text-slate-400">Choose your current year in {department} to view course materials.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-full border border-slate-700 px-5 py-3 text-sm text-slate-200 transition hover:border-slate-500"
          >
            ← Back to Department
          </button>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {years.map((year) => (
          <button
            key={year}
            type="button"
            onClick={() => onYearSelect(year)}
            className="rounded-3xl border border-slate-800 bg-slate-900 p-8 text-white transition hover:border-sky-500 hover:bg-slate-800"
          >
            <h2 className="text-2xl font-semibold">{year}</h2>
            <p className="mt-3 text-slate-400">View {year} courses for {department}.</p>
          </button>
        ))}
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="text-2xl font-semibold text-white">Course Materials Available</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950 p-4">
            <span className="text-2xl">📄</span>
            <div>
              <p className="font-semibold text-white">Notes</p>
              <p className="text-sm text-slate-400">PDF and text materials</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950 p-4">
            <span className="text-2xl">🎥</span>
            <div>
              <p className="font-semibold text-white">Videos</p>
              <p className="text-sm text-slate-400">Lecture recordings</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950 p-4">
            <span className="text-2xl">📊</span>
            <div>
              <p className="font-semibold text-white">PPT Slides</p>
              <p className="text-sm text-slate-400">Presentation materials</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950 p-4">
            <span className="text-2xl">📝</span>
            <div>
              <p className="font-semibold text-white">Assignments</p>
              <p className="text-sm text-slate-400">Practice exercises</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
