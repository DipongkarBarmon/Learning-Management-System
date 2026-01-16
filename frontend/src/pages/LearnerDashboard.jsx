import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { learnerService, courseService } from '../services/api.js'
import { DashboardSection } from '../components/dashboard/DashboardSection.jsx'
import { StatsGrid } from '../components/dashboard/StatsGrid.jsx'
import { Button } from '../components/ui/button.jsx'
import { useToast } from '../hooks/useToast.js'
import { useAuth } from '../hooks/useAuth.js'
import { getInitials, currency } from '../utils/formatters.js'
import { CircularProgress } from '../components/ui/CircularProgress.jsx'
import { Clock, CheckCircle, AlertCircle, BookOpen, Wallet } from 'lucide-react'
import { AddBalanceModal } from '../components/common/AddBalanceModal.jsx'
import { BankSetupModal } from '../components/common/BankSetupModal.jsx'
import { UpdateProfileModal } from '../components/common/UpdateProfileModal.jsx'

const ContinueLearningCard = ({ course, onContinue }) => (
  <div className="relative flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg transition-transform hover:scale-[1.02]">
    {/* Thumbnail header */}
    {course.image && (
      <div className="h-32 w-full">
        <img src={course.image} alt={course.title} className="h-full w-full object-cover" />
      </div>
    )}
    <div className="flex-1 p-6">
      <p className="text-xs uppercase tracking-[0.3em] text-cyan-700">
        Continue where you left off
      </p>
      <h3 className="mt-2 text-2xl font-bold text-slate-900">{course.title}</h3>
      <p className="mt-1 text-sm text-slate-500">
        You are {Math.round(course.progress_percentage || 0)}% through this course.
      </p>
    </div>
    <div className="flex items-end justify-between p-6 pt-0">
      <CircularProgress value={course.progress_percentage || 0} size={80} strokeWidth={8} />
      <Button onClick={() => onContinue(course)}>Jump back in</Button>
    </div>
  </div>
)

const EnrolledCourseCard = ({ course, onContinue }) => (
  <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
    {course.image ? (
      <img src={course.image} alt={course.title} className="h-14 w-14 rounded-lg object-cover" />
    ) : (
      <CircularProgress value={course.progress_percentage || 0} size={56} strokeWidth={6} />
    )}
    <div className="flex-1">
      <h4 className="font-semibold text-slate-800">{course.title}</h4>
      <p className="text-sm text-slate-500">{course.instructorName}</p>
      {course.image && (
        <p className="text-xs text-indigo-600">{Math.round(course.progress_percentage || 0)}% complete</p>
      )}
    </div>
    <Button size="sm" variant="outline" onClick={() => onContinue(course)}>
      {course.progress_percentage > 99 ? 'Revisit' : 'Continue'}
    </Button>
  </div>
)

const PendingCourseCard = ({ course }) => (
  <div className="flex items-center gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
    {course.image ? (
      <img src={course.image} alt={course.title} className="h-12 w-12 rounded-lg object-cover" />
    ) : (
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-200">
        <AlertCircle className="h-6 w-6 text-amber-700" />
      </div>
    )}
    <div className="flex-1">
      <h4 className="font-semibold text-slate-800">{course.title}</h4>
      <p className="text-sm text-amber-700">Waiting for instructor approval</p>
    </div>
    <span className="rounded-full bg-amber-200 px-3 py-1 text-xs font-medium text-amber-800">
      Pending
    </span>
  </div>
)

const AvailableCourseCard = ({ course, onEnroll }) => (
  <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
    {course.image && (
      <img src={course.image} alt={course.title} className="h-16 w-16 rounded-lg object-cover" />
    )}
    {!course.image && (
      <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-indigo-100">
        <BookOpen className="h-8 w-8 text-indigo-600" />
      </div>
    )}
    <div className="flex-1">
      <h4 className="font-semibold text-slate-800">{course.title}</h4>
      <p className="text-sm text-slate-500">{course.description?.substring(0, 60)}...</p>
      <p className="mt-1 text-sm font-medium text-indigo-600">{currency(course.price)}</p>
    </div>
    <Button size="sm" onClick={() => onEnroll(course)}>
      Enroll
    </Button>
  </div>
)

