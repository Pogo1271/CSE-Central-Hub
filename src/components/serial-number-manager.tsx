'use client'

import { useState, useEffect } from 'react'
import {
  Package,
  Plus,
  Search,
  Edit,
  Trash2,
  Download,
  Upload,
  Filter,
  X,
  CheckCircle,
  AlertTriangle,
  Clock,
  Building,
  Car,
  RefreshCw,
  ArrowLeft
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useAuth } from '@/hooks/use-auth'
import { getToken } from '@/lib/auth'
import SerialAssignmentModal from './customer-assignment-modal'

// Status configuration with icons and colors
const statusConfig = {
  'in-stock': { 
    label: 'In Stock', 
    color: 'bg-green-100 text-green-800', 
    icon: Package,
    description: 'Available for sale'
  },
  'sold': { 
    label: 'Sold', 
    color: 'bg-blue-100 text-blue-800', 
    icon: CheckCircle,
    description: 'Assigned to customer'
  },
  'on-car': { 
    label: 'On Car', 
    color: 'bg-yellow-100 text-yellow-800', 
    icon: Car,
    description: 'Installed in vehicle'
  },
  'office-use': { 
    label: 'Office Use', 
    color: 'bg-purple-100 text-purple-800', 
    icon: Building,
    description: 'Internal use only'
  },
  'swapped': { 
    label: 'Swapped', 
    color: 'bg-orange-100 text-orange-800', 
    icon: RefreshCw,
    description: 'Replaced/Exchanged'
  },
  'returned': { 
    label: 'Returned', 
    color: 'bg-red-100 text-red-800', 
    icon: ArrowLeft,
    description: 'Returned to stock'
  }
}

interface ProductInstance {
  id: string
  serialNumber: string
  status: string
  businessId?: string
  contactId?: string
  soldDate?: string
  warrantyExpiry?: string
  comments?: string
  product: {
    id: string
    name: string
    category: string
    price: number
  }
  business?: {
    id: string
    name: string
  }
  contact?: {
    id: string
    name: string
    email: string
    phone: string
  }
  lastUpdatedByUser?: {
    id: string
    name: string
  }
}

interface SerialNumberManagerProps {
  product: {
    id: string
    name: string
    category: string
    isSerialized: boolean
  }
  open: boolean
  onClose: () => void
  onAssignmentComplete?: () => void // Add callback for when assignment is complete
}

