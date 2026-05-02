export default function AcademicSelection({ onSelect, selected }) {
  const cards = [
    { label: 'Natural', title: 'Natural Sciences', description: 'Science, biology, chemistry, and physics tracks.' },
    { label: 'Social', title: 'Social Sciences', description: 'Economics, history, law, and social studies.' },
    { label: 'Masters', title: 'Masters', description: 'Graduate programs and professional development.' },
    { label: 'PhD', title: 'PhD', description: 'Doctoral research and advanced academic study.' },
  ];

  return (
    <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <button
          key={card.label}
          type="button"
          onClick={() => onSelect(card.label)}
          className={`rounded-3xl border p-6 text-left transition ${selected === card.label ? 'border-sky-500 bg-slate-800' : 'border-slate-800 bg-slate-900 hover:border-sky-500 hover:bg-slate-800'}`}
        >
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">{card.label}</p>
          <h3 className="mt-4 text-2xl font-semibold text-white">{card.title}</h3>
          <p className="mt-3 text-slate-400">{card.description}</p>
        </button>
      ))}
    </div>
  );
}
