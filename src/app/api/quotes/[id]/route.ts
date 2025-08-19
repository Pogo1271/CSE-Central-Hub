import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const quote = await db.quote.findUnique({
      where: { id: params.id },
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
    
    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
    }
    
    return NextResponse.json(quote)
  } catch (error) {
    console.error('Error fetching quote:', error)
    return NextResponse.json({ error: 'Failed to fetch quote' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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
    
    // Calculate total amount
    let totalAmount = 0
    if (items && items.length > 0) {
      totalAmount = items.reduce((sum: number, item: any) => {
        return sum + (item.price * item.quantity)
      }, 0)
    }
    
    // Delete existing items
    await db.quoteItem.deleteMany({
      where: { quoteId: params.id }
    })
    
    const quote = await db.quote.update({
      where: { id: params.id },
      data: {
        title,
        description,
        businessId,
        userId,
        status,
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
    console.error('Error updating quote:', error)
    return NextResponse.json({ error: 'Failed to update quote' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await db.quote.delete({
      where: { id: params.id }
    })
    
    return NextResponse.json({ message: 'Quote deleted successfully' })
  } catch (error) {
    console.error('Error deleting quote:', error)
    return NextResponse.json({ error: 'Failed to delete quote' }, { status: 500 })
  }
}