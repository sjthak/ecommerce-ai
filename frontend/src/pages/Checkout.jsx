import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL;

const inputStyle = {
  width: "100%", padding: "12px 16px",
  backgroundColor: "var(--surface2)",
  border: "1px solid var(--border)",
  borderRadius: "8px", color: "var(--text)",
  fontSize: "13px", outline: "none",
  fontFamily: "'DM Sans', sans-serif",
  transition: "border-color 0.2s"
};

const labelStyle = {
  fontSize: "10px", letterSpacing: "2px",
  color: "var(--text-muted)", marginBottom: "8px", display: "block"
};

const Checkout = () => {
  const { cart, total, setIsOpen } = useCart();
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: user?.name || "",
    email: "",
    phone: "",
    address: "",
    city: "",
    zip: "",
    country: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSubmit = async () => {
    if (!user) return navigate("/login");
    if (!form.name || !form.email || !form.address || !form.city || !form.country)
      return setError("Please fill in all required fields");

    setLoading(true); setError("");
    try {
      const res = await axios.post(`${API_URL}/api/orders`, {
        items: cart.map(i => ({
          product_id: i.product_id,
          title: i.title,
          image_url: i.image_url,
          price: i.price,
          qty: i.qty
        })),
        shipping: form,
        total
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      navigate("/order-success", { state: { order: res.data.order } });

    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (!cart.length) return (
    <div style={{ padding: "80px", textAlign: "center", color: "var(--text-muted)" }}>
      <p style={{ fontSize: "32px", marginBottom: "16px" }}>◈</p>
      <p style={{ letterSpacing: "2px", fontSize: "13px" }}>YOUR CART IS EMPTY</p>
    </div>
  );

  return (
    <div style={{ backgroundColor: "var(--bg)", minHeight: "calc(100vh - 64px)", padding: "48px" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>

        {/* Header */}
        <p style={{ fontSize: "11px", letterSpacing: "4px", color: "var(--accent)", marginBottom: "8px" }}>
          ALMOST THERE
        </p>
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: "36px", fontWeight: 400,
          color: "var(--text)", marginBottom: "40px"
        }}>
          Checkout
        </h1>

        <div style={{ display: "flex", gap: "48px", alignItems: "flex-start" }}>

          {/* Left — Shipping Form */}
          <div style={{ flex: 1 }}>
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "20px", fontWeight: 400,
              marginBottom: "24px", color: "var(--text)"
            }}>
              Shipping Information
            </h2>

            {error && (
              <div style={{
                padding: "12px 16px", borderRadius: "8px",
                backgroundColor: "#fff0f0", border: "1px solid #ffcccc",
                color: "#cc0000", fontSize: "13px", marginBottom: "20px"
              }}>
                {error}
              </div>
            )}

            {/* Form Fields */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {[
                { label: "FULL NAME *", key: "name", placeholder: "John Doe" },
                { label: "EMAIL *", key: "email", placeholder: "your@email.com" },
                { label: "PHONE", key: "phone", placeholder: "+66 81 234 5678" },
                { label: "ADDRESS *", key: "address", placeholder: "123 Main Street" },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label style={labelStyle}>{label}</label>
                  <input
                    value={form[key]}
                    onChange={e => handleChange(key, e.target.value)}
                    placeholder={placeholder}
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = "var(--accent)"}
                    onBlur={e => e.target.style.borderColor = "var(--border)"}
                  />
                </div>
              ))}

              {/* City + ZIP */}
              <div style={{ display: "flex", gap: "12px" }}>
                {[
                  { label: "CITY *", key: "city", placeholder: "Bangkok" },
                  { label: "ZIP CODE", key: "zip", placeholder: "10110" }
                ].map(({ label, key, placeholder }) => (
                  <div key={key} style={{ flex: 1 }}>
                    <label style={labelStyle}>{label}</label>
                    <input
                      value={form[key]}
                      onChange={e => handleChange(key, e.target.value)}
                      placeholder={placeholder}
                      style={inputStyle}
                      onFocus={e => e.target.style.borderColor = "var(--accent)"}
                      onBlur={e => e.target.style.borderColor = "var(--border)"}
                    />
                  </div>
                ))}
              </div>

              <div>
                <label style={labelStyle}>COUNTRY *</label>
                <input
                  value={form.country}
                  onChange={e => handleChange("country", e.target.value)}
                  placeholder="Thailand"
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = "var(--accent)"}
                  onBlur={e => e.target.style.borderColor = "var(--border)"}
                />
              </div>
            </div>
          </div>

          {/* Right — Order Summary */}
          <div style={{
            width: "360px", flexShrink: 0,
            backgroundColor: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "16px", padding: "32px",
            position: "sticky", top: "80px"
          }}>
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "20px", fontWeight: 400,
              marginBottom: "24px", color: "var(--text)"
            }}>
              Order Summary
            </h2>

            {/* Items */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "24px" }}>
              {cart.map((item, i) => (
                <div key={i} style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  <img src={item.image_url} alt={item.title} style={{
                    width: "52px", height: "52px",
                    objectFit: "cover", borderRadius: "8px",
                    backgroundColor: "var(--surface2)"
                  }}
                    onError={e => e.target.src = "https://via.placeholder.com/52/f5f5f5/888"}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontSize: "12px", color: "var(--text)",
                      overflow: "hidden", textOverflow: "ellipsis",
                      whiteSpace: "nowrap", marginBottom: "4px"
                    }}>
                      {item.title}
                    </p>
                    <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                      Qty: {item.qty}
                    </p>
                  </div>
                  <p style={{ fontSize: "13px", color: "var(--accent)", fontWeight: 500, flexShrink: 0 }}>
                    ${(item.price * item.qty).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            {/* Divider */}
            <div style={{ height: "1px", backgroundColor: "var(--border)", marginBottom: "20px" }} />

            {/* Totals */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "28px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Subtotal</span>
                <span style={{ fontSize: "12px", color: "var(--text)" }}>${total.toFixed(2)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Shipping</span>
                <span style={{ fontSize: "12px", color: "var(--accent)" }}>FREE</span>
              </div>
              <div style={{ height: "1px", backgroundColor: "var(--border)" }} />
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--text)" }}>Total</span>
                <span style={{ fontSize: "18px", color: "var(--accent)", fontWeight: 500 }}>
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Submit */}
            <button onClick={handleSubmit} disabled={loading} style={{
              width: "100%", padding: "16px",
              backgroundColor: "var(--accent)", color: "#fff",
              border: "none", borderRadius: "8px",
              fontSize: "11px", fontWeight: "500",
              letterSpacing: "2px", cursor: "pointer",
              opacity: loading ? 0.6 : 1
            }}>
              {loading ? "PLACING ORDER..." : "PLACE ORDER"}
            </button>

            <p style={{ textAlign: "center", marginTop: "12px", fontSize: "11px", color: "var(--text-muted)" }}>
              🔒 Secure checkout
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;