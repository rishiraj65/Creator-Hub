from pydantic import BaseModel
from typing import List, Optional
from app.schemas.product import Product

class DashboardStats(BaseModel):
    total_orders: int
    saved_tools: int
    account_status: str

class RecentOrder(BaseModel):
    id: str
    date: str
    product: str
    amount: str
    status: str

class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None

class MarketData(BaseModel):
    btc_price: float
    eth_price: float
    weather_temp: int
    weather_condition: str

class DashboardData(BaseModel):
    stats: DashboardStats
    orders: List[RecentOrder]
    market: MarketData

class SavedProductResponse(BaseModel):
    saved_products: List[Product]
