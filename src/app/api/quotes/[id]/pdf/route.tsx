import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { 
  Document, 
  Page, 
  Text, 
  View, 
  StyleSheet, 
  PDFViewer, 
  PDFDownloadLink,
  Image,
  Font,
  Link
} from '@react-pdf/renderer'
import { getQuoteTemplate, DEFAULT_TEMPLATE } from '@/lib/quote-templates'

// Function to get company logo as base64 with improved handling
async function getCompanyLogoUrl() {
  try {
    // Try to get configured logo from database
    const logoConfig = await db.systemConfig.findUnique({
      where: { key: 'company_logo_url' }
    })
    
    let logoPath = '/assets/company-logo.png' // default
    
    if (logoConfig && logoConfig.value) {
      logoPath = logoConfig.value
    }
    
    // For server-side PDF generation, we need to convert the image to base64
    // Since we're in a Next.js server environment, we can read the file directly
    const fs = await import('fs/promises')
    const path = await import('path')
    
    try {
      // Try to read the logo file from the public directory
      const publicPath = path.join(process.cwd(), 'public', logoPath.replace(/^\//, ''))
      const imageBuffer = await fs.readFile(publicPath)
      
      // Convert to base64 data URL
      const base64 = imageBuffer.toString('base64')
      const ext = path.extname(publicPath).toLowerCase()
      const mimeType = ext === '.png' ? 'image/png' : ext === '.svg' ? 'image/svg+xml' : 'image/jpeg'
      
      return `data:${mimeType};base64,${base64}`
    } catch (fileError) {
      console.warn('Could not read logo file, using fallback:', fileError.message)
      
      // Create a simple SVG fallback
      const svgFallback = `
        <svg width="120" height="120" xmlns="http://www.w3.org/2000/svg">
          <rect width="120" height="120" fill="#1F2937" rx="8"/>
          <text x="60" y="60" text-anchor="middle" dy="0.3em" fill="white" font-family="Arial" font-size="14" font-weight="bold">CSE</text>
          <text x="60" y="80" text-anchor="middle" dy="0.3em" fill="white" font-family="Arial" font-size="10">Central Hub</text>
        </svg>
      `
      
      const base64 = Buffer.from(svgFallback).toString('base64')
      return `data:image/svg+xml;base64,${base64}`
    }
  } catch (error) {
    console.error('Error getting company logo:', error)
    
    // Ultimate fallback
    const svgFallback = `
      <svg width="120" height="120" xmlns="http://www.w3.org/2000/svg">
        <rect width="120" height="120" fill="#1F2937" rx="8"/>
        <text x="60" y="60" text-anchor="middle" dy="0.3em" fill="white" font-family="Arial" font-size="14" font-weight="bold">CSE</text>
        <text x="60" y="80" text-anchor="middle" dy="0.3em" fill="white" font-family="Arial" font-size="10">Central Hub</text>
      </svg>
    `
    
    const base64 = Buffer.from(svgFallback).toString('base64')
    return `data:image/svg+xml;base64,${base64}`
  }
}

// Simple in-memory cache for PDF generation
const pdfCache = new Map<string, { data: Buffer; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// Function to generate cache key that includes logo URL and template
function generateCacheKey(quoteId: string, logoUrl: string, templateId: string) {
  return `${quoteId}:${logoUrl}:${templateId}`
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const quoteId = (await params).id
    
    console.log('Generating new PDF:', quoteId)
    
    const quote = await db.quote.findUnique({
      where: { id: quoteId },
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
    
    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
    }
    
    // Generate PDF with performance tracking
    const startTime = Date.now()
    const logoUrl = await getCompanyLogoUrl()
    
    // Get template (you can make this dynamic based on user preference or quote type)
    const template = DEFAULT_TEMPLATE // For now, use default template
    
    // Generate cache key that includes logo URL and template
    const cacheKey = generateCacheKey(quoteId, logoUrl, template.id)
    
    // Check cache with new key
    const cached = pdfCache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('Serving PDF from cache:', cacheKey)
      return new NextResponse(cached.data, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="quote-${quoteId.slice(-6)}.pdf"`,
          'X-Cache': 'HIT'
        }
      })
    }
    
    const pdfBlob = await generateQuotePDF(quote, logoUrl, template)
    const generationTime = Date.now() - startTime
    
    console.log(`PDF generated in ${generationTime}ms for quote ${quoteId}`)
    
    // Cache the result with new key
    pdfCache.set(cacheKey, {
      data: pdfBlob,
      timestamp: Date.now()
    })
    
    // Clean up old cache entries
    if (pdfCache.size > 50) {
      const oldestKey = pdfCache.keys().next().value
      pdfCache.delete(oldestKey)
    }
    
    // Return PDF as downloadable file
    return new NextResponse(pdfBlob, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="quote-${quoteId.slice(-6)}.pdf"`,
        'X-Cache': 'MISS',
        'X-Generation-Time': generationTime.toString()
      }
    })
  } catch (error) {
    console.error('Error generating PDF:', error)
    return NextResponse.json({ 
      error: 'Failed to generate PDF',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Create styles function based on template
function createStyles(template: any) {
  return StyleSheet.create({
    page: {
      flexDirection: 'column',
      backgroundColor: '#FFFFFF',
      padding: 30, // Reduced from 40 to 30 for more content space
      fontFamily: 'Helvetica',
      position: 'relative',
    },
    // Background design elements - more subtle approach
    backgroundAccent: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: -1,
    },
    topAccent: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 2,
      backgroundColor: '#e63946',
      opacity: 1, // Changed from 0.3 to 1 for full opacity
    },
    bottomAccent: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 1,
      backgroundColor: '#e63946',
      opacity: 1, // Changed from 0.3 to 1 for full opacity
    },
    sideAccentLeft: {
      position: 'absolute',
      top: 0,
      left: 0,
      bottom: 0,
      width: 1,
      backgroundColor: '#e63946',
      opacity: 1, // Changed from 0.2 to 1 for full opacity
    },
    // Creative background elements with softer red - improved for readability
    backgroundCircle: {
      position: 'absolute',
      width: 150, // Reduced from 200
      height: 150, // Reduced from 200
      borderRadius: 75, // Half of width/height
      backgroundColor: '#f87171',
      opacity: 0.03, // Reduced from 0.1 to prevent dark overlaps
    },
    backgroundCircleTopRight: {
      top: -30, // Adjusted position
      right: -30, // Adjusted position
    },
    backgroundCircleBottomLeft: {
      bottom: -30, // Adjusted position
      left: -30, // Adjusted position
    },
    backgroundCircleTopLeft: {
      top: -20, // New position
      left: -20, // New position
      width: 100, // Smaller size
      height: 100, // Smaller size
      borderRadius: 50, // Half of width/height
    },
    backgroundCircleBottomRight: {
      bottom: -20, // New position
      right: -20, // New position
      width: 120, // Smaller size
      height: 120, // Smaller size
      borderRadius: 60, // Half of width/height
    },
    backgroundDiagonal: {
      position: 'absolute',
      top: -100, // Moved further away from content
      right: -100, // Moved further away from content
      width: 200, // Reduced from 300
      height: 200, // Reduced from 300
      backgroundColor: '#f87171',
      opacity: 0.02, // Reduced from 0.05 for even more subtlety
      transform: 'rotate(45deg)',
      transformOrigin: 'top right',
    },
    cornerDecoration: {
      position: 'absolute',
      width: 80,
      height: 80,
      border: '1 solid #e63946',
      opacity: 1, // Changed from 0.05 to 1 for full opacity
    },
    cornerDecorationTopRight: {
      top: 20,
      right: 20,
      borderBottom: 'none',
      borderLeft: 'none',
    },
    cornerDecorationBottomLeft: {
      bottom: 20,
      left: 20,
      borderTop: 'none',
      borderRight: 'none',
    },
    // Cover Page Styles
    coverPage: {
      flex: 1,
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-end', // Changed from 'center' to move elements to bottom
      paddingBottom: 80, // Add padding from bottom
      minHeight: '70%', // Ensure cover page takes good portion of page
      position: 'relative',
    },
    coverLogoContainer: {
      marginBottom: 50, // Reduced from 60
    },
    coverLogo: {
      width: 240,
      height: 80,
      objectFit: 'contain',
    },
    coverTitle: {
      fontSize: 48,
      fontWeight: 'bold',
      color: '#1F2937',
      marginBottom: 20, // Reduced from 24
    },
    coverSubtitle: {
      fontSize: 18,
      color: '#6B7280',
      marginBottom: 60, // Reduced from 80
    },
    coverInfoContainer: {
      width: '100%',
      maxWidth: 672,
      flexDirection: 'row', // Changed back to row for side-by-side layout
      alignItems: 'flex-start', // Align items to top
      justifyContent: 'space-between', // Space boxes evenly
    },
    coverInfoBox: {
      width: '48%', // Each box takes up roughly half the width
      backgroundColor: '#F9FAFB',
      borderRadius: 8,
      padding: 20,
      borderLeft: '4 solid #e63946', // Original logo red
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      alignItems: 'center',
    },
    coverInfoColumn: {
      flex: 1,
      alignItems: 'center', // Center content in each column
    },
    coverInfoSection: {
      width: '100%',
      alignItems: 'center',
    },
    coverSectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#e63946', // Original logo red
      marginBottom: 12, // Reduced from 16
      textAlign: 'center', // Center the title text
    },
    coverBusinessName: {
      fontSize: 14,
      fontWeight: 'bold',
      color: '#1F2937',
      marginBottom: 3, // Reduced from 4
      textAlign: 'center', // Center the business name
    },
    coverBusinessInfo: {
      fontSize: 12,
      color: '#1F2937',
      marginBottom: 1, // Reduced from 2
      textAlign: 'center', // Center the business info
    },
    coverDetailLabel: {
      fontSize: 12,
      fontWeight: 'bold',
      color: '#1F2937',
      marginBottom: 1, // Added spacing
      textAlign: 'center', // Center the detail labels
    },
    coverDetailValue: {
      fontSize: 12,
      color: '#1F2937',
      marginBottom: 2, // Added spacing between rows
      textAlign: 'center', // Center the detail values
    },
    
    // Content Page Styles
    contentPage: {
      flex: 1,
      flexDirection: 'column',
      position: 'relative',
    },
    pageHeader: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginBottom: 25, // Reduced from 32
      borderBottom: '1 solid #E5E7EB', // Changed to light grey
      opacity: 1, // Changed from 0.3 to 1 for full opacity
      paddingBottom: 12,
    },
    pageHeaderInfo: {
      alignItems: 'flex-end',
    },
    pageHeaderCompany: {
      fontSize: 12,
      fontWeight: 'bold',
      color: '#e63946', // Original logo red
      marginBottom: 1, // Reduced from 2
      opacity: 1, // Ensure 100% opacity
    },
    pageHeaderDetail: {
      fontSize: 10,
      color: '#1F2937',
      marginBottom: 0, // Removed spacing
      opacity: 1, // Ensure 100% opacity
    },
    sectionTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#1F2937',
      marginBottom: 16, // Reduced from 24 to save space and prevent blank pages
      position: 'relative',
      opacity: 1, // Ensure 100% opacity
    },
    sectionDivider: {
      borderBottom: '2 solid #e63946', // Original logo red
      marginBottom: 12, // Reduced from 20 to save space and prevent blank pages
      width: 40,
      opacity: 1, // Ensure 100% opacity
    },
    table: {
      width: '100%',
      marginBottom: 15, // Reduced from 25 to save space and prevent blank pages
      border: '1 solid #E5E7EB',
      borderRadius: 4,
      overflow: 'hidden',
    },
    tableHeader: {
      flexDirection: 'row',
      backgroundColor: '#F9FAFB',
      borderBottom: '2 solid #e63946', // Original logo red
      paddingTop: 12, // Increased from 0 to add top padding
      paddingBottom: 12, // Increased from 6 to add bottom padding
      marginBottom: 8, // Increased from 6 to add more space before table rows
    },
    tableHeaderCell: {
      fontSize: 12,
      fontWeight: 'bold',
      color: '#1F2937',
    },
    tableHeaderCellLeft: {
      flex: 4,
      paddingLeft: 12, // Added left padding to match table cells
      paddingRight: 8, // Added right padding for better spacing
    },
    tableHeaderCellRight: {
      flex: 1,
      textAlign: 'right',
      paddingLeft: 8, // Added left padding for better spacing
      paddingRight: 12, // Added right padding to match table cells
    },
    tableRow: {
      flexDirection: 'row',
      borderBottom: '1 solid #E5E7EB',
      paddingTop: 12, // Increased from 8
      paddingBottom: 12, // Increased from 8
      backgroundColor: '#FFFFFF',
    },
    tableRowEven: {
      backgroundColor: '#F9FAFB',
    },
    tableCellLeft: {
      flex: 4,
      fontSize: 11,
      color: '#1F2937',
      paddingLeft: 12, // Added left padding to bring content away from edge
      paddingRight: 8, // Added right padding for better spacing
    },
    tableCellRight: {
      flex: 1,
      fontSize: 11,
      color: '#1F2937',
      textAlign: 'right',
      paddingLeft: 8, // Added left padding for better spacing
      paddingRight: 12, // Added right padding to bring content away from edge
    },
    pricingContainer: {
      width: 256,
      alignSelf: 'flex-end',
      marginBottom: 20, // Reduced from 35 to save space and prevent blank pages
      backgroundColor: '#F9FAFB',
      border: '1 solid #E5E7EB',
      borderRadius: 4,
      padding: 12,
    },
    pricingRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 5, // Reduced from 8
    },
    pricingLabel: {
      fontSize: 11,
      color: '#1F2937',
    },
    pricingValue: {
      fontSize: 11,
      color: '#1F2937',
    },
    pricingTotalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 6, // Reduced from 8
      paddingTop: 6, // Reduced from 8
      borderTop: '2 solid #e63946', // Original logo red
    },
    pricingTotalLabel: {
      fontSize: 11,
      fontWeight: 'bold',
      color: '#1F2937',
    },
    pricingTotalValue: {
      fontSize: 11,
      fontWeight: 'bold',
      color: '#e63946', // Original logo red
    },
    
    // Terms Page Styles - Optimized for better spacing
    termsSection: {
      marginBottom: 12, // Reduced from 18 to save space and prevent blank pages
    },
    termsBox: {
      backgroundColor: '#F9FAFB',
      borderLeft: '4 solid #e63946', // Original logo red
      paddingLeft: 14, // Reduced from 16
      paddingVertical: 12, // Reduced from 16
      marginBottom: 18, // Reduced from 24
      borderRadius: 4,
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
    },
    termsBoxTitle: {
      fontSize: 16, // Reduced from 18
      fontWeight: 'bold',
      color: '#1F2937',
      marginBottom: 6, // Reduced from 8
    },
    termsBoxContent: {
      fontSize: 9, // Reduced from 10
      color: '#1F2937',
      lineHeight: 1.3, // Reduced from 1.4
    },
    termsList: {
      marginLeft: 14, // Reduced from 16
      marginBottom: 6, // Reduced from 8
    },
    termsListItem: {
      fontSize: 9, // Reduced from 10
      color: '#1F2937',
      marginBottom: 5, // Reduced from 8
      lineHeight: 1.3, // Reduced from 1.4
    },
    termsBold: {
      fontWeight: 'bold',
      color: '#e63946', // Original logo red
    },
    
    // Footer Styles
    pageNumber: {
      fontSize: 9, // Reduced from 10
      color: '#6B7280',
      textAlign: 'center',
      marginTop: 'auto',
      paddingTop: 12, // Reduced from 16
      borderTop: '1 solid #E5E7EB', // Changed to light grey
      opacity: 1, // Changed from 0.3 to 1 for full opacity
    },
  })
}

