import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://fullstack-authentication-page.onrender.com";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Save auth data to localStorage
const saveAuthData = (data) => {
  if (data?.token) localStorage.setItem("token", data.token);
  if (data?._id && data?.name && data?.email) {
    localStorage.setItem(
      "user",
      JSON.stringify({ _id: data._id, name: data.name, email: data.email })
    );
  }
};

// Remove auth data
export const logoutUser = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

// ---------------- Auth APIs ----------------
export const registerUser = async (form) => {
  const { data } = await api.post("/api/auth/register", form);
  return data; // only message, no token yet
};

export const verifyOtp = async ({ email, otp }) => {
  const { data } = await api.post("/api/auth/verify-otp", { email, otp });
  saveAuthData(data); // save token + user after successful OTP
  return data;
};

export const loginUser = async (form) => {
  const { data } = await api.post("/api/auth/login", form);
  saveAuthData(data);
  return data;
};
