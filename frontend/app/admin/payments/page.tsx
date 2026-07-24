'use client';

import { useEffect, useMemo, useState } from 'react';
import { Eye, Search } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getAdminPayments, PaymentTransaction } from '@/lib/api/payments';
import { Order } from '@/lib/api/orders';

const formatPrice = (value: number) => {
  const formatted = value.toLocaleString('en-NP', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `Rs ${formatted}`;
};

const formatDate = (value?: string) => {
  if (!value) return '-';
  return new Date(value).toLocaleString();
};

const paymentStatusClass = (status: Order['paymentStatus']) => {
  if (status === 'paid') return 'bg-green-100 text-green-800';
  if (status === 'failed') return 'bg-red-100 text-red-800';
  return 'bg-yellow-100 text-yellow-800';
};

const transactionStatusClass = (status: PaymentTransaction['status']) => {
  if (status === 'paid') return 'bg-green-100 text-green-800';
  if (status === 'failed' || status === 'invalid') return 'bg-red-100 text-red-800';
  if (status === 'duplicate') return 'bg-blue-100 text-blue-800';
  return 'bg-yellow-100 text-yellow-800';
};

export default function AdminPayments() {
  const [payments, setPayments] = useState<Order[]>([]);
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<Order | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPayments = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getAdminPayments();
        setPayments(data.payments);
        setTransactions(data.transactions);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to load payment records';
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    };

    loadPayments();
  }, []);

  const filteredPayments = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return payments;

    return payments.filter((payment) => {
      return (
        payment._id.toLowerCase().includes(query) ||
        payment.customerName.toLowerCase().includes(query) ||
        payment.customerEmail.toLowerCase().includes(query) ||
        payment.paymentStatus.toLowerCase().includes(query) ||
        (payment.paymentMethod || '').toLowerCase().includes(query) ||
        (payment.paymentReference || '').toLowerCase().includes(query) ||
        (payment.paymentPidx || '').toLowerCase().includes(query)
      );
    });
  }, [payments, searchQuery]);

  const summary = useMemo(() => {
    const paid = payments.filter((payment) => payment.paymentStatus === 'paid');
    const failed = payments.filter((payment) => payment.paymentStatus === 'failed');
    const unpaid = payments.filter((payment) => payment.paymentStatus === 'unpaid');

    return {
      totalRecords: payments.length,
      paidCount: paid.length,
      failedCount: failed.length,
      unpaidCount: unpaid.length,
      paidAmount: paid.reduce((sum, payment) => sum + payment.total, 0),
      transactionCount: transactions.length,
    };
  }, [payments, transactions]);

  const selectedTransactions = useMemo(() => {
    if (!selectedPayment) return [];

    return transactions.filter((transaction) => {
      const transactionOrderId =
        typeof transaction.orderId === 'string' ? transaction.orderId : transaction.orderId._id;
      return transactionOrderId === selectedPayment._id;
    });
  }, [selectedPayment, transactions]);

  const openDetails = (payment: Order) => {
    setSelectedPayment(payment);
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading payment records...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Payment Management</h2>
        <p className="text-gray-600">View Khalti payment status, references, and customer payment details</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-600 mb-1">Orders</p>
            <p className="text-2xl font-bold text-gray-900">{summary.totalRecords}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-600 mb-1">Paid</p>
            <p className="text-2xl font-bold text-green-700">{summary.paidCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-600 mb-1">Failed</p>
            <p className="text-2xl font-bold text-red-600">{summary.failedCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-600 mb-1">Unpaid</p>
            <p className="text-2xl font-bold text-yellow-700">{summary.unpaidCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-600 mb-1">Attempts</p>
            <p className="text-2xl font-bold text-gray-900">{summary.transactionCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-600 mb-1">Paid Amount</p>
            <p className="text-2xl font-bold text-gray-900">{formatPrice(summary.paidAmount)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              All Payments ({filteredPayments.length}{filteredPayments.length !== payments.length ? ` of ${payments.length}` : ''})
            </h3>
            <div className="relative w-full sm:w-96">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search customer, order, status, reference..."
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
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Order ID</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Customer</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Method</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Payment Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Paid At</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Reference</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Amount</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => (
                  <tr key={payment._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">
                      {payment._id.slice(-8).toUpperCase()}
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm font-medium text-gray-900">{payment.customerName}</p>
                      <p className="text-xs text-gray-500">{payment.customerEmail}</p>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700 capitalize">
                      {payment.paymentMethod || '-'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${paymentStatusClass(payment.paymentStatus)}`}>
                        {payment.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700 whitespace-nowrap">
                      {formatDate(payment.paidAt)}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">
                      <span className="block max-w-[180px] truncate">
                        {payment.paymentReference || payment.paymentPidx || '-'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-sm font-semibold text-gray-900">
                      {formatPrice(payment.total)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button variant="ghost" size="sm" onClick={() => openDetails(payment)}>
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
                {filteredPayments.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-8 px-4 text-center text-sm text-gray-500">
                      No payment records match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-6 px-6 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-lg bg-gray-50 border border-gray-200 p-4">
                  <p className="text-sm text-gray-500">Payment Status</p>
                  <span className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${paymentStatusClass(selectedPayment.paymentStatus)}`}>
                    {selectedPayment.paymentStatus}
                  </span>
                </div>
                <div className="rounded-lg bg-gray-50 border border-gray-200 p-4">
                  <p className="text-sm text-gray-500">Payment Method</p>
                  <p className="mt-2 text-gray-900 font-semibold capitalize">
                    {selectedPayment.paymentMethod || '-'}
                  </p>
                </div>
                <div className="rounded-lg bg-gray-50 border border-gray-200 p-4">
                  <p className="text-sm text-gray-500">Amount</p>
                  <p className="mt-2 text-green-700 font-semibold">
                    {formatPrice(selectedPayment.total)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Order ID</p>
                  <p className="text-gray-900 font-medium break-all">{selectedPayment._id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Khalti PIDX</p>
                  <p className="text-gray-900 font-medium break-all">{selectedPayment.paymentPidx || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Transaction Reference</p>
                  <p className="text-gray-900 font-medium break-all">{selectedPayment.paymentReference || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Paid At</p>
                  <p className="text-gray-900 font-medium">{formatDate(selectedPayment.paidAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Created At</p>
                  <p className="text-gray-900 font-medium">{formatDate(selectedPayment.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Last Updated</p>
                  <p className="text-gray-900 font-medium">{formatDate(selectedPayment.updatedAt)}</p>
                </div>
              </div>

              <div>
                <h4 className="text-gray-900 font-semibold mb-3">Customer Information</h4>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2 border border-gray-200">
                  <p className="text-sm text-gray-900">
                    <span className="text-gray-500">Name:</span> {selectedPayment.customerName}
                  </p>
                  <p className="text-sm text-gray-900">
                    <span className="text-gray-500">Email:</span> {selectedPayment.customerEmail}
                  </p>
                  <p className="text-sm text-gray-900">
                    <span className="text-gray-500">Phone:</span> {selectedPayment.phone}
                  </p>
                  <p className="text-sm text-gray-900">
                    <span className="text-gray-500">Address:</span> {selectedPayment.address}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-gray-900 font-semibold mb-3">Transaction History</h4>
                {selectedTransactions.length === 0 ? (
                  <p className="text-sm text-gray-500">No transaction history found for this order.</p>
                ) : (
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left py-2 px-4 text-sm font-semibold text-gray-600">Date</th>
                          <th className="text-left py-2 px-4 text-sm font-semibold text-gray-600">Status</th>
                          <th className="text-left py-2 px-4 text-sm font-semibold text-gray-600">Khalti</th>
                          <th className="text-left py-2 px-4 text-sm font-semibold text-gray-600">Reference</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedTransactions.map((transaction) => (
                          <tr key={transaction._id} className="border-t border-gray-100">
                            <td className="py-2 px-4 text-sm text-gray-900">
                              {formatDate(transaction.createdAt)}
                            </td>
                            <td className="py-2 px-4">
                              <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${transactionStatusClass(transaction.status)}`}>
                                {transaction.status}
                              </span>
                            </td>
                            <td className="py-2 px-4 text-sm text-gray-900">
                              {transaction.khaltiStatus || '-'}
                            </td>
                            <td className="py-2 px-4 text-sm text-gray-900">
                              {transaction.transactionId || transaction.pidx || transaction.failureReason || '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-gray-900 font-semibold mb-3">Purchased Items</h4>
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
                      {selectedPayment.items.map((item, index) => (
                        <tr key={`${item.productId}-${index}`} className="border-t border-gray-100">
                          <td className="py-2 px-4 text-sm text-gray-900 font-medium">{item.name}</td>
                          <td className="py-2 px-4 text-sm text-gray-900">{formatPrice(item.price)}</td>
                          <td className="py-2 px-4 text-sm text-gray-900">{item.quantity}</td>
                          <td className="py-2 px-4 text-sm text-gray-900 text-right font-medium">
                            {formatPrice(item.total)}
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
