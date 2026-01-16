import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useNavigate } from 'react-router-dom'
import { instructorService } from '../services/api.js'
import { DashboardSection } from '../components/dashboard/DashboardSection.jsx'
import { StatsGrid } from '../components/dashboard/StatsGrid.jsx'
import { CourseCard } from '../components/dashboard/CourseCard.jsx'
import { Button } from '../components/ui/button.jsx'
import { useToast } from '../hooks/useToast.js'
import { useAuth } from '../hooks/useAuth.js'
import { getInitials } from '../utils/formatters.js'
import { Wallet } from 'lucide-react'
import { AddBalanceModal } from '../components/common/AddBalanceModal.jsx'
import { UpdateProfileModal } from '../components/common/UpdateProfileModal.jsx'

export const InstructorDashboard = () => {
  const [activeTab, setActiveTab] = useState('courses')
  const [overview, setOverview] = useState({ courses: [], totalEarnings: 0 })
  const [pendingEnrollments, setPendingEnrollments] = useState([])
  const [transactions, setTransactions] = useState([])
  const [earningsBreakdown, setEarningsBreakdown] = useState([])
  const [loading, setLoading] = useState(true)
  const [approvalLoading, setApprovalLoading] = useState(false)
  const [balance, setBalance] = useState(0)
  const [showAddBalanceModal, setShowAddBalanceModal] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const { showToast } = useToast()
  const navigate = useNavigate()
  const { user } = useAuth()

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true)
      console.log('Fetching instructor dashboard data...')
      const [coursesPayload, earningsPayload, pendingPayload, transactionsPayload] = await Promise.all([
        instructorService.myCourses(),
        instructorService.earningsChart(),
        instructorService.pendingEnrollments(),
        instructorService.getTransactions(),
      ])
      console.log('Courses:', coursesPayload)
      console.log('Earnings:', earningsPayload)
      console.log('Pending:', pendingPayload)
      console.log('Transactions:', transactionsPayload)
      const coursesArray = Array.isArray(coursesPayload)
        ? coursesPayload
        : (coursesPayload?.courses || [])
      setOverview({
        courses: coursesArray,
        totalEarnings: coursesPayload?.totalEarnings || 0,
      })
      setEarningsBreakdown(earningsPayload || [])
      
      // Handle transactions - backend returns object, not array
      const transactionsArray = Array.isArray(transactionsPayload) 
        ? transactionsPayload 
        : (transactionsPayload ? [transactionsPayload] : [])
      
      // Process pending enrollments with transaction data
      const pendingWithTx = (pendingPayload || []).map(enrollment => {
        const transaction = transactionsArray.find(t => 
          (t.userId?._id === enrollment.student?._id || t.userId?._id === enrollment.userId?._id) && 
          (t.courseId?._id === enrollment.courseId?._id || t.courseId?._id === enrollment.courseId) &&
          t.status === 'pending'
        )
        return { ...enrollment, transaction }
      })
      setPendingEnrollments(pendingWithTx)
      setTransactions(transactionsArray)

      // Load balance
      try {
        const bankData = await instructorService.getBalance()
        setBalance(bankData?.balance ?? 0)
      } catch (err) {
        console.error('Failed to load balance:', err)
        setBalance(0)
      }
    } catch (err) {
      console.error('Dashboard error:', err)
      showToast({
        type: 'error',
        title: 'Unable to load dashboard',
        message: err.message,
      })
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])

  const handleApprove = async (courseId, studentId) => {
    try {
      setApprovalLoading(true)
      console.log('Approving enrollment:', { courseId, studentId })
      const response = await instructorService.approveEnrollment(courseId, studentId)
      console.log('Approval response:', response)
      showToast({
        type: 'success',
        title: 'Student approved',
        message: 'The student has been enrolled in the course and you received payment!',
      })
      // Refresh dashboard data
      await fetchDashboard()
    } catch (err) {
      console.error('Approval error:', err)
      showToast({
        type: 'error',
        title: 'Approval failed',
        message: err.response?.data?.message || err.message,
      })
    } finally {
      setApprovalLoading(false)
    }
  }

  const handleReject = async (courseId, studentId) => {
    try {
      setApprovalLoading(true)
      console.log('Rejecting enrollment:', { courseId, studentId })
      const response = await instructorService.rejectEnrollment(courseId, studentId)
      console.log('Rejection response:', response)
      showToast({
        type: 'success',
        title: 'Student rejected',
        message: 'The enrollment request has been rejected',
      })
      // Refresh dashboard data
      await fetchDashboard()
    } catch (err) {
      console.error('Rejection error:', err)
      showToast({
        type: 'error',
        title: 'Rejection failed',
        message: err.response?.data?.message || err.message,
      })
    } finally {
      setApprovalLoading(false)
    }
  }

  const stats = useMemo(() => {
    const activeCourses = overview.courses.length
    const totalLearners = overview.courses.reduce(
      (sum, course) => sum + (Array.isArray(course.studentsEnrolled) ? course.studentsEnrolled.length : 0),
      0,
    )
    return [
      { label: 'Live courses', value: activeCourses, format: 'number' },
      { label: 'Total learners', value: totalLearners, format: 'number' },
      { label: 'Lifetime earnings', value: overview.totalEarnings, format: 'currency' },
      { label: 'Pending approvals', value: pendingEnrollments.length, format: 'number' },
    ]
  }, [overview, pendingEnrollments])

  const PendingApprovalCard = ({ enrollment }) => (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {enrollment.student?.avatar ? (
            <img
              src={enrollment.student.avatar}
              alt={enrollment.student.fullname}
              className="h-12 w-12 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-br from-cyan-500 to-blue-600 text-sm font-semibold text-white">
              {getInitials(enrollment.student?.fullname || enrollment.student?.username || 'Student')}
            </div>
          )}
          <div>
            <p className="font-medium text-slate-900">
              {enrollment.student?.fullname || enrollment.student?.username}
            </p>
            <p className="text-sm text-slate-500">{enrollment.courseTitle}</p>
            <p className="text-xs text-slate-400">
              {new Date(enrollment.enrollmentDate).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              handleReject(
                enrollment.courseId?._id || enrollment.courseId, 
                enrollment.userId?._id || enrollment.userId || enrollment.student?._id
              )
            }
            disabled={approvalLoading}
          >
            Reject
          </Button>
          <Button
            size="sm"
            onClick={() =>
              handleApprove(
                enrollment.courseId?._id || enrollment.courseId, 
                enrollment.userId?._id || enrollment.userId || enrollment.student?._id
              )
            }
            disabled={approvalLoading}
          >
            Approve & Receive Payment
          </Button>
        </div>
      </div>
      
      {/* Transaction Details */}
      {enrollment.transaction && (
        <div className="border-t border-slate-100 pt-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Transaction Details</p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-slate-500">Total Amount</p>
              <p className="font-semibold text-slate-900">${enrollment.transaction.amount || 0}</p>
            </div>
            <div>
              <p className="text-slate-500">Your Share (80%)</p>
              <p className="font-semibold text-green-600">${((enrollment.transaction.amount || 0) * 0.8).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-slate-500">Admin Commission (20%)</p>
              <p className="font-semibold text-slate-600">${((enrollment.transaction.amount || 0) * 0.2).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-slate-500">Status</p>
              <span className="inline-flex rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
                {enrollment.transaction.status}
              </span>
            </div>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            By approving, you validate the transaction and receive ${((enrollment.transaction.amount || 0) * 0.8).toFixed(2)} to your account.
          </p>
        </div>
      )}
    </div>
  )

  if (loading) {
    return <div className="px-6 py-12 text-center text-slate-500">Loading instructor dashboard...</div>
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12 lg:flex-row">
      <aside className="flex flex-col gap-6 lg:w-72">
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-100 text-lg font-semibold text-cyan-800">
              {getInitials(user?.fullname || user?.username)}
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Profile</p>
              <p className="font-semibold text-slate-900">{user?.fullname}</p>
            </div>
          </div>
          <dl className="mt-5 space-y-2 text-sm text-slate-500">
            <div>
              <dt className="text-xs uppercase tracking-[0.2em] text-slate-400">Username</dt>
              <dd className="font-medium text-slate-900">{user?.username}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.2em] text-slate-400">Email</dt>
              <dd className="font-medium text-slate-900 wrap-break-word">{user?.email}</dd>
            </div>
          </dl>
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

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Launch a new cohort whenever you&apos;re ready.</p>
          <Button className="mt-4 w-full" onClick={() => navigate('/dashboard/instructor/new-course')}>
            New course
          </Button>
          <Button variant="outline" className="mt-2 w-full" onClick={fetchDashboard}>
            Refresh stats
          </Button>
        </div>
      </aside>

      <div className="flex-1 space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Instructor HQ</p>
            <h1 className="text-3xl font-semibold text-slate-900">Your teaching snapshot</h1>
            <p className="text-sm text-slate-500">Monitor course performance and launch new cohorts.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate('/dashboard/instructor/new-course')}>
              Launch course
            </Button>
            <Button onClick={fetchDashboard}>Refresh</Button>
          </div>
        </div>

        <StatsGrid stats={stats} />

        {/* Tabs */}
        <div className="border-b border-slate-200">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('courses')}
              className={`border-b-2 pb-3 text-sm font-medium transition-colors ${
                activeTab === 'courses'
                  ? 'border-cyan-600 text-cyan-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              My Courses ({overview.courses.length})
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`border-b-2 pb-3 text-sm font-medium transition-colors ${
                activeTab === 'pending'
                  ? 'border-cyan-600 text-cyan-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Pending Approvals ({pendingEnrollments.length})
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`border-b-2 pb-3 text-sm font-medium transition-colors ${
                activeTab === 'transactions'
                  ? 'border-cyan-600 text-cyan-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Transactions ({transactions.length})
            </button>
            <button
              onClick={() => setActiveTab('earnings')}
              className={`border-b-2 pb-3 text-sm font-medium transition-colors ${
                activeTab === 'earnings'
                  ? 'border-cyan-600 text-cyan-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Earnings
            </button>
          </div>
        </div>

        {/* Tab Content - My Courses */}
        {activeTab === 'courses' && (
          <DashboardSection title="Your courses" description="Track engagement and earnings per course.">
            {overview.courses.length ? (
              <div className="grid gap-4 md:grid-cols-2">
                {overview.courses.map((course) => (
                  <CourseCard
                    key={course._id}
                    course={{
                      ...course,
                      title: course.title,
                      description: course.description || 'No description',
                    }}
                    primaryLabel="Manage course"
                    meta={{
                      students: Array.isArray(course.studentsEnrolled) ? course.studentsEnrolled.length : 0,
                      earnings: course.earningsFromThisCourse || 0,
                    }}
                    onPrimary={() => navigate(`/dashboard/instructor/course/${course._id}`)}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No courses yet. Launch your first course today.</p>
            )}
          </DashboardSection>
        )}

        {/* Tab Content - Pending Approvals */}
        {activeTab === 'pending' && (
          <DashboardSection title="Pending Approvals" description="Review and approve student enrollment requests.">
            {pendingEnrollments.length > 0 ? (
              <div className="space-y-3">
                {pendingEnrollments.map((enrollment, index) => (
                  <PendingApprovalCard key={index} enrollment={enrollment} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No pending enrollment requests.</p>
            )}
          </DashboardSection>
        )}

        {/* Tab Content - Transactions */}
        {activeTab === 'transactions' && (
          <DashboardSection title="Transaction History" description="View all course purchase transactions and payment validations.">
            {transactions.length > 0 ? (
              <div className="space-y-3">
                {transactions.map((tx, index) => (
                  <div key={index} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-2">
                          <h4 className="font-semibold text-slate-900">
                            {tx.courseId?.title || 'Course'}
                          </h4>
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                            tx.status === 'approved' 
                              ? 'bg-green-100 text-green-800' 
                              : tx.status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {tx.status}
                          </span>
                        </div>
                        <p className="mb-1 text-sm text-slate-600">
                          Student: {tx.userId?.fullname || tx.userId?.username || 'Unknown'}
                        </p>
                        <p className="text-xs text-slate-400">
                          {new Date(tx.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-500">Total Amount</p>
                        <p className="text-2xl font-bold text-slate-900">${tx.amount}</p>
                        {tx.status === 'approved' && (
                          <>
                            <p className="mt-1 text-xs text-slate-500">Your Share</p>
                            <p className="text-lg font-semibold text-green-600">
                              ${(tx.amount * 0.8).toFixed(2)}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                    {tx.status === 'approved' && (
                      <div className="mt-3 border-t border-slate-100 pt-3">
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <p className="text-slate-500">Admin Commission (20%)</p>
                            <p className="font-medium text-slate-700">${(tx.amount * 0.2).toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-slate-500">Instructor Share (80%)</p>
                            <p className="font-medium text-green-600">${(tx.amount * 0.8).toFixed(2)}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No transactions yet.</p>
            )}
          </DashboardSection>
        )}

        {/* Tab Content - Earnings */}
        {activeTab === 'earnings' && (
          <DashboardSection title="Earnings insights" description="Understand which courses perform the best.">
            {earningsBreakdown.length ? (
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={earningsBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="title" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="totalEarning" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-sm text-slate-500">No earnings data yet.</p>
            )}
          </DashboardSection>
        )}
      </div>

      <AddBalanceModal
        isOpen={showAddBalanceModal}
        onClose={() => setShowAddBalanceModal(false)}
        onSuccess={async () => {
          try {
            const bankData = await instructorService.getBalance()
            setBalance(bankData?.balance ?? 0)
          } catch (err) {
            console.error('Failed to reload balance:', err)
          }
        }}
        addBalanceFunc={instructorService.addBalance}
      />

      <UpdateProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
    </div>
  )
}

