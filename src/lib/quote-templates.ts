// Quote Template System for Easy Customization

export interface QuoteTemplate {
  id: string
  name: string
  description: string
  colors: {
    primary: string
    secondary: string
    accent: string
    text: string
    background: string
    headerBorder: string
  }
  fonts: {
    title: string
    subtitle: string
    body: string
    tableHeader: string
  }
  layout: {
    pageSize: 'A4' | 'A3' | 'Letter'
    padding: number
    headerHeight: number
    footerHeight: number
  }
  logo: {
    maxWidth: number
    maxHeight: number
    position: 'left' | 'right' | 'center'
  }
  showSections: {
    companyInfo: boolean
    businessInfo: boolean
    terms: boolean
    signature: boolean
    pagination: boolean
  }
  customElements?: {
    header?: string
    footer?: string
    watermark?: string
  }
}

// Pre-defined templates
export const QUOTE_TEMPLATES: QuoteTemplate[] = [
  {
    id: 'modern',
    name: 'Modern Professional',
    description: 'Clean, modern design with subtle colors',
    colors: {
      primary: '#3B82F6',
      secondary: '#1E40AF',
      accent: '#F59E0B',
      text: '#1F2937',
      background: '#FFFFFF',
      headerBorder: '#E5E7EB'
    },
    fonts: {
      title: 'Helvetica-Bold',
      subtitle: 'Helvetica',
      body: 'Helvetica',
      tableHeader: 'Helvetica-Bold'
    },
    layout: {
      pageSize: 'A4',
      padding: 50, // Increased from 40 to prevent edge crowding
      headerHeight: 120,
      footerHeight: 80
    },
    logo: {
      maxWidth: 120,
      maxHeight: 60,
      position: 'right'
    },
    showSections: {
      companyInfo: true,
      businessInfo: true,
      terms: true,
      signature: true,
      pagination: true
    }
  },
  {
    id: 'classic',
    name: 'Classic Business',
    description: 'Traditional business quote design',
    colors: {
      primary: '#1F2937',
      secondary: '#374151',
      accent: '#059669',
      text: '#111827',
      background: '#FFFFFF',
      headerBorder: '#374151'
    },
    fonts: {
      title: 'Times-Bold',
      subtitle: 'Times-Roman',
      body: 'Times-Roman',
      tableHeader: 'Times-Bold'
    },
    layout: {
      pageSize: 'A4',
      padding: 60, // Increased from 50 for better spacing
      headerHeight: 140,
      footerHeight: 100
    },
    logo: {
      maxWidth: 150,
      maxHeight: 75,
      position: 'left'
    },
    showSections: {
      companyInfo: true,
      businessInfo: true,
      terms: true,
      signature: true,
      pagination: true
    }
  },
  {
    id: 'minimal',
    name: 'Minimal Clean',
    description: 'Minimal design with maximum whitespace',
    colors: {
      primary: '#000000',
      secondary: '#666666',
      accent: '#000000',
      text: '#333333',
      background: '#FFFFFF',
      headerBorder: '#CCCCCC'
    },
    fonts: {
      title: 'Helvetica-Bold',
      subtitle: 'Helvetica',
      body: 'Helvetica-Light',
      tableHeader: 'Helvetica'
    },
    layout: {
      pageSize: 'A4',
      padding: 60,
      headerHeight: 100,
      footerHeight: 60
    },
    logo: {
      maxWidth: 100,
      maxHeight: 50,
      position: 'center'
    },
    showSections: {
      companyInfo: true,
      businessInfo: true,
      terms: false,
      signature: false,
      pagination: true
    }
  },
  {
    id: 'elegant',
    name: 'Elegant Premium',
    description: 'Premium design with sophisticated styling',
    colors: {
      primary: '#7C3AED',
      secondary: '#5B21B6',
      accent: '#F59E0B',
      text: '#1F2937',
      background: '#FAFAFA',
      headerBorder: '#E5E7EB'
    },
    fonts: {
      title: 'Georgia-Bold',
      subtitle: 'Georgia',
      body: 'Georgia',
      tableHeader: 'Georgia-Bold'
    },
    layout: {
      pageSize: 'A4',
      padding: 55, // Increased from 45 for better spacing
      headerHeight: 130,
      footerHeight: 90
    },
    logo: {
      maxWidth: 140,
      maxHeight: 70,
      position: 'right'
    },
    showSections: {
      companyInfo: true,
      businessInfo: true,
      terms: true,
      signature: true,
      pagination: true
    },
    customElements: {
      header: 'PREMIUM BUSINESS SOLUTIONS',
      footer: 'Thank you for your valued business',
      watermark: 'DRAFT'
    }
  }
]

// Helper function to get template by ID
export function getQuoteTemplate(id: string): QuoteTemplate | null {
  return QUOTE_TEMPLATES.find(template => template.id === id) || null
}

// Helper function to get all templates
export function getAllQuoteTemplates(): QuoteTemplate[] {
  return QUOTE_TEMPLATES
}

// Helper function to create custom template
export function createCustomTemplate(baseTemplate: QuoteTemplate, customizations: Partial<QuoteTemplate>): QuoteTemplate {
  return {
    ...baseTemplate,
    ...customizations,
    id: `custom_${Date.now()}`,
    name: customizations.name || `Custom ${baseTemplate.name}`,
    colors: {
      ...baseTemplate.colors,
      ...customizations.colors
    },
    fonts: {
      ...baseTemplate.fonts,
      ...customizations.fonts
    },
    layout: {
      ...baseTemplate.layout,
      ...customizations.layout
    },
    logo: {
      ...baseTemplate.logo,
      ...customizations.logo
    },
    showSections: {
      ...baseTemplate.showSections,
      ...customizations.showSections
    },
    customElements: {
      ...baseTemplate.customElements,
      ...customizations.customElements
    }
  }
}

// Default template
export const DEFAULT_TEMPLATE = QUOTE_TEMPLATES[3] // Elegant Premium