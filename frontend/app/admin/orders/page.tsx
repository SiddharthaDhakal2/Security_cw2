'use client';

import { useEffect, useState } from 'react';
import { Eye } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getAllOrders, updateOrderStatus, Order } from '@/lib/api/orders';
import { useToast } from '@/components/ui/toast';

export default function AdminOrders() {
  const { showToast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchOrders = async () => {
    try {
      setError(null);
      const data = await getAllOrders();
      setOrders(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load orders';
      setError(msg);
    }
  };

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getAllOrders();
        setOrders(data);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to load orders';
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    };

    loadOrders();

    // Auto-refresh orders every 30 seconds
    const interval = setInterval(() => {
      fetchOrders();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
    try {
      setIsUpdating(true);
      const updated = await updateOrderStatus(orderId, newStatus);
      setOrders(orders.map(order => 
        order._id === orderId ? updated : order
      ));
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder(updated);
      }
      showToast('Order status updated successfully', 'success');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update order';
      showToast(`Error: ${msg}`, 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDialogOpen(true);
  };

  const statusCounts = {
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading orders...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Order Management</h2>
          <p className="text-gray-600">View and manage customer orders</p>
        </div>
      </div>

      {/* Order Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-600 mb-1">Pending</p>
            <p className="text-2xl font-bold text-gray-900">{statusCounts.pending}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-600 mb-1">Processing</p>
            <p className="text-2xl font-bold text-gray-900">{statusCounts.processing}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-600 mb-1">Shipped</p>
            <p className="text-2xl font-bold text-gray-900">{statusCounts.shipped}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-600 mb-1">Delivered</p>
            <p className="text-2xl font-bold text-gray-900">{statusCounts.delivered}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-600 mb-1">Cancelled</p>
            <p className="text-2xl font-bold text-red-600">{statusCounts.cancelled}</p>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">All Orders ({orders.length})</h3>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Order ID</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Customer</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Items</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Total</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">{order._id.slice(-8).toUpperCase()}</td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{order.customerName}</p>
                        <p className="text-xs text-gray-500">{order.customerEmail}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {order.items.length} item(s)
                    </td>
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">
                      Rs {order.total.toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <Select
                        value={order.status}
                        onValueChange={(value) => {
                          if (isUpdating) return;
                          handleStatusChange(order._id, value as Order['status']);
                        }}
                      >
                        <SelectTrigger
                          className={`w-32 ${isUpdating ? 'pointer-events-none opacity-60' : ''}`}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="shipped">Shipped</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(order)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6 px-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Order ID</p>
                  <p className="text-gray-900 font-medium">{selectedOrder._id.slice(-8).toUpperCase()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <div className="mt-1">
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                      selectedOrder.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      selectedOrder.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                      selectedOrder.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                      selectedOrder.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Order Date</p>
                  <p className="text-gray-900 font-medium">
                    {new Date(selectedOrder.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Amount</p>
                  <p className="text-green-600 font-semibold">Rs {selectedOrder.total.toFixed(2)}</p>
                </div>
              </div>

              <div>
                <h4 className="text-gray-900 font-semibold mb-3">Customer Information</h4>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="text-gray-900 font-medium">{selectedOrder.customerName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-gray-900 font-medium">{selectedOrder.customerEmail}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="text-gray-900 font-medium">{selectedOrder.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Delivery Address</p>
                    <p className="text-gray-900 font-medium">{selectedOrder.address}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-gray-900 font-semibold mb-3">Order Items</h4>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-2 px-4 text-sm font-semibold text-gray-600">Product</th>
                        <th className="text-left py-2 px-4 text-sm font-semibold text-gray-600">Price</th>
                        <th className="text-left py-2 px-4 text-sm font-semibold text-gray-600">Quantity</th>
                        <th className="text-right py-2 px-4 text-sm font-semibold text-gray-600">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items.map((item, idx) => (
                        <tr key={idx} className="border-t border-gray-100">
                          <td className="py-2 px-4 text-sm text-gray-900 font-medium">
                            {item.name}
                          </td>
                          <td className="py-2 px-4 text-sm text-gray-900 font-medium">
                            Rs {item.price.toFixed(2)}
                          </td>
                          <td className="py-2 px-4 text-sm text-gray-900">
                            {item.quantity}
                          </td>
                          <td className="py-2 px-4 text-sm text-gray-900 text-right font-medium">
                            Rs {item.total.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
