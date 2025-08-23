import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyJWTToken } from '@/lib/jwt'
import { 
  isSuperUserDisabled, 
  disableSuperUserAccess, 
  enableSuperUserAccess,
  getAllSystemConfigs 
} from '@/lib/system-config'
import { logPrivilegedAction, isPrivilegedUser } from '@/lib/privileged-logger'

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
    
    // Only allow privileged users to check SuperUser status
    if (!currentUser || !isPrivilegedUser(currentUser)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }
    
    const isDisabled = await isSuperUserDisabled()
    const configs = await getAllSystemConfigs()
    
    return NextResponse.json({
      superUserDisabled: isDisabled,
      systemConfigs: configs
    })
  } catch (error) {
    console.error('Error getting SuperUser status:', error)
    return NextResponse.json({ error: 'Failed to get status' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request)
    const body = await request.json()
    const { action, reason } = body
    
    // Only allow privileged users to manage SuperUser access
    if (!currentUser || !isPrivilegedUser(currentUser)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }
    
    if (action === 'disable') {
      await disableSuperUserAccess(reason)
      
      // Log this privileged action
      await logPrivilegedAction({
        userId: currentUser.id,
        action: 'DISABLE_SUPERUSER',
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        details: `SuperUser access disabled. Reason: ${reason || 'Not specified'}`
      })
      
      return NextResponse.json({ 
        success: true, 
        message: 'SuperUser access has been disabled',
        reason 
      })
    } else if (action === 'enable') {
      await enableSuperUserAccess()
      
      // Log this privileged action
      await logPrivilegedAction({
        userId: currentUser.id,
        action: 'ENABLE_SUPERUSER',
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        details: 'SuperUser access has been re-enabled'
      })
      
      return NextResponse.json({ 
        success: true, 
        message: 'SuperUser access has been enabled' 
      })
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error managing SuperUser access:', error)
    return NextResponse.json({ error: 'Failed to manage SuperUser access' }, { status: 500 })
  }
}