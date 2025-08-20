'use client'

export interface User {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
  updatedAt: string
}

export interface AuthState {
  isAuthenticated: boolean
  user: User | null
  isLoading: boolean
}

// Check if user is authenticated on client side
export const getAuthState = (): AuthState => {
  if (typeof window === 'undefined') {
    return {
      isAuthenticated: false,
      user: null,
      isLoading: false
    }
  }

  try {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true'
    const userString = localStorage.getItem('currentUser')
    
    if (!isAuthenticated || !userString) {
      return {
        isAuthenticated: false,
        user: null,
        isLoading: false
      }
    }

    const user = JSON.parse(userString)
    return {
      isAuthenticated: true,
      user,
      isLoading: false
    }
  } catch (error) {
    // Clear potentially corrupted data
    localStorage.removeItem('isAuthenticated')
    localStorage.removeItem('currentUser')
    return {
      isAuthenticated: false,
      user: null,
      isLoading: false
    }
  }
}

// Set authentication state
export const setAuthState = (user: User): void => {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem('isAuthenticated', 'true')
    localStorage.setItem('currentUser', JSON.stringify(user))
  } catch (error) {
    console.error('Failed to set auth state:', error)
  }
}

// Clear authentication state
export const clearAuthState = (): void => {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.removeItem('isAuthenticated')
    localStorage.removeItem('currentUser')
  } catch (error) {
    console.error('Failed to clear auth state:', error)
  }
}

// Check if user has specific role
export const hasRole = (user: User | null, requiredRole: string): boolean => {
  if (!user) return false
  return user.role.toLowerCase() === requiredRole.toLowerCase()
}

// Check if user has permission (role-based)
export const hasPermission = (user: User | null, requiredRoles: string[]): boolean => {
  if (!user) return false
  return requiredRoles.some(role => hasRole(user, role))
}