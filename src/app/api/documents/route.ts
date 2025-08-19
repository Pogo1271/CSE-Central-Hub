import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    
    const where: any = {}
    
    if (category && category !== 'All') {
      where.category = category
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { type: { contains: search, mode: 'insensitive' } },
        { uploadedBy: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    const documents = await db.document.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json(documents)
  } catch (error) {
    console.error('Error fetching documents:', error)
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      name, 
      type, 
      size, 
      path, 
      category, 
      uploadedBy 
    } = body
    
    // Validate required fields
    if (!name || !path) {
      return NextResponse.json({ error: 'Name and path are required' }, { status: 400 })
    }
    
    const document = await db.document.create({
      data: {
        name,
        type,
        size,
        path,
        category: category || 'General',
        uploadedBy: uploadedBy || 'Unknown'
      }
    })
    
    return NextResponse.json(document)
  } catch (error) {
    console.error('Error creating document:', error)
    return NextResponse.json({ error: 'Failed to create document' }, { status: 500 })
  }
}