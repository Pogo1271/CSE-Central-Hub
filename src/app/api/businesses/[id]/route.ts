import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const business = await db.business.findUnique({
      where: { id },
      include: {
        contacts: true,
        tasks: {
          include: {
            assignee: true,
            createdBy: true
          }
        },
        notes: true,
        products: {
          include: {
            product: true
          }
        },
        quotes: {
          include: {
            items: {
              include: {
                product: true
              }
            },
            user: true
          }
        },
        user: true
      }
    })
    
    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }
    
    return NextResponse.json(business)
  } catch (error) {
    console.error('Error fetching business:', error)
    return NextResponse.json({ error: 'Failed to fetch business' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { 
      name, 
      description, 
      category, 
      location, 
      phone, 
      email, 
      website, 
      status,
      supportContract,
      supportExpiry,
      userId 
    } = body
    
    const business = await db.business.update({
      where: { id },
      data: {
        name,
        description,
        category,
        location,
        phone,
        email,
        website,
        status,
        supportContract,
        supportExpiry: supportExpiry ? new Date(supportExpiry) : null,
        userId
      },
      include: {
        contacts: true,
        tasks: true,
        notes: true,
        products: {
          include: {
            product: true
          }
        },
        user: true
      }
    })
    
    return NextResponse.json(business)
  } catch (error) {
    console.error('Error updating business:', error)
    return NextResponse.json({ error: 'Failed to update business' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await db.business.delete({
      where: { id }
    })
    
    return NextResponse.json({ message: 'Business deleted successfully' })
  } catch (error) {
    console.error('Error deleting business:', error)
    return NextResponse.json({ error: 'Failed to delete business' }, { status: 500 })
  }
}