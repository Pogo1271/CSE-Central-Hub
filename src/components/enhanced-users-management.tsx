'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { 
  Users, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Shield, 
  Settings,
  UserPlus,
  Eye,
  MoreHorizontal,
  Check,
  X,
  User,
  Building2,
  FileText,
  BarChart3,
  MessageSquare,
  Package,
  CheckSquare,
  Bell,
  Upload,
  Send
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/hooks/use-auth'

// Import client API
import * as api from '@/lib/client-api'

interface User {
  id: string
  name: string
  email: string
  role: string
  status: string
  color: string
  lastLogin?: string
  joined: string
  createdAt: string
  updatedAt: string
}

interface Role {
  id: string
  name: string
  description?: string
  color?: string
  permissions: any
  createdAt: string
  updatedAt: string
}

interface Permission {
  key: string
  label: string
  description: string
  icon: any
  category: string
}

const permissions: Permission[] = [
  // Dashboard Permissions
  { key: 'canViewDashboard', label: 'View Dashboard', description: 'Access to main dashboard', icon: BarChart3, category: 'dashboard' },
  
  // Dashboard Quick Actions Permissions
  { key: 'canQuickAddBusiness', label: 'Quick Add Business', description: 'Show "Add Business" quick action on dashboard', icon: Building2, category: 'dashboard' },
  { key: 'canQuickCreateUser', label: 'Quick Create User', description: 'Show "Create User" quick action on dashboard', icon: UserPlus, category: 'dashboard' },
  { key: 'canQuickUploadDocument', label: 'Quick Upload Document', description: 'Show "Upload Document" quick action on dashboard', icon: Upload, category: 'dashboard' },
  { key: 'canQuickSendMessage', label: 'Quick Send Message', description: 'Show "Send Message" quick action on dashboard', icon: Send, category: 'dashboard' },
  
  // Business Permissions
  { key: 'canCreateBusiness', label: 'Create Business', description: 'Add new businesses', icon: Building2, category: 'businesses' },
  { key: 'canEditBusiness', label: 'Edit Business', description: 'Modify business details', icon: Building2, category: 'businesses' },
  { key: 'canDeleteBusiness', label: 'Delete Business', description: 'Remove businesses', icon: Building2, category: 'businesses' },
  
  // User Management Permissions
  { key: 'canCreateUser', label: 'Create User', description: 'Add new users', icon: UserPlus, category: 'users' },
  { key: 'canEditUser', label: 'Edit User', description: 'Modify user details', icon: Edit, category: 'users' },
  { key: 'canDeleteUser', label: 'Delete User', description: 'Remove users', icon: Trash2, category: 'users' },
  { key: 'canManageRoles', label: 'Manage Roles', description: 'Create and modify roles', icon: Shield, category: 'users' },
  
  // Product/Inventory Permissions
  { key: 'canCreateProduct', label: 'Create Product', description: 'Add new products', icon: Package, category: 'products' },
  { key: 'canEditProduct', label: 'Edit Product', description: 'Modify product details', icon: Package, category: 'products' },
  { key: 'canDeleteProduct', label: 'Delete Product', description: 'Remove products', icon: Package, category: 'products' },
  
  // Task Management Permissions
  { key: 'canCreateTask', label: 'Create Task', description: 'Add new tasks', icon: CheckSquare, category: 'tasks' },
  { key: 'canEditTask', label: 'Edit Task', description: 'Modify task details', icon: CheckSquare, category: 'tasks' },
  { key: 'canDeleteTask', label: 'Delete Task', description: 'Remove tasks', icon: CheckSquare, category: 'tasks' },
  { key: 'canAssignTasks', label: 'Assign Tasks', description: 'Assign tasks to users', icon: CheckSquare, category: 'tasks' },
  
  // Quote Management Permissions
  { key: 'canCreateQuote', label: 'Create Quote', description: 'Create new quotes', icon: FileText, category: 'quotes' },
  { key: 'canEditQuote', label: 'Edit Quote', description: 'Modify quote details', icon: FileText, category: 'quotes' },
  { key: 'canDeleteQuote', label: 'Delete Quote', description: 'Remove quotes', icon: FileText, category: 'quotes' },
  { key: 'canApproveQuotes', label: 'Approve Quotes', description: 'Approve quote submissions', icon: FileText, category: 'quotes' },
  
  // Document Management Permissions
  { key: 'canUploadDocument', label: 'Upload Document', description: 'Upload new documents', icon: FileText, category: 'documents' },
  { key: 'canDeleteDocument', label: 'Delete Document', description: 'Remove documents', icon: FileText, category: 'documents' },
  
  // Message Permissions
  { key: 'canSendMessage', label: 'Send Message', description: 'Send messages to users', icon: MessageSquare, category: 'messages' },
  { key: 'canDeleteMessage', label: 'Delete Message', description: 'Remove messages', icon: MessageSquare, category: 'messages' },
  
  // Analytics Permissions
  { key: 'canExportData', label: 'Export Data', description: 'Export system data', icon: BarChart3, category: 'analytics' },
  
  // System Permissions
  { key: 'canAccessSettings', label: 'Access Settings', description: 'Access system settings', icon: Settings, category: 'system' },
  { key: 'canViewSystemLogs', label: 'View System Logs', description: 'Access system logs', icon: Settings, category: 'system' },
  { key: 'canManageNotifications', label: 'Manage Notifications', description: 'Manage system notifications', icon: Bell, category: 'system' },
  { key: 'canClearActivityLogs', label: 'Clear Activity Logs', description: 'Clear and delete activity logs', icon: Settings, category: 'system' },
  
  // Page Access Permissions (controls sidebar visibility and data access)
  { key: 'canViewDashboardPage', label: 'Dashboard Page', description: 'Access Dashboard and view its data', icon: BarChart3, category: 'pages' },
  { key: 'canViewBusinessesPage', label: 'Businesses Page', description: 'Access Businesses and view business data', icon: Building2, category: 'pages' },
  { key: 'canViewInventoryPage', label: 'Inventory Page', description: 'Access Inventory and view product data', icon: Package, category: 'pages' },
  { key: 'canViewTasksPage', label: 'Tasks Page', description: 'Access Tasks and view task data', icon: CheckSquare, category: 'pages' },
  { key: 'canViewUsersPage', label: 'Users Page', description: 'Access Users and view user data', icon: Users, category: 'pages' },
  { key: 'canViewQuotesPage', label: 'Quotes Page', description: 'Access Quotes and view quote data', icon: FileText, category: 'pages' },
  { key: 'canViewDocumentsPage', label: 'Documents Page', description: 'Access Documents and view document data', icon: FileText, category: 'pages' },
  { key: 'canViewMessagesPage', label: 'Messages Page', description: 'Access Messages and view message data', icon: MessageSquare, category: 'pages' },
  { key: 'canViewAnalyticsPage', label: 'Analytics Page', description: 'Access Analytics and view analytics data', icon: BarChart3, category: 'pages' },
  { key: 'canViewActivityLogsPage', label: 'Activity Logs Page', description: 'Access Activity Logs and view privileged actions data', icon: BarChart3, category: 'pages' },
  { key: 'canViewEmergencyControlPage', label: 'Emergency Control Page', description: 'Access Emergency Control and manage system emergency features', icon: Settings, category: 'pages' },
  { key: 'canViewSettingsPage', label: 'Settings Page', description: 'Access Settings and view configuration data', icon: Settings, category: 'pages' }
]

