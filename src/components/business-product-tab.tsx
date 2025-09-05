'use client'

import { useState, useEffect } from 'react'
import {
  Package,
  Plus,
  Search,
  Edit,
  Trash2,
  Download,
  Filter,
  CheckCircle,
  AlertTriangle,
  Clock,
  Building,
  Car,
  RefreshCw,
  ArrowLeft,
  Key,
  Shield,
  Calendar
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
import CustomerAssignmentModal from './customer-assignment-modal'
import UnifiedProductAssignmentModal from './unified-product-assignment-modal'
import BusinessProductEditModal from './business-product-edit-modal'
import { useAuth } from '@/hooks/use-auth'
import { getToken } from '@/lib/auth'

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
  serialNumber?: string
  licenseNumber?: string
  status: string
  businessId?: string
  contactId?: string
  soldDate?: string
  warrantyExpiry?: string
  comments?: string
  isLicense?: boolean
  product: {
    id: string
    name: string
    category: string
    price: number
    isSerialized: boolean
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

interface BusinessProductTabProps {
  business: {
    id: string
    name: string
  }
  instances: ProductInstance[]
  businessProducts: any[] // Add business products (non-serialized)
  refreshData: () => void
}

export default function BusinessProductTab({ 
  business, 
  instances, 
  businessProducts,
  refreshData 
}: BusinessProductTabProps) {
  const { user: currentUser } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [productTypeFilter, setProductTypeFilter] = useState<string>('all') // 'all', 'serialized', 'non-serialized'
  const [isUnifiedAssignModalOpen, setIsUnifiedAssignModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedInstance, setSelectedInstance] = useState<ProductInstance | null>(null)
  const [returnInstanceDialog, setReturnInstanceDialog] = useState({
    open: false,
    instanceId: null
  })
  const [removeBusinessProductDialog, setRemoveBusinessProductDialog] = useState({
    open: false,
    businessProductId: null
  })
  const [isEditBusinessProductModalOpen, setIsEditBusinessProductModalOpen] = useState(false)
  const [selectedBusinessProduct, setSelectedBusinessProduct] = useState<any>(null)

  // Filter instances
  const filteredInstances = instances.filter(instance => {
    const matchesSearch = instance.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         instance.licenseNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         instance.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         instance.contact?.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || instance.product.category === categoryFilter
    const matchesStatus = statusFilter === 'all' || instance.status === statusFilter
    const matchesProductType = productTypeFilter === 'all' || productTypeFilter === 'serialized'
    return matchesSearch && matchesCategory && matchesStatus && matchesProductType
  })

  // Filter business products (non-serialized)
  const filteredBusinessProducts = (businessProducts || []).filter(businessProduct => {
    // Safety check for nested product property
    if (!businessProduct || !businessProduct.product) {
      return false
    }
    
    const matchesSearch = businessProduct.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         businessProduct.product.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || businessProduct.product.category === categoryFilter
    const matchesProductType = productTypeFilter === 'all' || productTypeFilter === 'non-serialized'
    return matchesSearch && matchesCategory && matchesProductType
  })

  // Get unique categories and statuses
  const allProducts = [
    ...instances.map(i => i.product), 
    ...(businessProducts || [])
      .filter(bp => bp && bp.product) // Filter out undefined products
      .map(bp => bp.product)
  ]
  const categories = ['all', ...Array.from(new Set(allProducts.map(p => p.category)))]
  const statuses = ['all', ...Array.from(new Set(instances.map(i => i.status)))]

  const getStatusConfig = (status: string) => {
    return statusConfig[status as keyof typeof statusConfig] || statusConfig['in-stock']
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('en-GB')
  }

  const getWarrantyStatus = (expiryDate?: string) => {
    if (!expiryDate) return null
    
    const now = new Date()
    const expiry = new Date(expiryDate)
    const monthsUntilExpiry = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30)
    
    if (monthsUntilExpiry < 0) {
      return { status: 'expired', color: 'bg-red-100 text-red-800', text: 'Expired' }
    } else if (monthsUntilExpiry < 3) {
      return { status: 'expiring-soon', color: 'bg-yellow-100 text-yellow-800', text: 'Expiring Soon' }
    } else {
      return { status: 'active', color: 'bg-green-100 text-green-800', text: 'Active' }
    }
  }

  const handleAssignProduct = () => {
    setIsUnifiedAssignModalOpen(true)
  }

  const handleRemoveBusinessProduct = (businessProductId: string) => {
    setRemoveBusinessProductDialog({
      open: true,
      businessProductId
    })
  }

  const confirmRemoveBusinessProduct = async () => {
    const { businessProductId } = removeBusinessProductDialog
    try {
      const token = getToken()
      const response = await fetch(`/api/business-products/${businessProductId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        refreshData()
        setRemoveBusinessProductDialog({ open: false, businessProductId: null })
      } else {
        const errorData = await response.json()
        alert(`Error: ${errorData.error || 'Failed to remove product assignment'}`)
      }
    } catch (error) {
      console.error('Error removing business product:', error)
      setRemoveBusinessProductDialog({ open: false, businessProductId: null })
    }
  }

  const handleEditInstance = (instance: ProductInstance) => {
    setSelectedInstance(instance)
    setIsEditModalOpen(true)
  }

  const handleReturnInstance = (instanceId: string) => {
    setReturnInstanceDialog({
      open: true,
      instanceId
    })
  }

  const confirmReturnInstance = async () => {
    const { instanceId } = returnInstanceDialog
    try {
      // Instead of deleting, update the instance to return it to available pool
      const token = getToken()
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
          comments: 'Returned to available pool from customer',
          lastUpdatedBy: currentUser?.id
        }),
      })

      if (response.ok) {
        // Add a small delay to ensure database consistency before refreshing
        setTimeout(() => {
          refreshData()
          setReturnInstanceDialog({ open: false, instanceId: null })
        }, 100)
      } else {
        const errorData = await response.json()
        alert(`Error: ${errorData.error || 'Failed to return serial number to available pool'}`)
      }
    } catch (error) {
      console.error('Error returning serial number to available pool:', error)
      setReturnInstanceDialog({ open: false, instanceId: null })
    }
  }

  const handleAssignmentComplete = () => {
    refreshData()
    setIsUnifiedAssignModalOpen(false)
  }

  const handleEditComplete = () => {
    refreshData()
    setIsEditModalOpen(false)
    setSelectedInstance(null)
  }

  const handleEditBusinessProduct = (businessProduct: any) => {
    setSelectedBusinessProduct(businessProduct)
    setIsEditBusinessProductModalOpen(true)
  }

  const handleEditBusinessProductComplete = () => {
    refreshData()
    setIsEditBusinessProductModalOpen(false)
    setSelectedBusinessProduct(null)
  }

  // Group instances by product
  const instancesByProduct = filteredInstances.reduce((acc, instance) => {
    if (!acc[instance.product.id]) {
      acc[instance.product.id] = []
    }
    acc[instance.product.id].push(instance)
    return acc
  }, {} as Record<string, ProductInstance[]>)

  // Calculate statistics
  const totalSerializedProducts = instances.length
  const totalNonSerializedProducts = (businessProducts || []).length
  const totalAssigned = totalSerializedProducts + totalNonSerializedProducts
  
  const hardwareCount = instances.filter(i => !i.isLicense).length + 
                         (businessProducts || []).filter(bp => bp && bp.product && bp.product.category === 'Hardware').length
  const softwareCount = instances.filter(i => i.isLicense).length + 
                         (businessProducts || []).filter(bp => bp && bp.product && bp.product.category === 'Software').length
  const expiringWarranties = instances.filter(i => {
    const warrantyStatus = getWarrantyStatus(i.warrantyExpiry)
    return warrantyStatus?.status === 'expiring-soon'
  }).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Assigned Products</h3>
          <p className="text-sm text-gray-600">
            View and manage all products assigned to {business.name}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleAssignProduct}>
            <Plus className="h-4 w-4 mr-2" />
            Assign Product
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAssigned}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Serialized</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalSerializedProducts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Non-Serialized</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totalNonSerializedProducts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hardware</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{hardwareCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Software</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{softwareCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search products, serial numbers, licenses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Select value={productTypeFilter} onValueChange={setProductTypeFilter}>
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="serialized">Serialized</SelectItem>
                  <SelectItem value="non-serialized">Non-Serialized</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.slice(1).map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {statuses.slice(1).map((status) => {
                    const config = getStatusConfig(status)
                    return (
                      <SelectItem key={status} value={status}>
                        {config.label}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assigned Items */}
      <div className="space-y-4">
        {(filteredInstances.length === 0 && filteredBusinessProducts.length === 0) ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No assigned items found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all' || productTypeFilter !== 'all'
                  ? 'Try adjusting your search or filters' 
                  : 'Get started by assigning products to this business'
                }
              </p>
              {(!searchTerm && categoryFilter === 'all' && statusFilter === 'all' && productTypeFilter === 'all') && (
                <div className="flex gap-2 justify-center">
                  <Button onClick={handleAssignProduct}>
                    <Plus className="mr-2 h-4 w-4" />
                    Assign Product
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {/* Serialized Products Grouped by Product */}
            {Object.entries(instancesByProduct).map(([productId, productInstances]) => {
              const product = productInstances[0].product
              
              return (
                <Card key={`serialized-${productId}`} className="bg-white shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {product.name}
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            {product.category}
                          </Badge>
                          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                            {productInstances.some(i => i.isLicense) ? 'Software' : 'Hardware'}
                          </Badge>
                          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                            Serialized
                          </Badge>
                        </CardTitle>
                        <CardDescription>
                          {productInstances.length} assigned {productInstances.length === 1 ? 'item' : 'items'}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid gap-2">
                      {productInstances.map((instance) => {
                        const statusInfo = getStatusConfig(instance.status)
                        const StatusIcon = statusInfo.icon
                        const warrantyStatus = getWarrantyStatus(instance.warrantyExpiry)

                        return (
                          <div key={instance.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                            <div className="flex items-center gap-3 flex-1">
                              {instance.isLicense ? (
                                <Key className="h-4 w-4 text-purple-600" />
                              ) : (
                                <Package className="h-4 w-4 text-blue-600" />
                              )}
                              <div className="flex-1">
                                <div className="font-medium text-sm">
                                  {instance.serialNumber || instance.licenseNumber}
                                </div>
                                <div className="text-xs text-gray-500 flex items-center gap-2">
                                  {instance.contact?.name && (
                                    <>
                                      <span>Assigned to: {instance.contact.name}</span>
                                      <span>•</span>
                                    </>
                                  )}
                                  <span>Sold: {formatDate(instance.soldDate)}</span>
                                  {instance.warrantyExpiry && (
                                    <>
                                      <span>•</span>
                                      <span>Warranty: {formatDate(instance.warrantyExpiry)}</span>
                                    </>
                                  )}
                                </div>
                                {instance.comments && (
                                  <div className="text-xs text-gray-600 mt-1">
                                    "{instance.comments}"
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Badge className={statusInfo.color}>
                                <StatusIcon className="mr-1 h-3 w-3" />
                                {statusInfo.label}
                              </Badge>
                              {warrantyStatus && (
                                <Badge className={warrantyStatus.color}>
                                  <Shield className="mr-1 h-3 w-3" />
                                  {warrantyStatus.text}
                                </Badge>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditInstance(instance)}
                                className="h-8 w-8 p-0"
                                title="Edit assignment"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleReturnInstance(instance.id)}
                                className="h-8 w-8 p-0 text-orange-600 hover:text-orange-700"
                                title="Return to available pool"
                              >
                                <ArrowLeft className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              )
            })}

            {/* Non-Serialized Products */}
            {filteredBusinessProducts.map((businessProduct) => {
              // Safety check for nested product property
              if (!businessProduct || !businessProduct.product) {
                return null
              }
              
              const statusConfig = {
                'active': { label: 'Active', color: 'bg-green-100 text-green-800' },
                'inactive': { label: 'Inactive', color: 'bg-yellow-100 text-yellow-800' },
                'cancelled': { label: 'Cancelled', color: 'bg-red-100 text-red-800' }
              }

              const statusInfo = statusConfig[businessProduct.status as keyof typeof statusConfig] || statusConfig.active

              return (
                <Card key={`non-serialized-${businessProduct.id}`} className="bg-white shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {businessProduct.product.name}
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            {businessProduct.product.category}
                          </Badge>
                          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                            Non-Serialized
                          </Badge>
                        </CardTitle>
                        <CardDescription>
                          {businessProduct.quantity} {businessProduct.quantity === 1 ? 'unit' : 'units'} assigned
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={statusInfo.color}>
                          {statusInfo.label}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditBusinessProduct(businessProduct)}
                          className="h-8 w-8 p-0"
                          title="Edit assignment"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveBusinessProduct(businessProduct.id)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          title="Remove assignment"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Unit Price:</span>
                        <div className="font-medium">
                          £{businessProduct.product.price.toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">Total Value:</span>
                        <div className="font-medium">
                          £{(businessProduct.product.price * businessProduct.quantity).toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">Assigned Date:</span>
                        <div className="font-medium">
                          {formatDate(businessProduct.assignedDate)}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">Valid From:</span>
                        <div className="font-medium">
                          {formatDate(businessProduct.validFrom)}
                        </div>
                      </div>
                    </div>
                    
                    {businessProduct.validTo && (
                      <div className="text-sm">
                        <span className="text-gray-500">Valid Until:</span>
                        <div className="font-medium">
                          {formatDate(businessProduct.validTo)}
                        </div>
                      </div>
                    )}
                    
                    {businessProduct.notes && (
                      <div className="text-sm">
                        <span className="text-gray-500">Notes:</span>
                        <div className="text-gray-700 mt-1">
                          {businessProduct.notes}
                        </div>
                      </div>
                    )}
                    
                    {businessProduct.assignedByUser && (
                      <div className="text-xs text-gray-500">
                        Assigned by: {businessProduct.assignedByUser.name}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Unified Product Assignment Modal */}
      <UnifiedProductAssignmentModal
        business={business}
        open={isUnifiedAssignModalOpen}
        onClose={() => setIsUnifiedAssignModalOpen(false)}
        onAssignmentComplete={handleAssignmentComplete}
      />

      {/* Customer Assignment Modal (for editing) */}
      {selectedInstance && (
        <CustomerAssignmentModal
          instance={selectedInstance}
          open={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onAssignmentComplete={handleEditComplete}
        />
      )}

      {/* Business Product Edit Modal */}
      {selectedBusinessProduct && (
        <BusinessProductEditModal
          businessProduct={selectedBusinessProduct}
          open={isEditBusinessProductModalOpen}
          onClose={() => setIsEditBusinessProductModalOpen(false)}
          onEditComplete={handleEditBusinessProductComplete}
        />
      )}

      {/* Return Instance Confirmation */}
      <ConfirmDialog
        open={returnInstanceDialog.open}
        onOpenChange={(open) => setReturnInstanceDialog({ ...returnInstanceDialog, open })}
        title="Return to Available Pool"
        description="Are you sure you want to return this serial number to the available pool? It will no longer be assigned to this customer."
        onConfirm={confirmReturnInstance}
      />

      {/* Remove Business Product Confirmation */}
      <ConfirmDialog
        open={removeBusinessProductDialog.open}
        onOpenChange={(open) => setRemoveBusinessProductDialog({ ...removeBusinessProductDialog, open })}
        title="Remove Product Assignment"
        description="Are you sure you want to remove this product assignment? This action cannot be undone."
        onConfirm={confirmRemoveBusinessProduct}
      />
    </div>
  )
}