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
          <rect width="120" height="120" fill="#3B82F6" rx="8"/>
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
        <rect width="120" height="120" fill="#3B82F6" rx="8"/>
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

// PDF Document Component with Template Support
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

  // Check if quote has many items (potential multi-page)
  const isMultiPage = quote.items.length > 6

  return (
    <Document>
      <Page size={template.layout.pageSize} style={createStyles(template)}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <Text style={styles.title}>Quote</Text>
              <Text style={styles.subtitle}>Quote #{quote.id.slice(-6)}</Text>
            </View>
            <View style={styles.headerRight}>
              <Image src={logoUrl} style={styles.companyLogo} alt="Company Logo" />
              <Text style={styles.companyName}>CSE Central Hub</Text>
              <Text style={styles.subtitle}>Date: {formatDate(quote.createdAt)}</Text>
            </View>
          </View>
          <View style={styles.statusContainer}>
            <Text style={[styles.status, { backgroundColor: getStatusColor(quote.status) }]}>
              {quote.status.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Business Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Business Information</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Name:</Text>
            <Text style={styles.value}>{quote.business.name}</Text>
          </View>
          {quote.business.description && (
            <View style={styles.row}>
              <Text style={styles.label}>Description:</Text>
              <Text style={styles.value}>{quote.business.description}</Text>
            </View>
          )}
          {quote.business.location && (
            <View style={styles.row}>
              <Text style={styles.label}>Location:</Text>
              <Text style={styles.value}>{quote.business.location}</Text>
            </View>
          )}
          {quote.business.email && (
            <View style={styles.row}>
              <Text style={styles.label}>Email:</Text>
              <Text style={styles.value}>{quote.business.email}</Text>
            </View>
          )}
          {quote.business.phone && (
            <View style={styles.row}>
              <Text style={styles.label}>Phone:</Text>
              <Text style={styles.value}>{quote.business.phone}</Text>
            </View>
          )}
        </View>

        {/* Quote Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quote Details</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Title:</Text>
            <Text style={styles.value}>{quote.title}</Text>
          </View>
          {quote.description && (
            <View style={styles.row}>
              <Text style={styles.label}>Description:</Text>
              <Text style={styles.value}>{quote.description}</Text>
            </View>
          )}
          <View style={styles.row}>
            <Text style={styles.label}>Created By:</Text>
            <Text style={styles.value}>{quote.user?.name || 'Unknown'}</Text>
          </View>
        </View>

        {/* Quote Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quote Items</Text>
          <View style={styles.table}>
            {/* Table Header */}
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.tableHeader, { flex: 3 }]}>Item</Text>
              <Text style={[styles.tableCell, styles.tableHeader, { flex: 1 }]}>Qty</Text>
              <Text style={[styles.tableCell, styles.tableHeader, { flex: 2 }]}>Unit Price</Text>
              <Text style={[styles.tableCell, styles.tableHeader, { flex: 2 }]}>Total</Text>
            </View>
            
            {/* Table Rows */}
            {quote.items.map((item: any, index: number) => (
              <View key={index} style={styles.tableRow}>
                <Text style={[styles.tableCell, { flex: 3 }]}>{item.product.name}</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>{item.quantity}</Text>
                <Text style={[styles.tableCell, { flex: 2 }]}>{formatCurrency(item.price)}</Text>
                <Text style={[styles.tableCell, { flex: 2 }]}>{formatCurrency(item.price * item.quantity)}</Text>
              </View>
            ))}
          </View>
          
          {/* Total */}
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Subtotal:</Text>
            <Text style={styles.totalValue}>{formatCurrency(quote.totalAmount / 1.2)}</Text>
          </View>
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>VAT (20%):</Text>
            <Text style={styles.totalValue}>{formatCurrency(quote.totalAmount * 0.2 / 1.2)}</Text>
          </View>
          <View style={styles.totalContainer}>
            <Text style={[styles.totalLabel, styles.totalFinal]}>Total Amount:</Text>
            <Text style={[styles.totalValue, styles.totalFinal]}>{formatCurrency(quote.totalAmount)}</Text>
          </View>
        </View>

        {/* Terms and Conditions */}
        <View style={styles.termsSection}>
          <Text style={styles.termsTitle}>Terms and Conditions</Text>
          <Text style={styles.termsText}>
            • Payment terms: 30 days from invoice date
          </Text>
          <Text style={styles.termsText}>
            • Prices valid for 30 days from quote date
          </Text>
          <Text style={styles.termsText}>
            • Subject to our standard terms and conditions
          </Text>
          <Text style={styles.termsText}>
            • Delivery time: 2-4 weeks from order confirmation
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            CSE Central Hub - Business Management System
          </Text>
          <Text style={styles.footerText}>
            For questions or concerns, please contact your account manager.
          </Text>
          <Text style={styles.footerText}>
            Email: info@csecentralhub.com | Phone: +44 (0) 1234 567890
          </Text>
          <Text style={styles.pageNumber}>
            Page 1{isMultiPage ? ' of 2' : ' of 1'}
          </Text>
        </View>
      </Page>
      
      {/* Second page for very large quotes */}
      {isMultiPage && (
        <Page size={template.layout.pageSize} style={createStyles(template)}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerRow}>
              <View style={styles.headerLeft}>
                <Text style={styles.title}>Quote</Text>
                <Text style={styles.subtitle}>Quote #{quote.id.slice(-6)} (Continued)</Text>
              </View>
              <View style={styles.headerRight}>
                <Text style={styles.companyName}>CSE Central Hub</Text>
                <Text style={styles.subtitle}>Date: {formatDate(quote.createdAt)}</Text>
              </View>
            </View>
          </View>

          {/* Additional Notes Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Information</Text>
            <Text style={styles.notesText}>
              This quote includes comprehensive hardware and software solutions tailored to your business needs. 
              All products come with manufacturer warranty and our standard support package.
            </Text>
            <Text style={styles.notesText}>
              Installation and training services are available upon request. Please contact us for a detailed 
              implementation plan and timeline.
            </Text>
          </View>

          {/* Signature Section */}
          <View style={styles.signatureSection}>
            <Text style={styles.signatureTitle}>Acceptance</Text>
            <Text style={styles.signatureText}>
              Please sign below to accept this quote and authorize the work to begin.
            </Text>
            <View style={styles.signatureRow}>
              <View style={styles.signatureBox}>
                <Text style={styles.signatureLabel}>Customer Signature:</Text>
                <View style={styles.signatureLine}></View>
                <Text style={styles.signatureDate}>Date: _______________</Text>
              </View>
              <View style={styles.signatureBox}>
                <Text style={styles.signatureLabel}>Company Representative:</Text>
                <View style={styles.signatureLine}></View>
                <Text style={styles.signatureDate}>Date: _______________</Text>
              </View>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              CSE Central Hub - Business Management System
            </Text>
            <Text style={styles.footerText}>
              Thank you for your business!
            </Text>
            <Text style={styles.pageNumber}>
              Page 2 of 2
            </Text>
          </View>
        </Page>
      )}
    </Document>
  )
}

