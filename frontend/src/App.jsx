
import {
  BrowserRouter as Router,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";

import { useContext } from "react";

import { AuthContext } from "./context/AuthContext";

// Layouts
import MarketingLayout from "./layouts/MarketingLayout";
import DashboardLayout from "./layouts/DashboardLayout";

// Authentication
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

// Main pages
import Home from "./pages/Home";
import DashboardHome from "./pages/dashboard/DashboardHome";
import Settings from "./pages/dashboard/Settings";

// School pages
import ElementaryPage from "./pages/ElementaryPage";
import ElementaryGradePage from "./pages/ElementaryGradePage";
import HighSchoolPage from "./pages/HighSchoolPage";
import HighSchoolGradePage from "./pages/HighSchoolGradePage";

// University pages
import UniversityDashboard from "./pages/UniversityDashboard";
import UniversityDetail from "./pages/UniversityDetail";
import UniversityDepartment from "./pages/UniversityDepartment";
import UniversityCourses from "./pages/UniversityCourses";
import UniversityContent from "./pages/UniversityContent";
import UniversitiesPage from "./pages/UniversitiesPage";
import UniversityLevelPage from "./pages/UniversityLevelPage";
import UniversityDepartmentPage from "./pages/UniversityDepartmentPage";

// Course pages
import YearSelection from "./pages/YearSelection";
import CourseList from "./pages/CourseList";
import CourseContent from "./pages/CourseContent";
import CourseDetail from "./pages/CourseDetail";

// Other pages
import CodingPage from "./pages/CodingPage";
import DepartmentBrowser from "./pages/DepartmentBrowser";

// Admin pages
import AdminDashboard from "./pages/AdminDashboard";
import AddCourse from "./pages/AddCourse";

// ========================================
// PRIVATE ROUTE
// ========================================
function PrivateRoute({ children }) {
  const { user, loading } = useContext(AuthContext);

  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-300">
        Loading your account...
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  return children;
}

// ========================================
// APPLICATION ROUTES
// ========================================
function AppRoutes() {
  return (
    <Routes>

      {/* ==================================
          AUTHENTICATED DASHBOARD
      ================================== */}

      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <DashboardLayout />
          </PrivateRoute>
        }
      >
        {/* Dashboard home */}
        <Route
          index
          element={<DashboardHome />}
        />

        {/* Account settings */}
        <Route
          path="settings"
          element={<Settings />}
        />

        {/* Course management */}
        <Route
          path="add-course"
          element={
            <PrivateRoute>
              <AddCourse />
            </PrivateRoute>
          }
        />

        {/* Unknown dashboard pages */}
        <Route
          path="*"
          element={<Navigate to="/dashboard" replace />}
        />

      </Route>

      {/* ==================================
          MARKETING WEBSITE
      ================================== */}

      <Route
        path="/"
        element={<MarketingLayout />}
      >

        {/* Home */}
        <Route
          index
          element={<Home />}
        />

        {/* Authentication */}
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="forgot" element={<ForgotPassword />} />
        <Route path="reset-password" element={<ResetPassword />} />

        {/* Elementary */}
        <Route
          path="elementary"
          element={<ElementaryPage />}
        />

        <Route
          path="elementary/grade/:id"
          element={<ElementaryGradePage />}
        />

        {/* High School */}
        <Route
          path="highschool"
          element={<HighSchoolPage />}
        />

        <Route
          path="highschool/grade/:id"
          element={<HighSchoolGradePage />}
        />

        {/* University */}
        <Route
          path="university"
          element={<UniversityDashboard />}
        />

        <Route
          path="university/:name/department"
          element={<DepartmentBrowser />}
        />

        <Route
          path="university/:name/years"
          element={<YearSelection />}
        />

        <Route
          path="university/:name/courses"
          element={<CourseList />}
        />

        <Route
          path="university/:name/course/:courseId"
          element={<CourseDetail />}
        />

        <Route
          path="university/:name/content"
          element={<CourseContent />}
        />

        <Route
          path="university/:name/content/:courseId"
          element={<UniversityContent />}
        />

        <Route
          path="university/:name"
          element={<UniversityDetail />}
        />

        {/* Universities - Protected */}
        <Route
          path="universities"
          element={
            <PrivateRoute>
              <UniversitiesPage />
            </PrivateRoute>
          }
        />

        <Route
          path="universities/:universityName/levels"
          element={
            <PrivateRoute>
              <UniversityLevelPage />
            </PrivateRoute>
          }
        />

        <Route
          path="universities/:universityName/levels/:levelId"
          element={
            <PrivateRoute>
              <UniversityDepartmentPage />
            </PrivateRoute>
          }
        />

        <Route
          path="university/department/:type"
          element={<UniversityDepartmentPage />}
        />

        <Route
          path="university/:departmentId"
          element={
            <PrivateRoute>
              <YearSelection />
            </PrivateRoute>
          }
        />

        <Route
          path="university/:departmentId/:yearId"
          element={
            <PrivateRoute>
              <CourseList />
            </PrivateRoute>
          }
        />

        <Route
          path="university/:departmentId/:yearId/:courseId"
          element={
            <PrivateRoute>
              <CourseContent />
            </PrivateRoute>
          }
        />

        {/* Coding */}
        <Route
          path="coding"
          element={<CodingPage />}
        />

        {/* Existing admin pages */}
        <Route
          path="admin/dashboard"
          element={
            <PrivateRoute>
              <AdminDashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="admin/add-course"
          element={
            <PrivateRoute>
              <AddCourse />
            </PrivateRoute>
          }
        />

        {/* Not found */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Route>

    </Routes>
  );
}

// ========================================
// ROOT APPLICATION
// ========================================
export default function App() {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <div className="min-h-screen bg-slate-950 text-white">
        <AppRoutes />
      </div>
    </Router>
  );
}
