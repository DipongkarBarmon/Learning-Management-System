import PropTypes from 'prop-types'
import { cn } from '../../utils/cn.js'

export const Card = ({ className, children }) => (
  <div className={cn('glass-panel rounded-2xl p-6', className)}>{children}</div>
)

Card.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
}

Card.defaultProps = {
  className: '',
}


