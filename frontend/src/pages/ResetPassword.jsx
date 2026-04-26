import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api/api';

export default function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState(location.state?.email || '');
  const [token, setToken] = useState(location.state?.resetToken || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (location.state?.email) setEmail(location.state.email);
    if (location.state?.resetToken) setToken(location.state.resetToken);
  }, [location.state]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      await api.post('/auth/reset-password', { email, token, password });
      setMessage('Password reset successfully. Redirecting to login...');
      setTimeout(() => navigate('/login', { replace: true }), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-12 text-white sm:px-6">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 px-8 py-6 shadow-xl shadow-slate-950/50">
          <p className="text-sm uppercase tracking-[0.35em] text-sky-400">Ahadu Tech Academy</p>
          <h1 className="mt-4 text-4xl font-semibold text-white">Reset Password</h1>
          <p className="mt-3 max-w-xl text-slate-400">Enter your email, reset token, and new password below.</p>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900 px-8 py-10 shadow-xl shadow-slate-950/50">
          {message ? <div className="mb-6 rounded-2xl bg-emerald-500/10 px-4 py-3 text-emerald-200">{message}</div> : null}
          {error ? <div className="mb-6 rounded-2xl bg-red-500/10 px-4 py-3 text-red-200">{error}</div> : null}
          <form onSubmit={handleSubmit} className="space-y-5">
            <label className="block">
              <span className="text-slate-200">Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-4 text-white outline-none transition focus:border-sky-500"
                required
              />
            </label>
            <label className="block">
              <span className="text-slate-200">Reset Token</span>
              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-4 text-white outline-none transition focus:border-sky-500"
                required
              />
            </label>
            <label className="block">
              <span className="text-slate-200">New Password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-4 text-white outline-none transition focus:border-sky-500"
                required
              />
            </label>
            <label className="block">
              <span className="text-slate-200">Confirm Password</span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-4 text-white outline-none transition focus:border-sky-500"
                required
              />
            </label>
            <button className="w-full rounded-3xl bg-sky-500 px-6 py-4 text-lg font-semibold text-slate-950 transition hover:bg-sky-400">
              Reset Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
