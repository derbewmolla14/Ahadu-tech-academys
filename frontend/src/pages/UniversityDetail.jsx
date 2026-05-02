import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AcademicSelection from './AcademicSelection';
import LevelSelection from './LevelSelection';

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
  const [selectedCategory, setSelectedCategory] = useState('');
  const university = universityDetails[name] || { name: name.replace(/-/g, ' '), location: 'Ethiopia', description: 'Browse available academic tracks and start learning.' };

  const onCategorySelect = (category) => setSelectedCategory(category);

  const onLevelSelect = (level) => {
    if (selectedCategory === 'Natural' || selectedCategory === 'Social') {
      if (level === 'Senior') {
        navigate(`/university/${name}/department?faculty=${encodeURIComponent(selectedCategory)}`);
      } else {
        // Freshman or Remedial
        navigate(`/university/${name}/courses?faculty=${encodeURIComponent(selectedCategory)}&level=${encodeURIComponent(level)}`);
      }
    } else {
      // Masters or PhD
      navigate(`/university/${name}/courses?category=${encodeURIComponent(selectedCategory)}&selection=${encodeURIComponent(level)}`);
    }
  };

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

      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-xl shadow-slate-950/40">
        <h2 className="text-3xl font-semibold text-white">Start your academic path</h2>
        <p className="mt-3 text-slate-400">Select the type of program you want to explore.</p>
        <AcademicSelection onSelect={onCategorySelect} selected={selectedCategory} />
      </div>

      {selectedCategory ? (
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-xl shadow-slate-950/40">
          <h2 className="text-3xl font-semibold text-white">{selectedCategory} path</h2>
          <p className="mt-3 text-slate-400">Choose the next step for the selected academic path.</p>
          <LevelSelection category={selectedCategory} onSelect={onLevelSelect} />
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-slate-800 bg-slate-950 p-5">
          <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Campus</p>
          <p className="mt-2 text-xl font-semibold text-white">{university.location}</p>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-950 p-5">
          <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Programs</p>
          <p className="mt-2 text-xl font-semibold text-white">4 tracks</p>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-950 p-5">
          <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Flow</p>
          <p className="mt-2 text-xl font-semibold text-white">Category → Level → Courses</p>
        </div>
      </div>
    </div>
  );
}
