import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";

import Hero from "../components/Hero";
import CategorySection from "../components/CategorySection";
import FeaturedProducts from "../components/FeaturedProducts";

const linkStyle = {
  display: "block",
  color: "#333",
  textDecoration: "none",
  marginBottom: "6px",
  cursor: "pointer"
};

export default function Home() {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("default");

    useEffect(() => {
  const slider = document.getElementById("testimonial-slider");
// ... (rest of the testimonial slider logic)
    const bar = document.getElementById("scroll-bar");
  if (!slider || !bar) return;

  const updateBar = () => {
    const maxScroll = slider.scrollWidth - slider.clientWidth;
    const progress = slider.scrollLeft / maxScroll;
    const barTravel = slider.clientWidth - bar.clientWidth;
    bar.style.transform = `translateX(${progress * barTravel}px)`;
  };

  slider.addEventListener("scroll", updateBar);
  updateBar();

  // Auto-slide
  const auto = setInterval(() => {
    if (window.pauseSlider) return;
    slider.scrollBy({ left: 2, behavior: "smooth" });

    if (slider.scrollLeft + slider.clientWidth >= slider.scrollWidth)
      slider.scrollTo({ left: 0, behavior: "smooth" });
  }, 30);

  return () => {
    clearInterval(auto);
    slider.removeEventListener("scroll", updateBar);
  };
}, []);

const location = useLocation();

useEffect(() => {
  if (location.hash) {
    const el = document.querySelector(location.hash);
    el?.scrollIntoView({ behavior: "smooth" });
  }
}, [location]);


return (
  <>
    <Hero />
    <CategorySection />
    <FeaturedProducts />

      {/* ================================
    🟢 CORE VALUES — RESPONSIVE
================================= */}




      {/* ================================
    🟢 CORE VALUES — RESPONSIVE
================================= */}
<section
  style={{
    background: "#fffbe9",
    padding: "70px 8%",
    marginTop: "20px"
  }}
>
  <h2
    style={{
      textAlign: "center",
      color: "#1f7a3b",
      fontSize: "28px",
      fontWeight: "700"
    }}
  >
    Our Core Values
  </h2>

  <p
    style={{
      textAlign: "center",
      maxWidth: "720px",
      margin: "8px auto 45px",
      color: "#555"
    }}
  >
    These principles guide everything we do, from sourcing ingredients
    to serving our customers.
  </p>

  {/* value cards container */}
  <div className="core-values-grid">
    {/* CARD 1 */}
    <div className="core-card">
      <div style={{ fontSize: "24px" }}>♻️</div>
      <h3>Sustainability</h3>
      <p>
        We source ingredients responsibly and use eco-friendly packaging
        to minimize our environmental footprint.
      </p>
    </div>

    {/* CARD 2 */}
    <div className="core-card">
      <div style={{ fontSize: "24px" }}>🌾</div>
      <h3>Quality</h3>
      <p>
        We never compromise on quality, using only premium ingredients to
        create exceptional products.
      </p>
    </div>

    {/* CARD 3 */}
    <div className="core-card">
      <div style={{ fontSize: "24px" }}>❤️</div>
      <h3>Health</h3>
      <p>
        We believe healthy snacking should be delicious, creating nutritious
        options without artificial additives.
      </p>
    </div>

    {/* CARD 4 */}
    <div className="core-card">
      <div style={{ fontSize: "24px" }}>🤝</div>
      <h3>Community</h3>
      <p>
        We support local farmers and give back to communities through
        various charitable initiatives.
      </p>
    </div>
  </div>

  {/* RESPONSIVE STYLES */}
  <style>
    {`
      .core-values-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 18px;
      }

      .core-card {
        background: #ffffff;
        border-radius: 16px;
        padding: 24px;
        text-align: center;
        box-shadow: 0 10px 18px rgba(0,0,0,0.05);
      }

      .core-card h3 {
        color: #1f7a3b;
        margin: 8px 0 6px;
      }

      .core-card p {
        font-size: 14px;
        color: #666;
        line-height: 1.5;
      }

      /* Tablet */
      @media (max-width: 1023px) {
        .core-values-grid {
          grid-template-columns: repeat(2, 1fr);
        }
      }

      /* Mobile */
      @media (max-width: 767px) {
        .core-values-grid {
          grid-template-columns: 1fr;
        }

        section {
          padding: 50px 6%;
        }
      }
    `}
  </style>
</section>



  {/* ================================
    🟢 BRAND STORY — EXACT DESIGN
================================= */}
<section id="about-section"
  style={{
    padding: "70px 8%",
    background: "#ffffff",
    textAlign: "center"
  }}
>
  <h2
    style={{
      fontSize: "28px",
      fontWeight: "700",
      color: "#1f7a3b"
    }}
  >
    The Ghoroa Bazar Story
  </h2>

  <p
    style={{
      color: "#666",
      marginTop: "6px",
      fontStyle: "italic"
    }}
  >
    A journey of trust, health, and tradition…
  </p>

  {/* Mission Block */}
  <div
    style={{
      maxWidth: "900px",
      margin: "28px auto 40px",
      color: "#444",
      lineHeight: "1.6"
    }}
  >
    <h3 style={{ marginBottom: "6px", fontWeight: "700", color: "#1f7a3b" }}>Our Mission</h3>

    <p>
      At <strong>Ghoroa Bazar</strong>, our mission is to bring safe, healthy, and organic food
      straight from farms to your doorstep.
      From premium mustard oil to fresh nuts and pure honey, we aim to deliver
      <strong> hygienic, affordable, and authentic</strong> products
      that celebrate the essence of nature.
    </p>
  </div>


{/* ================================
   🟢 CERTIFICATIONS
================================= */}
<h3
  className="text-lg md:text-xl font-bold text-[#1f7a3b] mb-6"
>
  Certifications
</h3>

<div className="flex flex-wrap justify-center gap-4 md:gap-8 mb-12 md:mb-16">
  {[
    "/assets/fpo.avif",
    "/assets/gmo.png",
    "/assets/iec.png",
    "/assets/lactosefree.png",
    "/assets/apeda.png",
    "/assets/iso.png",
    "/assets/madeinindia.png",
    "/assets/msme.png",
    "/assets/farmers.png",
  ].map((img, i) => (
    <div
      key={i}
      className="w-16 h-16 md:w-20 md:h-20 bg-white flex items-center justify-center transition-transform hover:scale-110"
    >
      <img
        src={img}
        alt="Certification"
        className="w-full h-full object-contain p-1"
      />
    </div>
  ))}
</div>


  {/* ================================
      🟢 KEY FEATURES
  ================================= */}
  <h3
    className="text-xl md:text-2xl font-bold text-[#1f7a3b] mb-6 md:mb-8"
  >
    Our Key Features
  </h3>

  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 md:gap-8 max-w-6xl mx-auto px-4">
    {[
      { icon: "/assets/flag.avif", title: "100% Made in India" },
      { icon: "/assets/premium.png", title: "Premium Quality" },
      { icon: "/assets/iso.png", title: "ISO Certified Company" },
      { icon: "/assets/delivery.png", title: "Fast Track Delivery" },
      { icon: "/assets/secure.png", title: "100% Secure Payment" },
      { icon: "/assets/satisfaction.png", title: "Satisfaction Guarantee" }
    ].map((f, i) => (
      <div key={i} className="flex flex-col items-center group">
        <div className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center p-4 transition-transform group-hover:scale-110 mb-3">
          <img src={f.icon} alt={f.title} className="w-full h-full object-contain" />
        </div>
        <p className="font-semibold text-gray-700 text-sm md:text-base leading-tight">{f.title}</p>
      </div>
    ))}
  </div>
</section>


{/* ================================
    🟢 STORE LOCATIONS + STATS
================================= */}
<section className="py-12 md:py-20 px-4 md:px-[8%] bg-white text-center">
  <h2 className="text-xl md:text-3xl font-bold text-[#1f7a3b] mb-4">
    Our Store Locations
  </h2>

  {/* Announcement Bar */}
  <div className="bg-[#fff8c9] px-6 py-3 rounded-2xl inline-block mb-6 text-gray-700 text-xs md:text-sm font-medium border border-[#ffe082]">
    We are coming soon physically, but currently we are digitally present everywhere!
  </div>

  {/* CTA Button */}
  <div className="mb-12">
    <button className="bg-[#1f7a3b] text-white px-8 py-3 rounded-full hover:bg-[#185e2e] transition-colors font-bold shadow-lg shadow-green-100">
      View Our Stores
    </button>
  </div>

  {/* Stats Row */}
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto mb-10 md:mb-16">
    {[
      { icon: "/assets/vector.svg", num: "8+", label: "Year of Experience" },
      { icon: "/assets/city.svg", num: "45+", label: "City" },
      { icon: "/assets/happy.svg", num: "120+", label: "Happy Families" },
      { icon: "/assets/export.svg", num: "8+", label: "Export Country" }
    ].map((s, i) => (
      <div key={i} className="flex flex-col items-center">
        <div className="w-12 h-12 md:w-16 md:h-16 bg-green-50 rounded-2xl flex items-center justify-center mb-4">
          <img src={s.icon} alt={s.label} className="w-6 h-6 md:w-8 md:h-8" />
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-[#1f7a3b] mb-1">{s.num}</h2>
        <p className="text-gray-500 text-xs md:text-sm font-medium">{s.label}</p>
      </div>
    ))}
  </div>

  {/* Divider */}
  <hr className="max-w-5xl mx-auto mb-12 md:mb-16 border-gray-100" />


  {/* ================================
      🟢 NEWS SECTION
  ================================= */}
  <h2 className="text-xl md:text-3xl font-bold text-[#1f7a3b] mb-8 md:mb-12">
    Ghorer Bazar News
  </h2>

  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto px-4">
    {[1, 2, 3].map(i => (
      <div key={i} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all group">
        <div className="relative overflow-hidden h-48 md:h-56">
          <img
            src="/assets/grandopening.webp"
            alt="News"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold text-[#1f7a3b] uppercase tracking-wider">
            Latest News
          </div>
        </div>

        <div className="p-6 text-left">
          <p className="text-gray-400 text-xs mb-2 font-medium">April 25, 2024</p>
          <h4 className="text-lg font-bold text-gray-800 mb-3 group-hover:text-[#1f7a3b] transition-colors">
            {i === 1 && "Big Sale Coming Soon"}
            {i === 2 && "We Opened a New Store"}
            {i === 3 && "Special Festive Offers"}
          </h4>

          <p className="text-sm text-gray-500 leading-relaxed mb-6 line-clamp-2">
            Experience the essence of nature with our upcoming offers and expansions. We are bringing healthy lifestyles closer to you...
          </p>

          <Link to="/news" className="text-[#1f7a3b] font-bold text-sm inline-flex items-center gap-1 hover:gap-2 transition-all">
            Read More <span>→</span>
          </Link>
        </div>
      </div>
    ))}
  </div>
</section>



{/* ================================
    🟢 TESTIMONIAL CARDS (STATIC + SLIDER)
================================= */}
<section style={{ padding: "60px 8%", background: "#ffffff" }}>
  {(() => {
    const testimonials = [
      { name: "Emily Clark", date: "Aug 15, 2024", text: "Nice products but delivery was a bit slow." },
      { name: "Rahul Sen", date: "Jul 28, 2024", text: "Quality is excellent. Ghee tastes very pure." },
      { name: "Ananya Das", date: "Jun 12, 2024", text: "Loved the honey. Packaging was neat and safe." },
      { name: "Rahul Kumar Das", date: "Jun 12, 2024", text: "Loved the honey. Packaging was neat and safe." },
      { name: "Sourav Roy", date: "May 19, 2024", text: "Prices are fair and products feel authentic." },
      { name: "Raj Kumar Das", date: "May 19, 2024", text: "Prices are fair and products feel authentic." },
      { name: "Sayan Das", date: "May 19, 2024", text: "Prices are fair and products feel authentic." },
      { name: "Neha Sharma", date: "Apr 02, 2024", text: "Customer support was helpful and responsive." }
    ];

    const [index, setIndex] = useState(0);
    const visibleCount = 3;
    const maxIndex = Math.ceil(testimonials.length / visibleCount) - 1;

    /* ---------------- AUTO SLIDE ---------------- */
    useEffect(() => {
      const timer = setInterval(() => {
        setIndex(prev => (prev >= maxIndex ? 0 : prev + 1));
      }, 5000);
      return () => clearInterval(timer);
    }, [maxIndex]);

    /* ---------------- SWIPE SUPPORT ---------------- */
    let startX = 0;

    const handleTouchStart = e => {
      startX = e.touches[0].clientX;
    };

    const handleTouchEnd = e => {
      const endX = e.changedTouches[0].clientX;
      const diff = startX - endX;

      if (diff > 50 && index < maxIndex) setIndex(index + 1);
      if (diff < -50 && index > 0) setIndex(index - 1);
    };

    const currentItems = testimonials.slice(
      index * visibleCount,
      index * visibleCount + visibleCount
    );

    return (
      <>
        {/* NAVIGATION */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 18
          }}
        >
          <button
            onClick={() => setIndex(prev => Math.max(prev - 1, 0))}
            disabled={index === 0}
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              border: "1px solid #1f7a3b",
              background: "#fff",
              color: "#1f7a3b",
              cursor: "pointer",
              opacity: index === 0 ? 0.4 : 1
            }}
          >
            ‹
          </button>

          <button
            onClick={() => setIndex(prev => Math.min(prev + 1, maxIndex))}
            disabled={index === maxIndex}
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              border: "1px solid #1f7a3b",
              background: "#fff",
              color: "#1f7a3b",
              cursor: "pointer",
              opacity: index === maxIndex ? 0.4 : 1
            }}
          >
            ›
          </button>
        </div>

        {/* CARDS */}
        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 18,
            marginBottom: 18
          }}
        >
          {currentItems.map((t, i) => (
            <div
              key={i}
              style={{
                background: "#fff",
                borderRadius: 14,
                boxShadow: "0 8px 16px rgba(0,0,0,.06)",
                padding: 16
              }}
            >
              {/* HEADER */}
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <div style={{ display: "flex", gap: 10 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background: "#e6e6e6",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    👤
                  </div>

                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: "#777" }}>{t.date}</div>
                  </div>
                </div>

                <img src="/assets/google.png" style={{ height: 24 }} />
              </div>

              {/* STARS */}
              <div style={{ marginBottom: 6 }}>
                {Array.from({ length: 5 }).map((_, s) => (
                  <span
                    key={s}
                    style={{ color: s < 4 ? "#f4b400" : "#ccc", fontSize: 14 }}
                  >
                    ★
                  </span>
                ))}
              </div>

              {/* TEXT */}
              <p style={{ fontSize: 13, color: "#555", lineHeight: 1.4 }}>
                {t.text}
              </p>
            </div>
          ))}
        </div>

        {/* DOTS */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <span
              key={i}
              onClick={() => setIndex(i)}
              style={{
                width: 8,
                height: 8,
                display: "inline-block",
                borderRadius: "50%",
                margin: "0 3px",
                background: i === index ? "#1f7a3b" : "#ccc",
                cursor: "pointer"
              }}
            />
          ))}
        </div>
      </>
    );
  })()}




  {/* ================================
      🟢 PARTNER LOGOS
  ================================= */}
  <h3 style={{ color: "#1f7a3b", textAlign: "center", marginBottom: 24 }}>
    Also Available Soon at
  </h3>

  <div
    style={{
      display: "flex",
      justifyContent: "center",
      gap: "30px",
      flexWrap: "wrap",
      marginBottom: 50
    }}
  >
   {[
    "/assets/amazon.avif",
    "/assets/big_basket.avif",
    "/assets/flipkart.avif",
    "/assets/jio-mart.avif",
    "/assets/blinkit-logo.avif",
    "/assets/tata-mg.avif",
  ].map((path, i) => (
    <img
      key={i}
      src={path}
      alt="Partner logo"
      style={{ height: 32 }}
    />
  ))}
</div>
</section>







    </>
  );
}
