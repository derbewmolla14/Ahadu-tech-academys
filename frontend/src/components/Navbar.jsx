import { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getProfileImageUrl, getProfileInitials } from '../utils/profile';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/elementary', label: 'Elementary' },
  { to: '/highschool', label: 'High School' },
  { to: '/university', label: 'University' },
];

export default function Navbar() {
  const { user } = useContext(AuthContext);
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobile = () => setMobileOpen(false);
  const profileImage = getProfileImageUrl(user);
  const profileInitials = getProfileInitials(user?.fullName);

  const linkDesktop =
    'whitespace-nowrap font-semibold text-[var(--app-text)] hover:text-orange-600 transition-colors duration-200 text-base lg:text-lg';

  const linkMobile =
    'block w-full border-b border-white/15 py-3 text-center text-sm font-semibold text-white hover:bg-white/10 transition-colors duration-200';


  return (
    <header className="site-header m-0 w-full p-0 shadow-md font-sans">
      {/* TOP PHONE + ANNOUNCEMENT STRIP */}
      <div className="site-header-topbar flex min-h-7 items-center gap-2 px-2 py-1 sm:gap-4 sm:px-3 text-[9px] sm:text-[11px]">
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <span aria-hidden="true">☎</span>
          <span className="hidden font-medium sm:inline">Call us</span>
          <a className="whitespace-nowrap font-semibold text-white hover:text-gray-200" href="tel:+251924122893">+251 924 12 28 93</a>
          <a className="hidden whitespace-nowrap font-semibold text-white hover:text-gray-200 sm:inline" href="tel:+251937100547">+251 937 10 05 47</a>
        </div>
        <div className="site-announcement-track" aria-label="Ahadu Tech Academy announcements">
          <div className="site-announcement-content" aria-hidden="true">
            <span>Ahadu Tech Academy</span><span>Popular</span><span>Learn • Practice • Grow</span>
            <span>Ahadu Tech Academy</span><span>Popular</span><span>Learn • Practice • Grow</span>
          </div>
          <span className="sr-only">Ahadu Tech Academy. Popular. Learn, Practice, Grow.</span>
        </div>
        <a className="hidden shrink-0 whitespace-nowrap font-semibold text-white hover:text-gray-200 sm:inline" href="mailto:derbewmolla14@gmail.com">derbewmolla14@gmail.com</a>
      </div>

      {/* LOGO ROW + NAV */}
      <div className="site-header-surface relative border-b">
        <div className="flex min-h-14 items-center justify-between gap-2 px-2 py-1 sm:px-3 md:px-4">
          <Link to="/" className="flex min-w-0 items-center gap-2" onClick={closeMobile}>
            <img
              src="/icon.svg"
              alt="Ahadu Tech Academy"
              className="h-8 w-8 shrink-0 rounded-full object-contain sm:h-9 sm:w-9"
            />
            <div className="min-w-0 leading-none"><span className="block truncate text-[13px] font-extrabold tracking-tight text-[var(--app-text)] sm:text-sm md:text-lg lg:text-xl">AHADU TECH ACADEMY</span></div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-2 lg:gap-4 md:flex m-0 p-0" aria-label="Main">
            {navLinks.map(({ to, label }) => (
              <Link key={to} to={to} className={`${linkDesktop} ${to === '/' ? '' : 'font-medium'}`}>
                {label}
              </Link>
            ))}
            <Link to="/about" className={linkDesktop}>
              About Us
            </Link>
            {user ? (
              <Link
                to="/dashboard"
                className="flex items-center rounded-full border border-[var(--app-border)] bg-[var(--app-bg)] p-1 transition hover:bg-sky-500/10"
              >
                <span className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-[#0f1b3d] text-xs font-bold text-white">
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    profileInitials
                  )}
                </span>
              </Link>
            ) : (
              <Link
                to="/login"
                className="whitespace-nowrap rounded-full bg-orange-600 px-5 py-2 text-xs font-bold text-white shadow-md transition-all duration-200 hover:bg-orange-500"
              >
                Login
              </Link>
            )}
          </nav>

          {/* Mobile menu toggle */}
          <button
            type="button"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--app-border)] text-xl text-[var(--app-text)] transition-colors hover:bg-sky-500/10 md:hidden"
            onClick={() => setMobileOpen((o) => !o)}
          >
            ☰
          </button>
        </div>

        {/* Mobile dropdown */}
        <div
          className={`site-header-mobile-menu md:hidden overflow-hidden transition-[max-height] duration-300 ease-out ${
            mobileOpen ? 'max-h-[36rem]' : 'max-h-0'
          }`}
        >
          <nav className="w-full px-0 pt-2 pb-4 shadow-inner" aria-label="Mobile menu">
            {navLinks.map(({ to, label }) => (
              <Link key={to} to={to} className={linkMobile} onClick={closeMobile}>
                {label}
              </Link>
            ))}
            <Link to="/about" className={linkMobile} onClick={closeMobile}>
              About Us
            </Link>
            {user ? (
              <Link to="/dashboard" className={`${linkMobile} !border-orange-400/40`} onClick={closeMobile}>
                Dashboard
              </Link>
            ) : (
              <Link
                to="/login"
                className="mx-4 mt-2 block rounded-full bg-orange-600 py-3.5 text-center text-sm font-bold text-white shadow-lg transition-colors hover:bg-orange-500"
                onClick={closeMobile}
              >
                Login
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
