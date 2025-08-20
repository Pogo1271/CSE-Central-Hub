import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; productId: string } }
) {
  try {
    const businessId = params.id
    const productId = params.productId

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
        productId: productId
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
  { params }: { params: { id: string; productId: string } }
) {
  try {
    const businessId = params.id
    const productId = params.productId

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