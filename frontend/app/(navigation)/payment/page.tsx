"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { initiateKhaltiPayment } from "@/lib/api/payments";
import { getProducts } from "@/lib/api/products";
import { useToast } from "@/components/ui/toast";

interface OrderItemDraft {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  total: number;
}

interface OrderDraft {
  items: OrderItemDraft[];
  total: number;
  customerName: string;
  customerEmail: string;
  phone: string;
  address: string;
}

interface OrderSummary {
  subtotal: number;
  deliveryFee: number;
  total: number;
}

export default function PaymentPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [orderData, setOrderData] = useState<OrderDraft | null>(null);
  const [summary, setSummary] = useState<OrderSummary | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    "khalti" | "esewa" | ""
  >("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const rawOrder = localStorage.getItem("pendingOrderData");
    const rawSummary = localStorage.getItem("pendingOrderSummary");

    if (!rawOrder || !rawSummary) {
      showToast("Missing payment details. Returning to cart.", "warning");
      router.replace("/cart");
      return;
    }

    try {
      setOrderData(JSON.parse(rawOrder) as OrderDraft);
      setSummary(JSON.parse(rawSummary) as OrderSummary);
    } catch {
      showToast("Invalid payment details", "error");
      router.replace("/cart");
    }
  }, [router, showToast]);

  const totalAmount = useMemo(
    () => summary?.total ?? orderData?.total ?? 0,
    [orderData, summary]
  );

  const handleStartPayment = async () => {
    if (!orderData) {
      showToast("Missing order data", "error");
      return;
    }

    if (selectedPaymentMethod !== "khalti") {
      showToast("eSewa integration is coming soon", "warning");
      return;
    }

    try {
      setIsSubmitting(true);

      // Validate stock availability before initiating payment
      const products = await getProducts();
      const productMap = new Map(products.map((p) => [p._id, p]));

      for (const item of orderData.items) {
        const product = productMap.get(item.productId);

        if (!product) {
          throw new Error(`Product not found: ${item.name}`);
        }

        if (product.availability === "out-of-stock" || product.quantity === 0) {
          throw new Error(`${product.name} is out of stock`);
        }

        if (product.quantity < item.quantity) {
          throw new Error(
            `Insufficient stock for ${product.name}. Available: ${product.quantity}, Requested: ${item.quantity}`
          );
        }
      }

      const payment = await initiateKhaltiPayment(orderData);

      if (typeof window !== "undefined") {
        localStorage.setItem("pendingOrderId", payment.orderId);
      }

      window.location.href = payment.paymentUrl;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to initiate payment";
      showToast(`Payment error: ${errorMessage}`, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!orderData || !summary) {
    return (
      <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-md p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Payment</h1>
          <p className="text-gray-600 mb-4">Preparing payment details...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment</h1>
          <p className="text-gray-600">Review your payment details</p>

          <div className="mt-6 bg-gray-50 rounded-xl p-4 border border-gray-200">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-600">Subtotal</span>
              <span className="font-semibold text-gray-900">Rs {summary.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-600">Delivery Fee</span>
              <span className="font-semibold text-gray-900">Rs {summary.deliveryFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t pt-3 mt-3">
              <span className="text-sm font-semibold text-gray-900">Total</span>
              <span className="text-lg font-bold text-green-600">Rs {totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Choose payment method</h2>
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setSelectedPaymentMethod("khalti")}
              className={`w-full border rounded-xl p-4 text-left transition ${
                selectedPaymentMethod === "khalti"
                  ? "border-green-600 ring-2 ring-green-200"
                  : "border-gray-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-900 font-semibold">Khalti</p>
                  <p className="text-xs text-gray-500">Pay instantly using Khalti</p>
                </div>
                <span className="text-xs font-semibold text-green-600">Available</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedPaymentMethod("esewa")}
              className={`w-full border rounded-xl p-4 text-left transition ${
                selectedPaymentMethod === "esewa"
                  ? "border-gray-400 ring-2 ring-gray-200"
                  : "border-gray-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-900 font-semibold">eSewa</p>
                  <p className="text-xs text-gray-500">Coming soon</p>
                </div>
                <span className="text-xs font-semibold text-gray-400">Soon</span>
              </div>
            </button>
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <button
              onClick={handleStartPayment}
              disabled={isSubmitting || !selectedPaymentMethod}
              className="w-full bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 transition shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Starting Payment..." : "Pay Now"}
            </button>
            <button
              onClick={() => router.push("/cart")}
              disabled={isSubmitting}
              className="w-full bg-gray-200 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-300 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Back to Cart
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
