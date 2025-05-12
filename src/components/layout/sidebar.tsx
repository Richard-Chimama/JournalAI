
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  BookTextIcon,
  PlusCircleIcon,
  LightbulbIcon,
  BellIcon,
  BarChart3Icon,
  MessageCircleIcon, // Added for Chat
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/ui/logo';

const navItems = [
  { href: '/', label: 'Dashboard', icon: BarChart3Icon },
  { href: '/journal', label: 'Journal', icon: BookTextIcon },
  { href: '/journal/new', label: 'New Entry', icon: PlusCircleIcon },
  { href: '/insights', label: 'Insights', icon: LightbulbIcon },
  { href: '/reminders', label: 'Reminders', icon: BellIcon },
  { href: '/chat', label: 'Chat Coach', icon: MessageCircleIcon }, // New Chat Link
];

export default function AppSidebar() {
  const pathname = usePathname();

  return (
    <>
      <SidebarHeader className="p-4">
        <Link href="/" className="flex items-center gap-2">
          <Logo className="h-8 w-8 text-primary" />
          <span className="text-xl font-semibold text-foreground group-data-[collapsible=icon]:hidden">
            Soul Compass
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} legacyBehavior passHref>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))}
                  tooltip={item.label}
                  className={cn(
                    "justify-start",
                    (pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href)))
                      ? 'bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary'
                      : 'hover:bg-muted/50'
                  )}
                >
                  <a>
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </a>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </>
  );
}
