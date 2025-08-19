import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const status = searchParams.get('status')
    const location = searchParams.get('location')
    
    const where: any = {}
    
    if (category && category !== 'All Categories') {
      where.category = category
    }
    
    if (status && status !== 'All Statuses') {
      where.status = status
    }
    
    if (location && location !== 'All Locations') {
      where.location = location
    }
    
    const businesses = await db.business.findMany({
      where,
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
      },
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json(businesses)
  } catch (error) {
    console.error('Error fetching businesses:', error)
    return NextResponse.json({ error: 'Failed to fetch businesses' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
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
    
    // Validate required fields
    if (!name) {
      return NextResponse.json({ error: 'Business name is required' }, { status: 400 })
    }
    
    const business = await db.business.create({
      data: {
        name,
        description,
        category,
        location,
        phone,
        email,
        website,
        status: status || 'Active',
        supportContract: supportContract || false,
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
    console.error('Error creating business:', error)
    return NextResponse.json({ error: 'Failed to create business' }, { status: 500 })
  }
}