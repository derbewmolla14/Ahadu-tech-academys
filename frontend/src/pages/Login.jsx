import { useContext, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function Login() {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const fromPath = location.state?.from?.pathname;
  const postLogin =
    fromPath && fromPath !== '/login' && fromPath !== '/register' ? fromPath : '/dashboard';

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await login({ email, password });
      navigate(postLogin, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-[70vh] text-white">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
        <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/30 px-8 py-6 shadow-xl">
          <p className="text-sm uppercase tracking-[0.35em] text-sky-400">Ahadu Tech Academy</p>
          <h1 className="mt-4 text-4xl font-semibold text-white">Sign in securely</h1>
          <p className="mt-3 max-w-xl text-slate-400">
            Access your learner dashboard and saved progress with JWT‑protected authentication.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-950/70 px-8 py-10 shadow-xl backdrop-blur">
          <h2 className="text-3xl font-semibold text-white">Welcome back</h2>
          <p className="mt-2 text-slate-400">Continue where you left off.</p>
          {error ? <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-200">{error}</div> : null}
          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <label className="block">
              <span className="text-slate-200">Email</span>
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-4 text-white outline-none transition focus:border-sky-500"
                required
              />
            </label>
            <label className="block">
              <span className="text-slate-200">Password</span>
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-4 text-white outline-none transition focus:border-sky-500"
                required
              />
            </label>
            <button className="w-full rounded-2xl bg-sky-500 px-6 py-4 text-lg font-bold text-slate-950 shadow-lg shadow-sky-500/25 transition hover:bg-sky-400">
              Continue
            </button>
          </form>
          <div className="mt-8 flex flex-col gap-4 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
            <Link to="/register" className="font-medium text-white hover:text-sky-400">
              Create account
            </Link>
            <Link to="/forgot" className="font-medium text-white hover:text-sky-400">
              Forgot password?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
