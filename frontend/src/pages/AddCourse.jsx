import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../api/api';

function Field({ label, name, value, onChange, placeholder, required = false }) {
  return <div><label className="mb-2 block text-sm font-medium text-slate-300">{label}</label><input name={name} value={value} onChange={onChange} placeholder={placeholder} required={required} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white focus:border-blue-500 focus:outline-none" /></div>;
}

function SelectField({ label, name, value, onChange, options, required = false }) {
  return <div><label className="mb-2 block text-sm font-medium text-slate-300">{label}</label><select name={name} value={value} onChange={onChange} required={required} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white focus:border-blue-500 focus:outline-none"><option value="">Select {label.replace(' *', '').toLowerCase()}</option>{options.map(option => <option key={option} value={option}>{option}</option>)}</select></div>;
}

export default function AddCourse() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedElementaryGrade, setSelectedElementaryGrade] = useState('');
  const [selectedHighSchoolGrade, setSelectedHighSchoolGrade] = useState('');
  const [universityDepartments, setUniversityDepartments] = useState([]);
  const [universityYears, setUniversityYears] = useState([]);
  const [universityOptionsError, setUniversityOptionsError] = useState('');

  useEffect(() => {
    if (selectedCategory !== 'university') return undefined;
    let active = true;
    async function loadUniversityOptions() {
      try {
        const [departmentsResponse, yearsResponse] = await Promise.all([
          apiFetch('departments'),
          apiFetch('university-years'),
        ]);
        const [departments, years] = await Promise.all([departmentsResponse.json(), yearsResponse.json()]);
        if (!departmentsResponse.ok || !yearsResponse.ok) throw new Error('Unable to load configured departments and academic years.');
        if (active) {
          setUniversityDepartments(Array.isArray(departments) ? departments.filter(item => item && item.isActive !== false) : []);
          setUniversityYears(Array.isArray(years) ? years.map(item => typeof item === 'number' ? 'Year ' + item : 'Year ' + item.yearNumber).filter(item => item !== 'Year undefined') : []);
        }
      } catch (err) {
        if (active) setUniversityOptionsError(err.message || 'Unable to load University options.');
      }
    }
    loadUniversityOptions();
    return () => { active = false; };
  }, [selectedCategory]);

  const categories = [
    { id: 'elementary', title: 'Elementary', subtitle: 'Grades 1–8', icon: '📘', detail: 'Upload subjects, lessons, notes, and exercises for elementary students.' },
    { id: 'highschool', title: 'High School', subtitle: 'Grades 9–12', icon: '🎓', detail: 'Organize courses by grade and subject for high school students.' },
    { id: 'university', title: 'University / College', subtitle: 'Departments & years', icon: '🏛️', detail: 'Create courses by university, department, and academic year.' },
    { id: 'coding', title: 'Other Skills & Trainings', subtitle: 'AI · Web · Graphics · More', icon: '💡', detail: 'Publish practical skills courses, technology training, and professional learning.' },
  ];

  // Form state
  const [formData, setFormData] = useState({
    university: '',
    department: '',
    year: '',
    grade: '',
    subject: '',
    technology: '',
    faculty: '',
    studyStage: '',
    contentType: 'course-materials',
    courseCode: '',
    course: '',
    description: '',
    isActive: true,
    isPremium: false
  });

  // Material state
  const [notes, setNotes] = useState([{ title: '', file: null }]);
  const [videos, setVideos] = useState([{ title: '', url: '' }]);
  const [ppts, setPpts] = useState([{ title: '', file: null }]);
  const [questionsJson, setQuestionsJson] = useState('[{"question":"","answer":""}]');

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const addNote = () => setNotes([...notes, { title: '', file: null }]);
  const removeNote = (index) => setNotes(notes.filter((_, i) => i !== index));
  const updateNote = (index, field, value) => {
    const updated = [...notes];
    updated[index][field] = value;
    setNotes(updated);
  };

  const addVideo = () => setVideos([...videos, { title: '', url: '' }]);
  const removeVideo = (index) => setVideos(videos.filter((_, i) => i !== index));
  const updateVideo = (index, field, value) => {
    const updated = [...videos];
    updated[index][field] = value;
    setVideos(updated);
  };

  const addPpt = () => setPpts([...ppts, { title: '', file: null }]);
  const removePpt = (index) => setPpts(ppts.filter((_, i) => i !== index));
  const updatePpt = (index, field, value) => {
    const updated = [...ppts];
    updated[index][field] = value;
    setPpts(updated);
  };

  const validateForm = () => {
    if (!selectedCategory) return 'Please select a course category.';
    if (!String(formData.course || '').trim()) return 'Please enter the course name.';
    if (selectedCategory === 'elementary' && !selectedElementaryGrade) return 'Please select an Elementary grade.';
    if (selectedCategory === 'highschool' && !selectedHighSchoolGrade) return 'Please select a High School grade.';
    if (selectedCategory === 'elementary' || selectedCategory === 'highschool') {
      if (!String(formData.subject || '').trim()) return 'Please enter the subject.';
    }
    if (selectedCategory === 'university') {
      const faculty = formData.faculty || '';
      if (!faculty) return 'Please select an Academic Category.';
      const stageRequired = ['Natural Science', 'Social Science', 'Health Science', 'Diploma'].includes(faculty);
      if (stageRequired && !formData.studyStage) return 'Please select an Academic Stage.';
      if (formData.studyStage === 'Senior') {
        if (!String(formData.department || '').trim()) return 'Please select a Department.';
        if (!String(formData.year || '').trim()) return 'Please select an Academic Year.';
        if (!formData.contentType) return 'Please select a Content Type.';
      }
    }
    if (selectedCategory === 'coding' && !String(formData.technology || '').trim()) return 'Please select a Training Area.';
    const incompleteNote = notes.findIndex(note => (note.title.trim() || note.file) && (!note.title.trim() || !note.file));
    if (incompleteNote !== -1) return `PDF Note ${incompleteNote + 1}: enter a title and select a PDF file, or clear both fields.`;
    const incompletePpt = ppts.findIndex(ppt => (ppt.title.trim() || ppt.file) && (!ppt.title.trim() || !ppt.file));
    if (incompletePpt !== -1) return `PowerPoint ${incompletePpt + 1}: enter a title and select a PPT/PPTX file, or clear both fields.`;
    const incompleteVideo = videos.findIndex(video => (video.title.trim() || video.url.trim()) && (!video.title.trim() || !video.url.trim()));
    if (incompleteVideo !== -1) return `Video ${incompleteVideo + 1}: enter both a video title and video URL, or clear both fields.`;
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const validationMessage = validateForm();
    if (validationMessage) {
      setError(validationMessage);
      return;
    }
    setLoading(true);

    try {
      const submitData = new FormData();
      const appendIfPresent = (key, value) => {
        if (value !== undefined && value !== null && String(value).trim() !== '') {
          submitData.append(key, typeof value === 'boolean' ? String(value) : String(value).trim());
        }
      };

      // Send only fields understood by CourseContentController and its schema.
      submitData.append('level', selectedCategory);
      ['university', 'department', 'year', 'grade', 'subject', 'technology', 'faculty',
        'studyStage', 'contentType', 'courseCode', 'course', 'description'].forEach(key => {
        appendIfPresent(key, formData[key]);
      });
      submitData.append('isActive', String(Boolean(formData.isActive)));
      submitData.append('isPremium', String(Boolean(formData.isPremium)));

      const validNotes = notes.filter(note => note.title.trim() && note.file);
      const validPpts = ppts.filter(ppt => ppt.title.trim() && ppt.file);
      const validVideos = videos.filter(video => video.title.trim() && video.url.trim());

      submitData.append('notes', JSON.stringify(validNotes.map(note => ({ title: note.title.trim() }))));
      submitData.append('videos', JSON.stringify(validVideos.map(video => ({ title: video.title.trim(), url: video.url.trim() }))));
      submitData.append('ppts', JSON.stringify(validPpts.map(ppt => ({ title: ppt.title.trim() }))));
      if (selectedCategory === 'university' && formData.studyStage === 'Senior' && formData.contentType === 'exit-exam') {
        let parsedQuestions;
        try { parsedQuestions = JSON.parse(questionsJson); } catch { throw new Error('Exit Exam questions must be valid JSON.'); }
        if (!Array.isArray(parsedQuestions) || !parsedQuestions.length || parsedQuestions.some(item => !String(item.question || '').trim() || !String(item.answer || '').trim())) {
          throw new Error('Add at least one Exit Exam question with both a question and an answer.');
        }
        submitData.append('questions', JSON.stringify(parsedQuestions));
      } else {
        submitData.append('questions', JSON.stringify([]));
      }

      // Match the backend files array: PDFs first, then PowerPoint files.
      validNotes.forEach(note => submitData.append('files', note.file));
      validPpts.forEach(ppt => submitData.append('files', ppt.file));

      const response = await apiFetch('content/upload', { method: 'POST', body: submitData });
      const data = await response.json();
      if (!response.ok) {
        const details = Array.isArray(data.details) ? data.details.join('; ') : data.error;
        throw new Error([data.message || 'Failed to create course', details].filter(Boolean).join(': '));
      }
      if (!data.success) throw new Error(data.message || 'Failed to create course.');
      setSuccess('Course created successfully!');
      setTimeout(() => navigate('/admin/dashboard'), 2000);
    } catch (err) {
      setError(err.message || 'Error creating course');
      console.error('Submit error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (selectedCategory === 'highschool' && !selectedHighSchoolGrade) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <div className="bg-slate-900 border-b border-slate-800 p-6"><div className="max-w-6xl mx-auto">
          <button onClick={() => setSelectedCategory('')} className="text-slate-400 hover:text-white mb-3">← Back to categories</button>
          <h1 className="text-3xl font-bold">High School Courses</h1>
          <p className="mt-2 text-slate-400">Select a grade before adding its course and learning materials.</p>
        </div></div>
        <div className="max-w-6xl mx-auto p-6 lg:p-10"><div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
          {[9, 10, 11, 12].map((grade) => (
            <button key={grade} type="button" onClick={() => { setSelectedHighSchoolGrade(String(grade)); setFormData(prev => ({ ...prev, grade: String(grade) })); }} className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center transition hover:border-blue-500 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <span className="text-xs uppercase tracking-widest text-slate-400">Grade</span><span className="mt-2 block text-4xl font-bold">{grade}</span><span className="mt-3 block text-sm text-blue-400">Select grade →</span>
            </button>
          ))}
        </div></div>
      </div>
    );
  }

  if (selectedCategory === 'elementary' && !selectedElementaryGrade) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <div className="bg-slate-900 border-b border-slate-800 p-6">
          <div className="max-w-6xl mx-auto">
            <button onClick={() => setSelectedCategory('')} className="text-slate-400 hover:text-white mb-3">← Back to categories</button>
            <h1 className="text-3xl font-bold">Elementary Courses</h1>
            <p className="mt-2 text-slate-400">Select the grade before adding its course and learning materials.</p>
          </div>
        </div>
        <div className="max-w-6xl mx-auto p-6 lg:p-10">
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((grade) => (
              <button key={grade} type="button" onClick={() => { setSelectedElementaryGrade(String(grade)); setFormData(prev => ({ ...prev, grade: String(grade) })); }} className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center transition hover:border-blue-500 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <span className="text-xs uppercase tracking-widest text-slate-400">Grade</span>
                <span className="mt-2 block text-4xl font-bold">{grade}</span>
                <span className="mt-3 block text-sm text-blue-400">Select grade →</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!selectedCategory) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <div className="bg-slate-900 border-b border-slate-800 p-6">
          <div className="max-w-6xl mx-auto">
            <button onClick={() => navigate('/admin/dashboard')} className="text-slate-400 hover:text-white mb-3">← Back to Dashboard</button>
            <h1 className="text-3xl font-bold">Add New Course</h1>
            <p className="mt-2 text-slate-400">First, choose the education or training category for your new course.</p>
          </div>
        </div>
        <div className="max-w-6xl mx-auto p-6 lg:p-10">
          <div className="grid gap-5 sm:grid-cols-2">
            {categories.map((category) => (
              <button key={category.id} type="button" onClick={() => { setFormData({ university: '', department: '', year: '', grade: '', subject: '', technology: '', faculty: '', studyStage: '', contentType: 'course-materials', courseCode: '', course: '', description: '', isActive: true, isPremium: false }); setSelectedElementaryGrade(''); setSelectedHighSchoolGrade(''); setUniversityOptionsError(''); setSelectedCategory(category.id); }} className="group rounded-2xl border border-slate-800 bg-slate-900 p-7 text-left transition hover:border-blue-500 hover:bg-slate-800/90 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <div className="flex items-start justify-between">
                  <span className="text-4xl">{category.icon}</span>
                  <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-300">{category.subtitle}</span>
                </div>
                <h2 className="mt-6 text-2xl font-semibold group-hover:text-blue-300">{category.title}</h2>
                <p className="mt-3 leading-6 text-slate-400">{category.detail}</p>
                <span className="mt-6 inline-flex items-center gap-2 font-medium text-blue-400">Continue <span aria-hidden="true">→</span></span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* HEADER */}
      <div className="bg-slate-900 border-b border-slate-800 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-2">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="text-slate-400 hover:text-white"
            >
              ← Back to Dashboard
            </button>
          </div>
          <h1 className="text-3xl font-bold text-white">Add New Course</h1>
          <p className="text-slate-400">Create a new course with materials and content</p>
        </div>
      </div>

      {/* FORM */}
      <div className="max-w-4xl mx-auto p-6">
        <form onSubmit={handleSubmit} noValidate className="space-y-8">
          {/* ERROR/SUCCESS MESSAGES */}
          {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-200 p-4 rounded-lg">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-900/50 border border-green-700 text-green-200 p-4 rounded-lg">
              {success}
            </div>
          )}

          {/* BASIC INFO */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Basic Information</h2>
              <button type="button" onClick={() => { setSelectedCategory(''); setSelectedElementaryGrade(''); setSelectedHighSchoolGrade(''); setFormData({ university: '', department: '', year: '', grade: '', subject: '', technology: '', faculty: '', studyStage: '', contentType: 'course-materials', courseCode: '', course: '', description: '', isActive: true, isPremium: false }); }} className="text-sm text-blue-400 hover:text-blue-300">Change category</button>
            </div>
            <div className="mb-6 rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-3">
              <p className="text-sm text-blue-200">Selected category</p>
              <p className="font-semibold text-white">{categories.find(item => item.id === selectedCategory)?.title}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {selectedCategory === 'university' && <>
                <SelectField label="Academic Category *" name="faculty" value={formData.faculty || ''} onChange={(event) => setFormData(prev => ({ ...prev, faculty: event.target.value, studyStage: '', department: '', year: '' }))} options={['Natural Science', 'Social Science', 'Health Science', 'Diploma', "Master's Degree", 'PhD']} required />
                {(formData.faculty === 'Natural Science' || formData.faculty === 'Social Science' || formData.faculty === 'Health Science' || formData.faculty === 'Diploma') && <SelectField label="Academic Stage *" name="studyStage" value={formData.studyStage || ''} onChange={(event) => setFormData(prev => ({ ...prev, studyStage: event.target.value, department: '', year: event.target.value === 'Senior' ? '' : event.target.value }))} options={formData.faculty === 'Diploma' ? ['Freshman', 'Remedial', 'Senior', 'Diploma'] : ['Remedial', 'Freshman', 'Senior']} required />}
                {formData.studyStage === 'Senior' && <>
                  <SelectField label="Department *" name="department" value={formData.department} onChange={handleInputChange} options={universityDepartments.filter(item => item.category === formData.faculty).map(item => item.name)} required />
                  <SelectField label="Academic Year *" name="year" value={formData.year} onChange={handleInputChange} options={universityYears} required />
                  <div><label className="mb-2 block text-sm font-medium text-slate-300">Content Type *</label><select name="contentType" value={formData.contentType || "course-materials"} onChange={handleInputChange} required className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white focus:border-blue-500 focus:outline-none"><option value="course-materials">Course Materials</option><option value="exit-exam">Exit Exam Questions</option></select></div>
                </>}
                {(formData.faculty === "Master's Degree" || formData.faculty === 'PhD') && <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-sm text-blue-100">This course will be filed under {formData.faculty}.</div>}
                <Field label="Course Code" name="courseCode" value={formData.courseCode || ''} onChange={handleInputChange} placeholder="e.g., CSE 201" />
                {universityOptionsError && <p className="text-sm text-amber-300 md:col-span-2">{universityOptionsError}</p>}
              </>}
              {selectedCategory === 'elementary' && <>
                <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-4 py-3"><p className="text-sm text-blue-200">Selected grade</p><p className="text-xl font-semibold text-white">Grade {selectedElementaryGrade}</p><button type="button" onClick={() => setSelectedElementaryGrade('')} className="mt-2 text-sm text-blue-400">Choose another grade</button></div>
                <Field label="Subject *" name="subject" value={formData.subject} onChange={handleInputChange} placeholder="e.g., Mathematics" required />
              </>}
              {selectedCategory === 'highschool' && <>
                <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-4 py-3"><p className="text-sm text-blue-200">Selected grade</p><p className="text-xl font-semibold text-white">Grade {selectedHighSchoolGrade}</p><button type="button" onClick={() => setSelectedHighSchoolGrade('')} className="mt-2 text-sm text-blue-400">Choose another grade</button></div>
                <Field label="Subject *" name="subject" value={formData.subject} onChange={handleInputChange} placeholder="e.g., Physics" required />
              </>}
              {selectedCategory === 'coding' && <>
                <SelectField label="Training Area *" name="technology" value={formData.technology} onChange={handleInputChange} options={['Artificial Intelligence (AI)', 'Web Development', 'Graphic Design', 'Mobile App Development', 'Data Science', 'Other Skills']} required />
                <Field label="Training Level" name="year" value={formData.year} onChange={handleInputChange} placeholder="e.g., Beginner, Intermediate" />
              </>}
              <Field label={selectedCategory === 'coding' ? 'Training / Course Name *' : selectedCategory === 'university' && formData.studyStage === 'Senior' && formData.contentType === 'exit-exam' ? 'Exam Title *' : 'Course Name *'} name="course" value={formData.course} onChange={handleInputChange} placeholder="Enter the course name" required />
            </div>
            <div className="mt-6">
              <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
              <textarea name="description" value={formData.description} onChange={handleInputChange} rows={3} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none" placeholder="Brief description of the course..." />
            </div>
            {selectedCategory === 'university' && <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
              <label className="flex items-center gap-3">
                <input type="checkbox" name="isPremium" checked={formData.isPremium} onChange={handleInputChange} className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-amber-500 focus:ring-amber-500" />
                <span className="text-sm font-medium text-amber-200">Premium course — students can see the course, but only students approved by an administrator can open its materials.</span>
              </label>
            </div>}
            <div className="mt-6">
              <label className="flex items-center gap-3">
                <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleInputChange} className="w-4 h-4 text-blue-600 bg-slate-800 border-slate-700 rounded focus:ring-blue-500" />
                <span className="text-sm font-medium text-slate-300">Make course active (visible to students)</span>
              </label>
            </div>
          </div>

          {selectedCategory === 'university' && formData.studyStage === 'Senior' && formData.contentType === 'exit-exam' ? (
            <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="text-xl font-semibold">Exit Exam Questions</h2>
              <p className="mt-2 text-sm text-slate-400">Enter a JSON array. Each item must contain question and answer fields.</p>
              <textarea value={questionsJson} onChange={event => setQuestionsJson(event.target.value)} rows={10} className="mt-4 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 font-mono text-sm text-white focus:border-blue-500 focus:outline-none" />
            </section>
          ) : (
          <>
          {/* NOTES SECTION */}
          <div id="materials" className="bg-slate-900 rounded-xl border border-slate-800 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">📄 Notes (PDFs)</h2>
              <button
                type="button"
                onClick={addNote}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                + Add Note
              </button>
            </div>
            <div className="space-y-4">
              {notes.map((note, index) => (
                <div key={index} className="flex gap-4 items-end">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={note.title}
                      onChange={(e) => updateNote(index, 'title', e.target.value)}
                      placeholder="Note title"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => updateNote(index, 'file', e.target.files[0])}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-slate-300 file:bg-slate-700 file:border-0 file:rounded file:px-3 file:py-1 file:text-white"
                    />
                  </div>
                  {notes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeNote(index)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-3 rounded-lg"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* VIDEOS SECTION */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">🎥 Videos</h2>
              <button
                type="button"
                onClick={addVideo}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                + Add Video
              </button>
            </div>
            <div className="space-y-4">
              {videos.map((video, index) => (
                <div key={index} className="flex gap-4 items-end">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={video.title}
                      onChange={(e) => updateVideo(index, 'title', e.target.value)}
                      placeholder="Video title"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="url"
                      value={video.url}
                      onChange={(e) => updateVideo(index, 'url', e.target.value)}
                      placeholder="YouTube URL or video link"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  {videos.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeVideo(index)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-3 rounded-lg"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* PPTS SECTION */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">📊 PowerPoint Presentations</h2>
              <button
                type="button"
                onClick={addPpt}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                + Add PPT
              </button>
            </div>
            <div className="space-y-4">
              {ppts.map((ppt, index) => (
                <div key={index} className="flex gap-4 items-end">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={ppt.title}
                      onChange={(e) => updatePpt(index, 'title', e.target.value)}
                      placeholder="PPT title"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      accept=".ppt,.pptx"
                      onChange={(e) => updatePpt(index, 'file', e.target.files[0])}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-slate-300 file:bg-slate-700 file:border-0 file:rounded file:px-3 file:py-1 file:text-white"
                    />
                  </div>
                  {ppts.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePpt(index)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-3 rounded-lg"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          </>
          )}

          {/* SUBMIT BUTTON */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/admin/dashboard')}
              className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              {loading ? 'Creating Course...' : 'Create Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}