"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getMyOrders, Order } from "@/lib/api/orders";
import { useRouter } from "next/navigation";

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Check if user is logged in
        if (typeof window !== "undefined") {
          const user = localStorage.getItem("user");
          if (!user) {
            router.push("/login");
            return;
          }
        }

        const data = await getMyOrders();
        setOrders(data);
      } catch (err) {
        const errMessage = err instanceof Error ? err.message : "Failed to fetch orders";
        setError(errMessage);
        console.error("Error fetching orders:", err);
        setOrders([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [router]);

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
            Your Orders
          </h1>
          <p className="text-gray-600">Track and manage all your orders</p>
        </div>

        {isLoading && (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center">
            <p className="text-gray-600 mb-4 text-lg">Loading your orders...</p>
          </div>
        )}

        {error && (
          <div className="bg-white rounded-2xl shadow-md p-8 text-center border border-red-300">
            <p className="text-red-600 mb-4 text-lg">{error}</p>
            <Link
              href="/products"
              className="inline-block bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition font-semibold"
            >
              Continue Shopping
            </Link>
          </div>
        )}

        {!isLoading && !error && orders.length === 0 && (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center">
            <svg
              className="w-16 h-16 text-gray-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <p className="text-gray-600 mb-4 text-lg">You haven&apos;t placed any orders yet</p>
            <Link
              href="/products"
              className="inline-block bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition font-semibold"
            >
              Start Shopping
            </Link>
          </div>
        )}

        {!isLoading && !error && orders.length > 0 && (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Order ID: {order._id.slice(-8).toUpperCase()}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <span
                    className={`inline-block px-4 py-2 rounded-full text-sm font-semibold capitalize ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>
                </div>

                <div className="border-t border-gray-200 pt-4 mb-4">
                  <div className="space-y-2">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span className="text-gray-700">
                          {item.name} x {item.quantity}
                        </span>
                        <span className="text-gray-700 font-semibold">
                          Rs {item.total.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Delivery to</p>
                    <p className="text-gray-900 font-medium">{order.customerName}</p>
                    <p className="text-sm text-gray-600">{order.address}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                    <p className="text-2xl font-bold text-green-600">
                      Rs {order.total.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
