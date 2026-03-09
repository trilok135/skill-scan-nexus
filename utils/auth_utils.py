from datetime import datetime, timedelta
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from passlib.context import CryptContext

from config import settings
from models.user import TokenData

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Bearer token scheme
security = HTTPBearer()


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (
        expires_delta or timedelta(minutes=settings.JWT_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def decode_token(token: str) -> TokenData:
    try:
        payload = jwt.decode(
            token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM]
        )
        user_id: str = payload.get("sub")
        role: str = payload.get("role")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token payload")
        return TokenData(user_id=user_id, role=role)
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token is invalid or expired",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    """FastAPI dependency — returns the authenticated user dict from Supabase."""
    from database import get_supabase

    token_data = decode_token(credentials.credentials)
    supabase = get_supabase()
    result = supabase.table("users").select("*").eq("id", token_data.user_id).execute()

    if not result.data:
        raise HTTPException(status_code=401, detail="User not found")

    user = result.data[0]
    user.pop("hashed_password", None)
    return user


async def get_current_student(current_user: dict = Depends(get_current_user)) -> dict:
    """Dependency that ensures the caller is a student."""
    if current_user.get("role") != "student":
        raise HTTPException(status_code=403, detail="Students only")
    return current_user


async def get_current_hr(current_user: dict = Depends(get_current_user)) -> dict:
    """Dependency that ensures the caller is an HR user."""
    if current_user.get("role") != "hr":
        raise HTTPException(status_code=403, detail="HR users only")
    return current_user
