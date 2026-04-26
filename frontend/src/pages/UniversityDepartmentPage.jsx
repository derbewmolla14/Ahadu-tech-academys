import { useParams } from 'react-router-dom';

const departmentMap = {
  'natural-science': {
    title: 'Natural Science',
    description: 'Discover Natural Science course collections for university students.',
  },
  'social-science': {
    title: 'Social Science',
    description: 'Explore Social Science subjects, lectures, and study guides.',
  },
  masters: {
    title: 'Masters Programs',
    description: 'Advanced graduate coursework, research seminars, and thesis preparation.',
  },
  phd: {
    title: 'PhD Programs',
    description: 'Doctoral research, dissertation development, and academic publishing support.',
  },
};

export default function UniversityDepartmentPage() {
  const { type, levelId, universityName } = useParams();
  const selectedType = type || levelId;
  const department = departmentMap[selectedType] || { title: 'Unknown Selection', description: 'This selection does not exist.' };
  const formattedUniversity = universityName
    ? universityName.split('-').map((word) => word[0].toUpperCase() + word.slice(1)).join(' ')
    : null;

  return (
    <div className="mx-auto max-w-4xl rounded-3xl border border-slate-800 bg-slate-900 p-10 shadow-xl shadow-slate-950/50">
      <h1 className="text-4xl font-semibold text-white">{department.title}</h1>
      {formattedUniversity ? (
        <p className="mt-2 text-slate-400">University: {formattedUniversity}</p>
      ) : null}
      <p className="mt-4 text-slate-400">{department.description}</p>
      <div className="mt-8 rounded-3xl border border-slate-800 bg-slate-950 p-6 text-slate-300">
        <p>Use this page to show university-level resources for the selected academic stream or program.</p>
      </div>
    </div>
  );
}
