'use client'

import { useState, useEffect, useCallback } from 'react'
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
  MoreHorizontal, 
  UserPlus, 
  Edit, 
  Trash2, 
  Shield, 
  Send, 
  Reply, 
  Paperclip, 
  Download, 
  Eye, 
  Share, 
  Calendar as CalendarIcon, 
  Clock, 
  CheckCircle, 
  Circle, 
  Inbox, 
  Star, 
  RefreshCw, 
  Forward
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
import * as api from '@/lib/client-api'

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

export default function BusinessHub() {
  const [stats, setStats] = useState([
    { name: 'Total Businesses', value: '0', change: '+0%', changeType: 'positive' },
    { name: 'Active Products', value: '0', change: '+0%', changeType: 'positive' },
    { name: 'Pending Quotes', value: '0', change: '+0%', changeType: 'positive' },
    { name: 'Active Tasks', value: '0', change: '+0%', changeType: 'positive' },
  ])
  const [activeTab, setActiveTab] = useState('dashboard')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All Categories')
  const [selectedLocation, setSelectedLocation] = useState('All Locations')
  const [selectedUserFilter, setSelectedUserFilter] = useState(null)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [selectedTasks, setSelectedTasks] = useState<string[]>([])
  const [filteredBusinesses, setFilteredBusinesses] = useState<any[]>([])
  const [filteredUsers, setFilteredUsers] = useState<any[]>([])
  const [isAddBusinessOpen, setIsAddBusinessOpen] = useState(false)
  const [selectedBusiness, setSelectedBusiness] = useState(null)
  const [isViewBusinessOpen, setIsViewBusinessOpen] = useState(false)
  
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  
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
  
  const [roles, setRoles] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [documents, setDocuments] = useState<any[]>([])
  const [messages, setMessages] = useState<any[]>([])
  const [businessList, setBusinessList] = useState<any[]>([])
  const [quotes, setQuotes] = useState<any[]>([])
  
  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      // Fetch data using API service
      const businessesRes = await api.getBusinesses()
      const productsRes = await api.getProducts()
      const quotesRes = await api.getQuotes()
      const tasksRes = await api.getTasks()
      
      // Update stats
      setStats([
        { name: 'Total Businesses', value: String(businessesRes.data.length || 0), change: '+12%', changeType: 'positive' },
        { name: 'Active Products', value: String(productsRes.data.filter(p => p.status === 'active').length || 0), change: '+23%', changeType: 'positive' },
        { name: 'Pending Quotes', value: String(quotesRes.data.filter(q => q.status === 'pending').length || 0), change: '+5%', changeType: 'positive' },
        { name: 'Active Tasks', value: String(tasksRes.data.filter(t => t.status !== 'completed').length || 0), change: '+8%', changeType: 'positive' },
      ])
      
      // Set data for other components
      setBusinessList(businessesRes.data || [])
      setProducts(productsRes.data || [])
      setQuotes(quotesRes.data || [])
      setTasks(tasksRes.data || [])
      
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
      // Set fallback data
      setStats([
        { name: 'Total Businesses', value: '0', change: '+0%', changeType: 'positive' },
        { name: 'Active Products', value: '0', change: '+0%', changeType: 'positive' },
        { name: 'Pending Quotes', value: '0', change: '+0%', changeType: 'positive' },
        { name: 'Active Tasks', value: '0', change: '+0%', changeType: 'positive' },
      ])
    }
  }, [])

  // Load dashboard data on mount
  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  // Load users and roles data
  useEffect(() => {
    const fetchUsersAndRoles = async () => {
      try {
        const usersRes = await api.getUsers()
        const rolesRes = await api.getRoles()
        setUsers(usersRes.data || [])
        setRoles(rolesRes.data || [])
      } catch (error) {
        console.error('Failed to fetch users and roles:', error)
      }
    }
    fetchUsersAndRoles()
  }, [])

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

  // Apply filters when dependencies change
  useEffect(() => {
    filterBusinesses()
    filterUsers()
  }, [filterBusinesses, filterUsers])

  // Check if user has permission to access a tab
  const hasTabPermission = (tabName: string) => {
    if (!currentUser) return false
    
    const userRole = currentUser.role || 'User'
    const roleConfig = rolePermissions[userRole]
    
    return roleConfig?.tabs?.includes(tabName) || false
  }

  // Check if user has permission for a feature
  const hasFeaturePermission = (featureName: string) => {
    if (!currentUser) return false
    
    const userRole = currentUser.role || 'User'
    const roleConfig = rolePermissions[userRole]
    
    return roleConfig?.features?.[featureName] || false
  }

  // Main render
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <header className="bg-white shadow-sm border-b">
        <div className="flex items-center justify-between h-16 px-4">
          <div className="flex items-center">
            <Building2 className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">BusinessHub</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            
            <Button variant="ghost" size="sm">
              <Bell className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-gray-700">User</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex">
        {/* Sidebar Navigation */}
        <nav className="w-64 bg-white border-r min-h-screen">
          <div className="p-4">
            <div className="space-y-1">
              {navigation.map((item) => {
                if (item.requiredPermission && !hasFeaturePermission(item.requiredPermission)) {
                  return null
                }
                
                if (!hasTabPermission(item.tab)) {
                  return null
                }
                
                return (
                  <button
                    key={item.name}
                    onClick={() => setActiveTab(item.tab)}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeTab === item.tab
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </button>
                )
              })}
            </div>
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="flex-1 p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-10">
              {navigation.map((item) => {
                if (item.requiredPermission && !hasFeaturePermission(item.requiredPermission)) {
                  return null
                }
                
                if (!hasTabPermission(item.tab)) {
                  return null
                }
                
                return (
                  <TabsTrigger key={item.tab} value={item.tab} className="text-xs">
                    {item.name}
                  </TabsTrigger>
                )
              })}
            </TabsList>

            {/* Dashboard Tab */}
            <TabsContent value="dashboard" className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Business
                </Button>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                  <Card key={stat.name}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                          <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                        </div>
                        <div className={`text-sm font-medium ${
                          stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {stat.change}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest updates across your business</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="/placeholder.svg" />
                        <AvatarFallback>JD</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">John Doe added a new business</p>
                        <p className="text-sm text-gray-500">2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="/placeholder.svg" />
                        <AvatarFallback>JS</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Jane Smith completed a task</p>
                        <p className="text-sm text-gray-500">4 hours ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Business Directory Tab */}
            <TabsContent value="businesses" className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Business Directory</h1>
                <Button onClick={() => setIsAddBusinessOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Business
                </Button>
              </div>

              {/* Filters */}
              <div className="flex items-center space-x-4">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select location" />
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

              {/* Business List */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBusinesses.map((business) => (
                  <Card key={business.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{business.name}</CardTitle>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setSelectedBusiness(business)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setSelectedBusiness(business)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <CardDescription>{business.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="h-4 w-4 mr-2" />
                          {business.location}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Building2 className="h-4 w-4 mr-2" />
                          {business.category}
                        </div>
                        <Badge variant="secondary">{business.status || 'Active'}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users" className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Users</h1>
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add User
                </Button>
              </div>

              {/* Users List */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredUsers.map((user) => (
                  <Card key={user.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-lg">{user.name}</CardTitle>
                            <CardDescription>{user.email}</CardDescription>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Role</span>
                          <Badge variant="outline">{user.role}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Status</span>
                          <Badge variant={user.status === 'Active' ? 'default' : 'secondary'}>
                            {user.status}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Other tabs can be added similarly... */}
            <TabsContent value="inventory">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Inventory</h1>
              <p>Inventory management coming soon...</p>
            </TabsContent>

            <TabsContent value="tasks">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Tasks</h1>
              <p>Task management coming soon...</p>
            </TabsContent>

            <TabsContent value="quotes">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Quotes</h1>
              <p>Quote management coming soon...</p>
            </TabsContent>

            <TabsContent value="documents">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Documents</h1>
              <p>Document management coming soon...</p>
            </TabsContent>

            <TabsContent value="messages">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Messages</h1>
              <p>Message management coming soon...</p>
            </TabsContent>

            <TabsContent value="analytics">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Analytics</h1>
              <p>Analytics dashboard coming soon...</p>
            </TabsContent>

            <TabsContent value="settings">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>
              <p>Settings management coming soon...</p>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}