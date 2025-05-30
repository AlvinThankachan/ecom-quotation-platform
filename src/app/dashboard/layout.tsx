'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Package, 
  FileText, 
  Users, 
  Settings, 
  LogOut, 
  Menu, 
  X 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { signOut } from 'next-auth/react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Check if user is authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  // Handle responsive sidebar
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024);
      setIsSidebarOpen(window.innerWidth >= 1024);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  // Loading state
  if (status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary-600"></div>
      </div>
    );
  }

  // Get navigation items based on user role
  const getNavItems = () => {
    const baseItems = [
      {
        name: 'Dashboard',
        href: '/dashboard',
        icon: <LayoutDashboard className="h-5 w-5" />,
      },
    ];

    const roleBasedItems = {
      ADMIN: [
        {
          name: 'Products',
          href: '/dashboard/products',
          icon: <Package className="h-5 w-5" />,
        },
        {
          name: 'Quotations',
          href: '/dashboard/quotations',
          icon: <FileText className="h-5 w-5" />,
        },
        {
          name: 'Users',
          href: '/dashboard/users',
          icon: <Users className="h-5 w-5" />,
        },
        {
          name: 'Settings',
          href: '/dashboard/settings',
          icon: <Settings className="h-5 w-5" />,
        },
      ],
      DISTRIBUTOR: [
        {
          name: 'Products',
          href: '/dashboard/products',
          icon: <Package className="h-5 w-5" />,
        },
        {
          name: 'Quotations',
          href: '/dashboard/quotations',
          icon: <FileText className="h-5 w-5" />,
        },
        {
          name: 'Settings',
          href: '/dashboard/settings',
          icon: <Settings className="h-5 w-5" />,
        },
      ],
      CLIENT: [
        {
          name: 'Quotations',
          href: '/dashboard/quotations',
          icon: <FileText className="h-5 w-5" />,
        },
        {
          name: 'Settings',
          href: '/dashboard/settings',
          icon: <Settings className="h-5 w-5" />,
        },
      ],
    };

    const userRole = session?.user?.role || 'CLIENT';
    return [...baseItems, ...(roleBasedItems[userRole as keyof typeof roleBasedItems] || [])];
  };

  const navItems = getNavItems();

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile sidebar toggle */}
      <div className="fixed left-4 top-4 z-50 block lg:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="rounded-full bg-white shadow-md"
        >
          {isSidebarOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-white shadow-lg transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:relative lg:translate-x-0`}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-center border-b">
            <Link href="/dashboard" className="text-xl font-bold text-primary-600">
              Quotation Platform
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center rounded-md px-4 py-2 text-sm font-medium ${
                      pathname === item.href
                        ? 'bg-primary-50 text-primary-600'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                    onClick={() => isMobile && setIsSidebarOpen(false)}
                  >
                    {item.icon}
                    <span className="ml-3">{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* User info and logout */}
          <div className="border-t p-4">
            <div className="mb-2 flex items-center">
              <div className="h-8 w-8 rounded-full bg-primary-100 text-center leading-8 text-primary-600">
                {session?.user?.name?.charAt(0) || session?.user?.email?.charAt(0) || 'U'}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">
                  {session?.user?.name || session?.user?.email || 'User'}
                </p>
                <p className="text-xs text-gray-500">
                  {session?.user?.role || 'CLIENT'}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              className="mt-2 w-full justify-start text-gray-600"
              onClick={() => signOut({ callbackUrl: '/' })}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Main content area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          {children}
        </main>
      </div>

      {/* Mobile sidebar backdrop */}
      {isSidebarOpen && isMobile && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
}
