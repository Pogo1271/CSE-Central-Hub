import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withAuth, AuthenticatedRequest } from '@/lib/middleware'

const postHandler = async (request: AuthenticatedRequest) => {
  try {
    const body = await request.json()
    const { operation, instances } = body

    if (!operation || !instances || !Array.isArray(instances)) {
      return NextResponse.json(
        { error: 'Operation and instances array are required' },
        { status: 400 }
      )
    }

    let results = []

    switch (operation) {
      case 'create':
        results = await createInstances(instances, request.user?.id)
        break
      case 'update':
        results = await updateInstances(instances, request.user?.id)
        break
      case 'delete':
        results = await deleteInstances(instances)
        break
      default:
        return NextResponse.json(
          { error: 'Invalid operation. Use: create, update, or delete' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      operation,
      processed: instances.length,
      results
    })
  } catch (error) {
    console.error('Error in bulk operation:', error)
    return NextResponse.json(
      { error: 'Failed to perform bulk operation' },
      { status: 500 }
    )
  }
}

export const POST = withAuth(postHandler)

async function createInstances(instances: any[], userId?: string): Promise<any[]> {
  const results: any[] = []

  for (const instanceData of instances) {
    try {
      const { serialNumber, productId, status = 'in-stock', businessId, contactId, soldDate, warrantyExpiry, comments } = instanceData

      // Validate required fields
      if (!serialNumber || !productId) {
        results.push({ error: 'Serial number and product ID are required', data: instanceData })
        continue
      }

      // Check if serial number already exists
      const existingInstance = await db.productInstance.findUnique({
        where: { serialNumber }
      })

      if (existingInstance) {
        results.push({ error: 'Serial number already exists', data: instanceData })
        continue
      }

      // Check if product exists and is serialized
      const product = await db.product.findUnique({
        where: { id: productId }
      })

      if (!product) {
        results.push({ error: 'Product not found', data: instanceData })
        continue
      }

      if (!product.isSerialized) {
        results.push({ error: 'Product is not configured for serial number tracking', data: instanceData })
        continue
      }

      const instance = await db.productInstance.create({
        data: {
          serialNumber,
          productId,
          status,
          businessId,
          contactId,
          soldDate: soldDate ? new Date(soldDate) : null,
          warrantyExpiry: warrantyExpiry ? new Date(warrantyExpiry) : null,
          comments,
          lastUpdatedBy: userId // Track who created this instance
        },
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
          }
        }
      })

      results.push({ success: true, data: instance })
    } catch (error) {
      results.push({ error: error.message, data: instanceData })
    }
  }

  return results
}

async function updateInstances(instances: any[], userId?: string): Promise<any[]> {
  const results: any[] = []

  for (const instanceData of instances) {
    try {
      const { id, ...updateFields } = instanceData

      if (!id) {
        results.push({ error: 'Instance ID is required for updates', data: instanceData })
        continue
      }

      // Check if instance exists
      const existingInstance = await db.productInstance.findUnique({
        where: { id }
      })

      if (!existingInstance) {
        results.push({ error: 'Product instance not found', data: instanceData })
        continue
      }

      // If changing serial number, check if it already exists
      if (updateFields.serialNumber && updateFields.serialNumber !== existingInstance.serialNumber) {
        const duplicateInstance = await db.productInstance.findUnique({
          where: { serialNumber: updateFields.serialNumber }
        })

        if (duplicateInstance) {
          results.push({ error: 'Serial number already exists', data: instanceData })
          continue
        }
      }

      const updateData: any = {
        updatedAt: new Date(),
        lastUpdatedBy: userId // Track who updated this instance
      }

      Object.keys(updateFields).forEach(key => {
        if (updateFields[key] !== undefined) {
          if (key === 'soldDate' || key === 'warrantyExpiry') {
            updateData[key] = updateFields[key] ? new Date(updateFields[key]) : null
          } else {
            updateData[key] = updateFields[key]
          }
        }
      })

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
          }
        }
      })

      results.push({ success: true, data: instance })
    } catch (error) {
      results.push({ error: error.message, data: instanceData })
    }
  }

  return results
}

async function deleteInstances(instances: any[]): Promise<any[]> {
  const results: any[] = []

  for (const instanceData of instances) {
    try {
      const { id } = instanceData

      if (!id) {
        results.push({ error: 'Instance ID is required for deletion', data: instanceData })
        continue
      }

      // Check if instance exists
      const existingInstance = await db.productInstance.findUnique({
        where: { id }
      })

      if (!existingInstance) {
        results.push({ error: 'Product instance not found', data: instanceData })
        continue
      }

      await db.productInstance.delete({
        where: { id }
      })

      results.push({ success: true, data: { id, deleted: true } })
    } catch (error) {
      results.push({ error: error.message, data: instanceData })
    }
  }

  return results
}