"""Scraping router — init jobs and poll status."""

from __future__ import annotations

import asyncio
import logging
import uuid
from typing import Any

from fastapi import APIRouter, BackgroundTasks, HTTPException

from app.models.profile import PlatformInputs, ScrapeJobStatus
from app.scrapers.github import GithubScraper
from app.scrapers.leetcode import LeetcodeScraper
from app.scrapers.codeforces import CodeforceScraper
from app.scrapers.atcoder import AtcoderScraper
from app.scrapers.codechef import CodechefScraper
from app.services import cache_service
from app.config import settings

logger = logging.getLogger(__name__)
router = APIRouter()


async def _run_scrape_job(job_id: str, platforms: PlatformInputs) -> None:
    """Background task that runs all scrapers concurrently."""
    try:
        # Update status: scraping
        cache_service.set_job(
            job_id,
            {
                "job_id": job_id,
                "status": "scraping",
                "progress": 10,
                "message": "Connecting to platforms...",
            },
        )

        tasks: list[tuple[str, Any]] = []

        if platforms.github and platforms.github.strip():
            tasks.append(
                (
                    "github",
                    GithubScraper(github_token=settings.github_token).scrape(
                        platforms.github.strip()
                    ),
                )
            )
        if platforms.leetcode and platforms.leetcode.strip():
            tasks.append(
                ("leetcode", LeetcodeScraper().scrape(platforms.leetcode.strip()))
            )
        if platforms.codeforces and platforms.codeforces.strip():
            tasks.append(
                ("codeforces", CodeforceScraper().scrape(platforms.codeforces.strip()))
            )
        if platforms.atcoder and platforms.atcoder.strip():
            tasks.append(
                ("atcoder", AtcoderScraper().scrape(platforms.atcoder.strip()))
            )
        if platforms.codechef and platforms.codechef.strip():
            tasks.append(
                ("codechef", CodechefScraper().scrape(platforms.codechef.strip()))
            )

        if not tasks:
            cache_service.set_job(
                job_id,
                {
                    "job_id": job_id,
                    "status": "failed",
                    "progress": 0,
                    "message": "No platforms provided",
                    "error": "At least one platform username is required",
                },
            )
            return

        # Run all scrapers concurrently
        results = await asyncio.gather(
            *(t[1] for t in tasks),
            return_exceptions=True,
        )

        raw_data: dict[str, Any] = {}
        any_success = False

        for (platform_name, _), result in zip(tasks, results):
            if isinstance(result, Exception):
                logger.error(f"Scraper {platform_name} failed: {result}")
                raw_data[platform_name] = {}
            else:
                raw_data[platform_name] = result
                if result:  # non-empty dict means success
                    any_success = True

        if not any_success:
            cache_service.set_job(
                job_id,
                {
                    "job_id": job_id,
                    "status": "failed",
                    "progress": 0,
                    "message": "All scrapers failed",
                    "error": "Could not fetch data from any platform",
                },
            )
            return

        # Store raw data
        cache_service.set_raw_data(job_id, raw_data)

        # Update status: complete
        cache_service.set_job(
            job_id,
            {
                "job_id": job_id,
                "status": "complete",
                "progress": 100,
                "message": "Data collected successfully!",
            },
        )

    except Exception as e:
        logger.error(f"Scrape job {job_id} failed: {e}")
        cache_service.set_job(
            job_id,
            {
                "job_id": job_id,
                "status": "failed",
                "progress": 0,
                "message": "An unexpected error occurred",
                "error": str(e),
            },
        )


@router.post("/init")
async def init_scrape(platforms: PlatformInputs, background_tasks: BackgroundTasks):
    """Initialize a scrape job and return job_id immediately."""
    job_id = str(uuid.uuid4())

    # Create initial job entry
    cache_service.set_job(
        job_id,
        {
            "job_id": job_id,
            "status": "pending",
            "progress": 0,
            "message": "Starting...",
        },
    )

    # Fire background task
    background_tasks.add_task(_run_scrape_job, job_id, platforms)

    return {"job_id": job_id}


@router.get("/status/{job_id}")
async def get_scrape_status(job_id: str):
    """Get the status of a scrape job."""
    job = cache_service.get_job(job_id)
    if job is None:
        raise HTTPException(status_code=404, detail="Job not found")
    return ScrapeJobStatus(**job)
