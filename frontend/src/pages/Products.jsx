import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { Search, Filter, X, ChevronRight, SlidersHorizontal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BASE_URL } from "../config/api";

import { CATEGORIES } from "../constants";

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlCategory = searchParams.get("category");

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [activeCategory, setActiveCategory] = useState(urlCategory || "All");
  const [search, setSearch] = useState("");
  const [priceRange, setPriceRange] = useState(3000); // Max price
  
  // NEW: Filter states
  const [rating, setRating] = useState("");
  const [stock, setStock] = useState("all"); // 'all', 'in', 'out'
  const [sortBy, setSortBy] = useState("new_arrivals");
  const [smartFilter, setSmartFilter] = useState("");
  
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (urlCategory) {
      setActiveCategory(urlCategory);
    } else {
      setActiveCategory("All");
    }
  }, [urlCategory]);

  const categories = [
    { label: "All Products", internal: "All" },
    ...CATEGORIES.map(cat => ({ label: cat.name, internal: cat.name }))
  ];

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeCategory !== "All") params.append("category", activeCategory);
      if (search) params.append("search", search);
      if (priceRange < 3000) params.append("maxPrice", priceRange);
      if (rating) params.append("rating", rating);
      if (stock !== "all") params.append("stock", stock);
      if (sortBy) params.append("sort", sortBy);
      if (smartFilter) params.append("smart", smartFilter);

      params.append("page", currentPage);
      params.append("limit", 9);

      const res = await fetch(`${BASE_URL}/api/products?${params.toString()}`);
      const result = await res.json();
      
      if (result && result.data) {
        setProducts(result.data);
        setTotalPages(result.totalPages || 1);
        setTotalItems(result.totalItems || 0);
      } else {
        setProducts(Array.isArray(result) ? result : []);
      }
    } catch (err) {
      console.error(err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, search, priceRange, rating, stock, sortBy, smartFilter]);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchProducts();
  }, [activeCategory, search, priceRange, rating, stock, sortBy, smartFilter, currentPage]);

  const filteredProducts = products; // Backend already filtered them


  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* HEADER SECTION */}
        <div className="mb-10 text-center sm:text-left">
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">Our Collection</h1>
          <p className="text-gray-500 mt-2 font-medium">Authentic, Natural, and Sustainably Sourced Products</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* SIDEBAR FILTERS (DESKTOP) & MOBILE TOGGLE */}
          <div className="lg:w-1/4">
              {/* Desktop Sidebar */}
              <div className="hidden lg:block bg-white rounded-3xl p-6 shadow-sm border border-gray-100 sticky top-28 max-h-[85vh] overflow-y-auto no-scrollbar">
                <div className="flex items-center gap-2 mb-6">
                  <SlidersHorizontal size={20} className="text-green-600" />
                  <h3 className="font-black text-lg text-gray-900">Filters</h3>
                </div>

                {/* Smart Filters */}
                <div className="mb-8">
                  <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Smart Discovery</h4>
                  <div className="space-y-2">
                    {[
                      { id: "trending", label: "🔥 Trending Now", color: "purple" },
                      { id: "best_value", label: "⭐ Best Value", color: "yellow" },
                      { id: "recommended", label: "✨ Recommended", color: "blue" },
                    ].map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setSmartFilter(smartFilter === f.id ? "" : f.id)}
                        className={`w-full text-left px-4 py-3 rounded-xl text-xs font-black transition-all border-2 ${
                          smartFilter === f.id
                            ? "bg-gray-900 border-gray-900 text-white shadow-lg"
                            : "bg-white border-gray-100 text-gray-600 hover:border-gray-200"
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Categories */}
                <div className="mb-8">
                  <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Categories</h4>
                  <div className="space-y-2">
                    {categories.map((cat) => (
                      <button
                        key={cat.internal}
                        onClick={() => setActiveCategory(cat.internal)}
                        className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-black transition-all ${
                          activeCategory === cat.internal
                            ? "bg-green-600 text-white shadow-lg shadow-green-100"
                            : "text-gray-600 hover:bg-green-50 hover:text-green-700"
                        }`}
                      >
                        {cat.label}
                        {activeCategory === cat.internal && <ChevronRight size={14} />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Ratings Filter */}
                <div className="mb-8">
                  <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Customer Ratings</h4>
                  <div className="space-y-2">
                    {[4, 3, 2].map((r) => (
                      <label key={r} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors group">
                        <input
                          type="checkbox"
                          checked={rating === r.toString()}
                          onChange={() => setRating(rating === r.toString() ? "" : r.toString())}
                          className="w-5 h-5 rounded-md border-gray-300 text-green-600 focus:ring-green-500"
                        />
                        <div className="flex items-center gap-1 group-hover:scale-105 transition-transform">
                          <span className="text-sm font-black text-gray-700">{r}★ & Above</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Stock Filter */}
                <div className="mb-8">
                  <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Availability</h4>
                  <select
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-black text-gray-700 focus:ring-2 focus:ring-green-500 outline-none"
                  >
                    <option value="all">Include Out of Stock</option>
                    <option value="in">In Stock Only</option>
                    <option value="out">Out of Stock Only</option>
                  </select>
                </div>

                {/* Price Range */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-xs font-black uppercase tracking-widest text-gray-400">Price Range</h4>
                    <span className="text-xs font-black text-green-700">₹0 - ₹{priceRange}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="3000"
                    step="50"
                    value={priceRange}
                    onChange={(e) => setPriceRange(Number(e.target.value))}
                    className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-green-600"
                  />
                </div>

                <button
                  onClick={() => {
                    setActiveCategory("All");
                    setPriceRange(3000);
                    setSearch("");
                    setRating("");
                    setStock("all");
                    setSortBy("new_arrivals");
                    setSmartFilter("");
                  }}
                  className="w-full py-4 bg-red-50 text-red-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-sm"
                >
                  Clear All Filters
                </button>
              </div>

              {/* Mobile Filter Toggle */}
              <div className="lg:hidden flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search products..."
                    className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-green-500 outline-none text-sm font-bold"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <button
                  onClick={() => setShowFilters(true)}
                  className="p-4 bg-green-600 text-white rounded-2xl shadow-lg shadow-green-200"
                >
                  <Filter size={24} />
                </button>
              </div>
            </div>

            {/* PRODUCT LISTING */}
            <div className="lg:w-3/4">
              {/* Controls Bar (Desktop) */}
              <div className="hidden lg:flex items-center gap-6 mb-8">
                <div className="relative flex-1">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                  <input
                    type="text"
                    placeholder="Search from our natural registry..."
                    className="w-full pl-16 pr-6 py-5 bg-white border border-gray-100 rounded-[32px] shadow-sm focus:ring-2 focus:ring-green-500 outline-none text-base font-medium transition-all"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sort By</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-6 py-5 bg-white border border-gray-100 rounded-[32px] shadow-sm focus:ring-2 focus:ring-green-500 outline-none font-bold text-sm min-w-[200px]"
                  >
                    <option value="new_arrivals">New Arrivals</option>
                    <option value="best_selling">Best Selling</option>
                    <option value="top_rated">Top Rated</option>
                    <option value="price_low_high">Price: Low to High</option>
                    <option value="price_high_low">Price: High to Low</option>
                  </select>
                </div>
              </div>

              {/* Active Filters Display */}
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <AnimatePresence>
                  {activeCategory !== "All" && (
                    <motion.span 
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="px-4 py-1.5 bg-green-50 text-green-700 text-[10px] font-black rounded-full border border-green-100 flex items-center gap-2 uppercase tracking-widest"
                    >
                      {activeCategory}
                      <X size={12} className="cursor-pointer hover:text-red-500" onClick={() => setActiveCategory("All")} />
                    </motion.span>
                  )}
                  {smartFilter && (
                    <motion.span 
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="px-4 py-1.5 bg-purple-50 text-purple-700 text-[10px] font-black rounded-full border border-purple-100 flex items-center gap-2 uppercase tracking-widest"
                    >
                      {smartFilter.replace("_", " ")}
                      <X size={12} className="cursor-pointer hover:text-red-500" onClick={() => setSmartFilter("")} />
                    </motion.span>
                  )}
                  {rating && (
                    <motion.span 
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="px-4 py-1.5 bg-yellow-50 text-yellow-700 text-[10px] font-black rounded-full border border-yellow-100 flex items-center gap-2 uppercase tracking-widest"
                    >
                      {rating}★ & Above
                      <X size={12} className="cursor-pointer hover:text-red-500" onClick={() => setRating("")} />
                    </motion.span>
                  )}
                  {stock !== "all" && (
                     <motion.span 
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="px-4 py-1.5 bg-blue-50 text-blue-700 text-[10px] font-black rounded-full border border-blue-100 flex items-center gap-2 uppercase tracking-widest"
                    >
                       {stock === "in" ? "In Stock" : "Out of Stock"}
                       <X size={12} className="cursor-pointer hover:text-red-500" onClick={() => setStock("all")} />
                     </motion.span>
                  )}
                </AnimatePresence>
                 <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-auto">
                    {totalItems} Results Found
                </span>
            </div>

            {/* Grid */}
            {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                        <div key={n} className="bg-gray-200 animate-pulse rounded-3xl h-80"></div>
                    ))}
                </div>
            ) : filteredProducts.length === 0 ? (
                <div className="bg-white rounded-[40px] p-20 text-center border border-dashed border-gray-200 items-center justify-center flex flex-col">
                    <Search size={48} className="text-gray-200 mb-4" />
                    <h3 className="text-xl font-black text-gray-900 mb-2">No Matching Products</h3>
                    <p className="text-gray-500 font-medium">Try adjusting your filters or search keywords.</p>
                </div>
            ) : (
                <div className="space-y-12">
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-6 md:gap-8">
                      {filteredProducts.map(p => (
                          <ProductCard key={p._id} product={p} />
                      ))}
                  </div>

                  {/* PAGINATION UI */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 pt-10 border-t border-gray-100">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1 || loading}
                        className="w-12 h-12 rounded-2xl flex items-center justify-center border border-gray-100 bg-white text-gray-400 hover:text-green-700 hover:border-green-200 transition-all disabled:opacity-30 disabled:cursor-not-allowed group active:scale-95"
                      >
                        <ChevronRight size={20} className="rotate-180 group-hover:-translate-x-1 transition-transform" />
                      </button>
                      
                      <div className="flex items-center gap-1.5">
                        {[...Array(totalPages)].map((_, idx) => {
                          const pageNum = idx + 1;
                          // Show limited pages if many
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
                              className={`w-12 h-12 rounded-2xl text-xs font-black transition-all ${
                                currentPage === pageNum 
                                  ? "bg-green-600 text-white shadow-lg shadow-green-100 scale-110" 
                                  : "bg-white text-gray-400 border border-gray-100 hover:border-green-200 hover:text-green-700 active:scale-95"
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>

                      <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages || loading}
                        className="w-12 h-12 rounded-2xl flex items-center justify-center border border-gray-100 bg-white text-gray-400 hover:text-green-700 hover:border-green-200 transition-all disabled:opacity-30 disabled:cursor-not-allowed group active:scale-95"
                      >
                        <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  )}
                </div>
            )}
          </div>
        </div>
      </div>

      {/* MOBILE FILTER OVERLAY */}
      <AnimatePresence>
        {showFilters && (
          <>
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200]"
                onClick={() => setShowFilters(false)}
            />
            <motion.div 
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed inset-x-0 bottom-0 bg-white rounded-t-[40px] z-[210] p-8 max-h-[85vh] overflow-y-auto"
            >
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-black text-gray-900 tracking-tight">Refine Results</h3>
                    <button onClick={() => setShowFilters(false)} className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400">
                        <X size={24} />
                    </button>
                </div>

                <div className="space-y-8">
                   {/* Smart Filters (Mobile) */}
                   <div>
                        <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Discovery</h4>
                        <div className="grid grid-cols-1 gap-2">
                           {[
                              { id: "trending", label: "🔥 Trending Now" },
                              { id: "best_value", label: "⭐ Best Value" },
                              { id: "recommended", label: "✨ Recommended" },
                           ].map(f => (
                                <button
                                    key={f.id}
                                    onClick={() => setSmartFilter(smartFilter === f.id ? "" : f.id)}
                                    className={`px-4 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2 text-left ${
                                        smartFilter === f.id 
                                        ? "bg-gray-900 border-gray-900 text-white" 
                                        : "bg-white border-gray-100 text-gray-400"
                                    }`}
                                >
                                    {f.label}
                                </button>
                           ))}
                        </div>
                   </div>

                   <div>
                        <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Select Category</h4>
                        <div className="grid grid-cols-2 gap-3">
                            {categories.map(cat => (
                                <button
                                    key={cat.internal}
                                    onClick={() => setActiveCategory(cat.internal)}
                                    className={`px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                                        activeCategory === cat.internal 
                                        ? "bg-green-600 border-green-600 text-white" 
                                        : "bg-white border-gray-100 text-gray-400"
                                    }`}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                   </div>

                   {/* Ratings (Mobile) */}
                   <div>
                        <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Ratings</h4>
                        <div className="flex gap-2">
                            {[4, 3, 2].map(r => (
                                <button
                                    key={r}
                                    onClick={() => setRating(rating === r.toString() ? "" : r.toString())}
                                    className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase transition-all border ${
                                        rating === r.toString()
                                        ? "bg-yellow-400 border-yellow-400 text-gray-900"
                                        : "bg-white border-gray-100 text-gray-400"
                                    }`}
                                >
                                    {r}★+
                                </button>
                            ))}
                        </div>
                   </div>

                   {/* Stock (Mobile) */}
                   <div>
                        <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Availability</h4>
                        <div className="grid grid-cols-3 gap-2">
                            {['all', 'in', 'out'].map(s => (
                                <button
                                    key={s}
                                    onClick={() => setStock(s)}
                                    className={`py-3 rounded-2xl text-[8px] font-black uppercase transition-all border ${
                                        stock === s
                                        ? "bg-blue-600 border-blue-600 text-white"
                                        : "bg-white border-gray-100 text-gray-400"
                                    }`}
                                >
                                    {s === 'all' ? 'All' : s === 'in' ? 'In Stock' : 'Out Stock'}
                                </button>
                            ))}
                        </div>
                   </div>

                   <div>
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="text-xs font-black uppercase tracking-widest text-gray-400">Price Threshold</h4>
                            <span className="text-sm font-black text-green-700">Under ₹{priceRange}</span>
                        </div>
                        <input 
                            type="range" 
                            min="0" 
                            max="3000" 
                            step="50"
                            value={priceRange}
                            onChange={(e) => setPriceRange(Number(e.target.value))}
                            className="w-full h-3 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-green-600"
                        />
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                        <button 
                            onClick={() => {
                                setActiveCategory("All");
                                setPriceRange(3000);
                                setRating("");
                                setStock("all");
                                setSmartFilter("");
                                setShowFilters(false);
                            }}
                            className="py-5 bg-gray-100 text-gray-500 rounded-2xl font-black uppercase tracking-widest text-[10px]"
                        >
                            Reset
                        </button>
                        <button 
                            onClick={() => setShowFilters(false)}
                            className="py-5 bg-[#0F1E11] text-[#66FF99] rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-green-900/20 text-[10px]"
                        >
                            Show {filteredProducts.length} Results
                        </button>
                   </div>
                </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
