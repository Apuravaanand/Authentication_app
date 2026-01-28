// frontend/services/authService.js
import axios from "axios";

// Backend API URL (from .env or fallback)
const API_URL = import.meta.env.VITE_API_URL || "https://fullstack-authentication-page.onrender.com";

// Create Axios instance
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // only needed if backend uses cookies
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor to attach token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Save auth data (token + user info) to localStorage
const saveAuthData = (data) => {
  if (data?.token) localStorage.setItem("token", data.token);
  if (data?._id && data?.name && data?.email) {
    localStorage.setItem(
      "user",
      JSON.stringify({ _id: data._id, name: data.name, email: data.email })
    );
  }
};

// Remove auth data from localStorage
export const logoutUser = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

// ---------------- Auth API functions ----------------

// Register user (sends OTP to email)
export const registerUser = async (form) => {
  const { data } = await api.post("/api/auth/register", form);
  return data; // message only, no token yet
};

// Login user
export const loginUser = async (form) => {
  const { data } = await api.post("/api/auth/login", form);
  saveAuthData(data);
  return data; // returns user + token
};

// Verify OTP
export const verifyOtp = async ({ email, otp }) => {
  const { data } = await api.post("/api/auth/verify-otp", { email, otp });
  saveAuthData(data); // save token + user after successful OTP
  return data;
};
