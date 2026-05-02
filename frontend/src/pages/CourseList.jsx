import { useMemo, useState } from 'react';
import { Link, useSearchParams, useParams } from 'react-router-dom';

const sampleCourses = {
  Natural: {
    Freshman: [
      { id: 'nat-f1', title: 'Intro to Natural Sciences', description: 'Foundations of biology, chemistry, and physics.' },
      { id: 'nat-f2', title: 'Mathematics for Science', description: 'Essential math for science students.' },
      { id: 'nat-f3', title: 'Scientific Communication', description: 'Learn how to communicate research clearly.' },
    ],
    Remedial: [
      { id: 'nat-r1', title: 'Remedial Science Foundations', description: 'Review core science concepts before advanced study.' },
      { id: 'nat-r2', title: 'Problem Solving for Science', description: 'Practice exercises and critical thinking.' },
    ],
    Senior: {
      'Engineering (Electrical)': {
        'Year 1': [
          { id: 'ee-y1-1', title: 'Electrical Circuits', description: 'Basic circuit analysis and design.' },
          { id: 'ee-y1-2', title: 'Digital Electronics', description: 'Introduction to digital systems.' },
        ],
        'Year 2': [
          { id: 'ee-y2-1', title: 'Power Systems', description: 'Electrical power generation and distribution.' },
          { id: 'ee-y2-2', title: 'Control Systems', description: 'Feedback control theory and applications.' },
        ],
        'Year 3': [
          { id: 'ee-y3-1', title: 'Advanced Electronics', description: 'Semiconductor devices and integrated circuits.' },
          { id: 'ee-y3-2', title: 'Communication Systems', description: 'Signal processing and telecommunications.' },
        ],
        'Year 4': [
          { id: 'ee-y4-1', title: 'Power Electronics', description: 'High-power electronic systems.' },
          { id: 'ee-y4-2', title: 'Senior Design Project', description: 'Capstone engineering project.' },
        ],
      },
      'Computer Science': {
        'Year 1': [
          { id: 'cs-y1-1', title: 'Programming Fundamentals', description: 'Introduction to programming concepts.' },
          { id: 'cs-y1-2', title: 'Data Structures', description: 'Fundamental data structures and algorithms.' },
        ],
        'Year 2': [
          { id: 'cs-y2-1', title: 'Database Systems', description: 'Relational databases and SQL.' },
          { id: 'cs-y2-2', title: 'Software Engineering', description: 'Software development methodologies.' },
        ],
        'Year 3': [
          { id: 'cs-y3-1', title: 'Artificial Intelligence', description: 'Machine learning and AI concepts.' },
          { id: 'cs-y3-2', title: 'Computer Networks', description: 'Network protocols and architecture.' },
        ],
        'Year 4': [
          { id: 'cs-y4-1', title: 'Advanced Algorithms', description: 'Complex algorithms and optimization.' },
          { id: 'cs-y4-2', title: 'Capstone Project', description: 'Senior software development project.' },
        ],
      },
      // Add more departments as needed
    },
  },
  Social: {
    Freshman: [
      { id: 'soc-f1', title: 'Intro to Social Sciences', description: 'Foundations of sociology, economics, and history.' },
      { id: 'soc-f2', title: 'Academic Writing', description: 'Write strong essays and research reports.' },
      { id: 'soc-f3', title: 'Social Science Skills', description: 'Critical thinking for social science study.' },
    ],
    Remedial: [
      { id: 'soc-r1', title: 'Remedial Social Science', description: 'Review key social science concepts.' },
      { id: 'soc-r2', title: 'Study Skills for Social Sciences', description: 'Build academic foundation and exam readiness.' },
    ],
    Senior: {
      'Law': {
        'Year 1': [
          { id: 'law-y1-1', title: 'Legal Systems', description: 'Introduction to legal principles and systems.' },
          { id: 'law-y1-2', title: 'Constitutional Law', description: 'Study of constitutional frameworks.' },
        ],
        'Year 2': [
          { id: 'law-y2-1', title: 'Criminal Law', description: 'Principles of criminal justice.' },
          { id: 'law-y2-2', title: 'Contract Law', description: 'Legal aspects of contracts and agreements.' },
        ],
        'Year 3': [
          { id: 'law-y3-1', title: 'International Law', description: 'Global legal frameworks and treaties.' },
          { id: 'law-y3-2', title: 'Legal Research Methods', description: 'Advanced legal research techniques.' },
        ],
        'Year 4': [
          { id: 'law-y4-1', title: 'Legal Ethics', description: 'Professional responsibility in law.' },
          { id: 'law-y4-2', title: 'Moot Court', description: 'Practical legal argumentation and advocacy.' },
        ],
      },
      'Economics': {
        'Year 1': [
          { id: 'eco-y1-1', title: 'Microeconomics', description: 'Individual economic decision-making.' },
          { id: 'eco-y1-2', title: 'Macroeconomics', description: 'National and global economic systems.' },
        ],
        'Year 2': [
          { id: 'eco-y2-1', title: 'Econometrics', description: 'Statistical methods in economics.' },
          { id: 'eco-y2-2', title: 'Development Economics', description: 'Economic growth and development.' },
        ],
        'Year 3': [
          { id: 'eco-y3-1', title: 'International Trade', description: 'Global trade theories and policies.' },
          { id: 'eco-y3-2', title: 'Financial Economics', description: 'Financial markets and instruments.' },
        ],
        'Year 4': [
          { id: 'eco-y4-1', title: 'Advanced Economic Theory', description: 'Complex economic models and theories.' },
          { id: 'eco-y4-2', title: 'Economic Policy Analysis', description: 'Evaluating economic policies and their impacts.' },
        ],
      },
      // Add more departments as needed
    },
  },
  Masters: [
    { id: 'mst-1', title: 'Applied Research Methods', description: 'Graduate-level projects and thesis preparation.' },
    { id: 'mst-2', title: 'Leadership and Strategy', description: 'Advanced management concepts for professionals.' },
  ],
  PhD: [
    { id: 'phd-1', title: 'PhD Seminar Series', description: 'Research presentation and publication guidance.' },
    { id: 'phd-2', title: 'Doctoral Research Design', description: 'Create rigorous proposals and methodology.' },
  ],
};

