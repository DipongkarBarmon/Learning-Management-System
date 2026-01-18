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
        </div>
      </div>

      {/* Tab Content - All Courses */}
      {activeTab === 'courses' && (
        <DashboardSection title="All Courses" description="Complete list of courses on the platform.">
          {allCourses.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {allCourses.map((course, index) => (
                <div key={index} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md">
                  <div className="relative h-40 overflow-hidden">
                    {course.image ? (
                      <img 
                        src={course.image} 
                        alt={course.title} 
                        className="h-full w-full object-cover transition-transform group-hover:scale-105" 
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-cyan-500 to-blue-600">
                        <span className="text-4xl font-bold text-white/30">{course.title?.charAt(0) || 'C'}</span>
                      </div>
                    )}
                    <div className="absolute right-2 top-2">
                      <span className="rounded-full bg-white/90 px-3 py-1 text-lg font-bold text-slate-900 shadow-sm">
                        ${course.price}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h4 className="font-semibold text-slate-900 line-clamp-1">{course.title}</h4>
                    <p className="mt-1 text-sm text-slate-600 line-clamp-2">{course.description || 'No description'}</p>
                    <div className="mt-3 flex items-center gap-2">
                      {course.createdBy?.avatar ? (
                        <img 
                          src={course.createdBy.avatar} 
                          alt={course.createdBy.fullname} 
                          className="h-6 w-6 rounded-full object-cover" 
                        />
                      ) : (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-100 text-xs font-semibold text-purple-800">
                          {course.createdBy?.fullname?.charAt(0) || 'I'}
                        </div>
                      )}
                      <span className="text-sm text-slate-600">{course.createdBy?.fullname || 'Unknown'}</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        </svg>
                        {course.studentsEnrolled?.filter(s => s.status === 'approved').length || 0} enrolled
                      </span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5">{course.category || 'General'}</span>
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

      {/* Tab Content - All Transactions */}
      {activeTab === 'transactions' && (
        <DashboardSection title="All Platform Transactions" description="Complete transaction history across all courses.">
          {transactions.length > 0 ? (
            <div className="space-y-3">
              {transactions.map((tx, index) => (
                <div key={index} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <h4 className="font-semibold text-slate-900">
                          {tx.courseId?.title || tx.courseName || 'Course'}
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
                        <span className="font-medium">Student:</span> {tx.userId?.fullname || tx.userName || 'Unknown'} ({tx.userId?.email || tx.userEmail || ''})
                      </p>
                      <p className="mb-1 text-sm text-slate-600">
                        <span className="font-medium">Instructor:</span> {tx.instructorId?.fullname || tx.instructorName || 'Unknown'} ({tx.instructorId?.email || tx.instructorEmail || ''})
                      </p>
                      <p className="text-xs text-slate-400">
                        {new Date(tx.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-500">Total Amount</p>
                      <p className="text-2xl font-bold text-slate-900">${(tx.totalAmount || 0).toFixed(2)}</p>
                      {tx.status === 'approved' && (
                        <>
                          <p className="mt-1 text-xs text-slate-500">Admin Commission</p>
                          <p className="text-lg font-semibold text-purple-600">
                            ${(tx.adminCommission || 0).toFixed(2)}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                  {tx.status === 'approved' && (
                    <div className="mt-3 border-t border-slate-100 pt-3">
                      <div className="grid grid-cols-3 gap-3 text-xs">
                        <div>
                          <p className="text-slate-500">Total Amount</p>
                          <p className="font-medium text-slate-700">${(tx.totalAmount || 0).toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Admin Commission (20%)</p>
                          <p className="font-medium text-purple-600">${(tx.adminCommission || 0).toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Instructor Share (80%)</p>
                          <p className="font-medium text-green-600">${(tx.instructorShare || 0).toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  {tx.status === 'pending' && (
                    <div className="mt-3 border-t border-slate-100 pt-3">
                      <p className="text-xs italic text-yellow-700">
                        Waiting for instructor to validate and approve this enrollment.
                      </p>
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



