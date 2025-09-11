import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.DEV ? "/api" : import.meta.env.VITE_API_URL,
  headers: { Accept: "application/json" },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  const type = localStorage.getItem("auth_token_type") || "Bearer";
  if (token) config.headers.Authorization = `${type} ${token}`;
  return config;
});

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Handle 401 unauthorized errors - redirect to login
      if (error.response.status === 401) {
        // Clear authentication data
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_token_type");
        localStorage.removeItem("auth_user");
        
        // Redirect to login page
        window.location.href = "/login";
        return Promise.reject(error);
      }
      
      // Handle 404 errors specifically
      if (error.response.status === 404) {
        console.error('Resource not found:', {
          url: error.config.url,
          method: error.config.method,
          status: error.response.status,
          data: error.response.data
        });
      }
      // You can add more specific error handling here if needed
    }
    return Promise.reject(error);
  }
);