// Function to create styles based on template
function createStyles(template: any) {
  return {
    page: {
      padding: template.layout.padding,
      backgroundColor: template.colors.background,
    },
    header: {
      borderBottom: `2 ${template.colors.headerBorder}`,
      paddingBottom: 20,
      marginBottom: 30,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 10,
    },
    headerLeft: {
      flex: 1,
    },
    headerRight: {
      flex: 1,
      alignItems: 'flex-end',
    },
    companyName: {
      fontSize: 14,
      fontWeight: 'bold',
      color: template.colors.text,
    },
    companyLogo: {
      width: template.logo.maxWidth,
      height: 'auto',
      marginBottom: 8,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: template.colors.primary,
      marginBottom: 5,
    },
    subtitle: {
      fontSize: 12,
      color: template.colors.text,
      marginBottom: 3,
    },
    customHeader: {
      fontSize: 14,
      color: template.colors.accent,
      fontWeight: 'bold',
      marginTop: 5,
    },
    statusContainer: {
      marginTop: 10,
    },
    status: {
      fontSize: 10,
      color: '#ffffff',
      padding: 4,
    },
    section: {
      marginBottom: 30,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: template.colors.primary,
      backgroundColor: template.colors.background,
      padding: 10,
      marginBottom: 15,
      borderLeftWidth: 4,
      borderLeftColor: template.colors.accent,
      borderLeftStyle: 'solid',
    },
    row: {
      flexDirection: 'row',
      marginBottom: 8,
    },
    label: {
      fontWeight: 'bold',
      width: 120,
      color: template.colors.text,
    },
    value: {
      flex: 1,
      color: template.colors.text,
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      marginBottom: 20,
    },
    tableRow: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: template.colors.headerBorder,
      borderBottomStyle: 'solid',
    },
    tableCell: {
      padding: 12,
      textAlign: 'left',
    },
    tableHeader: {
      backgroundColor: template.colors.background,
      fontWeight: 'bold',
      color: template.colors.text,
    },
    totalContainer: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginTop: 10,
    },
    totalLabel: {
      fontSize: 14,
      color: template.colors.text,
      marginRight: 20,
    },
    totalValue: {
      fontSize: 14,
      color: template.colors.text,
      fontWeight: 'bold',
    },
    totalFinal: {
      fontSize: 18,
      color: template.colors.primary,
    },
    termsSection: {
      marginTop: 40,
      paddingTop: 20,
      borderTopWidth: 1,
      borderTopColor: template.colors.headerBorder,
      borderTopStyle: 'solid',
    },
    termsTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: template.colors.text,
      marginBottom: 15,
    },
    termsText: {
      fontSize: 12,
      color: template.colors.text,
      marginBottom: 5,
    },
    notesText: {
      fontSize: 12,
      color: template.colors.text,
      marginBottom: 10,
      lineHeight: 1.5,
    },
    signatureSection: {
      marginTop: 40,
    },
    signatureTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: template.colors.text,
      marginBottom: 10,
    },
    signatureText: {
      fontSize: 12,
      color: template.colors.text,
      marginBottom: 20,
    },
    signatureRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    signatureBox: {
      flex: 1,
      marginRight: 20,
    },
    signatureLabel: {
      fontSize: 12,
      color: template.colors.text,
      marginBottom: 5,
    },
    signatureLine: {
      borderBottomWidth: 1,
      borderBottomColor: template.colors.text,
      borderBottomStyle: 'solid',
      width: '100%',
      marginBottom: 5,
    },
    signatureDate: {
      fontSize: 10,
      color: template.colors.text,
    },
    footer: {
      marginTop: 40,
      paddingTop: 20,
      borderTopWidth: 1,
      borderTopColor: template.colors.headerBorder,
      borderTopStyle: 'solid',
      fontSize: 12,
      color: template.colors.text,
      textAlign: 'center',
    },
    footerText: {
      fontSize: 12,
      color: template.colors.text,
      marginBottom: 5,
    },
    pageNumber: {
      fontSize: 10,
      color: template.colors.text,
      marginTop: 10,
    }
  }
}