export default function CourseList() {
  const { name } = useParams();
  const [searchParams] = useSearchParams();
  const faculty = searchParams.get('faculty') || searchParams.get('category');
  const level = searchParams.get('level') || searchParams.get('selection');
  const department = searchParams.get('department');
  const year = searchParams.get('year');
  const [searchTerm, setSearchTerm] = useState('');

  const allCourses = useMemo(() => {
    if (faculty === 'Masters' || faculty === 'PhD') {
      return sampleCourses[faculty] || [];
    }

    if (level === 'Freshman' || level === 'Remedial') {
      return sampleCourses[faculty]?.[level] || [];
    }

    if (level === 'Senior' && department && year) {
      return sampleCourses[faculty]?.Senior?.[department]?.[year] || [];
    }

    return [];
  }, [faculty, level, department, year]);

  const courses = useMemo(() => {
    if (!searchTerm) return allCourses;
    return allCourses.filter(course =>
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allCourses, searchTerm]);

  const getTitle = () => {
    if (faculty === 'Masters' || faculty === 'PhD') {
      return `${faculty} Programs`;
    }
    if (level === 'Freshman' || level === 'Remedial') {
      return `${faculty} ${level} Courses`;
    }
    if (level === 'Senior') {
      return `${department} - ${year} Courses`;
    }
    return 'Courses';
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-xl shadow-slate-950/50">
        <h1 className="text-3xl font-semibold text-white">{getTitle()}</h1>
        <p className="mt-2 text-slate-400">These are sample courses based on your selected path.</p>
        <p className="mt-3 text-slate-300">University: {name.replace(/-/g, ' ')}</p>
        {department && <p className="mt-1 text-slate-300">Department: {department}</p>}
        {year && <p className="mt-1 text-slate-300">Year: {year}</p>}
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="rounded-full border border-slate-700 px-5 py-3 text-sm text-slate-200 transition hover:border-slate-500"
          >
            ← Back
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
        <div className="flex items-center gap-3 rounded-3xl border border-slate-800 bg-slate-950 px-4 py-3">
          <span className="text-slate-500">🔍</span>
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search courses..."
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
          />
        </div>
        {searchTerm && (
          <p className="mt-3 text-sm text-slate-400">
            Found {courses.length} course{courses.length !== 1 ? 's' : ''} matching "{searchTerm}"
          </p>
        )}
      </div>

      {/* Course Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <Link
            key={course.id}
            to={`/university/${name}/course/${course.id}?faculty=${encodeURIComponent(faculty)}&level=${encodeURIComponent(level)}${department ? `&department=${encodeURIComponent(department)}` : ''}${year ? `&year=${encodeURIComponent(year)}` : ''}`}
            className="rounded-3xl border border-slate-800 bg-slate-900 p-6 text-left transition hover:border-sky-500 hover:bg-slate-800"
          >
            <div className="flex items-start justify-between mb-3">
              <h2 className="text-xl font-semibold text-white">{course.title}</h2>
              <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-400">
                {department || faculty}
              </span>
            </div>
            <p className="text-slate-400">{course.description}</p>
            <div className="mt-4 flex items-center text-sm text-sky-400">
              <span>View Course Details →</span>
            </div>
          </Link>
        ))}
      </div>

      {!courses.length ? (
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 text-center text-slate-300">
          {searchTerm ? `No courses found matching "${searchTerm}"` : 'No courses are available for this path yet.'}
        </div>
      ) : null}
    </div>
  );
}
