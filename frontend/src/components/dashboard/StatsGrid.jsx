import PropTypes from 'prop-types'
import { currency, formatNumber } from '../../utils/formatters.js'

export const StatsGrid = ({ stats }) => (
  <div className="grid gap-4 md:grid-cols-3">
    {stats.map((stat) => (
      <div key={stat.label} className="rounded-2xl border border-slate-100 bg-white px-5 py-4 shadow-sm">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{stat.label}</p>
        <p className="mt-2 text-2xl font-semibold text-slate-900">
          {stat.format === 'currency'
            ? currency(stat.value)
            : formatNumber(stat.value)}
        </p>
        {stat.subtext && <p className="text-xs text-slate-400">{stat.subtext}</p>}
      </div>
    ))}
  </div>
)

StatsGrid.propTypes = {
  stats: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
      subtext: PropTypes.string,
      format: PropTypes.oneOf(['currency', 'number']),
    }),
  ).isRequired,
}



