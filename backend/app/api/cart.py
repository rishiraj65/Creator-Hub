from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.cart_item import CartItem
from app.models.product import Product
from app.models.user import User
from app.api.deps import get_current_user
from pydantic import BaseModel

router = APIRouter()

class CartItemSchema(BaseModel):
    id: int
    product_id: int
    quantity: int
    name: str
    price: float
    category: str

    class Config:
        from_attributes = True

class AddToCartSchema(BaseModel):
    product_id: int
    quantity: int = 1

class UpdateQuantitySchema(BaseModel):
    delta: int

@router.get("/", response_model=List[CartItemSchema])
def get_cart(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    items = []
    for item in current_user.cart_items:
        items.append({
            "id": item.id,
            "product_id": item.product_id,
            "quantity": item.quantity,
            "name": item.product.name,
            "price": float(''.join(c for c in item.product.price if c.isdigit() or c == '.')),
            "category": item.product.category
        })
    return items

@router.post("/")
def add_to_cart(
    payload: AddToCartSchema,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    # Check if product exists
    product = db.query(Product).filter(Product.id == payload.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Check if already in cart
    item = db.query(CartItem).filter(
        CartItem.user_id == current_user.id,
        CartItem.product_id == payload.product_id
    ).first()
    
    if item:
        item.quantity += payload.quantity
    else:
        item = CartItem(user_id=current_user.id, product_id=payload.product_id, quantity=payload.quantity)
        db.add(item)
    
    db.commit()
    return {"message": "Added to cart"}

@router.delete("/{product_id}")
def remove_from_cart(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    item = db.query(CartItem).filter(
        CartItem.user_id == current_user.id,
        CartItem.product_id == product_id
    ).first()
    
    if not item:
        raise HTTPException(status_code=404, detail="Item not in cart")
    
    db.delete(item)
    db.commit()
    return {"message": "Removed from cart"}

@router.put("/{product_id}")
def update_cart_quantity(
    product_id: int,
    payload: UpdateQuantitySchema,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    item = db.query(CartItem).filter(
        CartItem.user_id == current_user.id,
        CartItem.product_id == product_id
    ).first()
    
    if not item:
        raise HTTPException(status_code=404, detail="Item not in cart")
    
    item.quantity = max(1, item.quantity + payload.delta)
    db.commit()
    return {"message": "Quantity updated"}
