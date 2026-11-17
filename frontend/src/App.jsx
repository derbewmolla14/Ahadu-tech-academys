
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
import UniversityLearningPage from "./pages/UniversityLearningPage";
import UniversityCourseContentPage from "./pages/UniversityCourseContentPage";

// Course pages
import YearSelection from "./pages/YearSelection";
import CourseList from "./pages/CourseList";
import CourseContent from "./pages/CourseContent";
import CourseDetail from "./pages/CourseDetail";

// Other pages
import CodingPage from "./pages/CodingPage";

// Admin pages
import AdminDashboard from "./pages/AdminDashboard";
import UniversityDepartmentsAdmin from "./pages/UniversityDepartmentsAdmin";
import PremiumCourseAccessAdmin from "./pages/PremiumCourseAccessAdmin";
import AdminContentApprovals from "./pages/AdminContentApprovals";
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

        {/* University - direct academic category navigation */}
        <Route
          path="university"
          element={<UniversityDashboard />}
        />
        <Route
          path="university/course/:courseId"
          element={<UniversityCourseContentPage />}
        />
        {/* Explicit category routes must take priority over the legacy /university/:name routes below. */}
        <Route path="university/natural-science/*" element={<UniversityLearningPage />} />
        <Route path="university/social-science/*" element={<UniversityLearningPage />} />
        <Route path="university/health-science/*" element={<UniversityLearningPage />} />
        <Route path="university/masters/*" element={<UniversityLearningPage />} />
        <Route path="university/phd/*" element={<UniversityLearningPage />} />

        {/* Legacy university-name and university-directory URLs now return to the direct stream flow. */}
        <Route path="university/:legacyUniversity/*" element={<Navigate to="/university" replace />} />
        <Route path="universities/*" element={<Navigate to="/university" replace />} />

        {/* Coding */}
        <Route
          path="coding"
          element={<CodingPage />}
        />

        {/* University department management */}
        <Route
          path="admin/university-departments"
          element={
            <PrivateRoute>
              <UniversityDepartmentsAdmin />
            </PrivateRoute>
          }
        />

        <Route
          path="admin/premium-course-access"
          element={
            <PrivateRoute>
              <PremiumCourseAccessAdmin />
            </PrivateRoute>
          }
        />
        <Route
          path="admin/content-approvals"
          element={
            <PrivateRoute>
              <AdminContentApprovals />
            </PrivateRoute>
          }
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
