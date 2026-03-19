"""Auth router — GitHub OAuth via Supabase."""

from __future__ import annotations

import logging

from fastapi import APIRouter, HTTPException, Request, Response
from fastapi.responses import RedirectResponse
from jose import jwt

from app.config import settings

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/github")
async def github_login():
    """Redirect to Supabase GitHub OAuth."""
    auth_url = (
        f"{settings.supabase_url}/auth/v1/authorize"
        f"?provider=github"
        f"&redirect_to={settings.backend_url}/auth/callback"
    )
    return RedirectResponse(url=auth_url)


@router.get("/callback")
async def auth_callback(request: Request):
    """Handle OAuth callback from GitHub via Supabase."""
    # Extract access token from query params or fragment
    access_token = request.query_params.get("access_token")
    refresh_token = request.query_params.get("refresh_token")

    if not access_token:
        # Supabase may redirect with tokens in the fragment
        # In that case, the frontend handles it
        return RedirectResponse(
            url=f"{settings.frontend_url}/build?auth=callback",
        )

    # Create our own JWT for the session
    token = jwt.encode(
        {"access_token": access_token, "refresh_token": refresh_token or ""},
        settings.jwt_secret,
        algorithm="HS256",
    )

    response = RedirectResponse(url=f"{settings.frontend_url}/build")
    response.set_cookie(
        key="brewfolio_session",
        value=token,
        httponly=True,
        secure=False,  # Set True in production
        samesite="lax",
        max_age=86400,
    )
    return response


@router.get("/session")
async def get_session(request: Request):
    """Validate session and return user info."""
    # Check Authorization header
    auth_header = request.headers.get("Authorization", "")
    token = None

    if auth_header.startswith("Bearer "):
        token = auth_header[7:]
    else:
        # Check cookie
        token = request.cookies.get("brewfolio_session")

    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    try:
        from app.services.portfolio_service import supabase
        
        # We can directly query Supabase for the user details based on the provided access_token
        user_response = supabase.auth.get_user(token)
        if not user_response or not user_response.user:
            raise HTTPException(status_code=401, detail="Invalid session")
            
        user = user_response.user
        
        # Safely extract from metadata
        email = user.email or ""
        metadata = user.user_metadata or {}
        username = metadata.get("preferred_username") or metadata.get("user_name") or metadata.get("name") or "User"
            
        return {
            "user": {
                "id": user.id,
                "email": email,
                "username": username,
            }
        }
    except Exception as e:
        logger.error(f"Session error: {e}")
        raise HTTPException(status_code=401, detail="Invalid session")


@router.post("/logout")
async def logout(response: Response):
    """Clear session cookie."""
    response.delete_cookie("brewfolio_session")
    return {"success": True}
