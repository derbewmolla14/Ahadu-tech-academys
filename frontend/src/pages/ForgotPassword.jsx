import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    try {
      const response = await api.post('/auth/forgot-password', { email });
      const resetToken = response.data.resetToken || '';
      setMessage('Password reset request accepted. Proceed to reset your password.');
      navigate('/reset-password', { state: { email, resetToken } });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to request password reset');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-12 text-white sm:px-6">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 px-8 py-6 shadow-xl shadow-slate-950/50">
          <p className="text-sm uppercase tracking-[0.35em] text-sky-400">Ahadu Tech Academy</p>
          <h1 className="mt-4 text-4xl font-semibold text-white">Forgot Password</h1>
          <p className="mt-3 max-w-xl text-slate-400">Enter your email address to request a password reset.</p>
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
            <button className="w-full rounded-3xl bg-sky-500 px-6 py-4 text-lg font-semibold text-slate-950 transition hover:bg-sky-400">
              Request Reset
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
