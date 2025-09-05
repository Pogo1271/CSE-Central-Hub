import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyJWTToken } from '@/lib/jwt'

// Helper function to get current user from request
async function getCurrentUser(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }
    
    const token = authHeader.substring(7)
    const payload = verifyJWTToken(token)
    if (!payload) {
      return null
    }
    
    // For SuperUser, we don't need to check the database
    if (payload.role === 'SuperUser') {
      return {
        id: payload.userId,
        email: payload.email,
        role: payload.role,
        status: 'Active'
      }
    }
    
    // For regular users, check the database
    const user = await db.user.findUnique({
      where: { id: payload.userId }
    })
    
    return user
  } catch (error) {
    return null
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const currentUser = await getCurrentUser(request)
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const businessId = (await params).id

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
        },
        assignedByUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(businessProducts)
  } catch (error) {
    console.error('Error fetching business products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}