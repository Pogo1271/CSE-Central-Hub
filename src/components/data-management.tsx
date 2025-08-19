'use client'

import { useState } from 'react'
import { Download, Upload, FileText, Database, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'

interface ImportResult {
  success: number
  errors: string[]
  imported: any[]
}

export function DataManagement() {
  const [exportType, setExportType] = useState<string>('')
  const [exportFormat, setExportFormat] = useState<string>('csv')
  const [importType, setImportType] = useState<string>('')
  const [importFile, setImportFile] = useState<File | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)

  const exportTypes = [
    { value: 'businesses', label: 'Businesses', description: 'All business data with contacts and tasks' },
    { value: 'quotes', label: 'Quotes', description: 'All quotes with items and business info' },
    { value: 'products', label: 'Products', description: 'Product catalog with pricing' },
    { value: 'users', label: 'Users', description: 'User accounts and roles' },
    { value: 'contacts', label: 'Contacts', description: 'Contact information for businesses' }
  ]

  const importTypes = [
    { value: 'businesses', label: 'Businesses', description: 'Import business data from CSV/JSON' },
    { value: 'products', label: 'Products', description: 'Import product catalog from CSV/JSON' },
    { value: 'users', label: 'Users', description: 'Import user accounts from CSV/JSON' },
    { value: 'contacts', label: 'Contacts', description: 'Import contacts (requires business ID)' }
  ]

  const handleExport = async () => {
    if (!exportType) return

    setIsExporting(true)
    try {
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: exportType,
          format: exportFormat
        })
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        
        // Get filename from response headers
        const contentDisposition = response.headers.get('content-disposition')
        const filename = contentDisposition
          ? contentDisposition.split('filename=')[1]?.replace(/"/g, '') || `export.${exportFormat}`
          : `export.${exportFormat}`
        
        a.download = filename
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        const error = await response.json()
        alert(`Export failed: ${error.error}`)
      }
    } catch (error) {
      console.error('Export error:', error)
      alert('Export failed. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  const handleImport = async () => {
    if (!importType || !importFile) return

    setIsImporting(true)
    setImportResult(null)

    try {
      const formData = new FormData()
      formData.append('file', importFile)
      formData.append('type', importType)

      const response = await fetch('/api/import', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()
      
      if (response.ok) {
        setImportResult(result.results)
      } else {
        alert(`Import failed: ${result.error}`)
      }
    } catch (error) {
      console.error('Import error:', error)
      alert('Import failed. Please try again.')
    } finally {
      setIsImporting(false)
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      const allowedTypes = ['text/csv', 'application/json', 'text/plain']
      const allowedExtensions = ['.csv', '.json']
      
      const isValidType = allowedTypes.includes(file.type) || 
                         allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext))
      
      if (isValidType) {
        setImportFile(file)
      } else {
        alert('Please select a valid CSV or JSON file.')
        event.target.value = ''
      }
    }
  }

  const getSampleData = (type: string) => {
    switch (type) {
      case 'businesses':
        return `name,description,category,location,phone,email,website,status,supportContract,supportExpiry
"Tech Solutions Inc.","Leading tech provider","Technology","San Francisco, CA","+1 (555) 123-4567","info@techsolutions.com","www.techsolutions.com","Active",true,"2024-12-31"`
      
      case 'products':
        return `name,description,price,pricingType,category,sku
"EPOS System Pro","Complete EPOS solution",2999.99,"one-off","Hardware","EPOS-PRO-001"`
      
      case 'users':
        return `email,name,role,status,color
"john.doe@example.com","John Doe","Admin","Active","#3B82F6"`
      
      case 'contacts':
        return `name,email,phone,position,businessId
"John Smith","john.smith@techsolutions.com","+1 (555) 123-4567","CEO","business_id_here"`
      
      default:
        return ''
    }
  }

  const downloadSample = (type: string) => {
    const sampleData = getSampleData(type)
    const blob = new Blob([sampleData], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.style.display = 'none'
    a.href = url
    a.download = `${type}_sample.csv`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  return (
    <div className="space-y-6">
      {/* Export Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Data
          </CardTitle>
          <CardDescription>
            Export your data in CSV or JSON format for backup or analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="export-type">Data Type</Label>
              <Select value={exportType} onValueChange={setExportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select data type to export" />
                </SelectTrigger>
                <SelectContent>
                  {exportTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div>
                        <div className="font-medium">{type.label}</div>
                        <div className="text-xs text-gray-500">{type.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="export-format">Format</Label>
              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Button 
            onClick={handleExport} 
            disabled={!exportType || isExporting}
            className="w-full"
          >
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Separator />

      {/* Import Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Data
          </CardTitle>
          <CardDescription>
            Import data from CSV or JSON files. Use sample files as templates.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="import-type">Data Type</Label>
              <Select value={importType} onValueChange={setImportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select data type to import" />
                </SelectTrigger>
                <SelectContent>
                  {importTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div>
                        <div className="font-medium">{type.label}</div>
                        <div className="text-xs text-gray-500">{type.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="import-file">File</Label>
              <Input
                id="import-file"
                type="file"
                accept=".csv,.json"
                onChange={handleFileChange}
                disabled={isImporting}
              />
              {importFile && (
                <div className="mt-1 text-sm text-gray-600">
                  Selected: {importFile.name} ({(importFile.size / 1024).toFixed(1)} KB)
                </div>
              )}
            </div>
          </div>
          
          {importType && (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-gray-500" />
                <span className="text-sm">Need a template?</span>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => downloadSample(importType)}
              >
                Download Sample
              </Button>
            </div>
          )}
          
          <Button 
            onClick={handleImport} 
            disabled={!importType || !importFile || isImporting}
            className="w-full"
          >
            {isImporting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Import Data
              </>
            )}
          </Button>
          
          {importResult && (
            <div className="space-y-3">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Import completed successfully! {importResult.success} records imported.
                </AlertDescription>
              </Alert>
              
              {importResult.errors.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="font-medium mb-1">Some errors occurred:</div>
                    <ul className="text-sm space-y-1">
                      {importResult.errors.slice(0, 5).map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                      {importResult.errors.length > 5 && (
                        <li>• ... and {importResult.errors.length - 5} more errors</li>
                      )}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Statistics
          </CardTitle>
          <CardDescription>
            Overview of your current data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">1,234</div>
              <div className="text-sm text-gray-600">Businesses</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">456</div>
              <div className="text-sm text-gray-600">Products</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">89</div>
              <div className="text-sm text-gray-600">Quotes</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-orange-600">156</div>
              <div className="text-sm text-gray-600">Users</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-red-600">2,345</div>
              <div className="text-sm text-gray-600">Contacts</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}