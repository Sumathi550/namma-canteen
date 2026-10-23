const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function getAuthHeaders() {
  const token = localStorage.getItem("staffToken") || localStorage.getItem("adminToken");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

async function request(path, options = {}) {
  const headers = { ...getAuthHeaders(), ...(options.headers || {}) };
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 401) {
    localStorage.removeItem("staffToken");
    localStorage.removeItem("staffUser");
    window.dispatchEvent(new CustomEvent("staff-auth-expired"));
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Request failed with status ${res.status}`);
  }
  return data;
}

export const staffApi = {
  // Authentication
  login: async (email, password) => {
    const res = await fetch(`${API_BASE}/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Invalid staff credentials");
    return data;
  },

  // Dashboard Overview
  getDashboard: () => request("/admin/dashboard"),

  // Live Orders
  getOrders: (params = {}) => {
    const query = new URLSearchParams();
    if (params.status && params.status !== "All") query.append("status", params.status);
    if (params.search) query.append("search", params.search);
    const qs = query.toString() ? `?${query.toString()}` : "";
    return request(`/admin/orders${qs}`);
  },

  updateOrderStatus: (orderId, status, cancellationReason = "") => {
    return request(`/admin/orders/${orderId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status, cancellationReason })
    });
  },

  // Menu Management
  getProducts: () => request("/admin/products"),

  createProduct: (productData) => {
    return request("/admin/products", {
      method: "POST",
      body: JSON.stringify(productData)
    });
  },

  updateProduct: (productId, productData) => {
    return request(`/admin/products/${productId}`, {
      method: "PUT",
      body: JSON.stringify(productData)
    });
  },

  toggleProductAvailability: (productId) => {
    return request(`/admin/products/${productId}/toggle`, {
      method: "PATCH"
    });
  },

  deleteProduct: (productId) => {
    return request(`/admin/products/${productId}`, {
      method: "DELETE"
    });
  },

  uploadProductImage: async (file) => {
    const token = localStorage.getItem("staffToken") || localStorage.getItem("adminToken");
    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch(`${API_BASE}/admin/upload-image`, {
        method: "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: formData
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && (data.imageUrl || data.image)) {
        return data;
      }
      throw new Error(data.message || "Upload failed");
    } catch (err) {
      // Fallback: Base64 upload
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const fallbackRes = await fetch(`${API_BASE}/admin/upload-image`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ imageBase64: base64, originalName: file.name })
      });

      const fallbackData = await fallbackRes.json().catch(() => ({}));
      if (fallbackRes.ok && (fallbackData.imageUrl || fallbackData.image)) {
        return fallbackData;
      }
      throw new Error(fallbackData.message || err.message || "Failed to upload image");
    }
  },

  // Canteen Settings & Announcements
  getSettings: () => request("/admin/settings"),

  updateSettings: (settingsData) => {
    return request("/admin/settings", {
      method: "PUT",
      body: JSON.stringify(settingsData)
    });
  },

  // Analytics Reports
  getReports: (range = "today") => request(`/admin/reports?range=${range}`)
};