export const LearnerDashboard = () => {
  const [courses, setCourses] = useState([])
  const [pendingCourses, setPendingCourses] = useState([])
  const [availableCourses, setAvailableCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('enrolled') // 'enrolled', 'pending', 'available'
  const [balance, setBalance] = useState(0)
  const [showAddBalanceModal, setShowAddBalanceModal] = useState(false)
  const [showBankModal, setShowBankModal] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { user } = useAuth()

  // Check if user needs to set up bank info on first login
  useEffect(() => {
    if (user && (user.bankAccountCreated === false || user.bankAccountCreated === undefined)) {
      setShowBankModal(true)
    }
  }, [user])

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        // Load enrolled courses (approved)
        const enrolledData = await learnerService.myCourses()
        const sorted = (Array.isArray(enrolledData) ? enrolledData : []).sort(
          (a, b) => new Date(b.last_accessed_at) - new Date(a.last_accessed_at),
        )
        setCourses(sorted)

        // Load pending courses
        const pendingData = await learnerService.pendingCourses()
        setPendingCourses(Array.isArray(pendingData) ? pendingData : [])

        // Load available courses
        const availableData = await learnerService.buyableCourses()
        setAvailableCourses(Array.isArray(availableData) ? availableData.slice(0, 5) : [])

        // Load balance
        try {
          const bankData = await learnerService.getBalance()
          setBalance(bankData?.balance ?? 0)
        } catch (err) {
          console.error('Failed to load balance:', err)
          setBalance(0)
        }
      } catch (err) {
        showToast({
          type: 'error',
          title: 'Unable to load courses',
          message: err.message,
        })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [showToast])

  const { lastViewed, otherInProgress, completedCourses } = useMemo(() => {
    const inProgress = courses.filter(
      (course) => (course.status || '').toLowerCase() !== 'completed',
    )
    const completed = courses.filter(
      (course) => (course.status || '').toLowerCase() === 'completed',
    )

    return {
      lastViewed: inProgress[0] || null,
      otherInProgress: inProgress.slice(1),
      completedCourses: completed,
    }
  }, [courses])

  const stats = useMemo(() => {
    if (!courses.length) {
      return [
        { label: 'Enrolled Courses', value: 0, format: 'number' },
        { label: 'Completed', value: 0, format: 'number' },
        { label: 'Avg. Progress', value: 0, format: 'percent' },
      ]
    }
    const avgProgress =
      courses.reduce((sum, course) => sum + (course.progress_percentage || 0), 0) /
      courses.length
    return [
      { label: 'Enrolled Courses', value: courses.length, format: 'number' },
      { label: 'Completed', value: completedCourses.length, format: 'number' },
      { label: 'Avg. Progress', value: avgProgress, format: 'percent' },
    ]
  }, [courses, completedCourses])

  const handleContinueCourse = (course) => {
    // If a specific video was last watched, go there, otherwise go to the course page
    const id = course._id || course.courseId
    const url = course.last_watched_video_id
      ? `/dashboard/learner/course/${id}/video/${course.last_watched_video_id}`
      : `/dashboard/learner/course/${id}`
    navigate(url)
  }

  const handleBalanceAdded = async () => {
    try {
      const bankData = await learnerService.getBalance()
      setBalance(bankData?.balance ?? 0)
    } catch (err) {
      console.error('Failed to reload balance:', err)
    }
  }

  if (loading) {
    return <div className="px-6 py-12 text-center text-slate-500">Loading your dashboard...</div>
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-12 lg:flex-row">
      {/* Left Sidebar */}
      <aside className="flex flex-col gap-6 lg:w-80">
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            {user?.avatar ? (
              <img 
                src={user.avatar} 
                alt={user?.fullname || user?.fullName || user?.userName}
                className="h-14 w-14 rounded-2xl object-cover"
              />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-100 text-lg font-semibold text-cyan-800">
                {getInitials(user?.fullname || user?.fullName || user?.userName)}
              </div>
            )}
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Learner</p>
              <p className="font-semibold text-slate-900">{user?.fullname || user?.fullName || user?.userName}</p>
            </div>
          </div>
          <Button
            variant="outline"
            className="mt-4 w-full"
            onClick={() => setShowProfileModal(true)}
          >
            Update Profile
          </Button>
        </div>

        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-emerald-700">Your Wallet</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">${balance.toFixed(2)}</p>
            </div>
            <Wallet className="h-10 w-10 text-emerald-600" />
          </div>
          <Button
            className="mt-4 w-full bg-emerald-600 hover:bg-emerald-700"
            onClick={() => setShowAddBalanceModal(true)}
          >
            Add Balance
          </Button>
        </div>

        <div className="rounded-3xl border border-cyan-200 bg-cyan-50 p-6 text-slate-900">
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-700">Expand your skills</p>
          <h3 className="mt-2 text-xl font-semibold">Discover new courses</h3>
          <p className="mt-2 text-sm text-cyan-800">
            Browse our catalog and find your next learning adventure.
          </p>
          <Button className="mt-4 w-full" onClick={() => navigate('/dashboard/learner/buy')}>
            Explore Courses
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 space-y-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">Welcome back!</h1>
            <p className="mt-1 text-slate-500">
              Your learning journey is looking great. Let&apos;s keep the momentum going.
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate('/dashboard/learner/certificates')}>
            View certificates
          </Button>
        </div>

        <StatsGrid stats={stats} />

        {/* Tabs */}
        <div className="flex gap-2 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('enrolled')}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'enrolled'
                ? 'border-b-2 border-indigo-600 text-indigo-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            My Courses
            {courses.length > 0 && (
              <span className="ml-2 rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-600">
                {courses.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'pending'
                ? 'border-b-2 border-amber-600 text-amber-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pending Courses
            {pendingCourses.length > 0 && (
              <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-600">
                {pendingCourses.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('available')}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'available'
                ? 'border-b-2 border-emerald-600 text-emerald-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Available Courses
            {availableCourses.length > 0 && (
              <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-600">
                {availableCourses.length}
              </span>
            )}
          </button>
        </div>

        {/* Enrolled Courses Tab */}
        {activeTab === 'enrolled' && (
          <>
            {/* Continue Learning Section */}
            {lastViewed && (
              <div>
                <h2 className="mb-4 text-2xl font-bold text-slate-800">Continue Learning</h2>
                <ContinueLearningCard course={lastViewed} onContinue={handleContinueCourse} />
              </div>
            )}

            {/* Other In-Progress Courses */}
            {otherInProgress.length > 0 && (
              <DashboardSection
                title="Your Active Courses"
                description="Keep making progress in your other enrolled courses."
                icon={<Clock className="text-slate-500" />}
              >
                <div className="grid grid-cols-1 gap-4">
                  {otherInProgress.map((course) => (
                    <EnrolledCourseCard
                      key={course._id || course.courseId}
                      course={course}
                      onContinue={handleContinueCourse}
                    />
                  ))}
                </div>
              </DashboardSection>
            )}

            {/* Completed Courses */}
            {completedCourses.length > 0 && (
              <DashboardSection
                title="Completed Courses"
                description="Congratulations on your achievements!"
                icon={<CheckCircle className="text-emerald-500" />}
              >
                <div className="grid grid-cols-1 gap-4">
                  {completedCourses.map((course) => (
                    <EnrolledCourseCard
                      key={course._id || course.courseId}
                      course={course}
                      onContinue={handleContinueCourse}
                    />
                  ))}
                </div>
              </DashboardSection>
            )}

            {!courses.length && (
              <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center">
                <h3 className="text-xl font-semibold text-slate-800">No enrolled courses yet!</h3>
                <p className="mt-2 text-slate-500">
                  Browse available courses and start your learning journey.
                </p>
                <Button className="mt-6" onClick={() => setActiveTab('available')}>
                  View Available Courses
                </Button>
              </div>
            )}
          </>
        )}

        {/* Pending Courses Tab */}
        {activeTab === 'pending' && (
          <>
            {pendingCourses.length > 0 ? (
              <DashboardSection
                title="Pending Courses"
                description="These courses are waiting for instructor approval."
                icon={<AlertCircle className="text-amber-500" />}
              >
                <div className="grid grid-cols-1 gap-4">
                  {pendingCourses.map((course) => (
                    <PendingCourseCard key={course._id} course={course} />
                  ))}
                </div>
              </DashboardSection>
            ) : (
              <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center">
                <h3 className="text-xl font-semibold text-slate-800">No pending courses</h3>
                <p className="mt-2 text-slate-500">
                  You don&apos;t have any courses waiting for approval.
                </p>
              </div>
            )}
          </>
        )}

        {/* Available Courses Tab */}
        {activeTab === 'available' && (
          <>
            {availableCourses.length > 0 ? (
              <DashboardSection
                title="Available Courses"
                description="Explore new courses and expand your skills."
                icon={<BookOpen className="text-indigo-500" />}
                action={
                  <Button variant="outline" size="sm" onClick={() => navigate('/dashboard/learner/buy')}>
                    View All Courses
                  </Button>
                }
              >
                <div className="grid grid-cols-1 gap-4">
                  {availableCourses.map((course) => (
                    <AvailableCourseCard
                      key={course._id}
                      course={course}
                      onEnroll={() => navigate(`/courses/${course._id}`)}
                    />
                  ))}
                </div>
              </DashboardSection>
            ) : (
              <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center">
                <h3 className="text-xl font-semibold text-slate-800">No available courses</h3>
                <p className="mt-2 text-slate-500">
                  All courses have been enrolled. Check back later for new courses.
                </p>
              </div>
            )}
          </>
        )}
      </div>

      <AddBalanceModal
        isOpen={showAddBalanceModal}
        onClose={() => setShowAddBalanceModal(false)}
        onSuccess={handleBalanceAdded}
        addBalanceFunc={learnerService.addBalance}
      />

      <BankSetupModal
        isOpen={showBankModal}
        onClose={() => setShowBankModal(false)}
      />

      <UpdateProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
    </div>
  )
}

