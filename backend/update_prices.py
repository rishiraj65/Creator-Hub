import os
import sys

# Add backend directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.session import SessionLocal
from app.models.product import Product
import random

def update_prices():
    db = SessionLocal()
    products = db.query(Product).all()
    
    if not products:
        print("No products found in the database. Creating default ones...")
        featured_names = [
            ("Super UI Kit", "Design Resources", 4.8),
            ("AI Copywriter Pro", "AI Tools", 4.9),
            ("SaaS Boilerplate", "Developer Tools", 5.0),
            ("GrowX Analytics", "Analytics Tools", 4.6),
            ("Social Flow", "Marketing Tools", 4.7),
            ("Email Automator", "Business Automation", 4.5),
            ("Creator 3D Assets", "Design Resources", 4.9),
            ("API Rate Limiter", "Developer Tools", 4.8),
        ]
        for name, cat, rating in featured_names:
            price = f"₹{random.randint(9, 29)}"
            p = Product(name=name, category=cat, rating=rating, price=price, description=f"Premium {cat} tool.")
            db.add(p)
        db.commit()
        print("Products inserted with Rupee prices.")
    else:
        print(f"Found {len(products)} products. Updating prices...")
        for p in products:
            p.price = f"₹{random.randint(9, 29)}"
        db.commit()
        print("Prices updated successfully.")
        
    db.close()

if __name__ == "__main__":
    update_prices()
