import { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [dragActive, setDragActive] = useState(false);

  const emptyForm = {
    name: "",
    bnName: "",
    category: "",
    price: "",
    weight: "",
    weights: [],          // ⭐ NEW — selectable sizes
    newWeight: "",        // temp input holder
    image: "",
    stock: "",
    description: "",
    ingredients: "",      // ⭐ NEW
    nutrition: ""         // ⭐ NEW
  };

  const [form, setForm] = useState(emptyForm);

  const fetchProducts = () => {
    fetch("http://localhost:5000/api/products")
      .then(res => res.json())
      .then(data => setProducts(data));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (uploading) return;

    if (!form.image) {
      setMessage("Please upload a product image");
      return;
    }

    const payload = { ...form };
    delete payload.newWeight; // cleanup temp field

    const url = editingId
      ? `http://localhost:5000/api/products/${editingId}`
      : "http://localhost:5000/api/products";

    const method = editingId ? "PUT" : "POST";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    setMessage(editingId ? "Product updated successfully" : "Product added successfully");
    setForm(emptyForm);
    setEditingId(null);
    fetchProducts();

    setTimeout(() => setMessage(""), 3000);
  };

  const startEdit = (product) => {
    setEditingId(product._id);

    setForm({
      ...product,
      weights: product.weights || [],
      newWeight: ""
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;

    await fetch(`http://localhost:5000/api/products/${id}`, {
      method: "DELETE"
    });

    fetchProducts();
  };

  const uploadImage = async (file) => {
    if (!file) return;

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch("http://localhost:5000/api/upload", {
        method: "POST",
        body: formData
      });

      const data = await res.json();
      setForm(prev => ({ ...prev, image: data.url }));
    } catch {
      setMessage("Image upload failed");
    } finally {
      setUploading(false);
      setDragActive(false);
    }
  };

  const addWeight = () => {
    if (!form.newWeight.trim()) return;

    setForm(prev => ({
      ...prev,
      weights: [...prev.weights, prev.newWeight.trim()],
      newWeight: ""
    }));
  };

  const removeWeight = (w) => {
    setForm(prev => ({
      ...prev,
      weights: prev.weights.filter(x => x !== w)
    }));
  };

  const inputStyle = {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "14px"
  };

  const fieldWrapper = { marginRight: "15px" };

  return (
    <AdminLayout>
      <h2 style={{ marginBottom: "15px" }}>Products</h2>

      <form
        onSubmit={handleSubmit}
        style={{
          background: "#fff",
          padding: "24px",
          borderRadius: "14px",
          boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
          marginBottom: "30px",
          border: editingId ? "2px solid #006837" : "none"
        }}
      >
        <h3>{editingId ? "Edit Product" : "Add New Product"}</h3>

        {message && (
          <div style={{ margin: "10px 0", color: "#006837", fontWeight: 600 }}>
            {message}
          </div>
        )}

        {/* INPUT GRID */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>

          <div style={fieldWrapper}>
            <input
              placeholder="Product Name"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              style={inputStyle}
            />
          </div>

          <div style={fieldWrapper}>
            <input
              placeholder="Bengali Name"
              value={form.bnName}
              onChange={e => setForm({ ...form, bnName: e.target.value })}
              style={inputStyle}
            />
          </div>

          <div style={fieldWrapper}>
            <select
              value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })}
              style={inputStyle}
            >
              <option value="">Select Category</option>
              <option value="Honey">🍯 Honey</option>
              <option value="Ghee">🧈 Ghee</option>
              <option value="Nuts">🥜 Nuts</option>
              <option value="Others">📦 Others</option>
            </select>
          </div>

          <div style={fieldWrapper}>
            <input
              type="number"
              placeholder="Base Price"
              value={form.price}
              onChange={e => setForm({ ...form, price: e.target.value })}
              style={inputStyle}
            />
          </div>

          {/* ⭐ Weight / Gram Options */}
          <div style={fieldWrapper}>
            <input
              placeholder="Add weight (ex: 250g, 500g, 1kg)"
              value={form.newWeight}
              onChange={e => setForm({ ...form, newWeight: e.target.value })}
              style={inputStyle}
            />
            <button
              type="button"
              onClick={addWeight}
              style={{ marginTop: "6px", padding: "6px 10px", borderRadius: "8px" }}
            >
            </button>

            {form.weights.length > 0 && (
              <div style={{ marginTop: "8px", display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {form.weights.map(w => (
                  <span
                    key={w}
                    style={{ padding: "6px 10px", borderRadius: "16px", background: "#eef", cursor: "pointer" }}
                    onClick={() => removeWeight(w)}
                  >
                    {w} ✕
                  </span>
                ))}
              </div>
            )}
          </div>

          <div style={fieldWrapper}>
            <input
              type="number"
              placeholder="Stock Quantity"
              value={form.stock}
              onChange={e => setForm({ ...form, stock: e.target.value })}
              style={inputStyle}
            />
          </div>

          {/* ⭐ Ingredients */}
          <div style={{ gridColumn: "1 / -1" }}>
            <textarea
              placeholder="Ingredients"
              value={form.ingredients}
              onChange={e => setForm({ ...form, ingredients: e.target.value })}
              rows={2}
              style={inputStyle}
            />
          </div>

          {/* ⭐ Nutrition Facts */}
          <div style={{ gridColumn: "1 / -1" }}>
            <textarea
              placeholder="Nutrition Facts"
              value={form.nutrition}
              onChange={e => setForm({ ...form, nutrition: e.target.value })}
              rows={2}
              style={inputStyle}
            />
          </div>

          {/* Description */}
          <div style={{ gridColumn: "1 / -1" }}>
            <textarea
              placeholder="Product Description"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              rows={4}
              style={inputStyle}
            />
          </div>
        </div>

        {/* Drag + Drop Upload */}
        <div
          onDragOver={e => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={e => {
            e.preventDefault();
            uploadImage(e.dataTransfer.files[0]);
          }}
          style={{
            marginTop: "20px",
            padding: "20px",
            border: `2px dashed ${dragActive ? "#006837" : "#ccc"}`,
            borderRadius: "12px",
            textAlign: "center"
          }}
        >
          <label htmlFor="fileUpload">
            Drag & drop image here or <strong>click to upload</strong>
          </label>

          <input
            type="file"
            hidden
            id="fileUpload"
            accept="image/*"
            onChange={e => uploadImage(e.target.files[0])}
          />
        </div>

        {/* Preview */}
        {form.image && (
          <img
            src={form.image}
            style={{ width: "90px", marginTop: "12px", borderRadius: "10px" }}
          />
        )}

        <div style={{ marginTop: "20px", display: "flex", gap: "12px" }}>
          <button type="submit" style={{ background: "#006837", color: "#fff", padding: "12px 22px", borderRadius: "10px" }}>
            {editingId ? "Update Product" : "Add Product"}
          </button>

          {editingId && (
            <button type="button" onClick={cancelEdit} style={{ background: "#eee", padding: "12px 22px", borderRadius: "10px" }}>
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      {/* LIST */}
      {/* LIST */}
{products.map(p => (
  <div
    key={p._id}
    style={{
      background: "#fff",
      padding: "14px",
      borderRadius: "12px",
      display: "flex",
      alignItems: "center",
      gap: "14px",
      marginBottom: "12px",
      boxShadow: "0 4px 10px rgba(0,0,0,0.05)"
    }}
  >
    <img
      src={p.image}
      alt={p.name}
      style={{ width: 60, height: 60, borderRadius: "10px", objectFit: "cover" }}
    />

    <div style={{ flex: 1 }}>
      <strong>{p.name}</strong>

      <div style={{ fontSize: "13px", color: "#555" }}>
        ₹{p.price} — {p.weights?.join(", ") || p.weight}
      </div>

      <div style={{ fontSize: "13px", color: p.stock === 0 ? "red" : "green" }}>
        Stock: {p.stock}
      </div>
    </div>

    <div style={{ display: "flex", gap: "8px" }}>
      <button
        onClick={() => startEdit(p)}
        style={{
          background: "#ffb703",
          color: "#000",
          border: "none",
          padding: "8px 14px",
          borderRadius: "8px",
          fontWeight: 600,
          cursor: "pointer"
        }}
      >
        ✏️ Edit
      </button>

      <button
        onClick={() => deleteProduct(p._id)}
        style={{
          background: "#222",
          color: "#fff",
          border: "none",
          padding: "8px 14px",
          borderRadius: "8px",
          fontWeight: 600,
          cursor: "pointer"
        }}
      >
        🗑️ Delete
      </button>
    </div>
  </div>
))}

    </AdminLayout>
  );
}