export default function SerialNumberManager({ product, open, onClose, onAssignmentComplete }: SerialNumberManagerProps) {
  const { user: currentUser } = useAuth()
  const [instances, setInstances] = useState<ProductInstance[]>([])
  const [filteredInstances, setFilteredInstances] = useState<ProductInstance[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isAddInstanceOpen, setIsAddInstanceOpen] = useState(false)
  const [selectedInstance, setSelectedInstance] = useState<ProductInstance | null>(null)
  const [deleteInstanceDialog, setDeleteInstanceDialog] = useState({
    open: false,
    instanceId: null
  })
  const [permanentDeleteDialog, setPermanentDeleteDialog] = useState({
    open: false,
    instanceId: null
  })
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false)
  const [editingInstance, setEditingInstance] = useState<ProductInstance | null>(null)

  // Form states
  const [newInstance, setNewInstance] = useState({
    serialNumber: '',
    licenseNumber: '',
    status: 'in-stock',
    comments: '',
    isLicense: false
  })

  // Filter instances based on search and status
  const filterInstances = () => {
    let filtered = instances

    if (searchTerm) {
      filtered = filtered.filter(instance =>
        instance.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        instance.product.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(instance => instance.status === statusFilter)
    }

    setFilteredInstances(filtered)
  }

  // Load instances from database
  useEffect(() => {
    const loadInstances = async () => {
      try {
        const token = getToken()
        const response = await fetch(`/api/product-instances?productId=${product.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })
        if (response.ok) {
          const instancesData = await response.json()
          setInstances(instancesData)
          setFilteredInstances(instancesData)
        }
      } catch (error) {
        console.error('Error loading product instances:', error)
      }
    }

    if (open && product.isSerialized) {
      loadInstances()
    }
  }, [open, product.id, product.isSerialized])

  // Apply filters when instances or filters change
  useEffect(() => {
    filterInstances()
  }, [instances, searchTerm, statusFilter])

  const handleAddInstance = async () => {
    try {
      const token = getToken()
      const response = await fetch('/api/product-instances', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...newInstance,
          productId: product.id,
          lastUpdatedBy: currentUser?.id
        }),
      })

      if (response.ok) {
        const savedInstance = await response.json()
        const updatedInstances = [...instances, savedInstance]
        setInstances(updatedInstances)
        setNewInstance({
          serialNumber: '',
          licenseNumber: '',
          status: 'in-stock',
          comments: '',
          isLicense: false
        })
        setIsAddInstanceOpen(false)
      } else {
        const errorData = await response.json()
        alert(`Error: ${errorData.error || 'Failed to create serial number'}`)
      }
    } catch (error) {
      console.error('Error creating serial number:', error)
      alert('Network error: Failed to create serial number')
    }
  }

  const handleEditInstance = (instance: ProductInstance) => {
    setEditingInstance(instance)
    setIsAssignmentModalOpen(true)
  }

  const handleDeleteInstance = async (instanceId: string) => {
    setDeleteInstanceDialog({
      open: true,
      instanceId
    })
  }

  const handlePermanentDelete = async (instanceId: string) => {
    setPermanentDeleteDialog({
      open: true,
      instanceId
    })
  }

  const confirmDeleteInstance = async () => {
    const { instanceId } = deleteInstanceDialog
    try {
      const token = getToken()
      // Instead of deleting, update the instance to return it to available pool
      const response = await fetch(`/api/product-instances/${instanceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: 'in-stock',
          businessId: null,
          contactId: null,
          soldDate: null,
          warrantyExpiry: null,
          comments: 'Returned to available pool',
          lastUpdatedBy: currentUser?.id
        }),
      })

      if (response.ok) {
        const updatedInstance = await response.json()
        const updatedInstances = instances.map(i => 
          i.id === instanceId ? updatedInstance : i
        )
        setInstances(updatedInstances)
        setDeleteInstanceDialog({ open: false, instanceId: null })
      } else {
        const errorData = await response.json()
        alert(`Error: ${errorData.error || 'Failed to return serial number to available pool'}`)
      }
    } catch (error) {
      console.error('Error returning serial number to available pool:', error)
      setDeleteInstanceDialog({ open: false, instanceId: null })
    }
  }

  const confirmPermanentDelete = async () => {
    const { instanceId } = permanentDeleteDialog
    try {
      const token = getToken()
      // Actually delete the instance from the database
      const response = await fetch(`/api/product-instances/${instanceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const updatedInstances = instances.filter(i => i.id !== instanceId)
        setInstances(updatedInstances)
        setPermanentDeleteDialog({ open: false, instanceId: null })
      } else {
        const errorData = await response.json()
        alert(`Error: ${errorData.error || 'Failed to delete serial number'}`)
      }
    } catch (error) {
      console.error('Error deleting serial number:', error)
      setPermanentDeleteDialog({ open: false, instanceId: null })
    }
  }

  const handleExportCSV = async () => {
    try {
      const token = getToken()
      const response = await fetch(`/api/product-instances/export?productId=${product.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        a.download = `serial-numbers-${product.name}-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Error exporting CSV:', error)
      alert('Failed to export CSV')
    }
  }

  const handleImportCSV = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const token = getToken()
      const formData = new FormData()
      formData.append('file', file)
      formData.append('productId', product.id)

      const response = await fetch('/api/product-instances/import', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      })

      if (response.ok) {
        const result = await response.json()
        alert(`Successfully imported ${result.importedCount} serial numbers`)
        
        // Refresh the instances list
        const instancesResponse = await fetch(`/api/product-instances?productId=${product.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })
        if (instancesResponse.ok) {
          const instancesData = await instancesResponse.json()
          setInstances(instancesData)
        }
      } else {
        const errorData = await response.json()
        alert(`Error: ${errorData.error || 'Failed to import CSV'}`)
      }
    } catch (error) {
      console.error('Error importing CSV:', error)
      alert('Failed to import CSV')
    }

    // Reset the file input
    event.target.value = ''
  }

  const getStatusConfig = (status: string) => {
    return statusConfig[status as keyof typeof statusConfig] || statusConfig['in-stock']
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('en-GB')
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="!w-[70vw] !max-w-none max-h-[95vh] overflow-hidden flex flex-col" aria-describedby="serial-manager-description">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Serial Number Manager - {product.name}
          </DialogTitle>
          <DialogDescription id="serial-manager-description">
            Manage serial numbers and licenses for {product.category} products in inventory
          </DialogDescription>
        </DialogHeader>

        {/* Search and Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4 p-4 border-b">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search serial numbers, licenses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {Object.entries(statusConfig).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => setIsAddInstanceOpen(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Serial/License
            </Button>

            <Button
              variant="outline"
              onClick={handleExportCSV}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>

            <input
              type="file"
              accept=".csv"
              onChange={handleImportCSV}
              style={{ display: 'none' }}
              id="import-csv"
            />
            <Button
              variant="outline"
              onClick={() => document.getElementById('import-csv')?.click()}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Import CSV
            </Button>
          </div>
        </div>

        {/* Serial Numbers List */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredInstances.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <Package className="h-12 w-12 mb-4" />
              <h3 className="text-lg font-medium mb-2">No serial numbers or licenses found</h3>
              <p className="text-sm mb-4">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filters' 
                  : 'Get started by adding your first serial number or license to inventory'
                }
              </p>
              {(!searchTerm && statusFilter === 'all') && (
                <Button onClick={() => setIsAddInstanceOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Serial Number/License
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredInstances.map((instance) => {
                const statusInfo = getStatusConfig(instance.status)
                const StatusIcon = statusInfo.icon

                return (
                  <Card key={instance.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <Package className="h-5 w-5 text-gray-600" />
                            <div>
                              <div className="font-semibold text-lg">{instance.serialNumber}</div>
                              <div className="text-sm text-gray-500">
                                {instance.product.name}
                              </div>
                            </div>
                          </div>

                          <Badge className={statusInfo.color}>
                            <StatusIcon className="mr-1 h-3 w-3" />
                            {statusInfo.label}
                          </Badge>

                          {instance.business && (
                            <div className="text-sm">
                              <div className="font-medium">{instance.business.name}</div>
                              {instance.contact && (
                                <div className="text-gray-500">{instance.contact.name}</div>
                              )}
                            </div>
                          )}

                          {instance.comments && (
                            <div className="text-sm text-gray-600 max-w-xs truncate">
                              "{instance.comments}"
                            </div>
                          )}
                        </div>

                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditInstance(instance)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteInstance(instance.id)}
                            className="text-orange-600 hover:text-orange-700"
                          >
                            <ArrowLeft className="h-4 w-4 mr-1" />
                            Return to Pool
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePermanentDelete(instance.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
                        <div className="flex space-x-4">
                          <span>Sold: {formatDate(instance.soldDate)}</span>
                          <span>Warranty: {formatDate(instance.warrantyExpiry)}</span>
                        </div>
                        {instance.lastUpdatedByUser && (
                          <span>Updated by: {instance.lastUpdatedByUser.name}</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>

        {/* Add Instance Dialog */}
        <Dialog open={isAddInstanceOpen} onOpenChange={setIsAddInstanceOpen}>
          <DialogContent className="!w-[50vw] !max-w-none max-h-[90vh] overflow-y-auto" aria-describedby="add-serial-description">
            <DialogHeader>
              <DialogTitle>Add Serial Number or License</DialogTitle>
              <DialogDescription id="add-serial-description">
                Add a new serial number or license to inventory for {product.name}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="serialNumber">Serial Number / License *</Label>
                <Input
                  id="serialNumber"
                  value={newInstance.serialNumber}
                  onChange={(e) => setNewInstance({ ...newInstance, serialNumber: e.target.value })}
                  placeholder="Enter serial number or license key"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={newInstance.status} 
                  onValueChange={(value) => setNewInstance({ ...newInstance, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(statusConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="comments">Comments</Label>
                <Textarea
                  id="comments"
                  value={newInstance.comments}
                  onChange={(e) => setNewInstance({ ...newInstance, comments: e.target.value })}
                  placeholder="Enter comments, initials, or notes"
                  rows={2}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsAddInstanceOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleAddInstance}
                disabled={!newInstance.serialNumber}
              >
                Add to Inventory
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Serial Assignment Modal for Editing */}
        {editingInstance && (
          <SerialAssignmentModal
            instance={editingInstance}
            open={isAssignmentModalOpen}
            onClose={() => {
              setIsAssignmentModalOpen(false)
              setEditingInstance(null)
            }}
            onAssignmentComplete={() => {
              // Refresh the instances list
              const loadInstances = async () => {
                try {
                  const response = await fetch(`/api/product-instances?productId=${product.id}`)
                  if (response.ok) {
                    const instancesData = await response.json()
                    setInstances(instancesData)
                    setFilteredInstances(instancesData)
                    if (onAssignmentComplete) {
                      onAssignmentComplete()
                    }
                  }
                } catch (error) {
                  console.error('Error reloading instances:', error)
                }
              }
              loadInstances()
              setIsAssignmentModalOpen(false)
              setEditingInstance(null)
            }}
          />
        )}

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          open={deleteInstanceDialog.open}
          onOpenChange={(open) => setDeleteInstanceDialog({ ...deleteInstanceDialog, open })}
          title="Return Serial Number to Available Pool"
          description="Are you sure you want to return this serial number to the available pool? This will remove any customer assignment and set status to 'In Stock'."
          onConfirm={confirmDeleteInstance}
        />

        {/* Permanent Delete Confirmation Dialog */}
        <ConfirmDialog
          open={permanentDeleteDialog.open}
          onOpenChange={(open) => setPermanentDeleteDialog({ ...permanentDeleteDialog, open })}
          title="Delete Serial Number Permanently"
          description="Are you sure you want to permanently delete this serial number? This action cannot be undone and will remove all record of this serial number from the database."
          onConfirm={confirmPermanentDelete}
        />
      </DialogContent>
    </Dialog>
  )
}