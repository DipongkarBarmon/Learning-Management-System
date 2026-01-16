import PropTypes from 'prop-types'
import { Button } from '../ui/button.jsx'
import { Progress } from '../ui/progress.jsx'
import { Badge } from '../ui/badge.jsx'
import { currency } from '../../utils/formatters.js'
import { BookOpen } from 'lucide-react'

export const CourseCard = ({ course, onPrimary, primaryLabel, meta }) => (
  <div className="flex h-full flex-col rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
    {/* Thumbnail */}
    <div className="relative h-32 w-full bg-slate-100">
      {course.image ? (
        <img src={course.image} alt={course.title} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-indigo-100 to-cyan-100">
          <BookOpen className="h-10 w-10 text-indigo-400" />
        </div>
      )}
      {course.status && (
        <Badge variant="outline" className="absolute top-2 right-2 bg-white/90">{course.status}</Badge>
      )}
    </div>
    <div className="flex flex-1 flex-col p-5">
      <div>
        <h4 className="text-lg font-semibold text-slate-900">{course.title}</h4>
        <p className="text-sm text-slate-500 line-clamp-2">
          {course.description || 'Details coming soon.'}
        </p>
      </div>
    {typeof course.progress_percentage === 'number' && (
      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Progress</span>
          <span>{course.progress_percentage}%</span>
        </div>
        <Progress value={course.progress_percentage} />
      </div>
    )}
    {meta && (
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-500">
        {meta.students !== undefined && (
          <div>
            <p className="text-slate-400">Students</p>
            <p className="font-semibold text-slate-900">{meta.students}</p>
          </div>
        )}
        {meta.earnings !== undefined && (
          <div>
            <p className="text-slate-400">Earnings</p>
            <p className="font-semibold text-slate-900">{currency(meta.earnings)}</p>
          </div>
        )}
      </div>
    )}
    <Button className="mt-auto w-full" onClick={() => onPrimary(course)}>
      {primaryLabel}
    </Button>
    </div>
  </div>
)

CourseCard.propTypes = {
  course: PropTypes.object.isRequired,
  onPrimary: PropTypes.func.isRequired,
  primaryLabel: PropTypes.string.isRequired,
  meta: PropTypes.shape({
    students: PropTypes.number,
    earnings: PropTypes.number,
  }),
}

CourseCard.defaultProps = {
  meta: null,
}

