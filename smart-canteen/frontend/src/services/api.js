const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function getToken() {
  return localStorage.getItem("canteenToken") || "";
}

async function request(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const config = {
    ...options,
    headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, config);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.message || `Request failed with status ${response.status}`;
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  // Public Health & Settings
  health: () => request("/health"),
  getPublicSettings: () => request("/settings"),

  // Authentication
  login: (credentials) =>
    request("/users/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),
  register: (userData) =>
    request("/users/register", {
      method: "POST",
      body: JSON.stringify(userData),
    }),
  getProfile: () => request("/users/me"),
  adminLogin: (credentials) =>
    request("/admin/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),

  // Products
  getProducts: (params = {}) => {
    const query = new URLSearchParams();
    if (params.category && params.category !== "All") query.append("category", params.category);
    if (params.search) query.append("search", params.search);
    if (params.availableOnly) query.append("availableOnly", "true");
    if (params.includeArchived) query.append("includeArchived", "true");
    const qs = query.toString();
    return request(`/products${qs ? `?${qs}` : ""}`);
  },
  getProduct: (id) => request(`/products/${id}`),
  addProduct: (productData) =>
    request("/products", {
      method: "POST",
      body: JSON.stringify(productData),
    }),
  updateProduct: (id, productData) =>
    request(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(productData),
    }),
  toggleProductAvailability: (id, available) =>
    request(`/products/${id}/availability`, {
      method: "PATCH",
      body: JSON.stringify({ available }),
    }),
  archiveProduct: (id) =>
    request(`/products/${id}`, {
      method: "DELETE",
    }),
  uploadProductImage: async (file) => {
    const token = getToken();
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch(`${API_BASE}/products/upload-image`, {
        method: "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      const data = await response.json().catch(() => ({}));
      if (response.ok && (data.imageUrl || data.image)) {
        return data;
      }
      throw new Error(data.message || "Upload request failed");
    } catch (err) {
      // Base64 fallback if multipart fetch has network/parser issue
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const fallbackRes = await fetch(`${API_BASE}/products/upload-image`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ imageBase64: base64, originalName: file.name }),
      });

      const fallbackData = await fallbackRes.json().catch(() => ({}));
      if (fallbackRes.ok && (fallbackData.imageUrl || fallbackData.image)) {
        return fallbackData;
      }
      throw new Error(fallbackData.message || err.message || "Failed to upload image");
    }
  },

  // Orders
  createOrder: (orderData) =>
    request("/orders", {
      method: "POST",
      body: JSON.stringify(orderData),
    }),
  getMyOrders: () => request("/orders/my-orders"),
  getOrder: (id) => request(`/orders/${id}`),
  cancelOrder: (id, reason) =>
    request(`/orders/${id}/cancel`, {
      method: "PATCH",
      body: JSON.stringify({ reason }),
    }),
  getAdminOrders: (params = {}) => {
    const query = new URLSearchParams();
    if (params.status && params.status !== "All") query.append("status", params.status);
    if (params.search) query.append("search", params.search);
    const qs = query.toString();
    return request(`/admin/orders${qs ? `?${qs}` : ""}`);
  },
  updateOrderStatus: (id, status, cancellationReason) =>
    request(`/admin/orders/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status, cancellationReason }),
    }),

  // Admin Dashboard & Reports
  getAdminDashboard: () => request("/admin/dashboard"),
  getAdminUsers: () => request("/admin/users"),
  getAdminReports: () => request("/admin/reports"),
  getAdminSettings: () => request("/admin/settings"),
  updateAdminSettings: (settingsData) =>
    request("/admin/settings", {
      method: "PUT",
      body: JSON.stringify(settingsData),
    }),
};

export default api;
