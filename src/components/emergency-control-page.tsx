'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Power, 
  PowerOff,
  Clock,
  User,
  Activity,
  RefreshCw,
  Settings,
  AlertCircle,
  Info
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useAuth } from '@/hooks/use-auth'

interface SystemConfig {
  key: string
  value: string
  description?: string
  updatedAt: string
}

interface SuperUserStatus {
  superUserDisabled: boolean
  systemConfigs: SystemConfig[]
}

interface ActivityLog {
  id: string
  action: string
  timestamp: string
  details?: string
  user: {
    name: string
    email: string
    role: string
  }
}

export default function EmergencyControlPage() {
  const { isAuthenticated, user: currentUser } = useAuth()
  const [status, setStatus] = useState<SuperUserStatus | null>(null)
  const [recentActivity, setRecentActivity] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [showDisableDialog, setShowDisableDialog] = useState(false)
  const [showEnableDialog, setShowEnableDialog] = useState(false)
  const [disableReason, setDisableReason] = useState('')

  const fetchStatus = async () => {
    if (!isAuthenticated || !currentUser) return

    try {
      const response = await fetch('/api/system/superuser', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data: SuperUserStatus = await response.json()
      setStatus(data)
    } catch (error) {
      console.error('Error fetching SuperUser status:', error)
      toast.error('Failed to fetch SuperUser status')
    }
  }

  const fetchRecentActivity = async () => {
    if (!isAuthenticated || !currentUser) return

    try {
      const response = await fetch('/api/privileged-logs?limit=10&action=DISABLE_SUPERUSER&action=ENABLE_SUPERUSER', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      setRecentActivity(data.logs || [])
    } catch (error) {
      console.error('Error fetching recent activity:', error)
      // Don't show error toast for this as it's not critical
    }
  }

  useEffect(() => {
    if (isAuthenticated && currentUser) {
      const loadData = async () => {
        setLoading(true)
        await Promise.all([fetchStatus(), fetchRecentActivity()])
        setLoading(false)
      }
      loadData()
    }
  }, [isAuthenticated, currentUser])

  const handleDisableSuperUser = async () => {
    if (!disableReason.trim()) {
      toast.error('Please provide a reason for disabling SuperUser access')
      return
    }

    setActionLoading(true)
    try {
      const response = await fetch('/api/system/superuser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          action: 'disable',
          reason: disableReason
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      toast.success('SuperUser access has been disabled')
      setShowDisableDialog(false)
      setDisableReason('')
      await fetchStatus()
      await fetchRecentActivity()
    } catch (error) {
      console.error('Error disabling SuperUser:', error)
      toast.error('Failed to disable SuperUser access')
    } finally {
      setActionLoading(false)
    }
  }

  const handleEnableSuperUser = async () => {
    setActionLoading(true)
    try {
      const response = await fetch('/api/system/superuser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          action: 'enable'
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      toast.success('SuperUser access has been enabled')
      setShowEnableDialog(false)
      await fetchStatus()
      await fetchRecentActivity()
    } catch (error) {
      console.error('Error enabling SuperUser:', error)
      toast.error('Failed to enable SuperUser access')
    } finally {
      setActionLoading(false)
    }
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  const getStatusColor = (disabled: boolean) => {
    return disabled 
      ? 'bg-red-100 text-red-800 border-red-200' 
      : 'bg-green-100 text-green-800 border-green-200'
  }

  const getStatusIcon = (disabled: boolean) => {
    return disabled ? <PowerOff className="h-5 w-5" /> : <Power className="h-5 w-5" />
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Emergency Control</h2>
            <p className="text-gray-600 mt-1">Manage SuperUser access and emergency security controls</p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading emergency control panel...</p>
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
            <h2 className="text-2xl font-bold text-gray-900">Emergency Control</h2>
            <p className="text-gray-600 mt-1">Manage SuperUser access and emergency security controls</p>
          </div>
          <Button
            variant="outline"
            onClick={() => Promise.all([fetchStatus(), fetchRecentActivity()])}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Status Card */}
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            SuperUser Access Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {status && getStatusIcon(status.superUserDisabled)}
                  <div>
                    <div className="font-medium">SuperUser Access</div>
                    <div className="text-sm text-gray-500">
                      {status?.superUserDisabled ? 'Currently disabled' : 'Currently enabled'}
                    </div>
                  </div>
                </div>
                <Badge className={status ? getStatusColor(status.superUserDisabled) : ''}>
                  {status?.superUserDisabled ? 'DISABLED' : 'ENABLED'}
                </Badge>
              </div>

              <div className="flex gap-2">
                {status?.superUserDisabled ? (
                  <Dialog open={showEnableDialog} onOpenChange={setShowEnableDialog}>
                    <DialogTrigger asChild>
                      <Button className="flex items-center gap-2">
                        <Power className="h-4 w-4" />
                        Enable SuperUser
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Enable SuperUser Access</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to enable SuperUser access? This will restore full administrative privileges to the SuperUser account.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="flex justify-end gap-2 mt-4">
                        <Button variant="outline" onClick={() => setShowEnableDialog(false)}>
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleEnableSuperUser}
                          disabled={actionLoading}
                          className="flex items-center gap-2"
                        >
                          {actionLoading ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          ) : (
                            <Power className="h-4 w-4" />
                          )}
                          Enable Access
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                ) : (
                  <Dialog open={showDisableDialog} onOpenChange={setShowDisableDialog}>
                    <DialogTrigger asChild>
                      <Button variant="destructive" className="flex items-center gap-2">
                        <PowerOff className="h-4 w-4" />
                        Disable SuperUser
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-red-600" />
                          Disable SuperUser Access
                        </DialogTitle>
                        <DialogDescription>
                          This is an emergency action that will immediately disable all SuperUser access to the system. This action should only be taken in response to security incidents or emergencies.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 mt-4">
                        <div>
                          <Label htmlFor="reason">Reason for Disabling</Label>
                          <Textarea
                            id="reason"
                            placeholder="Please provide a detailed reason for disabling SuperUser access..."
                            value={disableReason}
                            onChange={(e) => setDisableReason(e.target.value)}
                            className="mt-2"
                            rows={3}
                          />
                        </div>
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                          <div className="flex items-start gap-2">
                            <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                            <div className="text-sm text-yellow-800">
                              <strong>Warning:</strong> Existing SuperUser sessions will continue until token expiry, but new API calls will be blocked.
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setShowDisableDialog(false)}>
                            Cancel
                          </Button>
                          <Button 
                            variant="destructive"
                            onClick={handleDisableSuperUser}
                            disabled={actionLoading || !disableReason.trim()}
                            className="flex items-center gap-2"
                          >
                            {actionLoading ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            ) : (
                              <PowerOff className="h-4 w-4" />
                            )}
                            Disable Access
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  What Happens When SuperUser is Disabled
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• SuperUser API calls return 403 Forbidden</li>
                  <li>• Existing sessions continue until token expiry</li>
                  <li>• Regular users remain unaffected</li>
                  <li>• Admin users retain full access</li>
                  <li>• Emergency controls still work for Admin users</li>
                </ul>
              </div>

              {status?.systemConfigs.find(c => c.key === 'superuser_disabled') && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Last Configuration Change
                  </h4>
                  <div className="text-sm text-gray-600">
                    <div><strong>Time:</strong> {formatTime(status.systemConfigs.find(c => c.key === 'superuser_disabled')?.updatedAt || '')}</div>
                    <div><strong>Reason:</strong> {status.systemConfigs.find(c => c.key === 'superuser_disabled')?.description || 'No reason provided'}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Emergency Control Activity
          </CardTitle>
          <CardDescription>
            Recent enable/disable actions performed on SuperUser access
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentActivity.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Recent Activity</h3>
              <p className="text-gray-600">No emergency control actions have been performed recently.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead>Performed By</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentActivity.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <Badge className={
                        log.action === 'DISABLE_SUPERUSER' 
                          ? 'bg-red-100 text-red-800 border-red-200'
                          : 'bg-green-100 text-green-800 border-green-200'
                      }>
                        {log.action === 'DISABLE_SUPERUSER' ? 'Disabled' : 'Enabled'}
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
                    <TableCell>{formatTime(log.timestamp)}</TableCell>
                    <TableCell>
                      <div className="text-sm max-w-xs truncate" title={log.details}>
                        {log.details || '-'}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Emergency Instructions */}
      <Card className="bg-yellow-50 border-yellow-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-800">
            <AlertTriangle className="h-5 w-5" />
            Emergency Instructions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-yellow-800 space-y-2">
            <p><strong>When to Disable SuperUser:</strong></p>
            <ul className="list-disc list-inside space-y-1 text-sm ml-4">
              <li>Suspected SuperUser account compromise</li>
              <li>Security breach or incident response</li>
              <li>Emergency system maintenance</li>
              <li>Employee termination involving SuperUser access</li>
              <li>Compliance or audit requirements</li>
            </ul>
            <p className="mt-3"><strong>Recovery Steps:</strong></p>
            <ol className="list-decimal list-inside space-y-1 text-sm ml-4">
              <li>Investigate and resolve the security issue</li>
              <li>Change SuperUser password if compromised</li>
              <li>Review recent activity logs</li>
              <li>Re-enable SuperUser access when safe</li>
              <li>Document the incident for future reference</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}