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
    'whitespace-nowrap text-[#0f1b3d] font-semibold hover:text-orange-600 transition-colors duration-200 text-base lg:text-lg';

  const linkMobile =
    'block w-full border-b border-white/15 py-3 text-center text-sm font-semibold text-white hover:bg-white/10 transition-colors duration-200';


  return (
    <header className="m-0 w-full p-0 shadow-md font-sans sticky top-0 z-50">
      {/* TOP BAR */}
      <div className="hidden bg-[#0f1b3d] text-white px-0 py-1 sm:flex justify-end items-center gap-4 text-[11px]">
        <div className="flex flex-wrap items-center justify-end gap-x-4 gap-y-1">
          <span className="text-orange-500">📞</span>
          <span className="text-orange-400 font-medium whitespace-nowrap">call us now</span>
          <span className="hover:text-gray-300 transition whitespace-nowrap">+2519-24-12-28-93</span>
          <span className="hover:text-gray-300 transition whitespace-nowrap">+251-937-10-05-47</span>
        </div>
      </div>

      {/* LOGO ROW + NAV */}
      <div className="relative border-b border-gray-100 bg-white">
        <div className="flex min-h-14 items-center justify-between gap-2 px-2 py-1 sm:px-3 md:px-4">
          <Link to="/" className="flex min-w-0 items-center gap-2" onClick={closeMobile}>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#0f1b3d] bg-gradient-to-br from-blue-50 to-blue-100 p-1 sm:h-9 sm:w-9">
              <span className="text-lg sm:text-xl">🎓</span>
            </div>
            <div className="min-w-0 leading-none"><span className="block truncate text-[13px] font-extrabold tracking-tight text-[#0f1b3d] sm:text-sm md:text-lg lg:text-xl">AHADU TECH ACADEMY</span></div>
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
                className="flex items-center rounded-full border border-[#0f1b3d]/15 bg-slate-50 p-1 transition hover:bg-slate-100"
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
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#0f1b3d]/15 text-xl text-[#0f1b3d] transition-colors hover:bg-slate-100 md:hidden"
            onClick={() => setMobileOpen((o) => !o)}
          >
            ☰
          </button>
        </div>

        {/* Mobile dropdown */}
        <div
          className={`md:hidden overflow-hidden bg-[#0f1b3d] transition-[max-height] duration-300 ease-out ${
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
