import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.email || !form.password) return setError("Please fill in all fields");
    setLoading(true); setError("");
    try {
      await login(form.email, form.password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "calc(100vh - 64px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      backgroundColor: "var(--bg)",
      background: "radial-gradient(ellipse at 50% 0%, #f0e8d8 0%, var(--bg) 60%)"
    }}>
      <div style={{
        width: "100%", maxWidth: "400px",
        backgroundColor: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "16px", padding: "48px 40px",
        boxShadow: "0 8px 40px rgba(0,0,0,0.08)"
      }}>
        {/* Header */}
        <p style={{ fontSize: "11px", letterSpacing: "3px", color: "var(--accent)", marginBottom: "8px" }}>
          WELCOME BACK
        </p>
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: "28px", fontWeight: 400,
          color: "var(--text)", marginBottom: "36px"
        }}>
          Sign In
        </h1>

        {/* Error */}
        {error && (
          <div style={{
            padding: "12px 16px", borderRadius: "8px",
            backgroundColor: "#fff0f0", border: "1px solid #ffcccc",
            color: "#cc0000", fontSize: "13px", marginBottom: "20px"
          }}>
            {error}
          </div>
        )}

        {/* Fields */}
        {[
          { label: "EMAIL", key: "email", type: "email", placeholder: "your@email.com" },
          { label: "PASSWORD", key: "password", type: "password", placeholder: "••••••••" }
        ].map(({ label, key, type, placeholder }) => (
          <div key={key} style={{ marginBottom: "20px" }}>
            <p style={{ fontSize: "10px", letterSpacing: "2px", color: "var(--text-muted)", marginBottom: "8px" }}>
              {label}
            </p>
            <input
              type={type}
              value={form[key]}
              onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
              placeholder={placeholder}
              style={{
                width: "100%", padding: "12px 16px",
                backgroundColor: "var(--surface2)",
                border: "1px solid var(--border)",
                borderRadius: "8px", color: "var(--text)",
                fontSize: "13px", outline: "none",
                fontFamily: "'DM Sans', sans-serif",
                transition: "border-color 0.2s"
              }}
              onFocus={e => e.target.style.borderColor = "var(--accent)"}
              onBlur={e => e.target.style.borderColor = "var(--border)"}
            />
          </div>
        ))}

        {/* Submit */}
        <button onClick={handleSubmit} disabled={loading} style={{
          width: "100%", padding: "14px",
          backgroundColor: "var(--accent)", color: "#fff",
          border: "none", borderRadius: "8px",
          fontSize: "11px", fontWeight: "500",
          letterSpacing: "2px", cursor: "pointer",
          opacity: loading ? 0.6 : 1, marginTop: "8px"
        }}>
          {loading ? "SIGNING IN..." : "SIGN IN"}
        </button>

        {/* Link */}
        <p style={{ textAlign: "center", marginTop: "24px", fontSize: "13px", color: "var(--text-muted)" }}>
          Don't have an account?{" "}
          <Link to="/register" style={{ color: "var(--accent)", textDecoration: "none", fontWeight: 500 }}>
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;