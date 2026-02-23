from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
from pymongo import MongoClient
from dotenv import load_dotenv
from groq import Groq
import os
import re

load_dotenv()

router = APIRouter()

_model = None

def get_model():
    global _model
    if _model is None:
        from sentence_transformers import SentenceTransformer
        _model = SentenceTransformer("BAAI/bge-m3")
    return _model

client = MongoClient(os.getenv("MONGODB_URI"))
db = client["ecommerce"]
collection = db["products"]

groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    history: list[Message] = []
    user_id: str = None  # รับ user_id เพื่อเก็บ preference


def extract_price_filter(message: str):
    """ดึง min/max price จาก message"""
    min_price = None
    max_price = None

    # หา "under $20", "less than $20", "ไม่เกิน 20"
    max_match = re.search(r'(?:under|less than|below|not more than|ไม่เกิน|ราคาไม่เกิน)\s*\$?\s*(\d+)', message, re.IGNORECASE)
    if max_match:
        max_price = float(max_match.group(1))

    # หา "over $10", "more than $10", "อย่างน้อย 10"
    min_match = re.search(r'(?:over|more than|above|at least|อย่างน้อย|ราคาเกิน)\s*\$?\s*(\d+)', message, re.IGNORECASE)
    if min_match:
        min_price = float(min_match.group(1))

    # หา "between $10 and $50"
    between_match = re.search(r'between\s*\$?\s*(\d+)\s*and\s*\$?\s*(\d+)', message, re.IGNORECASE)
    if between_match:
        min_price = float(between_match.group(1))
        max_price = float(between_match.group(2))

    return min_price, max_price


def extract_preferences(history: list):
    """วิเคราะห์ preference จาก history ทั้งหมด"""
    preferences = []
    for msg in history:
        if msg.role == "user":
            text = msg.content.lower()
            # หา keyword ที่บ่งบอก preference
            if any(w in text for w in ["like", "love", "prefer", "want", "looking for", "ชอบ", "อยาก", "ต้องการ"]):
                preferences.append(msg.content)
    return preferences[-5:] if preferences else []  # เก็บแค่ 5 preferences ล่าสุด


def search_products(query: str, limit: int = 5, min_price: float = None, max_price: float = None):
    query_vector = get_model().encode(query).tolist()

    pipeline = [
        {
            "$vectorSearch": {
                "index": "vector_index",
                "path": "embedding",
                "queryVector": query_vector,
                "numCandidates": 100,  # เพิ่มจาก 50 เป็น 100 เพื่อ filter ราคาได้ดีขึ้น
                "limit": 20
            }
        },
        {"$project": {"_id": 0, "embedding": 0}}
    ]

    results = list(collection.aggregate(pipeline))

    # Filter ราคา
    if min_price is not None:
        results = [p for p in results if p.get("price", 0) >= min_price]
    if max_price is not None:
        results = [p for p in results if p.get("price", 0) <= max_price]

    return results[:limit]


@router.post("/")
async def chat(req: ChatRequest):
    try:
        # ดึง price filter จาก message
        min_price, max_price = extract_price_filter(req.message)

        # ดึง preference จาก history ทั้งหมด
        preferences = extract_preferences(req.history)

        # สร้าง query ที่ดีขึ้นโดยรวม preference เข้าไป
        search_query = req.message
        if preferences:
            pref_text = " ".join(preferences[-2:])
            search_query = f"{req.message} {pref_text}"

        # ค้นหาสินค้า
        products = search_products(search_query, limit=5, min_price=min_price, max_price=max_price)

        # สร้าง product context
        product_context = "\n".join([
            f"- {p['title']} | Price: ${p['price']} | {p['short_description'][:100]}"
            for p in products
        ])

        # สร้าง preference context
        pref_context = ""
        if preferences:
            pref_context = f"\nCustomer preferences from conversation:\n" + "\n".join([f"- {p}" for p in preferences])

        # Price filter context
        price_context = ""
        if min_price or max_price:
            if min_price and max_price:
                price_context = f"\nPrice filter: ${min_price} - ${max_price}"
            elif max_price:
                price_context = f"\nPrice filter: under ${max_price}"
            elif min_price:
                price_context = f"\nPrice filter: over ${min_price}"

        system_prompt = f"""You are a helpful shopping assistant for an e-commerce fashion store.
Your job is to help customers find products and answer their questions.

Relevant products from our store:
{product_context}
{pref_context}
{price_context}

Guidelines:
- Recommend products from the list above when relevant
- Remember customer preferences throughout the conversation
- If price filter is applied, only recommend products within that range
- Be friendly and conversational
- Keep responses concise (2-3 sentences max)
- Mention exact prices when recommending
- Always respond in the same language as the customer"""

        # เก็บ history ทั้งหมด (ไม่จำกัดแค่ 6)
        messages = [{"role": "system", "content": system_prompt}]

        # ใช้ history ทั้งหมดแต่จำกัด token โดยเก็บแค่ 20 messages ล่าสุด
        recent_history = req.history[-20:]
        for msg in recent_history:
            messages.append({"role": msg.role, "content": msg.content})

        messages.append({"role": "user", "content": req.message})

        response = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=messages,
            max_tokens=512,
            temperature=0.7
        )

        reply = response.choices[0].message.content

        return {
            "success": True,
            "reply": reply,
            "products": products,
            "price_filter": {"min": min_price, "max": max_price},
            "preferences_detected": len(preferences)
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))