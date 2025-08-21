'use client'

import { useState, useEffect } from 'react'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Building2, 
  FileSignature, 
  Package,
  Calendar,
  Download,
  RefreshCw
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  Cell,
  Area,
  AreaChart
} from 'recharts'

interface AnalyticsData {
  businessGrowth: Array<{ month: string; businesses: number; users: number }>
  categoryDistribution: Array<{ name: string; value: number; color: string }>
  topLocations: Array<{ location: string; businesses: number; growth: number }>
  engagementMetrics: Array<{ metric: string; value: number; change: number }>
  revenueData: Array<{ month: string; revenue: number; quotes: number }>
  performanceMetrics: {
    totalBusinesses: number
    activeUsers: number
    pendingQuotes: number
    conversionRate: number
    averageQuoteValue: number
    monthlyRecurringRevenue: number
  }
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4']

interface AnalyticsDashboardProps {
  data?: AnalyticsData
  onRefresh?: () => void
  onExport?: (format: 'pdf' | 'csv' | 'excel') => void
}

export function AnalyticsDashboard({ data, onRefresh, onExport }: AnalyticsDashboardProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('6months')
  const [isLoading, setIsLoading] = useState(false)

  // Default data if none provided
  const defaultData: AnalyticsData = {
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

  const analyticsData = data || defaultData

  const handleRefresh = async () => {
    setIsLoading(true)
    if (onRefresh) {
      await onRefresh()
    }
    // Simulate loading delay
    setTimeout(() => setIsLoading(false), 1000)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
            <p className="text-gray-600 mt-1">Comprehensive insights into your business performance</p>
          </div>
          <div className="flex items-center space-x-2">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1month">Last Month</SelectItem>
                <SelectItem value="3months">Last 3 Months</SelectItem>
                <SelectItem value="6months">Last 6 Months</SelectItem>
                <SelectItem value="1year">Last Year</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <div className="relative group">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                <div className="py-1">
                  <button
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => onExport?.('pdf')}
                  >
                    Export as PDF
                  </button>
                  <button
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => onExport?.('csv')}
                  >
                    Export as CSV
                  </button>
                  <button
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => onExport?.('excel')}
                  >
                    Export as Excel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Businesses</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(analyticsData.performanceMetrics.totalBusinesses)}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(analyticsData.performanceMetrics.activeUsers)}</div>
            <p className="text-xs text-muted-foreground">
              +8% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Quotes</CardTitle>
            <FileSignature className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.performanceMetrics.pendingQuotes}</div>
            <p className="text-xs text-muted-foreground">
              +5% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.performanceMetrics.conversionRate}%</div>
            <p className="text-xs text-muted-foreground">
              +3% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Quote Value</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analyticsData.performanceMetrics.averageQuoteValue)}</div>
            <p className="text-xs text-muted-foreground">
              +7% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">MRR</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analyticsData.performanceMetrics.monthlyRecurringRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              +15% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Business Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Business Growth</CardTitle>
            <CardDescription>Business and user growth over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData.businessGrowth}>
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

        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>Monthly revenue and quotes generated</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analyticsData.revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="revenue" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                <Area type="monotone" dataKey="quotes" stackId="2" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Business Categories</CardTitle>
            <CardDescription>Distribution of businesses by category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analyticsData.categoryDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analyticsData.categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Locations */}
        <Card>
          <CardHeader>
            <CardTitle>Top Locations</CardTitle>
            <CardDescription>Business distribution by location</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.topLocations} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="location" type="category" width={100} />
                <Tooltip />
                <Legend />
                <Bar dataKey="businesses" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Engagement Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Engagement Metrics</CardTitle>
          <CardDescription>User engagement and activity metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {analyticsData.engagementMetrics.map((metric, index) => (
              <div key={metric.metric} className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-gray-900">
                  {formatNumber(metric.value)}
                </div>
                <div className="text-sm text-gray-600 mb-2">{metric.metric}</div>
                <Badge variant={metric.change > 0 ? "default" : "destructive"}>
                  {metric.change > 0 ? '+' : ''}{metric.change}%
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}