const permissionCategories = [
  { key: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { key: 'businesses', label: 'Businesses', icon: Building2 },
  { key: 'users', label: 'Users', icon: Users },
  { key: 'products', label: 'Products', icon: Package },
  { key: 'tasks', label: 'Tasks', icon: CheckSquare },
  { key: 'quotes', label: 'Quotes', icon: FileText },
  { key: 'documents', label: 'Documents', icon: FileText },
  { key: 'messages', label: 'Messages', icon: MessageSquare },
  { key: 'analytics', label: 'Analytics', icon: BarChart3 },
  { key: 'system', label: 'System', icon: Settings },
  { key: 'pages', label: 'Pages', icon: Eye }
]

export default function EnhancedUsersManagement() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  
  // Permission checking function
  const hasPermission = (feature: string) => {
    if (!currentUser) return false
    
    // Find the user's role
    const userRole = roles.find(role => role.name === currentUser.role)
    if (!userRole) return false
    
    return userRole.permissions?.[feature] === true
  }
  
  // Modal states
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [isEditUserOpen, setIsEditUserOpen] = useState(false)
  const [isViewUserOpen, setIsViewUserOpen] = useState(false)
  const [isRoleManagementOpen, setIsRoleManagementOpen] = useState(false)
  const [isAddRoleOpen, setIsAddRoleOpen] = useState(false)
  
  // Form states
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [selectedRoleForEdit, setSelectedRoleForEdit] = useState<Role | null>(null)
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'User',
    status: 'Active',
    color: '#3B82F6'
  })
  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    color: '#3B82F6',
    permissions: {}
  })
  
  // Tab states for permission modals
  const [addRoleActiveTab, setAddRoleActiveTab] = useState('dashboard')
  const [editRoleActiveTab, setEditRoleActiveTab] = useState('dashboard')

  // All users (no filtering)
  const displayUsers = users

  // Load data
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Load users
      const usersResponse = await api.getUsers()
      if (usersResponse.success) {
        setUsers(usersResponse.data)
      }
      
      // Load roles
      const rolesResponse = await fetch('/api/roles')
      if (rolesResponse.ok) {
        const rolesData = await rolesResponse.json()
        setRoles(rolesData)
      }
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date: string) => {
    try {
      const d = new Date(date)
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch (error) {
      return 'Invalid date'
    }
  }

  const handleAddUser = async () => {
    try {
      const response = await api.createUser(newUser)
      if (response.success) {
        setUsers([...users, response.data])
        setIsAddUserOpen(false)
        setNewUser({
          name: '',
          email: '',
          password: '',
          role: 'User',
          status: 'Active',
          color: '#3B82F6'
        })
        toast.success('User created successfully')
      }
    } catch (error) {
      console.error('Error creating user:', error)
      toast.error('Failed to create user')
    }
  }

  const handleUpdateUser = async () => {
    if (!selectedUser) return
    
    try {
      const response = await api.updateUser(selectedUser.id, selectedUser)
      if (response.success) {
        setUsers(users.map(u => u.id === selectedUser.id ? response.data : u))
        setIsEditUserOpen(false)
        setSelectedUser(null)
        toast.success('User updated successfully')
      }
    } catch (error) {
      console.error('Error updating user:', error)
      toast.error('Failed to update user')
    }
  }

  const handleDeleteUser = async (userId: string) => {
    // Find the user to check if they are a SuperUser
    const userToDelete = users.find(u => u.id === userId)
    
    if (userToDelete?.role === 'SuperUser') {
      toast.error('Cannot delete SuperUser account')
      return
    }
    
    if (!confirm('Are you sure you want to delete this user?')) return
    
    try {
      const response = await api.deleteUser(userId)
      if (response.success) {
        setUsers(users.filter(u => u.id !== userId))
        toast.success('User deleted successfully')
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      toast.error('Failed to delete user')
    }
  }

  const handleAddRole = async () => {
    try {
      const response = await fetch('/api/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRole)
      })
      
      if (response.ok) {
        const role = await response.json()
        setRoles([...roles, role])
        setIsAddRoleOpen(false)
        setNewRole({
          name: '',
          description: '',
          color: '#3B82F6',
          permissions: {}
        })
        toast.success('Role created successfully')
      }
    } catch (error) {
      console.error('Error creating role:', error)
      toast.error('Failed to create role')
    }
  }

  const handleUpdateRole = async () => {
    if (!selectedRoleForEdit) return
    
    try {
      const response = await fetch(`/api/roles/${selectedRoleForEdit.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedRoleForEdit)
      })
      
      if (response.ok) {
        const updatedRole = await response.json()
        setRoles(roles.map(r => r.id === selectedRoleForEdit.id ? updatedRole : r))
        setSelectedRoleForEdit(null)
        toast.success('Role updated successfully')
      }
    } catch (error) {
      console.error('Error updating role:', error)
      toast.error('Failed to update role')
    }
  }

  const handlePermissionToggle = (roleKey: string, permissionKey: string, enabled: boolean) => {
    if (roleKey === 'new') {
      setNewRole(prev => ({
        ...prev,
        permissions: {
          ...prev.permissions,
          [permissionKey]: enabled
        }
      }))
    } else {
      setSelectedRoleForEdit(prev => {
        if (!prev) return null
        return {
          ...prev,
          permissions: {
            ...prev.permissions,
            [permissionKey]: enabled
          }
        }
      })
    }
  }

  

  // Admin and SuperUser protection
  if (currentUser?.role !== 'Admin' && currentUser?.role !== 'SuperUser') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Denied</h3>
            <p className="text-gray-600">You don't have permission to access this page.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Users Management Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600 mt-1">Manage team members and their permissions</p>
            <p className="text-sm text-gray-500 mt-2">Total Users: {users.length}</p>
          </div>
          <div className="flex space-x-3">
            <Button 
              variant="outline" 
              onClick={() => setIsRoleManagementOpen(true)}
            >
              <Shield className="h-4 w-4 mr-2" />
              Manage Roles
            </Button>
            {hasPermission('canCreateUser') && (
              <Button onClick={() => setIsAddUserOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            )}
          </div>
        </div>
      </div>

  

      {/* Users Grid */}
      {loading ? (
        <Card className="bg-white shadow-sm">
          <CardContent className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading users...</p>
          </CardContent>
        </Card>
      ) : displayUsers.length === 0 ? (
        <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search criteria or create a new user.</p>
            {hasPermission('canCreateUser') && (
              <Button onClick={() => setIsAddUserOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayUsers.map((user) => {
            return (
              <Card 
                key={user.id} 
                className="bg-white shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer group"
                onClick={() => {
                  setSelectedUser(user)
                  setIsViewUserOpen(true)
                }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate group-hover:text-blue-600 transition-colors">
                        {user.name}
                      </CardTitle>
                      <CardDescription className="text-sm line-clamp-2 mt-1">
                        {user.email}
                      </CardDescription>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <Badge className={
                        user.status === 'Active' 
                          ? "bg-green-100 text-green-800 hover:bg-green-200" 
                          : "bg-red-100 text-red-800 hover:bg-red-200"
                      }>
                        {user.status}
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
                            e.stopPropagation()
                            setSelectedUser(user)
                            setIsViewUserOpen(true)
                          }}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedUser(user)
                              setIsEditUserOpen(true)
                            }}
                            disabled={user.role === 'SuperUser' && currentUser?.role !== 'SuperUser'}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit User
                          </DropdownMenuItem>
                          {hasPermission('canDeleteUser') && user.role !== 'SuperUser' && (
                              <DropdownMenuItem 
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDeleteUser(user.id)
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
                    {/* Role */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Role</span>
                      <Badge variant={user.role === 'Admin' ? 'default' : 'secondary'}>
                        {user.role}
                      </Badge>
                    </div>
                    
                    {/* Join Date */}
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="truncate">Joined {formatDate(user.joined)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Add User Modal */}
      <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Create a new user account with specific role and permissions.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={newUser.name}
                onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                placeholder="Enter full name"
              />
            </div>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                placeholder="Enter email address"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                placeholder="Enter password"
              />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
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
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={newUser.status} onValueChange={(value) => setNewUser({...newUser, status: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="color">Color</Label>
              <Input
                id="color"
                type="color"
                value={newUser.color}
                onChange={(e) => setNewUser({...newUser, color: e.target.value})}
              />
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

      {/* Edit User Modal */}
      <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Modify user details and permissions.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Full Name</Label>
                <Input
                  id="edit-name"
                  value={selectedUser.name}
                  onChange={(e) => setSelectedUser({...selectedUser, name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit-email">Email Address</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={selectedUser.email}
                  onChange={(e) => setSelectedUser({...selectedUser, email: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit-role">Role</Label>
                <Select 
                  value={selectedUser.role} 
                  onValueChange={(value) => setSelectedUser({...selectedUser, role: value})}
                  disabled={selectedUser.role === 'SuperUser' && currentUser?.role !== 'SuperUser'}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="User">User</SelectItem>
                    <SelectItem value="Manager">Manager</SelectItem>
                    <SelectItem value="Admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                {selectedUser.role === 'SuperUser' && currentUser?.role !== 'SuperUser' && (
                  <p className="text-sm text-red-600 mt-1">Only SuperUser can modify SuperUser accounts</p>
                )}
              </div>
              <div>
                <Label htmlFor="edit-status">Status</Label>
                <Select value={selectedUser.status} onValueChange={(value) => setSelectedUser({...selectedUser, status: value})}>
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
                <Label htmlFor="edit-color">Color</Label>
                <Input
                  id="edit-color"
                  type="color"
                  value={selectedUser.color || '#3B82F6'}
                  onChange={(e) => setSelectedUser({...selectedUser, color: e.target.value})}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsEditUserOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleUpdateUser}
                  disabled={selectedUser.role === 'SuperUser' && currentUser?.role !== 'SuperUser'}
                >
                  Update User
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Role Management Modal */}
      <Dialog open={isRoleManagementOpen} onOpenChange={setIsRoleManagementOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Role Management</DialogTitle>
            <DialogDescription>
              Manage user roles and their permissions.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Roles</h3>
              <Button onClick={() => {
                setIsAddRoleOpen(true)
                setAddRoleActiveTab('dashboard')
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Role
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {roles
                .filter(role => currentUser?.role === 'SuperUser' || role.name !== 'SuperUser')
                .map((role) => (
                <Card key={role.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{role.name}</CardTitle>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedRoleForEdit(role)
                          setEditRoleActiveTab('dashboard')
                        }}
                        disabled={role.name === 'SuperUser' && currentUser?.role !== 'SuperUser'}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                    {role.description && (
                      <CardDescription>{role.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-sm text-gray-600">
                        <strong>Permissions:</strong> {Object.keys(role.permissions || {}).filter(key => role.permissions[key] === true).length} enabled
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(role.permissions || {})
                          .filter(([_, enabled]) => enabled === true)
                          .slice(0, 3)
                          .map(([key]) => {
                            const permission = permissions.find(p => p.key === key)
                            return permission ? (
                              <Badge key={key} variant="secondary" className="text-xs">
                                {permission.label}
                              </Badge>
                            ) : null
                          })}
                        {Object.keys(role.permissions || {}).filter(key => role.permissions[key] === true).length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{Object.keys(role.permissions || {}).filter(key => role.permissions[key] === true).length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Role Modal */}
      <Dialog open={isAddRoleOpen} onOpenChange={setIsAddRoleOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Role</DialogTitle>
            <DialogDescription>
              Create a new role with specific permissions.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="role-name">Role Name</Label>
                <Input
                  id="role-name"
                  value={newRole.name}
                  onChange={(e) => setNewRole({...newRole, name: e.target.value})}
                  placeholder="Enter role name"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="role-description">Description</Label>
              <Textarea
                id="role-description"
                value={newRole.description}
                onChange={(e) => setNewRole({...newRole, description: e.target.value})}
                placeholder="Enter role description"
                rows={3}
              />
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Permissions</h4>
              <div className="flex gap-6">
                {/* Sidebar with categories */}
                <div className="w-48 space-y-2">
                  {permissionCategories.map(category => (
                    <button
                      key={category.key}
                      onClick={() => setAddRoleActiveTab(category.key)}
                      className={`w-full flex items-center space-x-2 p-2 text-left rounded-md transition-colors ${addRoleActiveTab === category.key ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
                    >
                      <category.icon className="h-4 w-4" />
                      <span className="text-sm font-medium">{category.label}</span>
                    </button>
                  ))}
                </div>
                
                {/* Permissions content */}
                <div className="flex-1">
                  <Tabs value={addRoleActiveTab} onValueChange={setAddRoleActiveTab} className="w-full">
                    <TabsList className="hidden">
                      {permissionCategories.map(category => (
                        <TabsTrigger key={category.key} value={category.key}>
                          {category.label}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    
                    {permissionCategories.map(category => (
                      <TabsContent key={category.key} value={category.key} className="space-y-3">
                        <div className="mb-4">
                          <h5 className="font-medium text-gray-900 flex items-center space-x-2">
                            <category.icon className="h-5 w-5" />
                            <span>{category.label} Permissions</span>
                          </h5>
                        </div>
                        <div className="space-y-3">
                          {permissions
                            .filter(p => p.category === category.key)
                            .map(permission => (
                              <div key={permission.key} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                                <Switch
                                  id={`new-${permission.key}`}
                                  checked={newRole.permissions[permission.key] === true}
                                  onCheckedChange={(checked) => handlePermissionToggle('new', permission.key, checked)}
                                  className="mt-1"
                                />
                                <div className="flex-1 min-w-0">
                                  <Label htmlFor={`new-${permission.key}`} className="text-sm font-medium cursor-pointer">
                                    {permission.label}
                                  </Label>
                                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">{permission.description}</p>
                                </div>
                              </div>
                            ))}
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsAddRoleOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddRole}>
                Add Role
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Role Modal */}
      <Dialog open={!!selectedRoleForEdit} onOpenChange={() => setSelectedRoleForEdit(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
            <DialogDescription>
              Modify role permissions.
            </DialogDescription>
          </DialogHeader>
          {selectedRoleForEdit && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="edit-role-name">Role Name</Label>
                  <Input
                    id="edit-role-name"
                    value={selectedRoleForEdit.name}
                    onChange={(e) => setSelectedRoleForEdit({...selectedRoleForEdit, name: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-role-description">Description</Label>
                <Textarea
                  id="edit-role-description"
                  value={selectedRoleForEdit.description || ''}
                  onChange={(e) => setSelectedRoleForEdit({...selectedRoleForEdit, description: e.target.value})}
                  rows={3}
                />
              </div>
              
              <div>
                <h4 className="text-lg font-semibold mb-4">Permissions</h4>
                <div className="flex gap-6">
                  {/* Sidebar with categories */}
                  <div className="w-48 space-y-2">
                    {permissionCategories.map(category => (
                      <button
                        key={category.key}
                        onClick={() => setEditRoleActiveTab(category.key)}
                        className={`w-full flex items-center space-x-2 p-2 text-left rounded-md transition-colors ${editRoleActiveTab === category.key ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
                      >
                        <category.icon className="h-4 w-4" />
                        <span className="text-sm font-medium">{category.label}</span>
                      </button>
                    ))}
                  </div>
                  
                  {/* Permissions content */}
                  <div className="flex-1">
                    <Tabs value={editRoleActiveTab} onValueChange={setEditRoleActiveTab} className="w-full">
                      <TabsList className="hidden">
                        {permissionCategories.map(category => (
                          <TabsTrigger key={category.key} value={category.key}>
                            {category.label}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                      
                      {permissionCategories.map(category => (
                        <TabsContent key={category.key} value={category.key} className="space-y-3">
                          <div className="mb-4">
                            <h5 className="font-medium text-gray-900 flex items-center space-x-2">
                              <category.icon className="h-5 w-5" />
                              <span>{category.label} Permissions</span>
                            </h5>
                          </div>
                          <div className="space-y-3">
                            {permissions
                              .filter(p => p.category === category.key)
                              .map(permission => (
                                <div key={permission.key} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                                  <Switch
                                    id={`edit-${permission.key}`}
                                    checked={selectedRoleForEdit.permissions?.[permission.key] === true}
                                    onCheckedChange={(checked) => handlePermissionToggle('edit', permission.key, checked)}
                                    className="mt-1"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <Label htmlFor={`edit-${permission.key}`} className="text-sm font-medium cursor-pointer">
                                      {permission.label}
                                    </Label>
                                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{permission.description}</p>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </TabsContent>
                      ))}
                    </Tabs>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setSelectedRoleForEdit(null)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateRole}>
                  Update Role
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* View User Modal */}
      <Dialog open={isViewUserOpen} onOpenChange={setIsViewUserOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback style={{ backgroundColor: selectedUser.color }}>
                    {selectedUser.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">{selectedUser.name}</h3>
                  <p className="text-gray-600">{selectedUser.email}</p>
                  <Badge variant={selectedUser.role === 'Admin' ? 'default' : 'secondary'} className="mt-1">
                    {selectedUser.role}
                  </Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-gray-500">Status</Label>
                  <p className="font-medium">{selectedUser.status}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Joined</Label>
                  <p className="font-medium">{formatDate(selectedUser.joined)}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Last Login</Label>
                  <p className="font-medium">
                    {selectedUser.lastLogin ? formatDate(selectedUser.lastLogin) : 'Never'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Color</Label>
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-4 h-4 rounded-full border" 
                      style={{ backgroundColor: selectedUser.color }}
                    />
                    <span className="font-medium">{selectedUser.color}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsViewUserOpen(false)}>
                  Close
                </Button>
                <Button 
                  onClick={() => {
                    setIsViewUserOpen(false)
                    setIsEditUserOpen(true)
                  }}
                  disabled={selectedUser.role === 'SuperUser' && currentUser?.role !== 'SuperUser'}
                >
                  Edit User
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}