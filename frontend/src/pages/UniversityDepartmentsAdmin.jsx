import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../api/api';

const categories = ['Natural Science', 'Social Science', 'Health Science'];

export default function UniversityDepartmentsAdmin() {
  const [departments, setDepartments] = useState([]);
  const [category, setCategory] = useState(categories[0]);
  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadDepartments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiFetch('departments?includeInactive=true');
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Unable to load departments.');
      setDepartments(Array.isArray(data) ? data : []);
    } catch (err) { setError(err.message || 'Unable to load departments.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadDepartments(); }, [loadDepartments]);

  const visibleDepartments = useMemo(() => departments.filter(item => item.category === category && item.name.toLowerCase().includes(search.trim().toLowerCase())).sort((a,b) => a.name.localeCompare(b.name)), [departments, category, search]);

  const resetForm = () => { setName(''); setEditingId(''); };
  const saveDepartment = async (event) => {
    event.preventDefault();
    if (!name.trim()) return;
    try {
      setSaving(true); setError(''); setSuccess('');
      const response = await apiFetch(editingId ? 'departments/' + editingId : 'departments', {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), category, isActive: true }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Unable to save department.');
      setSuccess(editingId ? 'Department updated.' : 'Department added.');
      resetForm();
      await loadDepartments();
    } catch (err) { setError(err.message || 'Unable to save department.'); }
    finally { setSaving(false); }
  };

  const editDepartment = (item) => { setEditingId(item._id); setName(item.name); setCategory(item.category); setError(''); setSuccess(''); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const toggleDepartment = async (item) => {
    try {
      setError(''); setSuccess('');
      const response = await apiFetch('departments/' + item._id, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isActive: !item.isActive }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Unable to update department status.');
      setSuccess(item.isActive ? 'Department deactivated.' : 'Department activated.');
      await loadDepartments();
    } catch (err) { setError(err.message || 'Unable to update department.'); }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <Link to="/admin/dashboard" className="text-sm text-blue-400 hover:text-blue-300">← Admin Dashboard</Link>
          <h1 className="mt-3 text-3xl font-bold">University Departments</h1>
          <p className="mt-2 text-slate-400">Manage departments for Natural Science, Social Science, and Health Science.</p>
        </header>
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-semibold">{editingId ? 'Edit Department' : 'Add Department'}</h2>
          <form onSubmit={saveDepartment} className="mt-4 grid gap-4 md:grid-cols-[1fr_1fr_auto]">
            <label className="block text-sm text-slate-300">Department name<input value={name} onChange={event => setName(event.target.value)} required placeholder="Enter department name" className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white" /></label>
            <label className="block text-sm text-slate-300">Academic category<select value={category} onChange={event => setCategory(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white">{categories.map(item => <option key={item}>{item}</option>)}</select></label>
            <div className="flex items-end gap-2"><button disabled={saving} className="rounded-lg bg-blue-600 px-5 py-3 font-medium hover:bg-blue-700 disabled:opacity-50">{saving ? 'Saving…' : editingId ? 'Save changes' : 'Add department'}</button>{editingId && <button type="button" onClick={resetForm} className="rounded-lg bg-slate-700 px-4 py-3">Cancel</button>}</div>
          </form>
          {error && <p role="alert" className="mt-4 rounded-lg border border-red-800 bg-red-950/40 p-3 text-red-200">{error}</p>}
          {success && <p className="mt-4 rounded-lg border border-green-800 bg-green-950/30 p-3 text-green-200">{success}</p>}
        </section>
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4"><h2 className="text-xl font-semibold">Department Directory</h2><span className="text-sm text-slate-400">{visibleDepartments.length} listed</span></div>
          <div className="mt-4 flex flex-wrap gap-2">{categories.map(item => <button key={item} onClick={() => { setCategory(item); setSearch(''); }} className={'rounded-full px-4 py-2 text-sm ' + (category === item ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700')}>{item}</button>)}</div>
          <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search departments…" className="mt-4 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white" />
          {loading ? <p className="py-8 text-center text-slate-400">Loading departments…</p> : visibleDepartments.length ? <div className="mt-4 divide-y divide-slate-800">{visibleDepartments.map(item => <div key={item._id} className="flex flex-wrap items-center justify-between gap-3 py-4"><div><p className="font-medium">{item.name}</p><p className="text-sm text-slate-400">{item.category} · {item.isActive ? 'Active' : 'Inactive'}</p></div><div className="flex gap-2"><button onClick={() => editDepartment(item)} className="rounded-md bg-slate-700 px-3 py-2 text-sm hover:bg-slate-600">Edit</button><button onClick={() => toggleDepartment(item)} className={'rounded-md px-3 py-2 text-sm ' + (item.isActive ? 'bg-amber-900/50 text-amber-200' : 'bg-green-900/50 text-green-200')}>{item.isActive ? 'Deactivate' : 'Activate'}</button></div></div>)}</div> : <p className="py-8 text-center text-slate-400">No departments found in this category.</p>}
        </section>
      </div>
    </div>
  );
}
