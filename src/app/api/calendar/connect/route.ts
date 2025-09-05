import { NextRequest, NextResponse } from 'next/server'
import { authenticateToken } from '@/lib/middleware'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    // Authenticate using JWT middleware
    const authResult = await authenticateToken(request)
    if (authResult) {
      return authResult
    }

    // Get user from authenticated request
    const user = (request as any).user

    const body = await request.json()
    const { accessToken, refreshToken, calendarId } = body

    if (!accessToken) {
      return NextResponse.json({ error: 'Access token is required' }, { status: 400 })
    }

    // Update user with Google Calendar credentials
    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: {
        googleCalendarToken: accessToken,
        googleCalendarRefreshToken: refreshToken,
        googleCalendarId: calendarId || 'primary',
        googleCalendarEnabled: true,
      },
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Google Calendar connected successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        googleCalendarEnabled: updatedUser.googleCalendarEnabled,
      }
    })
  } catch (error) {
    console.error('Error connecting Google Calendar:', error)
    return NextResponse.json(
      { error: 'Failed to connect Google Calendar' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Authenticate using JWT middleware
    const authResult = await authenticateToken(request)
    if (authResult) {
      return authResult
    }

    // Get user from authenticated request
    const user = (request as any).user

    // Remove Google Calendar credentials from user
    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: {
        googleCalendarToken: null,
        googleCalendarRefreshToken: null,
        googleCalendarId: null,
        googleCalendarEnabled: false,
      },
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Google Calendar disconnected successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        googleCalendarEnabled: updatedUser.googleCalendarEnabled,
      }
    })
  } catch (error) {
    console.error('Error disconnecting Google Calendar:', error)
    return NextResponse.json(
      { error: 'Failed to disconnect Google Calendar' },
      { status: 500 }
    )
  }
}