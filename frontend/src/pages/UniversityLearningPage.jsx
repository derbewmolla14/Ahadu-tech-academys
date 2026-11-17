import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { apiFetch } from '../api/api';

const STREAMS = {
  'natural-science': 'Natural Science',
  'social-science': 'Social Science',
};
const LEVELS = ['Freshman', 'Remedial', 'Senior'];
const YEARS = ['2016', '2017', '2018'];
const sessionUrl = 'university-learning-session';

async function apiRequest(path, body) {
  const response = await apiFetch(path, body ? {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  } : {});
  const result = await response.json();
  if (!response.ok || !result.success) throw new Error(result.message || 'Request failed.');
  return result.data;
}

export default function UniversityLearningPage() {
  const location = useLocation();
  const navigate = useNavigate();
  // The current App routes use literal stream paths, not a :faculty parameter.
  const routeStream = location.pathname.split('/')[2];
  const stream = STREAMS[routeStream];
  const [session, setSession] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [resources, setResources] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refreshSession = useCallback(async () => {
    const value = await apiRequest(sessionUrl);
    setSession(value);
    return value;
  }, []);

  useEffect(() => {
    let active = true;
    async function initialize() {
      try {
        setLoading(true);
        setError('');
        if (!stream) throw new Error('University stream not found.');
        let current = await apiRequest(sessionUrl);
        if (current.stream !== stream || current.state === 'SELECT_STREAM') {
          current = await apiRequest(sessionUrl + '/stream', { stream });
        }
        if (active) setSession(current);
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    }
    initialize();
    return () => { active = false; };
  }, [stream]);

  const loadCourses = useCallback(async (filters) => {
    const query = new URLSearchParams({ level: 'university', faculty: stream, ...filters });
    const response = await apiFetch('content?' + query.toString());
    const result = await response.json();
    if (!response.ok || !result.success) throw new Error(result.message || 'Unable to load courses.');
    setCourses(Array.isArray(result.data) ? result.data : []);
  }, [stream]);

  const loadDepartments = useCallback(async () => {
    const query = new URLSearchParams({ category: stream });
    const response = await apiFetch('departments?' + query.toString());
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Unable to load departments.');
    setDepartments(Array.isArray(result) ? result.filter((d) => d?.isActive) : []);
  }, [stream]);

  useEffect(() => {
    if (!session) return;
    let active = true;
    async function loadStateData() {
      try {
        setError('');
        if (session.state === 'JUNIOR_COURSES') {
          await loadCourses({ studyStage: session.level, contentType: 'course-materials' });
        } else if (session.state === 'SENIOR_DEPARTMENTS') {
          await loadDepartments();
        } else if (session.state === 'SENIOR_COURSES') {
          await loadCourses({ studyStage: 'Senior', department: session.departmentName, contentType: 'course-materials' });
        } else if (session.state === 'SENIOR_EXIT_EXAM') {
          await loadCourses({ studyStage: 'Senior', department: session.departmentName, contentType: 'exit-exam' });
        } else if (session.state === 'EXAM_QUESTIONS') {
          await loadCourses({ studyStage: session.level, contentType: 'exam-question', examYear: session.examYear });
        } else if (session.state === 'JUNIOR_MATERIALS' || session.state === 'SENIOR_MATERIALS') {
          const response = await apiFetch('content/' + encodeURIComponent(session.courseId));
          const result = await response.json();
          if (!response.ok || !result.success) throw new Error(result.message || 'Unable to load selected course.');
          if (result.accessLocked) throw new Error(result.message || 'Administrator approval is required.');
          if (active) {
            setSelectedCourse(result.data);
            setResources({
              pdf: result.data.notes || [],
              ppt: result.data.ppts || [],
              video: result.data.videos || [],
            });
          }
        } else {
          setCourses([]);
          setDepartments([]);
        }
      } catch (err) {
        if (active) setError(err.message);
      }
    }
    loadStateData();
    return () => { active = false; };
  }, [session, loadCourses, loadDepartments]);

  const transition = async (path, body) => {
    try {
      setError('');
      setLoading(true);
      const next = await apiRequest(sessionUrl + path, body);
      setSession(next);
      setSelectedCourse(null);
      setResources(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const back = async () => {
    try {
      setError('');
      const next = await apiRequest(sessionUrl + '/back', {});
      setSession(next);
      setSelectedCourse(null);
      setResources(null);
      if (next.state === 'SELECT_STREAM') navigate('/university');
    } catch (err) {
      setError(err.message);
    }
  };

  const startOver = async () => {
    try {
      const next = await apiRequest(sessionUrl + '/reset', {});
      setSession(next);
      navigate('/university');
    } catch (err) {
      setError(err.message);
    }
  };

  const openCourse = (course) => transition('/course', { courseId: course._id });
  const openResource = (course, format) => {
    navigate('/university/course/' + course._id + '?format=' + format.toLowerCase() + '&faculty=' + encodeURIComponent(stream) + '&department=' + encodeURIComponent(session.departmentName || ''));
  };

  if (loading && !session) return <Panel>Loading University learning path…</Panel>;
  if (!session) return <Panel>{error || 'Unable to initialize University learning path.'}</Panel>;

  const heading = session.level
    ? session.level + (session.departmentName ? ' · ' + session.departmentName : '')
    : 'Select Academic Level';

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-5 sm:p-6">
      <header className="rounded-3xl border border-slate-800 bg-slate-900 p-6 sm:p-8">
        <Link to="/university" className="text-sm text-sky-400 hover:text-sky-300">← University streams</Link>
        <p className="mt-4 text-sm font-semibold uppercase tracking-widest text-sky-400">{stream}</p>
        <h1 className="mt-2 text-3xl font-bold text-white">{heading}</h1>
        <p className="mt-2 text-slate-400">Follow your selected University learning path.</p>
        <div className="mt-5 flex flex-wrap gap-3">
          {session.state !== 'SELECT_LEVEL' && <button onClick={back} className="rounded-xl border border-slate-700 px-4 py-2 text-white">← Back</button>}
          <button onClick={startOver} className="rounded-xl border border-slate-700 px-4 py-2 text-slate-300">Start Over</button>
        </div>
      </header>

      {error && <div role="alert" className="rounded-2xl border border-red-800 bg-red-950/40 p-4 text-red-200">{error}</div>}

      {session.state === 'SELECT_LEVEL' && <Menu title="Choose Academic Level" options={LEVELS} onSelect={(level) => transition('/level', { level })} />}

      {session.state === 'JUNIOR_COURSES' && <CourseList title={session.level + ' Courses'} courses={courses} onSelect={openCourse} />}

      {session.state === 'JUNIOR_LEARNING_TYPE' && <Menu title="Select Learning Type" options={[
        { label: 'Exam Question', value: 'EXAM_QUESTION', description: 'ፈተና እና ጥያቄዎች' },
        { label: 'Course Material', value: 'COURSE_MATERIAL', description: 'የኮርስ ማቴሪያሎች' },
      ]} onSelect={(value) => transition('/learning-type', { learningType: value })} />}

      {session.state === 'EXAM_YEAR' && <Menu title="Select Academic Year" options={YEARS} onSelect={(examYear) => transition('/exam-year', { examYear })} />}

      {session.state === 'EXAM_QUESTIONS' && <CourseList title={'Exam Questions · ' + session.examYear} courses={courses} onSelect={(course) => navigate('/university/course/' + course._id + '?faculty=' + encodeURIComponent(stream) + '&format=questions')} empty="No questions are uploaded for this year yet." />}

      {session.state === 'JUNIOR_MATERIALS' && <ResourceList course={selectedCourse} resources={resources} onOpen={openResource} />}

      {session.state === 'SENIOR_DEPARTMENTS' && <ItemList title="Select Department" items={departments} onSelect={(item) => transition('/department', { departmentId: item._id })} getLabel={(item) => item.name} />}

      {session.state === 'SENIOR_LEARNING_TYPE' && <Menu title="Select Learning Type" options={[
        { label: 'Exit Exam', value: 'EXIT_EXAM', description: 'Department exit exam questions, answers, and solutions' },
        { label: 'Course Material', value: 'COURSE_MATERIAL', description: 'Browse department courses and resources' },
      ]} onSelect={(value) => transition('/learning-type', { learningType: value })} />}

      {session.state === 'SENIOR_EXIT_EXAM' && <CourseList title="Department Exit Exam" courses={courses} onSelect={(course) => navigate('/university/course/' + course._id + '?faculty=' + encodeURIComponent(stream) + '&format=questions')} empty="No Exit Exam questions are available for this department yet." />}

      {session.state === 'SENIOR_COURSES' && <CourseList title="Department Course List" courses={courses} onSelect={openCourse} />}

      {session.state === 'SENIOR_MATERIALS' && <ResourceList course={selectedCourse} resources={resources} onOpen={openResource} />}
    </main>
  );
}

function Panel({ children }) {
  return <div className="mx-auto max-w-4xl rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-200">{children}</div>;
}

function Menu({ title, options, onSelect }) {
  return <section className="space-y-4"><h2 className="text-xl font-semibold text-white">{title}</h2><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{options.map((item) => {
    const option = typeof item === 'string' ? { label: item, value: item } : item;
    return <button key={option.value} onClick={() => onSelect(option.value)} className="rounded-2xl border border-slate-800 bg-slate-900 p-6 text-left text-white transition hover:border-sky-500"><span className="text-lg font-semibold">{option.label}</span>{option.description && <span className="mt-2 block text-sm text-slate-400">{option.description}</span>}</button>;
  })}</div></section>;
}

function CourseList({ title, courses, onSelect, empty = 'No courses are available for this selection yet.' }) {
  return <section className="space-y-4"><h2 className="text-xl font-semibold text-white">{title}</h2>{courses.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{courses.map((course) => <button key={course._id} onClick={() => onSelect(course)} className="rounded-2xl border border-slate-800 bg-slate-900 p-6 text-left text-white hover:border-sky-500"><span className="text-xs uppercase tracking-wider text-sky-400">{course.courseCode || course.department}</span><span className="mt-2 block text-lg font-semibold">{course.course}</span>{course.description && <span className="mt-2 block text-sm text-slate-400">{course.description}</span>}{course.isPremium && <span className="mt-3 inline-block text-xs text-amber-300">Premium · approval required</span>}</button>)}</div> : <Panel>{empty}</Panel>}</section>;
}

function ItemList({ title, items, onSelect, getLabel }) {
  return <section className="space-y-4"><h2 className="text-xl font-semibold text-white">{title}</h2>{items.length ? <div className="divide-y divide-slate-800 rounded-2xl border border-slate-800 bg-slate-900 px-5">{items.map((item) => <button key={item._id} onClick={() => onSelect(item)} className="flex w-full items-center justify-between py-5 text-left text-white hover:text-sky-300"><span className="font-semibold">{getLabel(item)}</span><span className="text-sky-400">Select →</span></button>)}</div> : <Panel>No active departments are configured for this stream.</Panel>}</section>;
}

function ResourceList({ course, resources, onOpen }) {
  if (!resources) return <Panel>Loading course resources…</Panel>;
  const options = [
    { key: 'pdf', label: 'PDF', count: resources.pdf.length },
    { key: 'video', label: 'Video', count: resources.video.length },
    { key: 'ppt', label: 'PPT', count: resources.ppt.length },
  ];
  return <section className="space-y-4"><h2 className="text-xl font-semibold text-white">{course?.course || 'Course Materials'}</h2><div className="grid gap-4 sm:grid-cols-3">{options.map((item) => <button key={item.key} disabled={!item.count} onClick={() => onOpen(course, item.label)} className="rounded-2xl border border-slate-800 bg-slate-900 p-6 text-left text-white enabled:hover:border-sky-500 disabled:opacity-50"><span className="text-xl font-semibold">{item.label}</span><span className="mt-2 block text-sm text-slate-400">{item.count} available</span></button>)}</div>{!options.some((item) => item.count) && <Panel>No PDF, Video, or PPT resources have been uploaded.</Panel>}</section>;
}
