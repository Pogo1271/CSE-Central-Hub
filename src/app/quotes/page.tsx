"use client";

import { LayoutWrapper } from "@/components/layout/layout-wrapper";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default function QuotesPage() {
  return (
    <LayoutWrapper>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quotes</h1>
          <p className="text-gray-600">Manage your quotes and proposals</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Quotes Management</span>
            </CardTitle>
            <CardDescription>
              This page will contain quote management functionality
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Coming soon: Quote creation, editing, and quote item management
            </p>
          </CardContent>
        </Card>
      </div>
    </LayoutWrapper>
  );
}