import PropTypes from 'prop-types'
import { cn } from '../../utils/cn.js'

export const Textarea = ({ className, ...props }) => (
  <textarea
    className={cn(
      'block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200',
      className,
    )}
    {...props}
  />
)

Textarea.propTypes = {
  className: PropTypes.string,
}

Textarea.defaultProps = {
  className: '',
}


