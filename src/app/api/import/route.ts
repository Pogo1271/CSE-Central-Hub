import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string

    if (!file || !type) {
      return NextResponse.json({ error: 'File and type are required' }, { status: 400 })
    }

    const content = await file.text()
    const results = {
      success: 0,
      errors: [] as string[],
      imported: [] as any[]
    }

    try {
      if (file.name.endsWith('.csv')) {
        // Parse CSV
        const lines = content.split('\n')
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
        
        for (let i = 1; i < lines.length; i++) {
          if (lines[i].trim() === '') continue
          
          try {
            const values = parseCSVLine(lines[i])
            const record: any = {}
            
            headers.forEach((header, index) => {
              record[header] = values[index] || ''
            })
            
            await processRecord(type, record, results)
          } catch (error) {
            results.errors.push(`Row ${i + 1}: ${error}`)
          }
        }
      } else if (file.name.endsWith('.json')) {
        // Parse JSON
        const records = JSON.parse(content)
        
        if (Array.isArray(records)) {
          for (const record of records) {
            try {
              await processRecord(type, record, results)
            } catch (error) {
              results.errors.push(`Record: ${error}`)
            }
          }
        } else {
          await processRecord(type, records, results)
        }
      } else {
        return NextResponse.json({ error: 'Unsupported file format. Please use CSV or JSON.' }, { status: 400 })
      }
    } catch (error) {
      return NextResponse.json({ error: `Failed to parse file: ${error}` }, { status: 400 })
    }

    return NextResponse.json({
      message: `Import completed. ${results.success} records imported successfully.`,
      results
    })
  } catch (error) {
    console.error('Error importing data:', error)
    return NextResponse.json({ error: 'Failed to import data' }, { status: 500 })
  }
}

async function processRecord(type: string, record: any, results: any) {
  try {
    switch (type) {
      case 'businesses':
        const business = await db.business.create({
          data: {
            name: record.name || '',
            description: record.description || null,
            category: record.category || null,
            location: record.location || null,
            phone: record.phone || null,
            email: record.email || null,
            website: record.website || null,
            status: record.status || 'Active',
            supportContract: record.supportContract === true || record.supportContract === 'true',
            supportExpiry: record.supportExpiry ? new Date(record.supportExpiry) : null
          }
        })
        results.imported.push(business)
        results.success++
        break

      case 'products':
        await db.product.create({
          data: {
            name: record.name || '',
            description: record.description || null,
            price: parseFloat(record.price) || 0,
            pricingType: record.pricingType || 'one-off',
            category: record.category || null,
            sku: record.sku || null
          }
        })
        results.success++
        break

      case 'users':
        await db.user.create({
          data: {
            email: record.email || '',
            name: record.name || null,
            role: record.role || 'User',
            status: record.status || 'Active',
            color: record.color || '#3B82F6',
            joined: record.joined ? new Date(record.joined) : new Date()
          }
        })
        results.success++
        break

      case 'contacts':
        if (!record.businessId) {
          throw new Error('Business ID is required for contacts')
        }
        await db.contact.create({
          data: {
            name: record.name || '',
            email: record.email || null,
            phone: record.phone || null,
            position: record.position || null,
            businessId: record.businessId
          }
        })
        results.success++
        break

      default:
        throw new Error(`Unsupported import type: ${type}`)
    }
  } catch (error) {
    throw error
  }
}

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++ // Skip next quote
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  
  result.push(current.trim())
  return result
}