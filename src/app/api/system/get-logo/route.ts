import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Get logo URL from system config
    const logoConfig = await db.systemConfig.findUnique({
      where: { key: 'company_logo_url' }
    })

    if (logoConfig && logoConfig.value) {
      return NextResponse.json({ 
        success: true, 
        url: logoConfig.value 
      })
    }

    // Return default logo if none is configured
    return NextResponse.json({ 
      success: true, 
      url: '/assets/company-logo.png' 
    })

  } catch (error) {
    console.error('Error getting logo:', error)
    return NextResponse.json({ error: 'Failed to get logo' }, { status: 500 })
  }
}