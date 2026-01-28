// frontend/services/authService.js
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "https://fullstack-authentication-page.onrender.com" ;
if (!API_URL) throw new Error("VITE_API_URL not defined");

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Save auth data
const saveAuthData = (data) => {
  if (data?.token) localStorage.setItem("token", data.token);
  if (data?._id) {
    localStorage.setItem(
      "user",
      JSON.stringify({ _id: data._id, name: data.name, email: data.email })
    );
  }
};

export const registerUser = async (form) => {
  const { data } = await api.post("/api/auth/register", form);
  return data;
};

export const loginUser = async (form) => {
  const { data } = await api.post("/api/auth/login", form);
  saveAuthData(data);
  return data;
};

export const verifyOtp = async (form) => {
  const { data } = await api.post("/api/auth/verify-otp", form);
  saveAuthData(data);
  return data;
};

export const logoutUser = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};
