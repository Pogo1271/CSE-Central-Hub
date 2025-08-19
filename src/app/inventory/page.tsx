"use client";

import { LayoutWrapper } from "@/components/layout/layout-wrapper";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package2 } from "lucide-react";

export default function InventoryPage() {
  return (
    <LayoutWrapper>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory</h1>
          <p className="text-gray-600">Manage your stock levels</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Package2 className="h-5 w-5" />
              <span>Inventory Management</span>
            </CardTitle>
            <CardDescription>
              This page will contain inventory management functionality
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Coming soon: Stock level tracking, low stock alerts, and inventory reports
            </p>
          </CardContent>
        </Card>
      </div>
    </LayoutWrapper>
  );
}