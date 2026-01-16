import { Navigate, Route, Routes } from 'react-router-dom'
import { Header } from './components/layout/Header.jsx'
import { Footer } from './components/layout/Footer.jsx'
import { HomePage } from './pages/HomePage.jsx'
import { LoginPage } from './pages/LoginPage.jsx'
import { SignupPage } from './pages/SignupPage.jsx'
import { LearnerDashboard } from './pages/LearnerDashboard.jsx'
import { LearnerVideoPlayer } from './pages/LearnerVideoPlayer.jsx'
import { LearnerCoursePage } from './pages/LearnerCoursePage.jsx'
import { LearnerAllCoursePage } from './pages/LearnerAllCoursePage.jsx'
import { AllCoursesPage } from './pages/AllCoursesPage.jsx'
import { LearnerBuyCoursePage } from './pages/LearnerBuyCoursePage.jsx'
import { LearnerCertificatesPage } from './pages/LearnerCertificatesPage.jsx'
import { InstructorDashboard } from './pages/InstructorDashboard.jsx'
import { InstructorCoursePage } from './pages/InstructorCoursePage.jsx'
import { InstructorVideoPlayer } from './pages/InstructorVideoPlayer.jsx'
import { LaunchCoursePage } from './components/dashboard/LaunchCoursePage.jsx'
import { AdminDashboard } from './pages/AdminDashboard.jsx'
import { CoursePage } from './pages/CoursePage.jsx'
import { ProtectedRoute } from './components/common/ProtectedRoute.jsx'
import SupportPage from './pages/SupportPage.jsx'

function App() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/courses" element={<AllCoursesPage />} />
          <Route path="/support" element={<SupportPage />} />
          <Route path="/courses/:courseId" element={<CoursePage />} />

          <Route
            path="/dashboard/learner"
            element={
              <ProtectedRoute allowedRoles={['student', 'learner']}>
                <LearnerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/learner/courses"
            element={
              <ProtectedRoute allowedRoles={['student', 'learner']}>
                <LearnerAllCoursePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/learner/buy"
            element={
              <ProtectedRoute allowedRoles={['student', 'learner']}>
                <LearnerBuyCoursePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/learner/course/:courseId"
            element={
              <ProtectedRoute allowedRoles={['student', 'learner']}>
                <LearnerCoursePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/learner/certificates"
            element={
              <ProtectedRoute allowedRoles={['student', 'learner']}>
                <LearnerCertificatesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/learner/course/:courseId/video/:videoId"
            element={
              <ProtectedRoute allowedRoles={['student', 'learner']}>
                <LearnerVideoPlayer />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/instructor"
            element={
              <ProtectedRoute allowedRoles={['instructor']}>
                <InstructorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/instructor/course/:courseId"
            element={
              <ProtectedRoute allowedRoles={['instructor']}>
                <InstructorCoursePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/instructor/course/:courseId/video/:videoId"
            element={
              <ProtectedRoute allowedRoles={['instructor']}>
                <InstructorVideoPlayer />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/instructor/new-course"
            element={
              <ProtectedRoute allowedRoles={['instructor']}>
                <LaunchCoursePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
