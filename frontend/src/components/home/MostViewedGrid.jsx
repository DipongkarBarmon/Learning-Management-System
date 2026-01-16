import PropTypes from 'prop-types'
import { Button } from '../ui/button.jsx'
import { Badge } from '../ui/badge.jsx'
import { Progress } from '../ui/progress.jsx'
import { currency } from '../../utils/formatters.js'

export const MostViewedGrid = ({ courses, onSelectCourse, onViewAll, enrolledIds }) => (
  <section id="courses" className="mx-auto max-w-6xl px-6 py-12">
    <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Most Viewed</p>
        <h2 className="text-2xl font-semibold text-slate-900">Trending courses this week</h2>
      </div>
      <Button variant="ghost" className="font-semibold text-indigo-600" onClick={onViewAll}>
        View all
      </Button>
    </div>
    <div className="grid gap-5 md:grid-cols-3 items-stretch">
      {courses.map((course) => {
        const isEnrolled = enrolledIds?.has(course._id)
        return (
          <div key={course._id} className="glass-panel flex h-full flex-col rounded-3xl p-6 transition hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{course.title}</p>
                <h3 className="text-lg font-semibold text-slate-900">
                  {course.instructor?.fullName ||
                    course.instructor?.name ||
                    course.instructor?.username ||
                    'Instructor'}
                </h3>
              </div>
              <Badge variant="outline">{course.enrolledCount || course.enrolledStudents || 0} students</Badge>
            </div>
            <p className="mt-3 text-sm text-slate-500 line-clamp-3">{course.description}</p>
            <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
              <span>{currency(course.price)}</span>
              <span>{course.totalVideos || 0} lessons</span>
            </div>
            <div className="mt-4 space-y-2">
              <p className="text-xs text-slate-400">Engagement</p>
              <Progress value={Math.min(100, (course.enrolledCount || 0) / 10)} />
            </div>
            {isEnrolled ? (
              <Button className="mt-auto w-full bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => window.location.href = `/dashboard/learner/course/${course._id}`}>
                Continue Learning
              </Button>
            ) : (
              <Button className="mt-auto w-full" onClick={() => onSelectCourse(course)}>
                View Course
              </Button>
            )}
          </div>
        )
      })}
    </div>
  </section>
)

MostViewedGrid.propTypes = {
  courses: PropTypes.arrayOf(PropTypes.object).isRequired,
  onSelectCourse: PropTypes.func.isRequired,
  onViewAll: PropTypes.func,
  enrolledIds: PropTypes.object,
}

MostViewedGrid.defaultProps = {
  onViewAll: () => { },
}

