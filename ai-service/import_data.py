import csv
import os
import ast
from sentence_transformers import SentenceTransformer
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

client = MongoClient(os.getenv("MONGODB_URI"))
db = client["ecommerce"]
collection = db["products"]

print("⏳ กำลังโหลด embedding model...")
model = SentenceTransformer("BAAI/bge-m3")
print("✅ โหลด model สำเร็จ")

with open("data/amazon_fashion_web.csv", encoding="utf-8") as f:
    products = list(csv.DictReader(f))

print(f" พบสินค้าทั้งหมด {len(products)} รายการ")

# ล้างข้อมูลเก่าก่อน
collection.delete_many({})
print(" ล้างข้อมูลเก่าแล้ว")

for i, product in enumerate(products):
    # แปลง image string → dict แล้วดึง URL
    try:
        image_data = ast.literal_eval(product["main_image"])
        image_url = image_data.get("large") or image_data.get("hi_res") or ""
    except:
        image_url = ""

    # รวม text สำหรับ embedding
    text = f"{product['title']} {product['short_description']} {product['main_category']}"
    vector = model.encode(text).tolist()

    collection.update_one(
        {"product_id": product["product_id"]},
        {"$set": {
            "product_id": product["product_id"],
            "title": product["title"],
            "main_category": product["main_category"],
            "price": float(product["price"]) if product["price"] else 0,
            "image_url": image_url,
            "short_description": product["short_description"],
            "embedding": vector
        }},
        upsert=True
    )

    if (i + 1) % 10 == 0:
        print(f" {i + 1}/{len(products)} สินค้า")

print(" Import เสร็จสมบูรณ์!")
client.close()