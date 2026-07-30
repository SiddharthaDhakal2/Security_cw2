import axios from "axios";
import { API } from "./endpoints";

const getBaseURL = () => {
  // Server-side or Client-side, use the configured backend URL
  const url = 
    process.env.BACKEND_URL || 
    process.env.NEXT_PUBLIC_API_BASE_URL || 
    "http://localhost:5000";
  
  return url;
};

const baseURL = getBaseURL();

const axiosInstance = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  (config) => {
    // Let the browser set the boundary for FormData uploads
    if (typeof FormData !== "undefined" && config.data instanceof FormData) {
      if (config.headers) {
        delete (config.headers as Record<string, string>)["Content-Type"];
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle unauthorized responses
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as (typeof error.config & { _retry?: boolean }) | undefined;

    if (
      error.response?.status === 401 &&
      typeof window !== "undefined" &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes(API.AUTH.REFRESH_SESSION) &&
      !originalRequest.url?.includes(API.AUTH.LOGIN) &&
      !originalRequest.url?.includes(API.AUTH.MFA_VERIFY_LOGIN)
    ) {
      originalRequest._retry = true;

      try {
        await axiosInstance.post(API.AUTH.REFRESH_SESSION, {});
        return axiosInstance(originalRequest);
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        localStorage.removeItem("role");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
