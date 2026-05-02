import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AddCourse() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    university: '',
    department: '',
    year: '',
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

      // Add form data
      Object.keys(formData).forEach(key => {
        submitData.append(key, formData[key]);
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

      const response = await fetch('/api/content/upload', {
        method: 'POST',
        body: submitData
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
            <h2 className="text-xl font-semibold mb-6">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  University *
                </label>
                <input
                  type="text"
                  name="university"
                  value={formData.university}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                  placeholder="e.g., Addis Ababa University"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Department *
                </label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                  placeholder="e.g., Computer Science"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Year *
                </label>
                <input
                  type="text"
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                  placeholder="e.g., Year 1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Course Name *
                </label>
                <input
                  type="text"
                  name="course"
                  value={formData.course}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                  placeholder="e.g., Introduction to Programming"
                />
              </div>
            </div>
            <div className="mt-6">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                placeholder="Brief description of the course..."
              />
            </div>
            <div className="mt-6">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-blue-600 bg-slate-800 border-slate-700 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-slate-300">Make course active (visible to students)</span>
              </label>
            </div>
          </div>

          {/* NOTES SECTION */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
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