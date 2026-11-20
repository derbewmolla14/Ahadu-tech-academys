
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
import AboutUs from "./pages/AboutUs";
import ContactUs from "./pages/ContactUs";
import FAQ from "./pages/FAQ";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfUse from "./pages/TermsOfUse";
import DashboardHome from "./pages/dashboard/DashboardHome";
import Settings from "./pages/dashboard/Settings";

// School pages
import ElementaryPage from "./pages/ElementaryPage";
import ElementaryGradePage from "./pages/ElementaryGradePage";
import HighSchoolPage from "./pages/HighSchoolPage";
import HighSchoolGradePage from "./pages/HighSchoolGradePage";

// University pages

// Course pages

// Other pages
import CodingPage from "./pages/CodingPage";

// Admin pages
import AdminDashboard from "./pages/AdminDashboard";
import UniversityDepartmentsAdmin from "./pages/UniversityDepartmentsAdmin";
import PremiumCourseAccessAdmin from "./pages/PremiumCourseAccessAdmin";
import AddCourse from "./pages/AddCourse";
import UniversityFlow from "./pages/UniversityFlow";
import UniversityCourseContentPage from "./pages/UniversityCourseContentPage";
import UniversityLearningPage from "./pages/UniversityLearningPage";
import AdminUniversityResources from "./pages/AdminUniversityResources";
import AdminPaymentPricing from "./pages/AdminPaymentPricing";
import OfflineLibrary from "./pages/OfflineLibrary";
import ReferralDashboard from "./pages/ReferralDashboard";
import AdminReferrals from "./pages/AdminReferrals";

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

        <Route path="offline-library" element={<OfflineLibrary />} />
        <Route path="referrals" element={<ReferralDashboard />} />

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

        {/* Public information and support pages */}
        <Route path="about" element={<AboutUs />} />
        <Route path="contact" element={<ContactUs />} />
        <Route path="faq" element={<FAQ />} />
        <Route path="privacy" element={<PrivacyPolicy />} />
        <Route path="terms" element={<TermsOfUse />} />

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

        {/* New University flow: stream -> level -> department/course -> approved resources. */}
        <Route path="university" element={<UniversityFlow />} />
        <Route path="university/course/:courseId" element={<UniversityCourseContentPage />} />
        <Route path="university/masters/*" element={<UniversityLearningPage />} />
        <Route path="university/phd/*" element={<UniversityLearningPage />} />
        <Route path="university/*" element={<Navigate to="/university" replace />} />
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
          path="admin/university-resources"
          element={
            <PrivateRoute>
              <AdminUniversityResources />
            </PrivateRoute>
          }
        />

        <Route path="admin/payment-pricing" element={<PrivateRoute><AdminPaymentPricing /></PrivateRoute>} />
        <Route path="admin/referrals" element={<PrivateRoute><AdminReferrals /></PrivateRoute>} />

        <Route
          path="admin/premium-course-access"
          element={
            <PrivateRoute>
              <PremiumCourseAccessAdmin />
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
      <div className="app-shell min-h-screen">
        <AppRoutes />
      </div>
    </Router>
  );
}
