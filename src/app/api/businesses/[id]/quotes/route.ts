import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const businessId = (await params).id

    // Fetch quotes for the business
    const quotes = await db.quote.findMany({
      where: {
        businessId: businessId
      },
      include: {
        business: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            location: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                category: true,
                description: true,
                pricingType: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(quotes)
  } catch (error) {
    console.error('Error fetching business quotes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch quotes' },
      { status: 500 }
    )
  }
}