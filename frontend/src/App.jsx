import { BrowserRouter as Router, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import MarketingLayout from './layouts/MarketingLayout';
import DashboardLayout from './layouts/DashboardLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import DashboardHome from './pages/dashboard/DashboardHome';
import Settings from './pages/dashboard/Settings';
import ElementaryPage from './pages/ElementaryPage';
import HighSchoolPage from './pages/HighSchoolPage';
import UniversityDashboard from './pages/UniversityDashboard';
import UniversityDetail from './pages/UniversityDetail';
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
        <Routes>
          {/* Register before wildcard layout so /dashboard never hits marketing catch‑all */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <DashboardLayout />
              </PrivateRoute>
            }
          >
            <Route index element={<DashboardHome />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          <Route path="/" element={<MarketingLayout />}>
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="forgot" element={<ForgotPassword />} />
            <Route path="reset-password" element={<ResetPassword />} />
            <Route path="elementary" element={<ElementaryPage />} />
            <Route path="elementary/grade/:id" element={<ElementaryGradePage />} />
            <Route path="highschool" element={<HighSchoolPage />} />
            <Route path="highschool/grade/:id" element={<HighSchoolGradePage />} />
            <Route path="university" element={<UniversityDashboard />} />
            <Route path="university/:name/department" element={<DepartmentBrowser />} />
            <Route path="university/:name/years" element={<YearSelection />} />
            <Route path="university/:name/courses" element={<CourseList />} />
            <Route path="university/:name/course/:courseId" element={<CourseDetail />} />
            <Route path="university/:name/content" element={<CourseContent />} />
            <Route path="university/:name/content/:courseId" element={<UniversityContent />} />
            <Route path="university/:name" element={<UniversityDetail />} />
            <Route path="universities" element={<PrivateRoute><UniversitiesPage /></PrivateRoute>} />
            <Route path="universities/:universityName/levels" element={<PrivateRoute><UniversityLevelPage /></PrivateRoute>} />
            <Route path="universities/:universityName/levels/:levelId" element={<PrivateRoute><UniversityDepartmentPage /></PrivateRoute>} />
            <Route path="university/department/:type" element={<UniversityDepartmentPage />} />
            <Route path="university/:departmentId" element={<PrivateRoute><YearSelection /></PrivateRoute>} />
            <Route path="university/:departmentId/:yearId" element={<PrivateRoute><CourseList /></PrivateRoute>} />
            <Route path="university/:departmentId/:yearId/:courseId" element={<PrivateRoute><CourseContent /></PrivateRoute>} />
            <Route path="coding" element={<CodingPage />} />
            <Route path="admin/dashboard" element={<AdminDashboard />} />
            <Route path="admin/add-course" element={<AddCourse />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Router>
    </div>
  );
}
