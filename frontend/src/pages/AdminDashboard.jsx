import { useEffect, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { adminService } from '../services/api.js'
import { DashboardSection } from '../components/dashboard/DashboardSection.jsx'
import { StatsGrid } from '../components/dashboard/StatsGrid.jsx'
import { currency } from '../utils/formatters.js'
import { Button } from '../components/ui/button.jsx'
import { Wallet } from 'lucide-react'
import { AddBalanceModal } from '../components/common/AddBalanceModal.jsx'
import { UpdateProfileModal } from '../components/common/UpdateProfileModal.jsx'
import api from '../services/api.js'

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [balance, setBalance] = useState(0)
  const [showAddBalanceModal, setShowAddBalanceModal] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [activeTab, setActiveTab] = useState('courses')
  const [transactions, setTransactions] = useState([])
  const [allCourses, setAllCourses] = useState([])
  const [allStudents, setAllStudents] = useState([])
  const [allInstructors, setAllInstructors] = useState([])
  const [platformStats, setPlatformStats] = useState({
    totalRevenue: 0,
    adminCommission: 0,
    pendingAmount: 0,
    approvedAmount: 0
  })

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        
        // Load all transactions from the system
        try {
          const allTransactions = await adminService.getAllTransactions()
          const transactionsArray = Array.isArray(allTransactions) ? allTransactions : []
          setTransactions(transactionsArray)
          
          // Calculate platform statistics
          const totalRev = transactionsArray.reduce((sum, tx) => sum + (tx.totalAmount || tx.amount || 0), 0)
          const adminComm = transactionsArray.reduce((sum, tx) => sum + (tx.adminCommission || 0), 0)
          const pending = transactionsArray
            .filter(tx => tx.status === 'pending')
            .reduce((sum, tx) => sum + (tx.totalAmount || tx.amount || 0), 0)
          const approved = transactionsArray
            .filter(tx => tx.status === 'approved')
            .reduce((sum, tx) => sum + (tx.totalAmount || tx.amount || 0), 0)
          
          setPlatformStats({
            totalRevenue: totalRev,
            adminCommission: adminComm,
            pendingAmount: pending,
            approvedAmount: approved
          })
        } catch (err) {
          console.warn('Transaction endpoint not available:', err.response?.status || err.message)
          // Backend endpoint doesn't exist yet - transactions view will show notice
          setTransactions([])
        }

        // Fetch all courses
        try {
          const allCoursesData = await adminService.getAllCourses()
          setAllCourses(Array.isArray(allCoursesData) ? allCoursesData : [])
        } catch (err) {
          console.error('Failed to load courses:', err)
          setAllCourses([])
        }

        // Fetch all users (students and instructors)
        try {
          const allUsers = await adminService.getAllUsers()
          const usersArray = Array.isArray(allUsers) ? allUsers : []
          setAllStudents(usersArray.filter(u => u.role === 'student'))
          setAllInstructors(usersArray.filter(u => u.role === 'instructor'))
        } catch (err) {
          console.warn('All users endpoint not available:', err.response?.status || err.message)
          setAllStudents([])
          setAllInstructors([])
        }

        const data = await adminService.stats()
        setStats(data)

        // Load balance
        try {
          const bankData = await adminService.getBalance()
          setBalance(bankData?.balance ?? 0)
        } catch (err) {
          console.error('Failed to load balance:', err)
          setBalance(0)
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return <div className="px-6 py-12 text-center text-slate-500">Loading admin dashboard...</div>
  }

  if (error) {
    return (
      <div className="px-6 py-12 text-center text-orange-800">
        {error}
      </div>
    )
  }

  const overview = stats?.overview || {}

  const pendingTransactions = transactions.filter(tx => tx.status === 'pending')
  const approvedTransactions = transactions.filter(tx => tx.status === 'approved')
  const rejectedTransactions = transactions.filter(tx => tx.status === 'rejected')

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="mt-1 text-slate-500">LMS Organization - Platform overview and transaction management</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => setShowProfileModal(true)}
          >
            Update Profile
          </Button>
        </div>
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 px-6 py-4">
          <div className="flex items-center gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-emerald-700">Organization Wallet</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">${balance.toFixed(2)}</p>
            </div>
            <Wallet className="h-8 w-8 text-emerald-600" />
          </div>
          <Button
            size="sm"
            className="mt-3 w-full bg-emerald-600 hover:bg-emerald-700"
            onClick={() => setShowAddBalanceModal(true)}
          >
            Add Balance
          </Button>
        </div>
      </div>

      <StatsGrid
        stats={[
          { label: 'Total Courses', value: allCourses.length, format: 'number' },
          { label: 'Total Students', value: allStudents.length, format: 'number' },
          { label: 'Total Instructors', value: allInstructors.length, format: 'number' },
          { label: 'Admin Wallet Balance', value: balance, format: 'currency' },
        ]}
      />

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
            All Courses ({allCourses.length})
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`border-b-2 pb-3 text-sm font-medium transition-colors ${
              activeTab === 'students'
                ? 'border-cyan-600 text-cyan-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Students ({allStudents.length})
          </button>
          <button
            onClick={() => setActiveTab('instructors')}
            className={`border-b-2 pb-3 text-sm font-medium transition-colors ${
              activeTab === 'instructors'
                ? 'border-cyan-600 text-cyan-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Instructors ({allInstructors.length})
          </button>
        </div>
      </div>

      {/* Tab Content - All Courses */}
      {activeTab === 'courses' && (
        <DashboardSection title="All Courses" description="Complete list of courses on the platform.">
          {allCourses.length > 0 ? (
            <div className="space-y-3">
              {allCourses.map((course, index) => (
                <div key={index} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                      {course.image && (
                        <img src={course.image} alt={course.title} className="h-16 w-24 rounded-lg object-cover" />
                      )}
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900">{course.title}</h4>
                        <p className="mt-1 text-sm text-slate-600">{course.description?.substring(0, 100)}...</p>
                        <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
                          <span>Category: {course.category || 'N/A'}</span>
                          <span>•</span>
                          <span>Level: {course.level || 'N/A'}</span>
                          <span>•</span>
                          <span>Enrolled: {course.studentsEnrolled?.length || 0}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-slate-900">${course.price}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        Instructor: {course.createdBy?.fullname || 'Unknown'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6 text-center">
              <p className="mb-2 font-semibold text-blue-900">Course List Not Available</p>
              <p className="text-sm text-blue-700">
                Courses are being fetched from <code className="rounded bg-blue-100 px-2 py-1 text-xs">/api/v1/instructor/all-course</code> and <code className="rounded bg-blue-100 px-2 py-1 text-xs">/api/v1/student/public-courses</code>.
              </p>
              <p className="mt-2 text-xs text-blue-600">
                If you're seeing this, the endpoints returned no data or failed to load.
              </p>
            </div>
          )}
        </DashboardSection>
      )}

      {/* Tab Content - All Students */}
      {activeTab === 'students' && (
        <DashboardSection title="All Students" description="Complete list of registered students.">
          {allStudents.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {allStudents.map((student, index) => (
                <div key={index} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    {student.avatar ? (
                      <img src={student.avatar} alt={student.fullname} className="h-12 w-12 rounded-full object-cover" />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-800 font-semibold">
                        {student.fullname?.charAt(0) || student.username?.charAt(0) || 'S'}
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">{student.fullname}</p>
                      <p className="text-sm text-slate-600">{student.email}</p>
                      <p className="text-xs text-slate-400">@{student.username}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6 text-center">
              <p className="mb-2 font-semibold text-blue-900">Student List Not Available</p>
              <p className="text-sm text-blue-700">
                The backend endpoint <code className="rounded bg-blue-100 px-2 py-1 text-xs">/api/v1/user/all-users</code> needs to be implemented to view all students.
              </p>
            </div>
          )}
        </DashboardSection>
      )}

      {/* Tab Content - All Instructors */}
      {activeTab === 'instructors' && (
        <DashboardSection title="All Instructors" description="Complete list of registered instructors.">
          {allInstructors.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {allInstructors.map((instructor, index) => (
                <div key={index} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    {instructor.avatar ? (
                      <img src={instructor.avatar} alt={instructor.fullname} className="h-12 w-12 rounded-full object-cover" />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-800 font-semibold">
                        {instructor.fullname?.charAt(0) || instructor.username?.charAt(0) || 'I'}
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">{instructor.fullname}</p>
                      <p className="text-sm text-slate-600">{instructor.email}</p>
                      <p className="text-xs text-slate-400">@{instructor.username}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6 text-center">
              <p className="mb-2 font-semibold text-blue-900">Instructor List Not Available</p>
              <p className="text-sm text-blue-700">
                The backend endpoint <code className="rounded bg-blue-100 px-2 py-1 text-xs">/api/v1/user/all-users</code> needs to be implemented to view all instructors.
              </p>
            </div>
          )}
        </DashboardSection>
      )}

      {/* Tab Content - Pending Transactions */}
      {activeTab === 'pending' && (
        <DashboardSection 
          title="Pending Transactions" 
          description="Transactions awaiting instructor validation. Money is currently held in admin wallet."
        >
          {transactions.length === 0 ? (
            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6 text-center">
              <p className="mb-2 font-semibold text-blue-900">Transaction Monitoring Not Available</p>
              <p className="text-sm text-blue-700">
                The backend endpoint <code className="rounded bg-blue-100 px-2 py-1 text-xs">/api/v1/bank/all-transactions</code> needs to be implemented to view platform-wide transactions.
              </p>
              <p className="mt-3 text-xs text-blue-600">
                Admin can track their wallet balance above. Transactions are processed when instructors approve enrollments.
              </p>
            </div>
          ) : pendingTransactions.length > 0 ? (
            <div className="space-y-3">
              {pendingTransactions.map((tx, index) => (
                <div key={index} className="rounded-2xl border border-yellow-200 bg-yellow-50 p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <h4 className="font-semibold text-slate-900">
                          {tx.courseName || tx.courseId?.title || 'Course'}
                        </h4>
                        <span className="inline-flex rounded-full bg-yellow-200 px-2 py-0.5 text-xs font-medium text-yellow-800">
                          PENDING VALIDATION
                        </span>
                      </div>
                      <p className="mb-1 text-sm text-slate-600">
                        Student: {tx.userName || tx.userId?.fullname || tx.userId?.username || 'Unknown'}
                      </p>
                      <p className="mb-1 text-sm text-slate-600">
                        Instructor: {tx.instructorName || tx.instructorId?.fullname || 'Unknown'}
                      </p>
                      <p className="text-xs text-slate-400">
                        {new Date(tx.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-500">Held Amount</p>
                      <p className="text-2xl font-bold text-slate-900">${tx.amount}</p>
                      <div className="mt-2 text-xs text-slate-600">
                        <p>→ Instructor (80%): ${(tx.amount * 0.8).toFixed(2)}</p>
                        <p>→ Admin (20%): ${(tx.amount * 0.2).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                  <p className="mt-3 text-xs italic text-yellow-700">
                    Waiting for instructor to validate and approve this enrollment.
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No pending transactions.</p>
          )}
        </DashboardSection>
      )}

      {/* Tab Content - All Transactions */}
      {activeTab === 'all-transactions' && (
        <DashboardSection title="All Platform Transactions" description="Complete transaction history across the platform.">
          {transactions.length === 0 ? (
            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6 text-center">
              <p className="mb-2 font-semibold text-blue-900">Transaction History Not Available</p>
              <p className="text-sm text-blue-700">
                The backend endpoint <code className="rounded bg-blue-100 px-2 py-1 text-xs">/api/v1/bank/all-transactions</code> needs to be implemented to view platform-wide transactions.
              </p>
              <p className="mt-3 text-xs text-blue-600">
                Monitor your admin wallet balance above. When instructors approve student enrollments:
              </p>
              <ul className="mt-2 space-y-1 text-left text-xs text-blue-600">
                <li>• Student payment enters admin wallet</li>
                <li>• 80% transfers to instructor upon approval</li>
                <li>• 20% commission stays in admin wallet</li>
              </ul>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx, index) => (
                <div key={index} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <h4 className="font-semibold text-slate-900">
                          {tx.courseName || tx.courseId?.title || 'Course'}
                        </h4>
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          tx.status === 'approved' 
                            ? 'bg-green-100 text-green-800' 
                            : tx.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {tx.status?.toUpperCase()}
                        </span>
                      </div>
                      <p className="mb-1 text-sm text-slate-600">
                        Student: {tx.userName || tx.userId?.fullname || tx.userId?.username || 'Unknown'}
                      </p>
                      <p className="mb-1 text-sm text-slate-600">
                        Instructor: {tx.instructorName || tx.instructorId?.fullname || 'Unknown'}
                      </p>
                      <p className="text-xs text-slate-400">
                        {new Date(tx.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-500">Amount</p>
                      <p className="text-2xl font-bold text-slate-900">${tx.amount}</p>
                      {tx.status === 'approved' && (
                        <div className="mt-2 space-y-1 text-xs">
                          <p className="text-green-600">Instructor: ${tx.instructorShare?.toFixed(2) || (tx.amount * 0.8).toFixed(2)}</p>
                          <p className="text-purple-600">Admin: ${tx.adminCommission?.toFixed(2) || (tx.amount * 0.2).toFixed(2)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DashboardSection>
      )}

      <AddBalanceModal
        isOpen={showAddBalanceModal}
        onClose={() => setShowAddBalanceModal(false)}
        onSuccess={async () => {
          try {
            const bankData = await adminService.getBalance()
            setBalance(bankData?.balance ?? 0)
          } catch (err) {
            console.error('Failed to reload balance:', err)
          }
        }}
        addBalanceFunc={adminService.addBalance}
      />

      <UpdateProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
    </div>
  )
}



