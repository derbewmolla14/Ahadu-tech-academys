import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/api';

export default function CourseContent() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [content, setContent] = useState(null);

  useEffect(() => {
    if (!courseId) return;

    api.get(`/courses/${courseId}`)
      .then((response) => setCourse(response.data.course))
      .catch(console.error);

    api.get(`/content/course/${courseId}`)
      .then((response) => setContent(response.data.content || null))
      .catch(console.error);
  }, [courseId]);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-xl shadow-slate-950/50">
        <h1 className="text-3xl font-semibold text-white">{course?.title || 'Course Content'}</h1>
        <p className="mt-2 text-slate-400">{course?.description || 'Review lectures, notes, and slides below.'}</p>
      </div>
      {course?.isLocked ? (
        <div className="rounded-3xl border border-amber-500/50 bg-amber-950/10 p-8 text-amber-200">
          <h2 className="text-2xl font-semibold">Locked Course</h2>
          <p className="mt-2 text-slate-300">This course content is currently locked. Contact the admin for access.</p>
        </div>
      ) : content ? (
        <div className="space-y-6">
          {content.videoUrl ? (
            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="text-xl font-semibold text-white">Video Lecture</h2>
              <a href={content.videoUrl} target="_blank" rel="noreferrer" className="mt-3 inline-block text-blue-400 underline">Open Lecture Video</a>
            </div>
          ) : null}
          {content.pptUrl ? (
            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="text-xl font-semibold text-white">Presentation</h2>
              <a href={content.pptUrl} target="_blank" rel="noreferrer" className="mt-3 inline-block text-blue-400 underline">Open PPT</a>
            </div>
          ) : null}
          {content.notes ? (
            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="text-xl font-semibold text-white">Notes</h2>
              <p className="mt-3 text-slate-300 whitespace-pre-line">{content.notes}</p>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 text-slate-400">No content uploaded for this course yet.</div>
      )}
    </div>
  );
}
