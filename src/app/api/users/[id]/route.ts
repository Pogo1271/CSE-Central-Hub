import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { verifyJWTToken } from '@/lib/jwt'
import { logPrivilegedAction, isPrivilegedUser } from '@/lib/privileged-logger'
import { checkSuperUserAccess } from '@/lib/superuser-middleware'

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

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Check SuperUser access first
    const superUserCheck = await checkSuperUserAccess(request)
    if (superUserCheck) {
      return superUserCheck
    }
    
    const currentUser = await getCurrentUser(request)
    const body = await request.json()
    const { name, email, password, role, status, color } = body
    
    // Get the target user for logging
    const targetUser = await db.user.findUnique({
      where: { id: (await params).id }
    })
    
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    // Prepare update data
    const updateData: any = {
      name,
      email,
      role,
      status,
      color
    }
    
    // Hash password if provided
    if (password) {
      updateData.password = await bcrypt.hash(password, 12)
    }
    
    const user = await db.user.update({
      where: { id: (await params).id },
      data: updateData
    })
    
    // Log privileged action if performed by privileged user
    if (currentUser && isPrivilegedUser(currentUser)) {
      await logPrivilegedAction({
        userId: currentUser.id,
        action: 'UPDATE_USER',
        targetId: targetUser.id,
        targetEmail: targetUser.email,
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        details: `Updated user: ${JSON.stringify({ name, email, role, status, color: color ? '[set]' : '[unchanged]' })}`
      })
    }
    
    return NextResponse.json(user)
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Check SuperUser access first
    const superUserCheck = await checkSuperUserAccess(request)
    if (superUserCheck) {
      return superUserCheck
    }
    
    const currentUser = await getCurrentUser(request)
    const body = await request.json()
    const { color } = body
    
    // Get the target user for logging
    const targetUser = await db.user.findUnique({
      where: { id: (await params).id }
    })
    
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    const user = await db.user.update({
      where: { id: (await params).id },
      data: { color }
    })
    
    // Log privileged action if performed by privileged user
    if (currentUser && isPrivilegedUser(currentUser)) {
      await logPrivilegedAction({
        userId: currentUser.id,
        action: 'UPDATE_USER_COLOR',
        targetId: targetUser.id,
        targetEmail: targetUser.email,
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        details: `Updated user color to: ${color}`
      })
    }
    
    return NextResponse.json(user)
  } catch (error) {
    console.error('Error updating user color:', error)
    return NextResponse.json({ error: 'Failed to update user color' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Check SuperUser access first
    const superUserCheck = await checkSuperUserAccess(request)
    if (superUserCheck) {
      return superUserCheck
    }
    
    const currentUser = await getCurrentUser(request)
    
    // Get the target user for logging
    const targetUser = await db.user.findUnique({
      where: { id: (await params).id }
    })
    
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    await db.user.delete({
      where: { id: (await params).id }
    })
    
    // Log privileged action if performed by privileged user
    if (currentUser && isPrivilegedUser(currentUser)) {
      await logPrivilegedAction({
        userId: currentUser.id,
        action: 'DELETE_USER',
        targetId: targetUser.id,
        targetEmail: targetUser.email,
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        details: `Deleted user: ${targetUser.name || targetUser.email} (Role: ${targetUser.role})`
      })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
  }
}