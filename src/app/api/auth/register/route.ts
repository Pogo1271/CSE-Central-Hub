import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { generateJWTToken } from '@/lib/jwt'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password } = body
    
    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 })
    }
    
    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email }
    })
    
    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 })
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)
    
    // Create user with basic permissions
    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'User', // Basic role
        status: 'Active',
        color: '#3B82F6', // Default color
        joined: new Date()
      }
    })
    
    // Return user data without password and JWT token
    const { password: _, ...userWithoutPassword } = user
    
    // Generate JWT token
    const token = generateJWTToken(userWithoutPassword)
    
    return NextResponse.json({
      user: userWithoutPassword,
      token,
      message: 'Registration successful'
    })
    
  } catch (error) {
    console.error('Error during registration:', error)
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
  }
}