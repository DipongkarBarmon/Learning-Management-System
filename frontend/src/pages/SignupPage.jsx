import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button.jsx'
import { Input } from '../components/ui/input.jsx'
import { Label } from '../components/ui/label.jsx'
import { useToast } from '../hooks/useToast.js'
import { useAuth } from '../hooks/useAuth.js'

const roles = [
  { label: 'Student', value: 'student' },
  { label: 'Instructor', value: 'instructor' },
]

export const SignupPage = () => {
  const [form, setForm] = useState({
    role: 'student',
    fullname: '',
    phone: '',
    email: '',
    password: '',
  })
  const [avatarFile, setAvatarFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const { signup } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const handleChange = (event) => {
    const { name, value, files } = event.target
    if (name === 'avatar' && files?.[0]) {
      setAvatarFile(files[0])
      return
    }
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    try {
      setLoading(true)
      await signup(form.role, { ...form, avatar: avatarFile })
      showToast({
        type: 'success',
        title: 'Account created',
        message: 'Sign in with your credentials to get started.',
      })
      navigate('/login')
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Signup failed',
        message: err.message,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-12">
      <div className="text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Create account</p>
        <h1 className="text-3xl font-semibold text-slate-900">Join EduLearn today</h1>
        <p className="mt-2 text-sm text-slate-500">Choose a role and complete the secure signup form.</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid gap-5 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm md:grid-cols-2"
      >
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
          <Label htmlFor="fullname">Full name</Label>
          <Input
            id="fullname"
            name="fullname"
            placeholder="Jane Doe"
            required
            value={form.fullname}
            onChange={handleChange}
          />
        </div>

        <div className="grid gap-3">
          <Label htmlFor="phone">Phone number</Label>
          <Input
            id="phone"
            name="phone"
            placeholder="013XXXXXXXX"
            required
            value={form.phone}
            onChange={handleChange}
          />
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

        <div className="grid gap-3">
          <Label htmlFor="avatar">Profile picture (required)</Label>
          <Input
            id="avatar"
            name="avatar"
            type="file"
            accept="image/*"
            required
            onChange={handleChange}
          />
        </div>

        <div className="md:col-span-2">
          <Button className="w-full" type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Create account'}
          </Button>
          <p className="mt-3 text-center text-sm text-slate-500">
            Already registered?{' '}
            <button
              type="button"
              className="font-semibold text-indigo-600 underline-offset-2 hover:underline"
              onClick={() => navigate('/login')}
            >
              Sign in
            </button>
          </p>
        </div>
      </form>
    </div>
  )
}



