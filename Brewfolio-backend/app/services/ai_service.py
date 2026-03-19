"""AI content generation service using Google Gemini."""

from __future__ import annotations

import json
import logging

from google import genai
from google.genai import types
from openai import AsyncOpenAI

from app.config import settings
from app.models.profile import RawScrapedData

logger = logging.getLogger(__name__)

# Configure Google Gemini client
client = genai.Client(api_key=settings.gemini_api_key)

# Configure OpenRouter client
or_client = AsyncOpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=settings.openrouter_api_key,
)

# Configure Groq client (OpenAI-compatible)
groq_client = AsyncOpenAI(
    base_url="https://api.groq.com/openai/v1",
    api_key=settings.groq_api_key,
)

SYSTEM_PROMPT = """You are an expert technical writer and developer advocate.
You receive raw data scraped from a developer's coding profiles and transform it
into polished, authentic portfolio content. You never sound like ChatGPT wrote it.
You write like a senior developer with personality — confident but not arrogant.
Always respond with valid JSON only. No markdown, no preamble, no explanation."""


def build_user_prompt(
    raw_data: RawScrapedData, portfolio_type: str, ai_hint: str
) -> str:
    return f"""
Here is the raw developer data:

GITHUB TOP LANGUAGES (Must be included exactly in 'Languages' skill category):
{json.dumps(raw_data.github.get("languages", []), indent=2, default=str)}

GITHUB:
{json.dumps(raw_data.github, indent=2, default=str)}

LEETCODE:
{json.dumps(raw_data.leetcode, indent=2, default=str)}

CODEFORCES:
{json.dumps(raw_data.codeforces, indent=2, default=str)}

PORTFOLIO TYPE: {portfolio_type}
DEVELOPER'S OWN HINT: {ai_hint or "None provided"}

Generate a JSON object with this exact structure:
{{
  "name": "Full name from GitHub or best available",
  "headline": "One punchy line, max 12 words, no buzzwords",
  "bio": "2-3 sentences. First person. Specific to their actual stats and projects.",
  "skills": [
    {{ "category": "Languages", "items": ["Python", "TypeScript"] }},
    {{ "category": "Frameworks", "items": ["FastAPI", "React"] }},
    {{ "category": "Tools", "items": ["Docker", "PostgreSQL"] }}
  ],
  "project_descriptions": {{
    "repo_name": "Improved 1-2 sentence description for this specific project"
  }}
}}

Rules:
- The "Languages" category inside "skills" MUST exactly contain the GITHUB TOP LANGUAGES provided above. Do not hallucinate others.
- Reference their real LeetCode/CF stats in the bio if impressive
- headline must NOT contain: "passionate", "enthusiastic", "developer", "engineer" alone
- bio should feel written by them, not about them
- project_descriptions: only describe repos that have meaningful content
"""


def extract_json_from_response(text: str) -> dict:
    """Helper to try to extract JSON from AI response text."""
    text = text.strip()
    # Strip any accidental markdown fences
    if text.startswith("```"):
        text = text.split("```", 1)[1]
        if text.startswith("json\n"):
            text = text[5:]
        elif text.startswith("json"):
            text = text[4:]
    if text.endswith("```"):
        text = text[: text.rfind("```")]

    try:
        return json.loads(text.strip())
    except Exception as e:
        logger.error(f"Failed to parse JSON: {e} | Raw text: {text}")
        raise e


FALLBACK_MODELS = [
    "meta-llama/llama-3.3-70b-instruct:free",
    "qwen/qwen-2.5-72b-instruct:free",
    "mistralai/mistral-7b-instruct:free",
    "deepseek/deepseek-chat:free",
    "google/gemma-2-9b-it:free",
]

GROQ_MODELS = [
    "llama3-8b-8192",
    "llama-3.3-70b-versatile",
    "llama-3.1-8b-instant",
    "mixtral-8x7b-32768",
    "gemma2-9b-it",
]


async def generate_profile_content(
    raw_data: RawScrapedData,
    portfolio_type: str,
    ai_hint: str,
) -> dict:
    prompt = build_user_prompt(raw_data, portfolio_type, ai_hint)

    # -- 1. Try Groq (Primary, fast and cheap) --
    if settings.groq_api_key:
        for groq_model in GROQ_MODELS:
            try:
                completion = await groq_client.chat.completions.create(
                    model=groq_model,
                    messages=[
                        {"role": "system", "content": SYSTEM_PROMPT},
                        {"role": "user", "content": prompt},
                    ],
                    max_tokens=1500,
                    temperature=0.7,
                )
                if completion.choices:
                    logger.info(
                        f"Successfully generated profile using Groq model: {groq_model}"
                    )
                    return extract_json_from_response(
                        completion.choices[0].message.content or ""
                    )
            except Exception as e:
                err_str = str(e).lower()
                if "429" in err_str or "rate limit" in err_str:
                    logger.warning(
                        f"Groq model {groq_model} rate limited, checking next model..."
                    )
                    continue
                else:
                    logger.error(f"Groq generation failed on {groq_model}: {e}")
                    continue
        logger.warning("All Groq models failed. Falling back to Gemini...")

    # -- 2. Try Gemini (Secondary) --
    try:
        response = client.models.generate_content(
            model="gemini-2.5-pro",
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_PROMPT,
                max_output_tokens=1500,
                temperature=0.7,
            ),
        )
        return extract_json_from_response(response.text)

    except Exception as e:
        error_msg = str(e).lower()
        if (
            "429" in error_msg
            or "quota" in error_msg
            or "exhausted" in error_msg
            or "rate limit" in error_msg
        ):
            logger.warning(
                f"Google API rate limit hit ({e}). Trying OpenRouter fallbacks..."
            )

            for or_model in FALLBACK_MODELS:
                try:
                    completion = await or_client.chat.completions.create(
                        model=or_model,
                        messages=[
                            {"role": "system", "content": SYSTEM_PROMPT},
                            {"role": "user", "content": prompt},
                        ],
                        max_tokens=1500,
                        temperature=0.7,
                    )
                    if completion.choices:
                        logger.info(
                            f"Successfully generated profile using OpenRouter fallback model: {or_model}"
                        )
                        return extract_json_from_response(
                            completion.choices[0].message.content or ""
                        )
                except Exception as fallback_err:
                    err_str = str(fallback_err).lower()
                    if "429" in err_str or "rate limits" in err_str:
                        logger.warning(
                            f"OpenRouter model {or_model} rate limited, trying next..."
                        )
                        continue
                    else:
                        logger.error(
                            f"OpenRouter generation failed on {or_model}: {fallback_err}"
                        )
                        continue

            logger.error(
                "All OpenRouter free fallback models failed (likely due to upstream rate limits)."
            )
        else:
            logger.error(f"Google AI generation failed immediately: {e}")

        # Return a fallback structure
        return {
            "name": (
                raw_data.github.get("name", "Developer")
                if isinstance(raw_data.github, dict)
                else "Developer"
            ),
            "headline": "Building things that matter",
            "bio": "A developer who loves writing code.",
            "skills": [],
            "project_descriptions": {},
        }
