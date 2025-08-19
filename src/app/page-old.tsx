'use client'
// Force rebuild

import { useState, useEffect, useCallback, useRef } from 'react'
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
  FolderOpen
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
import { 
  MoreHorizontal, UserPlus, Edit, Trash2, Shield, Send, Reply, Paperclip, Download, Eye, Share, Calendar as CalendarIcon, Clock, CheckCircle, Circle, Inbox, Star, RefreshCw, Forward
} from 'lucide-react'

// FullCalendar imports
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import { formatDate } from '@fullcalendar/core'
import { EventClickArg, EventDropArg, DateSelectArg } from '@fullcalendar/core'

const navigation = [
  { name: 'Dashboard', href: '#', icon: Building2, tab: 'dashboard' },
  { name: 'Business Directory', href: '#', icon: Building2, tab: 'businesses' },
  { name: 'Inventory', href: '#', icon: Package, tab: 'inventory' },
  { name: 'Tasks', href: '#', icon: CalendarIcon, tab: 'tasks' },
  { name: 'Users', href: '#', icon: Users, tab: 'users', requiredPermission: 'canViewAllUsers' },
  { name: 'Quotes', href: '#', icon: FileSignature, tab: 'quotes' },
  { name: 'Documents', href: '#', icon: FolderOpen, tab: 'documents' },
  { name: 'Messages', href: '#', icon: MessageSquare, tab: 'messages' },
  { name: 'Analytics', href: '#', icon: BarChart3, tab: 'analytics', requiredPermission: 'canViewAnalytics' },
  { name: 'Settings', href: '#', icon: Settings, tab: 'settings', requiredPermission: 'canAccessSettings' },
]

const stats = [
  { name: 'Total Businesses', value: '1,234', change: '+12%', changeType: 'positive' },
  { name: 'Active Products', value: '456', change: '+23%', changeType: 'positive' },
  { name: 'Pending Quotes', value: '89', change: '+5%', changeType: 'positive' },
  { name: 'Active Tasks', value: '234', change: '+8%', changeType: 'positive' },
]

