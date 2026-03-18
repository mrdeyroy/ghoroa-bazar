import React from "react";
import { useNavigate } from "react-router-dom";
import { CATEGORIES } from "../constants";

export default function CategorySection() {
  const navigate = useNavigate();

  return (
    <section className="py-16 px-4 md:px-[8%] bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
            Shop by <span className="text-[#1f7a3b]">Category</span>
          </h2>
          <p className="text-gray-500 font-medium mt-2">
            Explore our curated selection of natural and fresh products.
          </p>
        </div>

        {/* Categories Container */}
        <div className="flex flex-nowrap overflow-x-auto pb-6 no-scrollbar gap-6 sm:justify-center md:grid md:grid-cols-5 md:gap-8 justify-items-center">
          {CATEGORIES.map((cat) => (
            <div
              key={cat.slug}
              onClick={() => navigate(`/products?category=${cat.name}`)}
              className="flex-shrink-0 w-24 md:w-32 cursor-pointer group"
            >
              <div className="aspect-square rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center mb-3 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-green-100 overflow-hidden">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.2]"
                />
              </div>
              <h3 className="text-center text-sm font-black text-gray-800 uppercase tracking-wider group-hover:text-[#1f7a3b] transition-colors leading-tight">
                {cat.name}
              </h3>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}
