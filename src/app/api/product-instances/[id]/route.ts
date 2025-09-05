import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withAuth, AuthenticatedRequest } from '@/lib/middleware'

const getHandler = async (
  request: AuthenticatedRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params
    const instance = await db.productInstance.findUnique({
      where: { id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            category: true,
            price: true
          }
        },
        business: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
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

    if (!instance) {
      return NextResponse.json(
        { error: 'Product instance not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(instance)
  } catch (error) {
    console.error('Error fetching product instance:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product instance' },
      { status: 500 }
    )
  }
}

export const GET = withAuth(getHandler)

const putHandler = async (
  request: AuthenticatedRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params
    const body = await request.json()
    console.log('PUT request body:', body)
    
    const {
      serialNumber,
      status,
      businessId,
      contactId,
      soldDate,
      warrantyExpiry,
      comments,
      lastUpdatedBy
    } = body

    // Validate lastUpdatedBy if provided and create a mutable variable
    let validatedLastUpdatedBy = lastUpdatedBy
    if (lastUpdatedBy) {
      const user = await db.user.findUnique({
        where: { id: lastUpdatedBy }
      })
      if (!user) {
        console.log('User not found for lastUpdatedBy:', lastUpdatedBy)
        // Don't fail the update, just don't set the lastUpdatedBy field
        validatedLastUpdatedBy = null
      }
    }

    // Check if instance exists
    const existingInstance = await db.productInstance.findUnique({
      where: { id }
    })

    if (!existingInstance) {
      console.log('Instance not found:', id)
      return NextResponse.json(
        { error: 'Product instance not found' },
        { status: 404 }
      )
    }

    // If changing serial number, check if it already exists
    if (serialNumber && serialNumber !== existingInstance.serialNumber) {
      const duplicateInstance = await db.productInstance.findUnique({
        where: { serialNumber }
      })

      if (duplicateInstance) {
        console.log('Serial number already exists:', serialNumber)
        return NextResponse.json(
          { error: 'Serial number already exists' },
          { status: 400 }
        )
      }
    }

    // Validate business and contact if provided
    if (businessId) {
      const business = await db.business.findUnique({
        where: { id: businessId }
      })
      if (!business) {
        console.log('Business not found:', businessId)
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
        console.log('Contact not found:', contactId)
        return NextResponse.json(
          { error: 'Contact not found' },
          { status: 404 }
        )
      }
    }

    const updateData: any = {
      updatedAt: new Date()
    }

    if (serialNumber !== undefined) updateData.serialNumber = serialNumber
    if (status !== undefined) updateData.status = status
    if (businessId !== undefined) updateData.businessId = businessId
    if (contactId !== undefined) updateData.contactId = contactId
    if (soldDate !== undefined) updateData.soldDate = soldDate ? new Date(soldDate) : null
    if (warrantyExpiry !== undefined) updateData.warrantyExpiry = warrantyExpiry ? new Date(warrantyExpiry) : null
    if (comments !== undefined) updateData.comments = comments
    if (validatedLastUpdatedBy !== undefined && validatedLastUpdatedBy !== null) updateData.lastUpdatedBy = validatedLastUpdatedBy

    console.log('Update data:', updateData)

    const instance = await db.productInstance.update({
      where: { id },
      data: updateData,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            category: true,
            price: true
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

    console.log('Updated instance:', instance)
    return NextResponse.json(instance)
  } catch (error) {
    console.error('Error updating product instance:', error)
    return NextResponse.json(
      { error: 'Failed to update product instance', details: error.message },
      { status: 500 }
    )
  }
}

export const PUT = withAuth(putHandler)

const deleteHandler = async (
  request: AuthenticatedRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params
    
    // Check if instance exists
    const existingInstance = await db.productInstance.findUnique({
      where: { id }
    })

    if (!existingInstance) {
      return NextResponse.json(
        { error: 'Product instance not found' },
        { status: 404 }
      )
    }

    await db.productInstance.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Product instance deleted successfully' })
  } catch (error) {
    console.error('Error deleting product instance:', error)
    return NextResponse.json(
      { error: 'Failed to delete product instance' },
      { status: 500 }
    )
  }
}

export const DELETE = withAuth(deleteHandler)