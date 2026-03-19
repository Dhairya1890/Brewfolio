"""CodeChef scraper using HTML parsing."""

from __future__ import annotations

import logging
from typing import Any

from bs4 import BeautifulSoup
from tenacity import retry, stop_after_attempt, wait_exponential

from app.scrapers.base import BaseScraper

logger = logging.getLogger(__name__)


class CodechefScraper(BaseScraper):
    def is_healthy(self) -> bool:
        return True

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=8))
    async def _get_profile_page(self, username: str) -> str:
        resp = await self.client.get(
            f"https://www.codechef.com/users/{username}",
            follow_redirects=True,
        )
        resp.raise_for_status()
        return resp.text

    def _parse_profile(self, html: str) -> dict[str, Any]:
        result: dict[str, Any] = {
            "rating": 0,
            "max_rating": 0,
            "stars": "",
            "global_rank": 0,
            "problems_solved": 0,
        }

        try:
            soup = BeautifulSoup(html, "html.parser")

            # Rating
            rating_el = soup.select_one(".rating-number")
            if rating_el:
                try:
                    result["rating"] = int(rating_el.text.strip())
                except ValueError:
                    pass

            # Stars
            star_el = soup.select_one(".rating-star")
            if star_el:
                result["stars"] = star_el.text.strip()

            # Highest rating
            rating_header = soup.select_one(".rating-header")
            if rating_header:
                small = rating_header.select_one("small")
                if small:
                    text = small.text.strip()
                    # Extract "Highest Rating XXXX"
                    digits = "".join(c for c in text if c.isdigit())
                    if digits:
                        result["max_rating"] = int(digits)

            # Problems solved — look for the section
            problem_sections = soup.select("section.problems-solved h5")
            for h5 in problem_sections:
                text = h5.text.strip().lower()
                if "total" in text:
                    digits = "".join(c for c in text if c.isdigit())
                    if digits:
                        result["problems_solved"] = int(digits)
                        break

        except Exception as e:
            logger.warning(f"CodeChef HTML parsing issue: {e}")

        return result

    async def scrape(self, username: str) -> dict[str, Any]:
        try:
            html = await self._get_profile_page(username)
            return {
                **self._parse_profile(html),
                "handle": username,
            }
        except Exception as e:
            logger.error(f"CodeChef scraper failed for {username}: {e}")
            return {
                "handle": f"{username}",
                "rating": 0,
                "max_rating": 0,
                "stars": "Rate Limited",
                "global_rank": 0,
                "problems_solved": 0,
            }
