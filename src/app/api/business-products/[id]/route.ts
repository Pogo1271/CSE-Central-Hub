import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withAuth, AuthenticatedRequest } from '@/lib/middleware'

const getHandler = async (request: AuthenticatedRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params
    const assignment = await db.businessProduct.findUnique({
      where: { id },
      include: {
        product: true,
        business: true,
        assignedByUser: {
          select: { id: true, name: true }
        }
      }
    })

    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
    }

    return NextResponse.json(assignment)
  } catch (error) {
    console.error('Error fetching business product assignment:', error)
    return NextResponse.json({ error: 'Failed to fetch business product assignment' }, { status: 500 })
  }
}

export const GET = withAuth(getHandler)

const putHandler = async (request: AuthenticatedRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params
    const body = await request.json()
    const {
      quantity,
      status,
      notes,
      validFrom,
      validTo
    } = body

    // Check if assignment exists
    const existingAssignment = await db.businessProduct.findUnique({
      where: { id }
    })

    if (!existingAssignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
    }

    // Update the assignment
    const assignment = await db.businessProduct.update({
      where: { id },
      data: {
        quantity: quantity !== undefined ? quantity : existingAssignment.quantity,
        status: status !== undefined ? status : existingAssignment.status,
        notes: notes !== undefined ? notes : existingAssignment.notes,
        validFrom: validFrom ? new Date(validFrom) : existingAssignment.validFrom,
        validTo: validTo ? new Date(validTo) : existingAssignment.validTo
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
    console.error('Error updating business product assignment:', error)
    return NextResponse.json({ error: 'Failed to update business product assignment' }, { status: 500 })
  }
}

export const PUT = withAuth(putHandler)

const deleteHandler = async (request: AuthenticatedRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params

    // Check if assignment exists
    const existingAssignment = await db.businessProduct.findUnique({
      where: { id }
    })

    if (!existingAssignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
    }

    // Delete the assignment
    await db.businessProduct.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting business product assignment:', error)
    return NextResponse.json({ error: 'Failed to delete business product assignment' }, { status: 500 })
  }
}

export const DELETE = withAuth(deleteHandler)