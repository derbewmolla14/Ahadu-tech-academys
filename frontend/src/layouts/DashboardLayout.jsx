
import { useContext, useState } from "react";

import {
  Link,
  NavLink,
  Outlet,
  useNavigate,
} from "react-router-dom";

import {
  LayoutDashboard,
  Plus,
  BookOpen,
  Upload,
  Layers,
  Users,
  ShieldCheck,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
} from "lucide-react";

import { AuthContext } from "../context/AuthContext";

// ========================================
// USER INITIALS
// ========================================
function initials(fullName, email) {
  const raw = (fullName || "").trim();

  if (raw.length >= 2) {
    return raw
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  }

  return (email || "?").slice(0, 1).toUpperCase();
}

// ========================================
// NAVIGATION ITEM
// ========================================
function NavigationItem({
  to,
  icon: Icon,
  children,
  onClick,
  end = false,
}) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        [
          "flex items-center gap-3 rounded-lg px-3 py-3",
          "text-[13px] font-semibold transition-all duration-200",
          isActive
            ? "border border-sky-500/30 bg-sky-500/15 text-sky-300 shadow-sm"
            : "border border-transparent text-slate-400 hover:bg-slate-800/70 hover:text-white",
        ].join(" ")
      }
    >
      <Icon size={17} strokeWidth={1.9} />
      <span>{children}</span>
    </NavLink>
  );
}

// ========================================
// SECTION TITLE
// ========================================
function SectionTitle({ children }) {
  return (
    <p className="mb-2 mt-6 px-3 text-[10px] font-bold uppercase tracking-[1.8px] text-slate-500">
      {children}
    </p>
  );
}

