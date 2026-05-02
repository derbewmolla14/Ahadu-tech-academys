import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

export default function CourseContent() {
  const { name } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const faculty = searchParams.get('faculty');
  const department = searchParams.get('department');
  const year = searchParams.get('year');

  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // If missing required parameters, redirect to university page
    if (!faculty || !department || !year) {
      navigate(`/university/${name}`);
      return;
    }

    fetchCourseData();
  }, [faculty, department, year, name, navigate]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/content?university=${encodeURIComponent(name)}&department=${encodeURIComponent(department)}&year=${encodeURIComponent(year)}`);
      const data = await response.json();

      if (data.success && data.data.length > 0) {
        setCourseData(data.data[0]); // Get the first matching course
      } else {
        setError('Course content not found or not available');
      }
    } catch (err) {
      setError('Error loading course content');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Don't render if missing required data
  if (!faculty || !department || !year) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white text-xl">Loading course content...</div>
      </div>
    );
  }

  if (error || !courseData) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-red-900/50 border border-red-700 text-red-200 p-6 rounded-xl">
            <h2 className="text-xl font-semibold mb-2">Content Not Available</h2>
            <p>{error || 'This course content is not currently available.'}</p>
            <button
              onClick={() => navigate(-1)}
              className="mt-4 bg-red-700 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
            >
              ← Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* HEADER */}
      <div className="bg-slate-900 border-b border-slate-800 p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-semibold text-white">{courseData.course}</h1>
          <p className="mt-2 text-slate-400">
            University: {courseData.university} | Faculty: {faculty} Sciences | Department: {courseData.department} | Year: {courseData.year}
          </p>
          {courseData.description && (
            <p className="mt-2 text-slate-300">{courseData.description}</p>
          )}
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
      </div>

      {/* CONTENT SECTIONS */}
      <div className="max-w-6xl mx-auto p-6 space-y-8">

        {/* NOTES SECTION */}
        {courseData.notes && courseData.notes.length > 0 && (
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-xl shadow-slate-950/40">
            <h2 className="text-3xl font-semibold text-white mb-6">📄 Notes</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {courseData.notes.map((note, index) => (
                <a
                  key={index}
                  href={note.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-2xl border border-slate-700 bg-slate-800 p-4 transition hover:border-slate-600 hover:bg-slate-700"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">📄</span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white text-sm leading-tight">{note.title}</h3>
                      <p className="text-slate-400 text-xs mt-1">PDF Document</p>
                    </div>
                  </div>
                  <div className="text-blue-400 text-xs">Click to open →</div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* VIDEOS SECTION */}
        {courseData.videos && courseData.videos.length > 0 && (
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-xl shadow-slate-950/40">
            <h2 className="text-3xl font-semibold text-white mb-6">🎥 Videos</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {courseData.videos.map((video, index) => (
                <a
                  key={index}
                  href={video.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-2xl border border-slate-700 bg-slate-800 p-4 transition hover:border-slate-600 hover:bg-slate-700"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">🎥</span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white text-sm leading-tight">{video.title}</h3>
                      <p className="text-slate-400 text-xs mt-1">Video Content</p>
                    </div>
                  </div>
                  <div className="text-red-400 text-xs">Watch video →</div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* PPTS SECTION */}
        {courseData.ppts && courseData.ppts.length > 0 && (
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-xl shadow-slate-950/40">
            <h2 className="text-3xl font-semibold text-white mb-6">📊 Presentations</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {courseData.ppts.map((ppt, index) => (
                <a
                  key={index}
                  href={ppt.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-2xl border border-slate-700 bg-slate-800 p-4 transition hover:border-slate-600 hover:bg-slate-700"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">📊</span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white text-sm leading-tight">{ppt.title}</h3>
                      <p className="text-slate-400 text-xs mt-1">PowerPoint Presentation</p>
                    </div>
                  </div>
                  <div className="text-purple-400 text-xs">View presentation →</div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* NO CONTENT MESSAGE */}
        {(!courseData.notes || courseData.notes.length === 0) &&
         (!courseData.videos || courseData.videos.length === 0) &&
         (!courseData.ppts || courseData.ppts.length === 0) && (
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-xl shadow-slate-950/40 text-center">
            <div className="text-6xl mb-4">📚</div>
            <h2 className="text-2xl font-semibold text-white mb-4">Content Coming Soon</h2>
            <p className="text-slate-400">This course is currently being prepared. Materials will be available soon.</p>
          </div>
        )}

      </div>
    </div>
  );
}
