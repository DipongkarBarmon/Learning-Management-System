import PropTypes from 'prop-types'
import { cn } from '../../utils/cn.js'

export const Input = ({ className, ...props }) => (
  <input
    className={cn(
      'block w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200',
      className,
    )}
    {...props}
  />
)

Input.propTypes = {
  className: PropTypes.string,
}

Input.defaultProps = {
  className: '',
}


