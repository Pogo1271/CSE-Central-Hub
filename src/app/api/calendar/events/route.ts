import { NextRequest, NextResponse } from 'next/server'
import { authenticateToken } from '@/lib/middleware'
import { db } from '@/lib/db'
import { GoogleCalendarService } from '@/lib/google-calendar'

export async function GET(request: NextRequest) {
  try {
    // Authenticate using JWT middleware
    const authResult = await authenticateToken(request)
    if (authResult) {
      return authResult
    }

    // Get user from authenticated request
    const user = (request as any).user

    // Get user with Google Calendar credentials
    const dbUser = await db.user.findUnique({
      where: { id: user.id },
      select: {
        googleCalendarToken: true,
        googleCalendarId: true,
        googleCalendarEnabled: true,
      }
    })

    if (!dbUser?.googleCalendarEnabled || !dbUser.googleCalendarToken) {
      return NextResponse.json({ error: 'Google Calendar not connected' }, { status: 400 })
    }

    const { searchParams } = new URL(request.url)
    const timeMin = searchParams.get('timeMin') ? new Date(searchParams.get('timeMin')!) : undefined
    const timeMax = searchParams.get('timeMax') ? new Date(searchParams.get('timeMax')!) : undefined

    const calendarService = new GoogleCalendarService(dbUser.googleCalendarToken)
    const events = await calendarService.listEvents(dbUser.googleCalendarId || 'primary', timeMin, timeMax)

    return NextResponse.json(events)
  } catch (error) {
    console.error('Error fetching Google Calendar events:', error)
    return NextResponse.json(
      { error: 'Failed to fetch Google Calendar events' },
      { status: 500 }
    )
  }
}