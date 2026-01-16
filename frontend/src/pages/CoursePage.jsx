import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { courseService } from '../services/api.js'
import { Button } from '../components/ui/button.jsx'
import { Badge } from '../components/ui/badge.jsx'
import { currency } from '../utils/formatters.js'
import { useAuth } from '../hooks/useAuth.js'
import { useToast } from '../hooks/useToast.js'
import { PurchaseCourseModal } from '../components/learner/PurchaseCourseModal.jsx'

export const CoursePage = () => {
  const { courseId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const { showToast } = useToast()
  const previewCourse = useMemo(() => location.state?.preview, [location.state])
  const [course, setCourse] = useState(previewCourse || null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(!course)
  const [purchaseOpen, setPurchaseOpen] = useState(false)

  // Fetch public details if not enrolled or just to get the curriculum list
  useEffect(() => {
    const loadDetail = async () => {
      try {
        setLoading(true)
        const list = await courseService.getAll()
        const found = (list || []).find((item) => item._id === courseId)
        setCourse(found || previewCourse || null)
      } catch (err) {
        console.error("Failed to fetch course details", err)
        setCourse(previewCourse || null)
      } finally {
        setLoading(false)
      }
    }
    
    if (!previewCourse) {
      loadDetail()
    }
  }, [courseId, previewCourse])

  useEffect(() => {
    const loadRelated = async () => {
      try {
        const trending = await courseService.getMostViewed(3)
        setRelated(trending || [])
      } catch (err) {
        console.error(err)
      }
    }
    loadRelated()
  }, [])

  const handleStart = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location } })
      return
    }
    if (user?.role === 'student') {
      setPurchaseOpen(true)
    } else {
      showToast({
        type: 'info',
        title: 'Learner only',
        message: 'Switch to your learner account to watch this course.',
      })
    }
  }

  const handlePurchaseSuccess = () => {
    setPurchaseOpen(false)
    navigate('/dashboard/learner', { replace: true })
  }

  if (loading) {
    return <div className="px-6 py-12 text-center text-slate-500">Loading course details...</div>
  }

  if (!course) {
    return (
      <div className="px-6 py-12 text-center text-slate-500">
        Course not found. Please go back to the catalog.
        <div className="mt-4">
          <Button onClick={() => navigate('/')}>Back home</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {/* Course thumbnail */}
        {course.image && (
          <div className="h-64 w-full bg-slate-100">
            <img src={course.image} alt={course.title} className="h-full w-full object-cover" />
          </div>
        )}
        <div className="p-8">
          <Badge variant="outline" className="mb-3">
            {course.totalVideos || 0} lessons
          </Badge>
          <h1 className="text-4xl font-semibold text-slate-900">{course.title}</h1>
          <p className="mt-4 max-w-3xl text-lg text-slate-600">{course.description}</p>
          <p className="mt-4 text-sm text-slate-500">
            Instructor:{' '}
            {course.instructor?.fullName ||
              course.instructor?.name ||
              course.instructor?.username ||
              'Instructor'}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Tuition</p>
              <p className="text-3xl font-semibold text-slate-900">{currency(course.price)}</p>
            </div>
            <Button className="min-w-[200px]" onClick={handleStart}>
              {isAuthenticated && user?.role === 'student' ? 'Buy course' : 'Start learning'}
            </Button>
            <Button variant="outline" onClick={() => navigate('/dashboard/learner/buy')}>
              Explore all buyable courses
            </Button>
          </div>
        </div>
      </div>

      {/* Syllabus Section */}
      {course.syllabus && course.syllabus.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-semibold text-slate-900 mb-6">Syllabus</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {course.syllabus.map((item, index) => (
              <div key={index} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 text-sm font-bold">
                    {index + 1}
                  </div>
                  <h3 className="font-semibold text-lg text-slate-800">{item.title}</h3>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed pl-11">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Curriculum Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-semibold text-slate-900 mb-6">Course Content</h2>
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
          {course.curriculum && course.curriculum.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {course.curriculum.map((video, index) => (
                <div key={video._id} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 text-sm font-medium">
                      {index + 1}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-700">{video.title}</span>
                      {video.isLocked && <span className="text-slate-400">🔒</span>}
                    </div>
                  </div>
                  <span className="text-sm text-slate-500">
                    {Math.floor(video.duration_seconds / 60)}:{String(video.duration_seconds % 60).padStart(2, '0')}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500">
              No curriculum details available.
            </div>
          )}
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-semibold text-slate-900">You may also like</h2>
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {related.map((item) => (
            <div
              key={item._id}
              className="rounded-2xl border border-slate-100 bg-white px-5 py-4 shadow-sm"
            >
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                {item.totalVideos || 0} lessons
              </p>
              <p className="mt-2 font-semibold text-slate-900">{item.title}</p>
              <p className="text-sm text-slate-500 line-clamp-3">{item.description}</p>
              <Button
                variant="ghost"
                className="mt-3 px-0 text-cyan-700 hover:text-cyan-800"
                onClick={() => navigate(`/courses/${item._id}`, { state: { preview: item } })}
              >
                View details
              </Button>
            </div>
          ))}
        </div>
      </div>

      <PurchaseCourseModal
        course={course}
        open={purchaseOpen}
        onClose={() => setPurchaseOpen(false)}
        onSuccess={handlePurchaseSuccess}
      />
    </div>
  )
}

