import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  User,
  MapPin,
  ShoppingBag,
  LogOut,
  Edit,
  Save,
  Plus,
  Trash2,
  ChevronRight,
  Phone,
  Mail,
  CheckCircle2,
  Package,
  Clock,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const { user, token, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [userData, setUserData] = useState(user);
  const [recentOrders, setRecentOrders] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(!user);
  const [toast, setToast] = useState({ show: false, message: "" });

  const [editFormData, setEditFormData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    avatar: user?.avatar || ""
  });

  const [addressForm, setAddressForm] = useState({
    show: false,
    editId: null,
    data: {
      firstName: "",
      lastName: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
      isDefault: false
    }
  });

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    fetchUserData();
    fetchRecentOrders();
  }, [token]);

  const fetchUserData = async () => {
    try {
      const res = await fetch(import.meta.env.VITE_API_URL + "/api/users/me", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch user data");
      const data = await res.json();
      setUserData(data);
      setEditFormData({
        name: data.name || "",
        phone: data.phone || "",
        avatar: data.avatar || ""
      });
      setLoading(false);
    } catch (err) {
      console.error("Fetch User Data Error:", err);
      // Fallback to AuthContext user if fetch fails
      if (user) {
        setUserData(user);
        setEditFormData({
          name: user.name || "",
          phone: user.phone || "",
          avatar: user.avatar || ""
        });
      }
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("images", file);

    try {
      showToast("Uploading Image...");
      const res = await fetch(import.meta.env.VITE_API_URL + "/api/upload", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (res.ok && data[0]?.url) {
        setEditFormData({ ...editFormData, avatar: data[0].url });
        // Auto save after upload if not in edit mode, or just update form
        if (!isEditing) {
          const updateRes = await fetch(import.meta.env.VITE_API_URL + "/api/users/profile", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ ...editFormData, avatar: data[0].url })
          });
          if (updateRes.ok) {
            await fetchUserData();
            updateUser({ ...editFormData, avatar: data[0].url });
            showToast("Profile Image Updated ✅");
          }
        } else {
          showToast("Image Uploaded. Save changes to apply.");
        }
      }
    } catch (err) {
      console.error("Upload error:", err);
      showToast("Upload Failed ❌");
    }
  };

  const fetchRecentOrders = async () => {
    try {
      const res = await fetch(import.meta.env.VITE_API_URL + "/api/orders/my", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) return;
      const data = await res.json();
      setRecentOrders(Array.isArray(data) ? data.slice(0, 3) : []);
    } catch (err) {
      console.error("Fetch Orders Error:", err);
    }
  };

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: "" }), 3000);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(import.meta.env.VITE_API_URL + "/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(editFormData)
      });
      if (res.ok) {
        await fetchUserData();
        setIsEditing(false);
        updateUser(editFormData);
        showToast("Profile Updated Successfully ✅");
      } else {
        const errData = await res.json();
        showToast(errData.error || "Update Failed ❌");
      }
    } catch (err) {
      console.error(err);
      showToast("Update Failed ❌");
    }
  };

  const handleAddressAction = async (e) => {
    e.preventDefault();
    const url = addressForm.editId
      ? `${import.meta.env.VITE_API_URL}/api/users/address/${addressForm.editId}`
      : import.meta.env.VITE_API_URL + "/api/users/address";
    const method = addressForm.editId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(addressForm.data)
      });
      if (res.ok) {
        await fetchUserData();
        setAddressForm({ ...addressForm, show: false, editId: null });
        showToast(`Address ${addressForm.editId ? "Updated" : "Added"} Successfully ✅`);
      } else {
        const errData = await res.json();
        showToast(errData.error || "Address Action Failed ❌");
      }
    } catch (err) {
      console.error(err);
      showToast("Address Action Failed ❌");
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm("Delete this address?")) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/address/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        await fetchUserData();
        showToast("Address Deleted Successfully 🗑️");
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-20">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-100 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Loading Profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-20 px-4 md:px-[8%]">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 bg-white border border-green-100 shadow-2xl px-8 py-4 rounded-2xl z-[210] flex items-center gap-3"
          >
            <CheckCircle2 className="text-green-600" size={20} />
            <span className="font-bold text-gray-800 text-sm">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">

        {/* SIDEBAR */}
        <div className="lg:w-1/4">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 sticky top-44">
            <div className="flex flex-col items-center mb-8 pt-4">
              <div className="w-24 h-24 rounded-full bg-green-50 border-4 border-white shadow-lg overflow-hidden mb-4 relative group cursor-pointer">
                <img
                  src={editFormData.avatar || userData?.avatar || `https://ui-avatars.com/api/?name=${userData?.name || 'Guest'}&background=1f7a3b&color=fff`}
                  alt={userData?.name}
                  className="w-full h-full object-cover group-hover:opacity-50 transition-opacity"
                />
                <label className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Edit className="text-white" size={24} />
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                </label>
              </div>
              <h3 className="font-black text-xl text-gray-900 leading-tight text-center">{userData?.name || "Member"}</h3>
              <p className="text-gray-400 text-[10px] font-bold mt-1 uppercase tracking-widest">{userData?.email}</p>
            </div>

            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab("profile")}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-black transition-all ${activeTab === 'profile' ? 'bg-green-600 text-white shadow-xl shadow-green-100' : 'text-gray-500 hover:bg-green-50 hover:text-green-700'}`}
              >
                <User size={18} />
                Profile Info
              </button>
              <button
                onClick={() => setActiveTab("address")}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-black transition-all ${activeTab === 'address' ? 'bg-green-600 text-white shadow-xl shadow-green-100' : 'text-gray-500 hover:bg-green-50 hover:text-green-700'}`}
              >
                <MapPin size={18} />
                Address Book
              </button>
              <button
                onClick={() => setActiveTab("orders")}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-black transition-all ${activeTab === 'orders' ? 'bg-green-600 text-white shadow-xl shadow-green-100' : 'text-gray-500 hover:bg-green-50 hover:text-green-700'}`}
              >
                <ShoppingBag size={18} />
                Recent Orders
              </button>
              <hr className="my-4 border-gray-50" />
              <button
                onClick={logout}
                className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-black text-red-400 hover:bg-red-50 hover:text-red-600 transition-all"
              >
                <LogOut size={18} />
                Logout
              </button>
            </nav>
          </div>
        </div>

        {/* CONTENT */}
        <div className="lg:w-3/4">
          <AnimatePresence mode="wait">
            {activeTab === "profile" && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white rounded-[40px] p-8 md:p-12 shadow-sm border border-gray-100 items-start flex flex-col w-full"
              >
                <div className="flex justify-between items-center w-full mb-10">
                  <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">Profile Information</h2>
                    <p className="text-gray-400 font-medium mt-1">Manage your account details and settings.</p>
                  </div>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#1f7a3b] transition-all active:scale-95"
                    >
                      <Edit size={16} />
                      Edit Profile
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <form onSubmit={handleUpdateProfile} className="w-full max-w-2xl space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-gray-400 ml-4">Full Name</label>
                        <input
                          type="text"
                          value={editFormData.name}
                          onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                          className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-green-500 font-bold text-gray-700"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-gray-400 ml-4">Phone Number</label>
                        <input
                          type="text"
                          value={editFormData.phone}
                          onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                          className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-green-500 font-bold text-gray-700"
                          placeholder="Add mobile number"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase text-gray-400 ml-4">Email Address (Read-only)</label>
                      <input
                        type="email"
                        value={userData?.email}
                        disabled
                        className="w-full px-6 py-4 bg-gray-100 rounded-2xl border-none font-bold text-gray-400 cursor-not-allowed"
                      />
                    </div>
                    <div className="flex gap-4 pt-4">
                      <button
                        type="submit"
                        className="flex items-center gap-2 px-10 py-4 bg-green-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-green-700 shadow-xl shadow-green-100 transition-all active:scale-95"
                      >
                        <Save size={18} />
                        Save Changes
                      </button>
                      <button
                        type="button"
                        onClick={() => { setIsEditing(false); setEditFormData({ name: userData.name, phone: userData.phone, avatar: userData.avatar }); }}
                        className="px-8 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-200 transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                    <div className="p-6 bg-gray-50 rounded-3xl flex items-center gap-5 border border-white">
                      <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-green-600 shadow-sm">
                        <User size={24} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase text-gray-400 tracking-tighter mb-0.5">Full Name</p>
                        <p className="font-black text-gray-800">{userData?.name || "Not set"}</p>
                      </div>
                    </div>
                    <div className="p-6 bg-gray-50 rounded-3xl flex items-center gap-5 border border-white">
                      <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-blue-500 shadow-sm">
                        <Mail size={24} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase text-gray-400 tracking-tighter mb-0.5">Email Address</p>
                        <p className="font-black text-gray-800">{userData?.email || "Not set"}</p>
                      </div>
                    </div>
                    <div className="p-6 bg-gray-50 rounded-3xl flex items-center gap-5 border border-white">
                      <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-orange-500 shadow-sm">
                        <Phone size={24} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase text-gray-400 tracking-tighter mb-0.5">Phone Number</p>
                        <p className="font-black text-gray-800">{userData?.phone || "Not set"}</p>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "address" && (
              <motion.div
                key="address"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="items-start flex flex-col"
              >
                <div className="bg-white rounded-[40px] p-8 md:p-12 shadow-sm border border-gray-100 w-full mb-8">
                  <div className="flex justify-between items-center w-full mb-10">
                    <div>
                      <h2 className="text-3xl font-black text-gray-900 tracking-tight">Address Book</h2>
                      <p className="text-gray-400 font-medium mt-1">Manage your shipping and billing addresses.</p>
                    </div>
                    <button
                      onClick={() => setAddressForm({ show: true, editId: null, data: { firstName: "", lastName: "", phone: "", address: "", city: "", state: "", pincode: "", isDefault: false } })}
                      className="flex items-center gap-2 px-6 py-3 bg-[#1f7a3b] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#185e2e] transition-all active:scale-95 shadow-lg shadow-green-100"
                    >
                      <Plus size={16} />
                      Add New Address
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {(!userData?.addresses || userData?.addresses.length === 0) ? (
                      <div className="col-span-full py-20 text-center border-2 border-dashed border-gray-100 rounded-[40px] flex flex-col items-center">
                        <MapPin size={40} className="text-gray-200 mb-4" />
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">No addresses saved yet</p>
                      </div>
                    ) : (
                      userData?.addresses.map((addr) => (
                        <div key={addr._id} className="p-8 bg-gray-50 rounded-[32px] border-2 border-transparent hover:border-green-100 transition-all group relative">
                          {addr.isDefault && (
                            <span className="absolute top-6 right-8 bg-green-600 text-white text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full">Default</span>
                          )}
                          <p className="font-black text-gray-900 text-lg mb-2">{addr.firstName} {addr.lastName}</p>
                          <div className="space-y-1 mb-6">
                            <p className="text-gray-500 text-sm font-medium leading-relaxed">{addr.address}</p>
                            <p className="text-gray-500 text-sm font-medium">{addr.city}, {addr.state} - {addr.pincode}</p>
                            <p className="text-gray-500 text-sm font-black mt-2 flex items-center gap-2">
                              <Phone size={14} className="text-green-600" />
                              {addr.phone}
                            </p>
                          </div>
                          <div className="flex gap-3">
                            <button
                              onClick={() => setAddressForm({ show: true, editId: addr._id, data: { ...addr } })}
                              className="px-4 py-2 bg-white text-gray-600 rounded-xl text-xs font-black shadow-sm border border-gray-100 hover:bg-green-50 hover:text-green-700 transition-all"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteAddress(addr._id)}
                              className="p-2 bg-white text-red-400 rounded-xl shadow-sm border border-gray-100 hover:bg-red-50 hover:text-red-500 transition-all"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "orders" && (
              <motion.div
                key="orders"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white rounded-[40px] p-8 md:p-12 shadow-sm border border-gray-100 items-start flex flex-col"
              >
                <div className="flex justify-between items-center w-full mb-10">
                  <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">Recent Orders</h2>
                    <p className="text-gray-400 font-medium mt-1">Preview of your last 3 orders.</p>
                  </div>
                  <button
                    onClick={() => navigate("/my-orders")}
                    className="flex items-center gap-2 text-[#1f7a3b] font-black text-xs uppercase tracking-widest hover:underline underline-offset-4"
                  >
                    View All Orders
                    <ChevronRight size={16} />
                  </button>
                </div>

                <div className="w-full space-y-4">
                  {recentOrders.length === 0 ? (
                    <div className="py-20 text-center flex flex-col items-center">
                      <ShoppingBag size={40} className="text-gray-200 mb-4" />
                      <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">No orders placed yet</p>
                    </div>
                  ) : (
                    recentOrders.map((order) => (
                      <div key={order._id} className="p-6 bg-gray-50 rounded-3xl flex flex-wrap items-center justify-between gap-6 hover:bg-green-50/30 transition-all border border-transparent hover:border-green-50">
                        <div className="flex items-center gap-5">
                          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-green-600 shadow-sm border border-green-50">
                            <Package size={24} />
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase text-gray-400 tracking-tighter mb-0.5">Order ID: GB-{order._id.slice(-6).toUpperCase()}</p>
                            <p className="font-black text-gray-800">₹{order.totalAmount}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-8">
                          <div className="hidden sm:block">
                            <p className="text-[10px] font-black uppercase text-gray-400 tracking-tighter mb-0.5">Status</p>
                            <span className={`text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest ${order.orderStatus === 'Delivered' ? 'bg-green-100 text-green-600' :
                              order.orderStatus === 'Processing' ? 'bg-orange-100 text-orange-600' :
                                'bg-blue-100 text-blue-600'
                              }`}>
                              {order.orderStatus}
                            </span>
                          </div>
                          <button
                            onClick={() => navigate(`/my-orders`)}
                            className="w-10 h-10 bg-white shadow-sm border border-gray-100 rounded-xl flex items-center justify-center text-gray-400 hover:text-green-600 hover:border-green-100 transition-all"
                          >
                            <ArrowRight size={18} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Address Modal */}
      <AnimatePresence>
        {addressForm.show && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setAddressForm({ ...addressForm, show: false })}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-[40px] shadow-2xl relative w-full max-w-2xl overflow-hidden"
            >
              <div className="p-8 md:p-10">
                <div className="flex justify-between items-center mb-10">
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight">
                    {addressForm.editId ? "Update Address" : "Add New Address"}
                  </h3>
                  <button
                    onClick={() => setAddressForm({ ...addressForm, show: false })}
                    className="w-10 h-10 bg-gray-50 text-gray-400 rounded-xl flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all"
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleAddressAction} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      placeholder="First Name"
                      value={addressForm.data.firstName}
                      onChange={(e) => setAddressForm({ ...addressForm, data: { ...addressForm.data, firstName: e.target.value } })}
                      className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-green-500 font-bold"
                      required
                    />
                    <input
                      placeholder="Last Name"
                      value={addressForm.data.lastName}
                      onChange={(e) => setAddressForm({ ...addressForm, data: { ...addressForm.data, lastName: e.target.value } })}
                      className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-green-500 font-bold"
                      required
                    />
                  </div>
                  <input
                    placeholder="Phone Number"
                    value={addressForm.data.phone}
                    onChange={(e) => setAddressForm({ ...addressForm, data: { ...addressForm.data, phone: e.target.value } })}
                    className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-green-500 font-bold"
                    required
                  />
                  <input
                    placeholder="Street Address"
                    value={addressForm.data.address}
                    onChange={(e) => setAddressForm({ ...addressForm, data: { ...addressForm.data, address: e.target.value } })}
                    className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-green-500 font-bold"
                    required
                  />
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <input
                      placeholder="City"
                      value={addressForm.data.city}
                      onChange={(e) => setAddressForm({ ...addressForm, data: { ...addressForm.data, city: e.target.value } })}
                      className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-green-500 font-bold text-sm"
                      required
                    />
                    <input
                      placeholder="State"
                      value={addressForm.data.state}
                      onChange={(e) => setAddressForm({ ...addressForm, data: { ...addressForm.data, state: e.target.value } })}
                      className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-green-500 font-bold text-sm"
                      required
                    />
                    <input
                      placeholder="Pincode"
                      value={addressForm.data.pincode}
                      onChange={(e) => setAddressForm({ ...addressForm, data: { ...addressForm.data, pincode: e.target.value } })}
                      className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-green-500 font-bold text-sm"
                      required
                    />
                  </div>
                  <div className="flex items-center gap-3 ml-2">
                    <input
                      type="checkbox"
                      checked={addressForm.data.isDefault}
                      onChange={(e) => setAddressForm({ ...addressForm, data: { ...addressForm.data, isDefault: e.target.checked } })}
                      id="isDefault"
                      className="w-5 h-5 accent-green-600"
                    />
                    <label htmlFor="isDefault" className="text-sm font-bold text-gray-500 cursor-pointer">Set as default address</label>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-5 bg-[#0F1E11] text-[#66FF99] rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-green-900/20 active:scale-95 transition-all mt-4"
                  >
                    {addressForm.editId ? "Update Address" : "Save Address"}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ArrowRight({ size, className }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M5 12h14m-7-7 7 7-7 7" />
    </svg>
  )
}
