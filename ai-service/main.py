from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import chat, search, embed
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="E-Commerce AI Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(embed.router,  prefix="/embed",  tags=["Embed"])
app.include_router(search.router, prefix="/search", tags=["Search"])
app.include_router(chat.router,   prefix="/chat",   tags=["Chat"])

@app.get("/")
def root():
    return {"status": "AI Service is running 🚀"}