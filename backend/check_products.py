import os
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.session import SessionLocal
from app.models.user import User
from app.models.product import Product
from app.models.forum import ForumThread, ForumPost
from app.models.order import Order
from app.models.cart_item import CartItem

db = SessionLocal()
products = db.query(Product).all()
print(f"Total products: {len(products)}")
for p in products:
    print(f"{p.id} | {p.name} | {p.price}")
db.close()
