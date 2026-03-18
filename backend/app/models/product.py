from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.db.session import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    description = Column(String)
    price = Column(String) # Stored as string to match frontend "$49" or "$29/mo"
    category = Column(String, index=True)
    rating = Column(Float, default=0.0)
    author_id = Column(Integer, ForeignKey("users.id"))

    author = relationship("User")
