import { BrowserRouter as Router, Link, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ElementaryPage from './pages/ElementaryPage';
import HighSchoolPage from './pages/HighSchoolPage';
import UniversityPage from './pages/UniversityPage';
import UniversitiesPage from './pages/UniversitiesPage';
import UniversityLevelPage from './pages/UniversityLevelPage';
import ElementaryGradePage from './pages/ElementaryGradePage';
import HighSchoolGradePage from './pages/HighSchoolGradePage';
import UniversityDepartmentPage from './pages/UniversityDepartmentPage';
import YearSelection from './pages/YearSelection';
import CourseList from './pages/CourseList';
import CourseContent from './pages/CourseContent';
import CodingPage from './pages/CodingPage';

function PrivateRoute({ children }) {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) return <div className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-8">Loading...</div>;
  return user ? children : <Navigate to="/login" replace state={{ from: location }} />;
}

export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Router>
        <header className="border-b border-slate-800 bg-slate-900/95 py-4 shadow-sm shadow-black/10 backdrop-blur-sm">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6">
            <Link to="/" className="text-lg font-semibold text-white">Ahadu Tech Academy</Link>
            <nav className="hidden items-center gap-4 md:flex">
              <Link to="/" className="text-sm text-slate-300 hover:text-white">Home</Link>
              <Link to="/elementary" className="text-sm text-slate-300 hover:text-white">Elementary</Link>
              <Link to="/highschool" className="text-sm text-slate-300 hover:text-white">High School</Link>
              <Link to="/university" className="text-sm text-slate-300 hover:text-white">University</Link>
              <Link to="/coding" className="text-sm text-slate-300 hover:text-white">Coding Practice</Link>
            </nav>
            <Link
              to="/login"
              className="rounded-full bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow transition hover:bg-sky-400"
            >
              LOGIN
            </Link>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/elementary" element={<ElementaryPage />} />
            <Route path="/elementary/grade/:id" element={<ElementaryGradePage />} />
            <Route path="/highschool" element={<HighSchoolPage />} />
            <Route path="/highschool/grade/:id" element={<HighSchoolGradePage />} />
            <Route path="/university" element={<UniversityPage />} />
            <Route path="/universities" element={<PrivateRoute><UniversitiesPage /></PrivateRoute>} />
            <Route path="/universities/:universityName/levels" element={<PrivateRoute><UniversityLevelPage /></PrivateRoute>} />
            <Route path="/universities/:universityName/levels/:levelId" element={<PrivateRoute><UniversityDepartmentPage /></PrivateRoute>} />
            <Route path="/university/department/:type" element={<UniversityDepartmentPage />} />
            <Route path="/university/:departmentId" element={<PrivateRoute><YearSelection /></PrivateRoute>} />
            <Route path="/university/:departmentId/:yearId" element={<PrivateRoute><CourseList /></PrivateRoute>} />
            <Route path="/university/:departmentId/:yearId/:courseId" element={<PrivateRoute><CourseContent /></PrivateRoute>} />
            <Route path="/coding" element={<CodingPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </Router>
    </div>
  );
}
