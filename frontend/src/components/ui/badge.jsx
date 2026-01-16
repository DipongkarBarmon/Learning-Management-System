import PropTypes from 'prop-types'
import { cn } from '../../utils/cn.js'

export const Badge = ({ children, className = '', variant = 'default' }) => {
  const base =
    'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold'
  const variants = {
    default: 'bg-cyan-100 text-cyan-800',
    success: 'bg-emerald-100 text-emerald-700',
    warning: 'bg-amber-100 text-amber-800',
    outline: 'border border-cyan-200 text-cyan-700',
  }

  return <span className={cn(base, variants[variant], className)}>{children}</span>
}

Badge.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  variant: PropTypes.oneOf(['default', 'success', 'warning', 'outline']),
}


