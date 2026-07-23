import axios, { AxiosError } from "axios";
import axiosInstance from "./axios";
import { API } from "./endpoints";

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data: {
    _id: string;
    name: string;
    email: string;
    role: "user" | "admin";
    image?: string;
  };
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  data: {
    _id: string;
    name: string;
    email: string;
    role: "user" | "admin";
    phone?: string;
    address?: string;
    image?: string;
  };
}

export interface UpdateProfileData {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  image?: File;
}

export interface UpdateProfileResponse {
  success: boolean;
  message: string;
  data: {
    _id: string;
    name: string;
    email: string;
    role: "user" | "admin";
    phone?: string;
    address?: string;
    image?: string;
  };
}

export const registerUser = async (data: RegisterFormData): Promise<RegisterResponse> => {
  try {
    const res = await axiosInstance.post<RegisterResponse>(API.AUTH.REGISTER, data);
    return res.data;
  } catch (err: unknown) {
    let message = "Registration failed";

    if (err instanceof AxiosError && err.response) {
      message = err.response.data?.message || message;
    } else if (err instanceof Error) {
      message = err.message;
    }

    throw new Error(message);
  }
};

export const loginUser = async (data: LoginFormData): Promise<LoginResponse> => {
  try {
    const res = await axiosInstance.post<LoginResponse>(API.AUTH.LOGIN, data);
    return res.data;
  } catch (err: unknown) {
    let message = "Login failed";

    if (err instanceof AxiosError && err.response) {
      message = err.response.data?.message || message;
    } else if (err instanceof Error) {
      message = err.message;
    }

    throw new Error(message);
  }
};

export const updateProfile = async (userId: string, data: FormData): Promise<UpdateProfileResponse> => {
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const res = await axiosInstance.put<UpdateProfileResponse>(`${API.AUTH.UPDATE_PROFILE}/${userId}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  } catch (err: unknown) {
    let message = "Profile update failed";

    if (err instanceof AxiosError && err.response) {
      message = err.response.data?.message || message;
    } else if (err instanceof Error) {
      message = err.message;
    }

    throw new Error(message);
  }
};

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
}

export const changePassword = async (userId: string, data: ChangePasswordData): Promise<ChangePasswordResponse> => {
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const res = await axiosInstance.put<ChangePasswordResponse>(
      `${API.AUTH.CHANGE_PASSWORD}/${userId}`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return res.data;
  } catch (err: unknown) {
    let message = "Password change failed";

    if (err instanceof AxiosError && err.response) {
      message = err.response.data?.message || message;
    } else if (err instanceof Error) {
      message = err.message;
    }

    throw new Error(message);
  }
};