from dotenv import load_dotenv
import os
from pymongo import MongoClient
from sentence_transformers import SentenceTransformer

load_dotenv()
client = MongoClient(os.getenv("MONGODB_URI"))
db = client["ecommerce"]
collection = db["products"]

model = SentenceTransformer("BAAI/bge-m3")
vector = model.encode("necklace for women").tolist()

results = list(collection.aggregate([
    {
        "$vectorSearch": {
            "index": "vector_index",
            "path": "embedding",
            "queryVector": vector,
            "numCandidates": 50,
            "limit": 3
        }
    },
    {"$project": {"_id": 0, "embedding": 0}}
]))

print(results)