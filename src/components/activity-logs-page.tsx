'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { 
  Search, 
  Filter, 
  RefreshCw, 
  Download, 
  Eye,
  Clock,
  User,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Shield,
  Settings,
  Trash2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAuth } from '@/hooks/use-auth'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

interface LogEntry {
  id: string
  userId: string
  action: string
  targetId?: string
  targetEmail?: string
  ipAddress?: string
  userAgent?: string
  timestamp: string
  details?: string
  user: {
    id: string
    name: string
    email: string
    role: string
  }
}

interface LogsResponse {
  logs: LogEntry[]
  pagination: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
}

const getActionIcon = (action: string) => {
  switch (action) {
    case 'CREATE_USER':
      return <User className="h-4 w-4" />
    case 'UPDATE_USER':
      return <Settings className="h-4 w-4" />
    case 'UPDATE_USER_COLOR':
      return <div className="h-4 w-4 rounded-full bg-blue-500" />
    case 'DELETE_USER':
      return <XCircle className="h-4 w-4" />
    case 'DISABLE_SUPERUSER':
      return <Shield className="h-4 w-4" />
    case 'ENABLE_SUPERUSER':
      return <CheckCircle className="h-4 w-4" />
    default:
      return <Eye className="h-4 w-4" />
  }
}

