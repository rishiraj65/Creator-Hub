import os
import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Integer, String, Float

# Use the Railway URL from .env
DATABASE_URL = "postgresql://postgres:VGZGeBcLxccYLPQXlEMzjSbyzDxkiedh@autorack.proxy.rlwy.net:46656/railway"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    price = Column(String)

def check():
    db = SessionLocal()
    try:
        products = db.query(Product).all()
        print(f"COUNT: {len(products)}")
        for p in products:
            print(f"ID: {p.id}, NAME: {p.name}, PRICE: {p.price}")
    except Exception as e:
        print(f"ERROR: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    check()
