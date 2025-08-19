import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; contactId: string } }
) {
  try {
    const businessId = params.id
    const contactId = params.contactId
    const body = await request.json()

    const contact = await db.contact.update({
      where: {
        id: contactId,
        businessId: businessId
      },
      data: body
    })

    return NextResponse.json(contact)
  } catch (error) {
    console.error('Error updating contact:', error)
    return NextResponse.json(
      { error: 'Failed to update contact' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; contactId: string } }
) {
  try {
    const businessId = params.id
    const contactId = params.contactId

    await db.contact.delete({
      where: {
        id: contactId,
        businessId: businessId
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting contact:', error)
    return NextResponse.json(
      { error: 'Failed to delete contact' },
      { status: 500 }
    )
  }
}