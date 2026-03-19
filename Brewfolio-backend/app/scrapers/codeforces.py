"""Codeforces scraper using the official API."""

from __future__ import annotations

import logging
from typing import Any

from tenacity import retry, stop_after_attempt, wait_exponential

from app.scrapers.base import BaseScraper

logger = logging.getLogger(__name__)

CF_API = "https://codeforces.com/api"


class CodeforceScraper(BaseScraper):
    def is_healthy(self) -> bool:
        return True

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=8))
    async def _get_user_info(self, username: str) -> dict[str, Any]:
        resp = await self.client.get(f"{CF_API}/user.info", params={"handles": username})
        resp.raise_for_status()
        data = resp.json()
        if data.get("status") != "OK" or not data.get("result"):
            return {}
        user = data["result"][0]
        return {
            "rating": user.get("rating", 0),
            "max_rating": user.get("maxRating", 0),
            "rank": user.get("rank", "unrated"),
            "max_rank": user.get("maxRank", "unrated"),
            "avatar_url": user.get("titlePhoto", ""),
            "handle": user.get("handle", username),
        }

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=8))
    async def _get_rating_history(self, username: str) -> list[dict[str, Any]]:
        resp = await self.client.get(f"{CF_API}/user.rating", params={"handle": username})
        resp.raise_for_status()
        data = resp.json()
        if data.get("status") != "OK":
            return []
        contests = data.get("result", [])
        return contests[-10:]  # last 10 contests

    async def scrape(self, username: str) -> dict[str, Any]:
        try:
            user_info = await self._get_user_info(username)
            if not user_info:
                return {}

            rating_history = []
            try:
                rating_history = await self._get_rating_history(username)
            except Exception as e:
                logger.warning(f"CF rating history failed for {username}: {e}")

            return {
                **user_info,
                "contests_count": len(rating_history),
                "recent_contests": [
                    {
                        "contest_name": c.get("contestName", ""),
                        "rank": c.get("rank", 0),
                        "old_rating": c.get("oldRating", 0),
                        "new_rating": c.get("newRating", 0),
                    }
                    for c in rating_history
                ],
            }
        except Exception as e:
            logger.error(f"Codeforces scraper failed for {username}: {e}")
            return {
                "handle": f"{username}",
                "rating": 0,
                "max_rating": 0,
                "rank": "Rate Limited",
                "max_rank": "Rate Limited",
                "avatar_url": "",
                "contests_count": 0,
                "recent_contests": [],
            }
