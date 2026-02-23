from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()

router = APIRouter()

_model = None

def get_model():
    global _model
    if _model is None:
        from sentence_transformers import SentenceTransformer
        _model = SentenceTransformer("all-MiniLM-L6-v2")
    return _model

client = MongoClient(os.getenv("MONGODB_URI"))
db = client["ecommerce"]
collection = db["products"]

class Product(BaseModel):
    id: str
    name: str
    description: str
    category: str
    price: float

class ProductList(BaseModel):
    products: list[Product]

@router.post("/products")
async def embed_products(data: ProductList):
    try:
        embedded_count = 0
        for product in data.products:
            text = f"{product.name} {product.description} {product.category}"
            vector = get_model().encode(text).tolist()

            collection.update_one(
                {"id": product.id},
                {"$set": {
                    "id": product.id,
                    "name": product.name,
                    "description": product.description,
                    "category": product.category,
                    "price": product.price,
                    "embedding": vector
                }},
                upsert=True
            )
            embedded_count += 1

        return {"success": True, "embedded": embedded_count}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/status")
async def embed_status():
    count = collection.count_documents({"embedding": {"$exists": True}})
    return {"products_embedded": count}