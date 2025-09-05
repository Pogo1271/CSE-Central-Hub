import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withAuth, AuthenticatedRequest } from '@/lib/middleware'

const getHandler = async (request: AuthenticatedRequest) => {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    const businessId = searchParams.get('businessId')
    const status = searchParams.get('status')

    let whereClause: any = {}

    if (productId) {
      whereClause.productId = productId
    }

    if (businessId) {
      whereClause.businessId = businessId
    }

    if (status) {
      whereClause.status = status
    }

    const instances = await db.productInstance.findMany({
      where: whereClause,
      include: {
        product: {
          select: {
            name: true,
            category: true
          }
        },
        business: {
          select: {
            name: true
          }
        },
        contact: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Generate CSV content matching the spreadsheet format
    const headers = [
      'Serial Number',
      'Customer',
      'Comments',
      'Sold',
      'On Car',
      'Office Use',
      'Back in Stock',
      'Swapped'
    ]

    const csvRows = [
      headers.join(','),
      ...instances.map(instance => [
        instance.serialNumber,
        `"${instance.business?.name || ''}"`,
        `"${instance.comments || ''}"`,
        instance.status === 'sold' ? '✓' : '',
        instance.status === 'on-car' ? '✓' : '',
        instance.status === 'office-use' ? '✓' : '',
        instance.status === 'in-stock' ? '✓' : '',
        instance.status === 'swapped' ? '✓' : ''
      ].join(','))
    ]

    const csvContent = csvRows.join('\n')

    // Create response with CSV headers
    const response = new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="serial-numbers-${new Date().toISOString().split('T')[0]}.csv"`
      }
    })

    return response
  } catch (error) {
    console.error('Error exporting product instances:', error)
    return NextResponse.json(
      { error: 'Failed to export product instances' },
      { status: 500 }
    )
  }
}

export const GET = withAuth(getHandler)