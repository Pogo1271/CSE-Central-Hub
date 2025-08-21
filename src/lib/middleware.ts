import { NextRequest, NextResponse } from 'next/server'
import { verifyJWTToken, extractTokenFromHeader } from './jwt'
import { db } from './db'

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string
    email: string
    role: string
  }
}

/**
 * Middleware to authenticate JWT tokens
 * @param request NextRequest object
 * @returns NextResponse with user info or error
 */
export async function authenticateToken(request: NextRequest): Promise<NextResponse | null> {
  try {
    // Extract token from Authorization header
    const authHeader = request.headers.get('authorization')
    const token = extractTokenFromHeader(authHeader)

    if (!token) {
      return NextResponse.json(
        { error: 'Access token required' },
        { status: 401 }
      )
    }

    // Verify JWT token
    const payload = verifyJWTToken(token)
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // Verify user exists in database
    const user = await db.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        role: true,
        status: true
      }
    })

    if (!user || user.status !== 'Active') {
      return NextResponse.json(
        { error: 'User not found or inactive' },
        { status: 401 }
      )
    }

    // Add user info to request for downstream use
    const requestWithUser = request as AuthenticatedRequest
    requestWithUser.user = {
      id: user.id,
      email: user.email,
      role: user.role
    }

    return null // Success, continue to the route handler
  } catch (error) {
    console.error('Authentication middleware error:', error)
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    )
  }
}

/**
 * Middleware to check user roles
 * @param request NextRequest object
 * @param requiredRoles Array of allowed roles
 * @returns NextResponse with error or null if authorized
 */
export async function authorizeRoles(
  request: NextRequest,
  requiredRoles: string[]
): Promise<NextResponse | null> {
  const authResult = await authenticateToken(request)
  if (authResult) {
    return authResult // Authentication failed
  }

  const requestWithUser = request as AuthenticatedRequest
  const userRole = requestWithUser.user?.role?.toLowerCase()

  if (!userRole || !requiredRoles.some(role => role.toLowerCase() === userRole)) {
    return NextResponse.json(
      { error: 'Insufficient permissions' },
      { status: 403 }
    )
  }

  return null // Authorized
}

/**
 * Higher-order function to protect API routes
 * @param handler The route handler function
 * @param requiredRoles Optional array of required roles
 * @returns Protected route handler
 */
export function withAuth(
  handler: (request: AuthenticatedRequest, context?: any) => Promise<NextResponse>,
  requiredRoles?: string[]
) {
  return async (request: NextRequest, context?: any): Promise<NextResponse> => {
    try {
      // Check authentication
      if (requiredRoles && requiredRoles.length > 0) {
        const authResult = await authorizeRoles(request, requiredRoles)
        if (authResult) {
          return authResult
        }
      } else {
        const authResult = await authenticateToken(request)
        if (authResult) {
          return authResult
        }
      }

      // If we get here, authentication/authorization passed
      return await handler(request as AuthenticatedRequest, context)
    } catch (error) {
      console.error('Auth middleware error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }
}

/**
 * Helper function to get current user from request
 * @param request NextRequest object
 * @returns User object or null
 */
export function getCurrentUser(request: NextRequest): { id: string; email: string; role: string } | null {
  const requestWithUser = request as AuthenticatedRequest
  return requestWithUser.user || null
}