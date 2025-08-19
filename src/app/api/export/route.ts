import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, format } = body

    if (!type || !format) {
      return NextResponse.json({ error: 'Type and format are required' }, { status: 400 })
    }

    let data: any[] = []
    let filename = ''

    switch (type) {
      case 'businesses':
        const businesses = await db.business.findMany({
          include: {
            contacts: true,
            tasks: true,
            notes: true,
            products: {
              include: {
                product: true
              }
            },
            user: true
          }
        })
        data = businesses
        filename = `businesses_${new Date().toISOString().split('T')[0]}`
        break

      case 'quotes':
        const quotes = await db.quote.findMany({
          include: {
            business: true,
            items: {
              include: {
                product: true
              }
            },
            user: true
          }
        })
        data = quotes
        filename = `quotes_${new Date().toISOString().split('T')[0]}`
        break

      case 'products':
        const products = await db.product.findMany()
        data = products
        filename = `products_${new Date().toISOString().split('T')[0]}`
        break

      case 'users':
        const users = await db.user.findMany()
        data = users
        filename = `users_${new Date().toISOString().split('T')[0]}`
        break

      case 'contacts':
        const contacts = await db.contact.findMany({
          include: {
            business: true
          }
        })
        data = contacts
        filename = `contacts_${new Date().toISOString().split('T')[0]}`
        break

      default:
        return NextResponse.json({ error: 'Invalid export type' }, { status: 400 })
    }

    if (format === 'csv') {
      // Convert to CSV
      const csvContent = convertToCSV(data)
      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${filename}.csv"`
        }
      })
    } else if (format === 'json') {
      // Return JSON
      return new NextResponse(JSON.stringify(data, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="${filename}.json"`
        }
      })
    } else {
      return NextResponse.json({ error: 'Invalid format' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error exporting data:', error)
    return NextResponse.json({ error: 'Failed to export data' }, { status: 500 })
  }
}

function convertToCSV(data: any[]): string {
  if (data.length === 0) return ''

  // Get headers from first object
  const headers = Object.keys(data[0])
  
  // Create CSV header
  const csvHeader = headers.join(',')
  
  // Create CSV rows
  const csvRows = data.map(row => {
    return headers.map(header => {
      const value = row[header]
      // Handle nested objects and arrays
      if (typeof value === 'object' && value !== null) {
        return `"${JSON.stringify(value).replace(/"/g, '""')}"`
      }
      // Escape quotes and wrap in quotes if contains comma or quote
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`
      }
      return value
    }).join(',')
  })
  
  return [csvHeader, ...csvRows].join('\n')
}