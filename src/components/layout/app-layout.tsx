
"use client";

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Sidebar, SidebarInset } from '@/components/ui/sidebar';
import AppSidebar from './sidebar';
import AppHeader from './header';
import { useAuth } from '@/context/auth-context';
import { Loader2Icon } from 'lucide-react';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user, authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const publicPaths = ['/login', '/signup'];
  const isPublicPath = publicPaths.includes(pathname);

  useEffect(() => {
    // If auth is done loading, user is not logged in, and it's not a public path, redirect to login
    if (!authLoading && !user && !isPublicPath) {
      router.push('/login');
    }
    // Optional: If user is logged in and tries to access a public path, redirect to dashboard
    // This can be added if desired, but sometimes users might want to re-access login/signup (e.g. to see the page).
    // if (!authLoading && user && isPublicPath) {
    //   router.push('/');
    // }
  }, [user, authLoading, router, pathname, isPublicPath]);

  // While auth is loading and it's not a public path, show a global loader
  if (authLoading && !isPublicPath) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <Loader2Icon className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // If it's a public path, render children directly without main layout
  // This applies whether auth is loading or not, or if user is logged in or not (unless redirection logic above handles it)
  if (isPublicPath) {
    return <>{children}</>;
  }
  
  // If not authLoading, and no user, and not a public path, means redirection should happen.
  // Show loader until redirect kicks in to prevent flashing protected content.
  if (!user && !isPublicPath) {
     return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <Loader2Icon className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // Authenticated user on a protected path
  return (
    <div className="flex flex-1 min-h-0"> {/* Ensure this div takes remaining height and allows children to flex */}
      <Sidebar variant="sidebar" collapsible="icon">
        <AppSidebar />
      </Sidebar>
      <SidebarInset className="flex flex-col flex-1 min-w-0"> {/* min-w-0 for flex child */}
        <AppHeader />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </SidebarInset>
    </div>
  );
}
