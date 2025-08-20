'use client'
// Force rebuild

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { 
  Building2, 
  Users, 
  BarChart3, 
  MessageSquare, 
  FileText, 
  CheckSquare, 
  Settings,
  Bell,
  Search,
  Menu,
  X,
  Plus,
  Filter,
  MapPin,
  Phone,
  Mail,
  Globe,
  Package,
  FileSignature,
  FolderOpen,
  TrendingUp,
  TrendingDown,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  DollarSign,
  ShoppingCart,
  UserPlus,
  Upload,
  Send,
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Edit,
  Trash2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { AnalyticsDashboard } from '@/components/analytics-dashboard'
import InventoryPage from '@/components/inventory-page'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

// Import client API
import * as api from '@/lib/client-api'

const navigation = [
  { name: 'Dashboard', href: '#', icon: Building2, tab: 'dashboard' },
  { name: 'Business Directory', href: '#', icon: Building2, tab: 'businesses' },
  { name: 'Inventory', href: '#', icon: Package, tab: 'inventory' },
  { name: 'Tasks', href: '#', icon: CheckSquare, tab: 'tasks' },
  { name: 'Users', href: '#', icon: Users, tab: 'users', requiredPermission: 'canViewAllUsers' },
  { name: 'Quotes', href: '#', icon: FileSignature, tab: 'quotes' },
  { name: 'Documents', href: '#', icon: FolderOpen, tab: 'documents' },
  { name: 'Messages', href: '#', icon: MessageSquare, tab: 'messages' },
  { name: 'Analytics', href: '#', icon: BarChart3, tab: 'analytics', requiredPermission: 'canViewAnalytics' },
  { name: 'Settings', href: '#', icon: Settings, tab: 'settings', requiredPermission: 'canAccessSettings' },
]

const categories = [
  'All Categories',
  'Retail',
  'Hospitality',
  'Restaurant',
  'Technology',
  'Healthcare',
  'Professional Services',
  'Manufacturing',
  'Education',
  'Other'
]

const locations = [
  'All Locations',
  'San Francisco, CA',
  'New York, NY',
  'Chicago, IL',
  'Los Angeles, CA',
  'Boston, MA',
  'Miami, FL',
  'Austin, TX',
  'Seattle, WA'
]

export default function BusinessHub() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All Categories')
  const [selectedLocation, setSelectedLocation] = useState('All Locations')
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [filteredBusinesses, setFilteredBusinesses] = useState<any[]>([])
  const [filteredUsers, setFilteredUsers] = useState<any[]>([])
  
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [isClient, setIsClient] = useState(false)
  const [displayName, setDisplayName] = useState('User')
  
  // Role-based permissions
  const [rolePermissions, setRolePermissions] = useState({
    User: {
      tabs: ['dashboard', 'businesses', 'inventory', 'tasks', 'quotes', 'documents', 'messages'],
      features: {
        canCreateBusiness: false,
        canViewAllUsers: false,
        canCreateUser: false,
        canViewAnalytics: false,
        canAccessSettings: false
      }
    },
    Admin: {
      tabs: ['dashboard', 'businesses', 'inventory', 'tasks', 'users', 'quotes', 'documents', 'messages', 'analytics', 'settings'],
      features: {
        canCreateBusiness: true,
        canViewAllUsers: true,
        canCreateUser: true,
        canViewAnalytics: true,
        canAccessSettings: true
      }
    },
    Manager: {
      tabs: ['dashboard', 'businesses', 'inventory', 'tasks', 'quotes', 'documents', 'messages', 'analytics'],
      features: {
        canCreateBusiness: true,
        canViewAllUsers: false,
        canCreateUser: true,
        canViewAnalytics: true,
        canAccessSettings: false
      }
    }
  })
  
  // Data state
  const [roles, setRoles] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [documents, setDocuments] = useState<any[]>([])
  const [messages, setMessages] = useState<any[]>([])
  const [businessList, setBusinessList] = useState<any[]>([])
  const [quotes, setQuotes] = useState<any[]>([])
  
  // Dashboard stats
  const [dashboardStats, setDashboardStats] = useState({
    totalBusinesses: 0,
    activeProducts: 0,
    pendingQuotes: 0,
    activeTasks: 0,
    totalRevenue: 0,
    monthlyGrowth: 0
  })
  
  // Modal states
  const [isAddBusinessOpen, setIsAddBusinessOpen] = useState(false)
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [isSendMessageOpen, setIsSendMessageOpen] = useState(false)
  
  // Product Assignment Modal state
  const [isAssignProductOpen, setIsAssignProductOpen] = useState(false)
  const [availableProducts, setAvailableProducts] = useState<any[]>([])
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  
  // Business Directory states
  const [isViewBusinessOpen, setIsViewBusinessOpen] = useState(false)
  const [isEditBusinessOpen, setIsEditBusinessOpen] = useState(false)
  const [selectedBusiness, setSelectedBusiness] = useState(null)
  const [businessRelatedData, setBusinessRelatedData] = useState({
    products: [],
    tasks: [],
    quotes: [],
    documents: []
  })
  const [businessSearchTerm, setBusinessSearchTerm] = useState('')
  const [filteredBusinessList, setFilteredBusinessList] = useState<any[]>([])
  
  // Form states
  const [newBusiness, setNewBusiness] = useState({
    name: '',
    category: '',
    description: '',
    location: '',
    phone: '',
    email: '',
    website: '',
    status: 'Active',
    supportContract: false
  })
  
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'User',
    status: 'Active',
    color: '#3B82F6'
  })
  
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploadCategory, setUploadCategory] = useState('General')
  const [messageData, setMessageData] = useState({
    recipient: '',
    subject: '',
    content: ''
  })

  // Confirmation dialog states
  const [deleteBusinessDialog, setDeleteBusinessDialog] = useState({
    open: false,
    businessId: null
  })
  const [removeProductDialog, setRemoveProductDialog] = useState({
    open: false,
    businessId: null,
    productId: null
  })

  // Client-side welcome component
  const WelcomeMessage = () => {
    const [name, setName] = useState('User')
    const [isMounted, setIsMounted] = useState(false)
    
    useEffect(() => {
      setIsMounted(true)
      const defaultUser = {
        id: 'cme3diluk0003zm24qhnvxmae',
        email: 'admin@example.com', 
        name: 'Admin User', 
        role: 'Admin',
        status: 'Active',
        color: '#EF4444',
        joined: '2024-01-01T00:00:00.000Z'
      }
      setName(defaultUser.name)
    }, [])
    
    if (!isMounted) {
      return <span className="opacity-0">Loading...</span>
    }
    
    return <span>{name}</span>
  }
  const getUserPermissions = () => {
    const adminPermissions = {
      tabs: ['dashboard', 'businesses', 'inventory', 'tasks', 'users', 'quotes', 'documents', 'messages', 'analytics', 'settings'],
      features: {
        canCreateBusiness: true,
        canViewAllUsers: true,
        canCreateUser: true,
        canViewAnalytics: true,
        canAccessSettings: true
      }
    }
    
    if (currentUser && rolePermissions[currentUser.role]) {
      return rolePermissions[currentUser.role]
    }
    
    return adminPermissions
  }
  
  const hasPermission = (feature) => {
    const permissions = getUserPermissions()
    return permissions.features && permissions.features[feature] || false
  }

  const canAccessTab = (tab) => {
    const permissions = getUserPermissions()
    return permissions.tabs && permissions.tabs.includes(tab) || false
  }

  // Load data from backend
  useEffect(() => {
    const loadData = async () => {
      // Only load data if user is authenticated
      if (!isAuthenticated || !currentUser) {
        console.log('Skipping data load - user not authenticated')
        return
      }
      
      try {
        console.log('Starting to load data...')
        
        // Load businesses
        const businessesResponse = await api.getBusinesses()
        console.log('Businesses response:', businessesResponse)
        if (businessesResponse.success) {
          setBusinessList(businessesResponse.data)
          setFilteredBusinesses(businessesResponse.data)
          console.log('Businesses loaded:', businessesResponse.data.length)
        }

        // Load users
        const usersResponse = await api.getUsers()
        console.log('Users response:', usersResponse)
        if (usersResponse.success) {
          setUsers(usersResponse.data)
          setFilteredUsers(usersResponse.data)
          console.log('Users loaded:', usersResponse.data.length)
        }

        // Load products
        const productsResponse = await api.getProducts()
        console.log('Products response:', productsResponse)
        if (productsResponse.success) {
          setProducts(productsResponse.data)
          console.log('Products loaded:', productsResponse.data.length)
        }

        // Load tasks
        const tasksResponse = await api.getTasks()
        console.log('Tasks response:', tasksResponse)
        if (tasksResponse.success) {
          setTasks(tasksResponse.data)
          console.log('Tasks loaded:', tasksResponse.data.length)
        }

        // Load quotes
        const quotesResponse = await api.getQuotes()
        console.log('Quotes response:', quotesResponse)
        if (quotesResponse.success) {
          setQuotes(quotesResponse.data)
          console.log('Quotes loaded:', quotesResponse.data.length)
        }

        // Load documents
        const documentsResponse = await api.getDocuments()
        console.log('Documents response:', documentsResponse)
        if (documentsResponse.success) {
          setDocuments(documentsResponse.data)
          console.log('Documents loaded:', documentsResponse.data.length)
        }

        // Load messages
        const messagesResponse = await api.getMessages()
        console.log('Messages response:', messagesResponse)
        if (messagesResponse.success) {
          setMessages(messagesResponse.data)
          console.log('Messages loaded:', messagesResponse.data.length)
        }

        // Update dashboard stats
        updateDashboardStats()
        console.log('Data loading completed')
        
      } catch (error) {
        console.error('Error loading data:', error)
      }
    }
    
    loadData()
  }, [isAuthenticated, currentUser])

  // Set up authentication and client state
  useEffect(() => {
    // Mark that we're on the client side
    setIsClient(true)
    
    // For development, set a default admin user
    const defaultUser = {
      id: 'cme3diluk0003zm24qhnvxmae',
      email: 'admin@example.com', 
      name: 'Admin User', 
      role: 'Admin',
      status: 'Active',
      color: '#EF4444',
      joined: '2024-01-01T00:00:00.000Z'
    }
    
    setCurrentUser(defaultUser)
    setIsAuthenticated(true)
    setDisplayName(defaultUser.name)
    
    // Store in localStorage for persistence
    localStorage.setItem('isAuthenticated', 'true')
    localStorage.setItem('currentUser', JSON.stringify(defaultUser))
    
    console.log('Authentication setup complete')
    console.log('Current user:', defaultUser)
  }, [])

  // Debug currentUser state
  useEffect(() => {
    console.log('currentUser state changed:', currentUser)
  }, [currentUser])

  // Load business related data when a business is selected
  useEffect(() => {
    const loadBusinessRelatedData = async () => {
      if (selectedBusiness) {
        const data = await getBusinessRelatedData(selectedBusiness.id)
        setBusinessRelatedData(data)
      }
    }
    
    loadBusinessRelatedData()
  }, [selectedBusiness])

  // Update dashboard statistics
  const updateDashboardStats = () => {
    const activeProducts = products.filter(p => p.status === 'Active').length
    const pendingQuotes = quotes.filter(q => q.status === 'Pending').length
    const activeTasks = tasks.filter(t => t.status !== 'Completed').length
    const totalRevenue = quotes.reduce((sum, q) => sum + (q.total || 0), 0)
    
    setDashboardStats({
      totalBusinesses: businessList.length,
      activeProducts,
      pendingQuotes,
      activeTasks,
      totalRevenue,
      monthlyGrowth: 12.5 // This would be calculated from historical data
    })
  }

  // Handle quick actions
  const handleAddBusiness = async () => {
    try {
      const response = await api.createBusiness(newBusiness)
      if (response.success) {
        const updatedBusinesses = [...businessList, response.data]
        setBusinessList(updatedBusinesses)
        setFilteredBusinesses(updatedBusinesses)
        setNewBusiness({
          name: '',
          category: '',
          description: '',
          location: '',
          phone: '',
          email: '',
          website: '',
          status: 'Active',
          supportContract: false
        })
        setIsAddBusinessOpen(false)
        updateDashboardStats()
      }
    } catch (error) {
      console.error('Error creating business:', error)
    }
  }

  const handleAddUser = async () => {
    try {
      const response = await api.createUser(newUser)
      if (response.success) {
        const updatedUsers = [...users, response.data]
        setUsers(updatedUsers)
        setFilteredUsers(updatedUsers)
        setNewUser({
          name: '',
          email: '',
          password: '',
          role: 'User',
          status: 'Active',
          color: '#3B82F6'
        })
        setIsAddUserOpen(false)
      }
    } catch (error) {
      console.error('Error creating user:', error)
    }
  }

  const handleFileUpload = async () => {
    if (!selectedFile) return

    const formData = new FormData()
    formData.append('file', selectedFile)
    formData.append('category', uploadCategory)
    formData.append('uploadedBy', currentUser?.name || 'Unknown')

    try {
      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        setSelectedFile(null)
        setUploadCategory('General')
        setIsUploadDialogOpen(false)
        // Reload documents
        const documentsResponse = await api.getDocuments()
        if (documentsResponse.success) {
          setDocuments(documentsResponse.data)
        }
      }
    } catch (error) {
      console.error('Error uploading file:', error)
    }
  }

  const handleSendMessage = async () => {
    try {
      const response = await api.createMessage({
        ...messageData,
        senderId: currentUser?.id,
        timestamp: new Date().toISOString()
      })
      
      if (response.success) {
        setMessageData({
          recipient: '',
          subject: '',
          content: ''
        })
        setIsSendMessageOpen(false)
        // Reload messages
        const messagesResponse = await api.getMessages()
        if (messagesResponse.success) {
          setMessages(messagesResponse.data)
        }
      }
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  // Business Directory handlers
  const handleViewBusiness = (business) => {
    setSelectedBusiness(business)
    setIsViewBusinessOpen(true)
  }

  const handleEditBusiness = (business) => {
    setSelectedBusiness(business)
    setIsEditBusinessOpen(true)
  }

  const handleUpdateBusiness = async () => {
    try {
      const response = await api.updateBusiness(selectedBusiness.id, selectedBusiness)
      if (response.success) {
        const updatedBusinesses = businessList.map(b => 
          b.id === selectedBusiness.id ? response.data : b
        )
        setBusinessList(updatedBusinesses)
        setFilteredBusinessList(updatedBusinesses)
        setIsEditBusinessOpen(false)
        setSelectedBusiness(null)
      }
    } catch (error) {
      console.error('Error updating business:', error)
    }
  }

  const handleDeleteBusiness = async (businessId) => {
    setDeleteBusinessDialog({
      open: true,
      businessId
    })
  }

  const confirmDeleteBusiness = async () => {
    const { businessId } = deleteBusinessDialog
    try {
      const response = await api.deleteBusiness(businessId)
      if (response.success) {
        const updatedBusinesses = businessList.filter(b => b.id !== businessId)
        setBusinessList(updatedBusinesses)
        setFilteredBusinessList(updatedBusinesses)
        setIsViewBusinessOpen(false)
        setSelectedBusiness(null)
        updateDashboardStats()
        setDeleteBusinessDialog({ open: false, businessId: null })
        toast.success('Business deleted successfully')
      } else {
        toast.error('Failed to delete business')
      }
    } catch (error) {
      console.error('Error deleting business:', error)
      toast.error('Error deleting business')
    }
  }

  // Product Assignment handlers
  const handleOpenAssignProduct = async (business) => {
    try {
      // Get all available products
      const productsResponse = await api.getProducts()
      // Get products already assigned to this business
      const businessProductsResponse = await api.getBusinessProducts(business.id)
      
      if (productsResponse.success && businessProductsResponse.success) {
        // Filter out products already assigned to this business
        const assignedProductIds = businessProductsResponse.data.map(p => p.id)
        const available = productsResponse.data.filter(p => !assignedProductIds.includes(p.id))
        setAvailableProducts(available)
        setSelectedBusiness(business)
        setIsAssignProductOpen(true)
      }
    } catch (error) {
      console.error('Error loading products for assignment:', error)
    }
  }

  const handleAssignProducts = async () => {
    if (!selectedBusiness || selectedProducts.length === 0) return

    try {
      // Assign each selected product to the business
      const assignPromises = selectedProducts.map(productId => 
        api.addBusinessProduct(selectedBusiness.id, productId)
      )
      
      const results = await Promise.all(assignPromises)
      
      if (results.every(result => result.success)) {
        // Refresh the business related data
        const data = await getBusinessRelatedData(selectedBusiness.id)
        setBusinessRelatedData(data)
        
        // Close the assign product modal
        setIsAssignProductOpen(false)
        setSelectedProducts([])
        setAvailableProducts([])
        
        // Show success message
        toast.success('Products assigned successfully!')
      } else {
        toast.error('Some products failed to assign. Please try again.')
      }
    } catch (error) {
      console.error('Error assigning products:', error)
      toast.error('Error assigning products. Please try again.')
    }
  }

  const handleRemoveProduct = async (businessId, productId) => {
    setRemoveProductDialog({
      open: true,
      businessId,
      productId
    })
  }

  const confirmRemoveProduct = async () => {
    const { businessId, productId } = removeProductDialog
    try {
      const response = await api.removeBusinessProduct(businessId, productId)
      if (response.success) {
        // Refresh the business related data
        const data = await getBusinessRelatedData(selectedBusiness.id)
        setBusinessRelatedData(data)
        
        setRemoveProductDialog({ open: false, businessId: null, productId: null })
        toast.success('Product removed successfully')
      } else {
        toast.error('Failed to remove product')
      }
    } catch (error) {
      console.error('Error removing product:', error)
      toast.error('Error removing product. Please try again.')
    }
  }

  // Filter businesses based on search term, category, and location
  useEffect(() => {
    let filtered = businessList

    // Apply search term filter
    if (businessSearchTerm.trim()) {
      filtered = filtered.filter(business =>
        business.name.toLowerCase().includes(businessSearchTerm.toLowerCase()) ||
        business.category.toLowerCase().includes(businessSearchTerm.toLowerCase()) ||
        business.location.toLowerCase().includes(businessSearchTerm.toLowerCase()) ||
        business.description.toLowerCase().includes(businessSearchTerm.toLowerCase())
      )
    }

    // Apply category filter
    if (selectedCategory !== 'All Categories') {
      filtered = filtered.filter(business => business.category === selectedCategory)
    }

    // Apply location filter
    if (selectedLocation !== 'All Locations') {
      filtered = filtered.filter(business => business.location === selectedLocation)
    }

    setFilteredBusinessList(filtered)
  }, [businessSearchTerm, businessList, selectedCategory, selectedLocation])

  // Get related data for a business (async version for detailed view)
  const getBusinessRelatedData = async (businessId) => {
    try {
      // Get business products using the API
      const businessProductsResponse = await api.getBusinessProducts(businessId)
      const businessProducts = businessProductsResponse.success ? businessProductsResponse.data : []
      
      // Filter other related data from local state
      const businessTasks = tasks.filter(t => t.businessId === businessId)
      const businessQuotes = quotes.filter(q => q.businessId === businessId)
      const businessDocuments = documents.filter(d => d.businessId === businessId)
      
      return {
        products: businessProducts,
        tasks: businessTasks,
        quotes: businessQuotes,
        documents: businessDocuments
      }
    } catch (error) {
      console.error('Error getting business related data:', error)
      return {
        products: [],
        tasks: [],
        quotes: [],
        documents: []
      }
    }
  }

  // Get simplified related data for business grid (sync version)
  const getBusinessRelatedDataSync = (businessId) => {
    const businessTasks = tasks.filter(t => t.businessId === businessId)
    const businessQuotes = quotes.filter(q => q.businessId === businessId)
    const businessDocuments = documents.filter(d => d.businessId === businessId)
    
    return {
      tasks: businessTasks,
      quotes: businessQuotes,
      documents: businessDocuments
    }
  }

  // Recent businesses for dashboard
  const recentBusinesses = businessList.slice(-5).reverse()

  // Stats cards data
  const statsCards = [
    {
      title: 'Total Businesses',
      value: dashboardStats.totalBusinesses,
      change: '+12%',
      changeType: 'positive',
      icon: Building2,
      color: 'bg-blue-500'
    },
    {
      title: 'Active Products',
      value: dashboardStats.activeProducts,
      change: '+23%',
      changeType: 'positive',
      icon: Package,
      color: 'bg-green-500'
    },
    {
      title: 'Pending Quotes',
      value: dashboardStats.pendingQuotes,
      change: '+5%',
      changeType: 'positive',
      icon: FileSignature,
      color: 'bg-yellow-500'
    },
    {
      title: 'Active Tasks',
      value: dashboardStats.activeTasks,
      change: '+8%',
      changeType: 'positive',
      icon: CheckSquare,
      color: 'bg-purple-500'
    }
  ]

  // Quick actions
  const quickActions = [
    {
      title: 'Add Business',
      description: 'Create a new business profile',
      icon: Building2,
      color: 'bg-blue-500 hover:bg-blue-600',
      action: () => setIsAddBusinessOpen(true)
    },
    {
      title: 'Create User',
      description: 'Add a new team member',
      icon: UserPlus,
      color: 'bg-green-500 hover:bg-green-600',
      action: () => setIsAddUserOpen(true)
    },
    {
      title: 'Upload Document',
      description: 'Share files and documents',
      icon: Upload,
      color: 'bg-purple-500 hover:bg-purple-600',
      action: () => setIsUploadDialogOpen(true)
    },
    {
      title: 'Send Message',
      description: 'Communicate with team',
      icon: Send,
      color: 'bg-orange-500 hover:bg-orange-600',
      action: () => setIsSendMessageOpen(true)
    }
  ]

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-between h-16 px-6 border-b">
          <div className="flex items-center">
            <Building2 className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">BusinessHub</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {navigation.map((item) => {
              if (!canAccessTab(item.tab)) return null
              
              return (
                <button
                  key={item.name}
                  onClick={() => setActiveTab(item.tab)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === item.tab
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </button>
              )
            })}
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-500 hover:text-gray-700 mr-4"
              >
                <Menu className="h-6 w-6" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                {navigation.find(item => item.tab === activeTab)?.name || 'Dashboard'}
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {activeTab === 'businesses' && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search businesses..."
                    className="pl-10 w-64"
                    value={businessSearchTerm}
                    onChange={(e) => setBusinessSearchTerm(e.target.value)}
                  />
                </div>
              )}
              
              {!activeTab.includes('businesses') && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search..."
                    className="pl-10 w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              )}
              
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={currentUser?.avatar} />
                  <AvatarFallback>{currentUser?.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900">{currentUser?.name}</p>
                  <p className="text-xs text-gray-500">{currentUser?.role}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Tab content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                {/* Welcome section */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                    Welcome back, <WelcomeMessage />!
                  </h2>
                      <p className="text-gray-600 mt-1">Here's what's happening with your business today.</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Last updated</p>
                      <p className="text-sm font-medium text-gray-900">{new Date().toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

            {/* Stats cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {statsCards.map((stat, index) => (
                <Card key={index} className="bg-white shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                        <div className="flex items-center mt-2">
                          {stat.changeType === 'positive' ? (
                            <ArrowUpRight className="h-4 w-4 text-green-500" />
                          ) : (
                            <ArrowDownRight className="h-4 w-4 text-red-500" />
                          )}
                          <span className={`text-sm font-medium ml-1 ${
                            stat.changeType === 'positive' ? 'text-green-500' : 'text-red-500'
                          }`}>
                            {stat.change}
                          </span>
                          <span className="text-sm text-gray-500 ml-1">from last month</span>
                        </div>
                      </div>
                      <div className={`p-3 rounded-full ${stat.color}`}>
                        <stat.icon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick actions */}
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">Quick Actions</CardTitle>
                <CardDescription>Common tasks you can perform quickly</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {quickActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={action.action}
                      className={`${action.color} text-white rounded-lg p-6 text-left transition-all transform hover:scale-105`}
                    >
                      <action.icon className="h-8 w-8 mb-3" />
                      <h3 className="font-semibold text-lg mb-1">{action.title}</h3>
                      <p className="text-sm opacity-90">{action.description}</p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent businesses */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900">Recent Businesses</CardTitle>
                  <CardDescription>Latest additions to your business directory</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentBusinesses.length > 0 ? (
                      recentBusinesses.map((business) => (
                        <div key={business.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <Building2 className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{business.name}</p>
                              <p className="text-sm text-gray-500">{business.category}</p>
                            </div>
                          </div>
                          <Badge variant={business.status === 'Active' ? 'default' : 'secondary'}>
                            {business.status}
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center py-4">No businesses found</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Activity summary */}
              <Card className="bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900">Activity Summary</CardTitle>
                  <CardDescription>Recent system activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-500 rounded-lg">
                          <Building2 className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">New Business Added</p>
                          <p className="text-sm text-gray-500">Tech Solutions Inc.</p>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">2 hours ago</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-500 rounded-lg">
                          <CheckSquare className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Task Completed</p>
                          <p className="text-sm text-gray-500">System Upgrade</p>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">5 hours ago</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-purple-500 rounded-lg">
                          <FileSignature className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Quote Created</p>
                          <p className="text-sm text-gray-500">Marketing Pro - $5,000</p>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">1 day ago</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
              </div>
            )}

            {activeTab === 'businesses' && (
              <div className="space-y-6">
                {/* Business Directory Header */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Business Directory</h2>
                      <p className="text-gray-600 mt-1">Manage your business partnerships and client relationships</p>
                    </div>
                    <Button onClick={() => setIsAddBusinessOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Business
                    </Button>
                  </div>
                </div>

                {/* Filters */}
                <Card className="bg-white shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1">
                        <Label htmlFor="category-filter">Category</Label>
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex-1">
                        <Label htmlFor="location-filter">Location</Label>
                        <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {locations.map((location) => (
                              <SelectItem key={location} value={location}>
                                {location}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Business Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredBusinessList.map((business) => {
                    const relatedData = getBusinessRelatedDataSync(business.id)
                    return (
                      <Card key={business.id} className="bg-white shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-lg font-semibold text-gray-900 truncate">
                                {business.name}
                              </CardTitle>
                              <CardDescription className="text-sm text-gray-500">
                                {business.category}
                              </CardDescription>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleViewBusiness(business)}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEditBusiness(business)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleDeleteBusiness(business.id)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-3">
                            <div className="flex items-center text-sm text-gray-600">
                              <MapPin className="h-4 w-4 mr-2" />
                              {business.location}
                            </div>
                            
                            {business.phone && (
                              <div className="flex items-center text-sm text-gray-600">
                                <Phone className="h-4 w-4 mr-2" />
                                {business.phone}
                              </div>
                            )}
                            
                            {business.email && (
                              <div className="flex items-center text-sm text-gray-600">
                                <Mail className="h-4 w-4 mr-2" />
                                {business.email}
                              </div>
                            )}

                            <div className="flex items-center justify-between pt-2 border-t">
                              <div className="flex items-center space-x-2">
                                <Badge variant={business.status === 'Active' ? 'default' : 'secondary'}>
                                  {business.status}
                                </Badge>
                                <Badge 
                                  variant="outline" 
                                  className={
                                    business.supportContract 
                                      ? "border-green-500 text-green-700 bg-green-50" 
                                      : "border-red-500 text-red-700 bg-red-50"
                                  }
                                >
                                  {business.supportContract ? (
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                  ) : (
                                    <X className="h-3 w-3 mr-1" />
                                  )}
                                  Support
                                </Badge>
                              </div>
                              <Button variant="outline" size="sm" onClick={() => handleViewBusiness(business)}>
                                View Details
                              </Button>
                            </div>

                            {/* Related Items Summary */}
                            <div className="grid grid-cols-3 gap-2 pt-2 border-t">
                              <div className="text-center">
                                <p className="text-xs text-gray-500">Tasks</p>
                                <p className="text-sm font-medium">{relatedData.tasks.length}</p>
                              </div>
                              <div className="text-center">
                                <p className="text-xs text-gray-500">Quotes</p>
                                <p className="text-sm font-medium">{relatedData.quotes.length}</p>
                              </div>
                              <div className="text-center">
                                <p className="text-xs text-gray-500">Documents</p>
                                <p className="text-sm font-medium">{relatedData.documents.length}</p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>

                {filteredBusinessList.length === 0 && (
                  <Card className="bg-white shadow-sm">
                    <CardContent className="p-12 text-center">
                      <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No businesses found</h3>
                      <p className="text-gray-500 mb-4">
                        {businessSearchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first business'}
                      </p>
                      {!businessSearchTerm && (
                        <Button onClick={() => setIsAddBusinessOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Business
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {activeTab === 'users' && canAccessTab('users') && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
                  <p className="text-gray-600 mt-1">Manage team members and their permissions</p>
                </div>
                <Card className="bg-white shadow-sm">
                  <CardContent className="p-6">
                    <p className="text-gray-500">User management functionality coming soon...</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'inventory' && (
              <InventoryPage />
            )}

            {activeTab === 'tasks' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-2xl font-bold text-gray-900">Task Management</h2>
                  <p className="text-gray-600 mt-1">Organize and track your tasks and projects</p>
                </div>
                <Card className="bg-white shadow-sm">
                  <CardContent className="p-6">
                    <p className="text-gray-500">Task management functionality coming soon...</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'quotes' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-2xl font-bold text-gray-900">Quote Management</h2>
                  <p className="text-gray-600 mt-1">Create and manage customer quotes</p>
                </div>
                <Card className="bg-white shadow-sm">
                  <CardContent className="p-6">
                    <p className="text-gray-500">Quote management functionality coming soon...</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-2xl font-bold text-gray-900">Document Management</h2>
                  <p className="text-gray-600 mt-1">Store and organize your documents</p>
                </div>
                <Card className="bg-white shadow-sm">
                  <CardContent className="p-6">
                    <p className="text-gray-500">Document management functionality coming soon...</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'messages' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-2xl font-bold text-gray-900">Messages</h2>
                  <p className="text-gray-600 mt-1">Communicate with your team and clients</p>
                </div>
                <Card className="bg-white shadow-sm">
                  <CardContent className="p-6">
                    <p className="text-gray-500">Messaging functionality coming soon...</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'analytics' && canAccessTab('analytics') && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
                  <p className="text-gray-600 mt-1">Track your business performance and insights</p>
                </div>
                <AnalyticsDashboard />
              </div>
            )}

            {activeTab === 'settings' && canAccessTab('settings') && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
                  <p className="text-gray-600 mt-1">Configure your system preferences</p>
                </div>
                <Card className="bg-white shadow-sm">
                  <CardContent className="p-6">
                    <p className="text-gray-500">Settings functionality coming soon...</p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Add Business Modal */}
      <Dialog open={isAddBusinessOpen} onOpenChange={setIsAddBusinessOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Business</DialogTitle>
            <DialogDescription>Create a new business profile in your directory</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="business-name">Business Name</Label>
              <Input
                id="business-name"
                value={newBusiness.name}
                onChange={(e) => setNewBusiness({...newBusiness, name: e.target.value})}
                placeholder="Enter business name"
              />
            </div>
            <div>
              <Label htmlFor="business-category">Category</Label>
              <Select value={newBusiness.category} onValueChange={(value) => setNewBusiness({...newBusiness, category: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.filter(cat => cat !== 'All Categories').map((category) => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="business-description">Description</Label>
              <Textarea
                id="business-description"
                value={newBusiness.description}
                onChange={(e) => setNewBusiness({...newBusiness, description: e.target.value})}
                placeholder="Enter business description"
              />
            </div>
            <div>
              <Label htmlFor="business-location">Location</Label>
              <Select value={newBusiness.location} onValueChange={(value) => setNewBusiness({...newBusiness, location: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.filter(loc => loc !== 'All Locations').map((location) => (
                    <SelectItem key={location} value={location}>{location}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="business-phone">Phone</Label>
                <Input
                  id="business-phone"
                  value={newBusiness.phone}
                  onChange={(e) => setNewBusiness({...newBusiness, phone: e.target.value})}
                  placeholder="Phone number"
                />
              </div>
              <div>
                <Label htmlFor="business-email">Email</Label>
                <Input
                  id="business-email"
                  value={newBusiness.email}
                  onChange={(e) => setNewBusiness({...newBusiness, email: e.target.value})}
                  placeholder="Email address"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="business-website">Website</Label>
              <Input
                id="business-website"
                value={newBusiness.website}
                onChange={(e) => setNewBusiness({...newBusiness, website: e.target.value})}
                placeholder="Website URL"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="support-contract"
                checked={newBusiness.supportContract}
                onCheckedChange={(checked) => setNewBusiness({...newBusiness, supportContract: checked})}
              />
              <Label htmlFor="support-contract">Support Contract Active</Label>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsAddBusinessOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddBusiness}>
                Add Business
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add User Modal */}
      <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>Invite a new team member to join your organization</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="user-name">Full Name</Label>
              <Input
                id="user-name"
                value={newUser.name}
                onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                placeholder="Enter full name"
              />
            </div>
            <div>
              <Label htmlFor="user-email">Email Address</Label>
              <Input
                id="user-email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                placeholder="Enter email address"
              />
            </div>
            <div>
              <Label htmlFor="user-password">Password</Label>
              <Input
                id="user-password"
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                placeholder="Enter password"
              />
            </div>
            <div>
              <Label htmlFor="user-role">Role</Label>
              <Select value={newUser.role} onValueChange={(value) => setNewUser({...newUser, role: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="User">User</SelectItem>
                  <SelectItem value="Manager">Manager</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsAddUserOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddUser}>
                Add User
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Upload Document Modal */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>Share a file with your team</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="file-upload">Select File</Label>
              <Input
                id="file-upload"
                type="file"
                onChange={(e) => setSelectedFile(e.target.files?.[0])}
              />
            </div>
            <div>
              <Label htmlFor="document-category">Category</Label>
              <Select value={uploadCategory} onValueChange={setUploadCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="General">General</SelectItem>
                  <SelectItem value="Planning">Planning</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                  <SelectItem value="Project">Project</SelectItem>
                  <SelectItem value="HR">HR</SelectItem>
                  <SelectItem value="Legal">Legal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleFileUpload}>
                Upload Document
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Send Message Modal */}
      <Dialog open={isSendMessageOpen} onOpenChange={setIsSendMessageOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send Message</DialogTitle>
            <DialogDescription>Send a message to a team member</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="message-recipient">Recipient</Label>
              <Select value={messageData.recipient} onValueChange={(value) => setMessageData({...messageData, recipient: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select recipient" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="message-subject">Subject</Label>
              <Input
                id="message-subject"
                value={messageData.subject}
                onChange={(e) => setMessageData({...messageData, subject: e.target.value})}
                placeholder="Enter subject"
              />
            </div>
            <div>
              <Label htmlFor="message-content">Message</Label>
              <Textarea
                id="message-content"
                value={messageData.content}
                onChange={(e) => setMessageData({...messageData, content: e.target.value})}
                placeholder="Enter your message"
                rows={4}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsSendMessageOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSendMessage}>
                Send Message
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Business Modal */}
      <Dialog open={isViewBusinessOpen} onOpenChange={setIsViewBusinessOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">
              {selectedBusiness?.name}
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              {selectedBusiness?.category} • {selectedBusiness?.location}
            </DialogDescription>
          </DialogHeader>
          
          {selectedBusiness && (
            <div className="space-y-6">
              {/* Business Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Business Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Category</Label>
                    <p className="text-gray-900">{selectedBusiness.category}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Status</Label>
                    <Badge variant={selectedBusiness.status === 'Active' ? 'default' : 'secondary'}>
                      {selectedBusiness.status}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Location</Label>
                    <p className="text-gray-900 flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {selectedBusiness.location}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Phone</Label>
                    <p className="text-gray-900 flex items-center">
                      <Phone className="h-4 w-4 mr-1" />
                      {selectedBusiness.phone || 'Not provided'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Email</Label>
                    <p className="text-gray-900 flex items-center">
                      <Mail className="h-4 w-4 mr-1" />
                      {selectedBusiness.email || 'Not provided'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Website</Label>
                    <p className="text-gray-900 flex items-center">
                      <Globe className="h-4 w-4 mr-1" />
                      {selectedBusiness.website ? (
                        <a href={selectedBusiness.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {selectedBusiness.website}
                        </a>
                      ) : 'Not provided'}
                    </p>
                  </div>
                </div>
                
                {selectedBusiness.description && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Description</Label>
                    <p className="text-gray-900 mt-1">{selectedBusiness.description}</p>
                  </div>
                )}
              </div>

              {/* Support Contract Banner */}
              <div className={`rounded-lg p-4 flex items-center space-x-3 ${
                selectedBusiness.supportContract 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <div className={`flex-shrink-0 ${
                  selectedBusiness.supportContract ? 'text-green-600' : 'text-red-600'
                }`}>
                  {selectedBusiness.supportContract ? (
                    <CheckCircle className="h-6 w-6" />
                  ) : (
                    <X className="h-6 w-6" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className={`text-sm font-medium ${
                    selectedBusiness.supportContract ? 'text-green-800' : 'text-red-800'
                  }`}>
                    Support Contract {selectedBusiness.supportContract ? 'Active' : 'Inactive'}
                  </h4>
                  <p className={`text-xs ${
                    selectedBusiness.supportContract ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {selectedBusiness.supportContract 
                      ? 'This business has an active support contract'
                      : 'This business does not have a support contract'
                    }
                  </p>
                </div>
              </div>

              {/* Related Data */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Related Information</h3>
                
                <>
                  {/* Summary Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="bg-blue-50 border-blue-200">
                      <CardContent className="p-4 text-center">
                        <Package className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-blue-900">{businessRelatedData.products.length}</p>
                        <p className="text-sm text-blue-700">Products</p>
                      </CardContent>
                        </Card>
                        
                        <Card className="bg-green-50 border-green-200">
                          <CardContent className="p-4 text-center">
                            <CheckSquare className="h-8 w-8 text-green-600 mx-auto mb-2" />
                            <p className="text-2xl font-bold text-green-900">{businessRelatedData.tasks.length}</p>
                            <p className="text-sm text-green-700">Tasks</p>
                          </CardContent>
                        </Card>
                        
                        <Card className="bg-purple-50 border-purple-200">
                          <CardContent className="p-4 text-center">
                            <FileSignature className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                            <p className="text-2xl font-bold text-purple-900">{businessRelatedData.quotes.length}</p>
                            <p className="text-sm text-purple-700">Quotes</p>
                          </CardContent>
                        </Card>
                        
                        <Card className="bg-orange-50 border-orange-200">
                          <CardContent className="p-4 text-center">
                            <FolderOpen className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                            <p className="text-2xl font-bold text-orange-900">{businessRelatedData.documents.length}</p>
                            <p className="text-sm text-orange-700">Documents</p>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Detailed Lists */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Recent Tasks */}
                        {businessRelatedData.tasks.length > 0 && (
                          <Card className="bg-white border-gray-200">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-base font-medium text-gray-900 flex items-center">
                                <CheckSquare className="h-4 w-4 mr-2 text-green-600" />
                                Recent Tasks
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0">
                              <div className="space-y-2 max-h-40 overflow-y-auto">
                                {businessRelatedData.tasks.slice(0, 5).map((task) => (
                                  <div key={task.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
                                      <p className="text-xs text-gray-500">{task.status}</p>
                                    </div>
                                    {task.startDate && (
                                      <p className="text-xs text-gray-500">
                                        {new Date(task.startDate).toLocaleDateString()}
                                      </p>
                                    )}
                                  </div>
                                ))}
                                {businessRelatedData.tasks.length > 5 && (
                                  <p className="text-xs text-gray-500 text-center">
                                    +{businessRelatedData.tasks.length - 5} more tasks
                                  </p>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {/* Recent Quotes */}
                        {businessRelatedData.quotes.length > 0 && (
                          <Card className="bg-white border-gray-200">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-base font-medium text-gray-900 flex items-center">
                                <FileSignature className="h-4 w-4 mr-2 text-purple-600" />
                                Recent Quotes
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0">
                              <div className="space-y-2 max-h-40 overflow-y-auto">
                                {businessRelatedData.quotes.slice(0, 5).map((quote) => (
                                  <div key={quote.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-gray-900 truncate">{quote.title}</p>
                                      <p className="text-xs text-gray-500">{quote.status}</p>
                                    </div>
                                    {quote.totalAmount && (
                                      <p className="text-sm font-medium text-gray-900">
                                        ${quote.totalAmount.toLocaleString()}
                                      </p>
                                    )}
                                  </div>
                                ))}
                                {businessRelatedData.quotes.length > 5 && (
                                  <p className="text-xs text-gray-500 text-center">
                                    +{businessRelatedData.quotes.length - 5} more quotes
                                  </p>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {/* Products */}
                        {businessRelatedData.products.length > 0 && (
                          <Card className="bg-white border-gray-200">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-base font-medium text-gray-900 flex items-center">
                                <Package className="h-4 w-4 mr-2 text-blue-600" />
                                Products
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0">
                              <div className="space-y-2 max-h-40 overflow-y-auto">
                                {businessRelatedData.products.slice(0, 5).map((product) => (
                                  <div key={product.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                                      <p className="text-xs text-gray-500">{product.category}</p>
                                      <div className="flex items-center space-x-2 mt-1">
                                        <p className="text-sm font-semibold text-green-600">
                                          ${product.price.toLocaleString()}
                                        </p>
                                        <Badge variant="outline" className="text-xs">
                                          {product.pricingType || 'one-off'}
                                        </Badge>
                                        {product.sku && (
                                          <p className="text-xs text-gray-400">SKU: {product.sku}</p>
                                        )}
                                      </div>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleRemoveProduct(selectedBusiness.id, product.id)}
                                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ))}
                                {businessRelatedData.products.length > 5 && (
                                  <p className="text-xs text-gray-500 text-center">
                                    +{businessRelatedData.products.length - 5} more products
                                  </p>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {/* Documents */}
                        {businessRelatedData.documents.length > 0 && (
                          <Card className="bg-white border-gray-200">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-base font-medium text-gray-900 flex items-center">
                                <FolderOpen className="h-4 w-4 mr-2 text-orange-600" />
                                Documents
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0">
                              <div className="space-y-2 max-h-40 overflow-y-auto">
                                {businessRelatedData.documents.slice(0, 5).map((document) => (
                                  <div key={document.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-gray-900 truncate">{document.name}</p>
                                      <p className="text-xs text-gray-500">{document.type || 'Document'}</p>
                                    </div>
                                    {document.uploadedBy && (
                                      <p className="text-xs text-gray-500">
                                        {document.uploadedBy}
                                      </p>
                                    )}
                                  </div>
                                ))}
                                {businessRelatedData.documents.length > 5 && (
                                  <p className="text-xs text-gray-500 text-center">
                                    +{businessRelatedData.documents.length - 5} more documents
                                  </p>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </div>

                      {/* Empty State */}
                      {businessRelatedData.products.length === 0 && businessRelatedData.tasks.length === 0 && 
                       businessRelatedData.quotes.length === 0 && businessRelatedData.documents.length === 0 && (
                        <Card className="bg-gray-50 border-gray-200">
                          <CardContent className="p-8 text-center">
                            <p className="text-gray-500">No related information found for this business.</p>
                          </CardContent>
                        </Card>
                      )}
                    </>
                  </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsViewBusinessOpen(false)}>
                  Close
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleOpenAssignProduct(selectedBusiness)}
                >
                  <Package className="h-4 w-4 mr-2" />
                  Assign Product
                </Button>
                <Button onClick={() => {
                  setIsViewBusinessOpen(false)
                  handleEditBusiness(selectedBusiness)
                }}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Business
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Business Modal */}
      <Dialog open={isEditBusinessOpen} onOpenChange={setIsEditBusinessOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Business</DialogTitle>
            <DialogDescription>Update business information</DialogDescription>
          </DialogHeader>
          
          {selectedBusiness && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-business-name">Business Name</Label>
                <Input
                  id="edit-business-name"
                  value={selectedBusiness.name}
                  onChange={(e) => setSelectedBusiness({...selectedBusiness, name: e.target.value})}
                  placeholder="Enter business name"
                />
              </div>
              
              <div>
                <Label htmlFor="edit-business-category">Category</Label>
                <Select 
                  value={selectedBusiness.category} 
                  onValueChange={(value) => setSelectedBusiness({...selectedBusiness, category: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.filter(cat => cat !== 'All Categories').map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="edit-business-location">Location</Label>
                <Select 
                  value={selectedBusiness.location} 
                  onValueChange={(value) => setSelectedBusiness({...selectedBusiness, location: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.filter(loc => loc !== 'All Locations').map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="edit-business-phone">Phone</Label>
                <Input
                  id="edit-business-phone"
                  value={selectedBusiness.phone || ''}
                  onChange={(e) => setSelectedBusiness({...selectedBusiness, phone: e.target.value})}
                  placeholder="Enter phone number"
                />
              </div>
              
              <div>
                <Label htmlFor="edit-business-email">Email</Label>
                <Input
                  id="edit-business-email"
                  type="email"
                  value={selectedBusiness.email || ''}
                  onChange={(e) => setSelectedBusiness({...selectedBusiness, email: e.target.value})}
                  placeholder="Enter email address"
                />
              </div>
              
              <div>
                <Label htmlFor="edit-business-website">Website</Label>
                <Input
                  id="edit-business-website"
                  value={selectedBusiness.website || ''}
                  onChange={(e) => setSelectedBusiness({...selectedBusiness, website: e.target.value})}
                  placeholder="Enter website URL"
                />
              </div>
              
              <div>
                <Label htmlFor="edit-business-description">Description</Label>
                <Textarea
                  id="edit-business-description"
                  value={selectedBusiness.description || ''}
                  onChange={(e) => setSelectedBusiness({...selectedBusiness, description: e.target.value})}
                  placeholder="Enter business description"
                  rows={3}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-support-contract"
                  checked={selectedBusiness.supportContract || false}
                  onCheckedChange={(checked) => setSelectedBusiness({...selectedBusiness, supportContract: checked})}
                />
                <Label htmlFor="edit-support-contract">Support Contract Active</Label>
              </div>
              
              <div>
                <Label htmlFor="edit-business-status">Status</Label>
                <Select 
                  value={selectedBusiness.status} 
                  onValueChange={(value) => setSelectedBusiness({...selectedBusiness, status: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsEditBusinessOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => {
                    setIsEditBusinessOpen(false)
                    handleDeleteBusiness(selectedBusiness.id)
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
                <Button onClick={handleUpdateBusiness}>
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Assign Product Modal */}
      <Dialog open={isAssignProductOpen} onOpenChange={setIsAssignProductOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Assign Products to Business</DialogTitle>
            <DialogDescription>
              Select products to assign to {selectedBusiness?.name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedBusiness && (
            <div className="space-y-4">
              {availableProducts.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">All available products are already assigned to this business.</p>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Available Products</Label>
                    <div className="space-y-2 max-h-60 overflow-y-auto border rounded-lg p-2">
                      {availableProducts.map((product) => (
                        <div key={product.id} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                          <Checkbox
                            id={`product-${product.id}`}
                            checked={selectedProducts.includes(product.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedProducts([...selectedProducts, product.id])
                              } else {
                                setSelectedProducts(selectedProducts.filter(id => id !== product.id))
                              }
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <label 
                              htmlFor={`product-${product.id}`}
                              className="text-sm font-medium text-gray-900 cursor-pointer"
                            >
                              {product.name}
                            </label>
                            <p className="text-xs text-gray-500 mt-1">{product.category}</p>
                            <div className="flex items-center space-x-2 mt-2">
                              <p className="text-sm font-semibold text-green-600">
                                ${product.price.toLocaleString()}
                              </p>
                              <Badge variant="outline" className="text-xs">
                                {product.pricingType || 'one-off'}
                              </Badge>
                              {product.description && (
                                <p className="text-xs text-gray-400 truncate">{product.description}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center pt-4 border-t">
                    <p className="text-sm text-gray-500">
                      {selectedProducts.length} product(s) selected
                    </p>
                    <div className="flex space-x-2">
                      <Button variant="outline" onClick={() => setIsAssignProductOpen(false)}>
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleAssignProducts}
                        disabled={selectedProducts.length === 0}
                      >
                        Assign Selected Products
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialogs */}
      <ConfirmDialog
        open={deleteBusinessDialog.open}
        onOpenChange={(open) => setDeleteBusinessDialog({ ...deleteBusinessDialog, open })}
        title="Delete Business"
        description="Are you sure you want to delete this business? This action cannot be undone."
        confirmText="Delete Business"
        onConfirm={confirmDeleteBusiness}
        variant="destructive"
      />

      <ConfirmDialog
        open={removeProductDialog.open}
        onOpenChange={(open) => setRemoveProductDialog({ ...removeProductDialog, open })}
        title="Remove Product"
        description="Are you sure you want to remove this product from the business?"
        confirmText="Remove Product"
        onConfirm={confirmRemoveProduct}
        variant="destructive"
      />
    </div>
  )
}