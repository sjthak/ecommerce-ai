from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
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
    user_id: str = None


def extract_price_filter(message: str):
    min_price = None
    max_price = None

    max_match = re.search(r'(?:under|less than|below|not more than|ไม่เกิน|ราคาไม่เกิน)\s*\$?\s*(\d+)', message, re.IGNORECASE)
    if max_match:
        max_price = float(max_match.group(1))

    min_match = re.search(r'(?:over|more than|above|at least|อย่างน้อย|ราคาเกิน)\s*\$?\s*(\d+)', message, re.IGNORECASE)
    if min_match:
        min_price = float(min_match.group(1))

    between_match = re.search(r'between\s*\$?\s*(\d+)\s*and\s*\$?\s*(\d+)', message, re.IGNORECASE)
    if between_match:
        min_price = float(between_match.group(1))
        max_price = float(between_match.group(2))

    return min_price, max_price


def extract_preferences(history: list):
    preferences = []
    for msg in history:
        if msg.role == "user":
            text = msg.content.lower()
            if any(w in text for w in ["like", "love", "prefer", "want", "looking for", "ชอบ", "อยาก", "ต้องการ"]):
                preferences.append(msg.content)
    return preferences[-5:] if preferences else []


def search_products(query: str, limit: int = 5, min_price: float = None, max_price: float = None):
    query_vector = get_model().encode(query).tolist()

    pipeline = [
        {
            "$vectorSearch": {
                "index": "vector_index",
                "path": "embedding",
                "queryVector": query_vector,
                "numCandidates": 100,
                "limit": 20
            }
        },
        {"$project": {"_id": 0, "embedding": 0}}
    ]

    results = list(collection.aggregate(pipeline))

    if min_price is not None:
        results = [p for p in results if p.get("price", 0) >= min_price]
    if max_price is not None:
        results = [p for p in results if p.get("price", 0) <= max_price]

    return results[:limit]


@router.post("/")
async def chat(req: ChatRequest):
    try:
        min_price, max_price = extract_price_filter(req.message)
        preferences = extract_preferences(req.history)

        search_query = req.message
        if preferences:
            pref_text = " ".join(preferences[-2:])
            search_query = f"{req.message} {pref_text}"

        products = search_products(search_query, limit=5, min_price=min_price, max_price=max_price)

        product_context = "\n".join([
            f"- {p['title']} | Price: ${p['price']} | {p['short_description'][:100]}"
            for p in products
        ])

        pref_context = ""
        if preferences:
            pref_context = f"\nCustomer preferences:\n" + "\n".join([f"- {p}" for p in preferences])

        price_context = ""
        if min_price or max_price:
            if min_price and max_price:
                price_context = f"\nPrice filter: ${min_price} - ${max_price}"
            elif max_price:
                price_context = f"\nPrice filter: under ${max_price}"
            elif min_price:
                price_context = f"\nPrice filter: over ${min_price}"

        system_prompt = f"""You are a helpful shopping assistant for an e-commerce fashion store.

Relevant products:
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

        messages = [{"role": "system", "content": system_prompt}]

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