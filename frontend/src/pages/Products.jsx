import { useState, useEffect } from "react";
import axios from "axios";
import ProductCard from "../components/ProductCard";

const API_URL = import.meta.env.VITE_API_URL;

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searching, setSearching] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [isFiltered, setIsFiltered] = useState(false);
  const LIMIT = 20;

  const fetchProducts = async (p = 1, min = "", max = "") => {
    setLoading(true);
    try {
      let url = `${API_URL}/api/products?limit=${LIMIT}&page=${p}`;
      if (min) url += `&min_price=${min}`;
      if (max) url += `&max_price=${max}`;
      const res = await axios.get(url);
      setProducts(res.data.products);
      setTotal(res.data.total);
      setPage(p);
    } finally { setLoading(false); }
  };

  const handleSearch = async () => {
    if (!search.trim()) return fetchProducts(1, minPrice, maxPrice);
    setSearching(true); setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/ai/search`, { query: search, limit: LIMIT });
      let results = res.data.results;
      // filter ราคาฝั่ง client ถ้ามีการ search ด้วย AI
      if (minPrice) results = results.filter(p => p.price >= parseFloat(minPrice));
      if (maxPrice) results = results.filter(p => p.price <= parseFloat(maxPrice));
      setProducts(results);
      setTotal(results.length);
    } finally { setLoading(false); setSearching(false); }
  };

  const handleFilter = () => {
    setIsFiltered(!!(minPrice || maxPrice));
    if (search.trim()) handleSearch();
    else fetchProducts(1, minPrice, maxPrice);
  };

  const handleClearAll = () => {
    setSearch(""); setMinPrice(""); setMaxPrice(""); setIsFiltered(false);
    fetchProducts(1, "", "");
  };

  useEffect(() => { fetchProducts(); }, []);

  return (
    <div style={{ backgroundColor: "var(--bg)", minHeight: "calc(100vh - 64px)", padding: "48px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

        {/* Header */}
        <p style={{ fontSize: "11px", letterSpacing: "4px", color: "var(--accent)", marginBottom: "8px" }}>
          COLLECTION
        </p>
        <h2 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: "36px", fontWeight: 400,
          color: "var(--text)", marginBottom: "32px"
        }}>
          All Products
        </h2>

        {/* Search + Filter */}
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "16px" }}>

          {/* Search Bar */}
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSearch()}
            placeholder="Search with AI — try 'elegant necklace for evening wear'"
            style={{
              flex: "1 1 300px", padding: "14px 20px",
              backgroundColor: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "8px", color: "var(--text)",
              fontSize: "13px", outline: "none",
              fontFamily: "'DM Sans', sans-serif",
              transition: "border-color 0.2s"
            }}
            onFocus={e => e.target.style.borderColor = "var(--accent)"}
            onBlur={e => e.target.style.borderColor = "var(--border)"}
          />

          {/* Min Price */}
          <input
            value={minPrice}
            onChange={e => setMinPrice(e.target.value)}
            placeholder="Min $"
            type="number"
            style={{
              width: "90px", padding: "14px 12px",
              backgroundColor: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "8px", color: "var(--text)",
              fontSize: "13px", outline: "none",
              fontFamily: "'DM Sans', sans-serif",
              transition: "border-color 0.2s"
            }}
            onFocus={e => e.target.style.borderColor = "var(--accent)"}
            onBlur={e => e.target.style.borderColor = "var(--border)"}
          />

          <span style={{ display: "flex", alignItems: "center", color: "var(--text-muted)", fontSize: "13px" }}>
            —
          </span>

          {/* Max Price */}
          <input
            value={maxPrice}
            onChange={e => setMaxPrice(e.target.value)}
            placeholder="Max $"
            type="number"
            style={{
              width: "90px", padding: "14px 12px",
              backgroundColor: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "8px", color: "var(--text)",
              fontSize: "13px", outline: "none",
              fontFamily: "'DM Sans', sans-serif",
              transition: "border-color 0.2s"
            }}
            onFocus={e => e.target.style.borderColor = "var(--accent)"}
            onBlur={e => e.target.style.borderColor = "var(--border)"}
          />

          {/* Search Button */}
          <button onClick={handleSearch} disabled={searching} style={{
            padding: "14px 28px",
            backgroundColor: "var(--accent)", color: "#fff",
            border: "none", borderRadius: "8px",
            fontSize: "11px", fontWeight: "500",
            letterSpacing: "2px", cursor: "pointer",
            opacity: searching ? 0.6 : 1
          }}>
            {searching ? "..." : "SEARCH"}
          </button>

          {/* Filter Button */}
          <button onClick={handleFilter} style={{
            padding: "14px 20px",
            backgroundColor: isFiltered ? "var(--accent)" : "transparent",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            color: isFiltered ? "#fff" : "var(--text-muted)",
            fontSize: "11px", letterSpacing: "2px", cursor: "pointer",
            transition: "all 0.2s"
          }}>
            ⚙ FILTER
          </button>

          {/* Clear */}
          {(search || minPrice || maxPrice) && (
            <button onClick={handleClearAll} style={{
              padding: "14px 20px",
              backgroundColor: "transparent",
              border: "1px solid var(--border)",
              borderRadius: "8px", color: "var(--text-muted)",
              fontSize: "11px", letterSpacing: "2px", cursor: "pointer"
            }}>
              CLEAR
            </button>
          )}
        </div>

        {/* Active Filter Tags */}
        {(minPrice || maxPrice) && (
          <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
            {minPrice && (
              <span style={{
                padding: "4px 12px", borderRadius: "20px",
                backgroundColor: "var(--surface2)",
                border: "1px solid var(--accent)",
                fontSize: "11px", color: "var(--accent)", letterSpacing: "1px"
              }}>
                MIN ${minPrice}
              </span>
            )}
            {maxPrice && (
              <span style={{
                padding: "4px 12px", borderRadius: "20px",
                backgroundColor: "var(--surface2)",
                border: "1px solid var(--accent)",
                fontSize: "11px", color: "var(--accent)", letterSpacing: "1px"
              }}>
                MAX ${maxPrice}
              </span>
            )}
          </div>
        )}

        <p style={{ fontSize: "12px", color: "var(--text-muted)", letterSpacing: "1px", marginBottom: "24px" }}>
          {total} ITEMS
        </p>

        {/* Grid */}
        {loading ? (
          <p style={{ color: "var(--text-muted)", letterSpacing: "2px", fontSize: "12px" }}>LOADING...</p>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
            {products.map((p, i) => <ProductCard key={i} product={p} />)}
          </div>
        )}

        {/* Pagination */}
        {!search && !loading && (
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "48px" }}>
            <button onClick={() => fetchProducts(page - 1, minPrice, maxPrice)} disabled={page === 1} style={{
              padding: "10px 20px", backgroundColor: "transparent",
              border: "1px solid var(--border)", borderRadius: "6px",
              color: "var(--text-muted)", fontSize: "11px",
              letterSpacing: "1px", cursor: "pointer",
              opacity: page === 1 ? 0.3 : 1
            }}>
              ← PREV
            </button>
            <span style={{ fontSize: "12px", color: "var(--text-muted)", letterSpacing: "1px" }}>
              {page} / {Math.ceil(total / LIMIT)}
            </span>
            <button onClick={() => fetchProducts(page + 1, minPrice, maxPrice)} disabled={page >= Math.ceil(total / LIMIT)} style={{
              padding: "10px 20px", backgroundColor: "transparent",
              border: "1px solid var(--border)", borderRadius: "6px",
              color: "var(--text-muted)", fontSize: "11px",
              letterSpacing: "1px", cursor: "pointer",
              opacity: page >= Math.ceil(total / LIMIT) ? 0.3 : 1
            }}>
              NEXT →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;