import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.password) return setError("Please fill in all fields");
    if (form.password !== form.confirm) return setError("Passwords do not match");
    if (form.password.length < 6) return setError("Password must be at least 6 characters");

    setLoading(true); setError("");
    try {
      await register(form.name, form.email, form.password);
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
        <p style={{ fontSize: "11px", letterSpacing: "3px", color: "var(--accent)", marginBottom: "8px" }}>
          JOIN US
        </p>
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: "28px", fontWeight: 400,
          color: "var(--text)", marginBottom: "36px"
        }}>
          Create Account
        </h1>

        {error && (
          <div style={{
            padding: "12px 16px", borderRadius: "8px",
            backgroundColor: "#fff0f0", border: "1px solid #ffcccc",
            color: "#cc0000", fontSize: "13px", marginBottom: "20px"
          }}>
            {error}
          </div>
        )}

        {[
          { label: "FULL NAME", key: "name", type: "text", placeholder: "John Doe" },
          { label: "EMAIL", key: "email", type: "email", placeholder: "your@email.com" },
          { label: "PASSWORD", key: "password", type: "password", placeholder: "Min 6 characters" },
          { label: "CONFIRM PASSWORD", key: "confirm", type: "password", placeholder: "••••••••" }
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

        <button onClick={handleSubmit} disabled={loading} style={{
          width: "100%", padding: "14px",
          backgroundColor: "var(--accent)", color: "#fff",
          border: "none", borderRadius: "8px",
          fontSize: "11px", fontWeight: "500",
          letterSpacing: "2px", cursor: "pointer",
          opacity: loading ? 0.6 : 1, marginTop: "8px"
        }}>
          {loading ? "CREATING..." : "CREATE ACCOUNT"}
        </button>

        <p style={{ textAlign: "center", marginTop: "24px", fontSize: "13px", color: "var(--text-muted)" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "var(--accent)", textDecoration: "none", fontWeight: 500 }}>
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;