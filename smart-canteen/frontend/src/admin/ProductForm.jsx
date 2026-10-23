import React, { useState, useEffect, useRef } from "react";
import { X, LoaderCircle, Image as ImageIcon, UploadCloud, CheckCircle2 } from "lucide-react";
import { api } from "../services/api";

const CATEGORIES = [
  "Tiffin Specials",
  "Meals & Rice",
  "Parotta & Biriyani",
  "Evening Snacks",
  "Beverages & Coolers",
];

export default function ProductForm({ isOpen, onClose, initialData = null, onSave, loading }) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Tiffin Specials");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [description, setDescription] = useState("");
  const [isVeg, setIsVeg] = useState(true);
  const [stock, setStock] = useState(50);
  const [available, setAvailable] = useState(true);
  const [error, setError] = useState("");

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
      const res = await api.uploadProductImage(file);
      const newUrl = res.imageUrl || res.image;
      if (newUrl) {
        setImageUrl(newUrl);
      } else {
        throw new Error("No image URL returned from server");
      }
    } catch (err) {
      console.error("Upload error:", err);
      // Fallback: Read as data URL locally
      try {
        const reader = new FileReader();
        reader.onload = () => {
          setImageUrl(reader.result);
        };
        reader.readAsDataURL(file);
      } catch (readErr) {
        setUploadError(err.message || "Failed to upload image file");
      }
    } finally {
      setUploading(false);
    }
  }

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setCategory(initialData.category || "Snacks");
      setPrice(initialData.price !== undefined ? String(initialData.price) : "");
      setImageUrl(initialData.imageUrl || initialData.image || "");
      setDescription(initialData.description || "");
      setIsVeg(initialData.isVeg !== undefined ? initialData.isVeg : true);
      setStock(initialData.stock !== undefined ? initialData.stock : 50);
      setAvailable(initialData.available !== false && initialData.isAvailable !== false);
    } else {
      setName("");
      setCategory("Snacks");
      setPrice("");
      setImageUrl("");
      setDescription("");
      setIsVeg(true);
      setStock(50);
      setAvailable(true);
    }
    setError("");
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Dish name is required.");
      return;
    }

    const numPrice = Number(price);
    if (!Number.isFinite(numPrice) || numPrice <= 0) {
      setError("Price must be a positive number.");
      return;
    }

    onSave({
      name: name.trim(),
      category: category.trim(),
      price: numPrice,
      imageUrl: imageUrl.trim(),
      image: imageUrl.trim(),
      description: description.trim(),
      isVeg,
      stock: Number(stock) || 50,
      available,
      isAvailable: available,
    });
  }

  return (
    <div className="admin-modal-backdrop" onClick={onClose}>
      <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h3>{initialData ? "Edit Canteen Food Item" : "Add New Dish to Menu"}</h3>
          <button type="button" className="close-drawer-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="admin-modal-body">
            {error && (
              <div style={{ color: "#dc2626", background: "#fee2e2", padding: "0.75rem", borderRadius: "8px", fontSize: "0.85rem" }}>
                {error}
              </div>
            )}

            <div className="form-grid-2">
              <div className="admin-form-group">
                <label>Food Item Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Veg Fried Rice"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="admin-form-group">
                <label>Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-grid-2">
              <div className="admin-form-group">
                <label>Price (₹) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  step="1"
                  placeholder="60"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>

              <div className="admin-form-group">
                <label>Initial Stock Units</label>
                <input
                  type="number"
                  min="0"
                  placeholder="50"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                />
              </div>
            </div>

            <div className="admin-form-group">
              <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <span>Food Picture (Upload from System)</span>
                {uploading && <span style={{ fontSize: "0.8rem", color: "#ea580c", fontWeight: 600 }}>Uploading...</span>}
              </label>

              {imageUrl ? (
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  background: "#f8fafc",
                  border: "1.5px solid #e2e8f0",
                  padding: "0.75rem",
                  borderRadius: "10px"
                }}>
                  <img
                    src={imageUrl}
                    alt="Preview"
                    style={{
                      width: "80px",
                      height: "80px",
                      borderRadius: "8px",
                      objectFit: "cover",
                      border: "1px solid #cbd5e1",
                      background: "#f1f5f9"
                    }}
                    onError={(e) => {
                      e.currentTarget.src = "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=200&q=80";
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#16a34a", fontSize: "0.82rem", fontWeight: 600 }}>
                      <CheckCircle2 size={15} />
                      <span>Picture Attached</span>
                    </div>
                    <p style={{ margin: "3px 0 8px 0", fontSize: "0.78rem", color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {imageUrl.startsWith("/images/") ? imageUrl : (imageUrl.startsWith("data:") ? "Local Image File" : imageUrl)}
                    </p>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        style={{
                          fontSize: "0.78rem",
                          padding: "5px 10px",
                          borderRadius: "6px",
                          cursor: "pointer",
                          border: "1px solid #cbd5e1",
                          background: "#fff",
                          fontWeight: 600,
                          color: "#334155"
                        }}
                      >
                        Change Picture
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageUrl("")}
                        disabled={uploading}
                        style={{
                          fontSize: "0.78rem",
                          padding: "5px 10px",
                          borderRadius: "6px",
                          cursor: "pointer",
                          border: "1px solid #fecaca",
                          background: "#fee2e2",
                          color: "#dc2626",
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
                    border: isDragging ? "2px dashed #ea580c" : "2px dashed #cbd5e1",
                    borderRadius: "10px",
                    padding: "1.25rem",
                    textAlign: "center",
                    cursor: "pointer",
                    background: isDragging ? "rgba(234, 88, 12, 0.05)" : "#f8fafc",
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
                        background: "#fed7aa",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#ea580c"
                      }}>
                        <UploadCloud size={24} />
                      </div>
                      <span style={{ fontSize: "0.92rem", fontWeight: 700, color: "#1e293b" }}>
                        Click or Drag to Upload Food Image from System
                      </span>
                      <span style={{ fontSize: "0.78rem", color: "#64748b" }}>
                        Select any photo from your computer (JPG, PNG, WEBP) • No URL needed!
                      </span>
                    </div>
                  )}
                </div>
              )}

              {uploadError && (
                <div style={{ fontSize: "0.8rem", color: "#dc2626", marginTop: "4px" }}>
                  ⚠️ {uploadError}
                </div>
              )}
            </div>

            <div className="admin-form-group">
              <label>Description (Optional)</label>
              <textarea
                rows={2}
                placeholder="Short description of ingredients or taste..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="form-grid-2">
              <div className="admin-form-group">
                <label>Dietary Type</label>
                <div style={{ display: "flex", gap: "1rem", marginTop: "4px" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontSize: "0.88rem" }}>
                    <input
                      type="radio"
                      name="isVegRadio"
                      checked={isVeg === true}
                      onChange={() => setIsVeg(true)}
                    />
                    🌱 Pure Veg
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontSize: "0.88rem" }}>
                    <input
                      type="radio"
                      name="isVegRadio"
                      checked={isVeg === false}
                      onChange={() => setIsVeg(false)}
                    />
                    🍗 Non-Veg / Egg
                  </label>
                </div>
              </div>

              <div className="admin-form-group">
                <label>Stock Status</label>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "4px" }}>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={available}
                      onChange={(e) => setAvailable(e.target.checked)}
                    />
                    <span className="slider"></span>
                  </label>
                  <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>
                    {available ? "In Stock (Available)" : "Sold Out (Unavailable)"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="admin-modal-footer">
            <button
              type="button"
              className="btn-sm outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-sm primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <LoaderCircle size={15} className="spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{initialData ? "Save Changes" : "Add Food Item"}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
