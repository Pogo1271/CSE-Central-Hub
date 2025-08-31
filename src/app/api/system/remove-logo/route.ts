import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { writeFile } from 'fs/promises'
import { join } from 'path'

export async function DELETE(request: NextRequest) {
  try {
    // Get current logo URL from system config
    const logoConfig = await db.systemConfig.findUnique({
      where: { key: 'company_logo_url' }
    })

    if (logoConfig && logoConfig.value) {
      // Try to delete the file (optional - you might want to keep it)
      try {
        const filePath = join(process.cwd(), 'public', logoConfig.value)
        await writeFile(filePath, '') // Empty the file instead of deleting
      } catch (error) {
        console.log('Could not remove logo file:', error)
      }

      // Remove from system config
      await db.systemConfig.delete({
        where: { key: 'company_logo_url' }
      })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Logo removed successfully' 
    })

  } catch (error) {
    console.error('Error removing logo:', error)
    return NextResponse.json({ error: 'Failed to remove logo' }, { status: 500 })
  }
}