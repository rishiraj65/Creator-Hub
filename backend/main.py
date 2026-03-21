import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import products, forum, dashboard, cart, chat, payments
from app.models import product, order, saved_product, cart_item
import uvicorn

app = FastAPI(
    title="CreatorHub API",
    description="Backend API for the CreatorHub Marketplace",
    version="1.0.0"
)

from fastapi import Response, Request

# Manual CORS Middleware (Nuclear Option)
@app.middleware("http")
async def add_cors_headers(request: Request, call_next):
    # Handle preflight (OPTIONS) requests
    if request.method == "OPTIONS":
        response = Response()
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With"
        response.headers["Access-Control-Allow-Credentials"] = "true"
        return response
    
    # Handle actual requests
    response = await call_next(request)
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Credentials"] = "true"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With"
    return response

app.include_router(products.router, prefix="/api/products", tags=["products"])
app.include_router(payments.router, prefix="/api/payments", tags=["payments"])
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
