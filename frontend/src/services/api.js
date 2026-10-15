import axios from "axios";

// Create Axios instance with backend base URL and credentials enabled
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000",
  withCredentials: true, // Crucial: sends & receives HttpOnly cookies automatically
  headers: {
    "Content-Type": "application/json",
  },
});

// API Service Methods
export const registerCustomer = async (customerData) => {
  const response = await api.post("/customers/register", customerData);
  return response.data;
};

export const loginCustomer = async (credentials) => {
  const response = await api.post("/customers/login", credentials);
  return response.data;
};

export const getMyProfile = async () => {
  const response = await api.get("/customers/me");
  return response.data;
};

export const logoutCustomer = async () => {
  const response = await api.post("/customers/logout");
  return response.data;
};

// ─── PRODUCT SERVICE METHODS ──────────────────────────────────────────────────

export const getProducts = async (params = {}) => {
  // params: { search, category, sort }
  const response = await api.get("/products", { params });
  return response.data;
};

export const getProductById = async (id) => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

export const createProduct = async (productData) => {
  const response = await api.post("/products", productData);
  return response.data;
};

// ─── WISHLIST SERVICE METHODS ─────────────────────────────────────────────────

export const getWishlist = async () => {
  const response = await api.get("/wishlist");
  return response.data;
};

export const addToWishlist = async (productId) => {
  const response = await api.post(`/wishlist/${productId}`);
  return response.data;
};

export const removeFromWishlist = async (productId) => {
  const response = await api.delete(`/wishlist/${productId}`);
  return response.data;
};

export const toggleWishlist = async (productId) => {
  const response = await api.patch(`/wishlist/${productId}/toggle`);
  return response.data;
};

// ─── CART SERVICE METHODS ─────────────────────────────────────────────────────

export const getCart = async () => {
  const response = await api.get("/cart");
  return response.data;
};

export const addToCart = async (productId) => {
  const response = await api.post(`/cart/${productId}`);
  return response.data;
};

export const updateCartQuantity = async (productId, quantity) => {
  const response = await api.patch(`/cart/${productId}`, { quantity });
  return response.data;
};

export const removeFromCart = async (productId) => {
  const response = await api.delete(`/cart/${productId}`);
  return response.data;
};

// ─── ORDER / PAYMENT SERVICE METHODS ──────────────────────────────────────────

export const createPaymentOrder = async (payload) => {
  const response = await api.post("/orders/create-payment-order", payload);
  return response.data;
};

export const verifyPayment = async (payload) => {
  const response = await api.post("/orders/verify-payment", payload);
  return response.data;
};

export const getOrders = async () => {
  const response = await api.get("/orders");
  return response.data;
};

export const getOrderById = async (id) => {
  const response = await api.get(`/orders/${id}`);
  return response.data;
};

export default api;
