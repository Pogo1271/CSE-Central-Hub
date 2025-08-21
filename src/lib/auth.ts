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
  token: string | null
  isLoading: boolean
}

// Check if user is authenticated on client side
export const getAuthState = (): AuthState => {
  if (typeof window === 'undefined') {
    return {
      isAuthenticated: false,
      user: null,
      token: null,
      isLoading: false
    }
  }

  try {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true'
    const userString = localStorage.getItem('currentUser')
    const token = localStorage.getItem('authToken')
    
    if (!isAuthenticated || !userString || !token) {
      return {
        isAuthenticated: false,
        user: null,
        token: null,
        isLoading: false
      }
    }

    const user = JSON.parse(userString)
    return {
      isAuthenticated: true,
      user,
      token,
      isLoading: false
    }
  } catch (error) {
    // Clear potentially corrupted data
    localStorage.removeItem('isAuthenticated')
    localStorage.removeItem('currentUser')
    localStorage.removeItem('authToken')
    return {
      isAuthenticated: false,
      user: null,
      token: null,
      isLoading: false
    }
  }
}

// Set authentication state with JWT token
export const setAuthState = (user: User, token: string): void => {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem('isAuthenticated', 'true')
    localStorage.setItem('currentUser', JSON.stringify(user))
    localStorage.setItem('authToken', token)
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
    localStorage.removeItem('authToken')
  } catch (error) {
    console.error('Failed to clear auth state:', error)
  }
}

// Get current JWT token
export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('authToken')
}

// Check if token exists and is not expired
export const isTokenValid = (): boolean => {
  const token = getToken()
  if (!token) return false
  
  try {
    // Simple check - in production you'd want to verify the token
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.exp * 1000 > Date.now()
  } catch (error) {
    return false
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