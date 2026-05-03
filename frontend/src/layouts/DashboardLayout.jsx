import { useContext, useMemo, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function initials(fullName, email) {
  const raw = (fullName || '').trim();
  if (raw.length >= 2) return raw.slice(0, 2).toUpperCase();
  return (email || '?').slice(0, 1).toUpperCase();
}

export default function DashboardLayout() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [asideOpen, setAsideOpen] = useState(false);

  const name = user?.fullName?.trim() || user?.email || 'Account';
  const av = user?.profilePhotoUrl;

  const navCls = ({ isActive }) =>
    [
      'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition',
      isActive
        ? 'bg-sky-500/15 text-sky-100 ring-1 ring-sky-500/40'
        : 'text-slate-400 hover:bg-slate-800/80 hover:text-white',
    ].join(' ');

  const sidebarInner = useMemo(
    () => (
      <>
        <div className="border-b border-slate-800 p-6">
          <Link to="/" className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-400/90">
            Ahadu Tech
          </Link>
          <div className="mt-6 flex flex-col items-center gap-3 text-center">
            <div className="relative h-20 w-20 overflow-hidden rounded-2xl border border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 shadow-lg">
              {av ? (
                <img src={av} alt="" className="h-full w-full object-cover" loading="lazy" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-white/90">
                  {initials(user?.fullName, user?.email)}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-lg font-semibold text-white">{name}</p>
              <p className="truncate text-xs text-slate-500">{user?.email}</p>
              <span className="mt-1 inline-flex rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                {user?.role === 'admin' ? 'Admin' : 'User'}
              </span>
            </div>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-4 pb-8" aria-label="Dashboard">
          <NavLink end to="/dashboard" className={navCls} onClick={() => setAsideOpen(false)}>
            <svg className="h-5 w-5 shrink-0 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
            </svg>
            Dashboard
          </NavLink>
          <NavLink to="/dashboard/settings" className={navCls} onClick={() => setAsideOpen(false)}>
            <svg className="h-5 w-5 shrink-0 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Settings
          </NavLink>
          <button
            type="button"
            className="mt-4 flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold text-red-300 transition hover:bg-red-500/10"
            onClick={() => {
              setAsideOpen(false);
              logout();
              navigate('/', { replace: true });
            }}
          >
            <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>

          <Link
            to="/"
            className="mt-auto rounded-xl px-4 py-3 text-center text-xs font-semibold text-slate-500 hover:text-slate-300"
            onClick={() => setAsideOpen(false)}
          >
            ← Back to site
          </Link>
        </nav>
      </>
    ),
    [av, logout, user?.email, user?.fullName, user?.role, name]
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="sticky top-0 z-40 flex items-center gap-4 border-b border-slate-800 bg-slate-950/95 px-4 py-4 backdrop-blur md:hidden">
        <button
          type="button"
          aria-expanded={asideOpen}
          aria-label="Menu"
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-xl text-white"
          onClick={() => setAsideOpen((o) => !o)}
        >
          ☰
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-white">{name}</p>
          <p className="truncate text-xs text-slate-500">Dashboard</p>
        </div>
      </header>

      {asideOpen ? (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setAsideOpen(false)}
        />
      ) : null}

      <aside
        className={[
          'fixed inset-y-0 left-0 z-50 flex h-screen w-[min(288px,calc(100vw-48px))] flex-col overflow-hidden bg-slate-900 shadow-2xl ring-1 ring-slate-800 transition-transform duration-300 md:translate-x-0 md:shadow-none md:backdrop-blur-none',
          asideOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        ].join(' ')}
      >
        {sidebarInner}
      </aside>

      <main className="md:min-h-screen md:border-l md:border-slate-800 md:bg-slate-950 md:py-12 md:pl-[288px]">
        <div className="mx-auto max-w-4xl px-4 py-10 md:py-12">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
