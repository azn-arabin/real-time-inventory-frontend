import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// attach token on every request if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// auth endpoints
export const authApi = {
  register: (data: { username: string; email: string; password: string }) =>
    api.post("/users/register", data),
  login: (data: { email: string; password: string }) =>
    api.post("/users/login", data),
  getUser: (id: string) => api.get(`/users/${id}`),
};

// drops
export const dropsApi = {
  getDrops: (page = 1, pageSize = 10) =>
    api.get("/drops", { params: { page, pageSize } }),
  getDrop: (id: string) => api.get(`/drops/${id}`),
  createDrop: (data: {
    name: string;
    price: number;
    totalStock: number;
    imageUrl?: string;
    dropStartsAt?: string;
  }) => api.post("/drops", data),
};

// reservations
export const reservationsApi = {
  reserve: (dropId: string) => api.post("/reservations", { dropId }),
  getMyReservation: () => api.get("/reservations"),
};

// purchases
export const purchasesApi = {
  completePurchase: (reservationId: string) =>
    api.post("/purchases", { reservationId }),
  getMyPurchases: () => api.get("/purchases/mine"),
};

export default api;
