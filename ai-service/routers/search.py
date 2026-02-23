from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()

router = APIRouter()

# Lazy load — โหลดเมื่อมีการเรียกใช้ครั้งแรก
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

class SearchRequest(BaseModel):
    query: str
    limit: int = 5

@router.post("/")
async def search_products(req: SearchRequest):
    try:
        model = get_model()
        query_vector = model.encode(req.query).tolist()

        results = collection.aggregate([
            {
                "$vectorSearch": {
                    "index": "vector_index",
                    "path": "embedding",
                    "queryVector": query_vector,
                    "numCandidates": 50,
                    "limit": req.limit
                }
            },
            {"$project": {"_id": 0, "embedding": 0}}
        ])

        return {
            "success": True,
            "query": req.query,
            "results": list(results)
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))