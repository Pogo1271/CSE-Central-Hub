import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const businessId = params.id

    // Fetch products for the business through BusinessProduct junction table
    const businessProducts = await db.businessProduct.findMany({
      where: {
        businessId: businessId
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            pricingType: true,
            category: true,
            sku: true,
            stock: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform the data to return just the products
    const products = businessProducts.map(bp => bp.product)

    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching business products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}