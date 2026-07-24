"use server";

import { loginUser, registerUser, verifyMfaLogin } from "@/lib/api/auth";
import { cookies } from "next/headers";

type RegisterResponse = {
  success: boolean;
  message: string;
  data?: {
    _id: string;
    name: string;
    email: string;
    role: "user" | "admin";
    image?: string;
  };
};

type LoginResponse = {
  success: boolean;
  message: string;
  data?: {
    _id: string;
    name: string;
    email: string;
    role: "user" | "admin";
    phone?: string;
    address?: string;
    image?: string;
    mfaEnabled?: boolean;
  };
  token?: string;
  mfaRequired?: boolean;
  email?: string;
};

export const handleRegister = async (formData: { name: string; email: string; password: string; confirmPassword: string }): Promise<RegisterResponse> => {
  try {
    const res = await registerUser(formData);
    return {
      success: true,
      message: res.message,
      data: res.data,
    };
  } catch (err: unknown) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Something went wrong",
    };
  }
};

export const handleLogin = async (formData: { email: string; password: string }): Promise<LoginResponse> => {
  try {
    const res = await loginUser(formData);

    if (res.mfaRequired) {
      return {
        success: true,
        message: res.message,
        mfaRequired: true,
        email: res.email,
      };
    }

    const cookieStore = await cookies();

    if (!res.token || !res.data) {
      return {
        success: false,
        message: "Login response was missing authentication data",
      };
    }

    cookieStore.set("token", res.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });

    cookieStore.set("user", JSON.stringify(res.data), {
      httpOnly: false,
      path: "/",
    });

    cookieStore.set("role", res.data.role, {
      httpOnly: false,
      path: "/",
    });

    return {
      success: true,
      message: res.message,
      data: res.data,
      token: res.token, // Return token to be stored in localStorage
    };
  } catch (err: unknown) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Something went wrong",
    };
  }
};

export const handleVerifyMfaLogin = async (formData: { email: string; otp: string }): Promise<LoginResponse> => {
  try {
    const res = await verifyMfaLogin(formData);

    const cookieStore = await cookies();

    if (!res.token || !res.data) {
      return {
        success: false,
        message: "MFA response was missing authentication data",
      };
    }

    cookieStore.set("token", res.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });

    cookieStore.set("user", JSON.stringify(res.data), {
      httpOnly: false,
      path: "/",
    });

    cookieStore.set("role", res.data.role, {
      httpOnly: false,
      path: "/",
    });

    return {
      success: true,
      message: res.message,
      data: res.data,
      token: res.token,
    };
  } catch (err: unknown) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Something went wrong",
    };
  }
};

export const handleLogout = async () => {
  try {
    const cookieStore = await cookies();
    
    cookieStore.delete("token");
    cookieStore.delete("user");
    cookieStore.delete("role");

    // Note: Cart cleanup happens on client side (see logout handlers)
    
    return {
      success: true,
      message: "Logged out successfully",
    };
  } catch (err: unknown) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Something went wrong",
    };
  }
};
