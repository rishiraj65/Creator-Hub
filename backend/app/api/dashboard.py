from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import random
from datetime import datetime

from app.db.session import get_db
from app.schemas.dashboard import DashboardData, DashboardStats, RecentOrder, MarketData, SavedProductResponse, ProfileUpdate
from .deps import get_current_user
from app.models.user import User
from app.models.order import Order

router = APIRouter()

@router.get("/", response_model=DashboardData)
def get_dashboard_data(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Fetch real stats from DB
    total_orders = len(current_user.orders)
    saved_tools = len(current_user.saved_tools)
    
    account_status = "Admin" if current_user.is_superuser else "Pro Member" if total_orders > 5 else "Free Tier"
    
    stats = DashboardStats(
        total_orders=total_orders,
        saved_tools=saved_tools,
        account_status=account_status
    )
    
    # Fetch real orders for this user
    db_orders = db.query(Order).filter(Order.user_id == current_user.id).order_by(Order.created_at.desc()).limit(5).all()
    
    orders = [
        RecentOrder(
            id=o.id, 
            date=o.created_at.strftime("%b %d, %Y"), 
            product=o.product_name, 
            amount=o.amount, 
            status=o.status
        ) for o in db_orders
    ]
    
    market = MarketData(
        btc_price=65430.25 + random.uniform(-500, 500),
        eth_price=3450.75 + random.uniform(-50, 50),
        weather_temp=72 + random.randint(-5, 10),
        weather_condition=random.choice(["Sunny", "Cloudy", "Partly Cloudy"])
    )
    
    return DashboardData(
        stats=stats,
        orders=orders,
        market=market
    )

@router.get("/orders", response_model=List[RecentOrder])
def get_all_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_orders = db.query(Order).filter(Order.user_id == current_user.id).order_by(Order.created_at.desc()).all()
    return [
        RecentOrder(
            id=o.id, 
            date=o.created_at.strftime("%b %d, %Y"), 
            product=o.product_name, 
            amount=o.amount, 
            status=o.status
        ) for o in db_orders
    ]

@router.get("/saved", response_model=SavedProductResponse)
def get_saved_products(
    current_user: User = Depends(get_current_user)
):
    return SavedProductResponse(saved_products=current_user.saved_tools)

@router.patch("/profile")
def update_profile(
    profile_data: ProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if profile_data.full_name is not None:
        current_user.full_name = profile_data.full_name
    
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return {"message": "Profile updated successfully"}
