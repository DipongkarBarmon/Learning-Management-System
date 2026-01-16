import PropTypes from 'prop-types'
import { Badge } from '../ui/badge.jsx'

export const ResourceList = ({ resources }) => (
  <div className="space-y-3">
    {resources.map((resource) => (
      <a
        key={resource.resourceId || resource.url}
        href={resource.url}
        target="_blank"
        rel="noreferrer"
        className="flex items-center justify-between rounded-xl border border-slate-100 bg-white px-4 py-3 text-sm text-slate-700 hover:border-indigo-200"
      >
        <div>
          <p className="font-medium text-slate-900">{resource.title}</p>
          <p className="text-xs text-slate-500">{resource.mediaType}</p>
        </div>
        <Badge variant="outline">Open</Badge>
      </a>
    ))}
  </div>
)

ResourceList.propTypes = {
  resources: PropTypes.arrayOf(PropTypes.object).isRequired,
}



