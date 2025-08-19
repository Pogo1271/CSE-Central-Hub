"use client";

import { LayoutWrapper } from "@/components/layout/layout-wrapper";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Package, Package2, Calendar, FileText, Users } from "lucide-react";

export default function Dashboard() {
  const stats = [
    {
      name: "Total Companies",
      value: "24",
      icon: Building2,
      change: "+12%",
      changeType: "positive" as const,
    },
    {
      name: "Total Products",
      value: "156",
      icon: Package,
      change: "+8%",
      changeType: "positive" as const,
    },
    {
      name: "Low Stock Items",
      value: "12",
      icon: Package2,
      change: "-5%",
      changeType: "negative" as const,
    },
    {
      name: "Active Quotes",
      value: "8",
      icon: FileText,
      change: "+15%",
      changeType: "positive" as const,
    },
    {
      name: "Upcoming Events",
      value: "3",
      icon: Calendar,
      change: "0%",
      changeType: "neutral" as const,
    },
    {
      name: "Total Users",
      value: "6",
      icon: Users,
      change: "+2",
      changeType: "positive" as const,
    },
  ];

  return (
    <LayoutWrapper>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome to EPOS Central Hub</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat) => (
            <Card key={stat.name}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.name}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  <span
                    className={
                      stat.changeType === "positive"
                        ? "text-green-600"
                        : stat.changeType === "negative"
                        ? "text-red-600"
                        : "text-gray-600"
                    }
                  >
                    {stat.change}
                  </span>{" "}
                  from last month
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks you can perform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button className="group relative overflow-hidden rounded-lg border-2 border-transparent bg-blue-50 p-6 text-left transition-all hover:border-blue-200 hover:bg-blue-100 hover:shadow-md">
                <div className="relative z-10">
                  <Package className="mb-3 h-8 w-8 text-blue-600 group-hover:text-blue-700" />
                  <p className="text-sm font-medium text-blue-900 group-hover:text-blue-950">Add Product</p>
                </div>
              </button>
              
              <button className="group relative overflow-hidden rounded-lg border-2 border-transparent bg-green-50 p-6 text-left transition-all hover:border-green-200 hover:bg-green-100 hover:shadow-md">
                <div className="relative z-10">
                  <Building2 className="mb-3 h-8 w-8 text-green-600 group-hover:text-green-700" />
                  <p className="text-sm font-medium text-green-900 group-hover:text-green-950">Add Company</p>
                </div>
              </button>
              
              <button className="group relative overflow-hidden rounded-lg border-2 border-transparent bg-purple-50 p-6 text-left transition-all hover:border-purple-200 hover:bg-purple-100 hover:shadow-md">
                <div className="relative z-10">
                  <FileText className="mb-3 h-8 w-8 text-purple-600 group-hover:text-purple-700" />
                  <p className="text-sm font-medium text-purple-900 group-hover:text-purple-950">Create Quote</p>
                </div>
              </button>
              
              <button className="group relative overflow-hidden rounded-lg border-2 border-transparent bg-orange-50 p-6 text-left transition-all hover:border-orange-200 hover:bg-orange-100 hover:shadow-md">
                <div className="relative z-10">
                  <Calendar className="mb-3 h-8 w-8 text-orange-600 group-hover:text-orange-700" />
                  <p className="text-sm font-medium text-orange-900 group-hover:text-orange-950">Schedule Event</p>
                </div>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest updates across your business
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      New company added
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Tech Solutions Inc. • 2 hours ago
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      Quote created
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Project Alpha • 4 hours ago
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      Low stock alert
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Wireless Mouse • 6 hours ago
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
              <CardDescription>
                Current system information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Database</span>
                  <span className="text-sm text-green-600">Online</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">API Status</span>
                  <span className="text-sm text-green-600">Operational</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Storage</span>
                  <span className="text-sm text-yellow-600">78% Used</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Last Backup</span>
                  <span className="text-sm text-muted-foreground">2 hours ago</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </LayoutWrapper>
  );
}