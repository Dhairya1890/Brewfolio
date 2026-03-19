"""Pydantic v2 models mirroring the TypeScript types."""

from __future__ import annotations

from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict


# ─── Theme / Display Enums ────────────────────────────────────────────

ThemeType = Literal["minimal", "terminal", "magazine", "glassmorphism"]
AccentColor = Literal["violet", "cyan", "pink", "green", "orange", "mono"]
PortfolioType = Literal["job_seeking", "freelance", "open_source", "personal_brand"]
ScrapeStatus = Literal["pending", "scraping", "ai_generating", "complete", "failed"]


# ─── Core Profile Models ──────────────────────────────────────────────


class ProfileLinks(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    github: Optional[str] = None
    leetcode: Optional[str] = None
    codeforces: Optional[str] = None
    atcoder: Optional[str] = None
    codechef: Optional[str] = None
    blog: Optional[str] = None
    linkedin: Optional[str] = None


class ProfileStats(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    github_repos: int = 0
    github_stars: int = 0
    github_contributions: int = 0
    leetcode_solved: int = 0
    leetcode_easy: Optional[int] = None
    leetcode_medium: Optional[int] = None
    leetcode_hard: Optional[int] = None
    leetcode_rating: Optional[float] = None
    cf_rating: Optional[int] = None
    cf_rank: Optional[str] = None
    cf_max_rating: Optional[int] = None


class Project(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    name: str
    description: str = ""
    url: str = ""
    stars: int = 0
    forks: int = 0
    language: str = ""
    topics: list[str] = []
    is_pinned: bool = False


class SkillCategory(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    category: str
    items: list[str] = []


class CompetitiveProfile(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    platform: Literal["codeforces", "leetcode", "atcoder", "codechef"]
    handle: str
    rating: float = 0
    rank: str = ""
    max_rating: Optional[float] = None
    solved: Optional[int] = None
    contests_participated: Optional[int] = None


class SectionsVisible(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    projects: bool = True
    skills: bool = True
    stats: bool = True
    competitive: bool = True
    blog: bool = False
    contact: bool = False


class DeveloperProfile(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    # Identity
    id: Optional[str] = None
    name: str = ""
    username: str = ""
    headline: str = ""
    bio: str = ""
    avatar_url: str = ""
    location: Optional[str] = None
    email: Optional[str] = None
    links: ProfileLinks = ProfileLinks()

    # Data
    stats: ProfileStats = ProfileStats()
    projects: list[Project] = []
    skills: list[SkillCategory] = []
    competitive: list[CompetitiveProfile] = []

    # Theme & display config
    theme: ThemeType = "minimal"
    accent_color: AccentColor = "violet"
    sections_visible: SectionsVisible = SectionsVisible()

    # Meta
    created_at: Optional[str] = None
    last_generated_at: Optional[str] = None
    is_published: Optional[bool] = False
    published_url: Optional[str] = None
    slug: Optional[str] = None


# ─── API Models ────────────────────────────────────────────────────────


class PlatformInputs(BaseModel):
    github: Optional[str] = None
    leetcode: Optional[str] = None
    codeforces: Optional[str] = None
    atcoder: Optional[str] = None
    codechef: Optional[str] = None
    extra_url: Optional[str] = None


class ScrapeJobStatus(BaseModel):
    job_id: str
    status: ScrapeStatus = "pending"
    progress: int = 0
    message: str = ""
    profile: Optional[DeveloperProfile] = None
    error: Optional[str] = None


class PublishResponse(BaseModel):
    success: bool
    url: str
    slug: str


class GenerateRequest(BaseModel):
    job_id: str
    portfolio_type: PortfolioType = "job_seeking"
    ai_prompt: str = ""
    theme: ThemeType = "minimal"
    accent_color: AccentColor = "violet"
    features: Optional[SectionsVisible] = None


class RegenerateRequest(BaseModel):
    profile_id: str
    ai_prompt: str = ""


class RawScrapedData(BaseModel):
    """Container for raw data from all scrapers."""

    github: dict = {}
    leetcode: dict = {}
    codeforces: dict = {}
    atcoder: dict = {}
    codechef: dict = {}
