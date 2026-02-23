import { Link, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const location = useLocation();
  const { count, setIsOpen } = useCart();
  const { user, logout } = useAuth();

  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 1000,
      backgroundColor: "rgba(0, 0, 0, 0.85)",
      backdropFilter: "blur(20px)",
      borderBottom: "1px solid var(--border)",
      padding: "0 48px",
      display: "flex", alignItems: "center",
      justifyContent: "space-between",
      height: "64px",
    }}>
      <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}>
        <span style={{ fontSize: "20px" }}>◈</span>
        <span style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: "18px", color: "var(--text)", letterSpacing: "2px"
        }}>
          SHOPAI
        </span>
      </Link>

      <div style={{ display: "flex", alignItems: "center", gap: "28px" }}>
        {[{ label: "Home", path: "/" }, { label: "Products", path: "/products" }].map(({ label, path }) => (
          <Link key={path} to={path} style={{
            textDecoration: "none", fontSize: "13px", letterSpacing: "1.5px",
            color: location.pathname === path ? "var(--accent)" : "var(--text-muted)",
            transition: "color 0.2s"
          }}>
            {label.toUpperCase()}
          </Link>
        ))}

        {/* Auth */}
        {user ? (
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <span style={{ fontSize: "12px", color: "var(--text-muted)", letterSpacing: "1px" }}>
              {user.name.toUpperCase()}
            </span>
            <button onClick={logout} style={{
              background: "none", border: "1px solid var(--border)",
              borderRadius: "6px", padding: "6px 14px",
              fontSize: "11px", letterSpacing: "1px",
              color: "var(--text-muted)", cursor: "pointer"
            }}>
              LOGOUT
            </button>
          </div>
        ) : (
          <Link to="/login" style={{
            textDecoration: "none", fontSize: "11px",
            letterSpacing: "2px", color: "var(--text-muted)"
          }}>
            SIGN IN
          </Link>
        )}

        {/* Cart */}
        <button onClick={() => setIsOpen(true)} style={{
          position: "relative", background: "none",
          border: "none", cursor: "pointer",
          fontSize: "18px", color: "var(--text)", padding: "4px"
        }}>
          🛍
          {count > 0 && (
            <span style={{
              position: "absolute", top: "-4px", right: "-8px",
              backgroundColor: "var(--accent)", color: "#fff",
              borderRadius: "50%", width: "18px", height: "18px",
              fontSize: "10px", display: "flex",
              alignItems: "center", justifyContent: "center", fontWeight: 600
            }}>
              {count}
            </span>
          )}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;