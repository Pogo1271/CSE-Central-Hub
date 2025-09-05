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
    
    const user = await db.user.findUnique({
      where: { id: payload.userId }
    })
    
    return user
  } catch (error) {
    return null
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; productId: string }> }
) {
  try {
    // Check authentication
    const currentUser = await getCurrentUser(request)
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const businessId = (await params).id
    const productId = (await params).productId

    // Check if the business exists
    const business = await db.business.findUnique({
      where: { id: businessId }
    })

    if (!business) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      )
    }

    // Check if the product exists
    const product = await db.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Check if the product is already assigned to the business
    const existingAssignment = await db.businessProduct.findUnique({
      where: {
        businessId_productId: {
          businessId: businessId,
          productId: productId
        }
      }
    })

    if (existingAssignment) {
      return NextResponse.json(
        { error: 'Product is already assigned to this business' },
        { status: 400 }
      )
    }

    // Create the business-product relationship
    const businessProduct = await db.businessProduct.create({
      data: {
        businessId: businessId,
        productId: productId,
        assignedBy: currentUser.id, // Use current user ID
        assignedDate: new Date()
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
      }
    })

    return NextResponse.json(businessProduct)
  } catch (error) {
    console.error('Error assigning product to business:', error)
    return NextResponse.json(
      { error: 'Failed to assign product to business' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; productId: string }> }
) {
  try {
    // Check authentication
    const currentUser = await getCurrentUser(request)
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const businessId = (await params).id
    const productId = (await params).productId

    // Check if the assignment exists
    const existingAssignment = await db.businessProduct.findUnique({
      where: {
        businessId_productId: {
          businessId: businessId,
          productId: productId
        }
      }
    })

    if (!existingAssignment) {
      return NextResponse.json(
        { error: 'Product is not assigned to this business' },
        { status: 404 }
      )
    }

    // Delete the business-product relationship
    await db.businessProduct.delete({
      where: {
        businessId_productId: {
          businessId: businessId,
          productId: productId
        }
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing product from business:', error)
    return NextResponse.json(
      { error: 'Failed to remove product from business' },
      { status: 500 }
    )
  }
}