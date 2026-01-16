import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { courseService, learnerService } from '../services/api.js'
import { Button } from '../components/ui/button.jsx'
import { Badge } from '../components/ui/badge.jsx'
import { PurchaseCourseModal } from '../components/learner/PurchaseCourseModal.jsx'
import { useToast } from '../hooks/useToast.js'
import { useAuth } from '../hooks/useAuth.js'
import { currency } from '../utils/formatters.js'

export const AllCoursesPage = () => {
  const [courses, setCourses] = useState([])
  const [filteredCourses, setFilteredCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const { showToast } = useToast()
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const searchQuery = searchParams.get('search') || ''
  const [category, setCategory] = useState('All')
  const [sortBy, setSortBy] = useState('popular') // popular, price-low, price-high, new
  const [enrolledIds, setEnrolledIds] = useState(new Set())

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const list = await courseService.getAll()
        setCourses(Array.isArray(list) ? list : [])
        setFilteredCourses(Array.isArray(list) ? list : []) // Initialize filtered courses
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

  useEffect(() => {
    const loadEnrolled = async () => {
      if (isAuthenticated && user?.role === 'student') {
        try {
          const myCourses = await learnerService.myCourses()
          const ids = new Set((myCourses || []).map(c => c._id || c.courseId))
          setEnrolledIds(ids)
        } catch (err) {
          console.error('Failed to load enrolled courses', err)
        }
      }
    }
    loadEnrolled()
  }, [isAuthenticated, user])

  // Filter and Sort Logic
  useEffect(() => {
    let result = [...courses]

    // 1. Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(c =>
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.instructor?.fullName?.toLowerCase().includes(q)
      )
    }

    // 2. Category (Assuming category is part of title or description for now as we don't have a dedicated field,
    // OR we can filter by checking if the title contains the category keyword if we had categories.
    // Since we don't have a category field in the course model visible here, I'll skip category filter for now
    // or try to infer it. Let's stick to Search and Sort for now as per plan, but I'll add a dummy category filter UI)

    // 3. Sort
    if (sortBy === 'price-low') {
      result.sort((a, b) => a.price - b.price)
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => b.price - a.price)
    } else if (sortBy === 'new') {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    } else {
      // Popular (default) - by enrolledStudents
      result.sort((a, b) => (b.enrolledStudents || 0) - (a.enrolledStudents || 0))
    }

    setFilteredCourses(result)
  }, [courses, searchQuery, sortBy])

  const handleEnrollClick = (course) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/courses' } })
      return
    }
    // Open modal logic would go here if we had the modal state lifted or accessible
    // For now, let's assume we navigate to course page to buy
    navigate(`/courses/${course._id}`)
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">All Courses</h1>
          <p className="mt-2 text-slate-600">Explore our wide range of courses</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <select
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:border-cyan-500 focus:outline-none"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="popular">Most Popular</option>
            <option value="new">Newest</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </div>

      {searchQuery && (
        <div className="mb-6">
          <p className="text-slate-600">
            Showing results for <span className="font-semibold">"{searchQuery}"</span>
            {filteredCourses.length === 0 && " (No results found)"}
          </p>
          <Button variant="link" onClick={() => setSearchParams({})} className="px-0 text-cyan-700">
            Clear search
          </Button>
        </div>
      )}

      {loading ? (
        <div className="text-center text-slate-500">Loading courses...</div>
      ) : (
        <div className="grid items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course) => (
            <div
              key={course._id}
              className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
            >
              {/* Thumbnail */}
              <div className="relative aspect-video overflow-hidden bg-slate-100">
                {course.image ? (
                  <img
                    src={course.image}
                    alt={course.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-slate-400">
                    <span className="text-4xl">▶</span>
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  <Badge className="bg-white/90 text-slate-900 backdrop-blur-sm hover:bg-white">
                    {currency(course.price)}
                  </Badge>
                </div>
              </div>

              {/* Content */}
              <div className="flex flex-1 flex-col p-5">
                <div className="mb-3 flex items-center justify-between">
                  <Badge variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-200">
                    {course.totalVideos || 0} lessons
                  </Badge>
                  <div className="flex items-center gap-1 text-xs font-medium text-slate-500">
                    <span>★ 4.8</span>
                    <span className="text-slate-300">•</span>
                    <span>{course.enrolledStudents || 0} students</span>
                  </div>
                </div>

                <h3 className="mb-2 text-lg font-bold text-slate-900 line-clamp-1">
                  {course.title}
                </h3>
                <p className="mb-4 text-sm text-slate-500 line-clamp-2">
                  {course.description}
                </p>

                <div className="mt-auto flex items-center gap-3 pt-4 border-t border-slate-100">
                  <div className="flex-1">
                    <p className="text-xs text-slate-400">Instructor</p>
                    <p className="text-sm font-medium text-slate-700 truncate">
                      {course.instructor?.fullName ||
                        course.instructor?.name ||
                        course.instructor?.username ||
                        'Instructor'}
                    </p>
                  </div>
                  <div className="w-32">
                    <Button
                      className={`w-full transition-colors shadow-lg ${enrolledIds.has(course._id)
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200 hover:shadow-emerald-300'
                        : 'bg-cyan-700 hover:bg-cyan-800 text-white shadow-cyan-200 hover:shadow-cyan-300'
                        }`}
                      onClick={() => enrolledIds.has(course._id)
                        ? navigate(`/dashboard/learner/course/${course._id}`)
                        : handleEnrollClick(course)
                      }
                    >
                      {enrolledIds.has(course._id) ? 'Continue' : 'Enroll'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
