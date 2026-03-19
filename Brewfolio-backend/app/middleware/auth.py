"""JWT auth middleware."""

from __future__ import annotations

from fastapi import Request, HTTPException
from jose import jwt, JWTError

from app.config import settings


async def get_current_user(request: Request) -> dict:
    """Extract and validate user from JWT token."""
    auth_header = request.headers.get("Authorization", "")
    token = None

    if auth_header.startswith("Bearer "):
        token = auth_header[7:]
    else:
        token = request.cookies.get("brewfolio_session")

    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=["HS256"])
        return {
            "id": payload.get("sub", "anonymous"),
            "email": payload.get("email", ""),
            "username": payload.get("username", ""),
        }
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
