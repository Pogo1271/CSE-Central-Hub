import { getToken, setAuthState, getAuthState, User } from './auth'
import { isSuperUserToken, getTokenExpirationTime } from './jwt'

/**
 * SuperUser session management utilities
 * Handles shorter session timeouts and automatic refresh
 */

export interface SuperUserSessionInfo {
  isLoggedIn: boolean
  isSuperUser: boolean
  timeRemaining: number // in milliseconds
  needsRefresh: boolean
  sessionExpiry: Date | null
}

/**
 * Get SuperUser session information
 */
export function getSuperUserSessionInfo(): SuperUserSessionInfo {
  const authState = getAuthState()
  const token = getToken()
  
  if (!authState.isAuthenticated || !authState.user || !token) {
    return {
      isLoggedIn: false,
      isSuperUser: false,
      timeRemaining: 0,
      needsRefresh: false,
      sessionExpiry: null
    }
  }
  
  const isSuperUser = authState.user.role === 'SuperUser'
  const timeRemaining = getTokenExpirationTime(token)
  const sessionExpiry = timeRemaining > 0 ? new Date(Date.now() + timeRemaining) : null
  
  // Consider refresh needed if less than 10 minutes remaining
  const needsRefresh = isSuperUser && timeRemaining < 10 * 60 * 1000 && timeRemaining > 0
  
  return {
    isLoggedIn: true,
    isSuperUser,
    timeRemaining,
    needsRefresh,
    sessionExpiry
  }
}

/**
 * Format time remaining for display
 */
export function formatTimeRemaining(milliseconds: number): string {
  if (milliseconds <= 0) {
    return 'Expired'
  }
  
  const minutes = Math.floor(milliseconds / (1000 * 60))
  const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000)
  
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`
  }
  
  return `${seconds}s`
}

/**
 * Check if SuperUser session is about to expire
 */
export function isSuperUserSessionExpiringSoon(thresholdMinutes: number = 5): boolean {
  const sessionInfo = getSuperUserSessionInfo()
  if (!sessionInfo.isSuperUser) {
    return false
  }
  
  const thresholdMs = thresholdMinutes * 60 * 1000
  return sessionInfo.timeRemaining < thresholdMs && sessionInfo.timeRemaining > 0
}

/**
 * Show session warning for SuperUser
 */
export function showSuperUserSessionWarning(): void {
  const sessionInfo = getSuperUserSessionInfo()
  if (!sessionInfo.isSuperUser || !sessionInfo.needsRefresh) {
    return
  }
  
  // Create a warning notification (this would integrate with your toast system)
  const warning = document.createElement('div')
  warning.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #fbbf24;
    color: #92400e;
    padding: 12px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    z-index: 9999;
    font-family: system-ui, -apple-system, sans-serif;
    max-width: 300px;
  `
  
  warning.innerHTML = `
    <div style="font-weight: bold; margin-bottom: 4px;">SuperUser Session Expiring Soon</div>
    <div style="font-size: 14px;">Your session will expire in ${formatTimeRemaining(sessionInfo.timeRemaining)}</div>
    <div style="font-size: 12px; margin-top: 4px;">Please save your work and refresh if needed.</div>
  `
  
  document.body.appendChild(warning)
  
  // Auto-remove after 10 seconds
  setTimeout(() => {
    if (warning.parentNode) {
      warning.parentNode.removeChild(warning)
    }
  }, 10000)
}

/**
 * Update SuperUser session state with new token
 */
export function updateSuperUserSession(newToken: string): void {
  const authState = getAuthState()
  if (!authState.user) {
    return
  }
  
  // Update the token in localStorage
  localStorage.setItem('authToken', newToken)
  
  // Note: In a real implementation, you might want to verify the new token
  // and update the user state if needed
}

/**
 * Start SuperUser session monitoring
 */
export function startSuperUserSessionMonitoring(): () => void {
  let intervalId: NodeJS.Timeout
  
  const checkSession = () => {
    if (isSuperUserSessionExpiringSoon(5)) {
      showSuperUserSessionWarning()
    }
  }
  
  // Check every 30 seconds
  intervalId = setInterval(checkSession, 30000)
  
  // Initial check
  checkSession()
  
  // Return cleanup function
  return () => {
    if (intervalId) {
      clearInterval(intervalId)
    }
  }
}