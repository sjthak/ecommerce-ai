from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
from pymongo import MongoClient
import os

router = APIRouter()

# โหลด embedding model (รองรับภาษาไทย)
model = SentenceTransformer("BAAI/bge-m3")

# เชื่อมต่อ MongoDB
client = MongoClient(os.getenv("MONGODB_URI"))
db = client["ecommerce"]
collection = db["products"]

# โครงสร้างข้อมูลสินค้า
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
            # รวมข้อมูลสินค้าเป็น text เดียว
            text = f"{product.name} {product.description} {product.category}"

            # แปลงเป็น vector
            vector = model.encode(text).tolist()

            # บันทึกลง MongoDB พร้อม vector
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

        return {
            "success": True,
            "embedded": embedded_count,
            "message": f"Embedded {embedded_count} products เรียบร้อย"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/status")
async def embed_status():
    count = collection.count_documents({"embedding": {"$exists": True}})
    return {"products_embedded": count}