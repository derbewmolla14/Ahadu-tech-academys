import { useState } from 'react';
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
    course: '',
    description: '',
    isActive: true
  });

  // Material state
  const [notes, setNotes] = useState([{ title: '', file: null }]);
  const [videos, setVideos] = useState([{ title: '', url: '' }]);
  const [ppts, setPpts] = useState([{ title: '', file: null }]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const submitData = new FormData();

      // Add category and category-specific course details.
      submitData.append('level', selectedCategory);
      Object.keys(formData).forEach(key => {
        if (formData[key] !== '') submitData.append(key, formData[key]);
      });

      // Add materials as JSON strings
      submitData.append('notes', JSON.stringify(notes.filter(note => note.title.trim())));
      submitData.append('videos', JSON.stringify(videos.filter(video => video.title.trim() && video.url.trim())));
      submitData.append('ppts', JSON.stringify(ppts.filter(ppt => ppt.title.trim())));

      // Add files
      notes.forEach((note, index) => {
        if (note.file) submitData.append('files', note.file);
      });

      ppts.forEach((ppt, index) => {
        if (ppt.file) submitData.append('files', ppt.file);
      });

      const response = await apiFetch('content/upload', {
        method: 'POST',
        body: submitData,
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Course created successfully!');
        setTimeout(() => navigate('/admin/dashboard'), 2000);
      } else {
        setError(data.message || 'Failed to create course');
      }
    } catch (err) {
      setError('Error creating course');
      console.error('Submit error:', err);
    } finally {
      setLoading(false);
    }
  };

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
              <button key={category.id} type="button" onClick={() => setSelectedCategory(category.id)} className="group rounded-2xl border border-slate-800 bg-slate-900 p-7 text-left transition hover:border-blue-500 hover:bg-slate-800/90 focus:outline-none focus:ring-2 focus:ring-blue-500">
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
        <form onSubmit={handleSubmit} className="space-y-8">
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
              <button type="button" onClick={() => { setSelectedCategory(''); setSelectedElementaryGrade(''); }} className="text-sm text-blue-400 hover:text-blue-300">Change category</button>
            </div>
            <div className="mb-6 rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-3">
              <p className="text-sm text-blue-200">Selected category</p>
              <p className="font-semibold text-white">{categories.find(item => item.id === selectedCategory)?.title}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {selectedCategory === 'university' && <>
                <Field label="University *" name="university" value={formData.university} onChange={handleInputChange} placeholder="e.g., Addis Ababa University" required />
                <Field label="Department *" name="department" value={formData.department} onChange={handleInputChange} placeholder="e.g., Computer Science" required />
                <Field label="Academic Year *" name="year" value={formData.year} onChange={handleInputChange} placeholder="e.g., Year 1" required />
              </>}
              {selectedCategory === 'elementary' && <>
                <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-4 py-3"><p className="text-sm text-blue-200">Selected grade</p><p className="text-xl font-semibold text-white">Grade {selectedElementaryGrade}</p><button type="button" onClick={() => setSelectedElementaryGrade('')} className="mt-2 text-sm text-blue-400">Choose another grade</button></div>
                <Field label="Subject *" name="subject" value={formData.subject} onChange={handleInputChange} placeholder="e.g., Mathematics" required />
              </>}
              {selectedCategory === 'highschool' && <>
                <SelectField label="Grade *" name="grade" value={formData.grade} onChange={handleInputChange} options={['9', '10', '11', '12']} required />
                <Field label="Subject *" name="subject" value={formData.subject} onChange={handleInputChange} placeholder="e.g., Physics" required />
              </>}
              {selectedCategory === 'coding' && <>
                <SelectField label="Training Area *" name="technology" value={formData.technology} onChange={handleInputChange} options={['Artificial Intelligence (AI)', 'Web Development', 'Graphic Design', 'Mobile App Development', 'Data Science', 'Other Skills']} required />
                <Field label="Training Level" name="year" value={formData.year} onChange={handleInputChange} placeholder="e.g., Beginner, Intermediate" />
              </>}
              <Field label={selectedCategory === 'coding' ? 'Training / Course Name *' : 'Course Name *'} name="course" value={formData.course} onChange={handleInputChange} placeholder="Enter the course name" required />
            </div>
            <div className="mt-6">
              <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
              <textarea name="description" value={formData.description} onChange={handleInputChange} rows={3} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none" placeholder="Brief description of the course..." />
            </div>
            <div className="mt-6">
              <label className="flex items-center gap-3">
                <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleInputChange} className="w-4 h-4 text-blue-600 bg-slate-800 border-slate-700 rounded focus:ring-blue-500" />
                <span className="text-sm font-medium text-slate-300">Make course active (visible to students)</span>
              </label>
            </div>
          </div>

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