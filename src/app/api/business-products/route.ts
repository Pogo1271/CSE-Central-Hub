import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withAuth, AuthenticatedRequest } from '@/lib/middleware'

const getHandler = async (request: AuthenticatedRequest) => {
  try {
    const { searchParams } = new URL(request.url)
    const businessId = searchParams.get('businessId')

    if (businessId) {
      // Get assignments for a specific business
      const assignments = await db.businessProduct.findMany({
        where: { businessId },
        include: {
          product: true,
          business: true,
          assignedByUser: {
            select: { id: true, name: true }
          }
        },
        orderBy: { assignedDate: 'desc' }
      })

      return NextResponse.json(assignments)
    } else {
      // Get all assignments
      const assignments = await db.businessProduct.findMany({
        include: {
          product: true,
          business: true,
          assignedByUser: {
            select: { id: true, name: true }
          }
        },
        orderBy: { assignedDate: 'desc' }
      })

      return NextResponse.json(assignments)
    }
  } catch (error) {
    console.error('Error fetching business products:', error)
    return NextResponse.json({ error: 'Failed to fetch business products' }, { status: 500 })
  }
}

export const GET = withAuth(getHandler)

const postHandler = async (request: AuthenticatedRequest) => {
  try {
    const body = await request.json()
    const {
      businessId,
      productId,
      quantity = 1,
      status = 'active',
      notes,
      validFrom,
      validTo,
      assignedBy
    } = body

    // Validate required fields
    if (!businessId || !productId) {
      return NextResponse.json({ error: 'Business ID and Product ID are required' }, { status: 400 })
    }

    // Check if business exists
    const business = await db.business.findUnique({
      where: { id: businessId }
    })

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    // Check if product exists and is not serialized
    const product = await db.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    if (product.isSerialized) {
      return NextResponse.json({ error: 'Cannot assign serialized product as non-serialized assignment' }, { status: 400 })
    }

    // Check if assignment already exists
    const existingAssignment = await db.businessProduct.findUnique({
      where: {
        businessId_productId: {
          businessId,
          productId
        }
      }
    })

    if (existingAssignment) {
      return NextResponse.json({ error: 'Product is already assigned to this business' }, { status: 400 })
    }

    // Create the assignment
    const assignment = await db.businessProduct.create({
      data: {
        businessId,
        productId,
        quantity,
        status,
        notes: notes || null,
        validFrom: validFrom ? new Date(validFrom) : new Date(),
        validTo: validTo ? new Date(validTo) : null,
        assignedBy: assignedBy || request.user?.id, // Use current user ID if not provided
        assignedDate: new Date()
      },
      include: {
        product: true,
        business: true,
        assignedByUser: {
          select: { id: true, name: true }
        }
      }
    })

    return NextResponse.json(assignment)
  } catch (error) {
    console.error('Error creating business product assignment:', error)
    return NextResponse.json({ error: 'Failed to create business product assignment' }, { status: 500 })
  }
}

export const POST = withAuth(postHandler)