const getActionColor = (action: string) => {
  switch (action) {
    case 'CREATE_USER':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'UPDATE_USER':
      return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'UPDATE_USER_COLOR':
      return 'bg-purple-100 text-purple-800 border-purple-200'
    case 'DELETE_USER':
      return 'bg-red-100 text-red-800 border-red-200'
    case 'DISABLE_SUPERUSER':
      return 'bg-orange-100 text-orange-800 border-orange-200'
    case 'ENABLE_SUPERUSER':
      return 'bg-green-100 text-green-800 border-green-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

const formatAction = (action: string) => {
  return action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

const formatTime = (timestamp: string) => {
  return new Date(timestamp).toLocaleString()
}

export default function ActivityLogsPage() {
  const { isAuthenticated, user: currentUser } = useAuth()
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filters, setFilters] = useState({
    action: 'ALL',
    limit: '50',
    search: ''
  })
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 50,
    offset: 0,
    hasMore: false
  })
  const [clearLogsDialog, setClearLogsDialog] = useState({
    open: false,
    loading: false
  })
  const [rolePermissions, setRolePermissions] = useState<any>({})
  const [permissionsLoaded, setPermissionsLoaded] = useState(false)

  // Load role permissions
  useEffect(() => {
    const loadRolePermissions = async () => {
      if (!isAuthenticated || !currentUser) return
      
      try {
        const response = await fetch('/api/roles')
        if (response.ok) {
          const roles = await response.json()
          
          // Convert roles array to rolePermissions object
          const permissions: any = {}
          roles.forEach((role: any) => {
            permissions[role.name] = {
              tabs: ['dashboard'],
              features: role.permissions || {}
            }
          })
          
          setRolePermissions(permissions)
          setPermissionsLoaded(true)
        }
      } catch (error) {
        console.error('Error loading role permissions:', error)
        setPermissionsLoaded(true)
      }
    }

    loadRolePermissions()
  }, [isAuthenticated, currentUser])

  // Permission checking function
  const hasPermission = (feature: string) => {
    if (!currentUser) return false
    
    // SuperUser has access to everything
    if (currentUser.role === 'SuperUser') {
      return true
    }
    
    // Check role-based permissions
    if (permissionsLoaded && rolePermissions[currentUser.role]) {
      return rolePermissions[currentUser.role].features?.[feature] === true
    }
    
    // Fallback: Admin can clear logs if permission is enabled
    if (currentUser.role === 'Admin' && feature === 'canClearActivityLogs') {
      return true // Temporary fallback until permissions are loaded
    }
    
    return false
  }

  const fetchLogs = async (isRefresh = false) => {
    if (!isAuthenticated || !currentUser) return

    try {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      const params = new URLSearchParams({
        limit: filters.limit,
        offset: isRefresh ? '0' : pagination.offset.toString()
      })

      if (filters.action && filters.action !== 'ALL') {
        params.append('action', filters.action)
      }

      const response = await fetch(`/api/privileged-logs?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data: LogsResponse = await response.json()
      
      if (isRefresh) {
        setLogs(data.logs)
        setPagination(data.pagination)
      } else {
        setLogs(prev => [...prev, ...data.logs])
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Error fetching logs:', error)
      toast.error('Failed to load activity logs')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated && currentUser) {
      fetchLogs(true) // Always refresh when filters change
    }
  }, [isAuthenticated, currentUser, filters.limit, filters.action])

  const handleRefresh = () => {
    fetchLogs(true)
  }

  const handleLoadMore = () => {
    const newOffset = pagination.offset + pagination.limit
    setPagination(prev => ({ ...prev, offset: newOffset }))
    fetchLogs()
  }

  const handleClearLogs = async () => {
    if (!hasPermission('canClearActivityLogs')) {
      toast.error('You do not have permission to clear logs')
      return
    }

    try {
      setClearLogsDialog(prev => ({ ...prev, loading: true }))
      
      const response = await fetch('/api/privileged-logs', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      })

      if (response.ok) {
        setLogs([])
        setPagination(prev => ({ ...prev, total: 0, offset: 0 }))
        toast.success('Activity logs cleared successfully')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to clear logs')
      }
    } catch (error) {
      console.error('Error clearing logs:', error)
      toast.error('Failed to clear logs')
    } finally {
      setClearLogsDialog(prev => ({ ...prev, loading: false, open: false }))
    }
  }

  const filteredLogs = logs.filter(log => {
    if (!filters.search) return true
    
    const searchLower = filters.search.toLowerCase()
    return (
      log.user.name.toLowerCase().includes(searchLower) ||
      log.user.email.toLowerCase().includes(searchLower) ||
      log.action.toLowerCase().includes(searchLower) ||
      (log.targetEmail && log.targetEmail.toLowerCase().includes(searchLower)) ||
      (log.details && log.details.toLowerCase().includes(searchLower))
    )
  })

  const exportLogs = () => {
    const csvContent = [
      ['Timestamp', 'Action', 'Actor', 'Actor Email', 'Target', 'IP Address', 'Details'].join(','),
      ...filteredLogs.map(log => [
        log.timestamp,
        log.action,
        log.user.name,
        log.user.email,
        log.targetEmail || '',
        log.ipAddress || '',
        log.details || ''
      ].map(field => `"${field}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `activity-logs-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
    
    toast.success('Logs exported successfully')
  }

  if (loading && logs.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Activity Logs</h2>
            <p className="text-gray-600 mt-1">Monitor all privileged actions performed by SuperUser and Admin users</p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading activity logs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Activity Logs</h2>
            <p className="text-gray-600 mt-1">Monitor all privileged actions performed by SuperUser and Admin users</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            {hasPermission('canClearActivityLogs') && (
              <Button
                variant="outline"
                onClick={() => setClearLogsDialog(prev => ({ ...prev, open: true }))}
                disabled={logs.length === 0}
                className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
                Clear Logs
              </Button>
            )}
            <Button
              onClick={exportLogs}
              disabled={filteredLogs.length === 0}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Action Type</label>
              <Select value={filters.action} onValueChange={(value) => setFilters(prev => ({ ...prev, action: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Actions</SelectItem>
                  <SelectItem value="CREATE_USER">Create User</SelectItem>
                  <SelectItem value="UPDATE_USER">Update User</SelectItem>
                  <SelectItem value="UPDATE_USER_COLOR">Update User Color</SelectItem>
                  <SelectItem value="DELETE_USER">Delete User</SelectItem>
                  <SelectItem value="DISABLE_SUPERUSER">Disable SuperUser</SelectItem>
                  <SelectItem value="ENABLE_SUPERUSER">Enable SuperUser</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Results per page</label>
              <Select value={filters.limit} onValueChange={(value) => setFilters(prev => ({ ...prev, limit: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">25 entries</SelectItem>
                  <SelectItem value="50">50 entries</SelectItem>
                  <SelectItem value="100">100 entries</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search logs..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Activity History ({filteredLogs.length} of {pagination.total})
            </span>
            {pagination.total > 0 && (
              <Badge variant="outline">
                Last updated: {formatTime(new Date().toISOString())}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12">
              <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No logs found</h3>
              <p className="text-gray-600">No activity logs match your current filters.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Action</TableHead>
                      <TableHead>Actor</TableHead>
                      <TableHead>Target</TableHead>
                      <TableHead className="hidden md:table-cell">Timestamp</TableHead>
                      <TableHead className="hidden lg:table-cell">IP Address</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          <Badge variant="outline" className={getActionColor(log.action)}>
                            <div className="flex items-center gap-1">
                              {getActionIcon(log.action)}
                              {formatAction(log.action)}
                            </div>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{log.user.name}</div>
                            <div className="text-sm text-gray-500">{log.user.email}</div>
                            <Badge variant="secondary" className="text-xs mt-1">
                              {log.user.role}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          {log.targetEmail ? (
                            <div className="text-sm">{log.targetEmail}</div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="text-sm">{formatTime(log.timestamp)}</div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="text-sm font-mono">{log.ipAddress || 'unknown'}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm max-w-xs truncate" title={log.details}>
                            {log.details || '-'}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {pagination.hasMore && (
                <div className="flex justify-center mt-6">
                  <Button
                    variant="outline"
                    onClick={handleLoadMore}
                    disabled={loading}
                  >
                    {loading ? 'Loading...' : 'Load More'}
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Clear Logs Confirmation Dialog */}
      <ConfirmDialog
        open={clearLogsDialog.open}
        onOpenChange={(open) => setClearLogsDialog(prev => ({ ...prev, open }))}
        title="Clear Activity Logs"
        description="Are you sure you want to clear all activity logs? This action cannot be undone and will permanently delete all logged privileged actions."
        confirmText="Clear Logs"
        cancelText="Cancel"
        onConfirm={handleClearLogs}
        loading={clearLogsDialog.loading}
        variant="destructive"
      />
    </div>
  )
}