'use client'

import { useState, useEffect } from 'react'
import { User, AuthState, getAuthState } from '@/lib/auth'

export function useAuth(): AuthState & {
  logout: () => void
  updateUser: (user: User) => void
} {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    isLoading: true
  })

  useEffect(() => {
    // Check authentication status on mount
    const checkAuth = () => {
      const state = getAuthState()
      setAuthState({
        ...state,
        isLoading: false
      })
    }

    checkAuth()

    // Listen for storage changes (for multi-tab support)
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'isAuthenticated' || event.key === 'currentUser') {
        checkAuth()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('isAuthenticated')
      localStorage.removeItem('currentUser')
      setAuthState({
        isAuthenticated: false,
        user: null,
        isLoading: false
      })
      // Redirect to login page
      window.location.href = '/auth'
    }
  }

  const updateUser = (user: User) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('currentUser', JSON.stringify(user))
      setAuthState(prev => ({
        ...prev,
        user
      }))
    }
  }

  return {
    ...authState,
    logout,
    updateUser
  }
}