import PropTypes from 'prop-types'
import { cn } from '../../utils/cn.js'

export const Progress = ({ value, className }) => {
  const normalized = (() => {
    const num = Number(value || 0)
    if (num > 1) return num
    if (num > 0 && num <= 1) return num * 100
    return 0
  })()

  return (
    <div className={cn('h-2 w-full rounded-full bg-slate-100', className)}>
      <div
        className="h-full rounded-full bg-linear-to-r from-cyan-600 via-blue-600 to-indigo-600 transition-all"
        style={{ width: `${Math.min(100, Math.max(0, normalized))}%` }}
      />
    </div>
  )
}

Progress.propTypes = {
  value: PropTypes.number,
  className: PropTypes.string,
}

Progress.defaultProps = {
  value: 0,
  className: '',
}


