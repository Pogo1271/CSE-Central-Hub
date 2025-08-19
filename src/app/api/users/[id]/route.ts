import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { name, email, password, role, status, color } = body
    
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
      where: { id: params.id },
      data: updateData
    })
    
    return NextResponse.json(user)
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { color } = body
    
    const user = await db.user.update({
      where: { id: params.id },
      data: { color }
    })
    
    return NextResponse.json(user)
  } catch (error) {
    console.error('Error updating user color:', error)
    return NextResponse.json({ error: 'Failed to update user color' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await db.user.delete({
      where: { id: params.id }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
  }
}