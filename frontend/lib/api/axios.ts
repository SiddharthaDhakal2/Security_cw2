import axios from "axios";

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

// Add JWT token to requests
axiosInstance.interceptors.request.use(
  (config) => {
    // Only add token on client side
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

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
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      // Clear auth data on 401
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Optionally redirect to login
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
