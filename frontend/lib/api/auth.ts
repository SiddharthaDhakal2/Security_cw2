import { AxiosError } from "axios";
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
    mfaEnabled?: boolean;
  };
}

export interface LoginResponse {
  success: boolean;
  message: string;
  mfaRequired?: boolean;
  email?: string;
  token?: string;
  refreshToken?: string;
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
    mfaEnabled?: boolean;
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

export interface VerifyMfaLoginData {
  email: string;
  otp: string;
}

export const verifyMfaLogin = async (data: VerifyMfaLoginData): Promise<LoginResponse> => {
  try {
    const res = await axiosInstance.post<LoginResponse>(API.AUTH.MFA_VERIFY_LOGIN, data);
    return res.data;
  } catch (err: unknown) {
    let message = "MFA verification failed";

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
    const res = await axiosInstance.put<UpdateProfileResponse>(`${API.AUTH.UPDATE_PROFILE}/${userId}`, data);
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
    const res = await axiosInstance.put<ChangePasswordResponse>(
      `${API.AUTH.CHANGE_PASSWORD}/${userId}`,
      data,
      
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

export interface UpdateMfaData {
  enabled: boolean;
  currentPassword: string;
}

export const updateMfaPreference = async (
  userId: string,
  data: UpdateMfaData
): Promise<UpdateProfileResponse> => {
  try {
    const res = await axiosInstance.put<UpdateProfileResponse>(
      `${API.AUTH.UPDATE_MFA}/${userId}`,
      data
    );
    return res.data;
  } catch (err: unknown) {
    let message = "MFA update failed";

    if (err instanceof AxiosError && err.response) {
      message = err.response.data?.message || message;
    } else if (err instanceof Error) {
      message = err.message;
    }

    throw new Error(message);
  }
};

export interface RefreshSessionResponse {
  success: boolean;
  message: string;
  token?: string;
  refreshToken?: string;
  data?: LoginResponse["data"];
}

export const refreshSession = async (): Promise<RefreshSessionResponse> => {
  try {
    const res = await axiosInstance.post<RefreshSessionResponse>(API.AUTH.REFRESH_SESSION, {});
    return res.data;
  } catch (err: unknown) {
    let message = "Session refresh failed";

    if (err instanceof AxiosError && err.response) {
      message = err.response.data?.message || message;
    } else if (err instanceof Error) {
      message = err.message;
    }

    throw new Error(message);
  }
};

export const logoutSession = async (): Promise<{ success: boolean; message: string }> => {
  try {
    const res = await axiosInstance.post<{ success: boolean; message: string }>(API.AUTH.LOGOUT, {});
    return res.data;
  } catch (err: unknown) {
    let message = "Logout failed";

    if (err instanceof AxiosError && err.response) {
      message = err.response.data?.message || message;
    } else if (err instanceof Error) {
      message = err.message;
    }

    throw new Error(message);
  }
};