// PDF Styles (keeping for backward compatibility)
const styles = StyleSheet.create({
  page: {
    padding: 50, // Increased from 40 to prevent edge crowding
    backgroundColor: '#ffffff',
  },
  header: {
    borderBottom: '2 solid #333333',
    paddingBottom: 25, // Increased from 20
    marginBottom: 35, // Increased from 30
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15, // Increased from 10
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  companyName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
  },
  companyLogo: {
    width: 120,  // Adjusted width to maintain aspect ratio (287:75 ≈ 3.83:1, so 120px width for ~31px height equivalent area)
    height: 'auto',  // Maintain aspect ratio
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 3,
  },
  statusContainer: {
    marginTop: 10,
  },
  status: {
    fontSize: 10,
    color: '#ffffff',
    padding: 4,
    borderRadius: 3,
    fontWeight: 'bold',
    textAlign: 'center',
    width: 60,
  },
  section: {
    marginBottom: 40, // Increased from 30 for better section spacing
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    backgroundColor: '#f5f5f5',
    padding: 10, // Increased from 8
    marginBottom: 20, // Increased from 15
    borderLeft: '4 solid #3B82F6',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 12, // Increased from 8 for better row spacing
  },
  label: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#555555',
    marginBottom: 5, // Increased from 3
    width: 80,
  },
  value: {
    fontSize: 10,
    color: '#333333',
    marginBottom: 10, // Increased from 8
    flex: 1,
  },
  table: {
    marginBottom: 25, // Increased from 20
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1 solid #dddddd',
  },
  tableCell: {
    fontSize: 10,
    padding: 12, // Increased from 8 for better cell spacing
    flex: 1,
  },
  tableHeader: {
    fontWeight: 'bold',
    backgroundColor: '#f8f9fa',
    color: '#333333',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10, // Increased from 5
  },
  totalLabel: {
    fontSize: 10,
    color: '#666666',
    marginRight: 15, // Increased from 10
    width: 80,
    textAlign: 'right',
  },
  totalValue: {
    fontSize: 10,
    color: '#333333',
    width: 60,
    textAlign: 'right',
  },
  totalFinal: {
    fontWeight: 'bold',
    fontSize: 12,
    color: '#333333',
  },
  termsSection: {
    marginBottom: 35, // Increased from 30
  },
  termsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 15, // Increased from 10
  },
  termsText: {
    fontSize: 9,
    color: '#666666',
    marginBottom: 8, // Increased from 5
  },
  footer: {
    marginTop: 50, // Increased from 40
    paddingTop: 25, // Increased from 20
    borderTop: '1 solid #dddddd',
  },
  footerText: {
    fontSize: 10,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 8, // Increased from 5
  },
  pageNumber: {
    fontSize: 10,
    color: '#666666',
    textAlign: 'center',
    marginTop: 15, // Increased from 10
  },
  notesText: {
    fontSize: 10,
    color: '#666666',
    marginBottom: 8,
    lineHeight: 1.4,
  },
  signatureSection: {
    marginBottom: 30,
  },
  signatureTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 10,
  },
  signatureText: {
    fontSize: 10,
    color: '#666666',
    marginBottom: 15,
  },
  signatureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signatureBox: {
    flex: 1,
    marginRight: 20,
  },
  signatureLabel: {
    fontSize: 10,
    color: '#666666',
    marginBottom: 5,
  },
  signatureLine: {
    borderBottom: '1 solid #333333',
    marginBottom: 5,
    height: 1,
  },
  signatureDate: {
    fontSize: 9,
    color: '#666666',
  },
})

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
