import { NextRequest, NextResponse } from 'next/server'
import { withAuth, getCurrentUser } from '@/lib/middleware'

// Protected route that requires authentication
export const GET = withAuth(async (request: NextRequest) => {
  try {
    const user = getCurrentUser(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: 'Authentication successful',
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    })
  } catch (error) {
    console.error('Auth me route error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})