// Generate PDF function
async function generateQuotePDF(quote: any, logoUrl: string, template: any) {
  try {
    // Import the PDF rendering functions and Font
    const { renderToStream, renderToBuffer, Font } = await import('@react-pdf/renderer')
    
    // Register fonts if needed
    try {
      // Try to register Georgia font, fallback to Helvetica if not available
      Font.register({
        family: 'Georgia',
        src: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf',
        fallback: 'Helvetica'
      })
      Font.register({
        family: 'Georgia-Bold',
        src: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Medium.ttf',
        fallback: 'Helvetica-Bold'
      })
      Font.register({
        family: 'Times-Roman',
        fallback: 'Helvetica'
      })
      Font.register({
        family: 'Times-Bold',
        fallback: 'Helvetica-Bold'
      })
    } catch (fontError) {
      console.warn('Font registration failed, using fallbacks:', fontError.message)
    }
    
    // Create the PDF document component
    const pdfDocument = createQuoteDocument(quote, logoUrl, template)
    
    // Try renderToBuffer first, fallback to renderToStream if needed
    try {
      const pdfBuffer = await renderToBuffer(pdfDocument)
      return pdfBuffer
    } catch (bufferError) {
      console.warn('renderToBuffer failed, trying renderToStream:', bufferError.message)
      const pdfStream = await renderToStream(pdfDocument)
      
      // Convert stream to buffer
      const chunks: Buffer[] = []
      for await (const chunk of pdfStream) {
        chunks.push(chunk)
      }
      return Buffer.concat(chunks)
    }
  } catch (error) {
    console.error('Error generating PDF:', error)
    throw new Error('Failed to generate PDF')
  }
}

