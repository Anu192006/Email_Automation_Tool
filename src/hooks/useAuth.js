import { useState, useEffect } from 'react'

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if token exists in localStorage on component mount
    const token = localStorage.getItem('authToken')
    const user = localStorage.getItem('user')

    if (token && user) {
      setIsAuthenticated(true)
      try {
        setUser(JSON.parse(user))
      } catch (e) {
        // Invalid JSON, clear storage
        localStorage.removeItem('authToken')
        localStorage.removeItem('user')
        setIsAuthenticated(false)
      }
    }
    setLoading(false)
  }, [])

  const login = (token, userInfo) => {
    localStorage.setItem('authToken', token)
    localStorage.setItem('user', JSON.stringify(userInfo))
    setIsAuthenticated(true)
    setUser(userInfo)
  }

  const logout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    setIsAuthenticated(false)
    setUser(null)
  }

  return {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
  }
}

// Custom hook for API loading and error states
export const useAsyncAction = (asyncFunction) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const execute = async (...args) => {
    setLoading(true)
    setError(null)
    try {
      const result = await asyncFunction(...args)
      return result
    } catch (err) {
      setError(err.response?.data?.message || err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { execute, loading, error }
}
