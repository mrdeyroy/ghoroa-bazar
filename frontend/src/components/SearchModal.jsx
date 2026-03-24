import { useEffect, useRef, useState } from "react";
import { X, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ProductCard from "./ProductCard";

const RECENT_KEY = "gb_recent_searches";

export default function SearchModal({ open, onClose }) {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recent, setRecent] = useState([]);

  const inputRef = useRef(null);
  const navigate = useNavigate();

  /* fetch products (same as Home) */
  useEffect(() => {
    if (!open) return;

    setLoading(true);
    fetch(import.meta.env.VITE_API_URL + "/api/products")
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));

    const stored = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
    setRecent(stored);

    setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  /* filter logic */
  useEffect(() => {
    if (!query.trim()) {
      setFiltered([]);
      return;
    }

    const q = query.toLowerCase();
    setFiltered(
      products.filter(p =>
        p.name.toLowerCase().includes(q)
      )
    );
  }, [query, products]);

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
          {loading && <p>Loading products...</p>}

          {!loading && filtered.length > 0 && (
            <div className="product-grid">
              {filtered.map(p => (
                <div key={p._id} onClick={onClose}>
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          )}

          {!loading && query && filtered.length === 0 && (
            <p className="empty">No products found</p>
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
