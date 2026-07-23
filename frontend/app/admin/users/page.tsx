'use client';

import { useEffect, useMemo, useState } from 'react';
import { Eye, Search } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ImageWithFallback } from '@/components/ImageWithFallback';
import { OrderStatusBadge } from '@/components/OrderStatusBadge';
import { AdminUser, getAdminUsers } from '@/lib/api/admin-users';
import { getAllOrders, Order } from '@/lib/api/orders';

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [isOrdersDialogOpen, setIsOrdersDialogOpen] = useState(false);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || process.env.BACKEND_URL || 'http://localhost:5000';

  const getImageUrl = useMemo(() => {
    return (image?: string) => {
      if (!image) return '';
      if (image.startsWith('http://') || image.startsWith('https://')) return image;
      return `${baseUrl}${image}`;
    };
  }, [baseUrl]);

  const filteredUsers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) return users;

    return users.filter((user) => {
      const name = user.name?.toLowerCase() || '';
      const email = user.email?.toLowerCase() || '';
      const phone = user.phone?.toLowerCase() || '';
      const address = user.address?.toLowerCase() || '';

      return (
        name.includes(query) ||
        email.includes(query) ||
        phone.includes(query) ||
        address.includes(query)
      );
    });
  }, [searchQuery, users]);

  const userOrderSummary = useMemo(() => {
    const totalOrders = userOrders.length;
    const totalProducts = userOrders.reduce((sum, order) => {
      return sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0);
    }, 0);
    const totalSpent = userOrders.reduce((sum, order) => sum + order.total, 0);
    const deliveredOrders = userOrders.filter((order) => order.status === 'delivered').length;

    return {
      totalOrders,
      totalProducts,
      totalSpent,
      deliveredOrders,
    };
  }, [userOrders]);

  const formatPrice = (value: number) => {
    const formatted = value.toLocaleString('en-NP', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return `Rs ${formatted}`;
  };

  const handleViewOrders = async (user: AdminUser) => {
    setSelectedUser(user);
    setIsOrdersDialogOpen(true);
    setIsLoadingOrders(true);
    setOrdersError(null);

    try {
      const allOrders = await getAllOrders();
      const selectedUserOrders = allOrders
        .filter((order) => order.userId === user._id)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      setUserOrders(selectedUserOrders);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load user orders';
      setOrdersError(msg);
      setUserOrders([]);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getAdminUsers();
        setUsers(data);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to load users';
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (isLoading) {
    return <div className="text-center py-8">Loading users...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Users Information</h2>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              All Users ({filteredUsers.length}{filteredUsers.length !== users.length ? ` of ${users.length}` : ''})
            </h3>
            <div className="relative w-full sm:w-80">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, email, phone, address..."
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">User</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Email</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Phone</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Address</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => {
                  const displayImage = getImageUrl(user.image);
                  const avatarLetter = user.name?.charAt(0)?.toUpperCase() || 'U';

                  return (
                    <tr key={user._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-green-700 text-white flex items-center justify-center">
                            {displayImage ? (
                              <ImageWithFallback
                                src={displayImage}
                                alt={user.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-sm font-semibold">{avatarLetter}</span>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{user.name}</p>
                            <p className="text-xs text-gray-500 capitalize">{user.role || 'user'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-700">{user.email}</td>
                      <td className="py-3 px-4 text-sm text-gray-700">{user.phone || '-'}</td>
                      <td className="py-3 px-4 text-sm text-gray-700">
                        <div className="flex items-center justify-between gap-3">
                          <span className="block max-w-xs truncate">{user.address || '-'}</span>
                          {user.role !== 'admin' ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewOrders(user)}
                              className="shrink-0"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View Orders
                            </Button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 px-4 text-center text-sm text-gray-500">
                      No users match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isOrdersDialogOpen} onOpenChange={setIsOrdersDialogOpen}>
        <DialogContent className="w-[95vw] max-w-5xl max-h-[90vh] overflow-hidden p-0">
          <DialogHeader className="border-b border-gray-200 px-6 py-4">
            <DialogTitle>
              {selectedUser ? `${selectedUser.name}'s Orders` : 'User Orders'}
            </DialogTitle>
          </DialogHeader>

          {selectedUser && (
            <div className="flex min-h-0 flex-1 flex-col gap-5 px-6 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-lg bg-gray-50 p-4 border border-gray-200">
                  <p className="text-xs text-gray-500">Total Orders</p>
                  <p className="text-xl font-bold text-gray-900">{userOrderSummary.totalOrders}</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4 border border-gray-200">
                  <p className="text-xs text-gray-500">Total Products</p>
                  <p className="text-xl font-bold text-gray-900">{userOrderSummary.totalProducts}</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4 border border-gray-200">
                  <p className="text-xs text-gray-500">Total Spent</p>
                  <p className="text-xl font-bold text-green-700">{formatPrice(userOrderSummary.totalSpent)}</p>
                </div>
              </div>

              <div className="text-sm text-gray-600">
                Delivered Orders:{" "}
                <span className="font-semibold text-gray-900">
                  {userOrderSummary.deliveredOrders}
                </span>
              </div>

              {isLoadingOrders && (
                <p className="text-sm text-gray-500">Loading user orders...</p>
              )}

              {!isLoadingOrders && ordersError && (
                <p className="text-sm text-red-600">Error: {ordersError}</p>
              )}

              {!isLoadingOrders && !ordersError && userOrders.length === 0 && (
                <p className="text-sm text-gray-500">No orders found for this user.</p>
              )}

              {!isLoadingOrders && !ordersError && userOrders.length > 0 && (
                <div className="flex min-h-0 flex-1 flex-col rounded-lg border border-gray-200">
                  <div className="max-h-[52vh] overflow-y-auto overflow-x-hidden">
                    <table className="w-full table-fixed">
                      <colgroup>
                        <col className="w-[22%]" />
                        <col className="w-[20%]" />
                        <col className="w-[14%]" />
                        <col className="w-[24%]" />
                        <col className="w-[20%]" />
                      </colgroup>
                      <thead className="sticky top-0 z-10 bg-gray-50">
                        <tr>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Order ID</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Date</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Products</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                          <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {userOrders.map((order) => {
                          const productCount = order.items.reduce(
                            (sum, item) => sum + item.quantity,
                            0
                          );

                          return (
                            <tr key={order._id} className="border-t border-gray-100">
                              <td className="py-3 px-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                                {order._id.slice(-8).toUpperCase()}
                              </td>
                              <td className="py-3 px-4 text-sm text-gray-700 whitespace-nowrap">
                                {new Date(order.createdAt).toLocaleDateString()}
                              </td>
                              <td className="py-3 px-4 text-sm text-gray-700 whitespace-nowrap">{productCount}</td>
                              <td className="py-3 px-4 text-sm text-gray-700">
                                <OrderStatusBadge status={order.status} />
                              </td>
                              <td className="py-3 px-4 text-sm text-right font-semibold text-gray-900 whitespace-nowrap tabular-nums">
                                {formatPrice(order.total)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
