"use client";

import type { ReactNode } from 'react';
import { Sidebar, SidebarInset } from '@/components/ui/sidebar';
import AppSidebar from './sidebar';
import AppHeader from './header';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen">
      <Sidebar variant="sidebar" collapsible="icon">
        <AppSidebar />
      </Sidebar>
      <SidebarInset className="flex flex-col flex-1">
        <AppHeader />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </SidebarInset>
    </div>
  );
}
