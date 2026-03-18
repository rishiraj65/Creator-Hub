from app.db.session import engine, Base
from app.models.user import User
from app.models.product import Product
from app.models.forum import ForumThread, ForumPost

def init_db():
    Base.metadata.create_all(bind=engine)

if __name__ == "__main__":
    print("Creating database tables...")
    init_db()
    print("Tables created successfully.")
