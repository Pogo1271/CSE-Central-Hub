import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// This endpoint checks for upcoming tasks that need notifications
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const daysAhead = parseInt(searchParams.get('daysAhead') || '7')
    
    const now = new Date()
    const notificationDate = new Date(now)
    notificationDate.setDate(notificationDate.getDate() + daysAhead)
    
    // Find upcoming tasks that need notifications
    const upcomingTasks = await db.task.findMany({
      where: {
        startDate: {
          gte: now,
          lte: notificationDate
        },
        status: 'pending',
        parentTaskId: null // Only show parent tasks, not individual instances
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        business: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        startDate: 'asc'
      }
    })
    
    // Find tasks that are approaching their recurrence end date
    const expiringSoon = new Date(now)
    expiringSoon.setDate(expiringSoon.getDate() + 30) // 30 days warning
    
    const expiringTasks = await db.task.findMany({
      where: {
        recurring: true,
        recurrenceEndDate: {
          gte: now,
          lte: expiringSoon
        },
        parentTaskId: null
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })
    
    return NextResponse.json({
      upcomingTasks,
      expiringTasks,
      notificationDate: notificationDate.toISOString()
    })
    
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}