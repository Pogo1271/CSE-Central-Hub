import jwt from 'jsonwebtoken'
import { User } from './auth'

// JWT Secret - should be stored in environment variables in production
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d' // 7 days for regular users
const SUPERUSER_JWT_EXPIRES_IN = process.env.SUPERUSER_JWT_EXPIRES_IN || '1h' // 1 hour for SuperUser

export interface JWTPayload {
  userId: string
  email: string
  role: string
  iat?: number
  exp?: number
}

/**
 * Generate JWT token for authenticated user
 */
export function generateJWTToken(user: User): string {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    role: user.role
  }

  // Use shorter expiration for SuperUser for security
  const expiresIn = user.role === 'SuperUser' ? SUPERUSER_JWT_EXPIRES_IN : JWT_EXPIRES_IN

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn
  })
}

/**
 * Verify JWT token and return payload
 */
export function verifyJWTToken(token: string): JWTPayload | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as JWTPayload
    return payload
  } catch (error) {
    console.error('JWT verification failed:', error)
    return null
  }
}

/**
 * Extract JWT token from Authorization header
 */
export function extractTokenFromHeader(authHeader: string | undefined): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  return authHeader.substring(7) // Remove 'Bearer ' prefix
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token: string): boolean {
  try {
    const decoded = jwt.decode(token) as { exp?: number }
    if (!decoded || !decoded.exp) {
      return true
    }
    return decoded.exp * 1000 < Date.now() // Convert to milliseconds
  } catch (error) {
    return true
  }
}

/**
 * Check if token belongs to a SuperUser
 */
export function isSuperUserToken(token: string): boolean {
  try {
    const payload = verifyJWTToken(token)
    return payload?.role === 'SuperUser'
  } catch (error) {
    return false
  }
}

/**
 * Get time until token expiration (in milliseconds)
 */
export function getTokenExpirationTime(token: string): number {
  try {
    const decoded = jwt.decode(token) as { exp?: number }
    if (!decoded || !decoded.exp) {
      return 0
    }
    return Math.max(0, decoded.exp * 1000 - Date.now())
  } catch (error) {
    return 0
  }
}

/**
 * Check if SuperUser token needs refresh (within 5 minutes of expiration)
 */
export function shouldSuperUserTokenRefresh(token: string): boolean {
  if (!isSuperUserToken(token)) {
    return false
  }
  
  const timeLeft = getTokenExpirationTime(token)
  const fiveMinutesInMs = 5 * 60 * 1000
  
  return timeLeft < fiveMinutesInMs && timeLeft > 0
}

/**
 * Refresh token (generate new token with same payload)
 */
export function refreshToken(token: string): string | null {
  const payload = verifyJWTToken(token)
  if (!payload) {
    return null
  }

  // Create a new user object from payload (minimal user data)
  const user: User = {
    id: payload.userId,
    email: payload.email,
    role: payload.role,
    name: '', // Not available in JWT payload
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  return generateJWTToken(user)
}