"use client";

import { LayoutWrapper } from "@/components/layout/layout-wrapper";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarIcon } from "lucide-react";

export default function CalendarPage() {
  return (
    <LayoutWrapper>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
          <p className="text-gray-600">Manage your events and schedule</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CalendarIcon className="h-5 w-5" />
              <span>Calendar Management</span>
            </CardTitle>
            <CardDescription>
              This page will contain calendar functionality
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Coming soon: Calendar view, event creation, and scheduling tools
            </p>
          </CardContent>
        </Card>
      </div>
    </LayoutWrapper>
  );
}