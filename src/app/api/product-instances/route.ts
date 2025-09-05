import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withAuth, AuthenticatedRequest } from '@/lib/middleware'

const getHandler = async (request: AuthenticatedRequest) => {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    const businessId = searchParams.get('businessId')
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const productIds = searchParams.get('productIds')

    let whereClause: any = {}

    if (productId) {
      whereClause.productId = productId
    }

    if (productIds) {
      const ids = productIds.split(',').filter(id => id.trim())
      if (ids.length > 0) {
        whereClause.productId = {
          in: ids
        }
      }
    }

    if (businessId) {
      whereClause.businessId = businessId
    }

    if (status) {
      whereClause.status = status
    }

    if (search) {
      whereClause.OR = [
        {
          serialNumber: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          licenseNumber: {
            contains: search,
            mode: 'insensitive'
          }
        }
      ]
    }

    const instances = await db.productInstance.findMany({
      where: whereClause,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            category: true,
            price: true,
            isSerialized: true
          }
        },
        business: {
          select: {
            id: true,
            name: true
          }
        },
        contact: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        lastUpdatedByUser: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(instances)
  } catch (error) {
    console.error('Error fetching product instances:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product instances' },
      { status: 500 }
    )
  }
}

export const GET = withAuth(getHandler)

const postHandler = async (request: AuthenticatedRequest) => {
  try {
    const body = await request.json()
    const {
      serialNumber,
      licenseNumber,
      productId,
      status = 'in-stock',
      businessId,
      contactId,
      soldDate,
      warrantyExpiry,
      comments,
      isLicense = false
    } = body

    // Validate required fields
    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    // For hardware products, serial number is required
    if (!isLicense && !serialNumber) {
      return NextResponse.json(
        { error: 'Serial number is required for hardware products' },
        { status: 400 }
      )
    }

    // For software products, license number is required
    if (isLicense && !licenseNumber) {
      return NextResponse.json(
        { error: 'License number is required for software products' },
        { status: 400 }
      )
    }

    // Check if serial number already exists (if provided)
    if (serialNumber) {
      const existingInstance = await db.productInstance.findUnique({
        where: { serialNumber }
      })

      if (existingInstance) {
        return NextResponse.json(
          { error: 'Serial number already exists' },
          { status: 400 }
        )
      }
    }

    // Check if product exists
    const product = await db.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Validate business and contact if provided
    if (businessId) {
      const business = await db.business.findUnique({
        where: { id: businessId }
      })
      if (!business) {
        return NextResponse.json(
          { error: 'Business not found' },
          { status: 404 }
        )
      }
    }

    if (contactId) {
      const contact = await db.contact.findUnique({
        where: { id: contactId }
      })
      if (!contact) {
        return NextResponse.json(
          { error: 'Contact not found' },
          { status: 404 }
        )
      }
    }

    const instance = await db.productInstance.create({
      data: {
        serialNumber,
        licenseNumber,
        productId,
        status,
        businessId,
        contactId,
        soldDate: soldDate ? new Date(soldDate) : null,
        warrantyExpiry: warrantyExpiry ? new Date(warrantyExpiry) : null,
        comments,
        isLicense,
        lastUpdatedBy: request.user?.id // Track who created this instance
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            category: true,
            price: true,
            isSerialized: true
          }
        },
        business: {
          select: {
            id: true,
            name: true
          }
        },
        contact: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        lastUpdatedByUser: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json(instance, { status: 201 })
  } catch (error) {
    console.error('Error creating product instance:', error)
    return NextResponse.json(
      { error: 'Failed to create product instance' },
      { status: 500 }
    )
  }
}

export const POST = withAuth(postHandler)