"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RegisterData, registerSchema } from "../schema";
import { handleRegister } from "@/lib/actions/auth-actions";

export default function RegisterForm() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    mode: "onSubmit",
  });

  const [pending, startTransition] = useTransition();

  const submit = async (values: RegisterData) => {
    setErrorMessage(""); // Clear previous errors
    startTransition(async () => {
      const res = await handleRegister(values);
      if (res.success) {
        router.push("/login");
      } else {
        setErrorMessage(res.message || "Registration failed. Please try again.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4">
      {/* Error Message */}
      {errorMessage && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3">
          <p className="text-sm text-red-800">{errorMessage}</p>
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700" htmlFor="name">
          Name
        </label>
        <input
          id="name"
          className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm text-gray-900 outline-none placeholder-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition"
          {...register("name")}
          placeholder="Your name"
        />
        {errors.name?.message && (
          <p className="text-xs text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm text-gray-900 outline-none placeholder-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition"
          {...register("email")}
          placeholder="you@example.com"
        />
        {errors.email?.message && (
          <p className="text-xs text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm text-gray-900 outline-none placeholder-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition"
          {...register("password")}
          placeholder="••••••"
        />
        {errors.password?.message && (
          <p className="text-xs text-red-600">{errors.password.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700" htmlFor="confirmPassword">
          Confirm Password
        </label>
        <input
          id="confirmPassword"
          type="password"
          className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm text-gray-900 outline-none placeholder-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition"
          {...register("confirmPassword")}
          placeholder="••••••"
        />
        {errors.confirmPassword?.message && (
          <p className="text-xs text-red-600">{errors.confirmPassword.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting || pending}
        className="mt-6 h-11 w-full rounded-lg bg-green-700 text-white text-sm font-semibold hover:bg-green-800 disabled:opacity-60 disabled:cursor-not-allowed transition"
      >
        {isSubmitting || pending ? "Creating account..." : "Create account"}
      </button>

      <div className="mt-4 text-center text-sm text-gray-600">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-green-700 hover:text-green-800 hover:underline">
          Log in
        </Link>
      </div>
    </form>
  );
}
