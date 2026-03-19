"""LeetCode scraper using GraphQL API."""

from __future__ import annotations

import logging
from typing import Any

from tenacity import retry, stop_after_attempt, wait_exponential

from app.scrapers.base import BaseScraper

logger = logging.getLogger(__name__)

LEETCODE_GRAPHQL = "https://leetcode.com/graphql"

USER_PROFILE_QUERY = """
query getUserProfile($username: String!) {
  matchedUser(username: $username) {
    username
    profile { realName, userAvatar, ranking }
    submitStats {
      acSubmissionNum {
        difficulty
        count
      }
    }
    badges { name }
  }
  userContestRanking(username: $username) {
    rating
    globalRanking
    totalParticipants
    topPercentage
  }
}
"""


class LeetcodeScraper(BaseScraper):
    def __init__(self):
        super().__init__()
        self.client.headers.update({
            "Referer": "https://leetcode.com",
            "Content-Type": "application/json",
        })

    def is_healthy(self) -> bool:
        return True

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=8))
    async def _fetch_profile(self, username: str) -> dict[str, Any]:
        resp = await self.client.post(
            LEETCODE_GRAPHQL,
            json={"query": USER_PROFILE_QUERY, "variables": {"username": username}},
        )
        resp.raise_for_status()
        return resp.json()

    async def scrape(self, username: str) -> dict[str, Any]:
        try:
            data = await self._fetch_profile(username)

            matched = data.get("data", {}).get("matchedUser")
            if not matched:
                logger.warning(f"LeetCode user not found: {username}")
                return {}

            # Parse submission stats
            ac_stats = matched.get("submitStats", {}).get("acSubmissionNum", [])
            solved = {"All": 0, "Easy": 0, "Medium": 0, "Hard": 0}
            for stat in ac_stats:
                diff = stat.get("difficulty", "")
                solved[diff] = stat.get("count", 0)

            # Contest ranking
            contest = data.get("data", {}).get("userContestRanking") or {}

            return {
                "username": matched.get("username", username),
                "real_name": matched.get("profile", {}).get("realName", ""),
                "avatar_url": matched.get("profile", {}).get("userAvatar", ""),
                "ranking": matched.get("profile", {}).get("ranking", 0),
                "solved_total": solved["All"],
                "solved_easy": solved["Easy"],
                "solved_medium": solved["Medium"],
                "solved_hard": solved["Hard"],
                "contest_rating": round(contest.get("rating", 0) or 0),
                "global_ranking": contest.get("globalRanking", 0),
                "top_percentage": contest.get("topPercentage", 0),
                "badges": [b.get("name", "") for b in matched.get("badges", [])],
            }
        except Exception as e:
            logger.error(f"LeetCode scraper failed for {username}: {e}")
            return {
                "username": f"{username}",
                "real_name": "API Route Limited",
                "avatar_url": "",
                "ranking": 0,
                "solved_total": 0,
                "solved_easy": 0,
                "solved_medium": 0,
                "solved_hard": 0,
                "contest_rating": 0,
                "global_ranking": 0,
                "top_percentage": 0,
                "badges": ["Rate Limited"],
            }
