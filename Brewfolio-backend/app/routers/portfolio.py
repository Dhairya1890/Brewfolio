"""Portfolio router — save, publish, get, PDF stub."""

from __future__ import annotations

import logging

from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse

from app.models.profile import DeveloperProfile, PublishResponse
from app.services import cache_service, portfolio_service

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/save")
async def save_portfolio(profile: DeveloperProfile):
    """Save or update a DeveloperProfile in Supabase."""
    try:
        saved = await portfolio_service.save_profile(profile.model_dump())
        return DeveloperProfile(**saved)
    except Exception as e:
        logger.error(f"Failed to save portfolio: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to save: {str(e)}")


@router.post("/publish/{profile_id}")
async def publish_portfolio(profile_id: str):
    """Publish a portfolio and return the public URL."""
    try:
        result = await portfolio_service.publish_profile(profile_id)
        if not result:
            raise HTTPException(status_code=404, detail="Profile not found")

        return PublishResponse(
            success=True,
            url=result.get(
                "published_url", f"https://{result.get('slug', 'user')}.brewfolio.sh"
            ),
            slug=result.get("slug", ""),
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to publish: {e}")
        raise HTTPException(status_code=500, detail=f"Publish failed: {str(e)}")


@router.get("/{slug}")
async def get_portfolio(slug: str):
    """Get a portfolio by slug. Cached in Redis for 5 minutes."""
    # Check cache first
    cached = cache_service.get_cached_portfolio(slug)
    if cached:
        return DeveloperProfile(**cached)

    # Fetch from Supabase
    profile = await portfolio_service.get_profile_by_slug(slug)
    if not profile:
        raise HTTPException(status_code=404, detail="Portfolio not found")

    # Cache it
    cache_service.cache_portfolio(slug, profile)

    return DeveloperProfile(**profile)


@router.get("/pdf/{profile_id}")
async def export_pdf(profile_id: str):
    """PDF export — not implemented for hackathon."""
    return JSONResponse(
        status_code=501,
        content={"detail": "PDF export coming soon"},
    )
