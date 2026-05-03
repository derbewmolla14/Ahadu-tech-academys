import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../api/api';

export default function AdminDashboard() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await apiFetch('content/admin/all');
      const data = await response.json();

      if (data.success) {
        setCourses(data.data);
      } else {
        setError('Failed to fetch courses');
      }
    } catch (err) {
      setError('Error fetching courses');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleCourseStatus = async (courseId, currentStatus) => {
    try {
      const response = await apiFetch(`content/${courseId}/toggle-status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        // Update the course status in the local state
        setCourses(courses.map(course =>
          course._id === courseId
            ? { ...course, isActive: !currentStatus }
            : course
        ));
      } else {
        setError('Failed to toggle course status');
      }
    } catch (err) {
      setError('Error toggling course status');
      console.error('Toggle error:', err);
    }
  };

  const deleteCourse = async (courseId) => {
    if (!confirm('Are you sure you want to delete this course?')) {
      return;
    }

    try {
      const response = await apiFetch(`content/${courseId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setCourses(courses.filter(course => course._id !== courseId));
      } else {
        setError('Failed to delete course');
      }
    } catch (err) {
      setError('Error deleting course');
      console.error('Delete error:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white text-xl">Loading admin dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* HEADER */}
      <div className="bg-slate-900 border-b border-slate-800 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-slate-400">Manage course content and access permissions</p>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto p-6">
        {/* ACTION BUTTONS */}
        <div className="mb-8 flex gap-4">
          <Link
            to="/admin/add-course"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            ➕ Add New Course
          </Link>
          <button
            onClick={fetchCourses}
            className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            🔄 Refresh
          </button>
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <div className="mb-6 bg-red-900/50 border border-red-700 text-red-200 p-4 rounded-lg">
            {error}
            <button
              onClick={() => setError('')}
              className="ml-4 text-red-400 hover:text-red-300"
            >
              ✕
            </button>
          </div>
        )}

        {/* COURSES TABLE */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
          <div className="p-6 border-b border-slate-800">
            <h2 className="text-xl font-semibold text-white">All Courses ({courses.length})</h2>
          </div>

          {courses.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              No courses found. <Link to="/admin/add-course" className="text-blue-400 hover:text-blue-300">Add your first course</Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-800">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">Course</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">University</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">Department</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">Year</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">Materials</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {courses.map((course) => (
                    <tr key={course._id} className="hover:bg-slate-800/50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-white">{course.course}</div>
                          {course.description && (
                            <div className="text-sm text-slate-400 truncate max-w-xs">
                              {course.description}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-300">{course.university}</td>
                      <td className="px-6 py-4 text-slate-300">{course.department}</td>
                      <td className="px-6 py-4 text-slate-300">{course.year}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2 text-sm">
                          {course.notes.length > 0 && (
                            <span className="bg-blue-900/50 text-blue-300 px-2 py-1 rounded">
                              📄 {course.notes.length}
                            </span>
                          )}
                          {course.videos.length > 0 && (
                            <span className="bg-red-900/50 text-red-300 px-2 py-1 rounded">
                              🎥 {course.videos.length}
                            </span>
                          )}
                          {course.ppts.length > 0 && (
                            <span className="bg-purple-900/50 text-purple-300 px-2 py-1 rounded">
                              📊 {course.ppts.length}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          course.isActive
                            ? 'bg-green-900/50 text-green-300'
                            : 'bg-red-900/50 text-red-300'
                        }`}>
                          {course.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => toggleCourseStatus(course._id, course.isActive)}
                            className={`px-3 py-1 text-xs font-medium rounded ${
                              course.isActive
                                ? 'bg-red-900/50 text-red-300 hover:bg-red-800/50'
                                : 'bg-green-900/50 text-green-300 hover:bg-green-800/50'
                            }`}
                          >
                            {course.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <Link
                            to={`/admin/edit-course/${course._id}`}
                            className="px-3 py-1 text-xs font-medium rounded bg-blue-900/50 text-blue-300 hover:bg-blue-800/50"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => deleteCourse(course._id)}
                            className="px-3 py-1 text-xs font-medium rounded bg-red-900/50 text-red-300 hover:bg-red-800/50"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}