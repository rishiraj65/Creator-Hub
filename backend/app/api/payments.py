import os
import razorpay
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from typing import Any
import hmac
import hashlib
import json
from datetime import datetime

from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.product import Product
from app.models.order import Order
from pydantic import BaseModel

router = APIRouter()

# Razorpay client initialization
RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "rzp_test_your_key_id")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "your_key_secret")

client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))

class OrderCreate(BaseModel):
    amount: float  # Amount in Rupees
    product_name: str

@router.post("/create-order")
async def create_order(
    payload: OrderCreate,
    current_user: User = Depends(get_current_user)
) -> Any:
    try:
        # Amount should be in paise (1 INR = 100 Paise)
        order_data = {
            "amount": int(payload.amount * 100),
            "currency": "INR",
            "receipt": f"receipt_{current_user.id}_{int(datetime.now().timestamp())}",
            "notes": {
                "user_id": current_user.id,
                "product_name": payload.product_name
            }
        }
        razorpay_order = client.order.create(data=order_data)
        return razorpay_order
    except Exception as e:
        print(f"Razorpay Order Error: {e}")
        raise HTTPException(status_code=400, detail=str(e))

class PaymentVerify(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    product_name: str
    amount: float

@router.post("/verify")
async def verify_payment(
    payload: PaymentVerify,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    try:
        # Verify signature
        params_dict = {
            'razorpay_order_id': payload.razorpay_order_id,
            'razorpay_payment_id': payload.razorpay_payment_id,
            'razorpay_signature': payload.razorpay_signature
        }
        
        # This will raise an error if signature is invalid
        client.utility.verify_payment_signature(params_dict)
        
        # Create record in orders table
        new_order = Order(
            id=payload.razorpay_order_id,
            user_id=current_user.id,
            product_name=payload.product_name,
            amount=f"₹{payload.amount:.2f}",
            status="Completed",
            created_at=datetime.utcnow()
        )
        db.add(new_order)
        
        # Clear cart items for this user (if integrated with cart)
        from app.models.cart_item import CartItem
        db.query(CartItem).filter(CartItem.user_id == current_user.id).delete()
        
        db.commit()
        
        return {"status": "success", "order_id": new_order.id}
    except Exception as e:
        print(f"Payment Verification Error: {e}")
        raise HTTPException(status_code=400, detail="Payment verification failed")
