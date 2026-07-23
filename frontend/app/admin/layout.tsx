'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Package, Warehouse, ShoppingBag, Users, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { handleLogout } from '@/lib/actions/auth-actions';
import { useState, useTransition } from 'react';
import LogoutDialog from '@/components/LogoutDialog';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isPending, startTransition] = useTransition();

  const isActive = (path: string) => {
    if (path === '/admin') {
      return pathname === '/admin';
    }
    return pathname === path || pathname.startsWith(path + '/');
  };

  const onLogoutClick = () => {
    setShowLogoutDialog(true);
  };

  const onLogoutConfirm = () => {
    startTransition(async () => {
      const result = await handleLogout();
      if (result.success) {
        if (typeof window !== "undefined") {
          try {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            localStorage.removeItem("profileData");
          } catch (err) {
            console.error("Error clearing auth storage:", err);
          }
        }
        setShowLogoutDialog(false);
        router.push('/login');
      }
    });
  };

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/products', label: 'Products', icon: Package },
    { path: '/admin/inventory', label: 'Inventory', icon: Warehouse },
    { path: '/admin/orders', label: 'Orders', icon: ShoppingBag },
    { path: '/admin/users', label: 'Users Information', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-green-900 text-white min-h-screen p-6 fixed left-0 top-0 overflow-y-auto">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center overflow-hidden">
              <Image src="/agri_logo.png" alt="AgriBridge Logo" width={40} height={40} className="object-contain" />
            </div>
            <div>
              <div className="text-white font-semibold">AgriBridge</div>
              <div className="text-xs text-green-300">Admin Panel</div>
            </div>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive(item.path)
                      ? 'bg-green-800 text-white'
                      : 'text-green-100 hover:bg-green-800/50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="absolute bottom-6 left-6 right-6">
            <Button 
              onClick={onLogoutClick}
              variant="outline" 
              disabled={isPending}
              className="w-full bg-green-100! border-green-700 text-green-900 hover:bg-green-800 hover:text-black"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 ml-64">
          <header className="bg-white border-b border-gray-200 px-8 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
              <div className="flex items-center gap-3">
                <div className="text-right text-sm">
                  <div className="text-gray-900 font-semibold">Admin User</div>
                  <div className="text-gray-500">admin@agribridge.com</div>
                </div>
              </div>
            </div>
          </header>

          <main className="p-8">
            {children}
          </main>
        </div>
      </div>
      
      <LogoutDialog 
        open={showLogoutDialog}
        onOpenChange={setShowLogoutDialog}
        onConfirm={onLogoutConfirm}
        isPending={isPending}
      />
    </div>
  );
}
