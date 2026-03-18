import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { Search, Filter, X, ChevronRight, SlidersHorizontal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { CATEGORIES } from "../constants";

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlCategory = searchParams.get("category");

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(urlCategory || "All");
  const [search, setSearch] = useState("");
  const [priceRange, setPriceRange] = useState(2000); // Max price
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

  useEffect(() => {
    window.scrollTo(0, 0);
    fetch("http://localhost:5000/api/products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesPrice = p.price <= priceRange;
    
    let matchesCategory = false;
    if (activeCategory === "All") {
      matchesCategory = true;
    } else {
      matchesCategory = p.category === activeCategory;
    }

    return matchesCategory && matchesSearch && matchesPrice;
  });

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
             <div className="hidden lg:block bg-white rounded-3xl p-6 shadow-sm border border-gray-100 sticky top-28">
                <div className="flex items-center gap-2 mb-6">
                    <SlidersHorizontal size={20} className="text-green-600" />
                    <h3 className="font-black text-lg text-gray-900">Filters</h3>
                </div>

                {/* Categories */}
                <div className="mb-8">
                    <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Categories</h4>
                    <div className="space-y-2">
                        {categories.map(cat => (
                            <button
                                key={cat.internal}
                                onClick={() => setActiveCategory(cat.internal)}
                                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
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

                {/* Price Range */}
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="text-xs font-black uppercase tracking-widest text-gray-400">Price Range</h4>
                        <span className="text-sm font-black text-green-700">Under ₹{priceRange}</span>
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
                    <div className="flex justify-between mt-2 text-[10px] font-bold text-gray-400">
                        <span>₹0</span>
                        <span>₹3000+</span>
                    </div>
                </div>

                <button 
                  onClick={() => { setActiveCategory("All"); setPriceRange(3000); setSearch(""); }}
                  className="w-full py-3 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-red-500 transition-colors"
                >
                  Reset All Filters
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
            
            {/* Search (Desktop) */}
            <div className="hidden lg:block relative mb-8">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                <input 
                    type="text" 
                    placeholder="Search from our natural registry..."
                    className="w-full pl-16 pr-6 py-5 bg-white border border-gray-100 rounded-3xl shadow-sm focus:ring-2 focus:ring-green-500 outline-none text-base font-medium transition-all"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Active Filters Display */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
                {activeCategory !== "All" && (
                    <span className="px-4 py-1.5 bg-green-50 text-green-700 text-xs font-black rounded-full border border-green-100 flex items-center gap-2">
                        {activeCategory}
                        <X size={12} className="cursor-pointer" onClick={() => setActiveCategory("All")} />
                    </span>
                )}
                {search && (
                    <span className="px-4 py-1.5 bg-blue-50 text-blue-700 text-xs font-black rounded-full border border-blue-100 flex items-center gap-2">
                        "{search}"
                        <X size={12} className="cursor-pointer" onClick={() => setSearch("")} />
                    </span>
                )}
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-auto">
                    {filteredProducts.length} Results Found
                </span>
            </div>

            {/* Grid */}
            {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(n => (
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
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-6 md:gap-8">
                    {filteredProducts.map(p => (
                        <ProductCard key={p._id} product={p} />
                    ))}
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

                   <button 
                    onClick={() => setShowFilters(false)}
                    className="w-full py-5 bg-[#0F1E11] text-[#66FF99] rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-green-900/20"
                   >
                     Show {filteredProducts.length} Results
                   </button>
                </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
