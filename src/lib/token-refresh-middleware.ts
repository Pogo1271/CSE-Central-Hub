import { NextRequest, NextResponse } from 'next/server'
import { verifyJWTToken, generateJWTToken, shouldSuperUserTokenRefresh, isSuperUserToken } from '@/lib/jwt'
import { db } from '@/lib/db'
import { User } from '@/lib/auth'

/**
 * Middleware to automatically refresh SuperUser tokens when they're about to expire
 * This ensures SuperUser sessions remain active while maintaining shorter token lifetimes
 */
export async function refreshTokenIfNeeded(request: NextRequest): Promise<NextResponse | null> {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }
    
    const token = authHeader.substring(7)
    
    // Only check for SuperUser tokens
    if (!isSuperUserToken(token)) {
      return null
    }
    
    // Check if token needs refresh
    if (!shouldSuperUserTokenRefresh(token)) {
      return null
    }
    
    // Verify the token is still valid
    const payload = verifyJWTToken(token)
    if (!payload) {
      return null
    }
    
    // Get the full user data from database
    const user = await db.user.findUnique({
      where: { id: payload.userId }
    })
    
    if (!user || user.role !== 'SuperUser') {
      return null
    }
    
    // Generate a new token
    const newToken = generateJWTToken(user)
    
    // Create response with new token in headers
    const response = NextResponse.next()
    response.headers.set('X-New-Token', newToken)
    response.headers.set('X-Token-Refreshed', 'true')
    
    return response
  } catch (error) {
    console.error('Error in token refresh middleware:', error)
    return null
  }
}

/**
 * Extract new token from response headers (for client-side handling)
 */
export function getNewTokenFromResponse(response: Response): string | null {
  return response.headers.get('X-New-Token')
}

/**
 * Check if token was refreshed (for client-side handling)
 */
export function wasTokenRefreshed(response: Response): boolean {
  return response.headers.get('X-Token-Refreshed') === 'true'
}