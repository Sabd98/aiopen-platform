import axios from "axios";

// Create axios instance with base configuration

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
  withCredentials: true, // Important: This allows cookies to be sent
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // You can add additional request logic here if needed
    console.log("API Request:", config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error("API Error:", error.response?.data || error.message);

    // Handle 401 unauthorized errors
    if (error.response?.status === 401) {
      console.log("Unauthorized access - redirecting to login");
    }

    return Promise.reject(error);
  }
);

export default api;
