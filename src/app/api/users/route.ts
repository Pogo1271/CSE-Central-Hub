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

export async function GET(request: NextRequest) {
  try {
    const users = await db.user.findMany({
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json(users)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check SuperUser access first
    const superUserCheck = await checkSuperUserAccess(request)
    if (superUserCheck) {
      return superUserCheck
    }
    
    const currentUser = await getCurrentUser(request)
    const body = await request.json()
    const { name, email, password, role, status, color, joined } = body
    
    // Validate required fields
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }
    
    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email }
    })
    
    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 })
    }
    
    // Hash password if provided
    let hashedPassword = null
    if (password) {
      hashedPassword = await bcrypt.hash(password, 12)
    }
    
    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword || null,
        role: role || 'User',
        status: status || 'Active',
        color: color || '#3B82F6',
        joined: joined ? new Date(joined) : new Date()
      }
    })
    
    // Log privileged action if performed by privileged user
    if (currentUser && isPrivilegedUser(currentUser)) {
      await logPrivilegedAction({
        userId: currentUser.id,
        action: 'CREATE_USER',
        targetId: user.id,
        targetEmail: user.email,
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        details: `Created user: ${name || email} (Role: ${role || 'User'}, Status: ${status || 'Active'})`
      })
    }
    
    return NextResponse.json(user)
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
  }
}