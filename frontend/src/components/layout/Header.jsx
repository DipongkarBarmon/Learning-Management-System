import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useMemo, useState, useEffect } from 'react'
import { Button } from '../ui/button.jsx'
import { useAuth } from '../../hooks/useAuth.js'
import { roleRoutes } from '../../utils/formatters.js'
import { cn } from '../../utils/cn.js'

const navLinks = [
  { label: 'Courses', to: '/courses' },
]

import { learnerService } from '../../services/api.js'

export const Header = () => {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [balance, setBalance] = useState(null)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (isAuthenticated && user?.accountNumber) {
      learnerService.getBalance()
        .then(data => setBalance(data.balance))
        .catch(err => console.error('Failed to fetch balance', err))
    }
  }, [isAuthenticated, user])

  const dashboardRoute = useMemo(() => {
    if (!user?.role) return '/login'
    return roleRoutes[user.role.toLowerCase()] || '/login'
  }, [user])

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300 border-b border-transparent",
        scrolled ? "bg-white/80 backdrop-blur-xl border-white/20 shadow-sm" : "bg-transparent"
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-linear-to-br from-cyan-600 via-blue-600 to-indigo-700 text-white shadow-lg transition-transform group-hover:scale-105">
            <span className="font-bold text-lg">LMS</span>
            <div className="absolute inset-0 bg-white/20 opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">Learning Management System</span>
        </Link>

        <nav className="hidden gap-8 md:flex items-center">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => cn(
                "text-sm font-medium transition-colors hover:text-cyan-700",
                isActive ? "text-cyan-700" : "text-slate-600"
              )}
            >
              {link.label}
            </NavLink>
          ))}
          <div className="relative">
            <input
              type="text"
              placeholder="Search courses..."
              className="h-9 w-64 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  navigate(`/courses?search=${encodeURIComponent(e.target.value)}`)
                }
              }}
            />
          </div>
        </nav>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              {balance !== null && (
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-100 text-sm font-medium">
                  <span>Balance:</span>
                  <span>${balance}</span>
                </div>
              )}
              <Button
                variant="outline"
                onClick={() => navigate(dashboardRoute)}
                className="hidden sm:flex border-cyan-200 hover:bg-cyan-50 hover:text-cyan-800"
              >
                Dashboard
              </Button>
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="text-slate-600 hover:text-cyan-700 hover:bg-cyan-50"
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                onClick={() => navigate('/login')}
                className="text-slate-600 hover:text-cyan-700"
              >
                Login
              </Button>
              <Button
                onClick={() => navigate('/signup')}
                className="bg-cyan-700 hover:bg-cyan-800 text-white shadow-lg shadow-cyan-200 transition-all hover:shadow-cyan-300 hover:-translate-y-0.5"
              >
                Get Started
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}


