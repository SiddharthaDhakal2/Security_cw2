"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axiosInstance from "@/lib/api/axios";
import { AxiosError } from "axios";

const emailSchema = z.object({
  email: z.string().email("Invalid email"),
});

const otpSchema = z.object({
  otp: z.string().min(6, "OTP must be 6 digits").max(6, "OTP must be 6 digits"),
});

const passwordSchema = z
  .object({
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm password must be at least 6 characters"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type EmailFormData = z.infer<typeof emailSchema>;
type OtpFormData = z.infer<typeof otpSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

interface ForgotPasswordDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ForgotPasswordDialog({ isOpen, onClose }: ForgotPasswordDialogProps) {
  const [step, setStep] = useState<"email" | "otp" | "password">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  const formatCountdown = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    if (step !== "otp" || remainingSeconds <= 0) return;

    const timerId = window.setInterval(() => {
      setRemainingSeconds((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [step, remainingSeconds]);

  const emailForm = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    mode: "onSubmit",
  });

  const otpForm = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
    mode: "onSubmit",
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    mode: "onSubmit",
  });

  const handleSendOtp = async (data: EmailFormData) => {
    setErrorMessage("");
    setSuccessMessage("");
    setLoading(true);

    try {
      const response = await axiosInstance.post("/api/auth/forgot-password/send-otp", data);
      setEmail(data.email);
      setSuccessMessage(response.data.message || "OTP sent to your email");
      setStep("otp");
      otpForm.reset();
      setRemainingSeconds(120);
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>;
      setErrorMessage(axiosError.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (data: OtpFormData) => {
    setErrorMessage("");
    setSuccessMessage("");

    if (remainingSeconds <= 0) {
      setErrorMessage("OTP has expired. Please request a new one.");
      return;
    }

    setLoading(true);

    try {
      const response = await axiosInstance.post("/api/auth/forgot-password/verify-otp", {
        email,
        otp: data.otp,
      });
      setOtp(data.otp);
      setSuccessMessage(response.data.message || "OTP verified successfully");
      setStep("password");
      passwordForm.reset();
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>;
      setErrorMessage(axiosError.response?.data?.message || "Failed to verify OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setErrorMessage("");
    setSuccessMessage("");
    setLoading(true);

    try {
      const response = await axiosInstance.post("/api/auth/forgot-password/send-otp", { email });
      setSuccessMessage(response.data.message || "OTP resent to your email");
      otpForm.reset();
      setRemainingSeconds(120);
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>;
      setErrorMessage(axiosError.response?.data?.message || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (data: PasswordFormData) => {
    setErrorMessage("");
    setSuccessMessage("");
    setLoading(true);

    try {
      const response = await axiosInstance.post("/api/auth/forgot-password/reset-password", {
        email,
        otp,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });
      setSuccessMessage(response.data.message || "Password reset successfully");
      setTimeout(() => {
        onClose();
        setStep("email");
        emailForm.reset();
      }, 2000);
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>;
      setErrorMessage(axiosError.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-lg">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Reset Password</h2>

        {errorMessage && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3">
            <p className="text-sm text-red-800">{errorMessage}</p>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 rounded-lg bg-green-50 border border-green-200 px-4 py-3">
            <p className="text-sm text-green-800">{successMessage}</p>
          </div>
        )}

        {/* Email Step */}
        {step === "email" && (
          <form onSubmit={emailForm.handleSubmit(handleSendOtp)} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm text-gray-900 outline-none placeholder-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition"
                placeholder="you@example.com"
                {...emailForm.register("email")}
              />
              {emailForm.formState.errors.email?.message && (
                <p className="text-xs text-red-600">{emailForm.formState.errors.email.message}</p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 h-11 rounded-lg border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 h-11 rounded-lg bg-green-700 text-white text-sm font-semibold hover:bg-green-800 disabled:opacity-60 disabled:cursor-not-allowed transition"
              >
                {loading ? "Sending..." : "Send OTP"}
              </button>
            </div>
          </form>
        )}

        {/* OTP Step */}
        {step === "otp" && (
          <form onSubmit={otpForm.handleSubmit(handleVerifyOtp)} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">OTP</label>
              <input
                type="text"
                className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm text-gray-900 outline-none placeholder-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition text-center tracking-widest"
                placeholder="000000"
                {...otpForm.register("otp")}
                maxLength={6}
              />
              {otpForm.formState.errors.otp?.message && (
                <p className="text-xs text-red-600">{otpForm.formState.errors.otp.message}</p>
              )}
              <p className="text-xs text-gray-600">Check your email for the OTP code</p>
              <p className="text-xs text-gray-600">
                {remainingSeconds > 0
                  ? `OTP expires in ${formatCountdown(remainingSeconds)}`
                  : "OTP expired. Please go back and request a new one."}
              </p>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={loading}
                className="text-xs font-semibold text-green-700 hover:text-green-800 disabled:opacity-60 disabled:cursor-not-allowed transition"
              >
                {loading ? "Resending..." : "Resend OTP"}
              </button>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setStep("email");
                  emailForm.reset();
                }}
                className="flex-1 h-11 rounded-lg border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading || remainingSeconds <= 0}
                className="flex-1 h-11 rounded-lg bg-green-700 text-white text-sm font-semibold hover:bg-green-800 disabled:opacity-60 disabled:cursor-not-allowed transition"
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
            </div>
          </form>
        )}

        {/* Password Step */}
        {step === "password" && (
          <form onSubmit={passwordForm.handleSubmit(handleResetPassword)} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">New Password</label>
              <input
                type="password"
                className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm text-gray-900 outline-none placeholder-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition"
                placeholder="••••••"
                {...passwordForm.register("newPassword")}
              />
              {passwordForm.formState.errors.newPassword?.message && (
                <p className="text-xs text-red-600">{passwordForm.formState.errors.newPassword.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Confirm Password</label>
              <input
                type="password"
                className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm text-gray-900 outline-none placeholder-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition"
                placeholder="••••••"
                {...passwordForm.register("confirmPassword")}
              />
              {passwordForm.formState.errors.confirmPassword?.message && (
                <p className="text-xs text-red-600">{passwordForm.formState.errors.confirmPassword.message}</p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setStep("otp");
                  otpForm.reset();
                }}
                className="flex-1 h-11 rounded-lg border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 h-11 rounded-lg bg-green-700 text-white text-sm font-semibold hover:bg-green-800 disabled:opacity-60 disabled:cursor-not-allowed transition"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
