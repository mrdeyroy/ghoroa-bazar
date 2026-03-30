import { useEffect, useRef, useState } from "react";
import { X, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ProductCard from "./ProductCard";
import { BASE_URL } from "../config/api";

const RECENT_KEY = "gb_recent_searches";

export default function SearchModal({ open, onClose }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recent, setRecent] = useState([]);

  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Load recent searches and focus on open
  useEffect(() => {
    if (!open) return;
    const stored = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
    setRecent(stored);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  // Server-side debounced search logic
  useEffect(() => {
    if (!open) return;
    
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`${BASE_URL}/api/products?search=${encodeURIComponent(query)}&limit=8`);
        const result = await res.json();
        setResults(result.data || (Array.isArray(result) ? result : []));
      } catch (err) {
        console.error("Search error:", err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400); // 400ms debounce

    return () => clearTimeout(timer);
  }, [query, open]);

  /* ESC close */
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const saveRecent = (value) => {
    const updated = [value, ...recent.filter(r => r !== value)].slice(0, 5);
    setRecent(updated);
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    saveRecent(query);
    navigate(`/search?q=${encodeURIComponent(query)}`);
    onClose();
  };

  if (!open) return null;

  return (
    <div
      className="search-overlay"
      onClick={onClose}
    >
      <div
        className="search-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* SEARCH BAR */}
        <div className="search-header">
          <Search size={20} />

          <form onSubmit={handleSubmit} style={{ flex: 1 }}>
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products..."
            />
          </form>

          <X size={22} style={{ cursor: "pointer" }} onClick={onClose} />
        </div>

        {/* RECENT */}
        {!query && recent.length > 0 && (
          <div className="recent">
            <div className="recent-title">Recent searches</div>
            <div className="recent-list">
              {recent.map(item => (
                <span
                  key={item}
                  onClick={() => setQuery(item)}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* RESULTS */}
        <div className="results">
          {loading ? (
            <div className="flex flex-col items-center py-10">
              <div className="w-8 h-8 border-2 border-green-100 border-t-green-600 rounded-full animate-spin mb-3"></div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Searching Warehouse...</p>
            </div>
          ) : results.length > 0 ? (
            <div className="product-grid">
              {results.map(p => (
                <div key={p._id} onClick={onClose}>
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          ) : query && (
            <div className="py-12 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search size={32} className="text-gray-200" />
              </div>
              <p className="text-sm font-bold text-gray-400">No matching products found</p>
            </div>
          )}
        </div>
      </div>

      {/* STYLES */}
      <style>
        {`
          .search-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.45);
            z-index: 3000;
            display: flex;
            justify-content: center;
            align-items: flex-start;
            padding-top: 90px;
          }

          .search-modal {
            background: #fff;
            width: 92%;
            max-width: 1000px;
            border-radius: 14px;
            padding: 20px;
            max-height: calc(100vh - 120px);
            overflow-y: auto;
          }

          .search-header {
            display: flex;
            align-items: center;
            gap: 12px;
            position: sticky;
            top: 0;
            background: #fff;
            z-index: 1;
            padding-bottom: 10px;
          }

          .search-header input {
            width: 100%;
            border: none;
            outline: none;
            font-size: 16px;
          }

          .recent {
            margin-top: 16px;
          }

          .recent-title {
            font-size: 13px;
            color: #666;
            margin-bottom: 8px;
          }

          .recent-list {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
          }

          .recent-list span {
            padding: 6px 12px;
            background: #f2f2f2;
            border-radius: 20px;
            font-size: 13px;
            cursor: pointer;
          }

          .results {
            margin-top: 20px;
          }

          .product-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
            gap: 15px;
          }

          .empty {
            color: #777;
          }

          /* 🔥 MOBILE FULL-SCREEN */
          @media (max-width: 768px) {
            .search-overlay {
              padding-top: 0;
            }

            .search-modal {
              width: 100%;
              height: 100%;
              max-width: none;
              max-height: none;
              border-radius: 0;
              padding: 16px;
            }

            .product-grid {
              grid-template-columns: repeat(2, 1fr);
              gap: 12px;
            }
          }
        `}
      </style>
    </div>
  );
}
