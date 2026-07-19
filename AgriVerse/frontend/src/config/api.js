import axios from "axios";

// Single axios instance for the whole app. Base URL is empty because
// the Vite dev server proxies /api to the backend (see vite.config.js);
// in production, set VITE_API_BASE_URL to your deployed backend URL,
// e.g. https://agriverse-backend.onrender.com/api
const rawBase = import.meta.env.VITE_API_BASE_URL || "";

const api = axios.create({
  baseURL: rawBase,
  headers: { "Content-Type": "application/json" },
});

// Attach the admin JWT (if present) to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("agriverse_admin_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// The backend also serves plain static files (uploaded payment
// screenshots) at /uploads/..., which sits OUTSIDE the /api prefix.
// Locally, Vite's dev proxy makes a relative "/uploads/..." path work
// automatically. In production, frontend and backend live on different
// domains, so a bare "/uploads/..." path would resolve against the
// FRONTEND's own domain and 404. fileUrl() fixes that by resolving it
// against the backend's origin instead. Use this anywhere a stored
// file path (like order.paymentScreenshot) is used as an <img src>.
const backendOrigin = rawBase.replace(/\/api\/?$/, "");
export const fileUrl = (path) => {
  if (!path) return path;
  if (/^https?:\/\//i.test(path)) return path; // already an absolute URL
  return `${backendOrigin}${path}`;
};

export default api;