// ========================================
// DASHBOARD LAYOUT
// ========================================
export default function DashboardLayout() {
  const { user, logout } = useContext(AuthContext);

  const navigate = useNavigate();

  const [asideOpen, setAsideOpen] = useState(false);

  const name =
    user?.fullName?.trim() ||
    user?.email ||
    "Account";

  const email = user?.email || "";

  // ========================================
  // PROFILE PHOTO
  // ========================================
  const apiUrl = import.meta.env.VITE_API_URL || "/api";

  const apiOrigin = new URL(
    apiUrl,
    window.location.origin
  ).origin;

  const photoPath =
    user?.profilePhotoUrl || user?.profilePhoto;

  const avatar = photoPath
    ? photoPath.startsWith("http")
      ? photoPath
      : `${apiOrigin}${
          photoPath.startsWith("/") ? "" : "/"
        }${photoPath}`
    : null;

  // ========================================
  // ROLE PERMISSIONS
  // ========================================
  const role = String(
    user?.role || "user"
  ).toLowerCase();

  const isAdmin = [
    "admin",
    "superadmin",
  ].includes(role);

  const isSuperAdmin = role === "superadmin";

  // ========================================
  // MENU CONTROL
  // ========================================
  const closeMenu = () => {
    setAsideOpen(false);
  };

  // ========================================
  // LOGOUT
  // ========================================
  const handleLogout = async () => {
    closeMenu();

    try {
      await logout();
    } finally {
      navigate("/login", {
        replace: true,
      });
    }
  };

  // ========================================
  // SIDEBAR
  // ========================================
  const sidebarInner = (
    <>
      {/* BRAND */}
      <div className="border-b border-slate-800/80 px-5 py-5">
        <Link
          to="/"
          onClick={closeMenu}
          className="text-sm font-bold uppercase tracking-[2px] text-sky-400"
        >
          AHADU TECH
        </Link>
      </div>

      {/* PROFILE */}
      <div className="border-b border-slate-800/80 px-4 py-6">
        <div className="flex flex-col items-center gap-3 text-center">

          <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 shadow-lg">

            {avatar ? (
              <img
                src={avatar}
                alt={`${name}'s profile`}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-xl font-bold text-white">
                {initials(user?.fullName, email)}
              </span>
            )}

          </div>

          <div className="min-w-0 w-full">
            <h2 className="truncate text-sm font-bold text-white">
              {name}
            </h2>

            <p className="mt-1 truncate text-xs text-slate-500">
              {email}
            </p>

            <span className="mt-2 inline-flex rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
              {isSuperAdmin
                ? "Super Admin"
                : isAdmin
                  ? "Admin"
                  : "User"}
            </span>
          </div>
        </div>
      </div>

      {/* NAVIGATION */}
      <nav
        aria-label="Dashboard navigation"
        className="flex flex-1 flex-col overflow-y-auto px-3 py-4"
      >

        {/* DASHBOARD */}
        <NavigationItem
          to="/dashboard"
          icon={LayoutDashboard}
          end
          onClick={closeMenu}
        >
          Dashboard
        </NavigationItem>

        {/* ADMIN MENU */}
        {isAdmin && (
          <>
            <SectionTitle>
              Course Management
            </SectionTitle>

            <NavigationItem
              to="/dashboard/add-course"
              icon={Plus}
              onClick={closeMenu}
            >
              Add Course
            </NavigationItem>

            <NavigationItem
              to="/dashboard/manage-courses"
              icon={BookOpen}
              onClick={closeMenu}
            >
              Manage Courses
            </NavigationItem>

            <NavigationItem
              to="/dashboard/add-course#materials"
              icon={Upload}
              onClick={closeMenu}
            >
              Upload Course Materials
            </NavigationItem>

            <div
              className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-3 text-[13px] font-semibold text-slate-600"
              title="Coming soon"
            >
              <Layers size={17} />

              <span className="flex-1">
                Manage Modules
              </span>

              <span className="rounded bg-slate-800 px-2 py-1 text-[9px] uppercase">
                Soon
              </span>
            </div>

            {/* SUPER ADMIN */}
            {isSuperAdmin && (
              <>
                <SectionTitle>
                  Platform Administration
                </SectionTitle>

                <div className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-3 text-[13px] font-semibold text-slate-600">
                  <ShieldCheck size={17} />
                  Admin Management

                  <span className="ml-auto text-[9px]">
                    Soon
                  </span>
                </div>
              </>
            )}
          </>
        )}

        {/* ACCOUNT */}
        <SectionTitle>
          Account
        </SectionTitle>

        <NavigationItem
          to="/dashboard/settings"
          icon={Settings}
          onClick={closeMenu}
        >
          Settings
        </NavigationItem>

        {/* LOGOUT */}
        <button
          type="button"
          onClick={handleLogout}
          className="mt-3 flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-[13px] font-semibold text-red-400 transition hover:bg-red-500/10 hover:text-red-300"
        >
          <LogOut size={17} />
          Logout
        </button>

        {/* BACK TO WEBSITE */}
        <Link
          to="/"
          onClick={closeMenu}
          className="mt-auto flex items-center justify-center gap-2 px-3 py-5 text-xs font-semibold text-slate-500 transition hover:text-slate-300"
        >
          <ChevronLeft size={15} />
          Back to website
        </Link>

      </nav>
    </>
  );

  // ========================================
  // MAIN LAYOUT
  // ========================================
  return (
    <div className="min-h-screen bg-[#080f1f] text-slate-100">

      {/* MOBILE HEADER */}
      <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-slate-800 bg-[#080f1f]/95 px-4 backdrop-blur md:hidden">

        <button
          type="button"
          aria-label="Open navigation"
          aria-expanded={asideOpen}
          onClick={() => setAsideOpen(!asideOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-white"
        >
          {asideOpen ? (
            <X size={19} />
          ) : (
            <Menu size={19} />
          )}
        </button>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-white">
            AHADU TECH
          </p>

          <p className="truncate text-xs text-slate-500">
            {name}
          </p>
        </div>

      </header>

      {/* MOBILE OVERLAY */}
      {asideOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={closeMenu}
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 flex h-screen",
          "w-[250px] flex-col overflow-hidden",
          "border-r border-slate-800 bg-[#101a2e]",
          "shadow-2xl transition-transform duration-300",
          "md:translate-x-0 md:shadow-none",
          asideOpen
            ? "translate-x-0"
            : "-translate-x-full md:translate-x-0",
        ].join(" ")}
      >
        {sidebarInner}
      </aside>

      {/* PAGE CONTENT */}
      <main className="min-h-screen md:ml-[250px]">

        <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </div>

      </main>

    </div>
  );
}
