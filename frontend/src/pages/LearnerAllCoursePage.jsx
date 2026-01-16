import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { learnerService } from '../services/api.js'
import { CourseCard } from '../components/dashboard/CourseCard.jsx'
import { Button } from '../components/ui/button.jsx'
import { useToast } from '../hooks/useToast.js'

export const LearnerAllCoursePage = () => {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const { showToast } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const data = await learnerService.myCourses()
        setCourses(Array.isArray(data) ? data : [])
      } catch (err) {
        showToast({
          type: 'error',
          title: 'Unable to load your courses',
          message: err.message,
        })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [showToast])

  const filtered = useMemo(() => {
    if (filter === 'completed') {
      return courses.filter((course) => (course.status || '').toLowerCase() === 'completed')
    }
    if (filter === 'active') {
      return courses.filter((course) => (course.status || '').toLowerCase() !== 'completed')
    }
    return courses
  }, [courses, filter])

  if (loading) {
    return <div className="px-6 py-12 text-center text-slate-500">Loading your library...</div>
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">My library</p>
          <h1 className="text-3xl font-semibold text-slate-900">All enrolled courses</h1>
        </div>
        <div className="flex gap-2">
          <Button variant={filter === 'all' ? 'default' : 'outline'} onClick={() => setFilter('all')}>
            All
          </Button>
          <Button
            variant={filter === 'active' ? 'default' : 'outline'}
            onClick={() => setFilter('active')}
          >
            In progress
          </Button>
          <Button
            variant={filter === 'completed' ? 'default' : 'outline'}
            onClick={() => setFilter('completed')}
          >
            Completed
          </Button>
        </div>
      </div>

      {filtered.length ? (
        <div className="mt-8 grid items-stretch gap-5 md:grid-cols-2">
          {filtered.map((course) => (
            <CourseCard
              key={course._id || course.courseId}
              course={course}
              onPrimary={() => navigate(`/dashboard/learner/course/${course._id || course.courseId}`)}
              primaryLabel="Open course"
            />
          ))}
        </div>
      ) : (
        <div className="mt-12 rounded-3xl border border-dashed border-slate-200 bg-white p-10 text-center">
          <h2 className="text-xl font-semibold text-slate-900">No courses in this view</h2>
          <p className="mt-2 text-sm text-slate-500">
            Enroll in a course or change the filter to see more results.
          </p>
          <Button className="mt-6" onClick={() => navigate('/#courses')}>
            Browse catalog
          </Button>
        </div>
      )}
    </div>
  )
}


