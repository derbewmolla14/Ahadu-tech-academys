import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

export default function DashboardHome() {
  const { user } = useContext(AuthContext);
  const name = user?.fullName?.trim() || user?.email || '';

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 p-8 shadow-xl">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-400">Overview</p>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-white md:text-4xl">
          Welcome back{name ? `, ${name}` : ''}.
        </h1>
        <p className="mt-4 max-w-2xl text-slate-400">
          Manage your profile, preferences, and account security from this dashboard. Updates sync immediately across the platform.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          to="/dashboard/settings"
          className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 transition hover:border-sky-500/40 hover:bg-slate-900"
        >
          <h2 className="text-lg font-semibold text-white">Profile &amp; settings</h2>
          <p className="mt-2 text-sm text-slate-400">
            Update name, phone, photo, and other account preferences.
          </p>
          <span className="mt-5 inline-flex text-sm font-semibold text-sky-400">Go to Settings →</span>
        </Link>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
          <h2 className="text-lg font-semibold text-white">Account status</h2>
          <ul className="mt-4 space-y-2 text-sm text-slate-400">
            <li className="flex justify-between gap-4 border-b border-slate-800/80 py-2">
              <span>Email</span>
              <span className="truncate text-sky-300">{user?.email}</span>
            </li>
            <li className="flex justify-between gap-4 border-b border-slate-800/80 py-2">
              <span>Role</span>
              <span className="font-medium text-emerald-300">{user?.role === 'admin' ? 'Admin' : 'User'}</span>
            </li>
            <li className="flex justify-between gap-4 py-2">
              <span>Approved</span>
              <span className="font-medium text-emerald-300">{user?.approved ? 'Active' : 'Pending'}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
