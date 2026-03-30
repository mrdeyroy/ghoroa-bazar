import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Package } from "lucide-react";
import ProductCard from "./ProductCard";
import { BASE_URL } from "../config/api";

export default function FeaturedProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(BASE_URL + "/api/products?featured=true&limit=4")
      .then((res) => res.json())
      .then((result) => {
        setProducts(result.data || (Array.isArray(result) ? result : []));
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <section className="py-20 px-4 md:px-[8%] bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight mb-4">
            Featured <span className="text-[#1f7a3b]">Products</span>
          </h2>
          <p className="text-gray-500 font-medium max-w-2xl mx-auto">
            Our handpicked selection of top-quality natural products, loved by our customers.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-200 animate-pulse rounded-2xl h-80"></div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-10 h-10 text-gray-300" />
            </div>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">
              No featured products yet
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {products.slice(0, 4).map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}

        <div className="mt-16 text-center">
          <Link
            to="/products"
            className="inline-flex items-center gap-3 px-10 py-5 bg-[#1f7a3b] text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-green-100 hover:bg-[#185e2e] transition-all group"
          >
            Explore All Products
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
