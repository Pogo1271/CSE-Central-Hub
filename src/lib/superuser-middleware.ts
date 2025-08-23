import { NextRequest, NextResponse } from 'next/server'
import { verifyJWTToken } from '@/lib/jwt'
import { db } from '@/lib/db'
import { isSuperUserDisabled } from './system-config'

/**
 * Middleware to check if SuperUser access is allowed
 * Returns error response if SuperUser access is disabled
 */
export async function checkSuperUserAccess(request: NextRequest): Promise<NextResponse | null> {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null // No token, let the regular auth handle it
    }
    
    const token = authHeader.substring(7)
    const payload = verifyJWTToken(token)
    if (!payload) {
      return null // Invalid token, let the regular auth handle it
    }
    
    // Check if this is a SuperUser
    if (payload.role === 'SuperUser') {
      // Check if SuperUser access is disabled
      const disabled = await isSuperUserDisabled()
      if (disabled) {
        return NextResponse.json(
          { 
            error: 'SuperUser access is currently disabled',
            message: 'Please contact system administrator'
          }, 
          { status: 403 }
        )
      }
    }
    
    return null // Access allowed, continue with request
  } catch (error) {
    console.error('Error checking SuperUser access:', error)
    return null // Let the regular error handling deal with it
  }
}

/**
 * Check if current user is SuperUser and access is enabled
 */
export async function canAccessAsSuperUser(request: NextRequest): Promise<boolean> {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return false
    }
    
    const token = authHeader.substring(7)
    const payload = verifyJWTToken(token)
    if (!payload || payload.role !== 'SuperUser') {
      return false
    }
    
    const disabled = await isSuperUserDisabled()
    return !disabled
  } catch (error) {
    console.error('Error checking SuperUser access status:', error)
    return false
  }
}