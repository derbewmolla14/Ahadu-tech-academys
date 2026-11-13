import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../api/api';

const categories = [
  { id: 'elementary', title: 'Elementary', detail: 'Grades 1–8', icon: '📚' },
  { id: 'highschool', title: 'High School', detail: 'Grades 9–12', icon: '🎓' },
  { id: 'university', title: 'University', detail: 'Freshman to PhD', icon: '🏛️' },
  { id: 'skills', title: 'New Skills', detail: 'Professional learning', icon: '💡' }
];
const universityLevels = ['Freshman', 'Remedial', 'Senior Undergraduate', "Master's Degree", 'PhD'];
const departmentsFallback = [
  'Software Engineering', 'Computer Science', 'Information Technology',
  'Civil Engineering', 'Water Resources and Irrigation Engineering',
  'Electrical Engineering', 'Mechanical Engineering', 'Accounting',
  'Business Management', 'Other'
];

function yearsFor(level) {
  if (level === 'Freshman') return ['Freshman'];
  if (level === 'Remedial') return ['Remedial'];
  if (level === "Master's Degree") return ['Year 1', 'Year 2'];
  if (level === 'PhD') return ['Year 1', 'Year 2', 'Year 3', 'Year 4'];
  return ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'];
}

const blankMaterial = () => ({ title: '', file: null });

