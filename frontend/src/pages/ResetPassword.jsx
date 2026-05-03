import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/api';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const qpEmail = useMemo(() => {
    const e = searchParams.get('email') || '';
    try {
      return decodeURIComponent(e);
    } catch {
      return e;
    }
  }, [searchParams]);
  const qpToken = searchParams.get('token') || '';

  const [email, setEmail] = useState(qpEmail || '');
  const [token] = useState(qpToken);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setEmail(qpEmail || '');
  }, [qpEmail]);

  useEffect(() => {
    if (!qpToken.trim()) setError('This page needs a reset token from your email link.');
  }, [qpToken]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!token.trim()) {
      setError('Missing reset token. Open this page from your email.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      await api.post('/auth/reset-password', {
        email: email.trim().toLowerCase(),
        token: token.trim(),
        password,
      });
      setMessage('Password reset successfully. Redirecting to login…');
      setTimeout(() => navigate('/login', { replace: true }), 1800);
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed');
    }
  };

  const tokenMasked = qpToken.length > 8 ? `${qpToken.slice(0, 6)}…` : qpToken ? '••••••••' : '—';

  return (
    <div className="min-h-[70vh] text-white">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
        <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/30 px-8 py-6 shadow-xl">
          <p className="text-sm uppercase tracking-[0.35em] text-sky-400">Secure reset</p>
          <h1 className="mt-4 text-4xl font-semibold text-white">Choose a new password</h1>
          <p className="mt-3 text-slate-400">
            Tokens are stored hashed and invalidated after success. Tokens expire automatically after sixty minutes for security.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-950/70 px-8 py-10 shadow-xl backdrop-blur">
          {message ? <div className="mb-8 rounded-2xl border border-emerald-500/35 bg-emerald-500/10 px-5 py-4 text-emerald-100">{message}</div> : null}
          {error ? <div className="mb-8 rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-red-200">{error}</div> : null}

          <form onSubmit={handleSubmit} className="space-y-5">
            <label className="block">
              <span className="text-slate-200">Email</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-4 text-white outline-none transition focus:border-sky-500"
              />
            </label>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 px-4 py-4 text-sm">
              <p className="font-semibold text-slate-200">Secure token reference</p>
              <p className="mt-2 text-xs text-slate-500">
                Token loaded from reset link (<span className="font-mono text-slate-300">{tokenMasked}</span>). Paste a full link above if blank.
              </p>
            </div>

            <label className="block">
              <span className="text-slate-200">New password</span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-4 text-white outline-none transition focus:border-sky-500"
              />
            </label>

            <label className="block">
              <span className="text-slate-200">Confirm password</span>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-4 text-white outline-none transition focus:border-sky-500"
              />
            </label>

            <button className="w-full rounded-2xl bg-sky-500 px-6 py-4 text-lg font-bold text-slate-950 transition hover:bg-sky-400">
              Update password
            </button>
          </form>

          <Link to="/login" className="mt-10 block text-center text-sm font-medium text-slate-400 hover:text-white">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
