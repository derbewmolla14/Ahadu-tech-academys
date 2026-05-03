import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function Register() {
  const { registerAccount } = useContext(AuthContext);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [inviteCode, setInviteCode] = useState('');
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    const formData = new FormData();
    formData.append('fullName', fullName.trim());
    formData.append('email', email.trim().toLowerCase());
    if (phone.trim()) formData.append('phone', phone.trim());
    formData.append('password', password);
    formData.append('role', role);
    if (role === 'admin') formData.append('inviteCode', inviteCode.trim());
    if (profilePhoto) formData.append('profilePhoto', profilePhoto);

    try {
      await registerAccount(formData);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const apiMsg =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.msg ||
        err.message ||
        'Registration failed';
      setError(apiMsg);
    }
  };

  return (
    <div className="min-h-[70vh] text-white pb-12">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
        <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/30 px-8 py-6 shadow-xl">
          <p className="text-sm uppercase tracking-[0.35em] text-sky-400">Ahadu Tech Academy</p>
          <h1 className="mt-4 text-4xl font-semibold text-white">Create your account</h1>
          <p className="mt-3 max-w-xl text-slate-400">
            Register with verified details. Admin accounts require a server‑configured invitation code (
            <code className="text-sky-300">ADMIN_INVITE_CODE</code> in backend <code>.env</code>
            ).
          </p>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-950/70 px-8 py-10 shadow-xl backdrop-blur">
          {error ? <div className="mb-8 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-200">{error}</div> : null}

          <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <label className="block md:col-span-2">
                <span className="text-slate-200">Full name</span>
                <input
                  type="text"
                  autoComplete="name"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3.5 text-white outline-none transition focus:border-sky-500"
                  placeholder="e.g. Hanna Bekele"
                />
              </label>
              <label className="block">
                <span className="text-slate-200">Email</span>
                <input
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3.5 text-white outline-none transition focus:border-sky-500"
                />
              </label>
              <label className="block">
                <span className="text-slate-200">Phone (optional)</span>
                <input
                  type="tel"
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3.5 text-white outline-none transition focus:border-sky-500"
                  placeholder="+251 …"
                />
              </label>
            </div>

            <label className="block">
              <span className="text-slate-200">Password</span>
              <input
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3.5 text-white outline-none transition focus:border-sky-500"
                placeholder="8+ chars, letters and numbers"
                minLength={8}
              />
              <span className="mt-2 block text-xs text-slate-500">Strong passwords use at least 8 characters with letters and numbers.</span>
            </label>

            <fieldset className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
              <legend className="px-2 text-sm font-semibold text-slate-300">Role</legend>
              <div className="mt-4 flex flex-col gap-4 sm:flex-row">
                <label className="flex flex-1 cursor-pointer items-start gap-3 rounded-xl border border-slate-700 bg-slate-900 p-4 transition hover:border-sky-600/60">
                  <input
                    type="radio"
                    name="role"
                    value="user"
                    checked={role === 'user'}
                    onChange={() => setRole('user')}
                    className="mt-1"
                  />
                  <span>
                    <span className="block font-semibold text-white">User</span>
                    <span className="text-sm text-slate-400">Courses, dashboards, learner features.</span>
                  </span>
                </label>
                <label className="flex flex-1 cursor-pointer items-start gap-3 rounded-xl border border-orange-900/60 bg-orange-950/25 p-4 transition hover:border-orange-600/70">
                  <input
                    type="radio"
                    name="role"
                    value="admin"
                    checked={role === 'admin'}
                    onChange={() => setRole('admin')}
                    className="mt-1 accent-orange-500"
                  />
                  <span>
                    <span className="block font-semibold text-orange-50">Administrator</span>
                    <span className="text-sm text-orange-200/75">Invitation code required on the backend.</span>
                  </span>
                </label>
              </div>
              {role === 'admin' ? (
                <label className="mt-4 block">
                  <span className="text-sm text-orange-100">Admin invitation code</span>
                  <input
                    type="password"
                    autoComplete="off"
                    required
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-orange-800/70 bg-orange-950/40 px-4 py-3 text-white outline-none placeholder:text-orange-900/70 focus:border-orange-400"
                    placeholder="From your organization (.env ADMIN_INVITE_CODE)"
                  />
                </label>
              ) : null}
            </fieldset>

            <label className="block">
              <span className="text-slate-200">Profile photo (optional)</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="mt-2 block w-full text-sm text-slate-400 file:mr-4 file:rounded-xl file:border-0 file:bg-slate-700 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-slate-600"
                onChange={(e) => setProfilePhoto(e.target.files?.[0] || null)}
              />
              <span className="mt-2 block text-xs text-slate-500">JPEG, PNG, WebP or GIF up to 5MB.</span>
            </label>

            <button className="w-full rounded-2xl bg-emerald-500 px-6 py-4 text-lg font-bold text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400">
              Create account
            </button>
          </form>

          <p className="mt-10 text-center text-sm text-slate-400">
            Already registered?{' '}
            <Link to="/login" className="font-semibold text-sky-400 hover:text-sky-300">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
