import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button.jsx'
import { Input } from '../components/ui/input.jsx'
import { Label } from '../components/ui/label.jsx'
import { useAuth } from '../hooks/useAuth.js'
import { useToast } from '../hooks/useToast.js'
import { roleRoutes } from '../utils/formatters.js'

const roles = [
  { label: 'Student', value: 'student' },
  { label: 'Instructor', value: 'instructor' },
  { label: 'Admin', value: 'admin' },
]

export const LoginPage = () => {
  const [form, setForm] = useState({
    email: '',
    password: '',
    role: 'student',
  })
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    try {
      setLoading(true)
      await login(form.role, { email: form.email, password: form.password })
      showToast({
        type: 'success',
        title: 'Welcome back',
        message: 'You are logged in successfully.',
      })
      const redirectTo =
        location.state?.from?.pathname ||
        roleRoutes[form.role] ||
        '/dashboard/learner'
      navigate(redirectTo, { replace: true })
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Login failed',
        message: err.message,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6 px-6 py-12">
      <div className="text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Access</p>
        <h1 className="text-3xl font-semibold text-slate-900">Sign in to LMS ORG</h1>
        <p className="mt-2 text-sm text-slate-500">Choose your role and continue learning.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="grid gap-3">
          <Label htmlFor="role">Role</Label>
          <select
            id="role"
            name="role"
            value={form.role}
            onChange={handleChange}
            className="rounded-2xl border border-slate-200 px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          >
            {roles.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-3">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            required
            value={form.email}
            onChange={handleChange}
          />
        </div>

        <div className="grid gap-3">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="********"
            required
            value={form.password}
            onChange={handleChange}
          />
        </div>

        <Button className="w-full" type="submit" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign in'}
        </Button>

        <p className="text-center text-sm text-slate-500">
          New here?{' '}
          <button
            type="button"
            className="font-semibold text-indigo-600 underline-offset-2 hover:underline"
            onClick={() => navigate('/signup')}
          >
            Create an account
          </button>
        </p>
      </form>
    </div>
  )
}