// Create PDF document component function
function createQuoteDocument(quote: any, logoUrl: string, template: any) {
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount)
  }

  // Separate items by pricing type
  const oneOffItems = quote.items.filter((item: any) => item.product.pricingType === 'one-off')
  const monthlyItems = quote.items.filter((item: any) => item.product.pricingType === 'monthly')
  
  // Calculate totals
  const oneOffTotal = oneOffItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0)
  const monthlyTotal = monthlyItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0)
  const grandTotal = quote.totalAmount
  const subtotal = grandTotal / 1.2
  const vat = grandTotal * 0.2 / 1.2

  const styles = createStyles(template)

  return (
    <Document>
      {/* Page 1: Cover Page */}
      <Page size="A4" style={styles.page}>
        {/* Background Design Elements */}
        <View style={styles.backgroundAccent}>
          <View style={styles.topAccent} />
          <View style={styles.bottomAccent} />
          <View style={styles.sideAccentLeft} />
          {/* Creative background elements with softer red - improved positioning */}
          <View style={[styles.backgroundCircle, styles.backgroundCircleTopRight]} />
          <View style={[styles.backgroundCircle, styles.backgroundCircleBottomLeft]} />
          <View style={[styles.backgroundCircle, styles.backgroundCircleTopLeft]} />
          <View style={[styles.backgroundCircle, styles.backgroundCircleBottomRight]} />
          <View style={styles.backgroundDiagonal} />
          <View style={[styles.cornerDecoration, styles.cornerDecorationTopRight]} />
          <View style={[styles.cornerDecoration, styles.cornerDecorationBottomLeft]} />
        </View>
        
        <View style={styles.coverPage}>
          {/* Logo */}
          <View style={styles.coverLogoContainer}>
            <Image src={logoUrl} style={styles.coverLogo} alt="Company Logo" />
          </View>
          
          {/* Title */}
          <Text style={styles.coverTitle}>Quotation</Text>
          
          {/* Business Information */}
          <View style={styles.coverInfoContainer}>
            {/* Prepared For Box */}
            <View style={styles.coverInfoBox}>
              <View style={styles.coverInfoSection}>
                <Text style={styles.coverSectionTitle}>Prepared For</Text>
                <Text style={styles.coverBusinessName}>{quote.business.name}</Text>
                {quote.business.location && (
                  <Text style={styles.coverBusinessInfo}>{quote.business.location}</Text>
                )}
                {quote.business.description && (
                  <Text style={styles.coverBusinessInfo}>{quote.business.description}</Text>
                )}
              </View>
            </View>
            
            {/* Details Box */}
            <View style={styles.coverInfoBox}>
              <View style={styles.coverInfoSection}>
                <Text style={styles.coverSectionTitle}>Details</Text>
                <Text style={styles.coverDetailLabel}>Quote Number:</Text>
                <Text style={styles.coverDetailValue}>Q-{new Date().getFullYear()}-{String(quote.id).slice(-4).padStart(4, '0')}</Text>
                <Text style={styles.coverDetailLabel}>Date:</Text>
                <Text style={styles.coverDetailValue}>{formatDate(quote.createdAt)}</Text>
              </View>
            </View>
          </View>
        </View>
        
        {/* Page Number */}
        <Text style={styles.pageNumber}>Page 1</Text>
      </Page>

      {/* Page 2: Hardware & Software */}
      <Page size="A4" style={styles.page}>
        {/* Background Design Elements */}
        <View style={styles.backgroundAccent}>
          <View style={styles.topAccent} />
          <View style={styles.bottomAccent} />
          <View style={styles.sideAccentLeft} />
          {/* Creative background elements with softer red - improved positioning */}
          <View style={[styles.backgroundCircle, styles.backgroundCircleTopRight]} />
          <View style={[styles.backgroundCircle, styles.backgroundCircleBottomLeft]} />
          <View style={[styles.backgroundCircle, styles.backgroundCircleTopLeft]} />
          <View style={[styles.backgroundCircle, styles.backgroundCircleBottomRight]} />
          <View style={styles.backgroundDiagonal} />
        </View>
        
        <View style={styles.contentPage}>
          {/* Page Header */}
          <View style={styles.pageHeader}>
            <View style={styles.pageHeaderInfo}>
              <Text style={styles.pageHeaderCompany}>Cornwall Scales Ltd</Text>
              <Text style={styles.pageHeaderDetail}>Quote: Q-{new Date().getFullYear()}-{String(quote.id).slice(-4).padStart(4, '0')}</Text>
              <Text style={styles.pageHeaderDetail}>Date: {formatDate(quote.createdAt)}</Text>
            </View>
          </View>

          {/* Hardware & Initial Setup Section */}
          {oneOffItems.length > 0 && (
            <View style={styles.termsSection}>
              <Text style={styles.sectionTitle}>Hardware & Initial Setup</Text>
              <View style={styles.sectionDivider} />
              
              <View style={styles.table}>
                {/* Table Header */}
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableHeaderCell, styles.tableHeaderCellLeft]}>DESCRIPTION</Text>
                  <Text style={[styles.tableHeaderCell, styles.tableHeaderCellRight]}>TOTAL</Text>
                </View>
                
                {/* Table Rows */}
                {oneOffItems.map((item: any, index: number) => (
                  <View key={index} style={styles.tableRow}>
                    <Text style={styles.tableCellLeft}>{item.product.name}</Text>
                    <Text style={styles.tableCellRight}>{formatCurrency(item.price * item.quantity)}</Text>
                  </View>
                ))}
              </View>
              
              {/* Pricing Summary */}
              <View style={styles.pricingContainer}>
                <View style={styles.pricingRow}>
                  <Text style={styles.pricingLabel}>Sub Total</Text>
                  <Text style={styles.pricingValue}>{formatCurrency(oneOffTotal)}</Text>
                </View>
                <View style={styles.pricingRow}>
                  <Text style={styles.pricingLabel}>VAT (20%)</Text>
                  <Text style={styles.pricingValue}>{formatCurrency(vat)}</Text>
                </View>
                <View style={styles.pricingTotalRow}>
                  <Text style={styles.pricingTotalLabel}>Initial Purchase Cost</Text>
                  <Text style={styles.pricingTotalValue}>{formatCurrency(grandTotal)}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Software & Support Section */}
          {monthlyItems.length > 0 && (
            <View style={styles.termsSection}>
              <Text style={styles.sectionTitle}>Software & Support</Text>
              <View style={styles.sectionDivider} />
              
              <View style={styles.table}>
                {/* Table Header */}
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableHeaderCell, styles.tableHeaderCellLeft]}>DESCRIPTION</Text>
                  <Text style={[styles.tableHeaderCell, styles.tableHeaderCellRight]}>PER MONTH</Text>
                </View>
                
                {/* Table Rows */}
                {monthlyItems.map((item: any, index: number) => (
                  <View key={index} style={styles.tableRow}>
                    <Text style={styles.tableCellLeft}>{item.product.name}</Text>
                    <Text style={styles.tableCellRight}>{formatCurrency(item.price * item.quantity)}</Text>
                  </View>
                ))}
              </View>
              
              {/* Pricing Summary */}
              <View style={styles.pricingContainer}>
                <View style={styles.pricingRow}>
                  <Text style={styles.pricingLabel}>Sub Total</Text>
                  <Text style={styles.pricingValue}>{formatCurrency(monthlyTotal)}</Text>
                </View>
                <View style={styles.pricingRow}>
                  <Text style={styles.pricingLabel}>VAT (20%)</Text>
                  <Text style={styles.pricingValue}>{formatCurrency(monthlyTotal * 0.2)}</Text>
                </View>
                <View style={styles.pricingTotalRow}>
                  <Text style={styles.pricingTotalLabel}>Monthly Costs</Text>
                  <Text style={styles.pricingTotalValue}>{formatCurrency(monthlyTotal * 1.2)}</Text>
                </View>
              </View>
            </View>
          )}
        </View>
        
        {/* Page Number */}
        <Text style={styles.pageNumber}>Page 2</Text>
      </Page>

      {/* Page 3: Terms and Conditions */}
      <Page size="A4" style={styles.page}>
        {/* Background Design Elements */}
        <View style={styles.backgroundAccent}>
          <View style={styles.topAccent} />
          <View style={styles.bottomAccent} />
          <View style={styles.sideAccentLeft} />
          {/* Creative background elements with softer red - improved positioning */}
          <View style={[styles.backgroundCircle, styles.backgroundCircleTopRight]} />
          <View style={[styles.backgroundCircle, styles.backgroundCircleBottomLeft]} />
          <View style={[styles.backgroundCircle, styles.backgroundCircleTopLeft]} />
          <View style={[styles.backgroundCircle, styles.backgroundCircleBottomRight]} />
          <View style={styles.backgroundDiagonal} />
        </View>
        
        <View style={styles.contentPage}>
          {/* Page Header */}
          <View style={styles.pageHeader}>
            <View style={styles.pageHeaderInfo}>
              <Text style={styles.pageHeaderCompany}>Cornwall Scales Ltd</Text>
              <Text style={styles.pageHeaderDetail}>Quote: Q-{new Date().getFullYear()}-{String(quote.id).slice(-4).padStart(4, '0')}</Text>
              <Text style={styles.pageHeaderDetail}>Date: {formatDate(quote.createdAt)}</Text>
            </View>
          </View>

          {/* Terms and Conditions */}
          <Text style={styles.sectionTitle}>General Terms and Conditions</Text>
          <View style={styles.sectionDivider} />
          
          {/* Contact Details */}
          <View style={styles.termsBox}>
            <Text style={styles.termsBoxTitle}>Contact Details</Text>
            <Text style={styles.termsBoxContent}>Cornwall Scale & Equipment Ltd (CSE LTD)</Text>
            <Text style={styles.termsBoxContent}>Unit 2 Tregrehan Workshops, Tregrehan Mills, St Austell, Cornwall, PL25 3TQ</Text>
            <Text style={styles.termsBoxContent}>Telephone: 0333 577 0108 | Email: info@cornwallscalesltd.co.uk</Text>
          </View>

          {/* Payment Terms */}
          <View style={styles.termsBox}>
            <Text style={styles.termsBoxTitle}>1. Payment</Text>
            <View style={styles.termsList}>
              <Text style={styles.termsListItem}><Text style={styles.termsBold}>Deposit:</Text> 50% required with order confirmation (Bacs, cash, debit, credit card).</Text>
              <Text style={styles.termsListItem}><Text style={styles.termsBold}>Bank Details:</Text> Barclays Bank PLC | Acc: 50839132 | Sort: 20-87-94</Text>
              <Text style={styles.termsListItem}><Text style={styles.termsBold}>Payment Terms:</Text> Due within 30 days unless otherwise agreed.</Text>
              <Text style={styles.termsListItem}><Text style={styles.termsBold}>Ownership:</Text> Equipment remains property of CSE Ltd until full payment.</Text>
            </View>
          </View>

          {/* Warranty Terms */}
          <View style={styles.termsBox}>
            <Text style={styles.termsBoxTitle}>2. Warranty and Return Policy</Text>
            <View style={styles.termsList}>
              <Text style={styles.termsListItem}>New products: 12-month onsite/RTB guarantee. Reconditioned: 6-month onsite/RTB guarantee.</Text>
              <Text style={styles.termsListItem}><Text style={styles.termsBold}>Exclusions:</Text> No cover for intentional/accidental misuse or liquid ingress.</Text>
              <Text style={styles.termsListItem}><Text style={styles.termsBold}>Shipping:</Text> Customer responsible for return shipping costs and insurance.</Text>
              <Text style={styles.termsListItem}><Text style={styles.termsBold}>Data:</Text> CSE Ltd not liable for data loss or compatibility issues.</Text>
            </View>
          </View>
        </View>
        
        {/* Page Number */}
        <Text style={styles.pageNumber}>Page 3</Text>
      </Page>

      {/* Page 4: Additional Terms */}
      <Page size="A4" style={styles.page}>
        {/* Background Design Elements */}
        <View style={styles.backgroundAccent}>
          <View style={styles.topAccent} />
          <View style={styles.bottomAccent} />
          <View style={styles.sideAccentLeft} />
          {/* Creative background elements with softer red */}
          <View style={[styles.backgroundCircle, styles.backgroundCircleTopRight]} />
          <View style={[styles.backgroundCircle, styles.backgroundCircleBottomLeft]} />
          <View style={styles.backgroundDiagonal} />
        </View>
        
        <View style={styles.contentPage}>
          {/* Page Header */}
          <View style={styles.pageHeader}>
            <View style={styles.pageHeaderInfo}>
              <Text style={styles.pageHeaderCompany}>Cornwall Scales Ltd</Text>
              <Text style={styles.pageHeaderDetail}>Quote: Q-{new Date().getFullYear()}-{String(quote.id).slice(-4).padStart(4, '0')}</Text>
              <Text style={styles.pageHeaderDetail}>Date: {formatDate(quote.createdAt)}</Text>
            </View>
          </View>

          {/* Returns Policy */}
          <View style={styles.termsBox}>
            <Text style={styles.termsBoxTitle}>3. Returns Policy</Text>
            <View style={styles.termsList}>
              <Text style={styles.termsListItem}>Returns within 7 days with all manuals, attachments, and original packaging.</Text>
              <Text style={styles.termsListItem}>No-fault returns subject to 30% + VAT restocking charge.</Text>
              <Text style={styles.termsListItem}>Damage/missing parts must be reported within 24 hours of delivery.</Text>
              <Text style={styles.termsListItem}>Postage costs non-refundable. Customer may arrange own courier.</Text>
            </View>
          </View>

          {/* Late Payment Terms */}
          <View style={styles.termsBox}>
            <Text style={styles.termsBoxTitle}>4. Late Payment and Equipment Removal</Text>
            <View style={styles.termsList}>
              <Text style={styles.termsListItem}><Text style={styles.termsBold}>Late Payment:</Text> 10% weekly surcharge after 5-day grace period.</Text>
              <Text style={styles.termsListItem}><Text style={styles.termsBold}>Equipment Removal:</Text> Right to reclaim equipment. £400 + VAT reinstallation fee.</Text>
            </View>
          </View>

          {/* Equipment Hire Terms */}
          <View style={styles.termsBox}>
            <Text style={styles.termsBoxTitle}>5. Equipment Hire</Text>
            <View style={styles.termsList}>
              <Text style={styles.termsListItem}>First month's rental and setup due upon delivery. Standing order required.</Text>
              <Text style={styles.termsListItem}>Minimum one month's notice required to cancel hire agreement.</Text>
              <Text style={styles.termsListItem}>Equipment remains property of CSE Ltd. Peripherals billed separately.</Text>
              <Text style={styles.termsListItem}>Equipment must be returned in same condition. Damages billed to hirer.</Text>
            </View>
          </View>

          {/* Purchase Plan Terms */}
          <View style={styles.termsBox}>
            <Text style={styles.termsBoxTitle}>6. Purchase Plan</Text>
            <View style={styles.termsList}>
              <Text style={styles.termsListItem}>First payment and setup charges due upon delivery. Standing order required.</Text>
              <Text style={styles.termsListItem}><Text style={styles.termsBold}>Ownership:</Text> Equipment remains our property until full payment.</Text>
              <Text style={styles.termsListItem}>Peripherals not included and charged separately.</Text>
              <Text style={styles.termsListItem}>Warranty: 12 months new, 6 months reconditioned (RTB).</Text>
            </View>
          </View>
        </View>
        
        {/* Page Number */}
        <Text style={styles.pageNumber}>Page 4</Text>
      </Page>

      {/* Page 5: Final Terms */}
      <Page size="A4" style={styles.page}>
        {/* Background Design Elements */}
        <View style={styles.backgroundAccent}>
          <View style={styles.topAccent} />
          <View style={styles.bottomAccent} />
          <View style={styles.sideAccentLeft} />
          {/* Creative background elements with softer red */}
          <View style={[styles.backgroundCircle, styles.backgroundCircleTopRight]} />
          <View style={[styles.backgroundCircle, styles.backgroundCircleBottomLeft]} />
          <View style={styles.backgroundDiagonal} />
        </View>
        
        <View style={styles.contentPage}>
          {/* Page Header */}
          <View style={styles.pageHeader}>
            <View style={styles.pageHeaderInfo}>
              <Text style={styles.pageHeaderCompany}>Cornwall Scales Ltd</Text>
              <Text style={styles.pageHeaderDetail}>Quote: Q-{new Date().getFullYear()}-{String(quote.id).slice(-4).padStart(4, '0')}</Text>
              <Text style={styles.pageHeaderDetail}>Date: {formatDate(quote.createdAt)}</Text>
            </View>
          </View>

          {/* SaaS Contract Terms */}
          <View style={styles.termsBox}>
            <Text style={styles.termsBoxTitle}>7. SaaS Contract Terms</Text>
            <View style={styles.termsList}>
              <Text style={styles.termsListItem}>Initial 3-year term, then renews annually. 30 days' written notice to cancel.</Text>
              <Text style={styles.termsListItem}>SaaS products suspended in event of late payment per Section 4.</Text>
            </View>
          </View>

          {/* Support Service Terms */}
          <View style={styles.termsBox}>
            <Text style={styles.termsBoxTitle}>8. Telephone and Remote Support Service</Text>
            <View style={styles.termsList}>
              <Text style={styles.termsListItem}>Support: Standard hours (Mon-Fri 9am-5pm), out-of-hours (9am-11pm) for urgent issues.</Text>
              <Text style={styles.termsListItem}>Covers remote troubleshooting only. On-site visits separate services.</Text>
              <Text style={styles.termsListItem}>Specific programming requests charged separately.</Text>
              <Text style={styles.termsListItem}>Contract renews monthly. 30 days' written notice to terminate.</Text>
            </View>
          </View>

          {/* Additional space for better layout */}
          <View style={{ height: 50 }} />
        </View>
        
        {/* Page Number */}
        <Text style={styles.pageNumber}>Page 5</Text>
      </Page>
    </Document>
  )
}