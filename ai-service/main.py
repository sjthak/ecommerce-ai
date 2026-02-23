from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import chat, search, embed
from dotenv import load_dotenv
from contextlib import asynccontextmanager

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # โหลด model ตอน startup
    print("⏳ Loading model...")
    from sentence_transformers import SentenceTransformer
    import routers.chat as chat_router
    import routers.search as search_router
    import routers.embed as embed_router
    
    model = SentenceTransformer("all-MiniLM-L6-v2")
    chat_router._model = model
    search_router._model = model
    embed_router._model = model
    print("✅ Model loaded!")
    yield

app = FastAPI(title="E-Commerce AI Service", lifespan=lifespan)

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

@app.get("/ping")
def ping():
    return {"status": "ok"}