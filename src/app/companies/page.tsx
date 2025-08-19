"use client";

import { LayoutWrapper } from "@/components/layout/layout-wrapper";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2 } from "lucide-react";

export default function CompaniesPage() {
  return (
    <LayoutWrapper>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Companies</h1>
          <p className="text-gray-600">Manage your company information</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building2 className="h-5 w-5" />
              <span>Companies Management</span>
            </CardTitle>
            <CardDescription>
              This page will contain company management functionality
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Coming soon: Company list, create/edit forms, and company details
            </p>
          </CardContent>
        </Card>
      </div>
    </LayoutWrapper>
  );
}