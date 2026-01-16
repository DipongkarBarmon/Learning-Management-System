import PropTypes from 'prop-types'
import { cn } from '../../utils/cn.js'

export const Label = ({ className, children, htmlFor }) => (
  <label
    className={cn('text-sm font-medium text-slate-600', className)}
    htmlFor={htmlFor}
  >
    {children}
  </label>
)

Label.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
  htmlFor: PropTypes.string,
}

Label.defaultProps = {
  className: '',
  htmlFor: undefined,
}


