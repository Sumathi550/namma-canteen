import React, { useState, useEffect, useRef } from "react";
import {
  BookOpen,
  Plus,
  Search,
  CheckCircle,
  CheckCircle2,
  XCircle,
  Edit2,
  Trash2,
  RefreshCw,
  Image as ImageIcon,
  DollarSign,
  Package,
  UploadCloud,
  LoaderCircle
} from "lucide-react";
import { staffApi } from "../services/api";

const CATEGORIES = [
  "All",
  "Tiffin Specials",
  "Meals & Rice",
  "Parotta & Biriyani",
  "Evening Snacks",
  "Beverages & Coolers"
];

export default function MenuManager() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("All");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "Tiffin Specials",
    price: "",
    stock: "50",
    isVeg: true,
    available: true,
    image: "",
    description: ""
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  async function handleFileUpload(file) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setUploadError("Please choose an image file (PNG, JPG, WEBP).");
      return;
    }
    setUploadError("");
    setUploading(true);

    try {
      const res = await staffApi.uploadProductImage(file);
      const newUrl = res.imageUrl || res.image;
      if (newUrl) {
        setFormData((prev) => ({ ...prev, image: newUrl }));
      } else {
        throw new Error("No image URL returned from server");
      }
    } catch (err) {
      console.error("Upload error:", err);
      try {
        const reader = new FileReader();
        reader.onload = () => {
          setFormData((prev) => ({ ...prev, image: reader.result }));
        };
        reader.readAsDataURL(file);
      } catch (readErr) {
        setUploadError(err.message || "Failed to upload image file");
      }
    } finally {
      setUploading(false);
    }
  }

  async function loadProducts() {
    setLoading(true);
    try {
      const res = await staffApi.getProducts();
      setProducts(res.products || []);
    } catch (err) {
      console.error("Failed to load products:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  function showMessage(text) {
    setMsg(text);
    setTimeout(() => setMsg(""), 3500);
  }

  async function handleToggleStock(productId) {
    try {
      const res = await staffApi.toggleProductAvailability(productId);
      setProducts((prev) =>
        prev.map((p) => (p._id === productId ? res.product : p))
      );
      showMessage(`Availability updated for "${res.product.name}"`);
    } catch (err) {
      alert(err.message || "Could not toggle item availability.");
    }
  }

  function handleOpenCreate() {
    setEditingProduct(null);
    setFormData({
      name: "",
      category: "Tiffin Specials",
      price: "",
      stock: "50",
      isVeg: true,
      available: true,
      image: "",
      description: ""
    });
    setIsModalOpen(true);
  }

  function handleOpenEdit(product) {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category || "Tiffin Specials",
      price: String(product.price),
      stock: String(product.stock ?? 50),
      isVeg: product.isVeg !== false,
      available: product.available !== false && product.isAvailable !== false,
      image: product.imageUrl || product.image || "",
      description: product.description || ""
    });
    setIsModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);

    const payload = {
      name: formData.name.trim(),
      category: formData.category,
      price: Number(formData.price),
      stock: Number(formData.stock) || 50,
      isVeg: formData.isVeg,
      available: formData.available,
      isAvailable: formData.available,
      image: formData.image.trim(),
      imageUrl: formData.image.trim(),
      description: formData.description.trim()
    };

    try {
      if (editingProduct) {
        await staffApi.updateProduct(editingProduct._id, payload);
        showMessage(`Updated "${payload.name}" successfully!`);
      } else {
        await staffApi.createProduct(payload);
        showMessage(`Added "${payload.name}" to canteen menu!`);
      }
      setIsModalOpen(false);
      loadProducts();
    } catch (err) {
      alert(err.message || "Failed to save item.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(productId, productName) {
    if (!window.confirm(`Are you sure you want to remove "${productName}" from the menu?`)) return;
    try {
      await staffApi.deleteProduct(productId);
      showMessage(`Removed "${productName}".`);
      loadProducts();
    } catch (err) {
      alert(err.message || "Could not delete food item.");
    }
  }

  // Filter
  const filteredProducts = products.filter((p) => {
    if (selectedCat !== "All" && p.category !== selectedCat) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const n = p.name?.toLowerCase().includes(q);
      const c = p.category?.toLowerCase().includes(q);
      if (!n && !c) return false;
    }
    return true;
  });

  return (
    <div className="staff-page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-header-title">
            <BookOpen size={28} style={{ color: "#ea580c" }} />
            <span>Menu & Live Stock Manager</span>
          </h1>
          <p className="page-header-sub">
            Toggle real-time item availability, edit prices, and manage campus food catalog.
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button
            type="button"
            className="icon-toggle-btn"
            onClick={loadProducts}
            title="Refresh Catalog"
          >
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            onClick={handleOpenCreate}
            style={{
              background: "linear-gradient(135deg, #ea580c, #f97316)",
              color: "#fff",
              border: "none",
              padding: "0.6rem 1.1rem",
              borderRadius: "8px",
              fontWeight: 700,
              fontSize: "0.88rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              boxShadow: "0 0 15px rgba(234, 88, 12, 0.3)"
            }}
          >
            <Plus size={18} />
            <span>Add New Dish</span>
          </button>
        </div>
      </div>

      {msg && (
        <div
          style={{
            background: "rgba(34, 197, 94, 0.15)",
            border: "1px solid #22c55e",
            color: "#86efac",
            padding: "0.75rem 1rem",
            borderRadius: "8px",
            marginBottom: "1.25rem",
            fontSize: "0.88rem"
          }}
        >
          ✓ {msg}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="controls-strip">
        <div className="filter-tab-pills">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`filter-pill ${selectedCat === cat ? "active" : ""}`}
              onClick={() => setSelectedCat(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="search-field-wrap">
          <Search size={16} style={{ color: "#64748b" }} />
          <input
            type="text"
            placeholder="Search dish by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Menu Table */}
      {loading ? (
        <div className="empty-state-box">
          <RefreshCw size={36} className="animate-spin" />
          <p>Loading canteen menu...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="empty-state-box">
          <p>No dishes found matching criteria.</p>
        </div>
      ) : (
        <div className="menu-table-wrap">
          <table className="menu-table">
            <thead>
              <tr>
                <th>Dish / Photo</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Live Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => {
                const isAvail = p.available !== false && p.isAvailable !== false;
                const imgSrc = p.imageUrl || p.image;

                return (
                  <tr key={p._id}>
                    <td>
                      <div className="food-cell">
                        <img
                          src={imgSrc}
                          alt={p.name}
                          className="food-thumbnail"
                          onError={(e) => {
                            e.currentTarget.src =
                              "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=400&q=80";
                          }}
                        />
                        <div>
                          <div className="food-title">{p.name}</div>
                          <span className={`food-diet-badge ${p.isVeg ? "veg" : "non-veg"}`}>
                            {p.isVeg ? "🌱 Pure Veg" : "🍗 Non-Veg"}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span
                        style={{
                          background: "#1e293b",
                          padding: "4px 8px",
                          borderRadius: "6px",
                          fontSize: "0.82rem",
                          color: "#cbd5e1"
                        }}
                      >
                        {p.category}
                      </span>
                    </td>

                    <td>
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontWeight: 700,
                          fontSize: "1rem",
                          color: "#fff"
                        }}
                      >
                        ₹{p.price}
                      </span>
                    </td>

                    <td>
                      <span style={{ fontFamily: "var(--font-mono)", color: "#94a3b8" }}>
                        {p.stock ?? 50} units
                      </span>
                    </td>

                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                        <label className="switch">
                          <input
                            type="checkbox"
                            checked={isAvail}
                            onChange={() => handleToggleStock(p._id)}
                          />
                          <span className="slider"></span>
                        </label>
                        <span
                          style={{
                            fontSize: "0.82rem",
                            fontWeight: 600,
                            color: isAvail ? "#4ade80" : "#f87171"
                          }}
                        >
                          {isAvail ? "In Stock" : "Sold Out"}
                        </span>
                      </div>
                    </td>

                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "0.4rem" }}>
                        <button
                          type="button"
                          className="icon-toggle-btn"
                          onClick={() => handleOpenEdit(p)}
                          title="Edit Dish"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          type="button"
                          className="logout-btn"
                          onClick={() => handleDelete(p._id, p.name)}
                          title="Delete Dish"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Dish Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-dialog" style={{ maxWidth: "600px" }}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingProduct ? `Edit "${editingProduct.name}"` : "Add New Dish to Canteen"}
              </h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="form-group" style={{ gridColumn: "span 2" }}>
                  <label className="form-label">Dish Name</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Madurai Bun Parotta"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    className="form-select"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    {CATEGORIES.filter((c) => c !== "All").map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Price (₹ INR)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    className="form-input"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="50"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Dietary Classification</label>
                  <select
                    className="form-select"
                    value={formData.isVeg ? "veg" : "non-veg"}
                    onChange={(e) =>
                      setFormData({ ...formData, isVeg: e.target.value === "veg" })
                    }
                  >
                    <option value="veg">🌱 Pure Vegetarian</option>
                    <option value="non-veg">🍗 Non-Vegetarian</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Daily Initial Stock</label>
                  <input
                    type="number"
                    min="0"
                    className="form-input"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="50"
                  />
                </div>

                <div className="form-group" style={{ gridColumn: "span 2" }}>
                  <label className="form-label" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span>Food Picture (Upload from System)</span>
                    {uploading && <span style={{ fontSize: "0.8rem", color: "#ea580c", fontWeight: 600 }}>Uploading...</span>}
                  </label>

                  {formData.image ? (
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                      background: "rgba(255, 255, 255, 0.05)",
                      border: "1.5px solid rgba(255, 255, 255, 0.12)",
                      padding: "0.85rem",
                      borderRadius: "10px"
                    }}>
                      <img
                        src={formData.image}
                        alt="Preview"
                        style={{
                          width: "80px",
                          height: "80px",
                          borderRadius: "8px",
                          objectFit: "cover",
                          border: "1px solid rgba(255, 255, 255, 0.2)",
                          background: "#1e293b"
                        }}
                        onError={(e) => {
                          e.currentTarget.src = "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=200&q=80";
                        }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#4ade80", fontSize: "0.85rem", fontWeight: 600 }}>
                          <CheckCircle2 size={16} />
                          <span>Food Photo Attached</span>
                        </div>
                        <p style={{ margin: "4px 0 8px 0", fontSize: "0.78rem", color: "#94a3b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {formData.image.startsWith("/images/") ? formData.image : (formData.image.startsWith("data:") ? "Local Image File" : formData.image)}
                        </p>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            className="icon-toggle-btn"
                            style={{ fontSize: "0.78rem", padding: "4px 10px" }}
                          >
                            Change Picture
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, image: "" })}
                            disabled={uploading}
                            style={{
                              fontSize: "0.78rem",
                              padding: "4px 10px",
                              borderRadius: "6px",
                              cursor: "pointer",
                              border: "1px solid rgba(239, 68, 68, 0.4)",
                              background: "rgba(239, 68, 68, 0.15)",
                              color: "#fca5a5",
                              fontWeight: 600
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDragging(false);
                        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                          handleFileUpload(e.dataTransfer.files[0]);
                        }
                      }}
                      style={{
                        border: isDragging ? "2px dashed #ea580c" : "2px dashed rgba(255, 255, 255, 0.2)",
                        borderRadius: "10px",
                        padding: "1.25rem",
                        textAlign: "center",
                        cursor: "pointer",
                        background: isDragging ? "rgba(234, 88, 12, 0.1)" : "rgba(255, 255, 255, 0.03)",
                        transition: "all 0.2s ease"
                      }}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleFileUpload(e.target.files[0]);
                          }
                        }}
                      />
                      {uploading ? (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                          <LoaderCircle size={28} className="spin" style={{ color: "#ea580c" }} />
                          <span style={{ fontSize: "0.88rem", color: "#ea580c", fontWeight: 600 }}>
                            Uploading food picture from system...
                          </span>
                        </div>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                          <div style={{
                            width: "44px",
                            height: "44px",
                            borderRadius: "50%",
                            background: "rgba(234, 88, 12, 0.2)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#ea580c"
                          }}>
                            <UploadCloud size={24} />
                          </div>
                          <span style={{ fontSize: "0.92rem", fontWeight: 700, color: "#f8fafc" }}>
                            Click or Drag to Upload Food Image from System
                          </span>
                          <span style={{ fontSize: "0.78rem", color: "#94a3b8" }}>
                            Select any photo from your computer (JPG, PNG, WEBP) • No URL needed!
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {uploadError && (
                    <div style={{ fontSize: "0.8rem", color: "#ef4444", marginTop: "4px" }}>
                      ⚠️ {uploadError}
                    </div>
                  )}
                </div>

                <div className="form-group" style={{ gridColumn: "span 2" }}>
                  <label className="form-label">Description & Ingredients</label>
                  <textarea
                    rows="2"
                    className="form-textarea"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Authentic ingredients, taste profile, and sides..."
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end", marginTop: "1rem" }}>
                <button
                  type="button"
                  className="icon-toggle-btn"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    background: "linear-gradient(135deg, #ea580c, #f97316)",
                    color: "#fff",
                    border: "none",
                    padding: "0.65rem 1.4rem",
                    borderRadius: "8px",
                    fontWeight: 700,
                    cursor: saving ? "not-allowed" : "pointer"
                  }}
                >
                  {saving ? "Saving..." : editingProduct ? "Update Dish" : "Create Dish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
