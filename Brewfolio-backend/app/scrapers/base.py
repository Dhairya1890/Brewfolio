from abc import ABC, abstractmethod
from typing import Any

import httpx
from tenacity import retry, stop_after_attempt, wait_exponential


class BaseScraper(ABC):
    """All scrapers inherit from this. Enforces consistent interface."""

    def __init__(self):
        self.client = httpx.AsyncClient(
            timeout=15.0,
            headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"},
        )

    @abstractmethod
    async def scrape(self, username: str) -> dict[str, Any]:
        """Returns raw scraped data. Never raises — returns {} on failure."""
        pass

    @abstractmethod
    def is_healthy(self) -> bool:
        """Returns False if the scraper is known to be broken."""
        pass

    async def __aenter__(self):
        return self

    async def __aexit__(self, *args):
        await self.client.aclose()
