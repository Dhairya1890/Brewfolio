"""AI generation router."""

from __future__ import annotations

import logging
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException

from app.models.profile import (
    DeveloperProfile,
    GenerateRequest,
    Project,
    RawScrapedData,
    RegenerateRequest,
    SkillCategory,
    CompetitiveProfile,
    ProfileLinks,
    ProfileStats,
    SectionsVisible,
)
from app.services import ai_service, cache_service, portfolio_service

logger = logging.getLogger(__name__)
router = APIRouter()


def _build_profile_from_raw_and_ai(
    raw_data: dict,
    ai_output: dict,
    config: GenerateRequest,
) -> DeveloperProfile:
    """Merge raw scraped data + AI content into a full DeveloperProfile."""
    github = raw_data.get("github", {})
    leetcode = raw_data.get("leetcode", {})
    codeforces = raw_data.get("codeforces", {})
    atcoder = raw_data.get("atcoder", {})
    codechef = raw_data.get("codechef", {})

    # Build projects from GitHub repos
    repos = github.get("repos", [])[:6]
    ai_descriptions = ai_output.get("project_descriptions", {})
    projects = [
        Project(
            name=r.get("name", ""),
            description=ai_descriptions.get(r.get("name", ""), r.get("description", "")),
            url=r.get("html_url", ""),
            stars=r.get("stargazers_count", 0),
            forks=r.get("forks_count", 0),
            language=r.get("language", ""),
            topics=r.get("topics", []),
            is_pinned=r.get("is_pinned", False),
        )
        for r in repos
    ]

    # Build skills from AI output
    ai_skills = ai_output.get("skills", [])
    skills = [SkillCategory(category=s.get("category", ""), items=s.get("items", [])) for s in ai_skills]

    # Ensure GitHub top languages are present in "Languages" category
    github_languages = github.get("languages", [])
    if github_languages:
        languages_category = next((s for s in skills if s.category.lower() == "languages"), None)
        if languages_category:
            existing_items = set(item.lower() for item in languages_category.items)
            for lang in github_languages:
                if lang.lower() not in existing_items:
                    languages_category.items.append(lang)
        else:
            skills.insert(0, SkillCategory(category="Languages", items=github_languages))

    # Build competitive profiles
    competitive: list[CompetitiveProfile] = []
    if leetcode:
        competitive.append(CompetitiveProfile(
            platform="leetcode",
            handle=leetcode.get("username", ""),
            rating=leetcode.get("contest_rating", 0),
            rank=str(leetcode.get("global_ranking", "")),
            solved=leetcode.get("solved_total", 0),
        ))
    if codeforces:
        competitive.append(CompetitiveProfile(
            platform="codeforces",
            handle=codeforces.get("handle", ""),
            rating=codeforces.get("rating", 0),
            rank=codeforces.get("rank", ""),
            max_rating=codeforces.get("max_rating"),
            contests_participated=codeforces.get("contests_count", 0),
        ))
    if atcoder and atcoder.get("rating"):
        competitive.append(CompetitiveProfile(
            platform="atcoder",
            handle=atcoder.get("handle", ""),
            rating=atcoder.get("rating", 0),
            rank=atcoder.get("rank", ""),
            max_rating=atcoder.get("max_rating"),
            contests_participated=atcoder.get("contests_count", 0),
        ))
    if codechef and codechef.get("rating"):
        competitive.append(CompetitiveProfile(
            platform="codechef",
            handle=codechef.get("handle", ""),
            rating=codechef.get("rating", 0),
            rank=codechef.get("stars", ""),
        ))

    username = github.get("name", "").split()[0].lower() if github.get("name") else "user"
    github_username = ""
    for repo in repos:
        url = repo.get("html_url", "")
        if "github.com/" in url:
            github_username = url.split("github.com/")[1].split("/")[0]
            break

    return DeveloperProfile(
        name=ai_output.get("name", github.get("name", "Developer")),
        username=github_username or username,
        headline=ai_output.get("headline", ""),
        bio=ai_output.get("bio", ""),
        avatar_url=github.get("avatar_url", ""),
        location=github.get("location"),
        email=github.get("email"),
        links=ProfileLinks(
            github=f"https://github.com/{github_username}" if github_username else None,
        ),
        stats=ProfileStats(
            github_repos=github.get("public_repos", 0),
            github_stars=github.get("total_stars", 0),
            github_contributions=github.get("contributions", 0),
            leetcode_solved=leetcode.get("solved_total", 0),
            leetcode_easy=leetcode.get("solved_easy"),
            leetcode_medium=leetcode.get("solved_medium"),
            leetcode_hard=leetcode.get("solved_hard"),
            leetcode_rating=leetcode.get("contest_rating"),
            cf_rating=codeforces.get("rating"),
            cf_rank=codeforces.get("rank"),
            cf_max_rating=codeforces.get("max_rating"),
        ),
        projects=projects,
        skills=skills,
        competitive=competitive,
        theme=config.theme,
        accent_color=config.accent_color,
        sections_visible=config.features or SectionsVisible(),
        slug=github_username or username,
        last_generated_at=datetime.now(timezone.utc).isoformat(),
    )


@router.post("/generate")
async def generate_profile(req: GenerateRequest):
    """Generate AI content from raw scraped data."""
    # Get raw data from Redis
    raw_data = cache_service.get_raw_data(req.job_id)
    if not raw_data:
        raise HTTPException(status_code=404, detail="Scrape job data not found. Did the scrape complete?")

    # Call AI service
    raw_scraped = RawScrapedData(
        github=raw_data.get("github", {}),
        leetcode=raw_data.get("leetcode", {}),
        codeforces=raw_data.get("codeforces", {}),
        atcoder=raw_data.get("atcoder", {}),
        codechef=raw_data.get("codechef", {}),
    )

    ai_output = await ai_service.generate_profile_content(
        raw_scraped,
        req.portfolio_type,
        req.ai_prompt,
    )

    # Build full profile
    profile = _build_profile_from_raw_and_ai(raw_data, ai_output, req)

    # Save to Supabase
    try:
        saved = await portfolio_service.save_profile(profile.model_dump())
        profile.id = saved.get("id")
        profile.slug = saved.get("slug")
    except Exception as e:
        logger.warning(f"Failed to save to Supabase: {e}")

    # Cache in Redis
    cache_service.set_profile(req.job_id, profile.model_dump())

    return profile


@router.post("/regenerate")
async def regenerate_profile(req: RegenerateRequest):
    """Re-run AI generation with a new prompt."""
    # Get existing profile from Supabase
    existing = await portfolio_service.get_profile_by_id(req.profile_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Profile not found")

    # We need raw data — try Redis first
    # Use a simple fallback: regenerate from existing data
    raw_scraped = RawScrapedData(
        github={"name": existing.get("name", ""), "repos": existing.get("projects", [])},
    )

    ai_output = await ai_service.generate_profile_content(
        raw_scraped, "personal_brand", req.ai_prompt
    )

    # Update profile with new AI content
    existing["headline"] = ai_output.get("headline", existing.get("headline", ""))
    existing["bio"] = ai_output.get("bio", existing.get("bio", ""))
    existing["skills"] = ai_output.get("skills", existing.get("skills", []))
    existing["last_generated_at"] = datetime.now(timezone.utc).isoformat()

    saved = await portfolio_service.save_profile(existing)
    return DeveloperProfile(**saved)
