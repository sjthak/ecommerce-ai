import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

const Cart = () => {
  const { cart, removeFromCart, updateQty, total, isOpen, setIsOpen } = useCart();
  const navigate = useNavigate();
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div onClick={() => setIsOpen(false)} style={{
          position: "fixed", inset: 0,
          backgroundColor: "rgba(0,0,0,0.4)",
          zIndex: 1100, backdropFilter: "blur(4px)"
        }} />
      )}

      {/* Drawer */}
      <div style={{
        position: "fixed", top: 0, right: 0,
        width: "400px", height: "100vh",
        backgroundColor: "var(--surface)",
        borderLeft: "1px solid var(--border)",
        zIndex: 1200, display: "flex", flexDirection: "column",
        transform: isOpen ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.3s ease",
        boxShadow: "-8px 0 32px rgba(0,0,0,0.15)"
      }}>

        {/* Header */}
        <div style={{
          padding: "24px", borderBottom: "1px solid var(--border)",
          display: "flex", justifyContent: "space-between", alignItems: "center"
        }}>
          <div>
            <p style={{ fontSize: "11px", letterSpacing: "3px", color: "var(--accent)", marginBottom: "4px" }}>
              YOUR
            </p>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", fontWeight: 400 }}>
              Cart
            </h2>
          </div>
          <button onClick={() => setIsOpen(false)} style={{
            background: "none", border: "none",
            fontSize: "20px", cursor: "pointer", color: "var(--text-muted)"
          }}>✕</button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: "center", padding: "64px 24px", color: "var(--text-muted)" }}>
              <p style={{ fontSize: "32px", marginBottom: "16px" }}>◈</p>
              <p style={{ fontSize: "13px", letterSpacing: "1px" }}>Your cart is empty</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {cart.map(item => (
                <div key={item.product_id} style={{
                  display: "flex", gap: "14px",
                  padding: "14px", borderRadius: "10px",
                  backgroundColor: "var(--surface2)",
                  border: "1px solid var(--border)"
                }}>
                  {/* Image */}
                  <img src={item.image_url} alt={item.title} style={{
                    width: "70px", height: "70px",
                    objectFit: "cover", borderRadius: "8px",
                    backgroundColor: "#f5f5f5"
                  }}
                    onError={e => e.target.src = "https://via.placeholder.com/70/f5f5f5/888"}
                  />

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontSize: "12px", color: "var(--text)",
                      lineHeight: 1.4, marginBottom: "8px",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
                    }}>
                      {item.title}
                    </p>
                    <p style={{ fontSize: "14px", color: "var(--accent)", fontWeight: 500, marginBottom: "10px" }}>
                      ${(item.price * item.qty).toFixed(2)}
                    </p>

                    {/* Qty Controls */}
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <button onClick={() => updateQty(item.product_id, item.qty - 1)} style={{
                        width: "26px", height: "26px", borderRadius: "50%",
                        border: "1px solid var(--border)", background: "none",
                        cursor: "pointer", color: "var(--text)", fontSize: "14px"
                      }}>−</button>
                      <span style={{ fontSize: "13px", minWidth: "16px", textAlign: "center" }}>
                        {item.qty}
                      </span>
                      <button onClick={() => updateQty(item.product_id, item.qty + 1)} style={{
                        width: "26px", height: "26px", borderRadius: "50%",
                        border: "1px solid var(--border)", background: "none",
                        cursor: "pointer", color: "var(--text)", fontSize: "14px"
                      }}>+</button>

                      <button onClick={() => removeFromCart(item.product_id)} style={{
                        marginLeft: "auto", background: "none", border: "none",
                        color: "var(--text-muted)", cursor: "pointer", fontSize: "12px"
                      }}>
                        REMOVE
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div style={{ padding: "24px", borderTop: "1px solid var(--border)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
              <span style={{ fontSize: "12px", letterSpacing: "1px", color: "var(--text-muted)" }}>TOTAL</span>
              <span style={{ fontSize: "20px", color: "var(--accent)", fontWeight: 500 }}>
                ${total.toFixed(2)}
              </span>
            </div>
            <button onClick={() => { setIsOpen(false); navigate("/checkout"); }} style={{
                width: "100%", padding: "16px",
                backgroundColor: "var(--accent)", color: "#fff",
                border: "none", borderRadius: "8px",
                fontSize: "12px", letterSpacing: "2px", cursor: "pointer"
            }}>
                CHECKOUT
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default Cart;