"""GitHub scraper using REST + GraphQL APIs."""

from __future__ import annotations

import asyncio
import logging
from typing import Any

from tenacity import retry, stop_after_attempt, wait_exponential

from app.scrapers.base import BaseScraper

logger = logging.getLogger(__name__)

GRAPHQL_URL = "https://api.github.com/graphql"


class GithubScraper(BaseScraper):
    def __init__(self, github_token: str | None = None):
        super().__init__()
        if github_token:
            self.client.headers["Authorization"] = f"token {github_token}"

    def is_healthy(self) -> bool:
        return True

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=8))
    async def _get_user(self, username: str) -> dict[str, Any]:
        resp = await self.client.get(f"https://api.github.com/users/{username}")
        resp.raise_for_status()
        data = resp.json()
        return {
            "name": data.get("name", username),
            "bio": data.get("bio", ""),
            "avatar_url": data.get("avatar_url", ""),
            "location": data.get("location", ""),
            "email": data.get("email", ""),
            "public_repos": data.get("public_repos", 0),
            "followers": data.get("followers", 0),
            "following": data.get("following", 0),
        }

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=8))
    async def _get_repos(self, username: str) -> tuple[list[dict[str, Any]], list[str]]:
        repos = []
        page = 1
        while page <= 3:  # max 3 pages = 90 repos
            resp = await self.client.get(
                f"https://api.github.com/users/{username}/repos",
                params={"sort": "stars", "direction": "desc", "per_page": 30, "page": page},
            )
            resp.raise_for_status()
            batch = resp.json()
            if not batch:
                break
            repos.extend(batch)
            page += 1

        # Filter forks, sort by stars, take top 20
        non_forks = [r for r in repos if not r.get("fork", False)]
        non_forks.sort(key=lambda r: r.get("stargazers_count", 0), reverse=True)

        from collections import Counter
        lang_counts = Counter()
        for r in non_forks:
            lang = r.get("language")
            if lang:
                lang_counts[lang] += 1
        top_languages = [lang for lang, count in lang_counts.most_common(10)]

        top_repos = [
            {
                "name": r.get("name", ""),
                "description": r.get("description", "") or "",
                "html_url": r.get("html_url", ""),
                "stargazers_count": r.get("stargazers_count", 0),
                "forks_count": r.get("forks_count", 0),
                "language": r.get("language", "") or "",
                "topics": r.get("topics", []),
                "is_fork": r.get("fork", False),
            }
            for r in non_forks[:20]
        ]
        return top_repos, top_languages

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=8))
    async def _get_pinned_repos(self, username: str) -> list[str]:
        """Get pinned repo names via GraphQL."""
        if "Authorization" not in self.client.headers:
            return []

        query = """
        query($username: String!) {
          user(login: $username) {
            pinnedItems(first: 6, types: REPOSITORY) {
              nodes {
                ... on Repository { name }
              }
            }
          }
        }
        """
        try:
            resp = await self.client.post(
                GRAPHQL_URL,
                json={"query": query, "variables": {"username": username}},
            )
            resp.raise_for_status()
            data = resp.json()
            nodes = data.get("data", {}).get("user", {}).get("pinnedItems", {}).get("nodes", [])
            return [n["name"] for n in nodes if n and "name" in n]
        except Exception as e:
            logger.warning(f"Failed to get pinned repos for {username}: {e}")
            return []

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=8))
    async def _get_contribution_stats(self, username: str) -> int:
        """Get contributions in last year via GraphQL."""
        if "Authorization" not in self.client.headers:
            return 0

        query = """
        query($username: String!) {
          user(login: $username) {
            contributionsCollection {
              contributionCalendar {
                totalContributions
              }
            }
          }
        }
        """
        try:
            resp = await self.client.post(
                GRAPHQL_URL,
                json={"query": query, "variables": {"username": username}},
            )
            resp.raise_for_status()
            data = resp.json()
            return (
                data.get("data", {})
                .get("user", {})
                .get("contributionsCollection", {})
                .get("contributionCalendar", {})
                .get("totalContributions", 0)
            )
        except Exception as e:
            logger.warning(f"Failed to get contributions for {username}: {e}")
            return 0

    async def scrape(self, username: str) -> dict[str, Any]:
        try:
            user_task = self._get_user(username)
            repos_task = self._get_repos(username)
            pinned_task = self._get_pinned_repos(username)
            contrib_task = self._get_contribution_stats(username)

            results = await asyncio.gather(
                user_task, repos_task, pinned_task, contrib_task,
                return_exceptions=True,
            )

            user_data = results[0] if not isinstance(results[0], Exception) else {
                "name": username,
                "bio": "GitHub API Route Limited. Please try again later or add a token.",
                "avatar_url": f"https://github.com/{username}.png",
                "public_repos": 1,
            }
            if not isinstance(results[1], Exception):
                repos_data, languages = results[1]
            else:
                repos_data = [
                    {
                        "name": f"{username}/rate-limited-fallback",
                        "description": "Could not fetch repos due to GitHub API rate limiting. This is a placeholder.",
                        "html_url": f"https://github.com/{username}",
                        "stargazers_count": 0,
                        "forks_count": 0,
                        "language": "Python",
                        "topics": ["rate-limited"],
                        "is_fork": False
                    }
                ]
                languages = []
            pinned_names = results[2] if not isinstance(results[2], Exception) else []
            contributions = results[3] if not isinstance(results[3], Exception) else 0

            # Mark pinned repos
            for repo in repos_data:
                repo["is_pinned"] = repo["name"] in pinned_names

            # Compute total stars
            total_stars = sum(r.get("stargazers_count", 0) for r in repos_data)

            return {
                **user_data,
                "repos": repos_data,
                "pinned_names": pinned_names,
                "total_stars": total_stars,
                "contributions": contributions,
                "languages": languages,
            }
        except Exception as e:
            logger.error(f"GitHub scraper failed for {username}: {e}")
            return {}