export default function AddCourse() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [universities, setUniversities] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState({
    category: '', academicLevel: '', university: '', department: '',
    year: '', grade: '', stream: '', semester: 'Semester 1',
    courseCode: '', course: '', description: '', instructor: '',
    creditHours: '', skillCategory: '', skillLevel: 'Beginner',
    duration: '', isActive: true, status: 'published'
  });
  const [notes, setNotes] = useState([blankMaterial()]);
  const [videos, setVideos] = useState([{ title: '', url: '', description: '' }]);
  const [ppts, setPpts] = useState([blankMaterial()]);

  const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }));
  const years = useMemo(() => yearsFor(form.academicLevel), [form.academicLevel]);

  async function loadUniversities() {
    try {
      const response = await apiFetch('universities');
      const data = await response.json();
      if (response.ok) setUniversities(Array.isArray(data) ? data : data.data || []);
    } catch (e) {
      console.error('Could not load universities', e);
    }
  }

  async function loadDepartments(universityName) {
    try {
      const response = await apiFetch('departments');
      const data = await response.json();
      const list = Array.isArray(data) ? data : data.data || [];
      const names = list.map(item => typeof item === 'string' ? item : item.name).filter(Boolean);
      setDepartments(names.length ? names : departmentsFallback);
    } catch {
      setDepartments(departmentsFallback);
    }
  }

  function chooseCategory(category) {
    setForm(prev => ({ ...prev, category, academicLevel: '', university: '', department: '', year: '', grade: '', stream: '' }));
    if (category === 'university') loadUniversities();
    setStep(2);
    setError('');
  }

  function nextFromAcademic() {
    if (form.category === 'university') {
      if (!form.academicLevel) return setError('Select an academic level.');
      if (form.academicLevel === 'Senior Undergraduate' || form.academicLevel === "Master's Degree" || form.academicLevel === 'PhD') {
        if (!form.university || !form.department || !form.year) return setError('Select university, department and academic year.');
      }
    } else if ((form.category === 'elementary' || form.category === 'highschool') && !form.grade) {
      return setError('Select a grade.');
    } else if (form.category === 'skills' && (!form.skillCategory.trim() || !form.skillLevel)) {
      return setError('Enter a skill category and select a skill level.');
    }
    setError('');
    setStep(3);
  }

  function addMaterial(setter, list) {
    setter([...list, blankMaterial()]);
  }
  function updateMaterial(setter, list, index, key, value) {
    setter(list.map((item, i) => i === index ? { ...item, [key]: value } : item));
  }

  async function submit(status) {
    if (!form.course.trim()) return setError('Course name is required.');
    if (status === 'published' && !form.isActive) return setError('Activate the course before publishing.');
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const body = new FormData();
      Object.entries({ ...form, status }).forEach(([key, value]) => body.append(key, String(value ?? '')));
      const validNotes = notes.filter(item => item.title.trim() && item.file);
      const validPpts = ppts.filter(item => item.title.trim() && item.file);
      const validVideos = videos.filter(item => item.title.trim() && item.url.trim());
      body.append('notes', JSON.stringify(validNotes.map(({ title }) => ({ title }))));
      body.append('videos', JSON.stringify(validVideos));
      body.append('ppts', JSON.stringify(validPpts.map(({ title }) => ({ title }))));
      validNotes.forEach(item => body.append('files', item.file));
      validPpts.forEach(item => body.append('files', item.file));
      const response = await apiFetch('content/upload', { method: 'POST', body });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.success) throw new Error(result.message || 'Unable to save course.');
      setSuccess(result.message || 'Course saved.');
      setTimeout(() => navigate('/admin/dashboard'), 1200);
    } catch (e) {
      setError(e.message || 'Error saving course.');
    } finally {
      setLoading(false);
    }
  }

  const inputClass = 'w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder:text-slate-400 focus:border-sky-500 focus:outline-none';
  const labelClass = 'mb-2 block text-sm font-medium text-slate-300';

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900 p-6">
        <div className="mx-auto max-w-5xl">
          <button type="button" onClick={() => navigate('/admin/dashboard')} className="mb-3 text-sm text-slate-400 hover:text-white">← Back to Dashboard</button>
          <h1 className="text-3xl font-bold">Create Academic Course</h1>
          <p className="mt-1 text-slate-400">Choose an education category, define the academic path, and publish learning materials.</p>
          <div className="mt-6 grid grid-cols-3 gap-2 sm:grid-cols-6">
            {['Category', 'Academic path', 'Course', 'Materials', 'Review', 'Publish'].map((name, index) => (
              <div key={name} className={'rounded-lg px-2 py-2 text-center text-xs ' + (step >= index + 1 ? 'bg-sky-600 text-white' : 'bg-slate-800 text-slate-400')}>{index + 1}. {name}</div>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 p-6">
        {error && <div role="alert" className="rounded-lg border border-red-700 bg-red-950/60 p-4 text-red-200">{error}</div>}
        {success && <div role="status" className="rounded-lg border border-green-700 bg-green-950/60 p-4 text-green-200">{success}</div>}

        {step === 1 && (
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="mb-2 text-2xl font-semibold">Select education category</h2>
            <p className="mb-6 text-slate-400">The next fields will change based on your selection.</p>
            <div className="grid gap-4 sm:grid-cols-2">
              {categories.map(item => (
                <button key={item.id} type="button" onClick={() => chooseCategory(item.id)} className="rounded-xl border border-slate-700 bg-slate-800 p-6 text-left transition hover:border-sky-500 hover:bg-slate-700">
                  <span className="text-3xl">{item.icon}</span>
                  <h3 className="mt-3 text-xl font-semibold">{item.title}</h3>
                  <p className="mt-1 text-slate-400">{item.detail}</p>
                  <span className="mt-4 inline-block text-sky-400">Select →</span>
                </button>
              ))}
            </div>
          </section>
        )}

        {step === 2 && (
          <section className="space-y-5 rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-2xl font-semibold">Academic classification</h2>
            {form.category === 'university' && <>
              <div>
                <label className={labelClass}>Academic level *</label>
                <select className={inputClass} value={form.academicLevel} onChange={e => { set('academicLevel', e.target.value); set('year', ''); }}>
                  <option value="">Select academic level</option>
                  {universityLevels.map(level => <option key={level}>{level}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>University *</label>
                <select className={inputClass} value={form.university} onChange={e => { set('university', e.target.value); set('department', ''); loadDepartments(e.target.value); }}>
                  <option value="">Select university</option>
                  {universities.map(item => <option key={item._id || item.slug || item.name} value={item.name}>{item.name}</option>)}
                  {!universities.length && <option value="Wollo University">Wollo University</option>}
                </select>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Department *</label>
                  <select className={inputClass} value={form.department} onChange={e => set('department', e.target.value)}>
                    <option value="">Select department</option>
                    {[...new Set([...departments, ...departmentsFallback])].map(name => <option key={name}>{name}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Academic year *</label>
                  <select className={inputClass} value={form.year} onChange={e => set('year', e.target.value)}>
                    <option value="">Select year</option>
                    {years.map(year => <option key={year}>{year}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className={labelClass}>Semester</label>
                <select className={inputClass} value={form.semester} onChange={e => set('semester', e.target.value)}>
                  <option>Semester 1</option><option>Semester 2</option><option>Summer</option>
                </select>
              </div>
            </>}
            {form.category === 'elementary' && <div>
              <label className={labelClass}>Grade *</label>
              <select className={inputClass} value={form.grade} onChange={e => set('grade', e.target.value)}>
                <option value="">Select grade</option>{Array.from({ length: 8 }, (_, i) => 'Grade ' + (i + 1)).map(v => <option key={v}>{v}</option>)}
              </select>
            </div>}
            {form.category === 'highschool' && <div className="grid gap-5 sm:grid-cols-2">
              <div><label className={labelClass}>Grade *</label><select className={inputClass} value={form.grade} onChange={e => set('grade', e.target.value)}><option value="">Select grade</option>{[9,10,11,12].map(n => <option key={n} value={'Grade ' + n}>Grade {n}</option>)}</select></div>
              <div><label className={labelClass}>Stream</label><select className={inputClass} value={form.stream} onChange={e => set('stream', e.target.value)}><option value="">Select stream</option><option>Natural Science</option><option>Social Science</option><option>General</option></select></div>
            </div>}
            {form.category === 'skills' && <div className="grid gap-5 sm:grid-cols-2">
              <div><label className={labelClass}>Skill category *</label><input className={inputClass} value={form.skillCategory} onChange={e => set('skillCategory', e.target.value)} placeholder="e.g. Web Development" /></div>
              <div><label className={labelClass}>Skill level *</label><select className={inputClass} value={form.skillLevel} onChange={e => set('skillLevel', e.target.value)}><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></div>
              <div><label className={labelClass}>Duration</label><input className={inputClass} value={form.duration} onChange={e => set('duration', e.target.value)} placeholder="e.g. 8 weeks" /></div>
            </div>}
          </section>
        )}

        {step === 3 && (
          <section className="space-y-5 rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-2xl font-semibold">Course information</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <div><label className={labelClass}>Course name *</label><input className={inputClass} value={form.course} onChange={e => set('course', e.target.value)} placeholder="e.g. Introduction to Programming" /></div>
              <div><label className={labelClass}>Course code</label><input className={inputClass} value={form.courseCode} onChange={e => set('courseCode', e.target.value)} placeholder="e.g. SE301" /></div>
              <div><label className={labelClass}>Instructor</label><input className={inputClass} value={form.instructor} onChange={e => set('instructor', e.target.value)} /></div>
              <div><label className={labelClass}>Credit hours</label><input type="number" min="0" className={inputClass} value={form.creditHours} onChange={e => set('creditHours', e.target.value)} /></div>
            </div>
            <div><label className={labelClass}>Description</label><textarea rows="4" className={inputClass} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Brief course description..." /></div>
            <label className="flex items-center gap-3 text-slate-300"><input type="checkbox" checked={form.isActive} onChange={e => set('isActive', e.target.checked)} /> Make course active and visible after publishing</label>
          </section>
        )}

        {step === 4 && (
          <section className="space-y-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <div className="mb-5 flex items-center justify-between"><h2 className="text-xl font-semibold">📄 Notes (PDF)</h2><button type="button" onClick={() => addMaterial(setNotes, notes)} className="rounded-lg bg-blue-600 px-4 py-2">+ Add Note</button></div>
              {notes.map((item, i) => <div key={i} className="mb-3 grid gap-3 sm:grid-cols-2"><input className={inputClass} placeholder="Note title" value={item.title} onChange={e => updateMaterial(setNotes, notes, i, 'title', e.target.value)} /><input type="file" accept=".pdf,application/pdf" className={inputClass} onChange={e => updateMaterial(setNotes, notes, i, 'file', e.target.files?.[0] || null)} /></div>)}
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <div className="mb-5 flex items-center justify-between"><h2 className="text-xl font-semibold">🎥 Videos</h2><button type="button" onClick={() => setVideos([...videos, { title: '', url: '', description: '' }])} className="rounded-lg bg-blue-600 px-4 py-2">+ Add Video</button></div>
              {videos.map((item, i) => <div key={i} className="mb-3 grid gap-3 sm:grid-cols-2"><input className={inputClass} placeholder="Video title" value={item.title} onChange={e => setVideos(videos.map((v,j) => j === i ? {...v,title:e.target.value} : v))} /><input type="url" className={inputClass} placeholder="YouTube URL or video link" value={item.url} onChange={e => setVideos(videos.map((v,j) => j === i ? {...v,url:e.target.value} : v))} /></div>)}
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <div className="mb-5 flex items-center justify-between"><h2 className="text-xl font-semibold">📊 PowerPoint presentations</h2><button type="button" onClick={() => addMaterial(setPpts, ppts)} className="rounded-lg bg-blue-600 px-4 py-2">+ Add PPT</button></div>
              {ppts.map((item, i) => <div key={i} className="mb-3 grid gap-3 sm:grid-cols-2"><input className={inputClass} placeholder="PPT title" value={item.title} onChange={e => updateMaterial(setPpts, ppts, i, 'title', e.target.value)} /><input type="file" accept=".ppt,.pptx" className={inputClass} onChange={e => updateMaterial(setPpts, ppts, i, 'file', e.target.files?.[0] || null)} /></div>)}
            </div>
          </section>
        )}

        {step === 5 && (
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="mb-5 text-2xl font-semibold">Review course before publishing</h2>
            <dl className="grid gap-4 sm:grid-cols-2">
              {Object.entries({
                Category: categories.find(c => c.id === form.category)?.title,
                'Academic level': form.academicLevel || '—',
                University: form.university || '—',
                Department: form.department || form.skillCategory || form.stream || '—',
                'Academic year / Grade': form.year || form.grade || '—',
                Semester: form.semester || '—',
                'Course name': form.course,
                'Course code': form.courseCode || '—',
                Instructor: form.instructor || '—',
                'PDF notes': notes.filter(n => n.title && n.file).length,
                Videos: videos.filter(v => v.title && v.url).length,
                Presentations: ppts.filter(p => p.title && p.file).length,
                Status: form.isActive ? 'Active' : 'Inactive'
              }).map(([key, value]) => <div key={key} className="rounded-lg bg-slate-800 p-4"><dt className="text-sm text-slate-400">{key}</dt><dd className="mt-1 font-medium">{value || '—'}</dd></div>)}
            </dl>
          </section>
        )}

        <div className="flex flex-wrap justify-between gap-3">
          <button type="button" onClick={() => step === 1 ? navigate('/admin/dashboard') : setStep(step - 1)} className="rounded-lg border border-slate-700 px-5 py-3 text-slate-200 hover:bg-slate-800">{step === 1 ? 'Cancel' : '← Back'}</button>
          {step < 5 && <button type="button" onClick={() => { if (step === 2) nextFromAcademic(); else if (step === 3 && !form.course.trim()) setError('Course name is required.'); else { setError(''); setStep(step + 1); } }} className="rounded-lg bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-700">Continue →</button>}
          {step === 5 && <div className="flex gap-3"><button type="button" disabled={loading} onClick={() => submit('draft')} className="rounded-lg border border-slate-600 px-5 py-3 disabled:opacity-50">{loading ? 'Saving…' : 'Save Draft'}</button><button type="button" disabled={loading} onClick={() => submit('published')} className="rounded-lg bg-blue-600 px-6 py-3 font-semibold disabled:opacity-50">{loading ? 'Publishing…' : 'Publish Course'}</button></div>}
        </div>
      </main>
    </div>
  );
}
