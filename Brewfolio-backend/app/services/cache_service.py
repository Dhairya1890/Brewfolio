"""Upstash Redis cache service for job state and profile caching."""

from __future__ import annotations

import json
import logging
from typing import Any, Optional

from upstash_redis import Redis

from app.config import settings

logger = logging.getLogger(__name__)

redis = Redis(
    url=settings.upstash_redis_rest_url,
    token=settings.upstash_redis_rest_token,
)


def set_job(job_id: str, data: dict[str, Any], ttl: int = 3600) -> None:
    """Store job status in Redis."""
    redis.setex(f"job:{job_id}", ttl, json.dumps(data, default=str))


def get_job(job_id: str) -> Optional[dict[str, Any]]:
    """Retrieve job status from Redis."""
    raw = redis.get(f"job:{job_id}")
    if raw is None:
        return None
    if isinstance(raw, str):
        return json.loads(raw)
    return raw


def set_raw_data(job_id: str, data: dict[str, Any], ttl: int = 86400) -> None:
    """Store raw scraped data in Redis (24hr TTL)."""
    redis.setex(f"raw:{job_id}", ttl, json.dumps(data, default=str))


def get_raw_data(job_id: str) -> Optional[dict[str, Any]]:
    """Retrieve raw scraped data from Redis."""
    raw = redis.get(f"raw:{job_id}")
    if raw is None:
        return None
    if isinstance(raw, str):
        return json.loads(raw)
    return raw


def set_profile(job_id: str, data: dict[str, Any], ttl: int = 86400) -> None:
    """Store generated profile in Redis (24hr TTL)."""
    redis.setex(f"profile:{job_id}", ttl, json.dumps(data, default=str))


def get_profile(job_id: str) -> Optional[dict[str, Any]]:
    """Retrieve generated profile from Redis."""
    raw = redis.get(f"profile:{job_id}")
    if raw is None:
        return None
    if isinstance(raw, str):
        return json.loads(raw)
    return raw


def cache_portfolio(slug: str, data: dict[str, Any], ttl: int = 300) -> None:
    """Cache published portfolio (5 min TTL)."""
    redis.setex(f"portfolio:{slug}", ttl, json.dumps(data, default=str))


def get_cached_portfolio(slug: str) -> Optional[dict[str, Any]]:
    """Get cached portfolio."""
    raw = redis.get(f"portfolio:{slug}")
    if raw is None:
        return None
    if isinstance(raw, str):
        return json.loads(raw)
    return raw
