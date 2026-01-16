import PropTypes from 'prop-types'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.js'

export const ProtectedRoute = ({ allowedRoles, children }) => {
  const { user, isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (allowedRoles?.length) {
    const normalized = (user.role || '').toLowerCase()
    const allowed = allowedRoles.map((role) => role.toLowerCase())
    if (!allowed.includes(normalized)) {
      return <Navigate to="/" replace />
    }
  }

  return children
}

ProtectedRoute.propTypes = {
  allowedRoles: PropTypes.arrayOf(PropTypes.string),
  children: PropTypes.node.isRequired,
}

ProtectedRoute.defaultProps = {
  allowedRoles: undefined,
}


