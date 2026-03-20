from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.product import Product
from app.schemas.product import Product as ProductSchema, ProductCreate
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()

@router.get("/", response_model=List[ProductSchema])
def read_products(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    products = db.query(Product).offset(skip).limit(limit).all()
    return products

import random
@router.get("/update-prices-temp")
def update_prices_temp(db: Session = Depends(get_db)):
    products = db.query(Product).all()
    count = 0
    for p in products:
        p.price = f"₹{random.randint(9, 29)}"
        count += 1
    db.commit()
    return {"updated": count}

@router.post("/", response_model=ProductSchema)
def create_product(
    product_in: ProductCreate,
    db: Session = Depends(get_db),
) -> Any:
    db_product = Product(**product_in.dict())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

@router.get("/{product_id}", response_model=ProductSchema)
def read_product(
    product_id: int,
    db: Session = Depends(get_db),
) -> Any:
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product
@router.post("/{product_id}/save")
def save_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if product in current_user.saved_tools:
        return {"message": "Product already saved"}
    current_user.saved_tools.append(product)
    db.commit()
    return {"message": "Product saved successfully"}

@router.delete("/{product_id}/save")
def unsave_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if product not in current_user.saved_tools:
        return {"message": "Product not saved"}
    current_user.saved_tools.remove(product)
    db.commit()
    return {"message": "Product unsaved successfully"}
