from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class ForumPostBase(BaseModel):
    content: str

class ForumPostCreate(ForumPostBase):
    thread_id: int

class ForumPostInDB(ForumPostBase):
    id: int
    author_id: int
    author_email: Optional[str] = None
    likes: int
    created_at: datetime

    class Config:
        from_attributes = True

class ForumThreadBase(BaseModel):
    title: str
    content: str
    category: str

class ForumThreadCreate(ForumThreadBase):
    pass

class ForumThreadInDB(ForumThreadBase):
    id: int
    author_id: int
    author_email: Optional[str] = None
    likes: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class ForumThreadWithPosts(ForumThreadInDB):
    posts: List[ForumPostInDB] = []
