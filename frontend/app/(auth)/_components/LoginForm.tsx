"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LoginData, loginSchema } from "../schema";
import { handleLogin, handleVerifyMfaLogin } from "@/lib/actions/auth-actions";
import ForgotPasswordDialog from "./ForgotPasswordDialog";

export default function LoginForm() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [mfaEmail, setMfaEmail] = useState("");
  const [mfaOtp, setMfaOtp] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    mode: "onSubmit",
  });

  const [pending, startTransition] = useTransition();

  const finishLogin = (token: string, user: NonNullable<Awaited<ReturnType<typeof handleLogin>>["data"]>) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
    }

    if (user.role === "admin") {
      router.replace("/admin");
    } else {
      router.replace("/home");
    }
  };

  const submit = async (values: LoginData) => {
    setErrorMessage("");
    startTransition(async () => {
      const res = await handleLogin(values);

      if (res.success && res.mfaRequired && res.email) {
        setMfaEmail(res.email);
        setMfaOtp("");
        return;
      }

      if (res.success && res.token && res.data) {
        finishLogin(res.token, res.data);
      } else {
        setErrorMessage(res.message || "Invalid email or password");
      }
    });
  };

  const submitMfa = () => {
    setErrorMessage("");
    startTransition(async () => {
      const res = await handleVerifyMfaLogin({ email: mfaEmail, otp: mfaOtp });

      if (res.success && res.token && res.data) {
        finishLogin(res.token, res.data);
      } else {
        setErrorMessage(res.message || "Invalid OTP");
      }
    });
  };

  return (
    <>
      <form
        onSubmit={
          mfaEmail
            ? (event) => {
                event.preventDefault();
                submitMfa();
              }
            : handleSubmit(submit)
        }
        className="space-y-5"
      >
        {errorMessage && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3">
            <p className="text-sm text-red-800">{errorMessage}</p>
          </div>
        )}

        {mfaEmail ? (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700" htmlFor="mfaOtp">
              Email OTP
            </label>
            <input
              id="mfaOtp"
              type="text"
              inputMode="numeric"
              maxLength={6}
              className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm text-gray-900 outline-none placeholder-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition"
              value={mfaOtp}
              onChange={(event) => setMfaOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="Enter 6-digit OTP"
            />
            <p className="text-xs text-gray-600">OTP sent to {mfaEmail}</p>
          </div>
        ) : (
          <>
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
                placeholder="Password"
              />
              {errors.password?.message && (
                <p className="text-xs text-red-600">{errors.password.message}</p>
              )}
            </div>
          </>
        )}

        {!mfaEmail && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setIsForgotPasswordOpen(true)}
              className="text-sm font-semibold text-green-700 hover:text-green-800 hover:underline transition"
            >
              Forgot Password?
            </button>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || pending || (Boolean(mfaEmail) && mfaOtp.length !== 6)}
          className="mt-6 h-11 w-full rounded-lg bg-green-700 text-white text-sm font-semibold hover:bg-green-800 disabled:opacity-60 disabled:cursor-not-allowed transition"
        >
          {isSubmitting || pending ? "Logging in..." : mfaEmail ? "Verify OTP" : "Log in"}
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
