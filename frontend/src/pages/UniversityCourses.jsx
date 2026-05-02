import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import universityApi from '../api/universityApi';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function UniversityCourses() {
  const { name } = useParams();
  const query = useQuery();
  const level = query.get('level') || 'Undergraduate';
  const department = query.get('department') || 'Computer Science';
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    universityApi.getCourses(name, level, department)
      .then(setCourses)
      .catch(() => setError('Unable to load courses.'));
  }, [name, level, department]);

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-10 shadow-xl shadow-slate-950/40">
        <h1 className="text-4xl font-semibold text-white">Courses for {department}</h1>
        <p className="mt-4 text-slate-400">Choose a course to open video lessons, PDF reading material, PPT downloads, and notes.</p>
      </div>

      {error ? (
        <div className="rounded-3xl border border-rose-500/20 bg-rose-500/10 p-6 text-rose-200">{error}</div>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {(courses.length ? courses : [
          { id: 'cs101', title: 'Introduction to Computer Science', description: 'Basics of computing and programming.' },
          { id: 'cs102', title: 'Data Structures', description: 'Learn arrays, lists, trees, and graphs.' },
          { id: 'cs103', title: 'Web Development', description: 'Build responsive websites with HTML, CSS and JS.' },
        ]).map((course) => {
          const courseId = course.id || course.slug || course._id;
          return (
            <Link
              key={courseId}
              to={`/university/${name}/content/${courseId}`}
              className="rounded-3xl border border-slate-800 bg-slate-900 p-8 text-white transition hover:border-sky-500 hover:bg-slate-800"
            >
              <h2 className="text-2xl font-semibold">{course.title}</h2>
              <p className="mt-3 text-slate-400">{course.description}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
