export default function LevelSelection({ category, onSelect }) {
  const optionsByCategory = {
    Natural: ['Freshman', 'Remedial', 'Senior'],
    Social: ['Freshman', 'Remedial', 'Senior'],
    Masters: ["Master's Degree"],
    PhD: ['PhD'],
  };
  const options = optionsByCategory[category] || [];
  if (!options.length) return <div className="mt-8 rounded-3xl border border-slate-800 bg-slate-950 p-6 text-slate-400">This academic path will be available soon.</div>;
  return (
    <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {options.map(option => (
        <button key={option} type="button" onClick={() => onSelect(option)} className="rounded-3xl border border-slate-800 bg-slate-900 p-6 text-left transition hover:border-sky-500 hover:bg-slate-800">
          <h3 className="text-2xl font-semibold text-white">{option}</h3>
          <p className="mt-3 text-slate-400">{option === 'Senior' ? 'Choose your department and year' : 'Explore ' + option + ' courses and materials'}</p>
        </button>
      ))}
    </div>
  );
}
