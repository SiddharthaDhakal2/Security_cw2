"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { verifyKhaltiPayment } from "@/lib/api/payments";
import { useToast } from "@/components/ui/toast";

const getCartStorageKey = () => {
  if (typeof window === "undefined") return "cartItems:guest";
  try {
    const rawUser = localStorage.getItem("user");
    if (!rawUser) return "cartItems:guest";
    const user = JSON.parse(rawUser) as { _id?: string };
    if (user._id) return `cartItems:${user._id}`;
  } catch {
    return "cartItems:guest";
  }
  return "cartItems:guest";
};

export default function KhaltiPaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading");
  const [message, setMessage] = useState("Verifying payment...");

  const pidx = searchParams.get("pidx") || "";
  const orderId =
    searchParams.get("orderId") ||
    (typeof window !== "undefined" ? localStorage.getItem("pendingOrderId") || "" : "");

  const missingReference = !pidx;

  useEffect(() => {
    if (missingReference) {
      return;
    }

    const verify = async () => {
      try {
        const result = await verifyKhaltiPayment(pidx, orderId || undefined);

        if (typeof window !== "undefined") {
          localStorage.removeItem("pendingOrderId");
          localStorage.setItem(getCartStorageKey(), JSON.stringify([]));
        }

        if (result.paid) {
          setStatus("success");
          setMessage("Payment successful. Redirecting to your orders...");
          showToast("Payment successful!", "success");
          router.replace("/orders");
        } else {
          setStatus("failed");
          setMessage("Payment not completed. Please try again.");
          showToast("Payment not completed", "warning");
          router.replace("/cart");
        }
      } catch (error) {
        const errMessage = error instanceof Error ? error.message : "Payment verification failed";
        setStatus("failed");
        setMessage(errMessage);
        showToast(errMessage, "error");
        router.replace("/cart");
      }
    };

    verify();
  }, [missingReference, orderId, pidx, router, showToast]);

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-md p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Khalti Payment</h1>
        <p className="text-gray-600 mb-4">
          {missingReference ? "Missing payment reference." : message}
        </p>
        {!missingReference && status === "loading" && (
          <div className="text-sm text-gray-500">Please wait...</div>
        )}
      </div>
    </main>
  );
}
