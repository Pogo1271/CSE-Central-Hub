import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { generateJWTToken } from '@/lib/jwt'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body
    
    // Validate required fields
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }
    
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    })
    
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }
    
    // Check if user has a password
    if (!user.password) {
      return NextResponse.json({ error: 'User account not properly set up' }, { status: 401 })
    }
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }
    
    // Check if user is active
    if (user.status !== 'Active') {
      return NextResponse.json({ error: 'Account is not active' }, { status: 401 })
    }
    
    // Return user data without password and JWT token
    const { password: _, ...userWithoutPassword } = user
    
    // Generate JWT token
    const token = generateJWTToken(userWithoutPassword)
    
    return NextResponse.json({
      user: userWithoutPassword,
      token,
      message: 'Login successful'
    })
    
  } catch (error) {
    console.error('Error during login:', error)
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}