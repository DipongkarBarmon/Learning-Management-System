import { useCallback, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import api from '../services/api.js'
import { AuthContext } from './auth-context.js'

const TOKEN_KEY = 'edulearn_token'
const USER_KEY = 'edulearn_user'

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = sessionStorage.getItem(USER_KEY)
    return stored ? JSON.parse(stored) : null
  })
  const [token, setToken] = useState(() => sessionStorage.getItem(TOKEN_KEY))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const persist = useCallback((authUser, authToken) => {
    setUser(authUser)
    setToken(authToken)
    if (authUser && authToken) {
      sessionStorage.setItem(USER_KEY, JSON.stringify(authUser))
      sessionStorage.setItem(TOKEN_KEY, authToken)
    } else {
      sessionStorage.removeItem(USER_KEY)
      sessionStorage.removeItem(TOKEN_KEY)
    }
  }, [])

  const login = useCallback(async (_role, credentials) => {
    try {
      setLoading(true)
      setError(null)
      console.log('Login attempt:', { credentials: { email: credentials.email } })
      const { data } = await api.post('/user/login', credentials)
      console.log('Login response:', data)
      const { user: loggedInUser, accessToken } = data?.data || {}
      if (!loggedInUser || !accessToken) {
        throw new Error('Invalid response from server')
      }
      persist(loggedInUser, accessToken)
      return loggedInUser
    } catch (err) {
      console.error('Login error:', err)
      const message =
        err?.response?.data?.message || err.message || 'Unable to login. Please try again.'
      setError(message)
      throw new Error(message)
    } finally {
      setLoading(false)
    }
  }, [persist])

  const signup = useCallback(async (_role, payload) => {
    try {
      setLoading(true)
      setError(null)
      console.log('Signup attempt:', { role: _role, hasAvatar: !!payload.avatar })
      const form = new FormData()
      Object.entries(payload || {}).forEach(([key, value]) => {
        if (value !== undefined && value !== null && `${value}` !== '') {
          form.append(key, value)
        }
      })
      const response = await api.post('/user/register', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      console.log('Signup response:', response.data)
    } catch (err) {
      console.error('Signup error:', err)
      const message =
        err?.response?.data?.message || err.message ||
        'Unable to create account. Please try again.'
      setError(message)
      throw new Error(message)
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    if (!user) return
    try {
      setLoading(true)
      await api.get('/user/logout')
    } catch (err) {
      console.error('Logout failed', err)
    } finally {
      persist(null, null)
      setLoading(false)
    }
  }, [persist, user])

  const updateUser = useCallback((updates) => {
    setUser((prev) => {
      const newUser = { ...prev, ...updates }
      sessionStorage.setItem(USER_KEY, JSON.stringify(newUser))
      return newUser
    })
  }, [])

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      error,
      isAuthenticated: Boolean(user && token),
      login,
      signup,
      logout,
      updateUser,
    }),
    [user, token, loading, error, login, signup, logout, updateUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
}
