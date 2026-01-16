import PropTypes from 'prop-types'
import { cn } from '../../utils/cn'

export const CircularProgress = ({
  value,
  className,
  size = 100,
  strokeWidth = 10,
}) => {
  const num = Number(value || 0)
  const percent = num > 1 ? num : num > 0 ? num * 100 : 0
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percent / 100) * circumference

  return (
    <div
      className={cn('relative flex items-center justify-center', className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="absolute">
        <circle
          className="text-slate-200"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className="text-cyan-700"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: offset,
            transition: 'stroke-dashoffset 0.35s',
            transform: 'rotate(-90deg)',
            transformOrigin: '50% 50%',
          }}
          strokeLinecap="round"
        />
      </svg>
      <span className="text-xl font-semibold text-slate-700">{`${Math.round(percent)}%`}</span>
    </div>
  )
}

CircularProgress.propTypes = {
  value: PropTypes.number.isRequired,
  className: PropTypes.string,
  size: PropTypes.number,
  strokeWidth: PropTypes.number,
}
