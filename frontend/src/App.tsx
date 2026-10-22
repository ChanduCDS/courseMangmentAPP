import { Routes, Route, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'motion/react'
import { useAuthStore } from './store/hooks'
import { useCurrentUser } from './hooks/useAuth'
import Layout from './layouts/Layout'
import PublicLayout from './layouts/PublicLayout'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import ResetPasswordPage from './pages/auth/ResetPasswordPage'
import VerifyEmailPage from './pages/auth/VerifyEmailPage'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminCourses from './pages/admin/AdminCourses'
import AdminCourseDetail from './pages/admin/AdminCourseDetail'
import AdminCategories from './pages/admin/AdminCategories'
import AdminUsers from './pages/admin/AdminUsers'
import AdminEnrollments from './pages/admin/AdminEnrollments'
import AdminNotifications from './pages/admin/AdminNotifications'
import AdminAuditLogs from './pages/admin/AdminAuditLogs'
import InstructorDashboard from './pages/instructor/InstructorDashboard'
import InstructorCourses from './pages/instructor/InstructorCourses'
import StudentDashboard from './pages/student/StudentDashboard'
import StudentCourses from './pages/student/StudentCourses'
import StudentCourseDetail from './pages/student/StudentCourseDetail'
import StudentEnrollments from './pages/student/StudentEnrollments'
import ProfilePage from './pages/ProfilePage'
import SettingsPage from './pages/SettingsPage'
import NotFoundPage from './pages/NotFoundPage'
import LoadingSpinner from './components/ui/LoadingSpinner'
import { roleHome } from './utils'

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const { isAuthenticated, isLoading, user } = useAuthStore()
  const { isLoading: userLoading } = useCurrentUser()

  if (isLoading || (userLoading && !user)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && user && !allowedRoles.some(role => user.roles.includes(role))) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

function RoleRedirect() {
  const { user } = useAuthStore()
  return <Navigate to={roleHome(user?.roles)} replace />
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuthStore()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to={roleHome(user?.roles)} replace />
  }

  return <>{children}</>
}

function App() {
  return (
    <AnimatePresence mode="wait">
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="courses" element={<LandingPage />} />
          <Route path="features" element={<LandingPage />} />
          <Route path="about" element={<LandingPage />} />
          <Route
            path="login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="register"
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            }
          />
          <Route
            path="forgot-password"
            element={
              <PublicRoute>
                <ForgotPasswordPage />
              </PublicRoute>
            }
          />
          <Route
            path="reset-password"
            element={
              <PublicRoute>
                <ResetPasswordPage />
              </PublicRoute>
            }
          />
          <Route
            path="verify-email"
            element={
              <PublicRoute>
                <VerifyEmailPage />
              </PublicRoute>
            }
          />
        </Route>

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<RoleRedirect />} />
          
          {/* Admin routes */}
          <Route
            path="admin"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/courses"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminCourses />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/courses/:id"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminCourseDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/courses/new"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminCourseDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/categories"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminCategories />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/users"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/enrollments"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminEnrollments />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/notifications"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminNotifications />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/audit-logs"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminAuditLogs />
              </ProtectedRoute>
            }
          />

          {/* Instructor routes */}
          <Route
            path="instructor"
            element={
              <ProtectedRoute allowedRoles={['INSTRUCTOR', 'ADMIN']}>
                <InstructorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="instructor/courses"
            element={
              <ProtectedRoute allowedRoles={['INSTRUCTOR', 'ADMIN']}>
                <InstructorCourses />
              </ProtectedRoute>
            }
          />

          {/* Student routes */}
          <Route
            path="student"
            element={
              <ProtectedRoute allowedRoles={['STUDENT', 'ADMIN', 'INSTRUCTOR']}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="student/courses"
            element={
              <ProtectedRoute allowedRoles={['STUDENT', 'ADMIN', 'INSTRUCTOR']}>
                <StudentCourses />
              </ProtectedRoute>
            }
          />
          <Route
            path="student/courses/:id"
            element={
              <ProtectedRoute allowedRoles={['STUDENT', 'ADMIN', 'INSTRUCTOR']}>
                <StudentCourseDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="student/enrollments"
            element={
              <ProtectedRoute allowedRoles={['STUDENT', 'ADMIN', 'INSTRUCTOR']}>
                <StudentEnrollments />
              </ProtectedRoute>
            }
          />

          {/* Common routes */}
          <Route
            path="profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AnimatePresence>
  )
}

export default App