"use client";

import { MainLayout } from "./main-layout";

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  return <MainLayout>{children}</MainLayout>;
}