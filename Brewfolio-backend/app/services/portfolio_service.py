"""Portfolio service for Supabase CRUD operations."""

from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Any, Optional

from supabase import create_client

from app.config import settings

logger = logging.getLogger(__name__)

supabase = create_client(settings.supabase_url, settings.supabase_service_role_key)


async def save_profile(profile_data: dict[str, Any], user_id: str | None = None) -> dict[str, Any]:
    """Save or update a profile in Supabase."""
    data = {
        "name": profile_data.get("name", ""),
        "username": profile_data.get("username", ""),
        "slug": profile_data.get("slug") or profile_data.get("username", ""),
        "headline": profile_data.get("headline", ""),
        "bio": profile_data.get("bio", ""),
        "avatar_url": profile_data.get("avatar_url", ""),
        "location": profile_data.get("location"),
        "email": profile_data.get("email"),
        "links": profile_data.get("links", {}),
        "stats": profile_data.get("stats", {}),
        "projects": profile_data.get("projects", []),
        "skills": profile_data.get("skills", []),
        "competitive": profile_data.get("competitive", []),
        "theme": profile_data.get("theme", "minimal"),
        "accent_color": profile_data.get("accent_color", "violet"),
        "sections_visible": profile_data.get("sections_visible", {}),
        "last_generated_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }

    if user_id:
        data["user_id"] = user_id

    profile_id = profile_data.get("id")

    if profile_id:
        # Update existing
        result = supabase.table("profiles").update(data).eq("id", profile_id).execute()
    else:
        # Insert new
        base_slug = data["slug"] or "user"
        original_slug = base_slug
        counter = 1
        while True:
            existing = await get_profile_by_slug(base_slug)
            if not existing:
                break
            base_slug = f"{original_slug}-{counter}"
            counter += 1
        data["slug"] = base_slug
        result = supabase.table("profiles").insert(data).execute()

    if result.data:
        return result.data[0]
    return data


async def get_profile_by_id(profile_id: str) -> Optional[dict[str, Any]]:
    """Get a profile by its UUID."""
    result = supabase.table("profiles").select("*").eq("id", profile_id).execute()
    if result.data:
        return result.data[0]
    return None


async def get_profile_by_slug(slug: str) -> Optional[dict[str, Any]]:
    """Get a published profile by its slug."""
    result = supabase.table("profiles").select("*").eq("slug", slug).execute()
    if result.data:
        return result.data[0]
    return None


async def publish_profile(profile_id: str) -> Optional[dict[str, Any]]:
    """Mark a profile as published and generate its URL."""
    profile = await get_profile_by_id(profile_id)
    if not profile:
        return None

    slug = profile.get("slug") or profile.get("username", "user")
    published_url = f"https://{slug}.brewfolio.sh"

    # Check if Cloudflare R2 is configured
    if not settings.cf_account_id:
        logger.warning("Cloudflare R2 not configured — returning mock URL")

    result = (
        supabase.table("profiles")
        .update({
            "is_published": True,
            "published_url": published_url,
            "updated_at": datetime.now(timezone.utc).isoformat(),
        })
        .eq("id", profile_id)
        .execute()
    )

    if result.data:
        return result.data[0]
    return profile
