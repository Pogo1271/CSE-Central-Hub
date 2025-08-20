import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Get all notes from all businesses
    const businesses = await db.business.findMany({
      include: {
        notes: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    // Flatten all notes and add business information
    const allNotes = []
    for (const business of businesses) {
      for (const note of business.notes) {
        allNotes.push({
          ...note,
          businessId: business.id,
          businessName: business.name
        })
      }
    }

    // Sort by creation date (newest first)
    allNotes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return NextResponse.json(allNotes)
  } catch (error) {
    console.error('Error fetching notes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notes' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, content, businessId } = body

    if (!title || !content || !businessId) {
      return NextResponse.json(
        { error: 'Title, content, and business ID are required' },
        { status: 400 }
      )
    }

    // Check if business exists
    const business = await db.business.findUnique({
      where: { id: businessId }
    })

    if (!business) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      )
    }

    // Create the note
    const note = await db.note.create({
      data: {
        title,
        content,
        businessId,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    return NextResponse.json(note)
  } catch (error) {
    console.error('Error creating note:', error)
    return NextResponse.json(
      { error: 'Failed to create note' },
      { status: 500 }
    )
  }
}