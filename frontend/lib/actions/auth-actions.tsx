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
  refreshToken?: string;
  mfaRequired?: boolean;
  email?: string;
};

const authCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

const accessTokenMaxAge = 15 * 60;
const refreshTokenMaxAge = 7 * 24 * 60 * 60;

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

    if (!res.token || !res.refreshToken || !res.data) {
      return {
        success: false,
        message: "Login response was missing authentication data",
      };
    }

    cookieStore.set("token", res.token, {
      ...authCookieOptions,
      maxAge: accessTokenMaxAge,
    });

    cookieStore.set("refreshToken", res.refreshToken, {
      ...authCookieOptions,
      maxAge: refreshTokenMaxAge,
    });

    cookieStore.set("user", JSON.stringify(res.data), {
      httpOnly: false,
      path: "/",
      maxAge: refreshTokenMaxAge,
    });

    cookieStore.set("role", res.data.role, {
      httpOnly: false,
      path: "/",
      maxAge: refreshTokenMaxAge,
    });

    return {
      success: true,
      message: res.message,
      data: res.data,
      token: res.token,
      refreshToken: res.refreshToken,
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

    if (!res.token || !res.refreshToken || !res.data) {
      return {
        success: false,
        message: "MFA response was missing authentication data",
      };
    }

    cookieStore.set("token", res.token, {
      ...authCookieOptions,
      maxAge: accessTokenMaxAge,
    });

    cookieStore.set("refreshToken", res.refreshToken, {
      ...authCookieOptions,
      maxAge: refreshTokenMaxAge,
    });

    cookieStore.set("user", JSON.stringify(res.data), {
      httpOnly: false,
      path: "/",
      maxAge: refreshTokenMaxAge,
    });

    cookieStore.set("role", res.data.role, {
      httpOnly: false,
      path: "/",
      maxAge: refreshTokenMaxAge,
    });

    return {
      success: true,
      message: res.message,
      data: res.data,
      token: res.token,
      refreshToken: res.refreshToken,
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
    cookieStore.delete("refreshToken");
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
