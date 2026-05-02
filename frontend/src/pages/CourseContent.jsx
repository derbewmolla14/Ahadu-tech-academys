import { useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

// Sample course materials data
const courseMaterials = {
  Natural: {
    'Engineering (Electrical)': {
      'Year 1': {
        notes: [
          { title: 'Circuit Analysis Fundamentals', type: 'PDF', url: '#' },
          { title: 'Basic Electronics Notes', type: 'PDF', url: '#' },
          { title: 'Mathematics for Engineers', type: 'Text', url: '#' },
        ],
        videos: [
          { title: 'Introduction to Electrical Circuits', duration: '45 min', url: '#' },
          { title: 'Ohm\'s Law and Kirchhoff\'s Laws', duration: '32 min', url: '#' },
          { title: 'AC vs DC Circuits', duration: '28 min', url: '#' },
        ],
        slides: [
          { title: 'Week 1: Circuit Basics', url: '#' },
          { title: 'Week 2: Network Analysis', url: '#' },
          { title: 'Week 3: Power Systems Intro', url: '#' },
        ],
        assignments: [
          { title: 'Circuit Analysis Problem Set 1', type: 'PDF', url: '#' },
          { title: 'Lab: Basic Circuit Construction', type: 'Guide', url: '#' },
          { title: 'Quiz: Electrical Fundamentals', type: 'Online', url: '#' },
        ],
      },
      'Year 2': {
        notes: [
          { title: 'Power Systems Engineering', type: 'PDF', url: '#' },
          { title: 'Control Systems Theory', type: 'PDF', url: '#' },
        ],
        videos: [
          { title: 'Power Generation and Distribution', duration: '52 min', url: '#' },
          { title: 'Feedback Control Systems', duration: '41 min', url: '#' },
        ],
        slides: [
          { title: 'Power Systems Overview', url: '#' },
          { title: 'Control Theory Fundamentals', url: '#' },
        ],
        assignments: [
          { title: 'Power Flow Analysis Problems', type: 'PDF', url: '#' },
          { title: 'Control Systems Design Project', type: 'Guide', url: '#' },
        ],
      },
    },
    'Computer Science': {
      'Year 1': {
        notes: [
          { title: 'Programming Fundamentals', type: 'PDF', url: '#' },
          { title: 'Data Structures Overview', type: 'PDF', url: '#' },
        ],
        videos: [
          { title: 'Introduction to Programming', duration: '38 min', url: '#' },
          { title: 'Arrays and Linked Lists', duration: '45 min', url: '#' },
        ],
        slides: [
          { title: 'Programming Concepts', url: '#' },
          { title: 'Data Structures Basics', url: '#' },
        ],
        assignments: [
          { title: 'Basic Programming Exercises', type: 'PDF', url: '#' },
          { title: 'Data Structures Implementation', type: 'Code', url: '#' },
        ],
      },
    },
  },
  Social: {
    'Law': {
      'Year 1': {
        notes: [
          { title: 'Legal Systems and Principles', type: 'PDF', url: '#' },
          { title: 'Constitutional Law Basics', type: 'PDF', url: '#' },
        ],
        videos: [
          { title: 'Introduction to Legal Systems', duration: '42 min', url: '#' },
          { title: 'Constitutional Framework', duration: '35 min', url: '#' },
        ],
        slides: [
          { title: 'Legal Theory Overview', url: '#' },
          { title: 'Constitutional Principles', url: '#' },
        ],
        assignments: [
          { title: 'Case Study Analysis', type: 'PDF', url: '#' },
          { title: 'Legal Research Exercise', type: 'Guide', url: '#' },
        ],
      },
    },
  },
};

export default function CourseContent() {
  const { name } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const faculty = searchParams.get('faculty');
  const department = searchParams.get('department');
  const year = searchParams.get('year');

  useEffect(() => {
    // If missing required parameters, redirect to university page
    if (!faculty || !department || !year) {
      navigate(`/university/${name}`);
    }
  }, [faculty, department, year, name, navigate]);

  // Don't render if missing required data
  if (!faculty || !department || !year) {
    return null;
  }

  const materials = courseMaterials[faculty]?.[department]?.[year] || {
    notes: [],
    videos: [],
    slides: [],
    assignments: [],
  };

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-10 shadow-xl shadow-slate-950/40">
        <h1 className="text-4xl font-semibold text-white">{department} - {year} Course Materials</h1>
        <p className="mt-4 text-slate-400">
          University: {name.replace(/-/g, ' ')} | Faculty: {faculty} Sciences | Department: {department} | Year: {year}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-full border border-slate-700 px-5 py-3 text-sm text-slate-200 transition hover:border-slate-500"
          >
            ← Back to Year Selection
          </button>
        </div>
      </div>

      {/* SECTION 1: Notes */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-xl shadow-slate-950/40">
        <h2 className="text-3xl font-semibold text-white mb-6">📄 Notes</h2>
        {materials.notes.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {materials.notes.map((note, index) => (
              <div key={index} className="rounded-2xl border border-slate-700 bg-slate-800 p-4 transition hover:border-slate-600">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">📄</span>
                  <div>
                    <h3 className="font-semibold text-white">{note.title}</h3>
                    <p className="text-sm text-slate-400">{note.type}</p>
                  </div>
                </div>
                <button className="w-full rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-500">
                  Download
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-400">No notes available for this course yet.</p>
        )}
      </div>

      {/* SECTION 2: Video Lessons */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-xl shadow-slate-950/40">
        <h2 className="text-3xl font-semibold text-white mb-6">🎥 Video Lessons</h2>
        {materials.videos.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {materials.videos.map((video, index) => (
              <div key={index} className="rounded-2xl border border-slate-700 bg-slate-800 p-4 transition hover:border-slate-600">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">🎥</span>
                  <div>
                    <h3 className="font-semibold text-white">{video.title}</h3>
                    <p className="text-sm text-slate-400">{video.duration}</p>
                  </div>
                </div>
                <button className="w-full rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-500">
                  Watch Video
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-400">No video lessons available for this course yet.</p>
        )}
      </div>

      {/* SECTION 3: PPT Slides */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-xl shadow-slate-950/40">
        <h2 className="text-3xl font-semibold text-white mb-6">📊 PPT Slides</h2>
        {materials.slides.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {materials.slides.map((slide, index) => (
              <div key={index} className="rounded-2xl border border-slate-700 bg-slate-800 p-4 transition hover:border-slate-600">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">📊</span>
                  <div>
                    <h3 className="font-semibold text-white">{slide.title}</h3>
                    <p className="text-sm text-slate-400">PowerPoint Presentation</p>
                  </div>
                </div>
                <button className="w-full rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-500">
                  Download PPT
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-400">No presentation slides available for this course yet.</p>
        )}
      </div>

      {/* SECTION 4: Assignments / Resources */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-xl shadow-slate-950/40">
        <h2 className="text-3xl font-semibold text-white mb-6">📝 Assignments & Resources</h2>
        {materials.assignments.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {materials.assignments.map((assignment, index) => (
              <div key={index} className="rounded-2xl border border-slate-700 bg-slate-800 p-4 transition hover:border-slate-600">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">📝</span>
                  <div>
                    <h3 className="font-semibold text-white">{assignment.title}</h3>
                    <p className="text-sm text-slate-400">{assignment.type}</p>
                  </div>
                </div>
                <button className="w-full rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-500">
                  {assignment.type === 'Online' ? 'Take Quiz' : 'Download'}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-400">No assignments or resources available for this course yet.</p>
        )}
      </div>
    </div>
  );
}
