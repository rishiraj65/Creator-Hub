from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from jose import jwt, JWTError

from app.db.session import get_db
from app.models.user import User
from app.schemas.token import TokenData
from app.core.security import SECRET_KEY, ALGORITHM

reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl="/api/auth/login"
)

def get_current_user(
    db: Session = Depends(get_db), token: str = Depends(reusable_oauth2)
) -> User:
    try:
        # Decode Supabase token without verification (we don't have the secret)
        # Email is in the 'email' claim in Supabase JWTs
        payload = jwt.get_unverified_claims(token)
        email = payload.get("email")
        
        if not email:
            raise HTTPException(status_code=403, detail="Invalid token: no email claim")
            
        user = db.query(User).filter(User.email == email).first()
        if not user:
            # First time this Supabase user is visiting, create a local record
            # Extract full name from metadata if available, else use email prefix
            metadata = payload.get("user_metadata", {})
            full_name = metadata.get("full_name") or email.split('@')[0]
            
            user = User(
                email=email,
                full_name=full_name,
                hashed_password="supabase_managed", # No local password needed
                is_active=True
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        return user
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials",
        )
    except Exception as e:
        print(f"Backend Auth Error: {e}")
        raise HTTPException(status_code=403, detail="Internal authentication error")
