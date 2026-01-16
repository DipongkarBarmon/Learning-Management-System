export const currency = (amount = 0, currencyCode = 'USD') =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: 0,
  }).format(Number(amount || 0))

export const formatNumber = (value = 0) =>
  new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(Number(value || 0))

export const getInitials = (name = '') =>
  name
    .split(' ')
    .map((word) => word[0]?.toUpperCase())
    .slice(0, 2)
    .join('')

export const roleRoutes = {
  student: '/dashboard/learner',
  learner: '/dashboard/learner',
  instructor: '/dashboard/instructor',
  admin: '/dashboard/admin',
}


