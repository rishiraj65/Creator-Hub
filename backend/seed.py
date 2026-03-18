from sqlalchemy.orm import Session
from app.db.session import SessionLocal, engine, Base
from app.models.user import User
from app.models.product import Product
from app.models.forum import ForumThread
from app.models.order import Order
from app.models import saved_product
from app.models.cart_item import CartItem
from app.core.security import get_password_hash

def seed_db():
    db = SessionLocal()

    # 1. Create Admin User
    admin = db.query(User).filter(User.email == "admin@creatorhub.com").first()
    if not admin:
        admin = User(
            email="admin@creatorhub.com",
            hashed_password=get_password_hash("admin123"),
            full_name="Admin User",
            is_active=True,
            is_superuser=True
        )
        db.add(admin)
        db.commit()
        db.refresh(admin)

    # 2. Seed Products
    existing_products = db.query(Product).count()
    if existing_products == 0:
        products_data = [
            {"name": "Super UI Kit", "category": "Design Resources", "price": "$49"},
            {"name": "AI Copywriter Pro", "category": "AI Tools", "price": "$29/mo"},
            {"name": "SaaS Boilerplate", "category": "Developer Tools", "price": "$99"},
            {"name": "GrowX Analytics", "category": "Analytics Tools", "price": "$15/mo"},
        ]
        for p in products_data:
            db_product = Product(**p, author_id=admin.id, description="A premium tool for the absolute black marketplace.")
            db.add(db_product)
        db.commit()

    # 3. Seed Orders for Admin
    existing_orders = db.query(Order).count()
    if existing_orders == 0:
        orders_data = [
            {"id": "ORD-9281", "product_name": "SaaS Boilerplate", "amount": "$99.00", "status": "Completed"},
            {"id": "ORD-9282", "product_name": "GrowX Analytics", "amount": "$15.00", "status": "Completed"},
            {"id": "ORD-9283", "product_name": "Super UI Kit", "amount": "$49.00", "status": "Completed"},
        ]
        for o in orders_data:
            db_order = Order(**o, user_id=admin.id)
            db.add(db_order)
        db.commit()

    # 4. Seed Forum Threads
    existing_threads = db.query(ForumThread).count()
    if existing_threads == 0:
        threads_data = [
            {
                "title": "Optimizing Shaders for Black Themes",
                "category": "Development",
                "content": "Tips on how to maintain 60fps while using SVG displacement filters on absolute black backgrounds."
            },
            {
                "title": "Launch of CreatorHub Beta!",
                "category": "Marketplace News",
                "content": "Welcome to the new monochromatic workspace. We are excited to have you here."
            }
        ]
        for t in threads_data:
            db_thread = ForumThread(**t, author_id=admin.id)
            db.add(db_thread)
        db.commit()

    db.close()

if __name__ == "__main__":
    print("Seeding database with monochromatic content...")
    seed_db()
    print("Seeding complete.")
