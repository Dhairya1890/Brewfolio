from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import auth, scrape, ai, portfolio

app = FastAPI(title="Brewfolio API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://localhost:5173", "http://localhost:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(scrape.router, prefix="/scrape", tags=["scrape"])
app.include_router(ai.router, prefix="/ai", tags=["ai"])
app.include_router(portfolio.router, prefix="/portfolio", tags=["portfolio"])


@app.get("/health")
async def health():
    return {"status": "ok", "service": "brewfolio-api"}
