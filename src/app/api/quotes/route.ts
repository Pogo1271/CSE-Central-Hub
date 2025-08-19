import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const businessId = searchParams.get('businessId')
    
    const where: any = {}
    
    if (status && status !== 'All Statuses') {
      where.status = status
    }
    
    if (businessId) {
      where.businessId = businessId
    }
    
    const quotes = await db.quote.findMany({
      where,
      include: {
        business: true,
        items: {
          include: {
            product: true
          }
        },
        user: true
      },
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json(quotes)
  } catch (error) {
    console.error('Error fetching quotes:', error)
    return NextResponse.json({ error: 'Failed to fetch quotes' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      title, 
      description, 
      businessId, 
      userId, 
      status,
      items 
    } = body
    
    // Validate required fields
    if (!title || !businessId) {
      return NextResponse.json({ error: 'Title and business are required' }, { status: 400 })
    }
    
    // Calculate total amount
    let totalAmount = 0
    if (items && items.length > 0) {
      totalAmount = items.reduce((sum: number, item: any) => {
        return sum + (item.price * item.quantity)
      }, 0)
    }
    
    const quote = await db.quote.create({
      data: {
        title,
        description,
        businessId,
        userId,
        status: status || 'draft',
        totalAmount,
        items: items ? {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price
          }))
        } : undefined
      },
      include: {
        business: true,
        items: {
          include: {
            product: true
          }
        },
        user: true
      }
    })
    
    return NextResponse.json(quote)
  } catch (error) {
    console.error('Error creating quote:', error)
    return NextResponse.json({ error: 'Failed to create quote' }, { status: 500 })
  }
}