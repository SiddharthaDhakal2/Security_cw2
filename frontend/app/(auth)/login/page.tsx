"use client";

import LoginForm from "../_components/LoginForm";

export default function LoginPage() {
  return (
    <div className="w-full max-w-md mx-auto px-4">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-gray-600 mt-2">
            Sign in to continue to Agribridge
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
