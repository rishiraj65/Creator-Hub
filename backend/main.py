import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import products, forum, dashboard, cart, chat
from app.models import product, order, saved_product, cart_item
import uvicorn

app = FastAPI(
    title="CreatorHub API",
    description="Backend API for the CreatorHub Marketplace",
    version="1.0.0"
)

# CORS configuration
origins_str = os.getenv("CORS_ORIGINS", "*")
if origins_str == "*":
    origins = ["*"]
else:
    origins = [o.strip() for o in origins_str.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(products.router, prefix="/api/products", tags=["products"])
app.include_router(forum.router, prefix="/api/forum", tags=["forum"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["dashboard"])
app.include_router(cart.router, prefix="/api/cart", tags=["cart"])
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])

@app.get("/")
async def root():
    return {"message": "Welcome to CreatorHub API", "status": "online"}

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