const productCategories = [
  'All Categories',
  'Hardware',
  'Software',
  'Services'
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

const analyticsData = {
  businessGrowth: [
    { month: 'Jan', businesses: 800, users: 3000 },
    { month: 'Feb', businesses: 950, users: 3800 },
    { month: 'Mar', businesses: 1100, users: 4500 },
    { month: 'Apr', businesses: 1234, users: 5678 },
    { month: 'May', businesses: 1400, users: 6200 },
    { month: 'Jun', businesses: 1580, users: 6800 }
  ],
  categoryDistribution: [
    { name: 'Technology', value: 35, color: '#3B82F6' },
    { name: 'Marketing', value: 20, color: '#10B981' },
    { name: 'Consulting', value: 15, color: '#F59E0B' },
    { name: 'Design', value: 12, color: '#EF4444' },
    { name: 'Legal', value: 10, color: '#8B5CF6' },
    { name: 'Healthcare', value: 8, color: '#06B6D4' }
  ],
  topLocations: [
    { location: 'San Francisco, CA', businesses: 245, growth: 15 },
    { location: 'New York, NY', businesses: 198, growth: 12 },
    { location: 'Los Angeles, CA', businesses: 176, growth: 18 },
    { location: 'Chicago, IL', businesses: 134, growth: 8 },
    { location: 'Boston, MA', businesses: 98, growth: 10 }
  ],
  engagementMetrics: [
    { metric: 'Profile Views', value: 45678, change: 23 },
    { metric: 'Messages Sent', value: 12345, change: 15 },
    { metric: 'Documents Shared', value: 5678, change: 8 },
    { metric: 'Active Users', value: 5678, change: 12 }
  ],
  revenueData: [
    { month: 'Jan', revenue: 45000, quotes: 45 },
    { month: 'Feb', revenue: 52000, quotes: 52 },
    { month: 'Mar', revenue: 48000, quotes: 48 },
    { month: 'Apr', revenue: 61000, quotes: 61 },
    { month: 'May', revenue: 58000, quotes: 58 },
    { month: 'Jun', revenue: 67000, quotes: 67 }
  ],
  performanceMetrics: {
    totalBusinesses: 1580,
    activeUsers: 6800,
    pendingQuotes: 89,
    conversionRate: 68,
    averageQuoteValue: 985,
    monthlyRecurringRevenue: 125000
  }
}

const messageCategories = [
  { name: 'All', count: 0 },
  { name: 'Unread', count: 0 },
  { name: 'Business', count: 0 },
  { name: 'Project', count: 0 },
  { name: 'Meeting', count: 0 }
]

const documentCategories = [
  { name: 'All', count: 0 },
  { name: 'Planning', count: 0 },
  { name: 'Marketing', count: 0 },
  { name: 'Finance', count: 0 },
  { name: 'Project', count: 0 },
  { name: 'HR', count: 0 },
  { name: 'Legal', count: 0 }
]

export default function BusinessHub() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [searchTerm, setSearchTerm] = useState('') // For individual page search functions
  const [selectedCategory, setSelectedCategory] = useState('All Categories')
  const [selectedLocation, setSelectedLocation] = useState('All Locations')
  const [selectedUserFilter, setSelectedUserFilter] = useState(null) // User filter for tasks
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]) // For bulk actions
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]) // For bulk task actions
  const [filteredBusinesses, setFilteredBusinesses] = useState<any[]>([])
  const [filteredUsers, setFilteredUsers] = useState<any[]>([])
  const [isAddBusinessOpen, setIsAddBusinessOpen] = useState(false)
  const [selectedBusiness, setSelectedBusiness] = useState(null)
  const [isViewBusinessOpen, setIsViewBusinessOpen] = useState(false)
  
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  
  // Role-based permissions - will be loaded from database
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
  const [roles, setRoles] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [documents, setDocuments] = useState<any[]>([])
  const [messages, setMessages] = useState<any[]>([])
  const [businessList, setBusinessList] = useState<any[]>([])
  const [quotes, setQuotes] = useState<any[]>([])
  const [taskSearchTerm, setTaskSearchTerm] = useState('') // Track task search term
  const [showSearchResults, setShowSearchResults] = useState(false) // Track search results dropdown visibility
  const [searchResults, setSearchResults] = useState<any[]>([]) // Track search results
  const [highlightedTaskId, setHighlightedTaskId] = useState(null) // Track highlighted task for navigation
  
  // FullCalendar state
  const calendarRef = useRef(null)
  const [calendarView, setCalendarView] = useState('dayGridMonth') // FullCalendar view type
  const [currentDate, setCurrentDate] = useState(new Date()) // Current date for navigation
  
  // User and role management state
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [isEditRoleOpen, setIsEditRoleOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState(null)
  const [selectedColorUser, setSelectedColorUser] = useState(null)
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploadCategory, setUploadCategory] = useState('General')
  
  // Business Directory enhanced state
  const [isEditBusinessOpen, setIsEditBusinessOpen] = useState(false)
  const [isAddContactOpen, setIsAddContactOpen] = useState(false)
  const [isEditContactOpen, setIsEditContactOpen] = useState(false)
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)
  const [isEditTaskOpen, setIsEditTaskOpen] = useState(false)
  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false)
  const [isEditNoteOpen, setIsEditNoteOpen] = useState(false)
  const [isAddProductOpen, setIsAddProductOpen] = useState(false)
  const [isEditProductOpen, setIsEditProductOpen] = useState(false)
  const [selectedContact, setSelectedContact] = useState(null)
  const [selectedTask, setSelectedTask] = useState(null)
  const [selectedNote, setSelectedNote] = useState(null)
  const [selectedProduct, setSelectedProduct] = useState(null)
  
  // Inventory state
  const [isAddInventoryProductOpen, setIsAddInventoryProductOpen] = useState(false)
  const [isEditInventoryProductOpen, setIsEditInventoryProductOpen] = useState(false)
  const [selectedInventoryProduct, setSelectedInventoryProduct] = useState(null)
  
  // Tasks state
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false)
  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false)
  const [selectedCalendarTask, setSelectedCalendarTask] = useState(null)
  const [selectedDate, setSelectedDate] = useState(null)
  const [taskRepeat, setTaskRepeat] = useState('none')
  const [taskAssignee, setTaskAssignee] = useState('')
  const [taskCompany, setTaskCompany] = useState('none') // Company assignment for calendar tasks
  const [customRepeatWeeks, setCustomRepeatWeeks] = useState(1) // Custom repeat interval
  
  // Quotes state
  const [isAddQuoteOpen, setIsAddQuoteOpen] = useState(false)
  const [isEditQuoteOpen, setIsEditQuoteOpen] = useState(false)
  const [isViewQuoteOpen, setIsViewQuoteOpen] = useState(false)
  const [selectedQuote, setSelectedQuote] = useState(null)
  
  // Form states
  const [newContact, setNewContact] = useState({ name: '', email: '', phone: '', position: '' })
  const [newTask, setNewTask] = useState({ title: '', description: '', status: 'Not Started', assignee: '' })
  const [newNote, setNewNote] = useState({ title: '', content: '' })
  const [newProduct, setNewProduct] = useState({ name: '', price: '', pricingType: 'one-off', category: '', sku: '' })
  const [newInventoryProduct, setNewInventoryProduct] = useState({ name: '', description: '', price: '', pricingType: 'one-off', category: '', sku: '' })
  const [newQuote, setNewQuote] = useState({ title: '', customer: '', items: [], total: 0 })
  
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'User',
    status: 'Active',
    color: '#3B82F6'
  })
  const [editingUser, setEditingUser] = useState(null)
  
  // Filter functions
  const filterBusinesses = useCallback(() => {
    let filtered = businessList

    if (searchTerm && activeTab === 'businesses') {
      filtered = filtered.filter(business =>
        business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        business.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        business.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedCategory !== 'All Categories') {
      filtered = filtered.filter(business => business.category === selectedCategory)
    }

    if (selectedLocation !== 'All Locations') {
      filtered = filtered.filter(business => business.location === selectedLocation)
    }

    setFilteredBusinesses(filtered)
  }, [businessList, searchTerm, selectedCategory, selectedLocation, activeTab])

  const filterUsers = useCallback(() => {
    let filtered = users

    if (searchTerm && activeTab === 'users') {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredUsers(filtered)
  }, [users, searchTerm, activeTab])
  
  // Task search function
  const filterTasksBySearch = useCallback((tasksToFilter) => {
    if (!taskSearchTerm.trim()) {
      return tasksToFilter
    }

    const searchLower = taskSearchTerm.toLowerCase()
    
    return tasksToFilter.filter(task => {
      // Search by title
      const titleMatch = task.title && task.title.toLowerCase().includes(searchLower)
      
      // Search by description
      const descriptionMatch = task.description && task.description.toLowerCase().includes(searchLower)
      
      // Search by business assigned (need to get business name)
      let businessMatch = false
      if (task.businessId) {
        const business = businessList.find(b => b.id === task.businessId)
        businessMatch = business && business.name.toLowerCase().includes(searchLower)
      }
      
      // Search by assignee name
      let assigneeMatch = false
      if (task.assignee && typeof task.assignee === 'object') {
        assigneeMatch = task.assignee.name && task.assignee.name.toLowerCase().includes(searchLower)
      } else if (task.assigneeId) {
        const user = users.find(u => u.id === task.assigneeId)
        assigneeMatch = user && user.name.toLowerCase().includes(searchLower)
      }
      
      return titleMatch || descriptionMatch || businessMatch || assigneeMatch
    })
  }, [taskSearchTerm, businessList, users])

  // Convert tasks to FullCalendar events
  const tasksToEvents = useCallback(() => {
    // Apply search filter if needed
    let tasksToProcess = tasks
    if (taskSearchTerm.trim()) {
      const searchLower = taskSearchTerm.toLowerCase()
      tasksToProcess = tasks.filter(task => {
        // Search by title
        const titleMatch = task.title && task.title.toLowerCase().includes(searchLower)
        
        // Search by description
        const descriptionMatch = task.description && task.description.toLowerCase().includes(searchLower)
        
        // Search by business assigned (need to get business name)
        let businessMatch = false
        if (task.businessId) {
          const business = businessList.find(b => b.id === task.businessId)
          businessMatch = business && business.name.toLowerCase().includes(searchLower)
        }
        
        // Search by assignee name
        let assigneeMatch = false
        if (task.assignee && typeof task.assignee === 'object') {
          assigneeMatch = task.assignee.name && task.assignee.name.toLowerCase().includes(searchLower)
        } else if (task.assigneeId) {
          const user = users.find(u => u.id === task.assigneeId)
          assigneeMatch = user && user.name.toLowerCase().includes(searchLower)
        }
        
        return titleMatch || descriptionMatch || businessMatch || assigneeMatch
      })
    }
    
    // Apply user filter if needed
    if (selectedUserFilter) {
      tasksToProcess = tasksToProcess.filter(task => 
        task.assigneeId === selectedUserFilter || 
        (task.assignee && task.assignee.id === selectedUserFilter)
      )
    }
    
    return tasksToProcess.map(task => {
      const assignee = users.find(u => u.id === task.assigneeId) || task.assignee
      const business = businessList.find(b => b.id === task.businessId)
      
      // Determine background color based on status and assignee
      let backgroundColor = assignee?.color || '#3B82F6'
      if (task.status === 'completed') {
        backgroundColor = '#DC2626'
      } else if (task.status === 'in-progress') {
        backgroundColor = '#2563EB'
      }
      
      return {
        id: String(task.id),
        title: task.title,
        start: task.startDate || task.due_date,
        allDay: true,
        backgroundColor: backgroundColor,
        borderColor: backgroundColor,
        textColor: 'white',
        extendedProps: {
          ...task,
          assignee: assignee,
          business: business
        }
      }
    })
  }, [tasks, users, businessList, taskSearchTerm, selectedUserFilter])

  // FullCalendar event handlers
  const handleDateSelect = (selectInfo: DateSelectArg) => {
    const selectedDate = selectInfo.startStr.split('T')[0]
    handleAddCalendarTask(selectedDate)
  }

  const handleEventClick = (clickInfo: EventClickArg) => {
    const task = clickInfo.event.extendedProps
    handleEditCalendarTask(task)
  }

  const handleEventDrop = async (dropInfo: EventDropArg) => {
    const task = dropInfo.event.extendedProps
    const newDate = dropInfo.event.startStr.split('T')[0]
    
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...task,
          startDate: newDate,
          due_date: newDate
        }),
      })

      if (response.ok) {
        const updatedTask = await response.json()
        setTasks(prevTasks => 
          prevTasks.map(t => t.id === task.id ? updatedTask : t)
        )
      } else {
        console.error('Failed to update task date')
        dropInfo.revert()
      }
    } catch (error) {
      console.error('Error updating task:', error)
      dropInfo.revert()
    }
  }

  const handleEventResize = async (resizeInfo: any) => {
    const task = resizeInfo.event.extendedProps
    const newEndDate = resizeInfo.event.endStr.split('T')[0]
    
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...task,
          endDate: newEndDate
        }),
      })

      if (response.ok) {
        const updatedTask = await response.json()
        setTasks(prevTasks => 
          prevTasks.map(t => t.id === task.id ? updatedTask : t)
        )
      } else {
        console.error('Failed to update task duration')
        resizeInfo.revert()
      }
    } catch (error) {
      console.error('Error updating task duration:', error)
      resizeInfo.revert()
    }
  }

  // Initialize sample data
  useEffect(() => {
    // Sample businesses
    const sampleBusinesses = [
      {
        id: 1,
        name: 'TechCorp Solutions',
        description: 'Leading technology solutions provider',
        category: 'Technology',
        location: 'San Francisco, CA',
        contacts: [
          { id: 1, name: 'John Smith', email: 'john@techcorp.com', phone: '+1-555-0123', position: 'CEO' },
          { id: 2, name: 'Jane Doe', email: 'jane@techcorp.com', phone: '+1-555-0124', position: 'CTO' }
        ],
        tasks: [
          { id: 1, title: 'Review Q4 Strategy', description: 'Annual strategy review meeting', status: 'Not Started', assigneeId: 1, startDate: '2024-01-15', businessId: 1 },
          { id: 2, title: 'Product Launch', description: 'New product launch preparation', status: 'in-progress', assigneeId: 2, startDate: '2024-01-20', businessId: 1 }
        ],
        notes: [
          { id: 1, title: 'Initial Meeting', content: 'Discussed potential partnership opportunities', date: '2024-01-10' }
        ],
        products: [
          { id: 1, name: 'Cloud Platform', price: 999, pricingType: 'monthly', category: 'Software', sku: 'CP-001' }
        ]
      },
      {
        id: 2,
        name: 'Green Energy Co',
        description: 'Sustainable energy solutions',
        category: 'Healthcare',
        location: 'New York, NY',
        contacts: [
          { id: 3, name: 'Mike Johnson', email: 'mike@greenenergy.com', phone: '+1-555-0125', position: 'Founder' }
        ],
        tasks: [
          { id: 3, title: 'Site Survey', description: 'Conduct site survey for new installation', status: 'completed', assigneeId: 3, startDate: '2024-01-12', businessId: 2 }
        ],
        notes: [],
        products: []
      }
    ]

    // Sample users
    const sampleUsers = [
      { id: 1, name: 'Alice Johnson', email: 'alice@company.com', role: 'Admin', status: 'Active', color: '#3B82F6' },
      { id: 2, name: 'Bob Smith', email: 'bob@company.com', role: 'Manager', status: 'Active', color: '#10B981' },
      { id: 3, name: 'Carol Williams', email: 'carol@company.com', role: 'User', status: 'Active', color: '#F59E0B' }
    ]

    // Sample tasks
    const sampleTasks = [
      { id: 1, title: 'Review Q4 Strategy', description: 'Annual strategy review meeting', status: 'Not Started', assigneeId: 1, startDate: '2024-01-15', businessId: 1 },
      { id: 2, title: 'Product Launch', description: 'New product launch preparation', status: 'in-progress', assigneeId: 2, startDate: '2024-01-20', businessId: 1 },
      { id: 3, title: 'Site Survey', description: 'Conduct site survey for new installation', status: 'completed', assigneeId: 3, startDate: '2024-01-12', businessId: 2 },
      { id: 4, title: 'Team Meeting', description: 'Weekly team sync', status: 'Not Started', assigneeId: 1, startDate: '2024-01-25', businessId: null },
      { id: 5, title: 'Code Review', description: 'Review pull requests', status: 'in-progress', assigneeId: 2, startDate: '2024-01-18', businessId: null }
    ]

    // Sample products
    const sampleProducts = [
      { id: 1, name: 'Laptop Pro', description: 'High-performance laptop', price: 1299, pricingType: 'one-off', category: 'Hardware', sku: 'LP-001' },
      { id: 2, name: 'Software Suite', description: 'Complete software package', price: 99, pricingType: 'monthly', category: 'Software', sku: 'SS-001' },
      { id: 3, name: 'Consulting Service', description: 'Professional consulting', price: 150, pricingType: 'hourly', category: 'Services', sku: 'CS-001' }
    ]

    // Sample quotes
    const sampleQuotes = [
      { id: 1, number: 'Q001', customer: 'TechCorp Solutions', amount: 5000, status: 'Pending', created: '2024-01-10' },
      { id: 2, number: 'Q002', customer: 'Green Energy Co', amount: 3500, status: 'Accepted', created: '2024-01-12' },
      { id: 3, number: 'Q003', customer: 'Startup Inc', amount: 8000, status: 'Draft', created: '2024-01-15' }
    ]

    setBusinessList(sampleBusinesses)
    setUsers(sampleUsers)
    setTasks(sampleTasks)
    setProducts(sampleProducts)
    setQuotes(sampleQuotes)
    setFilteredBusinesses(sampleBusinesses)
    setFilteredUsers(sampleUsers)
    
    // Set current user as first user for demo
    setCurrentUser(sampleUsers[0])
    setIsAuthenticated(true)
  }, [])

  // Apply filters when dependencies change
  useEffect(() => {
    filterBusinesses()
    filterUsers()
  }, [filterBusinesses, filterUsers])

  // Handle task search
  useEffect(() => {
    if (taskSearchTerm.trim()) {
      const searchLower = taskSearchTerm.toLowerCase()
      const filtered = tasks.filter(task => {
        // Search by title
        const titleMatch = task.title && task.title.toLowerCase().includes(searchLower)
        
        // Search by description
        const descriptionMatch = task.description && task.description.toLowerCase().includes(searchLower)
        
        // Search by business assigned (need to get business name)
        let businessMatch = false
        if (task.businessId) {
          const business = businessList.find(b => b.id === task.businessId)
          businessMatch = business && business.name.toLowerCase().includes(searchLower)
        }
        
        // Search by assignee name
        let assigneeMatch = false
        if (task.assignee && typeof task.assignee === 'object') {
          assigneeMatch = task.assignee.name && task.assignee.name.toLowerCase().includes(searchLower)
        } else if (task.assigneeId) {
          const user = users.find(u => u.id === task.assigneeId)
          assigneeMatch = user && user.name.toLowerCase().includes(searchLower)
        }
        
        return titleMatch || descriptionMatch || businessMatch || assigneeMatch
      })
      setSearchResults(filtered)
      setShowSearchResults(true)
    } else {
      setShowSearchResults(false)
      setSearchResults([])
    }
  }, [taskSearchTerm, tasks, businessList, users])

  // Business handlers
  const handleAddBusiness = () => {
    setSelectedBusiness(null)
    setIsAddBusinessOpen(true)
  }

  const handleEditBusiness = (business) => {
    setSelectedBusiness(business)
    setIsEditBusinessOpen(true)
  }

  const handleViewBusiness = (business) => {
    setSelectedBusiness(business)
    setIsViewBusinessOpen(true)
  }

  const handleDeleteBusiness = async (businessId) => {
    if (confirm('Are you sure you want to delete this business?')) {
      setBusinessList(prev => prev.filter(b => b.id !== businessId))
    }
  }

  const handleSaveBusiness = (businessData) => {
    if (selectedBusiness) {
      // Update existing business
      setBusinessList(prev => prev.map(b => b.id === selectedBusiness.id ? { ...selectedBusiness, ...businessData } : b))
    } else {
      // Add new business
      const newBusiness = {
        id: Math.max(...businessList.map(b => b.id), 0) + 1,
        ...businessData,
        contacts: [],
        tasks: [],
        notes: [],
        products: []
      }
      setBusinessList(prev => [...prev, newBusiness])
    }
    setIsAddBusinessOpen(false)
    setIsEditBusinessOpen(false)
    setSelectedBusiness(null)
  }

  // Contact handlers
  const handleAddContact = (business) => {
    setSelectedBusiness(business)
    setNewContact({ name: '', email: '', phone: '', position: '' })
    setIsAddContactOpen(true)
  }

  const handleEditContact = (business, contact) => {
    setSelectedBusiness(business)
    setSelectedContact(contact)
    setNewContact(contact)
    setIsEditContactOpen(true)
  }

  const handleSaveContact = () => {
    if (selectedContact) {
      // Update existing contact
      setBusinessList(prev => prev.map(b => 
        b.id === selectedBusiness.id 
          ? { ...b, contacts: b.contacts.map(c => c.id === selectedContact.id ? { ...selectedContact, ...newContact } : c) }
          : b
      ))
    } else {
      // Add new contact
      const newContactObj = {
        id: Math.max(...selectedBusiness.contacts.map(c => c.id), 0) + 1,
        ...newContact
      }
      setBusinessList(prev => prev.map(b => 
        b.id === selectedBusiness.id 
          ? { ...b, contacts: [...b.contacts, newContactObj] }
          : b
      ))
    }
    setIsAddContactOpen(false)
    setIsEditContactOpen(false)
    setSelectedContact(null)
    setNewContact({ name: '', email: '', phone: '', position: '' })
  }

  // Task handlers
  const handleAddTask = (business = null) => {
    setSelectedBusiness(business)
    setNewTask({ title: '', description: '', status: 'Not Started', assignee: '' })
    setIsAddTaskOpen(true)
  }

  const handleEditTask = (business, task) => {
    setSelectedBusiness(business)
    setSelectedTask(task)
    setNewTask(task)
    setIsEditTaskOpen(true)
  }

  const handleSaveTask = () => {
    if (selectedTask) {
      // Update existing task
      setBusinessList(prev => prev.map(b => 
        b.id === selectedBusiness.id 
          ? { ...b, tasks: b.tasks.map(t => t.id === selectedTask.id ? { ...selectedTask, ...newTask } : t) }
          : b
      ))
    } else {
      // Add new task
      const newTaskObj = {
        id: Math.max(...selectedBusiness.tasks.map(t => t.id), 0) + 1,
        ...newTask
      }
      setBusinessList(prev => prev.map(b => 
        b.id === selectedBusiness.id 
          ? { ...b, tasks: [...b.tasks, newTaskObj] }
          : b
      ))
    }
    setIsAddTaskOpen(false)
    setIsEditTaskOpen(false)
    setSelectedTask(null)
    setNewTask({ title: '', description: '', status: 'Not Started', assignee: '' })
  }

  // Note handlers
  const handleAddNote = (business) => {
    setSelectedBusiness(business)
    setNewNote({ title: '', content: '' })
    setIsAddNoteOpen(true)
  }

  const handleEditNote = (business, note) => {
    setSelectedBusiness(business)
    setSelectedNote(note)
    setNewNote(note)
    setIsEditNoteOpen(true)
  }

  const handleSaveNote = () => {
    if (selectedNote) {
      // Update existing note
      setBusinessList(prev => prev.map(b => 
        b.id === selectedBusiness.id 
          ? { ...b, notes: b.notes.map(n => n.id === selectedNote.id ? { ...selectedNote, ...newNote } : n) }
          : b
      ))
    } else {
      // Add new note
      const newNoteObj = {
        id: Math.max(...selectedBusiness.notes.map(n => n.id), 0) + 1,
        ...newNote,
        date: new Date().toISOString().split('T')[0]
      }
      setBusinessList(prev => prev.map(b => 
        b.id === selectedBusiness.id 
          ? { ...b, notes: [...b.notes, newNoteObj] }
          : b
      ))
    }
    setIsAddNoteOpen(false)
    setIsEditNoteOpen(false)
    setSelectedNote(null)
    setNewNote({ title: '', content: '' })
  }

  // Product handlers
  const handleAddProduct = (business) => {
    setSelectedBusiness(business)
    setNewProduct({ name: '', price: '', pricingType: 'one-off', category: '', sku: '' })
    setIsAddProductOpen(true)
  }

  const handleEditProduct = (business, product) => {
    setSelectedBusiness(business)
    setSelectedProduct(product)
    setNewProduct(product)
    setIsEditProductOpen(true)
  }

  const handleSaveProduct = () => {
    if (selectedProduct) {
      // Update existing product
      setBusinessList(prev => prev.map(b => 
        b.id === selectedBusiness.id 
          ? { ...b, products: b.products.map(p => p.id === selectedProduct.id ? { ...selectedProduct, ...newProduct } : p) }
          : b
      ))
    } else {
      // Add new product
      const newProductObj = {
        id: Math.max(...selectedBusiness.products.map(p => p.id), 0) + 1,
        ...newProduct
      }
      setBusinessList(prev => prev.map(b => 
        b.id === selectedBusiness.id 
          ? { ...b, products: [...b.products, newProductObj] }
          : b
      ))
    }
    setIsAddProductOpen(false)
    setIsEditProductOpen(false)
    setSelectedProduct(null)
    setNewProduct({ name: '', price: '', pricingType: 'one-off', category: '', sku: '' })
  }

  // Inventory handlers
  const handleAddInventoryProduct = () => {
    setNewInventoryProduct({ name: '', description: '', price: '', pricingType: 'one-off', category: '', sku: '' })
    setIsAddInventoryProductOpen(true)
  }

  const handleEditInventoryProduct = (product) => {
    setSelectedInventoryProduct(product)
    setNewInventoryProduct(product)
    setIsEditInventoryProductOpen(true)
  }

  const handleSaveInventoryProduct = () => {
    if (selectedInventoryProduct) {
      // Update existing product
      setProducts(prev => prev.map(p => p.id === selectedInventoryProduct.id ? { ...selectedInventoryProduct, ...newInventoryProduct } : p))
    } else {
      // Add new product
      const newProductObj = {
        id: Math.max(...products.map(p => p.id), 0) + 1,
        ...newInventoryProduct
      }
      setProducts(prev => [...prev, newProductObj])
    }
    setIsAddInventoryProductOpen(false)
    setIsEditInventoryProductOpen(false)
    setSelectedInventoryProduct(null)
    setNewInventoryProduct({ name: '', description: '', price: '', pricingType: 'one-off', category: '', sku: '' })
  }

  // User handlers
  const handleAddUser = () => {
    setNewUser({
      name: '',
      email: '',
      password: '',
      role: 'User',
      status: 'Active',
      color: '#3B82F6'
    })
    setIsAddUserOpen(true)
  }

  const handleEditUser = (user) => {
    setEditingUser(user)
    setNewUser({
      name: user.name,
      email: user.email,
      password: '', // Don't pre-fill password for security
      role: user.role,
      status: user.status,
      color: user.color
    })
    setIsAddUserOpen(true)
  }

  const handleSaveUser = () => {
    if (editingUser) {
      // Update existing user
      setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...editingUser, ...newUser } : u))
    } else {
      // Add new user
      const newUserObj = {
        id: Math.max(...users.map(u => u.id), 0) + 1,
        ...newUser
      }
      setUsers(prev => [...prev, newUserObj])
    }
    setIsAddUserOpen(false)
    setEditingUser(null)
    setNewUser({
      name: '',
      email: '',
      password: '',
      role: 'User',
      status: 'Active',
      color: '#3B82F6'
    })
  }

  const handleDeleteUser = async (userId) => {
    if (confirm('Are you sure you want to delete this user?')) {
      setUsers(prev => prev.filter(u => u.id !== userId))
    }
  }

  const handleColorChange = (user, color) => {
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, color } : u))
    setIsColorPickerOpen(false)
    setSelectedColorUser(null)
  }

  // Calendar handlers
  const handleAddCalendarTask = (date = null) => {
    setSelectedDate(date)
    setSelectedCalendarTask(null)
    setNewTask({ title: '', description: '', status: 'Not Started', assignee: '' })
    setTaskRepeat('none')
    setTaskAssignee('')
    setTaskCompany('none')
    setIsAddTaskModalOpen(true)
  }

  const handleEditCalendarTask = (task) => {
    setSelectedCalendarTask(task)
    // Format the date properly for the input field (YYYY-MM-DD)
    if (task.startDate) {
      const date = new Date(task.startDate)
      setSelectedDate(date.toISOString().split('T')[0])
    } else {
      setSelectedDate(null)
    }
    
    // Set other task properties
    setNewTask({
      title: task.title || '',
      description: task.description || '',
      status: task.status || 'Not Started',
      assignee: task.assignee || ''
    })
    
    // Set assignee if available
    if (task.assigneeId) {
      setTaskAssignee(String(task.assigneeId))
    } else {
      setTaskAssignee('')
    }
    
    // Set company if available
    if (task.businessId) {
      setTaskCompany(String(task.businessId))
    } else {
      setTaskCompany('none')
    }
    
    // Set repeat if available
    if (task.recurring) {
      setTaskRepeat(task.recurring)
    } else {
      setTaskRepeat('none')
    }
    
    setIsEditTaskModalOpen(true)
  }

  // Dashboard stats state
  const [dashboardStats, setDashboardStats] = useState({
    totalBusinesses: 0,
    activeProducts: 0,
    pendingQuotes: 0,
    activeTasks: 0
  })
  
  const [dashboardAnalytics, setDashboardAnalytics] = useState({
    businessGrowth: [],
    categoryDistribution: [],
    topLocations: []
  })

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      // Fetch stats
      const businessesRes = await fetch('/api/businesses')
      const businessesData = await businessesRes.json()
      
      const productsRes = await fetch('/api/products')
      const productsData = await productsRes.json()
      
      const quotesRes = await fetch('/api/quotes')
      const quotesData = await quotesRes.json()
      
      const tasksRes = await fetch('/api/tasks')
      const tasksData = await tasksRes.json()
      
      // Update stats
      setDashboardStats({
        totalBusinesses: businessesData.length || 0,
        activeProducts: productsData.filter(p => p.status === 'active').length || 0,
        pendingQuotes: quotesData.filter(q => q.status === 'pending').length || 0,
        activeTasks: tasksData.filter(t => t.status !== 'completed').length || 0
      })
      
      // Update analytics (simplified for demo)
      setDashboardAnalytics({
        businessGrowth: [
          { month: 'Jan', businesses: Math.floor(businessesData.length * 0.6), users: Math.floor(businessesData.length * 2.5) },
          { month: 'Feb', businesses: Math.floor(businessesData.length * 0.75), users: Math.floor(businessesData.length * 3) },
          { month: 'Mar', businesses: Math.floor(businessesData.length * 0.85), users: Math.floor(businessesData.length * 3.5) },
          { month: 'Apr', businesses: businessesData.length, users: Math.floor(businessesData.length * 4) },
          { month: 'May', businesses: Math.floor(businessesData.length * 1.1), users: Math.floor(businessesData.length * 4.5) },
          { month: 'Jun', businesses: Math.floor(businessesData.length * 1.2), users: Math.floor(businessesData.length * 5) }
        ],
        categoryDistribution: businessesData.reduce((acc, business) => {
          const category = business.category || 'Other'
          const existing = acc.find(item => item.name === category)
          if (existing) {
            existing.value += 1
          } else {
            acc.push({ name: category, value: 1, color: '#3B82F6' })
          }
          return acc
        }, []),
        topLocations: businessesData.reduce((acc, business) => {
          const location = business.location || 'Unknown'
          const existing = acc.find(item => item.location === location)
          if (existing) {
            existing.businesses += 1
          } else {
            acc.push({ location, businesses: 1, growth: Math.floor(Math.random() * 20) })
          }
          return acc
        }, []).slice(0, 5)
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    }
  }, [])

  // Load dashboard data on mount
  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])
  const handleViewChange = (newView) => {
    setCalendarView(newView)
    const calendarApi = calendarRef.current?.getApi()
    if (calendarApi) {
      calendarApi.changeView(newView)
    }
  }

  const navigateCalendar = (direction) => {
    const calendarApi = calendarRef.current?.getApi()
    if (!calendarApi) return

    if (direction === 0) {
      // Today
      calendarApi.today()
      return
    }
    
    if (direction === -1) {
      calendarApi.prev()
    } else {
      calendarApi.next()
    }
  }

  const handleUserFilter = (userId) => {
    setSelectedUserFilter(prev => prev === userId ? null : userId)
  }

  const handleDeleteCalendarTask = async () => {
    if (!selectedCalendarTask) return
    
    if (confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      try {
        // Check if this is a recurring task and handle accordingly
        if (selectedCalendarTask.recurring || selectedCalendarTask.parentTaskId) {
          const response = await fetch(`/api/tasks/delete-recurring?taskId=${selectedCalendarTask.id}`, {
            method: 'DELETE'
          })
          
          if (response.ok) {
            const result = await response.json()
            // Remove all related tasks from local state
            setTasks(prevTasks => prevTasks.filter(task => !result.taskIds.includes(task.id)))
            
            // Close the dialog and reset state
            setIsEditTaskModalOpen(false)
            setIsAddTaskModalOpen(false)
            setSelectedCalendarTask(null)
          } else {
            console.error('Failed to delete recurring task')
            alert('Failed to delete recurring task. Please try again.')
          }
        } else {
          // Regular task deletion
          const response = await fetch(`/api/tasks/${selectedCalendarTask.id}`, {
            method: 'DELETE'
          })
          
          if (response.ok) {
            // Remove the task from the local state
            setTasks(prevTasks => prevTasks.filter(task => task.id !== selectedCalendarTask.id))
            
            // Close the dialog and reset state
            setIsEditTaskModalOpen(false)
            setIsAddTaskModalOpen(false)
            setSelectedCalendarTask(null)
          } else {
            console.error('Failed to delete task')
            alert('Failed to delete task. Please try again.')
          }
        }
      } catch (error) {
        console.error('Error deleting task:', error)
        alert('An error occurred while deleting the task. Please try again.')
      }
    }
  }

  const handleSaveCalendarTask = async () => {
    try {
      console.log('Saving task:', {
        title: newTask.title,
        description: newTask.description,
        selectedDate: selectedDate,
        taskAssignee: taskAssignee,
        taskCompany: taskCompany,
        taskRepeat: taskRepeat
      })

      // Prepare task data
      const taskData = {
        title: newTask.title,
        description: newTask.description,
        status: newTask.status,
        startDate: selectedDate,
        due_date: selectedDate,
        assigneeId: taskAssignee ? parseInt(taskAssignee) : null,
        businessId: taskCompany !== 'none' ? parseInt(taskCompany) : null,
        recurring: taskRepeat !== 'none' ? taskRepeat : null,
        customRepeatWeeks: taskRepeat === 'custom' ? customRepeatWeeks : null
      }

      console.log('Task data to be saved:', taskData)
      console.log('Business ID being sent:', taskData.businessId, 'Type:', typeof taskData.businessId)

      let response
      if (selectedCalendarTask) {
        // Update existing task
        console.log('Updating existing task:', selectedCalendarTask.id)
        console.log('Full request data:', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(taskData, null, 2)
        })
        response = await fetch(`/api/tasks/${selectedCalendarTask.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(taskData),
        })
      } else {
        // Create new task
        console.log('Creating new task')
        response = await fetch('/api/tasks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(taskData),
        })
      }

      console.log('Response status:', response.status)
      console.log('Response headers:', response.headers)

      if (response.ok) {
        const savedTasks = await response.json()
        console.log('Tasks saved successfully:', savedTasks)
        console.log('Number of tasks received:', savedTasks.length)
        console.log('Selected calendar task ID:', selectedCalendarTask?.id)
        console.log('Current tasks before update:', tasks.map(t => ({ id: t.id, title: t.title })))
        
        // Handle both single task and array of tasks
        const tasksToHandle = Array.isArray(savedTasks) ? savedTasks : [savedTasks]
        console.log('Tasks to handle:', tasksToHandle.length)
        
        // Update local state
        if (selectedCalendarTask) {
          // Update existing task
          setTasks(prevTasks => {
            const updatedTasks = prevTasks.map(task => {
              console.log('Comparing task IDs:', task.id, 'with', selectedCalendarTask.id, 'Match:', task.id === selectedCalendarTask.id)
              return task.id === selectedCalendarTask.id ? tasksToHandle[0] : task
            })
            console.log('Updated tasks:', updatedTasks.map(t => ({ id: t.id, title: t.title })))
            return updatedTasks
          })
        } else {
          // Add new task(s)
          setTasks(prevTasks => {
            const newTasks = [...prevTasks, ...tasksToHandle]
            console.log('New tasks array:', newTasks.map(t => ({ id: t.id, title: t.title })))
            return newTasks
          })
        }

        // Show success message
        alert('Task saved successfully!')
        
        // Clear search results and highlight
        setTimeout(() => {
          setShowSearchResults(false)
          setSearchResults([])
          setHighlightedTaskId(null)
        }, 500)
        
        // Close modal and reset form
        setIsAddTaskModalOpen(false)
        setIsEditTaskModalOpen(false)
        setSelectedCalendarTask(null)
        setSelectedDate(null)
        setTaskRepeat('none')
        setTaskAssignee('')
        setTaskCompany('none')
        setNewTask({ title: '', description: '', status: 'Not Started', assignee: '' })
      } else {
        const errorText = await response.text()
        console.error('Failed to save task:', response.status, errorText)
        alert(`Failed to save task: ${errorText}`)
      }
    } catch (error) {
      console.error('Error saving task:', error)
      alert('An error occurred while saving the task. Please try again.')
    }
  }

  // Check user permissions
  const hasPermission = (feature) => {
    if (!currentUser) return false
    const userRole = currentUser.role || 'User'
    return rolePermissions[userRole]?.features?.[feature] || false
  }

  const canAccessTab = (tabName) => {
    if (!currentUser) return false
    const userRole = currentUser.role || 'User'
    return rolePermissions[userRole]?.tabs?.includes(tabName) || false
  }

  // Filter navigation based on permissions
  const filteredNavigation = navigation.filter(item => 
    !item.requiredPermission || hasPermission(item.requiredPermission)
  )

  // Render functions for different tabs
  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Businesses</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalBusinesses}</p>
              </div>
              <div className="text-sm font-medium text-green-600">
                +12%
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Products</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardStats.activeProducts}</p>
              </div>
              <div className="text-sm font-medium text-green-600">
                +23%
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Quotes</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardStats.pendingQuotes}</p>
              </div>
              <div className="text-sm font-medium text-green-600">
                +5%
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Tasks</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardStats.activeTasks}</p>
              </div>
              <div className="text-sm font-medium text-green-600">
                +8%
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Business Growth</CardTitle>
            <CardDescription>Monthly business and user growth</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dashboardAnalytics.businessGrowth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="businesses" stroke="#3B82F6" strokeWidth={2} />
                <Line type="monotone" dataKey="users" stroke="#10B981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Category Distribution</CardTitle>
            <CardDescription>Business categories breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dashboardAnalytics.categoryDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {dashboardAnalytics.categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Locations */}
      <Card>
        <CardHeader>
          <CardTitle>Top Locations</CardTitle>
          <CardDescription>Businesses by location with growth rate</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dashboardAnalytics.topLocations}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="location" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="businesses" fill="#3B82F6" />
              <Bar dataKey="growth" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )

  const renderBusinesses = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Business Directory</h1>
          <p className="text-gray-600">Manage your business contacts and relationships</p>
        </div>
        <Button onClick={handleAddBusiness}>
          <Plus className="h-4 w-4 mr-2" />
          Add Business
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Search Bar - Takes most space */}
            <div className="lg:col-span-6">
              <Label htmlFor="search">Search Businesses</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by name, description, or category..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            {/* Category Filter */}
            <div className="lg:col-span-3">
              <Label htmlFor="category">Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Location Filter */}
            <div className="lg:col-span-3">
              <Label htmlFor="location">Location</Label>
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="All Locations" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map(location => (
                    <SelectItem key={location} value={location}>{location}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {filteredBusinesses.length} of {businessList.length} businesses
        </p>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => {
            setSearchTerm('')
            setSelectedCategory('All Categories')
            setSelectedLocation('All Locations')
          }}>
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Business Grid */}
      {filteredBusinesses.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No businesses found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search criteria or create a new business.</p>
            <Button onClick={handleAddBusiness}>
              <Plus className="h-4 w-4 mr-2" />
              Add Business
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBusinesses.map((business) => (
            <Card key={business.id} className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
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
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
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
                        Edit Business
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAddContact(business)}>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add Contact
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAddTask(business)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Task
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDeleteBusiness(business.id)}
                        className="text-red-600 focus:text-red-600 focus:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Business
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900">{business.contacts?.length || 0}</div>
                      <div className="text-xs text-gray-600">Contacts</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900">{business.tasks?.length || 0}</div>
                      <div className="text-xs text-gray-600">Tasks</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900">{business.products?.length || 0}</div>
                      <div className="text-xs text-gray-600">Products</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )

  const renderTasks = () => (
    <div className="space-y-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tasks Calendar</h1>
            <p className="text-gray-600">Calendar view with drag & drop, repeat events, and user assignment</p>
          </div>
          <div className="flex space-x-2">
            <Button onClick={() => setIsAddTaskOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Task
            </Button>
          </div>
        </div>
      </div>

      {/* Calendar View */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          {/* Task Search */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Search Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input
                  placeholder="Search tasks..."
                  value={taskSearchTerm}
                  onChange={(e) => setTaskSearchTerm(e.target.value)}
                />
                {showSearchResults && (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {searchResults.map((task) => (
                      <div
                        key={task.id}
                        className={`p-2 rounded cursor-pointer hover:bg-gray-100 ${
                          highlightedTaskId === task.id ? 'bg-blue-100' : ''
                        }`}
                        onClick={() => {
                          const taskDate = new Date(task.startDate || task.due_date)
                          setCurrentDate(taskDate)
                          setHighlightedTaskId(task.id)
                          setShowSearchResults(false)
                          
                          // Switch to day view for better focus on the task
                          setCalendarView('timeGridDay')
                          
                          // Clear highlight after 3 seconds
                          setTimeout(() => {
                            setHighlightedTaskId(null)
                          }, 3000)
                        }}
                      >
                        <div className="font-medium">{task.title}</div>
                        <div className="text-sm text-gray-600">
                          {task.startDate || task.due_date}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* User Filter */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filter by User</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div
                  className={`p-2 rounded cursor-pointer hover:bg-gray-100 ${
                    selectedUserFilter === null ? 'bg-blue-100' : ''
                  }`}
                  onClick={() => handleUserFilter(null)}
                >
                  All Users
                </div>
                {users.map((user) => (
                  <div
                    key={user.id}
                    className={`p-2 rounded cursor-pointer hover:bg-gray-100 flex items-center space-x-2 ${
                      selectedUserFilter === user.id ? 'bg-blue-100' : ''
                    }`}
                    onClick={() => handleUserFilter(user.id)}
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: user.color }}
                    />
                    <span>{user.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Task Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Task Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Total Tasks</span>
                  <Badge>{tasks.length}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Not Started</span>
                  <Badge variant="secondary">
                    {tasks.filter(t => t.status === 'Not Started').length}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>In Progress</span>
                  <Badge variant="default">
                    {tasks.filter(t => t.status === 'in-progress').length}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Completed</span>
                  <Badge variant="outline">
                    {tasks.filter(t => t.status === 'completed').length}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Calendar Grid */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Task Calendar</CardTitle>
                  <CardDescription>Drag and drop tasks to reschedule</CardDescription>
                </div>
                <div className="flex space-x-2">
                  {/* View Selector */}
                  <Select value={calendarView} onValueChange={handleViewChange}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dayGridMonth">Month</SelectItem>
                      <SelectItem value="timeGridWeek">Week</SelectItem>
                      <SelectItem value="timeGridDay">Day</SelectItem>
                      <SelectItem value="listWeek">List</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {/* Navigation Buttons */}
                  <Button variant="outline" size="sm" onClick={() => navigateCalendar(-1)}>
                    Previous
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => navigateCalendar(0)}>
                    Today
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => navigateCalendar(1)}>
                    Next
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="calendar-container">
                <FullCalendar
                  ref={calendarRef}
                  plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
                  initialView={calendarView}
                  headerToolbar={false}
                  events={tasksToEvents()}
                  editable={true}
                  selectable={true}
                  select={handleDateSelect}
                  eventClick={handleEventClick}
                  eventDrop={handleEventDrop}
                  height="600px"
                  eventDisplay="block"
                  firstDay={1}
                  nowIndicator={true}
                  droppable={true}
                  eventResizable={true}
                  eventResize={handleEventResize}
                  viewDidMount={(info) => {
                    // Update current date when view changes
                    setCurrentDate(info.view.currentStart)
                  }}
                  datesSet={(info) => {
                    // Update current date when navigation occurs
                    setCurrentDate(info.view.currentStart)
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )

  const renderUsers = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Manage users, roles, and permissions</p>
        </div>
        <Button onClick={handleAddUser}>
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Role Permissions Section */}
      <Card>
        <CardHeader>
          <CardTitle>Role Permissions</CardTitle>
          <CardDescription>Configure access permissions for each role</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Object.entries(rolePermissions).map(([role, permissions]) => (
              <div key={role} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full ${role === 'Admin' ? 'bg-red-500' : role === 'Manager' ? 'bg-blue-500' : 'bg-green-500'}`}></div>
                    <h3 className="text-xl font-semibold">{role}</h3>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => {
                    setSelectedRole(role)
                    setIsEditRoleOpen(true)
                  }}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Permissions
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-3 flex items-center">
                      <FolderOpen className="h-4 w-4 mr-2" />
                      Accessible Tabs
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {permissions.tabs.map((tab) => (
                        <Badge key={tab} variant="secondary" className="text-xs">
                          {tab}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-700 mb-3 flex items-center">
                      <Shield className="h-4 w-4 mr-2" />
                      Features & Permissions
                    </h4>
                    <div className="space-y-2">
                      {Object.entries(permissions.features).map(([feature, enabled]) => (
                        <div key={feature} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${enabled ? 'bg-green-500' : 'bg-red-500'}`} />
                            <span className="text-sm font-medium">{feature}</span>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {enabled ? 'Enabled' : 'Disabled'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Users Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>Manage user accounts and permissions</CardDescription>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
              <p className="text-gray-600 mb-4">Add users to manage your system.</p>
              <Button onClick={handleAddUser}>
                <Plus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {users.map((user) => (
                <Card key={user.id} className="hover:shadow-lg transition-all duration-200">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarFallback style={{ backgroundColor: user.color }}>
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold">{user.name}</div>
                          <div className="text-sm text-gray-600">{user.email}</div>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditUser(user)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit User
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            setSelectedColorUser(user)
                            setIsColorPickerOpen(true)
                          }}>
                            <div className="flex items-center">
                              <div className="w-4 h-4 rounded-full mr-2 border" style={{ backgroundColor: user.color }} />
                              Change Color
                            </div>
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600 focus:text-red-600 focus:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Role</span>
                        <Badge variant={user.role === 'Admin' ? 'default' : user.role === 'Manager' ? 'secondary' : 'outline'}>
                          {user.role}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Status</span>
                        <Badge variant={user.status === 'Active' ? 'default' : 'secondary'}>
                          {user.status}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Color</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: user.color }} />
                          <span className="text-sm text-gray-600">{user.color}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )

  const renderInventory = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600">Manage your product inventory and pricing</p>
        </div>
        <Button onClick={handleAddInventoryProduct}>
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="search">Search Products</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by name or SKU..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  {productCategories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {products.length} products
        </p>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => {
            setSearchTerm('')
            setSelectedCategory('All Categories')
          }}>
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Products Grid */}
      {products.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search criteria or add a new product.</p>
            <Button onClick={handleAddInventoryProduct}>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="hover:shadow-lg transition-all duration-200 group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate group-hover:text-blue-600 transition-colors">
                      {product.name}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      SKU: {product.sku || 'N/A'}
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditInventoryProduct(product)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Product
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this product?')) {
                            setProducts(prev => prev.filter(p => p.id !== product.id))
                          }
                        }}
                        className="text-red-600 focus:text-red-600 focus:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Product
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {/* Category */}
                  <div className="flex items-center text-sm text-gray-600">
                    <Package className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{product.category || 'Uncategorized'}</span>
                  </div>
                  
                  {/* Stock Level */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Stock</span>
                    <Badge variant={product.stock > 10 ? "default" : product.stock > 0 ? "secondary" : "destructive"}>
                      {product.stock || 0} units
                    </Badge>
                  </div>
                  
                  <Separator className="my-3" />
                  
                  {/* Price */}
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      £{product.price}
                    </div>
                    <Badge variant={product.pricingType === 'monthly' ? 'default' : 'outline'} className="mt-1">
                      {product.pricingType === 'monthly' ? 'Monthly' : 'One-off'}
                    </Badge>
                  </div>
                  
                  {/* Stock Status */}
                  <div className="text-center">
                    {product.stock > 10 ? (
                      <div className="flex items-center justify-center text-green-600 text-sm">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        In Stock
                      </div>
                    ) : product.stock > 0 ? (
                      <div className="flex items-center justify-center text-yellow-600 text-sm">
                        <Clock className="h-4 w-4 mr-1" />
                        Low Stock ({product.stock} left)
                      </div>
                    ) : (
                      <div className="flex items-center justify-center text-red-600 text-sm">
                        <Circle className="h-4 w-4 mr-1" />
                        Out of Stock
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )

  const renderQuotes = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quotes Management</h1>
          <p className="text-gray-600">Create and manage customer quotes</p>
        </div>
        <Button onClick={() => setIsAddQuoteOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Quote
        </Button>
      </div>

      {/* Quotes Table */}
      <Card>
        <CardHeader>
          <CardTitle>Quotes</CardTitle>
          <CardDescription>Manage customer quotes and proposals</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Quote #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quotes.map((quote) => (
                <TableRow key={quote.id}>
                  <TableCell className="font-medium">{quote.number}</TableCell>
                  <TableCell>{quote.customer}</TableCell>
                  <TableCell>${quote.amount}</TableCell>
                  <TableCell>
                    <Badge variant={quote.status === 'Accepted' ? 'default' : quote.status === 'Pending' ? 'secondary' : 'outline'}>
                      {quote.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{quote.created}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedQuote(quote)
                          setIsViewQuoteOpen(true)
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedQuote(quote)
                          setIsEditQuoteOpen(true)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this quote?')) {
                            setQuotes(prev => prev.filter(q => q.id !== quote.id))
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )

  const renderDocuments = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Documents</h1>
          <p className="text-gray-600">Manage and share documents</p>
        </div>
        <Button onClick={() => setIsUploadDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Upload Document
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Document Categories Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {documentCategories.map((category) => (
                  <div
                    key={category.name}
                    className={`p-3 rounded-lg cursor-pointer hover:bg-gray-100 ${
                      uploadCategory === category.name ? 'bg-blue-100' : ''
                    }`}
                    onClick={() => setUploadCategory(category.name)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <FolderOpen className="h-4 w-4 text-gray-600" />
                        <span className="font-medium">{category.name}</span>
                      </div>
                      <Badge variant="secondary">{category.count}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Documents Grid */}
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map((doc) => (
              <Card key={doc.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{doc.name}</CardTitle>
                  <CardDescription>{doc.category}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <FileText className="h-4 w-4 mr-2" />
                      {doc.type}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      {doc.uploaded}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <span>{doc.size}</span>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      <Button variant="outline" size="sm">
                        <Share className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  const renderMessages = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-600">Communicate with your team and contacts</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Message
        </Button>
      </div>

      {/* Message Categories */}
      <div className="flex space-x-4">
        {messageCategories.map((category) => (
          <Button
            key={category.name}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <span>{category.name}</span>
            {category.count > 0 && (
              <Badge variant="secondary">{category.count}</Badge>
            )}
          </Button>
        ))}
      </div>

      {/* Messages List */}
      <div className="space-y-4">
        {messages.map((message) => (
          <Card key={message.id}>
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <Avatar>
                  <AvatarFallback>
                    {message.sender.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{message.sender.name}</h3>
                      <p className="text-sm text-gray-600">{message.sender.email}</p>
                    </div>
                    <div className="text-sm text-gray-600">{message.timestamp}</div>
                  </div>
                  <div className="mt-2">
                    <p className="text-gray-900">{message.content}</p>
                  </div>
                  <div className="mt-4 flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Reply className="h-4 w-4 mr-2" />
                      Reply
                    </Button>
                    <Button variant="outline" size="sm">
                      <Forward className="h-4 w-4 mr-2" />
                      Forward
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="text-gray-600">Comprehensive business analytics and insights</p>
      </div>

      <AnalyticsDashboard data={analyticsData} />
    </div>
  )

  const renderSettings = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Configure your application settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>Basic application configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Email Notifications</Label>
                <p className="text-sm text-gray-600">Receive email notifications</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Dark Mode</Label>
                <p className="text-sm text-gray-600">Enable dark theme</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Auto-save</Label>
                <p className="text-sm text-gray-600">Automatically save changes</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Security Settings</CardTitle>
            <CardDescription>Manage security preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Two-Factor Authentication</Label>
                <p className="text-sm text-gray-600">Add an extra layer of security</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Session Timeout</Label>
                <p className="text-sm text-gray-600">Automatically log out after inactivity</p>
              </div>
              <Select defaultValue="30">
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 min</SelectItem>
                  <SelectItem value="30">30 min</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* User Management Settings */}
        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>Default user settings and permissions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Default User Role</Label>
              <Select defaultValue="User">
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
            <div className="flex items-center justify-between">
              <div>
                <Label>Require Email Verification</Label>
                <p className="text-sm text-gray-600">New users must verify email</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Data & Privacy Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Data & Privacy</CardTitle>
            <CardDescription>Data retention and privacy settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Data Retention Period</Label>
              <Select defaultValue="365">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                  <SelectItem value="365">1 year</SelectItem>
                  <SelectItem value="0">Never delete</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Anonymize User Data</Label>
                <p className="text-sm text-gray-600">Remove personal identifiers</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  // Mobile menu state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Main render
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation - Mobile Only */}
      <header className="bg-white shadow-sm border-b md:hidden">
        <div className="flex items-center justify-between h-16 px-4">
          <div className="flex items-center">
            <Building2 className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">BusinessHub</span>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm">
              <Bell className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)}></div>
          <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
            <div className="flex items-center justify-between h-16 px-4 border-b">
              <div className="flex items-center">
                <Building2 className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">BusinessHub</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setIsMobileMenuOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            {/* Mobile Navigation */}
            <nav className="p-4">
              <div className="space-y-1">
                {filteredNavigation.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => {
                      setActiveTab(item.tab)
                      setIsMobileMenuOpen(false)
                    }}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeTab === item.tab
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </button>
                ))}
              </div>
            </nav>
            
            {/* Mobile User Profile */}
            <div className="absolute bottom-0 w-64 p-4 border-t">
              <div className="flex items-center">
                <Avatar>
                  <AvatarFallback style={{ backgroundColor: currentUser?.color || '#3B82F6' }}>
                    {currentUser?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="ml-3">
                  <div className="text-sm font-medium text-gray-900">{currentUser?.name || 'User'}</div>
                  <div className="text-xs text-gray-600">{currentUser?.role || 'User'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Search Bar */}
      <div className="hidden md:block bg-white shadow-sm border-b">
        <div className="flex items-center justify-between h-16 px-6">
          <div className="flex items-center">
            <Building2 className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">BusinessHub</span>
          </div>
          
          <div className="flex-1 max-w-lg mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              <Bell className="h-4 w-4" />
            </Button>
            <Avatar>
              <AvatarFallback style={{ backgroundColor: currentUser?.color || '#3B82F6' }}>
                {currentUser?.name?.split(' ').map(n => n[0]).join('') || 'U'}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex">
        {/* Sidebar - Desktop Only */}
        <div className="hidden md:block w-64 bg-white shadow-sm min-h-screen">
          <nav className="p-4">
            <div className="space-y-1">
              {filteredNavigation.map((item) => (
                <button
                  key={item.name}
                  onClick={() => setActiveTab(item.tab)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === item.tab
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </button>
              ))}
            </div>
          </nav>

          {/* User Profile */}
          <div className="absolute bottom-0 w-64 p-4 border-t">
            <div className="flex items-center">
              <Avatar>
                <AvatarFallback style={{ backgroundColor: currentUser?.color || '#3B82F6' }}>
                  {currentUser?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="ml-3">
                <div className="text-sm font-medium text-gray-900">{currentUser?.name || 'User'}</div>
                <div className="text-xs text-gray-600">{currentUser?.role || 'User'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 p-4 md:p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            {/* Mobile Tabs - Horizontal Scroll */}
            <div className="md:hidden mb-4">
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {filteredNavigation.map((item) => (
                  <button
                    key={item.tab}
                    onClick={() => setActiveTab(item.tab)}
                    className={`flex-shrink-0 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeTab === item.tab
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Desktop Tabs */}
            <TabsList className="hidden md:grid w-full grid-cols-10">
              {filteredNavigation.map((item) => (
                <TabsTrigger key={item.tab} value={item.tab}>
                  {item.name}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="dashboard">
              {renderDashboard()}
            </TabsContent>

            <TabsContent value="businesses">
              {renderBusinesses()}
            </TabsContent>

            <TabsContent value="inventory">
              {renderInventory()}
            </TabsContent>

            <TabsContent value="tasks">
              {renderTasks()}
            </TabsContent>

            <TabsContent value="users">
              {renderUsers()}
            </TabsContent>

            <TabsContent value="quotes">
              {renderQuotes()}
            </TabsContent>

            <TabsContent value="documents">
              {renderDocuments()}
            </TabsContent>

            <TabsContent value="messages">
              {renderMessages()}
            </TabsContent>

            <TabsContent value="analytics">
              {renderAnalytics()}
            </TabsContent>

            <TabsContent value="settings">
              {renderSettings()}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Dialogs */}
      <Dialog open={isAddBusinessOpen} onOpenChange={setIsAddBusinessOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Business</DialogTitle>
            <DialogDescription>Add a new business to your directory</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="businessName">Business Name</Label>
              <Input id="businessName" placeholder="Enter business name" />
            </div>
            <div>
              <Label htmlFor="businessDescription">Description</Label>
              <Textarea id="businessDescription" placeholder="Enter business description" />
            </div>
            <div>
              <Label htmlFor="businessCategory">Category</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="businessLocation">Location</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map(location => (
                    <SelectItem key={location} value={location}>{location}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setIsAddBusinessOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => handleSaveBusiness({ name: 'New Business' })}>
              Add Business
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditBusinessOpen} onOpenChange={setIsEditBusinessOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Business</DialogTitle>
            <DialogDescription>Update business information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="editBusinessName">Business Name</Label>
              <Input id="editBusinessName" defaultValue={selectedBusiness?.name} />
            </div>
            <div>
              <Label htmlFor="editBusinessDescription">Description</Label>
              <Textarea id="editBusinessDescription" defaultValue={selectedBusiness?.description} />
            </div>
            <div>
              <Label htmlFor="editBusinessCategory">Category</Label>
              <Select defaultValue={selectedBusiness?.category}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="editBusinessLocation">Location</Label>
              <Select defaultValue={selectedBusiness?.location}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {locations.map(location => (
                    <SelectItem key={location} value={location}>{location}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setIsEditBusinessOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => handleSaveBusiness({ name: 'Updated Business' })}>
              Update Business
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isViewBusinessOpen} onOpenChange={setIsViewBusinessOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-xl">{selectedBusiness?.name}</DialogTitle>
                <DialogDescription>{selectedBusiness?.description}</DialogDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant={selectedBusiness?.hasSupportContract ? "default" : "secondary"}>
                  {selectedBusiness?.hasSupportContract ? "Support Contract" : "No Support"}
                </Badge>
              </div>
            </div>
          </DialogHeader>
          
          <Tabs defaultValue="overview" className="mt-4">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="contacts">Contacts</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
              <TabsTrigger value="products">Products</TabsTrigger>
            </TabsList>
            
            <div className="mt-4 max-h-[60vh] overflow-y-auto">
              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Category</Label>
                    <p className="text-sm font-medium">{selectedBusiness?.category || 'Uncategorized'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Location</Label>
                    <p className="text-sm font-medium">{selectedBusiness?.location || 'No location specified'}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600">{selectedBusiness?.contacts?.length || 0}</div>
                      <div className="text-sm text-gray-600">Contacts</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">{selectedBusiness?.tasks?.length || 0}</div>
                      <div className="text-sm text-gray-600">Tasks</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-purple-600">{selectedBusiness?.products?.length || 0}</div>
                      <div className="text-sm text-gray-600">Products</div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Support Contract Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Support Contract</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedBusiness?.hasSupportContract ? (
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                          <span className="text-green-600 font-medium">Active Support Contract</span>
                        </div>
                        <p className="text-sm text-gray-600">
                          This business has an active support contract with priority support and maintenance services.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <Circle className="h-5 w-5 text-gray-400 mr-2" />
                          <span className="text-gray-600 font-medium">No Support Contract</span>
                        </div>
                        <p className="text-sm text-gray-600">
                          This business does not have a support contract. Consider offering one for enhanced services.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Contacts Tab */}
              <TabsContent value="contacts" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Contacts</h3>
                  <Button size="sm" onClick={() => handleAddContact(selectedBusiness)}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Contact
                  </Button>
                </div>
                
                {selectedBusiness?.contacts?.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedBusiness.contacts.map((contact) => (
                      <Card key={contact.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="font-medium text-lg">{contact.name}</div>
                              <div className="text-sm text-gray-600">{contact.position}</div>
                              <div className="mt-2 space-y-1">
                                <div className="flex items-center text-sm text-gray-600">
                                  <Mail className="h-4 w-4 mr-2" />
                                  {contact.email}
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                  <Phone className="h-4 w-4 mr-2" />
                                  {contact.phone}
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditContact(selectedBusiness, contact)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No contacts found</h3>
                      <p className="text-gray-600 mb-4">Add contacts to keep track of people at this business.</p>
                      <Button onClick={() => handleAddContact(selectedBusiness)}>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add Contact
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
              
              {/* Tasks Tab */}
              <TabsContent value="tasks" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Tasks</h3>
                  <Button size="sm" onClick={() => handleAddTask(selectedBusiness)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Task
                  </Button>
                </div>
                
                {selectedBusiness?.tasks?.length > 0 ? (
                  <div className="space-y-3">
                    {selectedBusiness.tasks.map((task) => (
                      <Card key={task.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="font-medium text-lg">{task.title}</div>
                              <div className="text-sm text-gray-600 mt-1">{task.description}</div>
                              <div className="flex items-center mt-2 space-x-4">
                                <div className="flex items-center text-sm text-gray-600">
                                  <CalendarIcon className="h-4 w-4 mr-1" />
                                  Due: {task.startDate}
                                </div>
                                <Badge variant={task.status === 'completed' ? 'outline' : task.status === 'in-progress' ? 'default' : 'secondary'}>
                                  {task.status}
                                </Badge>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditTask(selectedBusiness, task)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <CheckSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
                      <p className="text-gray-600 mb-4">Create tasks to track work related to this business.</p>
                      <Button onClick={() => handleAddTask(selectedBusiness)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Task
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
              
              {/* Notes Tab */}
              <TabsContent value="notes" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Notes</h3>
                  <Button size="sm" onClick={() => handleAddNote(selectedBusiness)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Note
                  </Button>
                </div>
                
                {selectedBusiness?.notes?.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedBusiness.notes.map((note) => (
                      <Card key={note.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="font-medium text-lg">{note.title}</div>
                              <div className="text-sm text-gray-600 mt-2">{note.content}</div>
                              <div className="text-xs text-gray-500 mt-2">{note.date}</div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditNote(selectedBusiness, note)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No notes found</h3>
                      <p className="text-gray-600 mb-4">Add notes to keep track of important information about this business.</p>
                      <Button onClick={() => handleAddNote(selectedBusiness)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Note
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
              
              {/* Products Tab */}
              <TabsContent value="products" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Products</h3>
                  <Button size="sm" onClick={() => handleAddProduct(selectedBusiness)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                  </Button>
                </div>
                
                {selectedBusiness?.products?.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedBusiness.products.map((product) => (
                      <Card key={product.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="font-medium text-lg">{product.name}</div>
                              <div className="text-sm text-gray-600">{product.category}</div>
                              <div className="text-lg font-semibold text-green-600 mt-2">
                                £{product.price} {product.pricingType}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditProduct(selectedBusiness, product)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                      <p className="text-gray-600 mb-4">Add products to track what this business uses or purchases.</p>
                      <Button onClick={() => handleAddProduct(selectedBusiness)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Product
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </div>
          </Tabs>
          
          <div className="flex justify-end space-x-2 mt-6 border-t pt-4">
            <Button variant="outline" onClick={() => setIsViewBusinessOpen(false)}>
              Close
            </Button>
            <Button onClick={() => handleEditBusiness(selectedBusiness)}>
              Edit Business
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddContactOpen} onOpenChange={setIsAddContactOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Contact</DialogTitle>
            <DialogDescription>Add a new contact to {selectedBusiness?.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="contactName">Name</Label>
              <Input
                id="contactName"
                value={newContact.name}
                onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                placeholder="Enter contact name"
              />
            </div>
            <div>
              <Label htmlFor="contactEmail">Email</Label>
              <Input
                id="contactEmail"
                value={newContact.email}
                onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                placeholder="Enter email address"
              />
            </div>
            <div>
              <Label htmlFor="contactPhone">Phone</Label>
              <Input
                id="contactPhone"
                value={newContact.phone}
                onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                placeholder="Enter phone number"
              />
            </div>
            <div>
              <Label htmlFor="contactPosition">Position</Label>
              <Input
                id="contactPosition"
                value={newContact.position}
                onChange={(e) => setNewContact({ ...newContact, position: e.target.value })}
                placeholder="Enter position"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setIsAddContactOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveContact}>
              Add Contact
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditContactOpen} onOpenChange={setIsEditContactOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Contact</DialogTitle>
            <DialogDescription>Update contact information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="editContactName">Name</Label>
              <Input
                id="editContactName"
                value={newContact.name}
                onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                placeholder="Enter contact name"
              />
            </div>
            <div>
              <Label htmlFor="editContactEmail">Email</Label>
              <Input
                id="editContactEmail"
                value={newContact.email}
                onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                placeholder="Enter email address"
              />
            </div>
            <div>
              <Label htmlFor="editContactPhone">Phone</Label>
              <Input
                id="editContactPhone"
                value={newContact.phone}
                onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                placeholder="Enter phone number"
              />
            </div>
            <div>
              <Label htmlFor="editContactPosition">Position</Label>
              <Input
                id="editContactPosition"
                value={newContact.position}
                onChange={(e) => setNewContact({ ...newContact, position: e.target.value })}
                placeholder="Enter position"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setIsEditContactOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveContact}>
              Update Contact
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Task</DialogTitle>
            <DialogDescription>Add a new task to {selectedBusiness?.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="taskTitle">Title</Label>
              <Input
                id="taskTitle"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="Enter task title"
              />
            </div>
            <div>
              <Label htmlFor="taskDescription">Description</Label>
              <Textarea
                id="taskDescription"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                placeholder="Enter task description"
              />
            </div>
            <div>
              <Label htmlFor="taskStatus">Status</Label>
              <Select value={newTask.status} onValueChange={(value) => setNewTask({ ...newTask, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Not Started">Not Started</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setIsAddTaskOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveTask}>
              Add Task
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditTaskOpen} onOpenChange={setIsEditTaskOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>Update task information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="editTaskTitle">Title</Label>
              <Input
                id="editTaskTitle"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="Enter task title"
              />
            </div>
            <div>
              <Label htmlFor="editTaskDescription">Description</Label>
              <Textarea
                id="editTaskDescription"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                placeholder="Enter task description"
              />
            </div>
            <div>
              <Label htmlFor="editTaskStatus">Status</Label>
              <Select value={newTask.status} onValueChange={(value) => setNewTask({ ...newTask, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Not Started">Not Started</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setIsEditTaskOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveTask}>
              Update Task
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddNoteOpen} onOpenChange={setIsAddNoteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Note</DialogTitle>
            <DialogDescription>Add a new note to {selectedBusiness?.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="noteTitle">Title</Label>
              <Input
                id="noteTitle"
                value={newNote.title}
                onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                placeholder="Enter note title"
              />
            </div>
            <div>
              <Label htmlFor="noteContent">Content</Label>
              <Textarea
                id="noteContent"
                value={newNote.content}
                onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                placeholder="Enter note content"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setIsAddNoteOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveNote}>
              Add Note
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditNoteOpen} onOpenChange={setIsEditNoteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Note</DialogTitle>
            <DialogDescription>Update note information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="editNoteTitle">Title</Label>
              <Input
                id="editNoteTitle"
                value={newNote.title}
                onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                placeholder="Enter note title"
              />
            </div>
            <div>
              <Label htmlFor="editNoteContent">Content</Label>
              <Textarea
                id="editNoteContent"
                value={newNote.content}
                onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                placeholder="Enter note content"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setIsEditNoteOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveNote}>
              Update Note
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Product</DialogTitle>
            <DialogDescription>Add a new product to {selectedBusiness?.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="productName">Name</Label>
              <Input
                id="productName"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                placeholder="Enter product name"
              />
            </div>
            <div>
              <Label htmlFor="productPrice">Price</Label>
              <Input
                id="productPrice"
                value={newProduct.price}
                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                placeholder="Enter price"
              />
            </div>
            <div>
              <Label htmlFor="productPricingType">Pricing Type</Label>
              <Select value={newProduct.pricingType} onValueChange={(value) => setNewProduct({ ...newProduct, pricingType: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="one-off">One-off</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="productCategory">Category</Label>
              <Select value={newProduct.category} onValueChange={(value) => setNewProduct({ ...newProduct, category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {productCategories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="productSku">SKU</Label>
              <Input
                id="productSku"
                value={newProduct.sku}
                onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                placeholder="Enter SKU"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setIsAddProductOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveProduct}>
              Add Product
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditProductOpen} onOpenChange={setIsEditProductOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>Update product information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="editProductName">Name</Label>
              <Input
                id="editProductName"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                placeholder="Enter product name"
              />
            </div>
            <div>
              <Label htmlFor="editProductPrice">Price</Label>
              <Input
                id="editProductPrice"
                value={newProduct.price}
                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                placeholder="Enter price"
              />
            </div>
            <div>
              <Label htmlFor="editProductPricingType">Pricing Type</Label>
              <Select value={newProduct.pricingType} onValueChange={(value) => setNewProduct({ ...newProduct, pricingType: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="one-off">One-off</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="editProductCategory">Category</Label>
              <Select value={newProduct.category} onValueChange={(value) => setNewProduct({ ...newProduct, category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {productCategories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="editProductSku">SKU</Label>
              <Input
                id="editProductSku"
                value={newProduct.sku}
                onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                placeholder="Enter SKU"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setIsEditProductOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveProduct}>
              Update Product
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddInventoryProductOpen} onOpenChange={setIsAddInventoryProductOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Product</DialogTitle>
            <DialogDescription>Add a new product to inventory</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="inventoryProductName">Name</Label>
              <Input
                id="inventoryProductName"
                value={newInventoryProduct.name}
                onChange={(e) => setNewInventoryProduct({ ...newInventoryProduct, name: e.target.value })}
                placeholder="Enter product name"
              />
            </div>
            <div>
              <Label htmlFor="inventoryProductDescription">Description</Label>
              <Textarea
                id="inventoryProductDescription"
                value={newInventoryProduct.description}
                onChange={(e) => setNewInventoryProduct({ ...newInventoryProduct, description: e.target.value })}
                placeholder="Enter product description"
              />
            </div>
            <div>
              <Label htmlFor="inventoryProductPrice">Price (£)</Label>
              <Input
                id="inventoryProductPrice"
                type="number"
                step="0.01"
                min="0"
                value={newInventoryProduct.price}
                onChange={(e) => setNewInventoryProduct({ ...newInventoryProduct, price: e.target.value })}
                placeholder="Enter price"
              />
            </div>
            <div>
              <Label htmlFor="inventoryProductPricingType">Pricing Type</Label>
              <Select value={newInventoryProduct.pricingType} onValueChange={(value) => setNewInventoryProduct({ ...newInventoryProduct, pricingType: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="one-off">One-off</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="inventoryProductCategory">Category</Label>
              <Select value={newInventoryProduct.category} onValueChange={(value) => setNewInventoryProduct({ ...newInventoryProduct, category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {productCategories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="inventoryProductSku">SKU</Label>
              <Input
                id="inventoryProductSku"
                value={newInventoryProduct.sku}
                onChange={(e) => setNewInventoryProduct({ ...newInventoryProduct, sku: e.target.value })}
                placeholder="Enter SKU"
              />
            </div>
            <div>
              <Label htmlFor="inventoryProductStock">Stock Quantity</Label>
              <Input
                id="inventoryProductStock"
                type="number"
                min="0"
                value={newInventoryProduct.stock || 0}
                onChange={(e) => setNewInventoryProduct({ ...newInventoryProduct, stock: parseInt(e.target.value) || 0 })}
                placeholder="Enter stock quantity"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setIsAddInventoryProductOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveInventoryProduct}>
              Add Product
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditInventoryProductOpen} onOpenChange={setIsEditInventoryProductOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>Update product information and stock levels</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="editInventoryProductName">Name</Label>
              <Input
                id="editInventoryProductName"
                value={newInventoryProduct.name}
                onChange={(e) => setNewInventoryProduct({ ...newInventoryProduct, name: e.target.value })}
                placeholder="Enter product name"
              />
            </div>
            <div>
              <Label htmlFor="editInventoryProductDescription">Description</Label>
              <Textarea
                id="editInventoryProductDescription"
                value={newInventoryProduct.description}
                onChange={(e) => setNewInventoryProduct({ ...newInventoryProduct, description: e.target.value })}
                placeholder="Enter product description"
              />
            </div>
            <div>
              <Label htmlFor="editInventoryProductPrice">Price (£)</Label>
              <Input
                id="editInventoryProductPrice"
                type="number"
                step="0.01"
                min="0"
                value={newInventoryProduct.price}
                onChange={(e) => setNewInventoryProduct({ ...newInventoryProduct, price: e.target.value })}
                placeholder="Enter price"
              />
            </div>
            <div>
              <Label htmlFor="editInventoryProductPricingType">Pricing Type</Label>
              <Select value={newInventoryProduct.pricingType} onValueChange={(value) => setNewInventoryProduct({ ...newInventoryProduct, pricingType: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="one-off">One-off</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="editInventoryProductCategory">Category</Label>
              <Select value={newInventoryProduct.category} onValueChange={(value) => setNewInventoryProduct({ ...newInventoryProduct, category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {productCategories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="editInventoryProductSku">SKU</Label>
              <Input
                id="editInventoryProductSku"
                value={newInventoryProduct.sku}
                onChange={(e) => setNewInventoryProduct({ ...newInventoryProduct, sku: e.target.value })}
                placeholder="Enter SKU"
              />
            </div>
            <div>
              <Label htmlFor="editInventoryProductStock">Stock Quantity</Label>
              <Input
                id="editInventoryProductStock"
                type="number"
                min="0"
                value={newInventoryProduct.stock || 0}
                onChange={(e) => setNewInventoryProduct({ ...newInventoryProduct, stock: parseInt(e.target.value) || 0 })}
                placeholder="Enter stock quantity"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setIsEditInventoryProductOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveInventoryProduct}>
              Update Product
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Edit User' : 'Add User'}</DialogTitle>
            <DialogDescription>{editingUser ? 'Update user information' : 'Add a new user to the system'}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="userName">Name</Label>
              <Input
                id="userName"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                placeholder="Enter user name"
              />
            </div>
            <div>
              <Label htmlFor="userEmail">Email</Label>
              <Input
                id="userEmail"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                placeholder="Enter email address"
              />
            </div>
            <div>
              <Label htmlFor="userPassword">Password</Label>
              <Input
                id="userPassword"
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                placeholder={editingUser ? "Leave blank to keep current password" : "Enter password"}
              />
            </div>
            <div>
              <Label htmlFor="userRole">Role</Label>
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
              <Label htmlFor="userColor">Color</Label>
              <div className="flex items-center space-x-2">
                <div 
                  className="w-8 h-8 rounded-full border" 
                  style={{ backgroundColor: newUser.color }}
                />
                <Select value={newUser.color} onValueChange={(value) => setNewUser({ ...newUser, color: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="#3B82F6">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 rounded-full bg-blue-500" />
                        <span>Blue</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="#10B981">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 rounded-full bg-green-500" />
                        <span>Green</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="#F59E0B">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 rounded-full bg-yellow-500" />
                        <span>Yellow</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="#EF4444">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 rounded-full bg-red-500" />
                        <span>Red</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="#8B5CF6">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 rounded-full bg-purple-500" />
                        <span>Purple</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="#06B6D4">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 rounded-full bg-cyan-500" />
                        <span>Cyan</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => {
              setIsAddUserOpen(false)
              setEditingUser(null)
              setNewUser({
                name: '',
                email: '',
                password: '',
                role: 'User',
                status: 'Active',
                color: '#3B82F6'
              })
            }}>
              Cancel
            </Button>
            <Button onClick={handleSaveUser}>
              {editingUser ? 'Update User' : 'Add User'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isColorPickerOpen} onOpenChange={setIsColorPickerOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Choose Color</DialogTitle>
            <DialogDescription>
              Select a color for {selectedColorUser?.name || 'user'} calendar events
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-6 gap-3">
              {[
                '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4',
                '#84CC16', '#F97316', '#EC4899', '#6366F1', '#14B8A6', '#F43F5E'
              ].map((color) => (
                <button
                  key={color}
                  className={`w-8 h-8 rounded-full border-2 ${
                    selectedColorUser?.color === color ? 'border-gray-900' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => handleColorChange(selectedColorUser, color)}
                />
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>Upload a new document to the system</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="file">File</Label>
              <Input
                id="file"
                type="file"
                onChange={(e) => setSelectedFile(e.target.files?.[0])}
              />
            </div>
            <div>
              <Label htmlFor="uploadCategory">Category</Label>
              <Select value={uploadCategory} onValueChange={setUploadCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {documentCategories.slice(1).map(category => (
                    <SelectItem key={category.name} value={category.name}>{category.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              // Handle file upload
              setIsUploadDialogOpen(false)
              setSelectedFile(null)
            }}>
              Upload
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Calendar Task Dialog */}
      <Dialog open={isAddTaskModalOpen || isEditTaskModalOpen} onOpenChange={(open) => { setIsAddTaskModalOpen(open); setIsEditTaskModalOpen(open); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedCalendarTask ? 'Edit Task' : 'Add Task'}</DialogTitle>
            <DialogDescription>
              {selectedCalendarTask ? 'Update calendar task' : 'Add a new task to the calendar'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="calendarTaskTitle">Title</Label>
              <Input
                id="calendarTaskTitle"
                value={newTask.title}
                onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                placeholder="Enter task title"
              />
            </div>
            <div>
              <Label htmlFor="calendarTaskDescription">Description</Label>
              <Textarea
                id="calendarTaskDescription"
                value={newTask.description}
                onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                placeholder="Enter task description"
              />
            </div>
            <div>
              <Label htmlFor="calendarTaskDate">Date</Label>
              <Input
                id="calendarTaskDate"
                type="date"
                value={selectedDate || ''}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="calendarTaskRepeat">Repeat</Label>
              <Select value={taskRepeat} onValueChange={(value) => {
                setTaskRepeat(value)
                if (value !== 'custom') {
                  setCustomRepeatWeeks(1)
                }
              }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Repeat</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {taskRepeat === 'custom' && (
              <div>
                <Label htmlFor="customRepeatWeeks">Repeat Every</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="customRepeatWeeks"
                    type="number"
                    min="1"
                    value={customRepeatWeeks}
                    onChange={(e) => setCustomRepeatWeeks(parseInt(e.target.value) || 1)}
                    className="w-20"
                  />
                  <span className="text-sm text-gray-600">weeks</span>
                </div>
              </div>
            )}
            <div>
              <Label htmlFor="calendarTaskAssignee">Assignee</Label>
              <Select value={taskAssignee} onValueChange={setTaskAssignee}>
                <SelectTrigger>
                  <SelectValue placeholder="Select assignee" />
                </SelectTrigger>
                <SelectContent>
                  {users.map(user => (
                    <SelectItem key={user.id} value={String(user.id)}>
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: user.color }}
                        />
                        <span>{user.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="calendarTaskCompany">Company</Label>
              <Select value={taskCompany} onValueChange={setTaskCompany}>
                <SelectTrigger>
                  <SelectValue placeholder="Select company (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Company</SelectItem>
                  {businessList.map(business => (
                    <SelectItem key={business.id} value={String(business.id)}>
                      {business.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="calendarTaskStatus">Status</Label>
              <Select value={newTask.status} onValueChange={(value) => setNewTask({...newTask, status: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Not Started">Not Started</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => { setIsAddTaskModalOpen(false); setIsEditTaskModalOpen(false); }}>
              Cancel
            </Button>
            <Button onClick={handleSaveCalendarTask}>
              {selectedCalendarTask ? 'Update' : 'Add'} Task
            </Button>
            {selectedCalendarTask && (
              <Button 
                variant="destructive" 
                onClick={() => {
                  handleDeleteCalendarTask()
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Task
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Role Dialog */}
      <Dialog open={isEditRoleOpen} onOpenChange={setIsEditRoleOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Role Permissions</DialogTitle>
            <DialogDescription>Configure access permissions for {selectedRole}</DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-700 mb-3 flex items-center">
                  <FolderOpen className="h-4 w-4 mr-2" />
                  Accessible Tabs
                </h4>
                <div className="space-y-2">
                  {['dashboard', 'businesses', 'inventory', 'tasks', 'users', 'quotes', 'documents', 'messages', 'analytics', 'settings'].map((tab) => (
                    <div key={tab} className="flex items-center space-x-2">
                      <Switch
                        id={`tab-${tab}`}
                        checked={rolePermissions[selectedRole]?.tabs?.includes(tab) || false}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setRolePermissions(prev => ({
                              ...prev,
                              [selectedRole]: {
                                ...prev[selectedRole],
                                tabs: [...(prev[selectedRole]?.tabs || []), tab]
                              }
                            }))
                          } else {
                            setRolePermissions(prev => ({
                              ...prev,
                              [selectedRole]: {
                                ...prev[selectedRole],
                                tabs: (prev[selectedRole]?.tabs || []).filter(t => t !== tab)
                              }
                            }))
                          }
                        }}
                      />
                      <Label htmlFor={`tab-${tab}`} className="text-sm capitalize">
                        {tab.replace(/([A-Z])/g, ' $1').trim()}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-700 mb-3 flex items-center">
                  <Shield className="h-4 w-4 mr-2" />
                  Features & Permissions
                </h4>
                <div className="space-y-2">
                  {Object.entries(rolePermissions[selectedRole]?.features || {}).map(([feature, enabled]) => (
                    <div key={feature} className="flex items-center space-x-2">
                      <Switch
                        id={`feature-${feature}`}
                        checked={enabled}
                        onCheckedChange={(checked) => {
                          setRolePermissions(prev => ({
                            ...prev,
                            [selectedRole]: {
                              ...prev[selectedRole],
                              features: {
                                ...prev[selectedRole]?.features,
                                [feature]: checked
                              }
                            }
                          }))
                        }}
                      />
                      <Label htmlFor={`feature-${feature}`} className="text-sm capitalize">
                        {feature.replace(/([A-Z])/g, ' $1').trim()}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setIsEditRoleOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsEditRoleOpen(false)}>
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}