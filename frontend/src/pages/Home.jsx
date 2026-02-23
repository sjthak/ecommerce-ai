import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: "calc(100vh - 64px)",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      textAlign: "center", padding: "48px 24px",
      background: "radial-gradient(ellipse at 50% 0%, #1e1a12 0%, #0a0a0a 60%)"
    }}>
      <p style={{
        fontSize: "11px", letterSpacing: "4px",
        color: "var(--accent)", marginBottom: "24px"
      }}>
        AI-POWERED SHOPPING
      </p>

      <h1 style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: "clamp(48px, 8vw, 80px)",
        color: "var(--text)", lineHeight: 1.1,
        marginBottom: "24px", fontWeight: 400
      }}>
        Discover Your<br />
        <span style={{ color: "var(--accent)" }}>Perfect Style</span>
      </h1>

      <p style={{
        fontSize: "16px", color: "var(--text-muted)",
        maxWidth: "440px", lineHeight: 1.7, marginBottom: "48px"
      }}>
        Let our AI assistant guide you to products curated just for you. Just ask — in any language.
      </p>

      <div style={{ display: "flex", gap: "16px" }}>
        <button onClick={() => navigate("/products")} style={{
          padding: "14px 36px",
          backgroundColor: "var(--accent)", color: "#0a0a0a",
          border: "none", borderRadius: "8px",
          fontSize: "12px", fontWeight: "500",
          letterSpacing: "2px", cursor: "pointer",
          transition: "opacity 0.2s"
        }}
          onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
          onMouseLeave={e => e.currentTarget.style.opacity = "1"}
        >
          BROWSE PRODUCTS
        </button>
      </div>

      {/* Decorative */}
      <div style={{
        marginTop: "80px", display: "flex",
        gap: "48px", color: "var(--text-muted)", fontSize: "12px", letterSpacing: "1px"
      }}>
        {["442 PRODUCTS", "AI SEARCH", "INSTANT CHAT"].map(t => (
          <span key={t} style={{ borderTop: "1px solid var(--border)", paddingTop: "12px" }}>{t}</span>
        ))}
      </div>
    </div>
  );
};

export default Home;