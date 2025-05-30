'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { Package, FileText, Users, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import Link from 'next/link';

// Dashboard stat card component
const StatCard = ({
  title,
  value,
  icon,
  href,
  color = 'blue',
}: {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  href: string;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
    red: 'bg-red-50 text-red-600',
  };

  return (
    <Link href={href}>
      <div className="flex cursor-pointer items-center rounded-lg border bg-white p-6 shadow-sm transition-all hover:shadow-md">
        <div className={`mr-4 rounded-full ${colorClasses[color]} p-3`}>{icon}</div>
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </Link>
  );
};

export default function Dashboard() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  
  // Mock data - in a real app, this would come from the API
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalQuotations: 0,
    totalUsers: 0,
    quotationsByStatus: {
      draft: 0,
      sent: 0,
      accepted: 0,
      rejected: 0,
      expired: 0,
    },
  });
  
  useEffect(() => {
    // Simulate API call with mock data
    const timer = setTimeout(() => {
      // Different mock data based on user role
      if (session?.user?.role === 'ADMIN') {
        setStats({
          totalProducts: 156,
          totalQuotations: 48,
          totalUsers: 27,
          quotationsByStatus: {
            draft: 12,
            sent: 18,
            accepted: 10,
            rejected: 5,
            expired: 3,
          },
        });
      } else if (session?.user?.role === 'DISTRIBUTOR') {
        setStats({
          totalProducts: 78,
          totalQuotations: 32,
          totalUsers: 15,
          quotationsByStatus: {
            draft: 8,
            sent: 12,
            accepted: 7,
            rejected: 3,
            expired: 2,
          },
        });
      } else {
        // CLIENT
        setStats({
          totalProducts: 0,
          totalQuotations: 8,
          totalUsers: 0,
          quotationsByStatus: {
            draft: 0,
            sent: 3,
            accepted: 4,
            rejected: 1,
            expired: 0,
          },
        });
      }
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [session?.user?.role]);
  
  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary-600"></div>
      </div>
    );
  }
  
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">
          Welcome back, {session?.user?.name || session?.user?.email?.split('@')[0] || 'User'}
        </p>
      </div>
      
      {/* Stats Grid */}
      <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {/* Show different stats based on user role */}
        {(session?.user?.role === 'ADMIN' || session?.user?.role === 'DISTRIBUTOR') && (
          <StatCard
            title="Total Products"
            value={stats.totalProducts}
            icon={<Package className="h-6 w-6" />}
            href="/dashboard/products"
            color="blue"
          />
        )}
        
        <StatCard
          title="Total Quotations"
          value={stats.totalQuotations}
          icon={<FileText className="h-6 w-6" />}
          href="/dashboard/quotations"
          color="purple"
        />
        
        {session?.user?.role === 'ADMIN' && (
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={<Users className="h-6 w-6" />}
            href="/dashboard/users"
            color="green"
          />
        )}
        
        <StatCard
          title="Accepted Quotations"
          value={stats.quotationsByStatus.accepted}
          icon={<CheckCircle className="h-6 w-6" />}
          href="/dashboard/quotations?status=accepted"
          color="green"
        />
        
        {(session?.user?.role === 'ADMIN' || session?.user?.role === 'DISTRIBUTOR') && (
          <StatCard
            title="Pending Quotations"
            value={stats.quotationsByStatus.sent}
            icon={<Clock className="h-6 w-6" />}
            href="/dashboard/quotations?status=sent"
            color="orange"
          />
        )}
      </div>
      
      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {session?.user?.role === 'CLIENT' && (
            <Link href="/dashboard/quotations/request">
              <div className="flex cursor-pointer items-center rounded-lg border bg-white p-4 shadow-sm transition-all hover:shadow-md">
                <div className="mr-3 rounded-full bg-primary-50 p-2 text-primary-600">
                  <FileText className="h-5 w-5" />
                </div>
                <div>Request New Quotation</div>
              </div>
            </Link>
          )}
          
          {(session?.user?.role === 'ADMIN' || session?.user?.role === 'DISTRIBUTOR') && (
            <>
              <Link href="/dashboard/quotations/create">
                <div className="flex cursor-pointer items-center rounded-lg border bg-white p-4 shadow-sm transition-all hover:shadow-md">
                  <div className="mr-3 rounded-full bg-primary-50 p-2 text-primary-600">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>Create New Quotation</div>
                </div>
              </Link>
              
              <Link href="/dashboard/products/create">
                <div className="flex cursor-pointer items-center rounded-lg border bg-white p-4 shadow-sm transition-all hover:shadow-md">
                  <div className="mr-3 rounded-full bg-primary-50 p-2 text-primary-600">
                    <Package className="h-5 w-5" />
                  </div>
                  <div>Add New Product</div>
                </div>
              </Link>
              
              <Link href="/dashboard/products/import">
                <div className="flex cursor-pointer items-center rounded-lg border bg-white p-4 shadow-sm transition-all hover:shadow-md">
                  <div className="mr-3 rounded-full bg-primary-50 p-2 text-primary-600">
                    <Package className="h-5 w-5" />
                  </div>
                  <div>Import Products</div>
                </div>
              </Link>
            </>
          )}
          
          {session?.user?.role === 'ADMIN' && (
            <Link href="/dashboard/users/create">
              <div className="flex cursor-pointer items-center rounded-lg border bg-white p-4 shadow-sm transition-all hover:shadow-md">
                <div className="mr-3 rounded-full bg-primary-50 p-2 text-primary-600">
                  <Users className="h-5 w-5" />
                </div>
                <div>Add New User</div>
              </div>
            </Link>
          )}
        </div>
      </div>
      
      {/* Recent Activity - Placeholder for future implementation */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Recent Activity</h2>
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <p className="text-gray-500">Your recent activity will appear here.</p>
        </div>
      </div>
    </div>
  );
}
