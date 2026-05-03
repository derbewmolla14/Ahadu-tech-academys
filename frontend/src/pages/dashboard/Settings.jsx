import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';

export default function Settings() {
  const { user, updateProfile } = useContext(AuthContext);
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [photo, setPhoto] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFullName(user?.fullName || '');
    setPhone(user?.phone || '');
  }, [user]);

  const preview = photo ? URL.createObjectURL(photo) : user?.profilePhotoUrl || '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSaving(true);
    try {
      const form = new FormData();
      if (fullName.trim()) form.append('fullName', fullName.trim());
      form.append('phone', phone.trim());
      if (photo) form.append('profilePhoto', photo);
      await updateProfile(form);
      setMessage('Profile saved successfully.');
      setPhoto(null);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Update failed.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="mt-3 text-slate-400">
          Refresh your identity on the academy platform. Uploaded images are resized by the browser for best compatibility (JPEG / PNG / WebP / GIF, max 5MB).
        </p>
      </div>

      {message ? <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-emerald-200">{message}</div> : null}
      {error ? <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-200">{error}</div> : null}

      <form onSubmit={handleSubmit} className="space-y-8 rounded-3xl border border-slate-800 bg-slate-900/70 p-8 shadow-xl">
        <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
          <div className="h-28 w-28 overflow-hidden rounded-2xl border border-slate-700 bg-slate-800">
            {preview ? (
              <img src={preview} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-slate-600">?</div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300">
              Profile photo
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="mt-2 block w-full text-sm text-slate-400 file:mr-4 file:rounded-xl file:border-0 file:bg-sky-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-sky-500"
                onChange={(ev) => {
                  setPhoto(ev.target.files?.[0] || null);
                  setMessage('');
                }}
              />
            </label>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-slate-300">Full name</span>
            <input
              type="text"
              value={fullName}
              onChange={(ev) => setFullName(ev.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-sky-500"
              placeholder="Jane Doe"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-300">Phone</span>
            <input
              type="tel"
              value={phone}
              onChange={(ev) => setPhone(ev.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-sky-500"
              placeholder="+251 ..."
            />
          </label>
        </div>

        <label className="block">
          <span className="text-sm font-medium text-slate-300">Email</span>
          <input
            type="email"
            value={user?.email || ''}
            disabled
            className="mt-2 w-full cursor-not-allowed rounded-2xl border border-slate-800 bg-slate-950/50 px-4 py-3 text-slate-500"
          />
          <span className="mt-2 block text-xs text-slate-500">Contact support if you need to change your login email.</span>
        </label>

        <div className="flex flex-wrap gap-4 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="rounded-2xl bg-sky-500 px-10 py-3.5 font-bold text-slate-950 transition hover:bg-sky-400 disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
          <button
            type="button"
            onClick={() => {
              setFullName(user?.fullName || '');
              setPhone(user?.phone || '');
              setPhoto(null);
              setMessage('');
              setError('');
            }}
            className="rounded-2xl border border-slate-700 px-6 py-3.5 font-semibold text-slate-300 hover:bg-slate-800"
          >
            Reset form
          </button>
        </div>
      </form>
    </div>
  );
}
