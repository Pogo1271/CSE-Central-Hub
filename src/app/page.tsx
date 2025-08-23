'use client'
// Force rebuild

import { useState, useEffect, useCallback, useRef } from 'react'
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
  AtSign,
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
  PoundSterling,
  ShoppingCart,
  UserPlus,
  User,
  Upload,
  Send,
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Edit,
  Trash2,
  LogOut,
  Circle,
  HardDrive,
  Cloud,
  Save,
  PlusCircle,
  MinusCircle
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
import EnhancedUsersManagement from '@/components/enhanced-users-management'
import ActivityLogsPage from '@/components/activity-logs-page'
import EmergencyControlPage from '@/components/emergency-control-page'
import QuoteManagement from '@/components/quote-management'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useAuth } from '@/hooks/use-auth'

// Import client API
import * as api from '@/lib/client-api'

const navigation = [
  { name: 'Dashboard', href: '#', icon: Building2, tab: 'dashboard', requiredPermission: 'canViewDashboardPage' },
  { name: 'Business Directory', href: '#', icon: Building2, tab: 'businesses', requiredPermission: 'canViewBusinessesPage' },
  { name: 'Inventory', href: '#', icon: Package, tab: 'inventory', requiredPermission: 'canViewInventoryPage' },
  { name: 'Tasks', href: '#', icon: CheckSquare, tab: 'tasks', requiredPermission: 'canViewTasksPage' },
  { name: 'Users', href: '#', icon: Users, tab: 'users', requiredPermission: 'canViewUsersPage' },
  { name: 'Quotes', href: '#', icon: FileSignature, tab: 'quotes', requiredPermission: 'canViewQuotesPage' },
  { name: 'Documents', href: '#', icon: FolderOpen, tab: 'documents', requiredPermission: 'canViewDocumentsPage' },
  { name: 'Messages', href: '#', icon: MessageSquare, tab: 'messages', requiredPermission: 'canViewMessagesPage' },
  { name: 'Analytics', href: '#', icon: BarChart3, tab: 'analytics', requiredPermission: 'canViewAnalyticsPage' },
  { name: 'Activity Logs', href: '#', icon: BarChart3, tab: 'activity-logs', requiredPermission: 'canViewActivityLogsPage' },
  { name: 'Emergency Control', href: '#', icon: Settings, tab: 'emergency-control', requiredPermission: 'canViewEmergencyControlPage' },
  { name: 'Settings', href: '#', icon: Settings, tab: 'settings', requiredPermission: 'canViewSettingsPage' },
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
  const { isAuthenticated, user: currentUser, isLoading, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All Categories')
  const [selectedLocation, setSelectedLocation] = useState('All Locations')
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [filteredBusinesses, setFilteredBusinesses] = useState<any[]>([])
  const [filteredUsers, setFilteredUsers] = useState<any[]>([])
  
  // Handle authentication state
  const [isClient, setIsClient] = useState(false)
  const [displayName, setDisplayName] = useState(() => {
    // Try to get user name from localStorage during initial state setup
    if (typeof window !== 'undefined') {
      try {
        const userString = localStorage.getItem('currentUser')
        if (userString) {
          const user = JSON.parse(userString)
          return user.name || 'User'
        }
      } catch (error) {
        console.error('Error reading user from localStorage:', error)
      }
    }
    return 'User'
  })
  
  // Role-based permissions - will be populated dynamically from backend
  const [rolePermissions, setRolePermissions] = useState<any>({})
  const [permissionsLoaded, setPermissionsLoaded] = useState(false)
  
  // Data state
  const [roles, setRoles] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [documents, setDocuments] = useState<any[]>([])
  const [messages, setMessages] = useState<any[]>([])
  const [businessList, setBusinessList] = useState<any[]>([])
  const [quotes, setQuotes] = useState<any[]>([])
  const [notes, setNotes] = useState<any[]>([])
  
  // Debug logging - moved after state declarations
  console.log('BusinessHub render:', {
    isAuthenticated,
    currentUser: currentUser?.email,
    userRole: currentUser?.role,
    isLoading,
    permissionsLoaded,
    rolePermissionsLoaded: Object.keys(rolePermissions).length
  })
  
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
  const [isViewQuoteOpen, setIsViewQuoteOpen] = useState(false)
  const [isEditQuoteOpen, setIsEditQuoteOpen] = useState(false)
  
  // Quote edit form states
  const [quoteFormData, setQuoteFormData] = useState({
    title: '',
    description: '',
    businessId: '',
    status: 'draft',
    items: []
  })
  const [businesses, setBusinesses] = useState([])
  const [hardwareSearchTerm, setHardwareSearchTerm] = useState('')
  const [softwareSearchTerm, setSoftwareSearchTerm] = useState('')
  const [showHardwareDropdown, setShowHardwareDropdown] = useState(false)
  const [showSoftwareDropdown, setShowSoftwareDropdown] = useState(false)
  
  // Refs for dropdown click-outside detection
  const hardwareDropdownRef = useRef<HTMLDivElement>(null)
  const softwareDropdownRef = useRef<HTMLDivElement>(null)
  
  // Product Assignment Modal state
  const [isAssignProductOpen, setIsAssignProductOpen] = useState(false)
  const [availableProducts, setAvailableProducts] = useState<any[]>([])
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  
  // Contact Management Modal state
  const [isAddContactOpen, setIsAddContactOpen] = useState(false)
  const [isEditContactOpen, setIsEditContactOpen] = useState(false)
  const [selectedContact, setSelectedContact] = useState(null)
  const [newContact, setNewContact] = useState({
    name: '',
    email: '',
    phone: '',
    position: ''
  })
  
  // Note Management Modal state
  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false)
  const [isEditNoteOpen, setIsEditNoteOpen] = useState(false)
  const [selectedNote, setSelectedNote] = useState(null)
  const [newNote, setNewNote] = useState({
    title: '',
    content: ''
  })
  
  // Business Directory states
  const [isViewBusinessOpen, setIsViewBusinessOpen] = useState(false)
  const [isEditBusinessOpen, setIsEditBusinessOpen] = useState(false)
  const [selectedBusiness, setSelectedBusiness] = useState(null)
  const [selectedQuote, setSelectedQuote] = useState(null)
  const [editQuoteId, setEditQuoteId] = useState(null)
  const [businessRelatedData, setBusinessRelatedData] = useState({
    products: [],
    tasks: [],
    quotes: [],
    documents: [],
    contacts: [],
    notes: []
  })
  const [businessSearchTerm, setBusinessSearchTerm] = useState('')
  const [filteredBusinessList, setFilteredBusinessList] = useState<any[]>([])
  const [businessOverviewActiveTab, setBusinessOverviewActiveTab] = useState('overview')
  
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
  const [deleteContactDialog, setDeleteContactDialog] = useState({
    open: false,
    contactId: null
  })
  const [deleteNoteDialog, setDeleteNoteDialog] = useState({
    open: false,
    noteId: null
  })
  const [deleteQuoteDialog, setDeleteQuoteDialog] = useState({
    open: false,
    quoteId: null
  })

  // Utility function to format dates consistently
  const formatDate = (date: Date | string) => {
    try {
      const d = new Date(date)
      // Use a consistent format that works on both server and client
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })
    } catch (error) {
      console.error('Error formatting date:', error)
      return 'Invalid date'
    }
  }

  // Utility function to format currency consistently
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount)
  }

  // Simplified welcome component that uses the parent's authentication state
  const WelcomeMessage = () => {
    return <span>{displayName}</span>
  }
  const getUserPermissions = () => {
    // If permissions are still loading, return default permissions based on user role
    if (!permissionsLoaded && currentUser) {
      // Provide default permissions during loading to prevent UI flicker
      const defaultPermissions = {
        tabs: ['dashboard'],
        features: {
          canViewDashboardPage: true,
          canViewTasksPage: currentUser.role === 'User',
          canViewBusinessesPage: currentUser.role === 'Manager' || currentUser.role === 'Admin',
          canViewInventoryPage: currentUser.role === 'Manager' || currentUser.role === 'Admin',
          canViewUsersPage: currentUser.role === 'Manager' || currentUser.role === 'Admin',
          canViewQuotesPage: currentUser.role === 'Manager' || currentUser.role === 'Admin',
          canEditQuote: currentUser.role === 'Manager' || currentUser.role === 'Admin', // Same as view permission
          canDeleteQuote: currentUser.role === 'Manager' || currentUser.role === 'Admin', // Same as view permission
          canViewDocumentsPage: currentUser.role === 'Manager' || currentUser.role === 'Admin',
          canViewMessagesPage: currentUser.role === 'Manager' || currentUser.role === 'Admin',
          canViewAnalyticsPage: currentUser.role === 'Admin',
          canViewActivityLogsPage: currentUser.role === 'Admin',
          canViewEmergencyControlPage: currentUser.role === 'Admin',
          canViewSettingsPage: currentUser.role === 'Admin'
        }
      }
      return defaultPermissions
    }
    
    // Remove hardcoded fallback - only use permissions loaded from backend
    if (currentUser && rolePermissions[currentUser.role]) {
      return rolePermissions[currentUser.role]
    }
    
    // Try case-insensitive matching
    if (currentUser) {
      const userRoleLower = currentUser.role.toLowerCase()
      const matchingRole = Object.keys(rolePermissions).find(role => 
        role.toLowerCase() === userRoleLower
      )
      
      if (matchingRole) {
        return rolePermissions[matchingRole]
      }
    }
    
    // Return minimal permissions if role not found (no hardcoded fallback)
    console.log('No role match found for:', currentUser?.role, 'Available roles:', Object.keys(rolePermissions))
    return {
      tabs: ['dashboard'],
      features: {}
    }
  }
  
  const hasPermission = (feature) => {
    // SuperUser has access to everything
    if (currentUser?.role === 'SuperUser') {
      return true
    }
    
    const permissions = getUserPermissions()
    const result = permissions.features && permissions.features[feature] === true
    return result
  }

  const canAccessTab = (tab) => {
    // SuperUser has access to all tabs
    if (currentUser?.role === 'SuperUser') {
      return true
    }
    
    // Find the navigation item to get its required permission
    const navItem = navigation.find(item => item.tab === tab)
    if (!navItem || !navItem.requiredPermission) return false
    
    return hasPermission(navItem.requiredPermission)
  }

  // Load data from backend
  useEffect(() => {
    const loadData = async () => {
      // Only load data if user is authenticated
      if (!isAuthenticated || !currentUser) {
        console.log('Skipping data load - user not authenticated', { isAuthenticated, currentUser })
        setPermissionsLoaded(true) // Set to true to prevent loading state
        return
      }
      
      try {
        console.log('Starting to load data...', { 
          currentUser: currentUser?.email, 
          userRole: currentUser?.role,
          isLoading 
        })
        
        // Load roles first to get permissions
        const rolesResponse = await api.getRoles()
        if (rolesResponse.success) {
          setRoles(rolesResponse.data)
          
          // Convert roles array to rolePermissions object
          const dynamicRolePermissions: any = {}
          rolesResponse.data.forEach((role: any) => {
            const permissions = role.permissions || {}
            dynamicRolePermissions[role.name] = {
              tabs: ['dashboard', 'businesses', 'inventory', 'tasks', 'users', 'quotes', 'documents', 'messages', 'analytics', 'settings'],
              features: {
                canCreateBusiness: permissions.canCreateBusiness === true,
                canViewAllUsers: permissions.canViewUsers === true, // Map backend canViewUsers to frontend canViewAllUsers
                canCreateUser: permissions.canCreateUser === true,
                canViewAnalytics: permissions.canViewAnalytics === true,
                canAccessSettings: permissions.canAccessSettings === true,
                canUploadDocument: permissions.canUploadDocument === true,
                canSendMessage: permissions.canSendMessage === true, // Strict true check
                // Dashboard Quick Actions permissions
                canQuickAddBusiness: permissions.canQuickAddBusiness === true,
                canQuickCreateUser: permissions.canQuickCreateUser === true,
                canQuickUploadDocument: permissions.canQuickUploadDocument === true,
                canQuickSendMessage: permissions.canQuickSendMessage === true,
                // Page access permissions for sidebar visibility
                canViewDashboardPage: permissions.canViewDashboardPage === true,
                canViewBusinessesPage: permissions.canViewBusinessesPage === true,
                canViewInventoryPage: permissions.canViewInventoryPage === true,
                canViewTasksPage: permissions.canViewTasksPage === true,
                canViewUsersPage: permissions.canViewUsersPage === true,
                canViewQuotesPage: permissions.canViewQuotesPage === true,
                canEditQuote: permissions.canViewQuotesPage === true, // Base edit permission on view permission for now
                canDeleteQuote: permissions.canViewQuotesPage === true, // Base delete permission on view permission for now
                canApproveQuotes: permissions.canApproveQuotes === true,
                canViewDocumentsPage: permissions.canViewDocumentsPage === true,
                canViewMessagesPage: permissions.canViewMessagesPage === true,
                canViewAnalyticsPage: permissions.canViewAnalyticsPage === true,
                canViewActivityLogsPage: permissions.canViewActivityLogsPage === true,
                canViewEmergencyControlPage: permissions.canViewEmergencyControlPage === true,
                canViewSettingsPage: permissions.canViewSettingsPage === true
              }
            }
          })
          setRolePermissions(dynamicRolePermissions)
          setPermissionsLoaded(true)
        } else {
          console.error('Failed to load roles:', rolesResponse.error)
          setPermissionsLoaded(true) // Set to true even on error to prevent infinite loading
        }
        
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

        // Load notes
        const notesResponse = await api.getNotes()
        console.log('Notes response:', notesResponse)
        if (notesResponse.success) {
          setNotes(notesResponse.data)
          console.log('Notes loaded:', notesResponse.data.length)
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

  // Set up client state and handle authentication redirect
  useEffect(() => {
    // Mark that we're on the client side
    setIsClient(true)
    
    // Set display name if user is authenticated
    if (isAuthenticated && currentUser) {
      setDisplayName(currentUser.name || 'User')
    }
  }, [isAuthenticated, currentUser])

  // Redirect to login if not authenticated
  useEffect(() => {
    if (isClient && !isLoading && !isAuthenticated) {
      window.location.href = '/auth'
    }
  }, [isClient, isLoading, isAuthenticated])

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

  // Handle click outside for dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (hardwareDropdownRef.current && !hardwareDropdownRef.current.contains(event.target as Node)) {
        setShowHardwareDropdown(false)
      }
      if (softwareDropdownRef.current && !softwareDropdownRef.current.contains(event.target as Node)) {
        setShowSoftwareDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

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
    setBusinessOverviewActiveTab('overview')
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

  // Contact management functions
  const handleAddContact = async () => {
    try {
      const response = await api.createBusinessContact(selectedBusiness.id, newContact)
      if (response.success) {
        // Refresh the business related data
        const data = await getBusinessRelatedData(selectedBusiness.id)
        setBusinessRelatedData(data)
        
        // Reset form and close modal
        setNewContact({
          name: '',
          email: '',
          phone: '',
          position: ''
        })
        setIsAddContactOpen(false)
        toast.success('Contact added successfully!')
      } else {
        toast.error('Failed to add contact')
      }
    } catch (error) {
      console.error('Error adding contact:', error)
      toast.error('Error adding contact. Please try again.')
    }
  }

  const handleEditContact = (contact) => {
    setSelectedContact(contact)
    setNewContact({
      name: contact.name,
      email: contact.email || '',
      phone: contact.phone || '',
      position: contact.position || ''
    })
    setIsEditContactOpen(true)
  }

  const handleUpdateContact = async () => {
    try {
      const response = await api.updateBusinessContact(selectedBusiness.id, selectedContact.id, newContact)
      if (response.success) {
        // Refresh the business related data
        const data = await getBusinessRelatedData(selectedBusiness.id)
        setBusinessRelatedData(data)
        
        // Reset form and close modal
        setSelectedContact(null)
        setNewContact({
          name: '',
          email: '',
          phone: '',
          position: ''
        })
        setIsEditContactOpen(false)
        toast.success('Contact updated successfully!')
      } else {
        toast.error('Failed to update contact')
      }
    } catch (error) {
      console.error('Error updating contact:', error)
      toast.error('Error updating contact. Please try again.')
    }
  }

  const handleDeleteContact = async (contactId) => {
    setDeleteContactDialog({
      open: true,
      contactId
    })
  }

  const confirmDeleteContact = async () => {
    const { contactId } = deleteContactDialog
    try {
      const response = await api.deleteBusinessContact(selectedBusiness.id, contactId)
      if (response.success) {
        // Refresh the business related data
        const data = await getBusinessRelatedData(selectedBusiness.id)
        setBusinessRelatedData(data)
        
        setDeleteContactDialog({ open: false, contactId: null })
        toast.success('Contact deleted successfully!')
      } else {
        toast.error('Failed to delete contact')
      }
    } catch (error) {
      console.error('Error deleting contact:', error)
      toast.error('Error deleting contact. Please try again.')
    }
  }

  // Quote Management Handlers
  const handleViewQuote = (quote) => {
    setSelectedQuote(quote)
    setIsViewQuoteOpen(true)
  }

  const handleEditQuote = (quote) => {
    setSelectedQuote(quote)
    setIsViewQuoteOpen(false) // Close view modal if open
    
    // Load businesses and products for the edit form
    loadBusinessesAndProducts()
    
    // Set up form data
    setQuoteFormData({
      title: quote.title,
      description: quote.description || '',
      businessId: quote.businessId,
      status: quote.status,
      items: quote.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        category: item.product.pricingType === 'one-off' ? 'hardware' : 'software'
      }))
    })
    
    setIsEditQuoteOpen(true)
  }

  const loadBusinessesAndProducts = async () => {
    try {
      // Load businesses
      const businessesResponse = await api.getBusinesses()
      if (businessesResponse.success) {
        setBusinesses(businessesResponse.data)
      }
      
      // Load products
      const productsResponse = await api.getProducts()
      if (productsResponse.success) {
        setProducts(productsResponse.data)
      }
    } catch (error) {
      console.error('Error loading businesses and products:', error)
      toast.error('Failed to load data')
    }
  }

  const handleUpdateQuote = async () => {
    if (!selectedQuote) return
    
    try {
      const response = await api.updateQuote(selectedQuote.id, quoteFormData)
      if (response.success) {
        // Update the quotes list
        setQuotes(quotes.map(q => q.id === selectedQuote.id ? response.data : q))
        
        // If this quote belongs to the currently selected business, refresh business data
        if (selectedBusiness && selectedQuote.businessId === selectedBusiness.id) {
          const businessData = await getBusinessRelatedData(selectedBusiness.id)
          setBusinessRelatedData(businessData)
        }
        
        // Close modal and reset form
        setIsEditQuoteOpen(false)
        setSelectedQuote(null)
        resetQuoteForm()
        toast.success('Quote updated successfully')
      }
    } catch (error) {
      console.error('Error updating quote:', error)
      toast.error('Failed to update quote')
    }
  }

  const resetQuoteForm = () => {
    setQuoteFormData({
      title: '',
      description: '',
      businessId: '',
      status: 'draft',
      items: []
    })
    setHardwareSearchTerm('')
    setSoftwareSearchTerm('')
  }

  const addProductToQuote = (product, category) => {
    const existingItemIndex = quoteFormData.items.findIndex(item => 
      item.productId === product.id && item.category === category
    )
    
    if (existingItemIndex >= 0) {
      // Update quantity if product already exists
      const updatedItems = [...quoteFormData.items]
      updatedItems[existingItemIndex].quantity += 1
      setQuoteFormData(prev => ({ ...prev, items: updatedItems }))
    } else {
      // Add new product
      const newItem = {
        productId: product.id,
        quantity: 1,
        price: product.price,
        category
      }
      setQuoteFormData(prev => ({ 
        ...prev, 
        items: [...prev.items, newItem] 
      }))
    }
    
    // Clear search and hide dropdown
    if (category === 'hardware') {
      setHardwareSearchTerm('')
      setShowHardwareDropdown(false)
    } else {
      setSoftwareSearchTerm('')
      setShowSoftwareDropdown(false)
    }
  }

  const removeQuoteItem = (index) => {
    const updatedItems = quoteFormData.items.filter((_, i) => i !== index)
    setQuoteFormData(prev => ({ ...prev, items: updatedItems }))
  }

  const updateQuoteItemQuantity = (index, quantity) => {
    if (quantity < 1) return
    
    const updatedItems = [...quoteFormData.items]
    updatedItems[index].quantity = quantity
    setQuoteFormData(prev => ({ ...prev, items: updatedItems }))
  }

  // Filter products for dropdowns
  const hardwareProducts = products.filter(product => 
    product.pricingType === 'one-off' && 
    product.name.toLowerCase().includes(hardwareSearchTerm.toLowerCase())
  )
  
  const softwareProducts = products.filter(product => 
    product.pricingType === 'monthly' && 
    product.name.toLowerCase().includes(softwareSearchTerm.toLowerCase())
  )

  const calculateQuoteTotals = () => {
    const hardwareItems = quoteFormData.items.filter(item => item.category === 'hardware')
    const softwareItems = quoteFormData.items.filter(item => item.category === 'software')
    
    const hardwareTotal = hardwareItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const softwareTotal = softwareItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const subtotal = hardwareTotal + softwareTotal
    const vat = subtotal * 0.20 // 20% VAT
    const total = subtotal + vat
    
    return {
      hardwareTotal,
      softwareTotal,
      subtotal,
      vat,
      total
    }
  }

  const handleDeleteQuote = async (quoteId) => {
    setDeleteQuoteDialog({
      open: true,
      quoteId
    })
  }

  // Clear editQuoteId when switching away from quotes tab
  useEffect(() => {
    if (activeTab !== 'quotes') {
      setEditQuoteId(null)
    }
  }, [activeTab])

  const confirmDeleteQuote = async () => {
    const { quoteId } = deleteQuoteDialog
    try {
      const response = await fetch(`/api/quotes/${quoteId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        // Refresh the business related data
        const data = await getBusinessRelatedData(selectedBusiness.id)
        setBusinessRelatedData(data)
        
        // Also refresh the main quotes state
        const quotesResponse = await api.getQuotes()
        if (quotesResponse.success) {
          setQuotes(quotesResponse.data)
        }
        
        setDeleteQuoteDialog({ open: false, quoteId: null })
        toast.success('Quote deleted successfully!')
      } else {
        toast.error('Failed to delete quote')
      }
    } catch (error) {
      console.error('Error deleting quote:', error)
      toast.error('Error deleting quote. Please try again.')
    }
  }

  // Note Management Handlers
  const handleAddNote = async () => {
    try {
      const response = await api.createBusinessNote(selectedBusiness.id, newNote)
      if (response.success) {
        // Refresh the business related data
        const data = await getBusinessRelatedData(selectedBusiness.id)
        setBusinessRelatedData(data)
        
        // Reset form and close modal
        setNewNote({
          title: '',
          content: ''
        })
        setIsAddNoteOpen(false)
        toast.success('Note added successfully!')
      } else {
        toast.error('Failed to add note')
      }
    } catch (error) {
      console.error('Error adding note:', error)
      toast.error('Error adding note. Please try again.')
    }
  }

  const handleEditNote = (note) => {
    setSelectedNote(note)
    setNewNote({
      title: note.title,
      content: note.content
    })
    setIsEditNoteOpen(true)
  }

  const handleUpdateNote = async () => {
    try {
      const response = await api.updateBusinessNote(selectedBusiness.id, selectedNote.id, newNote)
      if (response.success) {
        // Refresh the business related data
        const data = await getBusinessRelatedData(selectedBusiness.id)
        setBusinessRelatedData(data)
        
        // Reset form and close modal
        setSelectedNote(null)
        setNewNote({
          title: '',
          content: ''
        })
        setIsEditNoteOpen(false)
        toast.success('Note updated successfully!')
      } else {
        toast.error('Failed to update note')
      }
    } catch (error) {
      console.error('Error updating note:', error)
      toast.error('Error updating note. Please try again.')
    }
  }

  const handleDeleteNote = async (noteId) => {
    setDeleteNoteDialog({
      open: true,
      noteId
    })
  }

  const confirmDeleteNote = async () => {
    const { noteId } = deleteNoteDialog
    try {
      const response = await api.deleteBusinessNote(selectedBusiness.id, noteId)
      if (response.success) {
        // Refresh the business related data
        const data = await getBusinessRelatedData(selectedBusiness.id)
        setBusinessRelatedData(data)
        
        setDeleteNoteDialog({ open: false, noteId: null })
        toast.success('Note deleted successfully!')
      } else {
        toast.error('Failed to delete note')
      }
    } catch (error) {
      console.error('Error deleting note:', error)
      toast.error('Error deleting note. Please try again.')
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

  // Get business stats for display in cards
  const getBusinessStats = (business) => {
    // Get tasks for this business
    const businessTasks = tasks.filter(task => task.businessId === business.id)
    
    // Get products for this business
    const businessProducts = products.filter(product => product.businessId === business.id)
    
    // For contacts, we'll show 0 since they're loaded on-demand per business
    // The actual contact count will be visible in the business detail view
    const businessContacts = []
    
    return {
      contacts: businessContacts,
      tasks: businessTasks,
      products: businessProducts
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
      console.log('Loading business related data for businessId:', businessId)
      
      // Make parallel API calls for better performance
      const [businessProductsResponse, businessContactsResponse, businessNotesResponse, businessQuotesResponse] = await Promise.all([
        api.getBusinessProducts(businessId),
        api.getBusinessContacts(businessId),
        api.getBusinessNotes(businessId),
        api.getBusinessQuotes(businessId) // Get quotes specifically for this business
      ])
      
      const businessProducts = businessProductsResponse.success ? businessProductsResponse.data : []
      const businessContacts = businessContactsResponse.success ? businessContactsResponse.data : []
      const businessNotes = businessNotesResponse.success ? businessNotesResponse.data : []
      const businessQuotes = businessQuotesResponse.success ? businessQuotesResponse.data : []
      
      // Filter other related data from local state
      const businessTasks = tasks.filter(t => t.businessId === businessId)
      const businessDocuments = documents.filter(d => d.businessId === businessId)
      
      console.log('API businessQuotes:', businessQuotes)
      console.log('Expected businessId:', businessId)
      console.log('Found quotes for business:', businessQuotes.length)
      
      return {
        products: businessProducts,
        contacts: businessContacts,
        tasks: businessTasks,
        quotes: businessQuotes,
        documents: businessDocuments,
        notes: businessNotes
      }
    } catch (error) {
      console.error('Error getting business related data:', error)
      return {
        products: [],
        contacts: [],
        tasks: [],
        quotes: [],
        documents: [],
        notes: []
      }
    }
  }

  // Get simplified related data for business grid (sync version)
  const getBusinessRelatedDataSync = (businessId) => {
    const businessTasks = tasks.filter(t => t.businessId === businessId)
    const businessQuotes = quotes.filter(q => q.businessId === businessId)
    const businessDocuments = documents.filter(d => d.businessId === businessId)
    const businessNotes = notes.filter(n => n.businessId === businessId)
    
    return {
      tasks: businessTasks,
      quotes: businessQuotes,
      documents: businessDocuments,
      notes: businessNotes
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

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // If not authenticated and not loading, the redirect effect will handle it
  // This prevents flash of content before redirect
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    )
  }

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
                    placeholder={activeTab === 'quotes' ? "Search quotes..." : "Search..."}
                    className="pl-10 w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              )}
              
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center space-x-2 cursor-pointer">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={currentUser?.avatar} />
                      <AvatarFallback>{currentUser?.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="hidden md:block">
                      <p className="text-sm font-medium text-gray-900">{currentUser?.name}</p>
                      <p className="text-xs text-gray-500">{currentUser?.role}</p>
                    </div>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={logout} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
                      <p className="text-sm font-medium text-gray-900">{formatDate(new Date())}</p>
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
                  {quickActions
                    .filter(action => {
                      switch (action.title) {
                        case 'Add Business':
                          return hasPermission('canQuickAddBusiness')
                        case 'Create User':
                          return hasPermission('canQuickCreateUser')
                        case 'Upload Document':
                          return hasPermission('canQuickUploadDocument')
                        case 'Send Message':
                          return hasPermission('canQuickSendMessage')
                        default:
                          return true
                      }
                    })
                    .map((action, index) => (
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

            {/* Recent businesses, activity summary, and notes */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                          <p className="text-sm text-gray-500">Marketing Pro - £5,000</p>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">1 day ago</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent notes */}
              <Card className="bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900">Recent Notes</CardTitle>
                  <CardDescription>Latest notes from across all businesses</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {notes.length > 0 ? (
                      notes.slice(0, 5).map((note) => (
                        <div key={note.id} className="flex items-start justify-between p-3 hover:bg-gray-50 rounded-lg">
                          <div className="flex items-start space-x-3">
                            <div className="p-2 bg-yellow-100 rounded-lg mt-1">
                              <FileText className="h-4 w-4 text-yellow-600" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{note.title}</p>
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{note.content}</p>
                              <div className="flex items-center mt-2 text-xs text-gray-500">
                                <span className="font-medium">{note.businessName}</span>
                                <span className="mx-2">•</span>
                                <span>{formatDate(note.createdAt)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center py-4">No notes found</p>
                    )}
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
                      <h1 className="text-2xl font-bold text-gray-900">Business Directory</h1>
                      <p className="text-gray-600 mt-1">Manage your business contacts and relationships</p>
                      <p className="text-sm text-gray-500 mt-2">Total Businesses: {businessList.length}</p>
                    </div>
                    {hasPermission('canCreateBusiness') && (
                      <Button onClick={() => setIsAddBusinessOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Business
                      </Button>
                    )}
                  </div>
                </div>

                {/* Business Grid */}
                {filteredBusinessList.length === 0 ? (
                  <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-12 text-center">
                      <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No businesses found</h3>
                      <p className="text-gray-600 mb-4">Try adjusting your search criteria or create a new business.</p>
                      {hasPermission('canCreateBusiness') && (
                        <Button onClick={() => setIsAddBusinessOpen(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Business
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredBusinessList.map((business) => {
                      const businessStats = getBusinessStats(business)
                      return (
                        <Card 
                          key={business.id} 
                          className="bg-white shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer group"
                          onClick={() => handleViewBusiness(business)}
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <CardTitle className="text-lg truncate group-hover:text-blue-600 transition-colors">
                                  {business.name}
                                </CardTitle>
                                <CardDescription className="text-sm line-clamp-2 mt-1">
                                  {business.description || 'No description available'}
                                </CardDescription>
                              </div>
                              <div className="flex flex-col items-end space-y-2">
                                <Badge className={business.supportContract ? "bg-green-100 text-green-800 hover:bg-green-200" : "bg-red-100 text-red-800 hover:bg-red-200"}>
                                  {business.supportContract ? "Support" : "No Support"}
                                </Badge>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={(e) => {
                                      e.stopPropagation();
                                      handleViewBusiness(business);
                                    }}>
                                      <Eye className="h-4 w-4 mr-2" />
                                      View Details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditBusiness(business);
                                    }}>
                                      <Edit className="h-4 w-4 mr-2" />
                                      Edit Details
                                    </DropdownMenuItem>
                                    {hasPermission('canDeleteBusiness') && (
                                      <DropdownMenuItem 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteBusiness(business.id);
                                        }}
                                        className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                      >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete
                                      </DropdownMenuItem>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="space-y-3">
                              {/* Location */}
                              <div className="flex items-center text-sm text-gray-600">
                                <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                                <span className="truncate">{business.location || 'No location specified'}</span>
                              </div>
                              
                              {/* Category */}
                              <div className="flex items-center text-sm text-gray-600">
                                <Building2 className="h-4 w-4 mr-2 flex-shrink-0" />
                                <span className="truncate">{business.category || 'Uncategorized'}</span>
                              </div>
                              
                              <Separator className="my-3" />
                              
                              {/* Stats */}
                              <div className="grid grid-cols-3 gap-2">
                                <div className="text-center p-2 bg-blue-50 rounded-lg">
                                  <div className="text-lg font-bold text-blue-600">{businessStats.contacts.length}</div>
                                  <div className="text-xs text-blue-600">Contacts</div>
                                </div>
                                <div className="text-center p-2 bg-green-50 rounded-lg">
                                  <div className="text-lg font-bold text-green-600">{businessStats.tasks.length}</div>
                                  <div className="text-xs text-green-600">Tasks</div>
                                </div>
                                <div className="text-center p-2 bg-purple-50 rounded-lg">
                                  <div className="text-lg font-bold text-purple-600">{businessStats.products.length}</div>
                                  <div className="text-xs text-purple-600">Products</div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'inventory' && (
              <InventoryPage searchTerm={searchTerm} />
            )}

            {activeTab === 'tasks' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Task Management</h2>
                      <p className="text-gray-600 mt-1">Track and manage your team's tasks</p>
                    </div>
                    {hasPermission('canCreateTask') && (
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="h-4 w-4 mr-2" />
                        New Task
                      </Button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* To Do Column */}
                  <Card className="bg-white shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg font-semibold text-gray-900">To Do</CardTitle>
                      <Badge variant="secondary">{tasks.filter(t => t.status === 'To Do').length} tasks</Badge>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {tasks.filter(t => t.status === 'To Do').map((task) => (
                        <div key={task.id} className="p-3 border border-gray-200 rounded-lg">
                          <h4 className="font-medium text-gray-900 mb-1">{task.title}</h4>
                          <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                          <div className="flex items-center justify-between">
                            <Badge variant="outline">{task.priority}</Badge>
                            <span className="text-xs text-gray-500">
                              {formatDate(task.dueDate)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* In Progress Column */}
                  <Card className="bg-white shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg font-semibold text-gray-900">In Progress</CardTitle>
                      <Badge variant="secondary">{tasks.filter(t => t.status === 'In Progress').length} tasks</Badge>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {tasks.filter(t => t.status === 'In Progress').map((task) => (
                        <div key={task.id} className="p-3 border border-gray-200 rounded-lg">
                          <h4 className="font-medium text-gray-900 mb-1">{task.title}</h4>
                          <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                          <div className="flex items-center justify-between">
                            <Badge variant="outline">{task.priority}</Badge>
                            <span className="text-xs text-gray-500">
                              {formatDate(task.dueDate)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Completed Column */}
                  <Card className="bg-white shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg font-semibold text-gray-900">Completed</CardTitle>
                      <Badge variant="secondary">{tasks.filter(t => t.status === 'Completed').length} tasks</Badge>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {tasks.filter(t => t.status === 'Completed').map((task) => (
                        <div key={task.id} className="p-3 border border-gray-200 rounded-lg opacity-75">
                          <h4 className="font-medium text-gray-900 mb-1">{task.title}</h4>
                          <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                          <div className="flex items-center justify-between">
                            <Badge variant="outline">{task.priority}</Badge>
                            <span className="text-xs text-gray-500">
                              {formatDate(task.dueDate)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <EnhancedUsersManagement />
            )}

            {activeTab === 'quotes' && (
              <QuoteManagement 
                editQuoteId={editQuoteId} 
                onEditComplete={() => {
                  setEditQuoteId(null)
                  // Refresh business data if a business is currently selected
                  if (selectedBusiness) {
                    getBusinessRelatedData(selectedBusiness.id).then(data => {
                      setBusinessRelatedData(data)
                    })
                  }
                }} 
                searchTerm={searchTerm}
              />
            )}

            {activeTab === 'documents' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Document Management</h2>
                      <p className="text-gray-600 mt-1">Store and organize your business documents</p>
                    </div>
                    {hasPermission('canUploadDocument') && (
                      <Button onClick={() => setIsUploadDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Document
                      </Button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {documents.map((document) => (
                    <Card key={document.id} className="bg-white shadow-sm">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg font-semibold text-gray-900">{document.name}</CardTitle>
                            <CardDescription className="text-sm text-gray-500">
                              {document.category}
                            </CardDescription>
                          </div>
                          <Badge variant={document.status === 'Active' ? 'default' : 'secondary'}>
                            {document.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">Uploaded By</span>
                            <span className="text-sm text-gray-900">{document.uploadedBy}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">Size</span>
                            <span className="text-sm text-gray-900">{document.size}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">Uploaded</span>
                            <span className="text-sm text-gray-900">
                              {formatDate(document.uploadedAt)}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'messages' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Messages</h2>
                      <p className="text-gray-600 mt-1">Communicate with your team and clients</p>
                    </div>
                    <Button onClick={() => setIsSendMessageOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                      <Send className="h-4 w-4 mr-2" />
                      New Message
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  {messages.map((message) => (
                    <Card key={message.id} className="bg-white shadow-sm">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg font-semibold text-gray-900">{message.subject}</CardTitle>
                            <CardDescription className="text-sm text-gray-500">
                              From: {message.senderName} • To: {message.recipientName}
                            </CardDescription>
                          </div>
                          <Badge variant={message.status === 'Read' ? 'default' : 'secondary'}>
                            {message.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600 mb-3">{message.content}</p>
                        <div className="flex justify-between items-center text-sm text-gray-500">
                          <span>Sent: {formatDate(message.timestamp)}</span>
                          <Button variant="outline" size="sm">Reply</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <AnalyticsDashboard />
            )}

            {activeTab === 'activity-logs' && (
              <ActivityLogsPage />
            )}

            {activeTab === 'emergency-control' && (
              <EmergencyControlPage />
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
                    <p className="text-gray-600 mt-1">Configure your BusinessHub preferences</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-white shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold text-gray-900">General Settings</CardTitle>
                      <CardDescription>Basic application configuration</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="notifications">Email Notifications</Label>
                          <p className="text-sm text-gray-500">Receive email notifications</p>
                        </div>
                        <Switch id="notifications" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="dark-mode">Dark Mode</Label>
                          <p className="text-sm text-gray-500">Enable dark theme</p>
                        </div>
                        <Switch id="dark-mode" />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="auto-save">Auto Save</Label>
                          <p className="text-sm text-gray-500">Automatically save changes</p>
                        </div>
                        <Switch id="auto-save" defaultChecked />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold text-gray-900">Security Settings</CardTitle>
                      <CardDescription>Manage your account security</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="two-factor">Two-Factor Authentication</Label>
                          <p className="text-sm text-gray-500">Add an extra layer of security</p>
                        </div>
                        <Switch id="two-factor" />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="session-timeout">Session Timeout</Label>
                          <p className="text-sm text-gray-500">Automatically log out after inactivity</p>
                        </div>
                        <Switch id="session-timeout" defaultChecked />
                      </div>
                      <Button variant="outline" className="w-full">
                        Change Password
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Add Business Dialog */}
      <Dialog open={isAddBusinessOpen} onOpenChange={setIsAddBusinessOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Business</DialogTitle>
            <DialogDescription>
              Create a new business profile in your directory
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="business-name">Business Name</Label>
              <Input
                id="business-name"
                value={newBusiness.name}
                onChange={(e) => setNewBusiness({ ...newBusiness, name: e.target.value })}
                placeholder="Enter business name"
              />
            </div>
            <div>
              <Label htmlFor="business-category">Category</Label>
              <Select value={newBusiness.category} onValueChange={(value) => setNewBusiness({ ...newBusiness, category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.filter(c => c !== 'All Categories').map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label htmlFor="business-description">Description</Label>
              <Textarea
                id="business-description"
                value={newBusiness.description}
                onChange={(e) => setNewBusiness({ ...newBusiness, description: e.target.value })}
                placeholder="Enter business description"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="business-location">Location</Label>
              <Input
                id="business-location"
                value={newBusiness.location}
                onChange={(e) => setNewBusiness({ ...newBusiness, location: e.target.value })}
                placeholder="Enter location"
              />
            </div>
            <div>
              <Label htmlFor="business-phone">Phone</Label>
              <Input
                id="business-phone"
                value={newBusiness.phone}
                onChange={(e) => setNewBusiness({ ...newBusiness, phone: e.target.value })}
                placeholder="Enter phone number"
              />
            </div>
            <div>
              <Label htmlFor="business-email">Email</Label>
              <Input
                id="business-email"
                type="email"
                value={newBusiness.email}
                onChange={(e) => setNewBusiness({ ...newBusiness, email: e.target.value })}
                placeholder="Enter email address"
              />
            </div>
            <div>
              <Label htmlFor="business-website">Website</Label>
              <Input
                id="business-website"
                value={newBusiness.website}
                onChange={(e) => setNewBusiness({ ...newBusiness, website: e.target.value })}
                placeholder="Enter website URL"
              />
            </div>
            <div>
              <Label htmlFor="business-status">Status</Label>
              <Select value={newBusiness.status} onValueChange={(value) => setNewBusiness({ ...newBusiness, status: value })}>
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
            <div className="col-span-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="support-contract"
                  checked={newBusiness.supportContract}
                  onCheckedChange={(checked) => setNewBusiness({ ...newBusiness, supportContract: checked })}
                />
                <Label htmlFor="support-contract">Support Contract</Label>
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setIsAddBusinessOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddBusiness}>
              Add Business
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add User Dialog */}
      <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Create a new user account
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="user-name">Name</Label>
              <Input
                id="user-name"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                placeholder="Enter user name"
              />
            </div>
            <div>
              <Label htmlFor="user-email">Email</Label>
              <Input
                id="user-email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                placeholder="Enter email address"
              />
            </div>
            <div>
              <Label htmlFor="user-password">Password</Label>
              <Input
                id="user-password"
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                placeholder="Enter password"
              />
            </div>
            <div>
              <Label htmlFor="user-role">Role</Label>
              <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="User">User</SelectItem>
                  <SelectItem value="Manager">Manager</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="user-status">Status</Label>
              <Select value={newUser.status} onValueChange={(value) => setNewUser({ ...newUser, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="user-color">Color</Label>
              <Input
                id="user-color"
                type="color"
                value={newUser.color}
                onChange={(e) => setNewUser({ ...newUser, color: e.target.value })}
                className="h-10 w-full"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setIsAddUserOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddUser}>
              Add User
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Upload Document Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>
              Upload a file to your document library
            </DialogDescription>
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
              <Label htmlFor="upload-category">Category</Label>
              <Select value={uploadCategory} onValueChange={setUploadCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="General">General</SelectItem>
                  <SelectItem value="Contracts">Contracts</SelectItem>
                  <SelectItem value="Invoices">Invoices</SelectItem>
                  <SelectItem value="Reports">Reports</SelectItem>
                  <SelectItem value="Presentations">Presentations</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleFileUpload}>
              Upload
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Send Message Dialog */}
      <Dialog open={isSendMessageOpen} onOpenChange={setIsSendMessageOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Send Message</DialogTitle>
            <DialogDescription>
              Send a message to a team member
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="message-recipient">Recipient</Label>
              <Select value={messageData.recipient} onValueChange={(value) => setMessageData({ ...messageData, recipient: value })}>
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
                onChange={(e) => setMessageData({ ...messageData, subject: e.target.value })}
                placeholder="Enter subject"
              />
            </div>
            <div>
              <Label htmlFor="message-content">Message</Label>
              <Textarea
                id="message-content"
                value={messageData.content}
                onChange={(e) => setMessageData({ ...messageData, content: e.target.value })}
                placeholder="Enter your message"
                rows={4}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setIsSendMessageOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendMessage}>
              Send
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Business Dialog */}
      <Dialog open={isViewBusinessOpen} onOpenChange={setIsViewBusinessOpen}>
        <DialogContent className="!w-[50vw] !max-w-none max-h-[95vh] overflow-hidden p-8" style={{ width: '50vw' }}>
          <DialogHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-xl font-bold text-gray-900">{selectedBusiness?.name}</DialogTitle>
                <DialogDescription className="text-gray-600 mt-1">{selectedBusiness?.description}</DialogDescription>
              </div>
              <div className="flex items-center space-x-3">
                <Badge className={selectedBusiness?.supportContract ? "bg-green-100 text-green-800 hover:bg-green-200 px-4 py-2 text-sm" : "bg-red-100 text-red-800 hover:bg-red-200 px-4 py-2 text-sm"}>
                  {selectedBusiness?.supportContract ? "Support Contract" : "No Support"}
                </Badge>
              </div>
            </div>
          </DialogHeader>
          
          <Tabs value={businessOverviewActiveTab} onValueChange={setBusinessOverviewActiveTab} className="mt-4">
            <TabsList className="grid w-full grid-cols-6 h-10">
              <TabsTrigger value="overview" className="text-sm font-medium py-2">Overview</TabsTrigger>
              <TabsTrigger value="contacts" className="text-sm font-medium py-2">Contacts</TabsTrigger>
              <TabsTrigger value="tasks" className="text-sm font-medium py-2">Tasks</TabsTrigger>
              <TabsTrigger value="quotes" className="text-sm font-medium py-2">Quotes</TabsTrigger>
              <TabsTrigger value="notes" className="text-sm font-medium py-2">Notes</TabsTrigger>
              <TabsTrigger value="products" className="text-sm font-medium py-2">Products</TabsTrigger>
            </TabsList>
            
            <div className="mt-4 max-h-[70vh] overflow-y-auto">
              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-8">
                {/* Business Information Section */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                    <Building2 className="h-5 w-5 mr-2 text-blue-600" />
                    Business Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                      <div className="flex items-center mb-2">
                        <div className="p-2 bg-blue-100 rounded-lg mr-3">
                          <FolderOpen className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Category</Label>
                          <p className="text-sm font-semibold text-gray-900">{selectedBusiness?.category || 'Uncategorized'}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                      <div className="flex items-center mb-2">
                        <div className="p-2 bg-green-100 rounded-lg mr-3">
                          <MapPin className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Location</Label>
                          <p className="text-sm font-semibold text-gray-900">{selectedBusiness?.location || 'No location specified'}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                      <div className="flex items-center mb-2">
                        <div className="p-2 bg-purple-100 rounded-lg mr-3">
                          <Phone className="h-4 w-4 text-purple-600" />
                        </div>
                        <div>
                          <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Phone</Label>
                          <p className="text-sm font-semibold text-gray-900">{selectedBusiness?.phone || 'No phone specified'}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                      <div className="flex items-center mb-2">
                        <div className="p-2 bg-red-100 rounded-lg mr-3">
                          <Mail className="h-4 w-4 text-red-600" />
                        </div>
                        <div>
                          <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Email</Label>
                          <p className="text-sm font-semibold text-gray-900">{selectedBusiness?.email || 'No email specified'}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                      <div className="flex items-center mb-2">
                        <div className="p-2 bg-indigo-100 rounded-lg mr-3">
                          <Globe className="h-4 w-4 text-indigo-600" />
                        </div>
                        <div>
                          <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Website</Label>
                          <p className="text-sm font-semibold text-gray-900">{selectedBusiness?.website || 'No website specified'}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                      <div className="flex items-center mb-2">
                        <div className="p-2 bg-yellow-100 rounded-lg mr-3">
                          <CheckCircle className="h-4 w-4 text-yellow-600" />
                        </div>
                        <div>
                          <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</Label>
                          <p className="text-sm font-semibold text-gray-900">{selectedBusiness?.status || 'Active'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Stats Overview */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                  <Card 
                    className="bg-white shadow-sm hover:shadow-lg transition-all duration-200 border border-gray-100 cursor-pointer group"
                    onClick={() => setBusinessOverviewActiveTab('contacts')}
                  >
                    <CardContent className="p-8">
                      <div className="flex flex-col items-center text-center">
                        <div className="p-3 bg-blue-100 rounded-xl mb-4">
                          <Users className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Contacts</p>
                          <p className="text-3xl font-bold text-blue-600 mt-1">{businessRelatedData.contacts.length}</p>
                        </div>
                      </div>
                      <div className="mt-6">
                        <div className="flex items-center justify-center text-xs text-blue-600 group-hover:text-blue-700 transition-colors">
                          <Eye className="h-3 w-3 mr-1" />
                          View all contacts
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card 
                    className="bg-white shadow-sm hover:shadow-lg transition-all duration-200 border border-gray-100 cursor-pointer group"
                    onClick={() => setBusinessOverviewActiveTab('tasks')}
                  >
                    <CardContent className="p-8">
                      <div className="flex flex-col items-center text-center">
                        <div className="p-3 bg-green-100 rounded-xl mb-4">
                          <CheckSquare className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Tasks</p>
                          <p className="text-3xl font-bold text-green-600 mt-1">{businessRelatedData.tasks.length}</p>
                        </div>
                      </div>
                      <div className="mt-6">
                        <div className="flex items-center justify-center text-xs text-green-600 group-hover:text-green-700 transition-colors">
                          <Eye className="h-3 w-3 mr-1" />
                          View all tasks
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card 
                    className="bg-white shadow-sm hover:shadow-lg transition-all duration-200 border border-gray-100 cursor-pointer group"
                    onClick={() => setBusinessOverviewActiveTab('products')}
                  >
                    <CardContent className="p-8">
                      <div className="flex flex-col items-center text-center">
                        <div className="p-3 bg-purple-100 rounded-xl mb-4">
                          <Package className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Products</p>
                          <p className="text-3xl font-bold text-purple-600 mt-1">{businessRelatedData.products.length}</p>
                        </div>
                      </div>
                      <div className="mt-6">
                        <div className="flex items-center justify-center text-xs text-purple-600 group-hover:text-purple-700 transition-colors">
                          <Eye className="h-3 w-3 mr-1" />
                          View all products
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card 
                    className="bg-white shadow-sm hover:shadow-lg transition-all duration-200 border border-gray-100 cursor-pointer group"
                    onClick={() => setBusinessOverviewActiveTab('notes')}
                  >
                    <CardContent className="p-8">
                      <div className="flex flex-col items-center text-center">
                        <div className="p-3 bg-orange-100 rounded-xl mb-4">
                          <FileText className="h-6 w-6 text-orange-600" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Notes</p>
                          <p className="text-3xl font-bold text-orange-600 mt-1">{businessRelatedData.notes.length}</p>
                        </div>
                      </div>
                      <div className="mt-6">
                        <div className="flex items-center justify-center text-xs text-orange-600 group-hover:text-orange-700 transition-colors">
                          <Eye className="h-3 w-3 mr-1" />
                          View all notes
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Support Contract Banner */}
                <Card className="border-0 shadow-sm overflow-hidden">
                  <CardContent className="p-0">
                    {selectedBusiness?.supportContract ? (
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                        <div className="p-8">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="p-3 bg-green-100 rounded-full">
                                <CheckCircle className="h-6 w-6 text-green-600" />
                              </div>
                              <div>
                                <h4 className="text-lg font-bold text-green-800">Active Support Contract</h4>
                                <p className="text-sm text-green-700 mt-1">
                                  This business has an active support contract.
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <span className="text-sm text-green-600 font-medium">Active</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-lg">
                        <div className="p-8">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="p-3 bg-red-100 rounded-full">
                                <X className="h-6 w-6 text-red-600" />
                              </div>
                              <div>
                                <h4 className="text-lg font-bold text-red-800">No Active Support Contract</h4>
                                <p className="text-sm text-red-700 mt-1">
                                  This business does not have an active support contract.
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <span className="text-sm text-red-600 font-medium">Inactive</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Contacts Tab */}
              <TabsContent value="contacts" className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">Business Contacts</h3>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setIsAddContactOpen(true)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Contact
                      </Button>
                    </div>
                    
                    {businessRelatedData.contacts.length > 0 ? (
                      <div className="space-y-3">
                        {businessRelatedData.contacts.map((contact) => (
                          <Card key={contact.id} className="bg-white shadow-sm">
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-medium text-gray-900">{contact.name}</h4>
                                  <p className="text-sm text-gray-500">{contact.position}</p>
                                  <div className="mt-2 space-y-1">
                                    {contact.email && (
                                      <p className="text-sm text-gray-600">
                                        <Mail className="h-3 w-3 inline mr-1" />
                                        {contact.email}
                                      </p>
                                    )}
                                    {contact.phone && (
                                      <p className="text-sm text-gray-600">
                                        <Phone className="h-3 w-3 inline mr-1" />
                                        {contact.phone}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex space-x-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditContact(contact)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteContact(contact.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">No contacts found</p>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="tasks" className="mt-4">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">Related Tasks</h3>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          // Add task functionality here
                          toast.info('Add Task functionality would be implemented here')
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Task
                      </Button>
                    </div>
                    
                    {businessRelatedData.tasks.length > 0 ? (
                      <div className="space-y-3">
                        {businessRelatedData.tasks.map((task) => (
                          <Card key={task.id} className="bg-white shadow-sm">
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-medium text-gray-900">{task.title}</h4>
                                  <p className="text-sm text-gray-600">{task.description}</p>
                                  <div className="flex items-center mt-2 space-x-4">
                                    <Badge variant="outline">{task.priority}</Badge>
                                    <Badge variant={task.status === 'Completed' ? 'default' : 'secondary'}>
                                      {task.status}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">No tasks found</p>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="quotes" className="mt-4">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Related Quotes</h3>
                    
                    {businessRelatedData.quotes.length > 0 ? (
                      <div className="space-y-3">
                        {businessRelatedData.quotes.map((quote) => (
                          <Card key={quote.id} className="bg-white shadow-sm hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                              <div className="space-y-3">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-gray-900 truncate">{quote.title}</h4>
                                    <div className="flex items-center gap-2 mt-2">
                                      <Building2 className="h-4 w-4 text-gray-500" />
                                      <span className="text-sm text-gray-600 truncate">{quote.business?.name || selectedBusiness?.name}</span>
                                    </div>
                                  </div>
                                  <div className="flex flex-col items-end gap-2">
                                    <Badge variant={quote.status === 'Accepted' ? 'default' : 'secondary'}>
                                      {quote.status}
                                    </Badge>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm">
                                          <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => handleViewQuote(quote)}>
                                          <Eye className="h-4 w-4 mr-2" />
                                          View
                                        </DropdownMenuItem>
                                        {hasPermission('canEditQuote') && (
                                          <DropdownMenuItem onClick={() => handleEditQuote(quote)}>
                                            <Edit className="h-4 w-4 mr-2" />
                                            Edit
                                          </DropdownMenuItem>
                                        )}
                                        {hasPermission('canDeleteQuote') && (
                                          <DropdownMenuItem 
                                            onClick={() => setDeleteQuoteDialog({ open: true, quoteId: quote.id })}
                                            className="text-red-600"
                                          >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Delete
                                          </DropdownMenuItem>
                                        )}
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                </div>
                                
                                {quote.description && (
                                  <p className="text-sm text-gray-600 line-clamp-2">{quote.description}</p>
                                )}
                                
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-gray-500" />
                                    <span className="text-sm text-gray-600">{formatDate(quote.createdAt)}</span>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-lg font-semibold text-gray-900">
                                      £{quote.totalAmount?.toLocaleString()}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {quote.items?.length || 0} items
                                    </p>
                                  </div>
                                </div>

                                {quote.user && (
                                  <div className="flex items-center gap-2 pt-2 border-t">
                                    <User className="h-4 w-4 text-gray-500" />
                                    <span className="text-sm text-gray-600">{quote.user.name}</span>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">No quotes found</p>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="notes" className="mt-4">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">Business Notes</h3>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setIsAddNoteOpen(true)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Note
                      </Button>
                    </div>
                    
                    {businessRelatedData.notes.length > 0 ? (
                      <div className="space-y-3">
                        {businessRelatedData.notes.map((note) => (
                          <Card key={note.id} className="bg-white shadow-sm">
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <h4 className="font-medium text-gray-900">{note.title}</h4>
                                  <p className="text-sm text-gray-600 mt-1">{note.content}</p>
                                  <p className="text-xs text-gray-500 mt-2">
                                    {formatDate(note.createdAt)}
                                  </p>
                                </div>
                                <div className="flex space-x-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditNote(note)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteNote(note.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">No notes found</p>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="products" className="mt-4">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">Related Products</h3>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleOpenAssignProduct(selectedBusiness)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Products
                      </Button>
                    </div>
                    
                    {businessRelatedData.products.length > 0 ? (
                      <div className="space-y-3">
                        {businessRelatedData.products.map((product) => (
                          <Card key={product.id} className="bg-white shadow-sm">
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <h4 className="font-medium text-gray-900">{product.name}</h4>
                                  <p className="text-sm text-gray-600">{product.description}</p>
                                  <p className="text-sm font-medium text-gray-900 mt-1">£{product.price}</p>
                                  <div className="flex items-center mt-2 space-x-4">
                                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">{product.category}</Badge>
                                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                                      {product.pricingType || 'one-off'}
                                    </Badge>
                                  </div>
                                </div>
                                <div className="flex space-x-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setRemoveProductDialog({
                                        open: true,
                                        businessId: selectedBusiness.id,
                                        productId: product.id
                                      })
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">No products found</p>
                    )}
                  </div>
                </TabsContent>
            </div>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Edit Business Dialog */}
      <Dialog open={isEditBusinessOpen} onOpenChange={setIsEditBusinessOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Business</DialogTitle>
            <DialogDescription>
              Update business information
            </DialogDescription>
          </DialogHeader>
          {selectedBusiness && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-business-name">Business Name</Label>
                <Input
                  id="edit-business-name"
                  value={selectedBusiness.name}
                  onChange={(e) => setSelectedBusiness({ ...selectedBusiness, name: e.target.value })}
                  placeholder="Enter business name"
                />
              </div>
              <div>
                <Label htmlFor="edit-business-category">Category</Label>
                <Select value={selectedBusiness.category} onValueChange={(value) => setSelectedBusiness({ ...selectedBusiness, category: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.filter(c => c !== 'All Categories').map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label htmlFor="edit-business-description">Description</Label>
                <Textarea
                  id="edit-business-description"
                  value={selectedBusiness.description}
                  onChange={(e) => setSelectedBusiness({ ...selectedBusiness, description: e.target.value })}
                  placeholder="Enter business description"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="edit-business-location">Location</Label>
                <Input
                  id="edit-business-location"
                  value={selectedBusiness.location}
                  onChange={(e) => setSelectedBusiness({ ...selectedBusiness, location: e.target.value })}
                  placeholder="Enter location"
                />
              </div>
              <div>
                <Label htmlFor="edit-business-phone">Phone</Label>
                <Input
                  id="edit-business-phone"
                  value={selectedBusiness.phone}
                  onChange={(e) => setSelectedBusiness({ ...selectedBusiness, phone: e.target.value })}
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <Label htmlFor="edit-business-email">Email</Label>
                <Input
                  id="edit-business-email"
                  type="email"
                  value={selectedBusiness.email}
                  onChange={(e) => setSelectedBusiness({ ...selectedBusiness, email: e.target.value })}
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <Label htmlFor="edit-business-website">Website</Label>
                <Input
                  id="edit-business-website"
                  value={selectedBusiness.website}
                  onChange={(e) => setSelectedBusiness({ ...selectedBusiness, website: e.target.value })}
                  placeholder="Enter website URL"
                />
              </div>
              <div>
                <Label htmlFor="edit-business-status">Status</Label>
                <Select value={selectedBusiness.status} onValueChange={(value) => setSelectedBusiness({ ...selectedBusiness, status: value })}>
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
              <div className="col-span-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="edit-support-contract"
                    checked={selectedBusiness.supportContract}
                    onCheckedChange={(checked) => setSelectedBusiness({ ...selectedBusiness, supportContract: checked })}
                  />
                  <Label htmlFor="edit-support-contract">Support Contract</Label>
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setIsEditBusinessOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateBusiness}>
              Update Business
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Assign Product Dialog */}
      <Dialog open={isAssignProductOpen} onOpenChange={setIsAssignProductOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-xl font-bold text-gray-900 flex items-center">
                  <Package className="h-5 w-5 mr-2 text-purple-600" />
                  Assign Products
                </DialogTitle>
                <DialogDescription className="text-gray-600 mt-1">
                  Select products to assign to {selectedBusiness?.name}
                </DialogDescription>
              </div>
              <div className="bg-purple-100 px-3 py-1 rounded-full">
                <span className="text-sm font-medium text-purple-700">
                  {selectedProducts.length} selected
                </span>
              </div>
            </div>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Search and Filter Section */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search products..."
                      className="pl-10 bg-white border-gray-200"
                    />
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>

            {/* Products List */}
            <div className="bg-white border border-gray-200 rounded-lg">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-900">Available Products</h4>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        const allProductIds = availableProducts.map(p => p.id)
                        setSelectedProducts(allProductIds)
                      }}
                    >
                      Select All
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setSelectedProducts([])
                      }}
                    >
                      Clear All
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="max-h-96 overflow-y-auto">
                {availableProducts.length > 0 ? (
                  <div className="divide-y divide-gray-200">
                    {availableProducts.map((product) => (
                      <div key={product.id} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start w-full">
                          <div className="flex-shrink-0 pt-1 pr-4">
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
                              className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <Label htmlFor={`product-${product.id}`} className="cursor-pointer">
                              <div className="flex items-start justify-between w-full">
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {product.name}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {product.category || 'Uncategorized'}
                                  </p>
                                </div>
                                <div className="flex-shrink-0 ml-auto text-right pl-8">
                                  <p className="text-sm font-bold text-purple-600">
                                    £{product.price?.toLocaleString()}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {product.pricingType || 'one-off'}
                                  </p>
                                </div>
                              </div>
                            </Label>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 text-center">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No products available</h3>
                    <p className="text-gray-600">Create products first to assign them to businesses.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Selected Products Summary */}
            {selectedProducts.length > 0 && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-purple-900 mb-3">Selected Products Summary</h4>
                <div className="space-y-2">
                  {selectedProducts.map((productId) => {
                    const product = availableProducts.find(p => p.id === productId)
                    return product ? (
                      <div key={productId} className="flex items-center justify-between bg-white p-2 rounded border border-purple-100">
                        <span className="text-sm text-gray-900">{product.name}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-purple-600">
                            £{product.price?.toLocaleString()}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedProducts(selectedProducts.filter(id => id !== productId))}
                            className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ) : null
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-500">
              {selectedProducts.length} product(s) selected
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => setIsAssignProductOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleAssignProducts}
                disabled={selectedProducts.length === 0}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300"
              >
                <Package className="h-4 w-4 mr-2" />
                Assign {selectedProducts.length} Product{selectedProducts.length !== 1 ? 's' : ''}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Contact Dialog */}
      <Dialog open={isAddContactOpen} onOpenChange={setIsAddContactOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900 flex items-center">
              <UserPlus className="h-5 w-5 mr-2 text-blue-600" />
              Add Contact
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Add a new contact for {selectedBusiness?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="contact-name" className="text-sm font-medium text-gray-700">Full Name</Label>
                <Input
                  id="contact-name"
                  value={newContact.name}
                  onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                  placeholder="Enter contact name"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="contact-position" className="text-sm font-medium text-gray-700">Position</Label>
                <Input
                  id="contact-position"
                  value={newContact.position}
                  onChange={(e) => setNewContact({ ...newContact, position: e.target.value })}
                  placeholder="Enter position"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="contact-email" className="text-sm font-medium text-gray-700">Email Address</Label>
                <Input
                  id="contact-email"
                  type="email"
                  value={newContact.email}
                  onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                  placeholder="Enter email address"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="contact-phone" className="text-sm font-medium text-gray-700">Phone Number</Label>
                <Input
                  id="contact-phone"
                  value={newContact.phone}
                  onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                  placeholder="Enter phone number"
                  className="mt-1"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setIsAddContactOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddContact} className="bg-blue-600 hover:bg-blue-700">
              <UserPlus className="h-4 w-4 mr-2" />
              Add Contact
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Contact Dialog */}
      <Dialog open={isEditContactOpen} onOpenChange={setIsEditContactOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900 flex items-center">
              <Edit className="h-5 w-5 mr-2 text-green-600" />
              Edit Contact
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Update contact information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-contact-name" className="text-sm font-medium text-gray-700">Full Name</Label>
                <Input
                  id="edit-contact-name"
                  value={newContact.name}
                  onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                  placeholder="Enter contact name"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="edit-contact-position" className="text-sm font-medium text-gray-700">Position</Label>
                <Input
                  id="edit-contact-position"
                  value={newContact.position}
                  onChange={(e) => setNewContact({ ...newContact, position: e.target.value })}
                  placeholder="Enter position"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="edit-contact-email" className="text-sm font-medium text-gray-700">Email Address</Label>
                <Input
                  id="edit-contact-email"
                  type="email"
                  value={newContact.email}
                  onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                  placeholder="Enter email address"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="edit-contact-phone" className="text-sm font-medium text-gray-700">Phone Number</Label>
                <Input
                  id="edit-contact-phone"
                  value={newContact.phone}
                  onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                  placeholder="Enter phone number"
                  className="mt-1"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setIsEditContactOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateContact} className="bg-green-600 hover:bg-green-700">
              <Edit className="h-4 w-4 mr-2" />
              Update Contact
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Note Dialog */}
      <Dialog open={isAddNoteOpen} onOpenChange={setIsAddNoteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Note</DialogTitle>
            <DialogDescription>
              Add a new note for {selectedBusiness?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="note-title">Title</Label>
              <Input
                id="note-title"
                value={newNote.title}
                onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                placeholder="Enter note title"
              />
            </div>
            <div>
              <Label htmlFor="note-content">Content</Label>
              <Textarea
                id="note-content"
                value={newNote.content}
                onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                placeholder="Enter note content"
                rows={4}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setIsAddNoteOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddNote}>
              Add Note
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Note Dialog */}
      <Dialog open={isEditNoteOpen} onOpenChange={setIsEditNoteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Note</DialogTitle>
            <DialogDescription>
              Update note content
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-note-title">Title</Label>
              <Input
                id="edit-note-title"
                value={newNote.title}
                onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                placeholder="Enter note title"
              />
            </div>
            <div>
              <Label htmlFor="edit-note-content">Content</Label>
              <Textarea
                id="edit-note-content"
                value={newNote.content}
                onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                placeholder="Enter note content"
                rows={4}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setIsEditNoteOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateNote}>
              Update Note
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialogs */}
      <ConfirmDialog
        open={deleteBusinessDialog.open}
        onOpenChange={(open) => setDeleteBusinessDialog({ ...deleteBusinessDialog, open })}
        title="Delete Business"
        description="Are you sure you want to delete this business? This action cannot be undone and will remove all associated data."
        onConfirm={confirmDeleteBusiness}
      />

      <ConfirmDialog
        open={removeProductDialog.open}
        onOpenChange={(open) => setRemoveProductDialog({ ...removeProductDialog, open })}
        title="Remove Product"
        description="Are you sure you want to remove this product from the business?"
        onConfirm={confirmRemoveProduct}
      />

      <ConfirmDialog
        open={deleteContactDialog.open}
        onOpenChange={(open) => setDeleteContactDialog({ ...deleteContactDialog, open })}
        title="Delete Contact"
        description="Are you sure you want to delete this contact?"
        onConfirm={confirmDeleteContact}
      />

      <ConfirmDialog
        open={deleteNoteDialog.open}
        onOpenChange={(open) => setDeleteNoteDialog({ ...deleteNoteDialog, open })}
        title="Delete Note"
        description="Are you sure you want to delete this note?"
        onConfirm={confirmDeleteNote}
      />

      <ConfirmDialog
        open={deleteQuoteDialog.open}
        onOpenChange={(open) => setDeleteQuoteDialog({ ...deleteQuoteDialog, open })}
        title="Delete Quote"
        description="Are you sure you want to delete this quote?"
        onConfirm={confirmDeleteQuote}
      />

      {/* View Quote Modal */}
      <Dialog open={isViewQuoteOpen} onOpenChange={setIsViewQuoteOpen}>
        <DialogContent className="!w-[50vw] !max-w-none max-h-[95vh] overflow-hidden p-8" style={{ width: '50vw' }}>
          <DialogHeader>
            <DialogTitle>Quote Details</DialogTitle>
            <DialogDescription>View quote information and items</DialogDescription>
          </DialogHeader>
          
          {selectedQuote && (
            <div className="space-y-6">
              {/* Header Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Quote Information</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-600">Title:</span>
                      <p className="font-medium">{selectedQuote.title}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Status:</span>
                      <div className="mt-1">
                        <Badge variant={selectedQuote.status === 'Accepted' ? 'default' : 'secondary'}>
                          {selectedQuote.status}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Created:</span>
                      <p className="font-medium">{formatDate(selectedQuote.createdAt)}</p>
                    </div>
                    {selectedQuote.description && (
                      <div>
                        <span className="text-sm text-gray-600">Description:</span>
                        <p className="font-medium">{selectedQuote.description}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Business Information</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-600">Business:</span>
                      <p className="font-medium">{selectedQuote.business?.name || 'N/A'}</p>
                    </div>
                    {selectedQuote.business?.email && (
                      <div>
                        <span className="text-sm text-gray-600">Email:</span>
                        <p className="font-medium">{selectedQuote.business.email}</p>
                      </div>
                    )}
                    {selectedQuote.business?.phone && (
                      <div>
                        <span className="text-sm text-gray-600">Phone:</span>
                        <p className="font-medium">{selectedQuote.business.phone}</p>
                      </div>
                    )}
                    {selectedQuote.business?.location && (
                      <div>
                        <span className="text-sm text-gray-600">Location:</span>
                        <p className="font-medium">{selectedQuote.business.location}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Quote Items */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Quote Items</h3>
                
                {/* Hardware Items */}
                {selectedQuote.items && selectedQuote.items.filter(item => item.product?.pricingType === 'one-off').length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <HardDrive className="h-5 w-5 text-blue-600" />
                      <h4 className="font-medium">Hardware (One-off)</h4>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedQuote.items
                          .filter(item => item.product?.pricingType === 'one-off')
                          .map((item) => (
                            <TableRow key={item.id}>
                              <TableCell className="font-medium">{item.product?.name || 'N/A'}</TableCell>
                              <TableCell>{item.product?.description || '-'}</TableCell>
                              <TableCell>{item.quantity}</TableCell>
                              <TableCell>{formatCurrency(item.price * item.quantity)}</TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>
                )}

                {/* Software Items */}
                {selectedQuote.items && selectedQuote.items.filter(item => item.product?.pricingType === 'monthly').length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Cloud className="h-5 w-5 text-green-600" />
                      <h4 className="font-medium">Software (Monthly)</h4>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Total/Month</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedQuote.items
                          .filter(item => item.product?.pricingType === 'monthly')
                          .map((item) => (
                            <TableRow key={item.id}>
                              <TableCell className="font-medium">{item.product?.name || 'N/A'}</TableCell>
                              <TableCell>{item.product?.description || '-'}</TableCell>
                              <TableCell>{item.quantity}</TableCell>
                              <TableCell>{formatCurrency(item.price * item.quantity)}</TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>
                )}

                {/* Quote Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quote Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedQuote.items && selectedQuote.items.filter(item => item.product?.pricingType === 'one-off').length > 0 && (
                        <div className="flex justify-between">
                          <span>Hardware Total:</span>
                          <span>{formatCurrency(
                            selectedQuote.items
                              .filter(item => item.product?.pricingType === 'one-off')
                              .reduce((sum, item) => sum + (item.price * item.quantity), 0)
                          )}</span>
                        </div>
                      )}
                      {selectedQuote.items && selectedQuote.items.filter(item => item.product?.pricingType === 'monthly').length > 0 && (
                        <div className="flex justify-between">
                          <span>Software Total:</span>
                          <span>{formatCurrency(
                            selectedQuote.items
                              .filter(item => item.product?.pricingType === 'monthly')
                              .reduce((sum, item) => sum + (item.price * item.quantity), 0)
                          )}/month</span>
                        </div>
                      )}
                      <Separator />
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>{formatCurrency(selectedQuote.totalAmount / 1.2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>VAT (20%):</span>
                        <span>{formatCurrency(selectedQuote.totalAmount - (selectedQuote.totalAmount / 1.2))}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-semibold text-lg">
                        <span>Total:</span>
                        <span>{formatCurrency(selectedQuote.totalAmount)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsViewQuoteOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Quote Modal */}
      <Dialog open={isEditQuoteOpen} onOpenChange={setIsEditQuoteOpen}>
        <DialogContent className="!w-[50vw] !max-w-none max-h-[90vh] overflow-hidden p-8" style={{ width: '50vw' }}>
          <DialogHeader>
            <DialogTitle>Edit Quote</DialogTitle>
            <DialogDescription>Update quote details and items</DialogDescription>
          </DialogHeader>
          
          {selectedQuote && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Quote Title</Label>
                  <Input
                    id="title"
                    value={quoteFormData.title}
                    onChange={(e) => setQuoteFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter quote title"
                  />
                </div>
                
                <div>
                  <Label htmlFor="business">Business</Label>
                  <Select 
                    value={quoteFormData.businessId} 
                    onValueChange={(value) => setQuoteFormData(prev => ({ ...prev, businessId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select business" />
                    </SelectTrigger>
                    <SelectContent>
                      {businesses.map((business) => (
                        <SelectItem key={business.id} value={business.id}>
                          {business.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={quoteFormData.description}
                  onChange={(e) => setQuoteFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter quote description"
                  rows={3}
                />
              </div>

              {/* Items Section */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Quote Items</h3>
                
                {/* Hardware Section */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <HardDrive className="h-5 w-5 text-blue-600" />
                    <h4 className="font-medium">Hardware (One-off)</h4>
                  </div>
                  
                  <div className="relative mb-3" ref={hardwareDropdownRef}>
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          placeholder="Search hardware products..."
                          value={hardwareSearchTerm}
                          onChange={(e) => setHardwareSearchTerm(e.target.value)}
                          onFocus={() => setShowHardwareDropdown(true)}
                          className="pl-10"
                        />
                      </div>
                      <Button 
                        variant="outline" 
                        onClick={() => setShowHardwareDropdown(!showHardwareDropdown)}
                      >
                        <Filter className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {showHardwareDropdown && hardwareProducts.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {hardwareProducts.map((product) => (
                          <div
                            key={product.id}
                            className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                            onClick={() => addProductToQuote(product, 'hardware')}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium">{product.name}</p>
                                {product.description && (
                                  <p className="text-sm text-gray-600">{product.description}</p>
                                )}
                                {product.sku && (
                                  <p className="text-xs text-gray-500">SKU: {product.sku}</p>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="font-medium">{formatCurrency(product.price)}</p>
                                <p className="text-xs text-gray-500">Stock: {product.stock}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    {quoteFormData.items
                      .filter(item => item.category === 'hardware')
                      .map((item, index) => {
                        const product = products.find(p => p.id === item.productId)
                        const originalIndex = quoteFormData.items.findIndex(i => 
                          i.productId === item.productId && i.category === 'hardware'
                        )
                        
                        return (
                          <div key={`${item.productId}-${index}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <p className="font-medium">{product?.name}</p>
                              <p className="text-sm text-gray-600">{formatCurrency(item.price)} each</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateQuoteItemQuantity(originalIndex, item.quantity - 1)}
                              >
                                <MinusCircle className="h-4 w-4" />
                              </Button>
                              <span className="w-12 text-center">{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateQuoteItemQuantity(originalIndex, item.quantity + 1)}
                              >
                                <PlusCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeQuoteItem(originalIndex)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )
                      })}
                  </div>
                </div>

                {/* Software Section */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Cloud className="h-5 w-5 text-green-600" />
                    <h4 className="font-medium">Software (Monthly)</h4>
                  </div>
                  
                  <div className="relative mb-3" ref={softwareDropdownRef}>
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          placeholder="Search software products..."
                          value={softwareSearchTerm}
                          onChange={(e) => setSoftwareSearchTerm(e.target.value)}
                          onFocus={() => setShowSoftwareDropdown(true)}
                          className="pl-10"
                        />
                      </div>
                      <Button 
                        variant="outline" 
                        onClick={() => setShowSoftwareDropdown(!showSoftwareDropdown)}
                      >
                        <Filter className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {showSoftwareDropdown && softwareProducts.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {softwareProducts.map((product) => (
                          <div
                            key={product.id}
                            className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                            onClick={() => addProductToQuote(product, 'software')}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium">{product.name}</p>
                                {product.description && (
                                  <p className="text-sm text-gray-600">{product.description}</p>
                                )}
                                {product.sku && (
                                  <p className="text-xs text-gray-500">SKU: {product.sku}</p>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="font-medium">{formatCurrency(product.price)}/month</p>
                                <p className="text-xs text-gray-500">Stock: {product.stock}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    {quoteFormData.items
                      .filter(item => item.category === 'software')
                      .map((item, index) => {
                        const product = products.find(p => p.id === item.productId)
                        const originalIndex = quoteFormData.items.findIndex(i => 
                          i.productId === item.productId && i.category === 'software'
                        )
                        
                        return (
                          <div key={`${item.productId}-${index}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <p className="font-medium">{product?.name}</p>
                              <p className="text-sm text-gray-600">{formatCurrency(item.price)}/month</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateQuoteItemQuantity(originalIndex, item.quantity - 1)}
                              >
                                <MinusCircle className="h-4 w-4" />
                              </Button>
                              <span className="w-12 text-center">{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateQuoteItemQuantity(originalIndex, item.quantity + 1)}
                              >
                                <PlusCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeQuoteItem(originalIndex)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )
                      })}
                  </div>
                </div>
              </div>

              {/* Quote Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Quote Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Hardware Total:</span>
                      <span>{formatCurrency(calculateQuoteTotals().hardwareTotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Software Total:</span>
                      <span>{formatCurrency(calculateQuoteTotals().softwareTotal)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(calculateQuoteTotals().subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>VAT (20%):</span>
                      <span>{formatCurrency(calculateQuoteTotals().vat)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total:</span>
                      <span>{formatCurrency(calculateQuoteTotals().total)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Status Selection */}
              <div>
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={quoteFormData.status} 
                  onValueChange={(value) => setQuoteFormData(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsEditQuoteOpen(false)
                    setSelectedQuote(null)
                    resetForm()
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleUpdateQuote}
                  disabled={!quoteFormData.title || !quoteFormData.businessId || quoteFormData.items.length === 0}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Update Quote
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteQuoteDialog.open}
        onOpenChange={(open) => setDeleteQuoteDialog({ ...deleteQuoteDialog, open })}
        title="Delete Quote"
        description="Are you sure you want to delete this quote? This action cannot be undone."
        onConfirm={confirmDeleteQuote}
      />
    </div>
  )
}