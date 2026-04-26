import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api/api';

export default function CourseList() {
  const { departmentId, yearId } = useParams();
  const [courses, setCourses] = useState([]);
  const [year, setYear] = useState(null);

  useEffect(() => {
    if (!departmentId || !yearId) return;

    api.get(`/university-years/${yearId}`)
      .then((response) => setYear(response.data.year))
      .catch(console.error);

    api.get('/courses')
      .then((response) => {
        const filtered = (response.data.courses || []).filter(
          (course) => String(course.departmentRef) === String(departmentId) && String(course.yearRef) === String(yearId)
        );
        setCourses(filtered);
      })
      .catch(console.error);
  }, [departmentId, yearId]);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-xl shadow-slate-950/50">
        <h1 className="text-3xl font-semibold text-white">Available Courses</h1>
        <p className="mt-2 text-slate-400">Select a course to view lectures and resources.</p>
        {year ? <p className="mt-3 text-slate-300">Year: {year.name}</p> : null}
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <Link
            key={course._id}
            to={`/university/${departmentId}/${yearId}/${course._id}`}
            className="rounded-3xl border border-slate-800 bg-slate-900 p-6 text-left transition hover:border-blue-500 hover:bg-slate-800"
          >
            <h2 className="text-xl font-semibold text-white">{course.title}</h2>
            <p className="mt-2 text-slate-400">{course.description || 'Tap to view course materials.'}</p>
            {course.isLocked && <p className="mt-3 text-sm text-amber-400">Locked content</p>}
          </Link>
        ))}
      </div>
      {!courses.length ? <p className="text-slate-400">No courses found for this year.</p> : null}
    </div>
  );
}
