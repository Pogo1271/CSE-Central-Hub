import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const roles = await db.role.findMany({
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json(roles)
  } catch (error) {
    console.error('Error fetching roles:', error)
    return NextResponse.json({ error: 'Failed to fetch roles' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, color, permissions } = body
    
    const role = await db.role.create({
      data: {
        name,
        description,
        color,
        permissions
      }
    })
    
    return NextResponse.json(role)
  } catch (error) {
    console.error('Error creating role:', error)
    return NextResponse.json({ error: 'Failed to create role' }, { status: 500 })
  }
}