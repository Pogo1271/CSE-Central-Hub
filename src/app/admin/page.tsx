'use client'

import React, { useState, useEffect } from 'react'
import { 
  Database, 
  Table as TableIcon, 
  Users, 
  Building2, 
  Package, 
  FileText, 
  MessageSquare, 
  CheckSquare,
  Settings,
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  RefreshCw,
  Download,
  Upload,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/hooks/use-toast'

interface DatabaseRecord {
  id: string
  [key: string]: any
}

export default function AdminDatabasePage() {
  const [activeTable, setActiveTable] = useState('users')
  const [data, setData] = useState<DatabaseRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRecord, setSelectedRecord] = useState<DatabaseRecord | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [newRecord, setNewRecord] = useState<DatabaseRecord>({})
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [importData, setImportData] = useState('')
  const [importPreview, setImportPreview] = useState<DatabaseRecord[]>([])
  const [selectedRecords, setSelectedRecords] = useState<string[]>([]) // For bulk actions
  const { toast } = useToast()

  const tableEndpoints = {
    users: '/api/users',
    roles: '/api/roles',
    businesses: '/api/businesses',
    products: '/api/products',
    tasks: '/api/tasks',
    quotes: '/api/quotes',
    documents: '/api/documents',
    messages: '/api/messages'
  }

  const tableIcons = {
    users: Users,
    roles: Settings,
    businesses: Building2,
    products: Package,
    tasks: CheckSquare,
    quotes: FileText,
    documents: FileText,
    messages: MessageSquare
  }

  const tableNames = {
    users: 'Users',
    roles: 'Roles',
    businesses: 'Businesses',
    products: 'Products',
    tasks: 'Tasks',
    quotes: 'Quotes',
    documents: 'Documents',
    messages: 'Messages'
  }

  useEffect(() => {
    fetchData()
    setSelectedRecords([]) // Clear selection when switching tables
  }, [activeTable])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(tableEndpoints[activeTable as keyof typeof tableEndpoints])
      if (!response.ok) {
        throw new Error(`Failed to fetch ${tableNames[activeTable as keyof typeof tableNames]}`)
      }
      
      const data = await response.json()
      setData(data)
    } catch (err: any) {
      console.error('Error fetching data:', err)
      setError(err.message)
      toast({
        title: "Error",
        description: `Failed to load ${tableNames[activeTable as keyof typeof tableNames]}`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredData = data.filter(record =>
    Object.values(record).some(value =>
      value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  const handleEdit = (record: DatabaseRecord) => {
    setSelectedRecord(record)
    setIsEditOpen(true)
  }

  const handleUpdate = async () => {
    if (!selectedRecord) return

    try {
      const response = await fetch(`${tableEndpoints[activeTable as keyof typeof tableEndpoints]}/${selectedRecord.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(selectedRecord)
      })

      if (!response.ok) {
        throw new Error('Failed to update record')
      }

      await fetchData()
      setIsEditOpen(false)
      setSelectedRecord(null)
      toast({
        title: "Success",
        description: "Record updated successfully",
      })
    } catch (err: any) {
      console.error('Error updating record:', err)
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this record?')) return

    try {
      // Special handling for recurring tasks
      if (activeTable === 'tasks') {
        // Check if this is a recurring task and handle accordingly
        const task = data.find(record => record.id === id)
        if (task && (task.recurring || task.parentTaskId)) {
          const response = await fetch(`/api/tasks/delete-recurring?taskId=${id}`, {
            method: 'DELETE'
          })
          
          if (!response.ok) {
            throw new Error('Failed to delete recurring task chain')
          }
          
          const result = await response.json()
          console.log('Deleted recurring task chain:', result)
        } else {
          // Regular task deletion
          const response = await fetch(`${tableEndpoints[activeTable as keyof typeof tableEndpoints]}/${id}`, {
            method: 'DELETE'
          })
          
          if (!response.ok) {
            throw new Error('Failed to delete record')
          }
        }
      } else {
        // Non-task deletion
        const response = await fetch(`${tableEndpoints[activeTable as keyof typeof tableEndpoints]}/${id}`, {
          method: 'DELETE'
        })

        if (!response.ok) {
          throw new Error('Failed to delete record')
        }
      }

      await fetchData()
      toast({
        title: "Success",
        description: "Record deleted successfully",
      })
    } catch (err: any) {
      console.error('Error deleting record:', err)
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      })
    }
  }

  const handleBulkDelete = async () => {
    if (selectedRecords.length === 0) return
    
    if (!confirm(`Are you sure you want to delete ${selectedRecords.length} record${selectedRecords.length !== 1 ? 's' : ''}?`)) return

    try {
      // Special handling for recurring tasks in bulk deletion
      if (activeTable === 'tasks') {
        const taskIdsToDelete = [...selectedRecords]
        let totalDeleted = 0
        
        for (const taskId of taskIdsToDelete) {
          const task = data.find(record => record.id === taskId)
          if (task && (task.recurring || task.parentTaskId)) {
            // Handle recurring task deletion
            const response = await fetch(`/api/tasks/delete-recurring?taskId=${taskId}`, {
              method: 'DELETE'
            })
            
            if (response.ok) {
              const result = await response.json()
              totalDeleted += result.deletedTasks
            }
          } else {
            // Regular task deletion
            const response = await fetch(`${tableEndpoints[activeTable as keyof typeof tableEndpoints]}/${taskId}`, {
              method: 'DELETE'
            })
            
            if (response.ok) {
              totalDeleted += 1
            }
          }
        }
        
        await fetchData()
        setSelectedRecords([])
        toast({
          title: "Success",
          description: `Deleted ${totalDeleted} record${totalDeleted !== 1 ? 's' : ''} (including recurring instances)`,
        })
      } else {
        // Non-task bulk deletion
        const deletePromises = selectedRecords.map(id => 
          fetch(`${tableEndpoints[activeTable as keyof typeof tableEndpoints]}/${id}`, { method: 'DELETE' })
        )
        
        const responses = await Promise.all(deletePromises)
        
        if (responses.every(response => response.ok)) {
          await fetchData()
          setSelectedRecords([])
          toast({
            title: "Success",
            description: `${selectedRecords.length} record${selectedRecords.length !== 1 ? 's' : ''} deleted successfully`,
          })
        } else {
          throw new Error('Failed to delete some records')
        }
      }
    } catch (err: any) {
      console.error('Error bulk deleting records:', err)
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      })
    }
  }

  const handleAdd = async () => {
    try {
      const response = await fetch(tableEndpoints[activeTable as keyof typeof tableEndpoints], {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newRecord)
      })

      if (!response.ok) {
        throw new Error('Failed to create record')
      }

      await fetchData()
      setIsAddOpen(false)
      setNewRecord({})
      toast({
        title: "Success",
        description: "Record created successfully",
      })
    } catch (err: any) {
      console.error('Error creating record:', err)
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      })
    }
  }

  // CSV Export functionality
  const exportToCSV = () => {
    if (data.length === 0) {
      toast({
        title: "No Data",
        description: "No records to export",
        variant: "destructive",
      })
      return
    }

    const headers = Object.keys(data[0])
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header]
          // Handle nested objects, arrays, and special characters
          if (typeof value === 'object' && value !== null) {
            return `"${JSON.stringify(value).replace(/"/g, '""')}"`
          }
          return typeof value === 'string' && value.includes(',') 
            ? `"${value.replace(/"/g, '""')}"` 
            : value
        }).join(',')
      )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${activeTable}_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast({
      title: "Export Successful",
      description: `Exported ${data.length} records to CSV`,
    })
  }

  // CSV Import functionality
  const parseCSV = (csvText: string) => {
    const lines = csvText.trim().split('\n')
    if (lines.length < 2) return []

    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''))
    const records = lines.slice(1).map(line => {
      const values = line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g) || []
      const record: DatabaseRecord = { id: crypto.randomUUID() }
      
      headers.forEach((header, index) => {
        const value = values[index] ? values[index].replace(/^"|"$/g, '').replace(/""/g, '"') : ''
        // Try to parse as JSON for objects
        try {
          record[header] = value.startsWith('{') || value.startsWith('[') 
            ? JSON.parse(value) 
            : value
        } catch {
          record[header] = value
        }
      })
      
      return record
    })
    
    return records
  }

  const handleCSVImport = () => {
    try {
      const records = parseCSV(importData)
      if (records.length === 0) {
        toast({
          title: "Invalid CSV",
          description: "No valid records found in CSV data",
          variant: "destructive",
        })
        return
      }
      
      setImportPreview(records)
    } catch (err) {
      toast({
        title: "Parse Error",
        description: "Failed to parse CSV data",
        variant: "destructive",
      })
    }
  }

  const confirmImport = async () => {
    try {
      for (const record of importPreview) {
        await fetch(tableEndpoints[activeTable as keyof typeof tableEndpoints], {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(record)
        })
      }

      await fetchData()
      setIsImportOpen(false)
      setImportData('')
      setImportPreview([])
      toast({
        title: "Import Successful",
        description: `Imported ${importPreview.length} records`,
      })
    } catch (err) {
      console.error('Error importing records:', err)
      toast({
        title: "Import Error",
        description: "Failed to import some records",
        variant: "destructive",
      })
    }
  }

  const renderTable = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-8">
          <RefreshCw className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading {tableNames[activeTable as keyof typeof tableNames]}...</span>
        </div>
      )
    }

    if (error) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Error loading data</h3>
          <p className="text-red-600">{error}</p>
          <Button onClick={fetchData} variant="outline" className="mt-2">
            Retry
          </Button>
        </div>
      )
    }

    if (data.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500">No {tableNames[activeTable as keyof typeof tableNames]} found</p>
        </div>
      )
    }

    const columns = data.length > 0 ? Object.keys(data[0]).filter(key => key !== 'id') : []

    return (
      <div>
        {/* Bulk Actions */}
        {selectedRecords.length > 0 && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg border">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                {selectedRecords.length} record{selectedRecords.length !== 1 ? 's' : ''} selected
              </span>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleBulkDelete}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete ({selectedRecords.length})
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedRecords([])}
                >
                  Clear Selection
                </Button>
              </div>
            </div>
          </div>
        )}
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedRecords.length === filteredData.length && filteredData.length > 0}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedRecords(filteredData.map(record => record.id))
                      } else {
                        setSelectedRecords([])
                      }
                    }}
                  />
                </TableHead>
                {columns.map(column => (
                  <TableHead key={column} className="capitalize">
                    {column.replace(/([A-Z])/g, ' $1').trim()}
                  </TableHead>
                ))}
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedRecords.includes(record.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedRecords(prev => [...prev, record.id])
                        } else {
                          setSelectedRecords(prev => prev.filter(id => id !== record.id))
                        }
                      }}
                    />
                  </TableCell>
                  {columns.map(column => (
                    <TableCell key={column}>
                      {typeof record[column] === 'boolean' ? (
                        <Badge variant={record[column] ? 'default' : 'secondary'}>
                          {record[column] ? 'Yes' : 'No'}
                        </Badge>
                      ) : record[column] instanceof Date ? (
                        record[column].toLocaleDateString()
                      ) : typeof record[column] === 'object' ? (
                        <span className="text-sm text-gray-500">Object</span>
                      ) : (
                        String(record[column] || '')
                      )}
                    </TableCell>
                  ))}
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(record)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(record.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    )
  }

  const renderEditDialog = () => {
    if (!selectedRecord) return null

    const fields = Object.keys(selectedRecord).filter(key => key !== 'id')

    return (
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit {tableNames[activeTable as keyof typeof tableNames]}</DialogTitle>
            <DialogDescription>
              Update record information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {fields.map(field => (
              <div key={field}>
                <Label htmlFor={`edit-${field}`} className="capitalize">
                  {field === 'color' ? 'Colour' : field.replace(/([A-Z])/g, ' $1').trim()}
                </Label>
                {field === 'email' ? (
                  <Input
                    id={`edit-${field}`}
                    type="email"
                    value={selectedRecord[field] || ''}
                    onChange={(e) => setSelectedRecord({
                      ...selectedRecord,
                      [field]: e.target.value
                    })}
                  />
                ) : field === 'password' ? (
                  <Input
                    id={`edit-${field}`}
                    type="password"
                    placeholder="Enter new password (leave blank to keep current)"
                    value={selectedRecord[field] || ''}
                    onChange={(e) => setSelectedRecord({
                      ...selectedRecord,
                      [field]: e.target.value
                    })}
                  />
                ) : field === 'name' ? (
                  <Input
                    id={`edit-${field}`}
                    placeholder="Enter full name"
                    value={selectedRecord[field] || ''}
                    onChange={(e) => setSelectedRecord({
                      ...selectedRecord,
                      [field]: e.target.value
                    })}
                  />
                ) : field === 'role' ? (
                  <Select onValueChange={(value) => setSelectedRecord({ ...selectedRecord, [field]: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Admin">Admin</SelectItem>
                      <SelectItem value="Manager">Manager</SelectItem>
                      <SelectItem value="User">User</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                ) : field === 'status' ? (
                  <Select onValueChange={(value) => setSelectedRecord({ ...selectedRecord, [field]: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                ) : field === 'color' ? (
                  <div className="flex gap-2 items-center">
                    <Input
                      id={`edit-${field}`}
                      type="color"
                      className="w-16 h-10 p-1 border rounded"
                      value={selectedRecord[field] || '#3B82F6'}
                      onChange={(e) => setSelectedRecord({
                        ...selectedRecord,
                        [field]: e.target.value
                      })}
                    />
                    <Input
                      placeholder="#3B82F6"
                      value={selectedRecord[field] || '#3B82F6'}
                      onChange={(e) => setSelectedRecord({
                        ...selectedRecord,
                        [field]: e.target.value
                      })}
                    />
                  </div>
                ) : typeof selectedRecord[field] === 'boolean' ? (
                  <Select onValueChange={(value) => setSelectedRecord({
                    ...selectedRecord,
                    [field]: value === 'true'
                  })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select value" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Yes</SelectItem>
                      <SelectItem value="false">No</SelectItem>
                    </SelectContent>
                  </Select>
                ) : typeof selectedRecord[field] === 'object' ? (
                  <Textarea
                    id={`edit-${field}`}
                    value={JSON.stringify(selectedRecord[field], null, 2)}
                    onChange={(e) => {
                      try {
                        setSelectedRecord({
                          ...selectedRecord,
                          [field]: JSON.parse(e.target.value)
                        })
                      } catch {
                        // Invalid JSON, ignore
                      }
                    }}
                    className="w-full"
                    rows={4}
                  />
                ) : (
                  <Input
                    id={`edit-${field}`}
                    value={selectedRecord[field] || ''}
                    onChange={(e) => setSelectedRecord({
                      ...selectedRecord,
                      [field]: e.target.value
                    })}
                  />
                )}
              </div>
            ))}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdate}>
                Update
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  const renderAddDialog = () => {
    // Get sample record structure based on current table
    const getEmptyRecord = () => {
      const sampleRecord = data.length > 0 ? { ...data[0] } : {}
      delete sampleRecord.id
      
      // Set default values based on field type
      Object.keys(sampleRecord).forEach(key => {
        if (typeof sampleRecord[key] === 'boolean') {
          sampleRecord[key] = false
        } else if (typeof sampleRecord[key] === 'number') {
          sampleRecord[key] = 0
        } else if (sampleRecord[key] instanceof Date) {
          sampleRecord[key] = new Date().toISOString()
        } else if (Array.isArray(sampleRecord[key])) {
          sampleRecord[key] = []
        } else if (typeof sampleRecord[key] === 'object' && sampleRecord[key] !== null) {
          sampleRecord[key] = {}
        } else {
          sampleRecord[key] = ''
        }
      })
      
      return sampleRecord
    }

    const fields = data.length > 0 ? Object.keys(getEmptyRecord()) : []

    // Special handling for users table to ensure all required fields are present
    const userFields = ['email', 'password', 'name', 'role', 'status', 'color']
    const displayFields = activeTable === 'users' 
      ? userFields.filter(field => fields.includes(field) || field === 'password') // Always include password for users
      : fields

    return (
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New {tableNames[activeTable as keyof typeof tableNames].slice(0, -1)}</DialogTitle>
            <DialogDescription>
              Create a new record in the {tableNames[activeTable as keyof typeof tableNames].toLowerCase()} table
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {displayFields.map(field => (
              <div key={field}>
                <Label htmlFor={`add-${field}`} className="capitalize">
                  {field === 'color' ? 'Colour' : field.replace(/([A-Z])/g, ' $1').trim()}
                </Label>
                {field === 'email' ? (
                  <Input
                    id={`add-${field}`}
                    type="email"
                    placeholder="Enter email address"
                    value={newRecord[field] || ''}
                    onChange={(e) => setNewRecord({
                      ...newRecord,
                      [field]: e.target.value
                    })}
                  />
                ) : field === 'password' ? (
                  <Input
                    id={`add-${field}`}
                    type="password"
                    placeholder="Enter password"
                    value={newRecord[field] || ''}
                    onChange={(e) => setNewRecord({
                      ...newRecord,
                      [field]: e.target.value
                    })}
                  />
                ) : field === 'name' ? (
                  <Input
                    id={`add-${field}`}
                    placeholder="Enter full name"
                    value={newRecord[field] || ''}
                    onChange={(e) => setNewRecord({
                      ...newRecord,
                      [field]: e.target.value
                    })}
                  />
                ) : field === 'role' ? (
                  <Select onValueChange={(value) => setNewRecord({ ...newRecord, [field]: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Admin">Admin</SelectItem>
                      <SelectItem value="Manager">Manager</SelectItem>
                      <SelectItem value="User">User</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                ) : field === 'status' ? (
                  <Select onValueChange={(value) => setNewRecord({ ...newRecord, [field]: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                ) : field === 'color' ? (
                  <div className="flex gap-2 items-center">
                    <Input
                      id={`add-${field}`}
                      type="color"
                      className="w-16 h-10 p-1 border rounded"
                      value={newRecord[field] || '#3B82F6'}
                      onChange={(e) => setNewRecord({
                        ...newRecord,
                        [field]: e.target.value
                      })}
                    />
                    <Input
                      placeholder="#3B82F6"
                      value={newRecord[field] || '#3B82F6'}
                      onChange={(e) => setNewRecord({
                        ...newRecord,
                        [field]: e.target.value
                      })}
                    />
                  </div>
                ) : field === 'priority' ? (
                  <Select onValueChange={(value) => setNewRecord({ ...newRecord, [field]: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                ) : typeof newRecord[field] === 'boolean' || (data.length > 0 && typeof data[0][field] === 'boolean') ? (
                  <Select onValueChange={(value) => setNewRecord({ ...newRecord, [field]: value === 'true' })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select value" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Yes</SelectItem>
                      <SelectItem value="false">No</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id={`add-${field}`}
                    placeholder={`Enter ${field === 'color' ? 'colour' : field.replace(/([A-Z])/g, ' $1').trim().toLowerCase()}`}
                    value={newRecord[field] || ''}
                    onChange={(e) => setNewRecord({
                      ...newRecord,
                      [field]: e.target.value
                    })}
                  />
                )}
              </div>
            ))}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAdd}>
                Create
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  const renderImportDialog = () => {
    return (
      <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Import CSV Data</DialogTitle>
            <DialogDescription>
              Import records from CSV file for {tableNames[activeTable as keyof typeof tableNames].toLowerCase()}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="csv-data">CSV Data</Label>
              <Textarea
                id="csv-data"
                placeholder="Paste your CSV data here. First row should contain column headers."
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                className="w-full"
                rows={10}
              />
            </div>
            
            {importPreview.length > 0 && (
              <div>
                <Label>Preview ({importPreview.length} records)</Label>
                <div className="border rounded-lg p-4 max-h-64 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {Object.keys(importPreview[0]).map(header => (
                          <TableHead key={header} className="capitalize">
                            {header}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {importPreview.slice(0, 5).map((record, index) => (
                        <TableRow key={index}>
                          {Object.values(record).map((value: any, cellIndex) => (
                            <TableCell key={cellIndex}>
                              {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {importPreview.length > 5 && (
                    <p className="text-sm text-gray-500 mt-2">
                      ... and {importPreview.length - 5} more records
                    </p>
                  )}
                </div>
              </div>
            )}
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsImportOpen(false)}>
                Cancel
              </Button>
              {importPreview.length === 0 ? (
                <Button onClick={handleCSVImport}>
                  Parse CSV
                </Button>
              ) : (
                <Button onClick={confirmImport}>
                  Import {importPreview.length} Records
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Database Management</h1>
          <p className="text-muted-foreground">View and edit database records</p>
        </div>
        <Button onClick={fetchData} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Tabs value={activeTable} onValueChange={setActiveTable} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
          {Object.entries(tableNames).map(([key, name]) => {
            const Icon = tableIcons[key as keyof typeof tableIcons]
            return (
              <TabsTrigger key={key} value={key} className="flex items-center gap-1">
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{name}</span>
              </TabsTrigger>
            )
          })}
        </TabsList>

        {Object.entries(tableNames).map(([key, name]) => (
          <TabsContent key={key} value={key} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {React.createElement(tableIcons[key as keyof typeof tableIcons], { className: "h-5 w-5" })}
                  {name}
                </CardTitle>
                <CardDescription>
                  Manage {name.toLowerCase()} in the database
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={`Search ${name.toLowerCase()}...`}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button onClick={() => setIsAddOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add {name.slice(0, -1)}
                  </Button>
                  <Button onClick={exportToCSV} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                  <Button onClick={() => setIsImportOpen(true)} variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Import CSV
                  </Button>
                </div>

                {renderTable()}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {renderEditDialog()}
      {renderAddDialog()}
      {renderImportDialog()}
    </div>
  )
}