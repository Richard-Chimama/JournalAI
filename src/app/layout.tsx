
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AppLayout } from '@/components/layout/app-layout';
import { SidebarProvider } from '@/components/ui/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';
import { DataProvider } from '@/context/data-context';
import { AuthProvider } from '@/context/auth-context';
import { ThemeProvider } from 'next-themes';


const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Soul Compass',
  description: 'Your personal guide to mindfulness and self-reflection.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>
            <DataProvider>
              <AuthProvider>
                <SidebarProvider defaultOpen={true}>
                  <AppLayout>
                    {children}
                  </AppLayout>
                  <Toaster />
                </SidebarProvider>
              </AuthProvider>
            </DataProvider>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
