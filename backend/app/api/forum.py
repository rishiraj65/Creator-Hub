from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.forum import ForumThread, ForumPost
from app.schemas.forum import (
    ForumThreadInDB as ForumThreadSchema, 
    ForumThreadCreate, 
    ForumPostInDB as ForumPostSchema, 
    ForumPostCreate,
    ForumThreadWithPosts
)
from .deps import get_current_user
from app.models.user import User

router = APIRouter()

@router.get("/threads", response_model=List[ForumThreadSchema])
def read_threads(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    threads = db.query(ForumThread).offset(skip).limit(limit).all()
    # Populate author_email for each thread
    for thread in threads:
        thread.author_email = thread.author.email if thread.author else None
    return threads

@router.post("/threads", response_model=ForumThreadSchema)
def create_thread(
    thread_in: ForumThreadCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    db_thread = ForumThread(**thread_in.dict(), author_id=current_user.id)
    db.add(db_thread)
    db.commit()
    db.refresh(db_thread)
    return db_thread

@router.post("/posts/{post_id}/like")
def like_post(
    post_id: int,
    db: Session = Depends(get_db),
) -> Any:
    post = db.query(ForumPost).filter(ForumPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    post.likes += 1
    db.add(post)
    db.commit()
    return {"likes": post.likes}

@router.delete("/threads/{thread_id}")
def delete_thread(
    thread_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    thread = db.query(ForumThread).filter(ForumThread.id == thread_id).first()
    if not thread:
        raise HTTPException(status_code=404, detail="Thread not found")
    
    if thread.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only delete your own discussions")
        
    db.delete(thread)
    db.commit()
    return {"message": "Thread deleted successfully"}

@router.get("/threads/{thread_id}", response_model=ForumThreadWithPosts)
def read_thread(
    thread_id: int,
    db: Session = Depends(get_db),
) -> Any:
    thread = db.query(ForumThread).filter(ForumThread.id == thread_id).first()
    if not thread:
        raise HTTPException(status_code=404, detail="Thread not found")
    thread.author_email = thread.author.email if thread.author else None
    for post in thread.posts:
        post.author_email = post.author.email if post.author else None
    return thread

@router.post("/posts", response_model=ForumPostSchema)
def create_post(
    post_in: ForumPostCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    # Verify thread exists
    thread = db.query(ForumThread).filter(ForumThread.id == post_in.thread_id).first()
    if not thread:
        raise HTTPException(status_code=404, detail="Thread not found")
        
    db_post = ForumPost(**post_in.dict(), author_id=current_user.id)
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    return db_post
