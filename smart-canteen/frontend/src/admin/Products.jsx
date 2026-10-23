import React, { useState, useMemo } from "react";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  AlertCircle,
  CheckCircle,
  Filter,
} from "lucide-react";
import ProductForm from "./ProductForm";

export default function Products({
  products = [],
  onAddProduct,
  onUpdateProduct,
  onToggleAvailability,
  onArchiveProduct,
  loading,
}) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // Filter products
  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (categoryFilter !== "All" && p.category?.toLowerCase() !== categoryFilter.toLowerCase()) {
        return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = p.name?.toLowerCase().includes(q);
        const matchCat = p.category?.toLowerCase().includes(q);
        if (!matchName && !matchCat) return false;
      }
      return true;
    });
  }, [products, categoryFilter, search]);

  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category).filter(Boolean));
    return ["All", ...Array.from(set)];
  }, [products]);

  function handleOpenAdd() {
    setEditingProduct(null);
    setIsModalOpen(true);
  }

  function handleOpenEdit(product) {
    setEditingProduct(product);
    setIsModalOpen(true);
  }

  async function handleSave(formData) {
    setFormLoading(true);
    try {
      if (editingProduct) {
        await onUpdateProduct(editingProduct._id, formData);
      } else {
        await onAddProduct(formData);
      }
      setIsModalOpen(false);
      setEditingProduct(null);
    } finally {
      setFormLoading(false);
    }
  }

  function handleArchiveConfirm(product) {
    const confirmed = window.confirm(
      `Are you sure you want to remove "${product.name}" from the active menu? Historical orders will not be affected.`
    );
    if (confirmed) {
      onArchiveProduct(product._id);
    }
  }

  return (
    <div className="admin-products-view">
      {/* Top Action Bar */}
      <div className="admin-card" style={{ padding: "1.25rem 1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          {/* Search & Category Filter */}
          <div style={{ display: "flex", gap: "1rem", flex: 1, minWidth: "280px" }}>
            <div style={{ position: "relative", flex: 1 }}>
              <Search
                size={16}
                style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#64748b" }}
              />
              <input
                type="text"
                placeholder="Search menu items..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.55rem 0.75rem 0.55rem 2.25rem",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  fontSize: "0.9rem",
                  outline: "none",
                }}
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{
                padding: "0.55rem 1rem",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                fontSize: "0.9rem",
                outline: "none",
                background: "#fff",
              }}
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  Category: {c}
                </option>
              ))}
            </select>
          </div>

          {/* Add New Food Button */}
          <button
            type="button"
            className="btn-sm primary"
            style={{ padding: "0.6rem 1.1rem", fontSize: "0.9rem" }}
            onClick={handleOpenAdd}
          >
            <Plus size={16} />
            <span>Add New Dish</span>
          </button>
        </div>
      </div>

      {/* Food Items Table */}
      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <h3 className="admin-card-title">Canteen Food Catalog</h3>
            <span style={{ fontSize: "0.82rem", color: "#64748b" }}>
              Total {filtered.length} dishes in this view
            </span>
          </div>
        </div>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Category</th>
                <th>Type</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Available?</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>
                    No food items match your search.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const isAvail = item.available !== false && item.isAvailable !== false;
                  const isVeg = item.isVeg !== undefined ? item.isVeg : !item.name?.toLowerCase().includes("chicken");

                  return (
                    <tr key={item._id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                          <img
                            src={
                              item.imageUrl ||
                              item.image ||
                              "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=100&q=80"
                            }
                            alt={item.name}
                            className="food-table-thumb"
                          />
                          <div>
                            <strong style={{ fontSize: "0.95rem" }}>{item.name}</strong>
                            {item.description && (
                              <p style={{ margin: 0, fontSize: "0.75rem", color: "#64748b", maxWidth: "240px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {item.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ background: "#f1f5f9", padding: "3px 8px", borderRadius: "6px", fontSize: "0.8rem", fontWeight: 500 }}>
                          {item.category}
                        </span>
                      </td>
                      <td>
                        <span style={{ color: isVeg ? "#16a34a" : "#dc2626", fontWeight: 600, fontSize: "0.82rem" }}>
                          {isVeg ? "🌱 Pure Veg" : "🍗 Non-Veg"}
                        </span>
                      </td>
                      <td>
                        <strong style={{ fontSize: "1rem" }}>₹{item.price}</strong>
                      </td>
                      <td>
                        <span style={{ fontSize: "0.85rem", color: "#475569" }}>
                          {item.stock !== undefined ? `${item.stock} left` : "50"}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <label className="switch">
                            <input
                              type="checkbox"
                              checked={isAvail}
                              onChange={(e) => onToggleAvailability(item._id, e.target.checked)}
                            />
                            <span className="slider"></span>
                          </label>
                          <span style={{ fontSize: "0.75rem", fontWeight: 600, color: isAvail ? "#16a34a" : "#dc2626" }}>
                            {isAvail ? "Active" : "Sold Out"}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="action-btn-row">
                          <button
                            type="button"
                            className="btn-sm outline"
                            onClick={() => handleOpenEdit(item)}
                            title="Edit food details or price"
                          >
                            <Edit2 size={13} />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            className="btn-sm danger"
                            onClick={() => handleArchiveConfirm(item)}
                            title="Archive food item safely"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Form Modal */}
      <ProductForm
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProduct(null);
        }}
        initialData={editingProduct}
        onSave={handleSave}
        loading={formLoading}
      />
    </div>
  );
}
