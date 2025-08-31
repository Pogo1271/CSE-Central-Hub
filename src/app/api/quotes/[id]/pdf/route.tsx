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

// PDF Document Component with Professional Design
const QuoteDocument = ({ quote, logoUrl, template }: { quote: any; logoUrl: string; template: any }) => {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return '#856404'
      case 'sent': return '#0c5460'
      case 'accepted': return '#155724'
      case 'rejected': return '#721c24'
      default: return '#666666'
    }
  }

  // Separate items by pricing type
  const oneOffItems = quote.items.filter((item: any) => item.product.pricingType === 'one-off')
  const monthlyItems = quote.items.filter((item: any) => item.product.pricingType === 'monthly')
  
  // Calculate totals
  const oneOffTotal = oneOffItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0)
  const monthlyTotal = monthlyItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0)
  const grandTotal = quote.totalAmount

  return (
    <Document>
      {/* Page 1: Cover Page */}
      <Page size="A4" style={createStyles(template).page}>
        <View style={createStyles(template).coverContainer}>
          {/* Elegant Header */}
          <View style={createStyles(template).coverHeader}>
            <Image src={logoUrl} style={createStyles(template).coverLogo} />
            <View style={createStyles(template).coverInfo}>
              <Text style={createStyles(template).documentType}>Quote</Text>
              <Text style={createStyles(template).quoteNumber}>#{quote.id.slice(-6)}</Text>
            </View>
          </View>

          {/* Business Information */}
          <View style={createStyles(template).businessInfoSection}>
            <Text style={createStyles(template).sectionTitle}>Prepared For</Text>
            <Text style={createStyles(template).businessName}>{quote.business.name}</Text>
            {quote.business.description && (
              <Text style={createStyles(template).businessDescription}>{quote.business.description}</Text>
            )}
            <View style={createStyles(template).businessDetails}>
              {quote.business.location && (
                <Text style={createStyles(template).businessDetail}>{quote.business.location}</Text>
              )}
              {quote.business.email && (
                <Text style={createStyles(template).businessDetail}>{quote.business.email}</Text>
              )}
              {quote.business.phone && (
                <Text style={createStyles(template).businessDetail}>{quote.business.phone}</Text>
              )}
            </View>
          </View>

          {/* Company Information */}
          <View style={createStyles(template).companyInfoSection}>
            <Text style={createStyles(template).sectionTitle}>From</Text>
            <Text style={createStyles(template).companyName}>CSE Central Hub</Text>
            <View style={createStyles(template).companyDetails}>
              <Text style={createStyles(template).companyAddress}>Unit 2 Tregrehan Workshops</Text>
              <Text style={createStyles(template).companyAddress}>Tregrehan Mills</Text>
              <Text style={createStyles(template).companyAddress}>St Austell, Cornwall, PL25 3TQ</Text>
              <Text style={createStyles(template).companyContact}>Telephone: 0333 577 0108</Text>
              <Text style={createStyles(template).companyContact}>Email: info@cornwallscalesltd.co.uk</Text>
            </View>
          </View>

          {/* Quote Details */}
          <View style={createStyles(template).quoteDetailsSection}>
            <View style={createStyles(template).detailRow}>
              <Text style={createStyles(template).detailLabel}>Quote Date:</Text>
              <Text style={createStyles(template).detailValue}>{formatDate(quote.createdAt)}</Text>
            </View>
            <View style={createStyles(template).detailRow}>
              <Text style={createStyles(template).detailLabel}>Status:</Text>
              <View style={[createStyles(template).statusBadge, { backgroundColor: getStatusColor(quote.status) }]}>
                <Text style={createStyles(template).statusText}>{quote.status.toUpperCase()}</Text>
              </View>
            </View>
            <View style={createStyles(template).detailRow}>
              <Text style={createStyles(template).detailLabel}>Prepared By:</Text>
              <Text style={createStyles(template).detailValue}>{quote.user?.name || 'Unknown'}</Text>
            </View>
          </View>

          {/* Subtle Red Accent Line */}
          <View style={createStyles(template).accentLine} />
        </View>
      </Page>

      {/* Page 2: Products and Pricing */}
      <Page size="A4" style={createStyles(template).page}>
        <View style={createStyles(template).contentContainer}>
          {/* Header */}
          <View style={createStyles(template).pageHeader}>
            <Text style={createStyles(template).pageTitle}>Quote Details</Text>
            <Text style={createStyles(template).pageSubtitle}>#{quote.id.slice(-6)}</Text>
          </View>

          {/* One-off / Hardware Section */}
          {oneOffItems.length > 0 && (
            <View style={createStyles(template).section}>
              <Text style={createStyles(template).sectionTitle}>One-off / Hardware</Text>
              <View style={createStyles(template).table}>
                {/* Table Header */}
                <View style={createStyles(template).tableHeader}>
                  <Text style={[createStyles(template).tableCell, { flex: 4 }]}>Item</Text>
                  <Text style={[createStyles(template).tableCell, { flex: 1 }]}>Qty</Text>
                  <Text style={[createStyles(template).tableCell, { flex: 2 }]}>Unit Price</Text>
                  <Text style={[createStyles(template).tableCell, { flex: 2 }]}>Total</Text>
                </View>
                
                {/* Table Rows */}
                {oneOffItems.map((item: any, index: number) => (
                  <View key={index} style={createStyles(template).tableRow}>
                    <Text style={[createStyles(template).tableCell, { flex: 4 }]}>{item.product.name}</Text>
                    <Text style={[createStyles(template).tableCell, { flex: 1 }]}>{item.quantity}</Text>
                    <Text style={[createStyles(template).tableCell, { flex: 2 }]}>{formatCurrency(item.price)}</Text>
                    <Text style={[createStyles(template).tableCell, { flex: 2 }]}>{formatCurrency(item.price * item.quantity)}</Text>
                  </View>
                ))}
              </View>
              
              {/* Section Total */}
              <View style={createStyles(template).sectionTotalContainer}>
                <Text style={createStyles(template).sectionTotalLabel}>One-off Subtotal:</Text>
                <Text style={createStyles(template).sectionTotalValue}>{formatCurrency(oneOffTotal)}</Text>
              </View>
            </View>
          )}

          {/* Monthly / Software Section */}
          {monthlyItems.length > 0 && (
            <View style={createStyles(template).section}>
              <Text style={createStyles(template).sectionTitle}>Monthly / Software</Text>
              <View style={createStyles(template).table}>
                {/* Table Header */}
                <View style={createStyles(template).tableHeader}>
                  <Text style={[createStyles(template).tableCell, { flex: 4 }]}>Item</Text>
                  <Text style={[createStyles(template).tableCell, { flex: 1 }]}>Qty</Text>
                  <Text style={[createStyles(template).tableCell, { flex: 2 }]}>Unit Price</Text>
                  <Text style={[createStyles(template).tableCell, { flex: 2 }]}>Total</Text>
                </View>
                
                {/* Table Rows */}
                {monthlyItems.map((item: any, index: number) => (
                  <View key={index} style={createStyles(template).tableRow}>
                    <Text style={[createStyles(template).tableCell, { flex: 4 }]}>{item.product.name}</Text>
                    <Text style={[createStyles(template).tableCell, { flex: 1 }]}>{item.quantity}</Text>
                    <Text style={[createStyles(template).tableCell, { flex: 2 }]}>{formatCurrency(item.price)}</Text>
                    <Text style={[createStyles(template).tableCell, { flex: 2 }]}>{formatCurrency(item.price * item.quantity)}</Text>
                  </View>
                ))}
              </View>
              
              {/* Section Total */}
              <View style={createStyles(template).sectionTotalContainer}>
                <Text style={createStyles(template).sectionTotalLabel}>Monthly Subtotal:</Text>
                <Text style={createStyles(template).sectionTotalValue}>{formatCurrency(monthlyTotal)}</Text>
              </View>
            </View>
          )}

          {/* Grand Total */}
          <View style={createStyles(template).grandTotalSection}>
            <View style={createStyles(template).totalContainer}>
              <Text style={createStyles(template).totalLabel}>Subtotal:</Text>
              <Text style={createStyles(template).totalValue}>{formatCurrency(grandTotal / 1.2)}</Text>
            </View>
            <View style={createStyles(template).totalContainer}>
              <Text style={createStyles(template).totalLabel}>VAT (20%):</Text>
              <Text style={createStyles(template).totalValue}>{formatCurrency(grandTotal * 0.2 / 1.2)}</Text>
            </View>
            <View style={createStyles(template).totalContainer}>
              <Text style={[createStyles(template).totalLabel, createStyles(template).totalFinal]}>Total Amount:</Text>
              <Text style={[createStyles(template).totalValue, createStyles(template).totalFinal]}>{formatCurrency(grandTotal)}</Text>
            </View>
          </View>
        </View>
      </Page>

      {/* Page 3: Terms and Conditions */}
      <Page size="A4" style={createStyles(template).page}>
        <View style={createStyles(template).contentContainer}>
          {/* Header */}
          <View style={createStyles(template).pageHeader}>
            <Text style={createStyles(template).pageTitle}>Terms and Conditions</Text>
            <Text style={createStyles(template).pageSubtitle}>#{quote.id.slice(-6)}</Text>
          </View>

          {/* Terms Content - Optimized to prevent overflow */}
          <View style={createStyles(template).termsContainer}>
            <Text style={createStyles(template).termsSectionTitle}>General Terms and Conditions</Text>
            
            <Text style={createStyles(template).termsParagraph}>
              This quotation is prepared by Cornwall Scale & Equipment Ltd (CSE LTD) and is valid for 30 days from the date of issue. 
              All prices are exclusive of VAT unless otherwise stated.
            </Text>

            <Text style={createStyles(template).termsSectionTitle}>1. Payment Terms</Text>
            <Text style={createStyles(template).termsText}>
              • Deposit: A 50% deposit is required with order confirmation. Accepted methods include Bacs, cash, debit, or credit card.
            </Text>
            <Text style={createStyles(template).termsText}>
              • Payment Terms: Invoice payments are due within 30 days unless otherwise agreed.
            </Text>
            <Text style={createStyles(template).termsText}>
              • Late Payment: A 10% weekly surcharge will be applied to any outstanding balance if payment is not received within a 5-day grace period.
            </Text>

            <Text style={createStyles(template).termsSectionTitle}>2. Warranty and Support</Text>
            <Text style={createStyles(template).termsText}>
              • All New products come with a standard 12-month onsite or RTB (Return to Base) guarantee.
            </Text>
            <Text style={createStyles(template).termsText}>
              • Second hand and Reconditioned products are covered by a 6-month onsite or RTB guarantee.
            </Text>
            <Text style={createStyles(template).termsText}>
              • We operate a next working day replacement service for faulty equipment.
            </Text>

            <Text style={createStyles(template).termsSectionTitle}>3. Delivery and Installation</Text>
            <Text style={createStyles(template).termsText}>
              • Delivery time: 2-4 weeks from order confirmation, subject to stock availability.
            </Text>
            <Text style={createStyles(template).termsText}>
              • Installation and training services are available upon request and will be quoted separately.
            </Text>
            <Text style={createStyles(template).termsText}>
              • All equipment remains the property of Cornwall Scale & Equipment Ltd until full payment has been made.
            </Text>

            <Text style={createStyles(template).termsSectionTitle}>4. Returns Policy</Text>
            <Text style={createStyles(template).termsText}>
              • If not entirely happy, you may return the product with all manuals, attachments, and packaging within 7 days.
            </Text>
            <Text style={createStyles(template).termsText}>
              • Products with no faults or due to change of mind will be refunded, subject to a 30% + VAT restocking charge.
            </Text>
            <Text style={createStyles(template).termsText}>
              • Any damage or missing parts must be reported within 24 hours of delivery.
            </Text>

            {/* Contact Information - Optimized layout */}
            <View style={createStyles(template).contactSection}>
              <Text style={createStyles(template).termsSectionTitle}>5. Contact Information</Text>
              <View style={createStyles(template).contactInfo}>
                <View style={createStyles(template).contactColumn}>
                  <Text style={createStyles(template).contactLabel}>Company:</Text>
                  <Text style={createStyles(template).contactValue}>Cornwall Scale & Equipment Ltd</Text>
                </View>
                <View style={createStyles(template).contactColumn}>
                  <Text style={createStyles(template).contactLabel}>Address:</Text>
                  <Text style={createStyles(template).contactValue}>Unit 2 Tregrehan Workshops</Text>
                  <Text style={createStyles(template).contactValue}>Tregrehan Mills</Text>
                  <Text style={createStyles(template).contactValue}>St Austell, Cornwall</Text>
                  <Text style={createStyles(template).contactValue}>PL25 3TQ</Text>
                </View>
                <View style={createStyles(template).contactColumn}>
                  <Text style={createStyles(template).contactLabel}>Contact:</Text>
                  <Text style={createStyles(template).contactValue}>Telephone: 0333 577 0108</Text>
                  <Text style={createStyles(template).contactValue}>Email: info@cornwallscalesltd.co.uk</Text>
                  <Text style={createStyles(template).contactValue}>Accounts: accounts@cornwallscalesltd.co.uk</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Footer */}
          <View style={createStyles(template).footer}>
            <Text style={createStyles(template).footerText}>
              CSE Central Hub - Business Management System
            </Text>
            <Text style={createStyles(template).footerText}>
              For questions or concerns, please contact your account manager.
            </Text>
            <Text style={createStyles(template).pageNumber}>
              Page 3 of 3
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  )
}

