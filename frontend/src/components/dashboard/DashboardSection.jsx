import PropTypes from 'prop-types'
import { cn } from '../../utils/cn.js'

export const DashboardSection = ({ title, description, action, children, className }) => (
  <section className={cn('space-y-4 rounded-3xl border border-white/40 bg-white/80 p-6', className)}>
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        {description && <p className="text-sm text-slate-500">{description}</p>}
      </div>
      {action}
    </div>
    <div>{children}</div>
  </section>
)

DashboardSection.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  action: PropTypes.node,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
}

DashboardSection.defaultProps = {
  description: null,
  action: null,
  className: '',
}



