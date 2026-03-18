from pydantic import BaseModel
from typing import Optional

class ProductBase(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[str] = None
    category: Optional[str] = None
    rating: Optional[float] = 0.0

class ProductCreate(ProductBase):
    name: str
    price: str

class ProductUpdate(ProductBase):
    pass

class ProductInDBBase(ProductBase):
    id: int
    author_id: int

    class Config:
        from_attributes = True

class Product(ProductInDBBase):
    pass
