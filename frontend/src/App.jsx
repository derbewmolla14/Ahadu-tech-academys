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
import UniversityDashboard from './pages/UniversityDashboard';
import UniversityDetail from './pages/UniversityDetail';
import UniversityLevel from './pages/UniversityLevel';
import UniversityDepartment from './pages/UniversityDepartment';
import UniversityCourses from './pages/UniversityCourses';
import UniversityContent from './pages/UniversityContent';
import UniversitiesPage from './pages/UniversitiesPage';
import UniversityLevelPage from './pages/UniversityLevelPage';
import ElementaryGradePage from './pages/ElementaryGradePage';
import HighSchoolGradePage from './pages/HighSchoolGradePage';
import UniversityDepartmentPage from './pages/UniversityDepartmentPage';
import YearSelection from './pages/YearSelection';
import CourseList from './pages/CourseList';
import CourseContent from './pages/CourseContent';
import CodingPage from './pages/CodingPage';
import DepartmentBrowser from './pages/DepartmentBrowser';
import CourseDetail from './pages/CourseDetail';
import AdminDashboard from './pages/AdminDashboard';
import AddCourse from './pages/AddCourse';

function PrivateRoute({ children }) {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) return <div className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-8">Loading...</div>;
  return user ? children : <Navigate to="/login" replace state={{ from: location }} />;
}

export default function App() {
  return (
    <div className="min-h-screen bg-slate-400 text-white">
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <header className="w-full shadow-md font-sans sticky top-0 z-50">
        {/* TOP BAR - Dark Blue */}
      <div className="bg-[#0f1b3d] text-white py-2 px-6 flex justify-end items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-orange-500">📞</span>
          <span className="text-orange-400 font-medium">call us now</span>
          <span className="hover:text-gray-300 transition">+2519-24-12-28-93</span>
          <span className="hover:text-gray-300 transition">+251-937-10-05-47</span>
        </div>
      </div>
          <div className="bg-white py-4 px-8 flex justify-between items-center border-b border-gray-100">
            {/* LOGO SECTION */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="border-2 border-[#0f1b3d] p-1 flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-blue-50 to-blue-100">
              <span className="text-2xl">🎓</span>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-xl font-bold text-[#0f1b3d] tracking-tighter">AHADU</span>
              <span className="text-xl font-bold text-[#0f1b3d] tracking-tighter">TECH</span>
              <span className="text-xl font-bold text-[#0f1b3d] tracking-tighter">ACADEMY</span>
            </div>
          </Link>
        </div>
            <nav className="hidden items-center gap-4 md:flex">
              <Link to="/" className="text-[#0f1b3d] font-semibold hover:text-blue-300 transition text-xl">Home</Link>
              <Link to="/elementary" className="text-slate-700 font-medium hover:text-blue-300 transition text-xl">Elementary</Link>
              <Link to="/highschool" className="text-slate-700 font-medium hover:text-blue-300 transition text-xl">High School</Link>
              <Link to="/university" className="text-slate-700 font-medium hover:text-blue-300 transition text-xl">University</Link>
              <Link to="/coding" className="text-slate-700 font-medium hover:text-blue-300 transition text-xl">Coding Practice</Link>
              {/* Dropdown Placeholder */}
          <div className="relative group cursor-pointer gap-3">
            <span className="text-slate-700 font-medium flex items-center gap-1 group-hover:text-[#0f1b3d] text-xl">
              About Us 
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </span>
          </div>


              <Link
              to="/login"
              className="bg-orange-600 hover:bg-orange-600 text-white-900 px-10 py-3 rounded-full font-bold shadow-lg shadow-orange-200 transition-all transform hover:scale-105"
            >
              LOGIN
            </Link>
            


           </nav>
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
            <Route path="/university" element={<UniversityDashboard />} />
            <Route path="/university/:name/department" element={<DepartmentBrowser />} />
            <Route path="/university/:name/years" element={<YearSelection />} />
            <Route path="/university/:name/courses" element={<CourseList />} />
            <Route path="/university/:name/course/:courseId" element={<CourseDetail />} />
            <Route path="/university/:name/content" element={<CourseContent />} />
            <Route path="/university/:name/content/:courseId" element={<UniversityContent />} />
            <Route path="/university/:name" element={<UniversityDetail />} />
            <Route path="/universities" element={<PrivateRoute><UniversitiesPage /></PrivateRoute>} />
            <Route path="/universities/:universityName/levels" element={<PrivateRoute><UniversityLevelPage /></PrivateRoute>} />
            <Route path="/universities/:universityName/levels/:levelId" element={<PrivateRoute><UniversityDepartmentPage /></PrivateRoute>} />
            <Route path="/university/department/:type" element={<UniversityDepartmentPage />} />
            <Route path="/university/:departmentId" element={<PrivateRoute><YearSelection /></PrivateRoute>} />
            <Route path="/university/:departmentId/:yearId" element={<PrivateRoute><CourseList /></PrivateRoute>} />
            <Route path="/university/:departmentId/:yearId/:courseId" element={<PrivateRoute><CourseContent /></PrivateRoute>} />
            <Route path="/coding" element={<CodingPage />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/add-course" element={<AddCourse />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </Router>
    </div>
  );
}
