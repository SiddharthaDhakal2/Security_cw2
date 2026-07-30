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
const CSRF_ENDPOINT = "/api/csrf-token";
const CSRF_HEADER = "X-CSRF-Token";
const unsafeMethods = new Set(["post", "put", "patch", "delete"]);

let csrfToken: string | null = null;
let csrfTokenRequest: Promise<string> | null = null;

const isBrowser = () => typeof window !== "undefined";

const isUnsafeMethod = (method?: string) => {
  return unsafeMethods.has((method || "get").toLowerCase());
};

const setHeader = (headers: unknown, name: string, value: string) => {
  const maybeHeaders = headers as { set?: (key: string, val: string) => void } & Record<string, string>;

  if (typeof maybeHeaders.set === "function") {
    maybeHeaders.set(name, value);
    return;
  }

  maybeHeaders[name] = value;
};

const deleteHeader = (headers: unknown, name: string) => {
  const maybeHeaders = headers as { delete?: (key: string) => void } & Record<string, string>;

  if (typeof maybeHeaders.delete === "function") {
    maybeHeaders.delete(name);
    return;
  }

  delete maybeHeaders[name];
};

const getCsrfToken = async () => {
  if (csrfToken) return csrfToken;
  if (csrfTokenRequest) return csrfTokenRequest;

  csrfTokenRequest = axios
    .get<{ csrfToken: string }>(`${baseURL}${CSRF_ENDPOINT}`, { withCredentials: true })
    .then((response) => {
      csrfToken = response.data.csrfToken;
      return csrfToken;
    })
    .finally(() => {
      csrfTokenRequest = null;
    });

  return csrfTokenRequest;
};

const axiosInstance = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  async (config) => {
    // Let the browser set the boundary for FormData uploads
    if (typeof FormData !== "undefined" && config.data instanceof FormData) {
      if (config.headers) {
        deleteHeader(config.headers, "Content-Type");
      }
    }

    if (
      isBrowser() &&
      isUnsafeMethod(config.method) &&
      !config.url?.includes(CSRF_ENDPOINT)
    ) {
      setHeader(config.headers, CSRF_HEADER, await getCsrfToken());
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
    const originalRequest = error.config as
      | (typeof error.config & { _retry?: boolean; _csrfRetry?: boolean })
      | undefined;

    if (
      error.response?.status === 403 &&
      typeof window !== "undefined" &&
      originalRequest &&
      !originalRequest._csrfRetry &&
      String(error.response.data?.message || "").toLowerCase().includes("csrf")
    ) {
      originalRequest._csrfRetry = true;
      csrfToken = null;
      return axiosInstance(originalRequest);
    }

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
