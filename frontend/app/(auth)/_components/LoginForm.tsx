"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LoginData, loginSchema } from "../schema";
import { handleLogin } from "@/lib/actions/auth-actions";
import ForgotPasswordDialog from "./ForgotPasswordDialog";

export default function LoginForm() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    mode: "onSubmit",
  });

  const [pending, startTransition] = useTransition();

  const submit = async (values: LoginData) => {
    setErrorMessage(""); // Clear previous errors
    startTransition(async () => {
      const res = await handleLogin(values);

      if (res.success) {
        // Store token and user data in localStorage for client-side APIs
        if (typeof window !== "undefined") {
          if (res.token) {
            localStorage.setItem("token", res.token);
          }
          if (res.data) {
            localStorage.setItem("user", JSON.stringify(res.data));
          }
        }

        const role = res.data?.role;

        if (role === "admin") {
          router.replace("/admin");
        } else {
          router.replace("/home"); 
        }
      } else {
        setErrorMessage(res.message || "Invalid email or password");
      }
    });
  };

  return (
    <>
      <form onSubmit={handleSubmit(submit)} className="space-y-5">
        {/* Error Message */}
        {errorMessage && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3">
            <p className="text-sm text-red-800">{errorMessage}</p>
          </div>
        )}

        {/* Email */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm text-gray-900 outline-none placeholder-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition"
            {...register("email")}
            placeholder="you@example.com"
          />
          {errors.email?.message && (
            <p className="text-xs text-red-600">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm text-gray-900 outline-none placeholder-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition"
            {...register("password")}
            placeholder="••••••"
          />
          {errors.password?.message && (
            <p className="text-xs text-red-600">{errors.password.message}</p>
          )}
        </div>

        {/* Forgot Password Link */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setIsForgotPasswordOpen(true)}
            className="text-sm font-semibold text-green-700 hover:text-green-800 hover:underline transition"
          >
            Forgot Password?
          </button>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || pending}
          className="mt-6 h-11 w-full rounded-lg bg-green-700 text-white text-sm font-semibold hover:bg-green-800 disabled:opacity-60 disabled:cursor-not-allowed transition"
        >
          {isSubmitting || pending ? "Logging in..." : "Log in"}
        </button>

        <div className="mt-4 text-center text-sm text-gray-600">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-semibold text-green-700 hover:text-green-800 hover:underline">
            Sign up
          </Link>
        </div>
      </form>

      <ForgotPasswordDialog 
        isOpen={isForgotPasswordOpen} 
        onClose={() => setIsForgotPasswordOpen(false)} 
      />
    </>
  );
}