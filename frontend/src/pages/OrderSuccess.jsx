import { useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useEffect } from "react";

const OrderSuccess = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { setIsOpen, cart } = useCart();

  // Clear cart หลัง order สำเร็จ
  useEffect(() => {
    if (!state?.order) navigate("/");
  }, []);

  const order = state?.order;

  return (
    <div style={{
      minHeight: "calc(100vh - 64px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      backgroundColor: "var(--bg)",
      background: "radial-gradient(ellipse at 50% 0%, #f0e8d8 0%, var(--bg) 60%)"
    }}>
      <div style={{
        textAlign: "center", maxWidth: "480px",
        padding: "48px", backgroundColor: "var(--surface)",
        border: "1px solid var(--border)", borderRadius: "16px",
        boxShadow: "0 8px 40px rgba(0,0,0,0.08)"
      }}>
        {/* Icon */}
        <div style={{
          width: "72px", height: "72px", borderRadius: "50%",
          backgroundColor: "var(--surface2)",
          border: "2px solid var(--accent)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 24px", fontSize: "28px"
        }}>
          ✓
        </div>

        <p style={{ fontSize: "11px", letterSpacing: "4px", color: "var(--accent)", marginBottom: "8px" }}>
          ORDER CONFIRMED
        </p>
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: "28px", fontWeight: 400,
          color: "var(--text)", marginBottom: "16px"
        }}>
          Thank You!
        </h1>
        <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.7, marginBottom: "32px" }}>
          Your order has been placed successfully.<br />
          We'll send a confirmation to your email shortly.
        </p>

        {/* Order Info */}
        {order && (
          <div style={{
            backgroundColor: "var(--surface2)",
            border: "1px solid var(--border)",
            borderRadius: "10px", padding: "20px",
            marginBottom: "32px", textAlign: "left"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
              <span style={{ fontSize: "11px", letterSpacing: "1px", color: "var(--text-muted)" }}>ORDER ID</span>
              <span style={{ fontSize: "11px", color: "var(--text)", fontFamily: "monospace" }}>
                {order._id?.slice(-8).toUpperCase()}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
              <span style={{ fontSize: "11px", letterSpacing: "1px", color: "var(--text-muted)" }}>ITEMS</span>
              <span style={{ fontSize: "11px", color: "var(--text)" }}>{order.items?.length} items</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: "11px", letterSpacing: "1px", color: "var(--text-muted)" }}>TOTAL</span>
              <span style={{ fontSize: "14px", color: "var(--accent)", fontWeight: 500 }}>
                ${order.total?.toFixed(2)}
              </span>
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: "12px" }}>
          <button onClick={() => navigate("/products")} style={{
            flex: 1, padding: "14px",
            backgroundColor: "var(--accent)", color: "#fff",
            border: "none", borderRadius: "8px",
            fontSize: "11px", letterSpacing: "2px", cursor: "pointer"
          }}>
            CONTINUE SHOPPING
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;