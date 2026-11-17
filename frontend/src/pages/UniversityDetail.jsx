import { Navigate, useNavigate, useParams } from 'react-router-dom';

const universityDetails = {
  'addis-ababa-university': { name: 'Addis Ababa University', location: 'Addis Ababa', description: 'The oldest university in Ethiopia with a wide range of programs.' },
  'bahir-dar-university': { name: 'Bahir Dar University', location: 'Bahir Dar', description: 'A leading Ethiopian university in science and technology education.' },
  'gondar-university': { name: 'Gondar University', location: 'Gondar', description: 'Known for strong health and social science programs.' },
  'jimma-university': { name: 'Jimma University', location: 'Jimma', description: 'A research-focused university with modern facilities.' },
  'mekelle-university': { name: 'Mekelle University', location: 'Mekelle', description: 'A major academic hub for northern Ethiopia.' },
  'wollo-university': { name: 'Wollo University', location: 'Dessie', description: 'Focused on regional development and student success.' },
  'woldia-university': { name: 'Woldia University', location: 'Woldia', description: 'A new university with practical learning tracks.' },
  'debre-berhan-university': { name: 'Debre Berhan University', location: 'Debre Berhan', description: 'A university centered on growth and professional programs.' },
  'debre-markos-university': { name: 'Debre Markos University', location: 'Debre Markos', description: 'Rapidly growing campus serving the Amhara region.' },
};

export default function UniversityDetail() {
  const { name } = useParams();
  const navigate = useNavigate();
  if (!name || name === 'undefined' || name === 'null') return <Navigate to="/universities" replace />;
  const university = universityDetails[name] || { name: name.replace(/-/g, ' '), location: 'Ethiopia', description: 'Browse available academic tracks and start learning.' };


  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-10 shadow-xl shadow-slate-950/40">
        <h1 className="text-4xl font-semibold text-white">{university.name}</h1>
        <p className="mt-4 max-w-2xl text-slate-400">{university.description}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => navigate('/university')}
            className="rounded-full border border-slate-700 px-5 py-3 text-sm text-slate-200 transition hover:border-slate-500"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>

    </div>
  );
}
