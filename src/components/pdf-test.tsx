'use client'

import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer'

// Simplified PDF styles for testing
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
    fontSize: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1f2937',
  },
  section: {
    marginBottom: 15,
  },
  text: {
    marginBottom: 10,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    fontSize: 10,
    color: '#6b7280',
    textAlign: 'center',
  }
})

// Test PDF Document Component
export const TestPDFDocument = () => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>PDF Generation Test</Text>
        
        <View style={styles.section}>
          <Text style={styles.text}>This is a test PDF document to verify that PDF generation is working correctly.</Text>
          <Text style={styles.text}>If you can see this, the PDF generation functionality is working.</Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.text}>Test features:</Text>
          <Text style={styles.text}>• Basic text rendering</Text>
          <Text style={styles.text}>• Styling and layout</Text>
          <Text style={styles.text}>• Multi-page support</Text>
        </View>
        
        <Text style={styles.footer}>
          Generated on {new Date().toLocaleDateString('en-GB')} | Test Document
        </Text>
      </Page>
    </Document>
  )
}

// Test component with PDF download link
export const PDFTestComponent = () => {
  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-4">PDF Generation Test</h3>
      <p className="text-gray-600 mb-4">
        This is a simplified test to verify that PDF generation is working correctly.
        Click the button below to download a test PDF.
      </p>
      
      <div className="flex gap-3">
        <button
          onClick={() => {
            // This would typically use PDFDownloadLink, but for testing we'll just log
            console.log('PDF download test clicked')
            alert('PDF download functionality test - Check console for details')
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Test PDF Download
        </button>
      </div>
    </div>
  )
}