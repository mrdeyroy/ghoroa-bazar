export default function CategoryFilter({ categories, active, onChange }) {
  return (
    <div style={{
      display: "flex",
      gap: "10px",
      marginBottom: "20px",
      flexWrap: "wrap"
    }}>
      {categories.map(cat => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          style={{
            padding: "8px 14px",
            borderRadius: "20px",
            border: active === cat ? "none" : "1px solid #ccc",
            background: active === cat ? "#006837" : "#fefffd",
            color: active === cat ? "#fefffd" : "#000000",
            cursor: "pointer",
            fontWeight: "500"
          }}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
