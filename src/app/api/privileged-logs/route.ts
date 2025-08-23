import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyJWTToken } from '@/lib/jwt'
import { isPrivilegedUser } from '@/lib/privileged-logger'
import { getPrivilegedLogs } from '@/lib/privileged-logger'

// Helper function to get current user from request
async function getCurrentUser(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }
    
    const token = authHeader.substring(7)
    const payload = verifyJWTToken(token)
    if (!payload) {
      return null
    }
    
    const user = await db.user.findUnique({
      where: { id: payload.userId }
    })
    
    return user
  } catch (error) {
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request)
    
    // Only allow privileged users to view logs
    if (!currentUser || !isPrivilegedUser(currentUser)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }
    
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const action = searchParams.get('action')
    const userId = searchParams.get('userId')
    
    // Build the query
    let whereClause: any = {}
    
    if (action && action !== 'ALL') {
      whereClause.action = { equals: action }
    }
    
    if (userId) {
      whereClause.userId = userId
    }
    
    // Get logs with pagination
    const [logs, totalCount] = await Promise.all([
      db.privilegedLog.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          }
        },
        orderBy: {
          timestamp: 'desc'
        },
        take: limit,
        skip: offset
      }),
      db.privilegedLog.count({
        where: whereClause
      })
    ])
    
    return NextResponse.json({
      logs,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount
      }
    })
  } catch (error) {
    console.error('Error fetching privileged logs:', error)
    return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request)
    
    if (!currentUser) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }
    
    // SuperUser has access to everything
    if (currentUser.role === 'SuperUser') {
      // Proceed with deletion
    } else {
      // For other users, check role-based permissions
      const userRole = await db.role.findFirst({
        where: { name: currentUser.role }
      })
      
      if (!userRole || !userRole.permissions?.canClearActivityLogs) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }
    }
    
    // Get count before deletion for logging
    const countBefore = await db.privilegedLog.count({})
    
    // Delete all privileged logs
    await db.privilegedLog.deleteMany({})
    
    return NextResponse.json({ 
      message: 'Activity logs cleared successfully',
      deletedCount: countBefore
    })
  } catch (error) {
    console.error('Error clearing privileged logs:', error)
    return NextResponse.json({ error: 'Failed to clear logs' }, { status: 500 })
  }
}