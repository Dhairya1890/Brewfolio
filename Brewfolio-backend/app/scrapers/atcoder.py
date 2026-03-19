"""AtCoder scraper using HTML parsing + history JSON endpoint."""

from __future__ import annotations

import logging
from typing import Any

from bs4 import BeautifulSoup
from tenacity import retry, stop_after_attempt, wait_exponential

from app.scrapers.base import BaseScraper

logger = logging.getLogger(__name__)


class AtcoderScraper(BaseScraper):
    def is_healthy(self) -> bool:
        return True

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=8))
    async def _get_profile_page(self, username: str) -> str:
        resp = await self.client.get(f"https://atcoder.jp/users/{username}")
        resp.raise_for_status()
        return resp.text

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=8))
    async def _get_contest_history(self, username: str) -> list[dict[str, Any]]:
        resp = await self.client.get(f"https://atcoder.jp/users/{username}/history/json")
        resp.raise_for_status()
        return resp.json()

    def _parse_profile(self, html: str) -> dict[str, Any]:
        soup = BeautifulSoup(html, "html.parser")
        result: dict[str, Any] = {"rating": 0, "rank": "", "max_rating": 0}

        try:
            # Rating from table row or span
            rating_span = soup.select_one("span.user-rating")
            if rating_span:
                result["rating"] = int(rating_span.text.strip())

            # Try to find rank from the table
            tables = soup.select("table.dl-table")
            for table in tables:
                rows = table.select("tr")
                for row in rows:
                    th = row.select_one("th")
                    td = row.select_one("td")
                    if th and td:
                        label = th.text.strip().lower()
                        value = td.text.strip()
                        if "rank" in label:
                            result["rank"] = value
                        elif "rating" in label and "highest" in label:
                            try:
                                result["max_rating"] = int("".join(c for c in value if c.isdigit()) or "0")
                            except ValueError:
                                pass
        except Exception as e:
            logger.warning(f"AtCoder HTML parsing issue: {e}")

        return result

    async def scrape(self, username: str) -> dict[str, Any]:
        try:
            html = await self._get_profile_page(username)
            profile_data = self._parse_profile(html)

            contest_history = []
            try:
                contest_history = await self._get_contest_history(username)
            except Exception as e:
                logger.warning(f"AtCoder history failed for {username}: {e}")

            # Find highest rating from history
            if contest_history:
                highest = max((c.get("NewRating", 0) for c in contest_history), default=0)
                if highest > profile_data.get("max_rating", 0):
                    profile_data["max_rating"] = highest

            return {
                **profile_data,
                "contests_count": len(contest_history),
                "handle": username,
            }
        except Exception as e:
            logger.error(f"AtCoder scraper failed for {username}: {e}")
            return {
                "handle": f"{username}",
                "rating": 0,
                "max_rating": 0,
                "rank": "Rate Limited",
                "contests_count": 0,
            }
