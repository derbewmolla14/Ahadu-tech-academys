import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSent(false);

    try {
      setLoading(true);
      await api.post('/auth/forgot-password', { email: email.trim().toLowerCase() });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not submit request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[65vh] text-white">
      <div className="mx-auto flex w-full max-w-xl flex-col gap-8">
        <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/30 px-8 py-6 shadow-xl">
          <p className="text-sm uppercase tracking-[0.35em] text-sky-400">Recover access</p>
          <h1 className="mt-4 text-4xl font-semibold text-white">Forgot password</h1>
          <p className="mt-3 text-slate-400">
            We&apos;ll email a reset link when SMTP is configured. During local development without mail, reset URLs are printed on the backend console.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-950/70 px-8 py-10 shadow-xl backdrop-blur">
          {sent ? (
            <div className="rounded-2xl border border-emerald-500/35 bg-emerald-500/10 px-5 py-4 text-emerald-100">
              Request received. If an account matches this email you will hear from us shortly. Reset links expire in one hour.
              <Link to="/login" className="mt-4 inline-block font-semibold text-sky-400 hover:text-sky-300">
                Back to login
              </Link>
            </div>
          ) : null}

          {!sent ? (
            <>
              {error ? <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-200">{error}</div> : null}
              <form onSubmit={handleSubmit} className="space-y-5">
                <label className="block">
                  <span className="text-slate-200">Email</span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-4 text-white outline-none transition focus:border-sky-500 disabled:opacity-70"
                  />
                </label>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-2xl bg-sky-500 px-6 py-4 text-lg font-bold text-slate-950 transition hover:bg-sky-400 disabled:opacity-60"
                >
                  {loading ? 'Sending…' : 'Send reset link'}
                </button>
              </form>
            </>
          ) : null}

          <Link to="/login" className="mt-10 block text-center text-sm font-medium text-slate-400 hover:text-white">
            Return to login
          </Link>
        </div>
      </div>
    </div>
  );
}
