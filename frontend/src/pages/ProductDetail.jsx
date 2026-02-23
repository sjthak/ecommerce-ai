import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import ProductCard from "../components/ProductCard";
import { useCart } from "../context/CartContext";

const API_URL = import.meta.env.VITE_API_URL;


const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        // ดึงข้อมูลสินค้า
        const res = await axios.get(`${API_URL}/api/products/${id}`);
        setProduct(res.data.product);

        // ดึงสินค้าที่เกี่ยวข้องด้วย AI
        const relatedRes = await axios.post(`${API_URL}/api/ai/search`, {
          query: res.data.product.title,
          limit: 5
        });
        // กรองสินค้าตัวเองออก
        setRelated(relatedRes.data.results.filter(p => p.product_id !== id));

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) return (
    <div style={{ padding: "80px", textAlign: "center", color: "var(--text-muted)", letterSpacing: "2px" }}>
      LOADING...
    </div>
  );

  if (!product) return (
    <div style={{ padding: "80px", textAlign: "center", color: "var(--text-muted)" }}>
      Product not found.
    </div>
  );

  return (
    <div style={{ backgroundColor: "var(--bg)", minHeight: "calc(100vh - 64px)" }}>

      {/* Back Button */}
      <div style={{ padding: "24px 48px 0" }}>
        <button onClick={() => navigate(-1)} style={{
          background: "none", border: "none",
          color: "var(--text-muted)", cursor: "pointer",
          fontSize: "12px", letterSpacing: "1px",
          display: "flex", alignItems: "center", gap: "6px"
        }}>
          ← BACK
        </button>
      </div>

      {/* Product Section */}
      <div style={{
        maxWidth: "1100px", margin: "0 auto",
        padding: "40px 48px",
        display: "flex", gap: "64px",
        alignItems: "flex-start"
      }}>

        {/* Image */}
        <div style={{
          width: "480px", flexShrink: 0,
          borderRadius: "16px", overflow: "hidden",
          backgroundColor: "var(--surface2)",
          border: "1px solid var(--border)",
          aspectRatio: "1"
        }}>
          <img
            src={product.image_url}
            alt={product.title}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onError={e => e.target.src = "https://via.placeholder.com/480/f5f5f5/888?text=No+Image"}
          />
        </div>

        {/* Info */}
        <div style={{ flex: 1, paddingTop: "8px" }}>
          <p style={{
            fontSize: "11px", letterSpacing: "3px",
            color: "var(--accent)", marginBottom: "16px",
            textTransform: "uppercase"
          }}>
            {product.main_category}
          </p>

          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "28px", fontWeight: 400,
            color: "var(--text)", lineHeight: 1.4,
            marginBottom: "24px"
          }}>
            {product.title}
          </h1>

          <p style={{
            fontSize: "32px", color: "var(--accent)",
            fontWeight: "500", marginBottom: "32px",
            letterSpacing: "1px"
          }}>
            ${product.price}
          </p>

          <div style={{
            height: "1px", backgroundColor: "var(--border)",
            marginBottom: "28px"
          }} />

          <p style={{
            fontSize: "13px", color: "var(--text-muted)",
            lineHeight: "1.8", marginBottom: "40px"
          }}>
            {product.short_description}
          </p>

          {/* Add to Cart Button */}
          <button
            onClick={() => addToCart(product)}
            style={{
                width: "100%", padding: "16px",
                backgroundColor: "var(--accent)", color: "#fff",
                border: "none", borderRadius: "8px",
                fontSize: "12px", fontWeight: "500",
                letterSpacing: "2px", cursor: "pointer",
                transition: "opacity 0.2s", marginBottom: "12px"
              }}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}
          >
            ADD TO CART
            </button>

          <button style={{
            width: "100%", padding: "16px",
            backgroundColor: "transparent", color: "var(--text)",
            border: "1px solid var(--border)", borderRadius: "8px",
            fontSize: "12px", letterSpacing: "2px", cursor: "pointer"
          }}>
            ♡ WISHLIST
          </button>
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <div style={{
          maxWidth: "1100px", margin: "0 auto",
          padding: "0 48px 64px"
        }}>
          <div style={{ height: "1px", backgroundColor: "var(--border)", marginBottom: "40px" }} />

          <p style={{
            fontSize: "11px", letterSpacing: "4px",
            color: "var(--accent)", marginBottom: "8px"
          }}>
            YOU MAY ALSO LIKE
          </p>
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "24px", fontWeight: 400,
            color: "var(--text)", marginBottom: "28px"
          }}>
            Related Products
          </h2>

          <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
            {related.map((p, i) => <ProductCard key={i} product={p} />)}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;