// Professional Styles Function
function createStyles(template: any) {
  return {
    page: {
      padding: 50,
      backgroundColor: '#FFFFFF',
      fontFamily: 'Helvetica',
    },
    coverContainer: {
      flex: 1,
      flexDirection: 'column',
      justifyContent: 'space-between',
    },
    contentContainer: {
      flex: 1,
      flexDirection: 'column',
    },
    coverHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 40,
      borderBottom: '1 solid #E5E7EB',
      paddingBottom: 30,
    },
    coverLogo: {
      width: 80,
      height: 'auto',
      marginRight: 30,
    },
    coverInfo: {
      flex: 1,
    },
    documentType: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#000000',
      marginBottom: 2,
    },
    quoteNumber: {
      fontSize: 14,
      color: '#666666',
    },
    businessInfoSection: {
      marginBottom: 30,
    },
    companyInfoSection: {
      marginBottom: 30,
    },
    quoteDetailsSection: {
      marginBottom: 30,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: 'bold',
      color: '#000000',
      marginBottom: 12,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    businessName: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#000000',
      marginBottom: 6,
    },
    businessDescription: {
      fontSize: 12,
      color: '#666666',
      marginBottom: 8,
    },
    businessDetails: {
      marginTop: 8,
    },
    businessDetail: {
      fontSize: 11,
      color: '#666666',
      marginBottom: 2,
    },
    companyName: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#000000',
      marginBottom: 6,
    },
    companyDetails: {
      marginTop: 8,
    },
    companyAddress: {
      fontSize: 11,
      color: '#666666',
      marginBottom: 2,
    },
    companyContact: {
      fontSize: 11,
      color: '#666666',
      marginBottom: 2,
    },
    detailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    detailLabel: {
      fontSize: 11,
      color: '#666666',
      fontWeight: 'bold',
    },
    detailValue: {
      fontSize: 11,
      fontWeight: 'bold',
      color: '#000000',
    },
    statusBadge: {
      paddingHorizontal: 6,
      paddingVertical: 3,
      borderRadius: 3,
    },
    statusText: {
      fontSize: 9,
      color: '#FFFFFF',
      fontWeight: 'bold',
    },
    accentLine: {
      height: 2,
      backgroundColor: '#DC2626',
      width: 60,
      marginVertical: 20,
    },
    pageHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 25,
      borderBottom: '1 solid #E5E7EB',
      paddingBottom: 15,
    },
    pageTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#000000',
    },
    pageSubtitle: {
      fontSize: 12,
      color: '#666666',
    },
    section: {
      marginBottom: 25,
    },
    table: {
      marginBottom: 12,
    },
    tableHeader: {
      flexDirection: 'row',
      backgroundColor: '#F9FAFB',
      borderBottom: '1 solid #DC2626',
      paddingVertical: 6,
    },
    tableRow: {
      flexDirection: 'row',
      borderBottom: '1 solid #F3F4F6',
      paddingVertical: 6,
    },
    tableCell: {
      fontSize: 10,
      color: '#374151',
    },
    sectionTotalContainer: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginTop: 8,
      marginBottom: 15,
    },
    sectionTotalLabel: {
      fontSize: 11,
      fontWeight: 'bold',
      color: '#374151',
      marginRight: 15,
    },
    sectionTotalValue: {
      fontSize: 11,
      fontWeight: 'bold',
      color: '#000000',
    },
    grandTotalSection: {
      marginTop: 15,
      borderTop: '1 solid #DC2626',
      paddingTop: 15,
    },
    totalContainer: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginBottom: 8,
    },
    totalLabel: {
      fontSize: 11,
      color: '#374151',
      marginRight: 15,
      minWidth: 80,
      textAlign: 'right',
    },
    totalValue: {
      fontSize: 11,
      color: '#374151',
      minWidth: 70,
      textAlign: 'right',
    },
    totalFinal: {
      fontWeight: 'bold',
      color: '#000000',
    },
    termsContainer: {
      flex: 1,
    },
    termsSectionTitle: {
      fontSize: 12,
      fontWeight: 'bold',
      color: '#000000',
      marginBottom: 8,
      marginTop: 15,
    },
    termsParagraph: {
      fontSize: 10,
      color: '#374151',
      marginBottom: 10,
      lineHeight: 1.3,
    },
    termsText: {
      fontSize: 10,
      color: '#374151',
      marginBottom: 3,
      lineHeight: 1.3,
    },
    contactSection: {
      marginTop: 15,
    },
    contactInfo: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 8,
    },
    contactColumn: {
      flex: 1,
      marginRight: 15,
    },
    contactLabel: {
      fontSize: 10,
      fontWeight: 'bold',
      color: '#000000',
      marginBottom: 4,
    },
    contactValue: {
      fontSize: 9,
      color: '#374151',
      marginBottom: 2,
    },
    footer: {
      marginTop: 30,
      borderTop: '1 solid #E5E7EB',
      paddingTop: 15,
      alignItems: 'center',
    },
    footerText: {
      fontSize: 9,
      color: '#9CA3AF',
      marginBottom: 3,
      textAlign: 'center',
    },
    pageNumber: {
      fontSize: 9,
      color: '#9CA3AF',
      textAlign: 'center',
    },
  }
}

// Generate PDF function
async function generateQuotePDF(quote: any, logoUrl: string, template: any) {
  try {
    // Import the renderToBuffer function dynamically
    const { renderToBuffer } = await import('@react-pdf/renderer')
    
    // Render the PDF document to buffer
    const pdfBuffer = await renderToBuffer(<QuoteDocument quote={quote} logoUrl={logoUrl} template={template} />)
    
    return pdfBuffer
  } catch (error) {
    console.error('Error generating PDF:', error)
    throw new Error('Failed to generate PDF')
  }
}