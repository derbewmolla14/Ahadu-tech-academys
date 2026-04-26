import { Link } from 'react-router-dom';
import { useState } from 'react';

const universities = [
  { slug: 'addis-ababa-university', name: 'Addis Ababa University', description: 'Ethiopia\'s oldest and most comprehensive university.' },
  { slug: 'wollo-university', name: 'Wollo University', description: 'A regional university in northern Ethiopia.' },
  { slug: 'bahir-dar-university', name: 'Bahir Dar University', description: 'Known for engineering and social science programs.' },
  { slug: 'mekelle-university', name: 'Mekelle University', description: 'A research university with strong agriculture programs.' },
  { slug: 'jimma-university', name: 'Jimma University', description: 'Leading university in science and health.' },
  { slug: 'gondar-university', name: 'Gondar University', description: 'Historic university with diverse faculties.' },
  { slug: 'debre-berhan-university', name: 'Debre Berhan University', description: 'Focused on applied sciences and education.' },
  { slug: 'debre-markos-university', name: 'Debre Markos University', description: 'Regional university in western Ethiopia.' },
  { slug: 'woldia-university', name: 'Woldia University', description: 'New university with growing programs.' },
  { slug: 'hawassa-university', name: 'Hawassa University', description: 'Fast-growing university in southern Ethiopia.' },
  { slug: 'arba-minch-university', name: 'Arba Minch University', description: 'Known for tourism and environmental studies.' },
  { slug: 'adama-science-and-technology-university', name: 'Adama Science and Technology University', description: 'Specialized in science and technology.' },
  { slug: 'dilla-university', name: 'Dilla University', description: 'University in the south with various programs.' },
  { slug: 'haramaya-university', name: 'Haramaya University', description: 'Agricultural and development focused.' },
  { slug: 'jigjiga-university', name: 'Jigjiga University', description: 'University in eastern Ethiopia.' },
  { slug: 'ambo-university', name: 'Ambo University', description: 'Regional university with business programs.' },
  { slug: 'dire-dawa-university', name: 'Dire Dawa University', description: 'University in Dire Dawa region.' },
  { slug: 'mizan-tepi-university', name: 'Mizan Tepi University', description: 'Focused on forestry and natural resources.' },
  { slug: 'wolkite-university', name: 'Wolkite University', description: 'New university in Gurage zone.' },
  { slug: 'bule-hora-university', name: 'Bule Hora University', description: 'University in southern Ethiopia.' },
];

export default function UniversitiesPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUniversities = universities.filter(university =>
    university.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex min-h-screen">
      {/* Left Sidebar */}
      <div className="w-1/4 min-h-screen bg-slate-900 p-6 border-r border-slate-800">
        <h2 className="text-xl font-semibold text-white mb-4">Ethiopian Universities</h2>
        
        {/* Search Input */}
        <input
          type="text"
          placeholder="Search universities..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 mb-4 bg-slate-800 text-white rounded border border-slate-700 focus:outline-none focus:border-sky-500"
        />
        
        {/* University List */}
        <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
          {filteredUniversities.map((university) => (
            <Link
              key={university.slug}
              to={`/university/${university.slug}`}
              className="block p-3 rounded-lg hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-700"
            >
              <h3 className="text-white font-medium">{university.name}</h3>
              <p className="text-slate-400 text-sm mt-1">{university.description}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Main Center Area */}
      <div className="w-3/4 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-10 shadow-xl shadow-slate-950/40">
            <h1 className="text-4xl font-semibold text-white mb-6">Welcome to Ahadu Tech Academy University System</h1>
            <p className="text-slate-400 text-lg mb-8">
              Select a university from the left sidebar to continue your learning journey. You can also use the search bar to quickly find your university.
            </p>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6">
                <h3 className="text-xl font-semibold text-white mb-3">How to Get Started</h3>
                <ul className="text-slate-300 space-y-2">
                  <li>• Browse universities in the sidebar</li>
                  <li>• Use search to filter by name</li>
                  <li>• Click on a university to view details</li>
                  <li>• Select your academic level</li>
                </ul>
              </div>
              <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6">
                <h3 className="text-xl font-semibold text-white mb-3">Available Programs</h3>
                <ul className="text-slate-300 space-y-2">
                  <li>• Natural Science</li>
                  <li>• Social Science</li>
                  <li>• Masters Programs</li>
                  <li>• PhD Programs</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
