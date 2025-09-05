import { NextRequest, NextResponse } from 'next/server'
import { authenticateToken } from '@/lib/middleware'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Authenticate using JWT middleware
    const authResult = await authenticateToken(request)
    if (authResult) {
      // If authentication fails, return not connected instead of unauthorized
      return NextResponse.json({
        connected: false,
        calendarId: null,
        email: null,
      })
    }

    // Get user from authenticated request
    const user = (request as any).user

    // Get user with Google Calendar credentials
    const dbUser = await db.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        googleCalendarEnabled: true,
        googleCalendarId: true,
      }
    })

    if (!dbUser) {
      return NextResponse.json({
        connected: false,
        calendarId: null,
        email: null,
      })
    }

    return NextResponse.json({
      connected: dbUser.googleCalendarEnabled || false,
      calendarId: dbUser.googleCalendarId,
      email: dbUser.email,
    })
  } catch (error) {
    console.error('Error fetching calendar status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch calendar status' },
      { status: 500 }
    )
  }
}