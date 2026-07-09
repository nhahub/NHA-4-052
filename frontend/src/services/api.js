import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8001/api/v1",
  headers: { "Content-Type": "application/json" },
});

// ── Request interceptor: attach JWT ─────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("cx_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor: handle 401 ────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("cx_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
