from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()
router = APIRouter()

model = SentenceTransformer("BAAI/bge-m3")

client = MongoClient(os.getenv("MONGODB_URI"))
db = client["ecommerce"]
collection = db["products"]

class SearchRequest(BaseModel):
    query: str
    limit: int = 5


@router.post("/")
async def search_products(req: SearchRequest):
    try:
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
            {
                "$project": {
                    "_id": 0,
                    "embedding": 0
                }
            }
        ])

        products = list(results)
        return {
            "success": True,
            "query": req.query,
            "results": products
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))