import { AxiosError } from "axios";
import axiosInstance from "./axios";
import { API } from "./endpoints";

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  image?: string;
  role?: "user" | "admin";
}

export interface AdminUsersResponse {
  success: boolean;
  data: AdminUser[];
}

export interface AdminUserResponse {
  success: boolean;
  message: string;
  data: AdminUser;
}

export const getAdminUsers = async (): Promise<AdminUser[]> => {
  try {
    const res = await axiosInstance.get<AdminUsersResponse>(API.ADMIN.USERS.GET_ALL);
    return res.data.data;
  } catch (err: unknown) {
    let message = "Failed to load users";

    if (err instanceof AxiosError && err.response) {
      message = err.response.data?.message || message;
    } else if (err instanceof Error) {
      message = err.message;
    }

    throw new Error(message);
  }
};

export const updateAdminUser = async (userId: string, data: FormData): Promise<AdminUser> => {
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const res = await axiosInstance.put<AdminUserResponse>(`${API.ADMIN.USERS.UPDATE}/${userId}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return res.data.data;
  } catch (err: unknown) {
    let message = "User update failed";

    if (err instanceof AxiosError && err.response) {
      message = err.response.data?.message || message;
    } else if (err instanceof Error) {
      message = err.message;
    }

    throw new Error(message);
  }
};
