import { useState, useRef, useEffect } from "react";
import axios from "axios";
import ProductCard from "./ProductCard";
import { useAuth } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL;

const ChatBot = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Welcome. How may I assist you today?", products: [], price_filter: {} }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMessage = { role: "user", content: input, products: [], price_filter: {} };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const history = updatedMessages.slice(-20).map(m => ({
        role: m.role,
        content: m.content
      }));

      const res = await axios.post(`${API_URL}/api/ai/chat`, {
        message: input,
        history,
        user_id: user?.id || null
      });

      setMessages(prev => [...prev, {
        role: "assistant",
        content: res.data.reply,
        products: res.data.products || [],
        price_filter: res.data.price_filter || {}
      }]);

    } catch {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Something went wrong. Please try again.",
        products: [],
        price_filter: {}
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Toggle Button */}
      <button onClick={() => setIsOpen(!isOpen)} style={{
        position: "fixed", bottom: "28px", right: "28px",
        width: "52px", height: "52px", borderRadius: "50%",
        backgroundColor: "var(--accent)", color: "#0a0a0a",
        fontSize: "20px", border: "none", cursor: "pointer",
        boxShadow: "0 0 24px rgba(201,169,110,0.4)",
        zIndex: 999, transition: "transform 0.2s, box-shadow 0.2s"
      }}
        onMouseEnter={e => e.currentTarget.style.transform = "scale(1.1)"}
        onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
      >
        {isOpen ? "✕" : "✦"}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div style={{
          position: "fixed", bottom: "92px", right: "28px",
          width: "400px", height: "580px",
          backgroundColor: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "16px",
          boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
          display: "flex", flexDirection: "column",
          zIndex: 998, overflow: "hidden"
        }}>

          {/* Header */}
          <div style={{
            padding: "20px 24px",
            borderBottom: "1px solid var(--border)",
            background: "linear-gradient(135deg, var(--surface2), var(--surface))"
          }}>
            <p style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "15px", color: "var(--accent)", letterSpacing: "2px"
            }}>
              ✦ SHOPPING ASSISTANT
            </p>
            <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
              {user ? `Hi, ${user.name}` : "Powered by AI"}
            </p>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1, overflowY: "auto", padding: "20px",
            display: "flex", flexDirection: "column", gap: "16px"
          }}>
            {messages.map((msg, i) => (
              <div key={i}>
                {/* Bubble */}
                <div style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
                  <div style={{
                    maxWidth: "78%", padding: "12px 16px",
                    borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                    backgroundColor: msg.role === "user" ? "var(--accent)" : "var(--surface2)",
                    color: msg.role === "user" ? "#0a0a0a" : "var(--text)",
                    fontSize: "13px", lineHeight: "1.6",
                    border: msg.role === "user" ? "none" : "1px solid var(--border)"
                  }}>
                    {msg.content}
                  </div>
                </div>

                {/* Price Filter Tag */}
                {msg.role === "assistant" && msg.price_filter?.max && (
                  <div style={{
                    display: "inline-block",
                    padding: "2px 10px", borderRadius: "12px",
                    backgroundColor: "var(--surface2)",
                    border: "1px solid var(--accent)",
                    fontSize: "10px", color: "var(--accent)",
                    letterSpacing: "1px", marginTop: "6px"
                  }}>
                    💰 UNDER ${msg.price_filter.max}
                  </div>
                )}

                {/* Products */}
                {msg.products?.length > 0 && (
                  <div style={{
                    display: "flex", gap: "10px",
                    overflowX: "auto", marginTop: "12px", paddingBottom: "4px"
                  }}>
                    {msg.products.slice(0, 3).map((p, j) => (
                      <div key={j} style={{ flexShrink: 0, width: "160px" }}>
                        <ProductCard product={p} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Loading */}
            {loading && (
              <div style={{ color: "var(--accent)", fontSize: "12px", letterSpacing: "2px" }}>
                thinking...
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{
            padding: "16px", borderTop: "1px solid var(--border)",
            display: "flex", gap: "10px",
            backgroundColor: "var(--surface)"
          }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendMessage()}
              placeholder="Ask anything..."
              style={{
                flex: 1, padding: "10px 16px",
                backgroundColor: "var(--surface2)",
                border: "1px solid var(--border)",
                borderRadius: "8px", color: "var(--text)",
                fontSize: "13px", outline: "none",
                fontFamily: "'DM Sans', sans-serif"
              }}
              onFocus={e => e.target.style.borderColor = "var(--accent)"}
              onBlur={e => e.target.style.borderColor = "var(--border)"}
            />
            <button onClick={sendMessage} disabled={loading} style={{
              padding: "10px 18px",
              backgroundColor: "var(--accent)", color: "#0a0a0a",
              border: "none", borderRadius: "8px",
              fontSize: "12px", fontWeight: "500",
              letterSpacing: "1px", cursor: "pointer",
              opacity: loading ? 0.5 : 1
            }}>
              SEND
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;