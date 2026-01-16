import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { learnerService } from '../services/api.js'
import { Button } from '../components/ui/button.jsx'
import { Badge } from '../components/ui/badge.jsx'
import { PurchaseCourseModal } from '../components/learner/PurchaseCourseModal.jsx'
import { useToast } from '../hooks/useToast.js'
import { currency } from '../utils/formatters.js'

export const LearnerBuyCoursePage = () => {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const { showToast } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const list = await learnerService.buyableCourses()
        setCourses(Array.isArray(list) ? list : [])
      } catch (err) {
        showToast({
          type: 'error',
          title: 'Unable to fetch courses',
          message: err.message,
        })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [showToast])

  const handleOpenModal = (course) => {
    setSelected(course)
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setSelected(null)
  }

  const handleSuccess = () => {
    handleCloseModal()
    navigate('/dashboard/learner', { replace: true })
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="rounded-3xl border border-slate-100 bg-white px-6 py-8 shadow-sm">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Marketplace</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Courses you can unlock now</h1>
        <p className="mt-2 text-sm text-slate-500">
          This list hides anything you already purchased. Pick a course and enroll instantly using the banking
          window.
        </p>
      </div>

      {loading ? (
        <div className="mt-10 text-center text-slate-500">Loading buyable courses...</div>
      ) : courses.length ? (
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {courses.map((course) => (
            <div key={course._id} className="rounded-3xl border border-slate-100 bg-white shadow-sm overflow-hidden">
              {/* Course thumbnail */}
              {course.image && (
                <div className="h-40 w-full bg-slate-100">
                  <img src={course.image} alt={course.title} className="h-full w-full object-cover" />
                </div>
              )}
              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                      By{' '}
                      {course.instructor?.name ||
                        course.instructor?.fullName ||
                        course.instructor?.username ||
                        'Instructor'}
                    </p>
                    <h3 className="text-xl font-semibold text-slate-900">{course.title}</h3>
                    <p className="mt-1 text-sm text-slate-500 line-clamp-3">{course.description}</p>
                  </div>
                  <Badge variant="outline">{course.totalVideos || 0} lessons</Badge>
                </div>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-4 text-sm text-slate-500">
                  <span>
                    <span className="text-xs uppercase tracking-[0.2em] text-slate-400">Tuition</span>
                    <div className="text-xl font-semibold text-slate-900">{currency(course.price)}</div>
                  </span>
                  <span>
                    <span className="text-xs uppercase tracking-[0.2em] text-slate-400">Enrolled</span>
                    <div className="text-xl font-semibold text-slate-900">{course.enrolledStudents || 0}</div>
                  </span>
                </div>
                <Button className="mt-6 w-full" onClick={() => handleOpenModal(course)}>
                  Enroll now
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-12 rounded-3xl border border-dashed border-slate-200 bg-white p-10 text-center">
          <h3 className="text-xl font-semibold text-slate-900">You already own every course</h3>
          <p className="mt-2 text-sm text-slate-500">Visit your library to continue learning.</p>
          <Button className="mt-6" onClick={() => navigate('/dashboard/learner/courses')}>
            Go to My Courses
          </Button>
        </div>
      )}

      <PurchaseCourseModal
        course={selected}
        open={modalOpen}
        onClose={handleCloseModal}
        onSuccess={handleSuccess}
      />
    </div>
  )
}


