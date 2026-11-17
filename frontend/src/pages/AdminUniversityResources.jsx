import { useEffect, useState } from 'react';
import { apiFetch } from '../api/api';

const empty = { stream: 'Natural', level: 'Freshman', department: '', course: '', kind: 'course-material', academicYear: '', resourceType: 'pdf', title: '', textContent: '', answer: '', solution: '' };

export default function AdminUniversityResources() {
  const [form, setForm] = useState(empty);
  const [file, setFile] = useState(null);
  const [items, setItems] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const change = (event) => {
    const { name, value } = event.target;
    setForm((old) => {
      if (name === 'stream') return { ...old, stream: value, department: '' };
      if (name === 'kind') {
        const resourceType = value === 'course-material' ? 'pdf' : 'image';
        return { ...old, kind: value, resourceType };
      }
      if (name === 'level' && value !== 'Senior') return { ...old, level: value, department: '', kind: old.kind === 'exit-exam' ? 'course-material' : old.kind, resourceType: old.kind === 'exit-exam' ? 'pdf' : old.resourceType };
      if (name === 'level' && value === 'Senior') return { ...old, level: value, course: '', kind: 'exit-exam', resourceType: 'image' };
      return { ...old, [name]: value };
    });
  };
  const load = async () => {
    const response = await apiFetch('university-learning/admin/resources');
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Unable to load uploads.');
    setItems(data.resources || []);
  };
  useEffect(() => { load().catch((err) => setError(err.message)); }, []);
  useEffect(() => {
    const category = form.stream === 'Natural' ? 'Natural Science' : 'Social Science';
    apiFetch('departments?category=' + encodeURIComponent(category))
      .then((response) => response.json())
      .then((data) => setDepartments(Array.isArray(data) ? data : []))
      .catch((err) => setError(err.message || 'Unable to load departments.'));
  }, [form.stream]);
  const submit = async (event) => {
    event.preventDefault(); setBusy(true); setError(''); setMessage('');
    try {
      const body = new FormData();
      Object.entries(form).forEach(([key, value]) => body.append(key, value));
      if (file) body.append('file', file);
      const response = await apiFetch('university-learning/admin/upload', { method: 'POST', body });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Upload failed.');
      setMessage(data.message); setForm(empty); setFile(null); await load();
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  };
  const approve = async (id, status) => {
    setError(''); setMessage('');
    try {
      const response = await apiFetch('university-learning/admin/resources/' + id + '/approval', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Approval update failed.');
      setMessage(data.message); await load();
    } catch (err) { setError(err.message); }
  };
  const field = (label, name, options) => <label className="block text-sm text-slate-300">{label}<select name={name} value={form[name]} onChange={change} className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 p-3">{options.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>;
  return <main className="mx-auto max-w-6xl space-y-6 p-5 text-white"><h1 className="text-3xl font-bold">University Resource Uploads</h1><form onSubmit={submit} className="grid gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:grid-cols-2 lg:grid-cols-3">
    {field('Stream', 'stream', ['Natural', 'Social'])}{field('Level', 'level', ['Freshman', 'Remedial', 'Senior'])}
    {field('Content path', 'kind', form.level === 'Senior' ? ['exit-exam', 'course-material'] : ['exam-question', 'course-material'])}
    <label className="block text-sm text-slate-300">Department<select name="department" value={form.department} onChange={change} disabled={form.level !== 'Senior'} className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 p-3 disabled:opacity-50"><option value="">Select department</option>{departments.map((item) => <option key={item._id} value={item.name}>{item.name}</option>)}</select></label>
    <label className="block text-sm text-slate-300">Course<input name="course" value={form.course} onChange={change} className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 p-3" /></label>
    <label className="block text-sm text-slate-300">Academic year<input name="academicYear" value={form.academicYear} onChange={change} placeholder="2016" className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 p-3" /></label>
    {field('Format', 'resourceType', form.kind === 'course-material' ? ['pdf', 'ppt', 'video'] : ['image', 'pdf', 'text'])}
    <label className="block text-sm text-slate-300">Title<input required name="title" value={form.title} onChange={change} className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 p-3" /></label>
    {form.resourceType === 'text' ? <label className="block text-sm text-slate-300 sm:col-span-2">Text / Question<textarea name="textContent" value={form.textContent} onChange={change} className="mt-1 min-h-28 w-full rounded-lg border border-slate-700 bg-slate-950 p-3" /></label> : <label className="block text-sm text-slate-300">File<input required type="file" accept=".pdf,.ppt,.pptx,.mp4,.webm,.mov,.png,.jpg,.jpeg" onChange={(event) => setFile(event.target.files?.[0] || null)} className="mt-1 block w-full" /></label>}
    <label className="block text-sm text-slate-300">Answer (optional)<textarea name="answer" value={form.answer} onChange={change} className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 p-3" /></label>
    <label className="block text-sm text-slate-300">Solution (optional)<textarea name="solution" value={form.solution} onChange={change} className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 p-3" /></label>
    <div className="flex items-end"><button disabled={busy} className="rounded-lg bg-sky-600 px-5 py-3 font-semibold disabled:opacity-50">{busy ? 'Uploading…' : 'Upload for approval'}</button></div>
  </form>
  {message && <p className="rounded-lg bg-green-950 p-3 text-green-200">{message}</p>}{error && <p role="alert" className="rounded-lg bg-red-950 p-3 text-red-200">{error}</p>}
  <section className="space-y-3"><h2 className="text-xl font-semibold">Uploaded resources</h2>{items.map((item) => <article key={item._id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900 p-4"><div><strong>{item.title}</strong><p className="text-sm text-slate-400">{item.stream} · {item.level} · {item.department || item.course} · {item.kind} · {item.status}</p></div><div className="flex gap-2"><button onClick={() => approve(item._id, 'approved')} className="rounded bg-green-700 px-3 py-2 text-sm">Approve</button><button onClick={() => approve(item._id, 'rejected')} className="rounded bg-red-800 px-3 py-2 text-sm">Reject</button></div></article>)}</section></main>;
}
