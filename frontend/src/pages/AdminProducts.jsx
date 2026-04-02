import { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import { BASE_URL } from "../config/api";
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Package, 
  Image as ImageIcon, 
  X, 
  Check, 
  AlertCircle,
  ChevronDown,
  ChevronRight,
  UploadCloud,
  Layers,
  IndianRupee,
  Database
} from "lucide-react";
const CATEGORIES = [
  "Honey & Natural Sweeteners",
  "Fresh Fruits",
  "Ghee & Dairy",
  "Spices & Masala",
  "Dry Fruits"
];

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const emptyForm = {
    name: "",
    bnName: "",
    category: "",
    price: "",
    weight: "",
    weights: [],
    newWeight: { label: "", price: "" },
    image: "", 
    images: [], 
    stock: "",
    description: "",
    ingredients: "",
    nutrition: ""
  };

  const [form, setForm] = useState(emptyForm);
  const [selectedFiles, setSelectedFiles] = useState([]); 
  const [previews, setPreviews] = useState([]); 

  const fetchProducts = () => {
    const token = localStorage.getItem("adminToken");
    fetch(`${BASE_URL}/api/products?page=${currentPage}&limit=10`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then((result) => {
        if (result && result.data) {
          setProducts(result.data);
          setTotalPages(result.totalPages || 1);
          setTotalItems(result.totalItems || 0);
        } else {
          setProducts(Array.isArray(result) ? result : []);
        }
      });
  };

  useEffect(() => {
    fetchProducts();
  }, [currentPage]);

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
    setForm(prev => ({
      ...prev,
      images: prev.images.filter(img => img.public_id !== public_id)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("handleSubmit triggered");
    if (uploading || submitting) {
      console.log("Blocked: uploading =", uploading, "submitting =", submitting);
      return;
    }

    if (selectedFiles.length === 0 && form.images.length === 0 && !form.image) {
      console.log("Blocked: Absolutely No images (array or string)");
      setMessage("Please upload at least one image");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    setSubmitting(true);
    try {
      console.log("Starting submission process...");
      let uploadedImages = [...form.images];

      if (selectedFiles.length > 0) {
        console.log("Uploading files:", selectedFiles.length);
        setUploading(true);
        const formData = new FormData();
        selectedFiles.forEach(file => formData.append("images", file));

        const token = localStorage.getItem("adminToken");
        const uploadRes = await fetch(`${BASE_URL}/api/upload`, { credentials: "include",
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: formData
        });
        const uploadData = await uploadRes.json();
        console.log("Upload response:", uploadData);

        if (!uploadRes.ok) {
          throw new Error(uploadData.error || uploadData.message || "Upload failed");
        }
        
        if (Array.isArray(uploadData)) {
          uploadedImages = [...uploadedImages, ...uploadData];
        } else {
          console.error("Unexpected upload response format:", uploadData);
          throw new Error("Upload failed: Invalid response format");
        }
        setUploading(false);
      }

      console.log("Constructing payload...");
      // Map singular image to images[0] if it doesn't already exist in the array
      // This helps with data migration
      if (uploadedImages.length === 0 && form.image) {
        console.log("Merging legacy image into array...");
        // If we only have the singular string, we can't easily get the public_id here 
        // without backfilling, so we'll just ensure the singular 'image' field stays set.
      }

      const payload = { 
        ...form, 
        images: uploadedImages,
        image: uploadedImages.length > 0 ? uploadedImages[0].url : form.image
      };
      
      delete payload.newWeight;
      delete payload._id;
      delete payload.__v;
      delete payload.createdAt;

      console.log("FINAL PAYLOAD:", payload);
      const url = editingId
        ? `${BASE_URL}/api/products/${editingId}`
        : `${BASE_URL}/api/products`;

      const method = editingId ? "PUT" : "POST";
      console.log("Sending request:", method, url);

      console.log("Submitting payload:", payload);
      console.log("Updating product:", editingId, "with body:", payload); // Added frontend log for update
      const token = localStorage.getItem("adminToken");
      const res = await fetch(url, { credentials: "include",
        method,
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
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
    const normalizedProduct = {
      ...product,
      name: product.name || "",
      bnName: product.bnName || "",
      category: product.category || "",
      price: product.price || "",
      stock: product.stock || 0,
      description: product.description || "",
      ingredients: product.ingredients || "",
      nutrition: product.nutrition || "",
      weights: product.weights || [],
      images: product.images || [],
      newWeight: { label: "", price: "" }
    };
    setForm(normalizedProduct);
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
    const token = localStorage.getItem("adminToken");
    await fetch(`${BASE_URL}/api/products/${id}`, { credentials: "include",
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
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

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">Stock Inventory</h1>
        <p className="text-gray-400 font-medium mt-1 uppercase tracking-widest text-[8px] sm:text-[10px] pl-1">Product catalog & dynamic warehouse control</p>
      </div>

      {/* PRODUCT FORM */}
      <form
        onSubmit={handleSubmit}
        className={`bg-white p-6 sm:p-10 rounded-[32px] sm:rounded-[40px] shadow-sm border ${editingId ? "border-[#66FF99] ring-4 ring-[#66FF99]/10" : "border-gray-100"} mb-12 relative transition-all duration-500`}
      >
        <div className="flex items-center gap-4 mb-8 sm:mb-10">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${editingId ? "bg-[#66FF99]/10 text-[#1F7A3B]" : "bg-gray-100 text-gray-400"}`}>
            {editingId ? <Edit2 className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">{editingId ? "Modify Product Spec" : "Register New Product"}</h3>
            <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mt-0.5">Define core properties and logistic parameters</p>
          </div>
        </div>

        {message && (
          <div className={`mb-8 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 ${message.includes("successfully") ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-700 border border-red-100"}`}>
            {message.includes("successfully") ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span className="text-sm font-black tracking-tight">{message}</span>
          </div>
        )}

        {/* FORM GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] ml-1">Universal Name</label>
            <input
              placeholder="e.g. Organic Sundarban Honey"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full px-5 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#1F7A3B] outline-none transition-all font-bold text-sm"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] ml-1">Regional Label (BN)</label>
            <input
              placeholder="উন্নত মানের মধু"
              value={form.bnName}
              onChange={e => setForm({ ...form, bnName: e.target.value })}
              className="w-full px-5 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#1F7A3B] outline-none transition-all font-bold text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] ml-1">Product Category</label>
            <div className="relative">
              <select
                value={form.category}
                onChange={e => {
                  console.log("Selected category:", e.target.value);
                  setForm({ ...form, category: e.target.value });
                }}
                className="w-full px-5 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#1F7A3B] outline-none transition-all font-black text-sm uppercase tracking-widest appearance-none cursor-pointer"
                required
              >
                <option value="">Select Category</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] ml-1">Base Valuation (₹)</label>
            <div className="relative">
              <IndianRupee className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="number"
                placeholder="499"
                value={form.price}
                onChange={e => setForm({ ...form, price: e.target.value })}
                className="w-full pl-12 pr-5 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#1F7A3B] outline-none transition-all font-black text-sm"
                required
              />
            </div>
          </div>

          <div className="space-y-2 lg:row-span-2">
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] ml-1">Logistic Variants (Weights)</label>
            <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-5 space-y-4">
               <div className="grid grid-cols-2 gap-3">
                  <input
                    placeholder="250g"
                    value={form.newWeight.label}
                    onChange={e => setForm({ ...form, newWeight: { ...form.newWeight, label: e.target.value } })}
                    className="px-4 py-3 bg-white border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#1F7A3B] font-bold text-xs"
                  />
                  <input
                    type="number"
                    placeholder="₹ Price"
                    value={form.newWeight.price}
                    onChange={e => setForm({ ...form, newWeight: { ...form.newWeight, price: e.target.value } })}
                    className="px-4 py-3 bg-white border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#1F7A3B] font-bold text-xs"
                  />
               </div>
               <button
                 type="button"
                 onClick={addWeight}
                 className="w-full py-3 bg-gray-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-colors"
               >
                 Assign Pack Variant
               </button>
               
               {form.weights.length > 0 && (
                 <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
                   {form.weights.map((w, i) => (
                     <div key={i} className="flex items-center gap-2 bg-white border border-gray-100 px-3 py-1.5 rounded-lg">
                        <span className="text-[10px] font-black text-gray-700">{w.label} - ₹{w.price}</span>
                        <X 
                          className="w-3 h-3 text-red-400 cursor-pointer hover:text-red-600 transition-colors"
                          onClick={() => removeWeight(w.label)}
                        />
                     </div>
                   ))}
                 </div>
               )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] ml-1">Stock Readiness</label>
            <div className="relative">
              <Database className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="number"
                placeholder="Units available"
                value={form.stock}
                onChange={e => setForm({ ...form, stock: e.target.value })}
                className="w-full pl-12 pr-5 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#1F7A3B] outline-none transition-all font-black text-sm"
                required
              />
            </div>
          </div>

          <div className="sm:col-span-2 space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] ml-1">Core Description</label>
            <textarea
              placeholder="Detailed product information..."
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full px-5 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#1F7A3B] outline-none transition-all font-medium text-sm leading-relaxed"
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-3 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] ml-1">Ingredients Profile</label>
              <textarea
                placeholder="List ingredients..."
                value={form.ingredients}
                onChange={e => setForm({ ...form, ingredients: e.target.value })}
                rows={2}
                className="w-full px-5 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#1F7A3B] outline-none transition-all font-medium text-xs leading-relaxed"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] ml-1">Nutritional Bio</label>
              <textarea
                placeholder="Caloric and nutrient data..."
                value={form.nutrition}
                onChange={e => setForm({ ...form, nutrition: e.target.value })}
                rows={2}
                className="w-full px-5 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#1F7A3B] outline-none transition-all font-medium text-xs leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* DRAG & DROP UPLOAD */}
        <div className="mt-8">
          <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] ml-1 mb-2 block">System Media Assets (Max 5)</label>
          <div
            onDragOver={e => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={e => {
              e.preventDefault();
              handleFileChange({ target: { files: e.dataTransfer.files } });
            }}
            className={`cursor-pointer transition-all duration-300 border-2 border-dashed flex flex-col items-center justify-center p-8 sm:p-12 rounded-[32px] ${dragActive ? "border-[#1F7A3B] bg-green-50/50" : "border-gray-200 hover:border-[#1F7A3B]/50 hover:bg-gray-50"}`}
          >
            <input
              type="file"
              multiple
              hidden
              id="fileUpload"
              accept="image/*"
              onChange={handleFileChange}
            />
            <label htmlFor="fileUpload" className="cursor-pointer text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-4 text-gray-400 group-hover:scale-110 transition-transform">
                <UploadCloud className="w-8 h-8" />
              </div>
              <p className="font-black text-gray-900 tracking-tight">Drop files or <span className="text-[#1F7A3B]">Synchronize Storage</span></p>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2 italic">Format: PNG, JPG, WEBP (Limit 5MB each)</p>
            </label>
          </div>
        </div>

        {/* IMAGE PREVIEWS */}
        {(previews.length > 0 || form.images.length > 0) && (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 mt-8">
            {form.images.map((img) => (
              <div key={img.public_id} className="relative group aspect-square">
                <img
                  src={img.url}
                  className="w-full h-full object-cover rounded-3xl border-4 border-gray-50 shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => removeExistingImage(img.public_id)}
                  className="absolute -top-3 -right-3 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-500 transition-colors active:scale-90"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/60 to-transparent rounded-b-3xl">
                   <p className="text-[8px] font-black text-white uppercase text-center tracking-widest">Server Image</p>
                </div>
              </div>
            ))}
            {previews.map((url, index) => (
              <div key={index} className="relative group aspect-square">
                <img
                  src={url}
                  className="w-full h-full object-cover rounded-3xl border-4 border-emerald-100 shadow-sm animate-pulse"
                />
                <button
                  type="button"
                  onClick={() => removePreview(index)}
                  className="absolute -top-3 -right-3 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors active:scale-90"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-emerald-600/80 to-transparent rounded-b-3xl border-t border-white/20">
                   <p className="text-[8px] font-black text-white uppercase text-center tracking-widest">New Staging</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PROGRESS INDICATOR */}
        {uploading && (
          <div className="mt-8 flex items-center gap-4 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
             <div className="w-8 h-8 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin" />
             <p className="text-xs font-black text-emerald-800 uppercase tracking-widest">Uploading segments to cloud storage...</p>
          </div>
        )}

        {/* ACTION BUTTONS */}
        <div className="mt-10 sm:mt-12 flex flex-col sm:flex-row gap-4">
          <button 
            type="submit" 
            disabled={uploading || submitting}
            className={`flex-1 flex items-center justify-center gap-3 px-8 py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all duration-500 shadow-xl ${
              editingId 
                ? "bg-[#0F1E11] text-[#66FF99] shadow-green-900/20" 
                : "bg-[#1F7A3B] text-white shadow-green-900/40"
            } hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {submitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing Transaction...
              </>
            ) : (
              <>
                {editingId ? <Check className="w-5 h-5" /> : <UploadCloud className="w-5 h-5" />}
                {editingId ? "Finalize Update" : "Synchronize to System"}
              </>
            )}
          </button>

          {editingId && (
            <button 
              type="button" 
              onClick={cancelEdit} 
              className="px-8 py-5 bg-gray-100 text-gray-500 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-200 transition-all active:scale-95"
            >
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      {/* PRODUCT LISTING */}
      <div className="space-y-6 mb-12">
        <div className="flex items-center justify-between px-4">
           <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
             <Layers className="w-6 h-6 text-[#1F7A3B]" />
             Registry Records
           </h3>
           <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Total Records: {totalItems}
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map(p => (
            <div
              key={p._id}
              className="bg-white group rounded-[32px] p-5 shadow-sm border border-gray-100 flex flex-col relative overflow-hidden transition-all hover:shadow-2xl hover:border-green-100"
            >
              <div className="relative aspect-square mb-5 overflow-hidden rounded-2xl bg-gray-50">
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute top-3 left-3 flex gap-2">
                   <div className="bg-white/90 backdrop-blur px-3 py-1.5 rounded-xl border border-white/20 shadow-sm text-[9px] font-black uppercase tracking-widest text-[#1F7A3B]">
                      {p.category}
                   </div>
                   {p.stock === 0 && (
                     <div className="bg-red-500 text-white px-3 py-1.5 rounded-xl shadow-lg shadow-red-500/30 text-[9px] font-black uppercase tracking-widest animate-pulse">
                        Unavailable
                     </div>
                   )}
                </div>
              </div>

              <div className="flex-1 space-y-2 mb-6">
                <div className="flex justify-between items-start gap-2">
                   <h4 className="font-black text-gray-900 leading-tight line-clamp-2">{p.name}</h4>
                   <p className="font-mono font-black text-gray-900 bg-gray-50 px-2 py-1 rounded-lg text-xs">₹{p.price}</p>
                </div>
                <p className="text-[10px] font-bold text-gray-400 line-clamp-1 truncate uppercase tracking-tighter">
                   {p.weights?.map(w => w.label).join(" / ") || p.weight || "Standard Pack"}
                </p>
                <div className="pt-2 flex items-center gap-2">
                   <Database className={`w-3.5 h-3.5 ${p.stock === 0 ? "text-red-500" : "text-green-600"}`} />
                   <span className={`text-[10px] font-black uppercase tracking-widest ${p.stock === 0 ? "text-red-500" : "text-gray-500"}`}>
                     Inventory: {p.stock} Units
                   </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-50">
                <button
                  onClick={() => startEdit(p)}
                  className="flex items-center justify-center gap-2 bg-gray-50 text-gray-700 hover:bg-[#66FF99]/20 hover:text-[#1F7A3B] transition-all py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest ring-1 ring-inset ring-gray-100 group-hover:ring-green-100"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Edit
                </button>
                <button
                  onClick={() => deleteProduct(p._id)}
                  className="flex items-center justify-center gap-2 bg-gray-50 text-gray-400 hover:bg-black hover:text-white transition-all py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest ring-1 ring-inset ring-gray-100 group-hover:ring-black"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Drop
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* PAGINATION UI */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 py-12 border-t border-gray-100 mt-6">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="w-12 h-12 rounded-2xl flex items-center justify-center border border-gray-100 bg-white text-gray-400 hover:text-green-700 hover:border-green-200 transition-all disabled:opacity-30 disabled:cursor-not-allowed group active:scale-95 shadow-sm"
            >
              <ChevronRight size={20} className="rotate-180 group-hover:-translate-x-1 transition-transform" />
            </button>
            
            <div className="flex items-center gap-1.5 px-4 bg-gray-50/50 py-2 rounded-3xl border border-gray-100">
              {[...Array(totalPages)].map((_, idx) => {
                const pageNum = idx + 1;
                // Simple pagination truncation
                if (totalPages > 5) {
                    if (pageNum !== 1 && pageNum !== totalPages && Math.abs(pageNum - currentPage) > 1) {
                        if (pageNum === 2 && currentPage > 3) return <span key={pageNum} className="text-gray-300 px-1">...</span>;
                        if (pageNum === totalPages - 1 && currentPage < totalPages - 2) return <span key={pageNum} className="text-gray-300 px-1">...</span>;
                        return null;
                    }
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${
                      currentPage === pageNum 
                        ? "bg-[#1F7A3B] text-white shadow-lg shadow-green-100" 
                        : "bg-white text-gray-400 border border-gray-100 hover:border-green-200 hover:text-green-700"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="w-12 h-12 rounded-2xl flex items-center justify-center border border-gray-100 bg-white text-gray-400 hover:text-green-700 hover:border-green-200 transition-all disabled:opacity-30 disabled:cursor-not-allowed group active:scale-95 shadow-sm"
            >
              <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
