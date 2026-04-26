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
  const fromPath = location.state?.from?.pathname || '/';

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await login({ email, password });
      navigate(fromPath, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-12 text-white sm:px-6">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 px-8 py-6 shadow-xl shadow-slate-950/50">
          <p className="text-sm uppercase tracking-[0.35em] text-sky-400">Ahadu Tech Academy</p>
          <h1 className="mt-4 text-4xl font-semibold text-white">Login to your account</h1>
          <p className="mt-3 max-w-xl text-slate-400">Securely access your courses, content, and practice materials.</p>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900 px-8 py-10 shadow-xl shadow-slate-950/50">
          <h2 className="text-3xl font-semibold text-white">Welcome back</h2>
          <p className="mt-2 text-slate-400">Sign in to continue learning.</p>
          {error ? <div className="mt-4 rounded-2xl bg-red-500/10 px-4 py-3 text-red-200">{error}</div> : null}
          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
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
              <span className="text-slate-200">Password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-4 text-white outline-none transition focus:border-sky-500"
                required
              />
            </label>
            <button className="w-full rounded-3xl bg-sky-500 px-6 py-4 text-lg font-semibold text-slate-950 transition hover:bg-sky-400">
              Login
            </button>
          </form>
          <div className="mt-6 flex flex-col gap-3 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
            <Link to="/register" className="hover:text-white">
              Create Account
            </Link>
            <Link to="/forgot" className="hover:text-white">Forgot Password?</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
