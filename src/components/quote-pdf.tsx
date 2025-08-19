'use client'

import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 30,
    borderBottom: '1 solid #ccc',
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    backgroundColor: '#f5f5f5',
    padding: 5,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  label: {
    fontWeight: 'bold',
    width: 100,
  },
  value: {
    flex: 1,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginBottom: 20,
  },
  tableHeader: {
    backgroundColor: '#f5f5f5',
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1 solid #ccc',
  },
  tableCell: {
    padding: 8,
    flex: 1,
  },
  total: {
    textAlign: 'right',
    fontWeight: 'bold',
    fontSize: 14,
    marginTop: 10,
  },
  footer: {
    marginTop: 30,
    paddingTop: 20,
    borderTop: '1 solid #ccc',
    fontSize: 10,
    color: '#666',
  },
})

interface QuotePDFProps {
  quote: any
}

export function QuotePDF({ quote }: QuotePDFProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Quote</Text>
          <Text style={styles.subtitle}>Quote #{quote.id.slice(-6)}</Text>
          <Text style={styles.subtitle}>Date: {new Date(quote.createdAt).toLocaleDateString()}</Text>
          <Text style={styles.subtitle}>Status: {quote.status.toUpperCase()}</Text>
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
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={styles.tableCell}>Item</Text>
              <Text style={styles.tableCell}>Quantity</Text>
              <Text style={styles.tableCell}>Unit Price</Text>
              <Text style={styles.tableCell}>Total</Text>
            </View>
            
            {/* Table Rows */}
            {quote.items.map((item: any, index: number) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.tableCell}>{item.product.name}</Text>
                <Text style={styles.tableCell}>{item.quantity}</Text>
                <Text style={styles.tableCell}>${item.price.toFixed(2)}</Text>
                <Text style={styles.tableCell}>${(item.price * item.quantity).toFixed(2)}</Text>
              </View>
            ))}
          </View>
          
          <Text style={styles.total}>
            Total Amount: ${quote.totalAmount.toFixed(2)}
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>This quote was generated automatically from the Business Management System.</Text>
          <Text>For questions or concerns, please contact your account manager.</Text>
        </View>
      </Page>
    </Document>
  )
}