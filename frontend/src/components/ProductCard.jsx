import { useNavigate } from "react-router-dom";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/products/${product.product_id}`)}
      style={{
        width: "220px", flexShrink: 0,
        backgroundColor: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
        overflow: "hidden",
        transition: "transform 0.3s, border-color 0.3s",
        cursor: "pointer",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.borderColor = "var(--accent)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.borderColor = "var(--border)";
      }}
    >
      <div style={{ position: "relative", height: "200px", overflow: "hidden", backgroundColor: "#f5f5f5" }}>
        <img
          src={product.image_url}
          alt={product.title}
          style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s" }}
          onMouseEnter={e => e.target.style.transform = "scale(1.05)"}
          onMouseLeave={e => e.target.style.transform = "scale(1)"}
          onError={e => e.target.src = "https://via.placeholder.com/220x200/f5f5f5/888?text=No+Image"}
        />
      </div>
      <div style={{ padding: "14px" }}>
        <p style={{
          fontSize: "12px", color: "var(--text-muted)",
          letterSpacing: "1px", marginBottom: "6px",
          textTransform: "uppercase"
        }}>
          {product.main_category}
        </p>
        <p style={{
          fontSize: "13px", color: "var(--text)",
          lineHeight: "1.5", marginBottom: "10px",
          display: "-webkit-box", WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical", overflow: "hidden"
        }}>
          {product.title}
        </p>
        <p style={{
          fontSize: "15px", color: "var(--accent)",
          fontWeight: "500", letterSpacing: "0.5px"
        }}>
          ${product.price}
        </p>
      </div>
    </div>
  );
};

export default ProductCard;