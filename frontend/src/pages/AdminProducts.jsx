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
    weights: [],
    newWeight: { label: "", price: "" },
    image: "", // Main image URL for card
    images: [], // All image objects {url, public_id}
    stock: "",
    description: "",
    ingredients: "",
    nutrition: ""
  };

  const [form, setForm] = useState(emptyForm);
  const [selectedFiles, setSelectedFiles] = useState([]); // Raw files for upload
  const [previews, setPreviews] = useState([]); // Blob URLs for preview

  const fetchProducts = () => {
    fetch("http://localhost:5000/api/products")
      .then(res => res.json())
      .then(data => setProducts(data));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const [submitting, setSubmitting] = useState(false);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + selectedFiles.length + form.images.length > 5) {
      alert("Maximum 5 images allowed");
      return;
    }

    const newFiles = [...selectedFiles, ...files];
    setSelectedFiles(newFiles);

    // Create previews
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const removePreview = (index) => {
    const newFiles = [...selectedFiles];
    newFiles.splice(index, 1);
    setSelectedFiles(newFiles);

    const newPreviews = [...previews];
    URL.revokeObjectURL(newPreviews[index]);
    newPreviews.splice(index, 1);
    setPreviews(newPreviews);
  };

  const removeExistingImage = async (public_id) => {
    if (!window.confirm("Remove this image?")) return;
    
    // We'll update the database later, but for now just remove from UI
    setForm(prev => ({
      ...prev,
      images: prev.images.filter(img => img.public_id !== public_id)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (uploading || submitting) return;

    if (selectedFiles.length === 0 && form.images.length === 0) {
      setMessage("Please upload at least one image");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    setSubmitting(true);
    try {
      let uploadedImages = [...form.images];

      // 1️⃣ Upload new files if any
      if (selectedFiles.length > 0) {
        setUploading(true);
        const formData = new FormData();
        selectedFiles.forEach(file => formData.append("images", file));

        const uploadRes = await fetch("http://localhost:5000/api/upload", {
          method: "POST",
          body: formData
        });
        const uploadData = await uploadRes.json();
        uploadedImages = [...uploadedImages, ...uploadData];
        setUploading(false);
      }

      // 2️⃣ Save product
      const payload = { 
        ...form, 
        images: uploadedImages,
        image: uploadedImages[0]?.url || "" // Set first image as main image
      };
      delete payload.newWeight;

      const url = editingId
        ? `http://localhost:5000/api/products/${editingId}`
        : "http://localhost:5000/api/products";

      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setMessage(editingId ? "Product updated successfully" : "Product added successfully");
        setForm(emptyForm);
        setEditingId(null);
        setSelectedFiles([]);
        setPreviews([]);
        fetchProducts();
      } else {
        setMessage("Failed to save product");
      }
    } catch (err) {
      console.error(err);
      setMessage("Error occurred while saving product");
    } finally {
      setSubmitting(false);
      setUploading(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const startEdit = (product) => {
    setEditingId(product._id);
    setForm({
      ...product,
      weights: product.weights || [],
      images: product.images || [],
      newWeight: { label: "", price: "" }
    });
    setSelectedFiles([]);
    setPreviews([]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
    setSelectedFiles([]);
    setPreviews([]);
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    await fetch(`http://localhost:5000/api/products/${id}`, {
      method: "DELETE"
    });
    fetchProducts();
  };

  const addWeight = () => {
  const { label, price } = form.newWeight;
  if (!label || !price) return;

  setForm(prev => ({
    ...prev,
    weights: [...prev.weights, { label, price: Number(price) }],
    newWeight: { label: "", price: "" }
  }));
};


  const removeWeight = (label) => {
  setForm(prev => ({
    ...prev,
    weights: prev.weights.filter(w => w.label !== label)
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
          <div className="notification-popup">
            {message.includes("successfully") ? "✅" : "❌"} {message}
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

          {/* ⭐ Weight / Pack Options */}
<div style={fieldWrapper}>
  <input
    placeholder="Weight (ex: 250g, 1kg)"
    value={form.newWeight.label}
    onChange={e =>
      setForm({
        ...form,
        newWeight: { ...form.newWeight, label: e.target.value }
      })
    }
    style={inputStyle}
  />

  <input
    type="number"
    placeholder="Price for this weight"
    value={form.newWeight.price}
    onChange={e =>
      setForm({
        ...form,
        newWeight: { ...form.newWeight, price: e.target.value }
      })
    }
    style={{ ...inputStyle, marginTop: "6px" }}
  />

  <button
    type="button"
    onClick={addWeight}
    style={{ marginTop: "6px", padding: "6px 10px", borderRadius: "8px" }}
  >
    Add Pack
  </button>

  {form.weights.length > 0 && (
    <div style={{ marginTop: "8px", display: "flex", gap: "6px", flexWrap: "wrap" }}>
      {form.weights.map((w, i) => (
        <span
          key={i}
          style={{
            padding: "6px 10px",
            borderRadius: "16px",
            background: "#eef",
            cursor: "pointer"
          }}
          onClick={() => removeWeight(w.label)}
        >
          {w.label} – ₹{w.price} ✕
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
            handleFileChange({ target: { files: e.dataTransfer.files } });
          }}
          style={{
            marginTop: "20px",
            padding: "20px",
            border: `2px dashed ${dragActive ? "#006837" : "#ccc"}`,
            borderRadius: "12px",
            textAlign: "center",
            background: dragActive ? "#f0fdf4" : "transparent"
          }}
        >
          <label htmlFor="fileUpload" style={{ cursor: "pointer", display: "block" }}>
            <div style={{ fontSize: "24px", marginBottom: "8px" }}>📸</div>
            Drag & drop images here or <strong>click to upload</strong>
            <p style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>Max 5 images</p>
          </label>

          <input
            type="file"
            multiple
            hidden
            id="fileUpload"
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>

        {/* IMAGE PREVIEWS */}
        {(previews.length > 0 || form.images.length > 0) && (
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "16px" }}>
            {/* Existing Images */}
            {form.images.map((img) => (
              <div key={img.public_id} style={{ position: "relative" }}>
                <img
                  src={img.url}
                  style={{ width: "80px", height: "80px", borderRadius: "10px", objectFit: "cover", border: "2px solid #006837" }}
                />
                <button
                  type="button"
                  onClick={() => removeExistingImage(img.public_id)}
                  style={{
                    position: "absolute",
                    top: "-8px",
                    right: "-8px",
                    background: "#000",
                    color: "#fff",
                    border: "none",
                    borderRadius: "50%",
                    width: "20px",
                    height: "20px",
                    fontSize: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer"
                  }}
                >
                  ✕
                </button>
                <div style={{ position: "absolute", bottom: "4px", left: "4px", background: "rgba(0,0,0,0.5)", color: "#fff", fontSize: "8px", padding: "2px 4px", borderRadius: "4px" }}>
                    Saved
                </div>
              </div>
            ))}

            {/* New Previews */}
            {previews.map((url, index) => (
              <div key={index} style={{ position: "relative" }}>
                <img
                  src={url}
                  style={{ width: "80px", height: "80px", borderRadius: "10px", objectFit: "cover", border: "2px solid #ddd" }}
                />
                <button
                  type="button"
                  onClick={() => removePreview(index)}
                  style={{
                    position: "absolute",
                    top: "-8px",
                    right: "-8px",
                    background: "#ff4d4f",
                    color: "#fff",
                    border: "none",
                    borderRadius: "50%",
                    width: "20px",
                    height: "20px",
                    fontSize: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer"
                  }}
                >
                  ✕
                </button>
                <div style={{ position: "absolute", bottom: "4px", left: "4px", background: "rgba(255,255,255,0.8)", color: "#000", fontSize: "8px", padding: "2px 4px", borderRadius: "4px" }}>
                    New
                </div>
              </div>
            ))}
          </div>
        )}

        {uploading && (
          <div style={{ marginTop: "12px", display: "flex", alignItems: "center", gap: "8px", color: "#006837", fontWeight: "bold" }}>
            <div className="spinner" style={{ width: "16px", height: "16px" }}></div>
            <span>Uploading images to Cloudinary...</span>
          </div>
        )}

        <div style={{ marginTop: "24px", display: "flex", gap: "12px" }}>
          <button 
            type="submit" 
            disabled={uploading || submitting}
            style={{ 
              background: "#006837", 
              color: "#fff", 
              padding: "12px 22px", 
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              opacity: (uploading || submitting) ? 0.7 : 1,
              cursor: (uploading || submitting) ? "not-allowed" : "pointer"
            }}
          >
            {(submitting) ? (
              <>
                <div className="spinner" style={{ width: "16px", height: "16px", borderTopColor: "#fff" }}></div>
                Saving...
              </>
            ) : (
              editingId ? "Update Product" : "Add Product"
            )}
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
        ₹{p.price} — {p.weights?.map(w => w.label).join(", ") || p.weight}
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
