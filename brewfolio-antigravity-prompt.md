# Brewfolio — Antigravity Build Prompt
## Backend + Theme System + Frontend Wiring

---

## BEFORE YOU WRITE A SINGLE LINE OF CODE

Read and internalize this entire prompt first. Then:

1. Run `find . -not -path '*/node_modules/*' -not -path '*/.git/*' | sort` to see the full repo
2. Read `Brewfolio-frontend/src/pages/Build.tsx` completely
3. Read `Brewfolio-frontend/src/components/builder/StepConnect.tsx`
4. Read `Brewfolio-frontend/src/components/builder/StepCustomize.tsx`
5. Read `Brewfolio-frontend/src/components/builder/StepPreview.tsx`
6. Read `Brewfolio-frontend/src/App.tsx` and `Brewfolio-frontend/package.json`

Only after reading all 6 files, begin building. This is non-negotiable — the frontend is fully built with no backend wiring yet, and you must understand it completely before touching anything.

---

## PROJECT OVERVIEW

**Brewfolio** is an AI-powered developer portfolio generator. Users connect their coding profiles (GitHub, LeetCode, Codeforces, AtCoder, CodeChef), the backend scrapes their data, Claude AI writes their bio and project descriptions, and the system generates a live portfolio website in one of 4 visual themes.

**Current state of the repo:**
- `Brewfolio-frontend/` — fully built React + Vite + TypeScript + Tailwind + Shadcn/UI frontend. ALL UI IS MOCK DATA. Zero real API calls exist. No types file exists.
- No backend exists yet.

**What you are building:**
1. `Brewfolio-backend/` — FastAPI Python backend (new folder at repo root level)
2. `Brewfolio-frontend/src/types/index.ts` — shared TypeScript type definitions
3. `Brewfolio-frontend/src/lib/api.ts` — API client layer
4. `Brewfolio-frontend/src/themes/` — 4 React portfolio theme components
5. Wire all API calls from existing frontend components to the real backend

---

## MONOREPO STRUCTURE (target state)

```
/                                    ← repo root
├── Brewfolio-frontend/              ← EXISTS, do not restructure
│   ├── src/
│   │   ├── types/
│   │   │   └── index.ts             ← CREATE: shared type definitions
│   │   ├── lib/
│   │   │   ├── utils.ts             ← EXISTS, do not touch
│   │   │   └── api.ts               ← CREATE: API client
│   │   ├── themes/                  ← CREATE: all 4 theme components
│   │   │   ├── MinimalTheme.tsx
│   │   │   ├── TerminalTheme.tsx
│   │   │   ├── MagazineTheme.tsx
│   │   │   ├── GlassmorphismTheme.tsx
│   │   │   └── index.ts
│   │   └── components/builder/      ← EXISTS, wire API calls into these
└── Brewfolio-backend/               ← CREATE: entire backend
    ├── main.py
    ├── requirements.txt
    ├── .env.example
    ├── app/
    │   ├── __init__.py
    │   ├── config.py
    │   ├── models/
    │   │   ├── __init__.py
    │   │   ├── profile.py           ← Pydantic models
    │   │   └── requests.py
    │   ├── routers/
    │   │   ├── __init__.py
    │   │   ├── auth.py
    │   │   ├── scrape.py
    │   │   ├── ai.py
    │   │   └── portfolio.py
    │   ├── scrapers/
    │   │   ├── __init__.py
    │   │   ├── base.py
    │   │   ├── github.py
    │   │   ├── leetcode.py
    │   │   ├── codeforces.py
    │   │   ├── atcoder.py
    │   │   └── codechef.py
    │   ├── services/
    │   │   ├── __init__.py
    │   │   ├── ai_service.py
    │   │   ├── portfolio_service.py
    │   │   └── cache_service.py
    │   └── middleware/
    │       ├── __init__.py
    │       └── auth.py
    └── tests/
        ├── __init__.py
        ├── test_scrapers.py
        └── test_api.py
```

---

## PART 1 — SHARED TYPE DEFINITIONS

### Create `Brewfolio-frontend/src/types/index.ts`

```typescript
// ─── Core Profile Types ───────────────────────────────────────────────

export interface ProfileLinks {
  github?: string
  leetcode?: string
  codeforces?: string
  atcoder?: string
  codechef?: string
  blog?: string
  linkedin?: string
}

export interface ProfileStats {
  github_repos: number
  github_stars: number
  github_contributions: number
  leetcode_solved: number
  leetcode_easy?: number
  leetcode_medium?: number
  leetcode_hard?: number
  leetcode_rating?: number
  cf_rating?: number
  cf_rank?: string
  cf_max_rating?: number
}

export interface Project {
  name: string
  description: string           // AI-improved description
  url: string
  stars: number
  forks: number
  language: string
  topics: string[]
  is_pinned: boolean
}

export interface SkillCategory {
  category: string              // "Languages", "Frameworks", "Tools", etc.
  items: string[]
}

export interface CompetitiveProfile {
  platform: 'codeforces' | 'leetcode' | 'atcoder' | 'codechef'
  handle: string
  rating: number
  rank: string
  max_rating?: number
  solved?: number
  contests_participated?: number
}

export interface DeveloperProfile {
  // Identity
  id?: string
  name: string
  username: string
  headline: string              // AI-generated one-liner
  bio: string                   // AI-generated 2-3 sentence bio
  avatar_url: string
  location?: string
  email?: string
  links: ProfileLinks

  // Data
  stats: ProfileStats
  projects: Project[]           // max 6, sorted by stars
  skills: SkillCategory[]
  competitive: CompetitiveProfile[]

  // Theme & display config
  theme: ThemeType
  accent_color: AccentColor
  sections_visible: SectionsVisible

  // Meta
  created_at?: string
  last_generated_at?: string
  is_published?: boolean
  published_url?: string
  slug?: string
}

// ─── Theme Types ──────────────────────────────────────────────────────

export type ThemeType = 'minimal' | 'terminal' | 'magazine' | 'glassmorphism'

export type AccentColor =
  | 'violet'    // #7C3AED
  | 'cyan'      // #06B6D4
  | 'pink'      // #EC4899
  | 'green'     // #10B981
  | 'orange'    // #F59E0B
  | 'mono'      // #6B7280

export interface SectionsVisible {
  projects: boolean
  skills: boolean
  stats: boolean
  competitive: boolean
  blog: boolean
  contact: boolean
}

// ─── API Types ────────────────────────────────────────────────────────

export interface PlatformInputs {
  github?: string
  leetcode?: string
  codeforces?: string
  atcoder?: string
  codechef?: string
  extra_url?: string
}

export interface ScrapeJobStatus {
  job_id: string
  status: 'pending' | 'scraping' | 'ai_generating' | 'complete' | 'failed'
  progress: number              // 0–100
  message: string               // human-readable status message
  profile?: DeveloperProfile    // populated when status === 'complete'
  error?: string
}

export interface PublishResponse {
  success: boolean
  url: string                   // e.g. "https://username.brewfolio.sh"
  slug: string
}

export type PortfolioType = 'job_seeking' | 'freelance' | 'open_source' | 'personal_brand'

export interface BuilderState {
  step: 1 | 2 | 3
  platforms: PlatformInputs
  portfolio_type: PortfolioType
  features: Partial<SectionsVisible>
  theme: ThemeType
  accent_color: AccentColor
  ai_prompt: string
  job_id?: string
  profile?: DeveloperProfile
}
```

---

## PART 2 — API CLIENT

### Create `Brewfolio-frontend/src/lib/api.ts`

```typescript
import type {
  PlatformInputs,
  ScrapeJobStatus,
  DeveloperProfile,
  PublishResponse,
  BuilderState
} from '@/types'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('brewfolio_token')
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  })
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: 'Unknown error' }))
    throw new Error(error.detail ?? `HTTP ${res.status}`)
  }
  return res.json()
}

// ─── Auth ─────────────────────────────────────────────────────────────
export const auth = {
  githubLogin: () => {
    window.location.href = `${BASE_URL}/auth/github`
  },
  logout: async () => {
    await request('/auth/logout', { method: 'POST' })
    localStorage.removeItem('brewfolio_token')
  },
  getSession: () => request<{ user: { id: string; email: string; username: string } }>('/auth/session'),
}

// ─── Scraper ──────────────────────────────────────────────────────────
export const scraper = {
  initJob: (platforms: PlatformInputs) =>
    request<{ job_id: string }>('/scrape/init', {
      method: 'POST',
      body: JSON.stringify(platforms),
    }),

  getStatus: (jobId: string) =>
    request<ScrapeJobStatus>(`/scrape/status/${jobId}`),

  // Poll until complete or failed — returns a promise that resolves with the final status
  pollUntilDone: (
    jobId: string,
    onProgress: (status: ScrapeJobStatus) => void,
    intervalMs = 2000
  ): Promise<ScrapeJobStatus> => {
    return new Promise((resolve, reject) => {
      const interval = setInterval(async () => {
        try {
          const status = await scraper.getStatus(jobId)
          onProgress(status)
          if (status.status === 'complete' || status.status === 'failed') {
            clearInterval(interval)
            status.status === 'failed'
              ? reject(new Error(status.error))
              : resolve(status)
          }
        } catch (e) {
          clearInterval(interval)
          reject(e)
        }
      }, intervalMs)
    })
  },
}

// ─── AI ───────────────────────────────────────────────────────────────
export const ai = {
  generate: (jobId: string, config: Pick<BuilderState, 'portfolio_type' | 'ai_prompt' | 'theme' | 'accent_color' | 'features'>) =>
    request<DeveloperProfile>('/ai/generate', {
      method: 'POST',
      body: JSON.stringify({ job_id: jobId, ...config }),
    }),

  regenerate: (profileId: string, ai_prompt: string) =>
    request<DeveloperProfile>('/ai/regenerate', {
      method: 'POST',
      body: JSON.stringify({ profile_id: profileId, ai_prompt }),
    }),
}

// ─── Portfolio ────────────────────────────────────────────────────────
export const portfolio = {
  save: (profile: DeveloperProfile) =>
    request<DeveloperProfile>('/portfolio/save', {
      method: 'POST',
      body: JSON.stringify(profile),
    }),

  publish: (profileId: string) =>
    request<PublishResponse>(`/portfolio/publish/${profileId}`, {
      method: 'POST',
    }),

  get: (slug: string) =>
    request<DeveloperProfile>(`/portfolio/${slug}`),

  exportPdf: (profileId: string) =>
    `${BASE_URL}/portfolio/pdf/${profileId}`,
}
```

---

## PART 3 — FASTAPI BACKEND

### `Brewfolio-backend/requirements.txt`

```
fastapi==0.115.0
uvicorn[standard]==0.30.6
httpx==0.27.2
beautifulsoup4==4.12.3
lxml==5.3.0
anthropic==0.34.2
supabase==2.7.4
python-jose[cryptography]==3.3.0
python-dotenv==1.0.1
pydantic==2.9.2
pydantic-settings==2.5.2
redis==5.1.0
upstash-redis==1.1.0
tenacity==9.0.0
pytest==8.3.3
pytest-asyncio==0.24.0
httpx[testing]
```

---

### `Brewfolio-backend/.env.example`

```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Anthropic
ANTHROPIC_API_KEY=sk-ant-...

# Upstash Redis
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token

# App
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:8000
JWT_SECRET=your-secret-minimum-32-chars

# Cloudflare (for publishing)
CF_ACCOUNT_ID=your-account-id
CF_R2_BUCKET=brewfolio-portfolios
CF_R2_ACCESS_KEY=your-key
CF_R2_SECRET_KEY=your-secret
```

---

### `Brewfolio-backend/app/config.py`

```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    supabase_url: str
    supabase_anon_key: str
    supabase_service_role_key: str
    anthropic_api_key: str
    upstash_redis_rest_url: str
    upstash_redis_rest_token: str
    frontend_url: str = "http://localhost:5173"
    backend_url: str = "http://localhost:8000"
    jwt_secret: str
    cf_account_id: str = ""
    cf_r2_bucket: str = "brewfolio-portfolios"
    cf_r2_access_key: str = ""
    cf_r2_secret_key: str = ""

    class Config:
        env_file = ".env"

settings = Settings()
```

---

### `Brewfolio-backend/app/models/profile.py`

Build a complete Pydantic v2 model that **exactly mirrors** the TypeScript types defined in Part 1. Every field, every optional, every enum. Use `model_config = ConfigDict(from_attributes=True)`.

Key models to create:
- `ProfileLinks`
- `ProfileStats`
- `Project`
- `SkillCategory`
- `CompetitiveProfile`
- `DeveloperProfile`
- `ScrapeJobStatus`
- `PlatformInputs`
- `PublishResponse`
- `GenerateRequest`

Use Python `Literal` types for enums (`ThemeType`, `AccentColor`, `PortfolioStatus`).

---

### `Brewfolio-backend/app/scrapers/base.py`

```python
from abc import ABC, abstractmethod
from typing import Any
import httpx
from tenacity import retry, stop_after_attempt, wait_exponential

class BaseScraper(ABC):
    """All scrapers inherit from this. Enforces consistent interface."""

    def __init__(self):
        self.client = httpx.AsyncClient(
            timeout=15.0,
            headers={"User-Agent": "Brewfolio/1.0 (portfolio-generator)"}
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
```

---

### `Brewfolio-backend/app/scrapers/github.py`

Implement `GithubScraper(BaseScraper)`:

- Base URL: `https://api.github.com`
- If `github_token` is provided in constructor, add `Authorization: token {github_token}` header
- Methods to implement:
  - `get_user(username)` → name, bio, avatar_url, location, public_repos, followers, following
  - `get_repos(username)` → list of repos sorted by stars, max 20, include: name, description, html_url, stargazers_count, forks_count, language, topics, fork (exclude forks from top repos)
  - `get_pinned_repos(username)` → use GitHub GraphQL API `https://api.github.com/graphql` with query for pinnedItems. Mark these as `is_pinned: true`
  - `get_contribution_stats(username)` → contributions in last year via GraphQL contributionsCollection
  - `scrape(username)` → calls all above concurrently with `asyncio.gather()`, merges results
- Wrap every HTTP call with `@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=8))`
- On any exception, log the error and return partial data — never crash the whole job

---

### `Brewfolio-backend/app/scrapers/leetcode.py`

Implement `LeetcodeScraper(BaseScraper)`:

- Endpoint: `POST https://leetcode.com/graphql`
- Headers required: `Referer: https://leetcode.com`, `Content-Type: application/json`
- GraphQL query to fetch:
  ```graphql
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
  ```
- Parse `acSubmissionNum` into easy/medium/hard/total counts
- `scrape(username)` returns: `{ solved_total, solved_easy, solved_medium, solved_hard, contest_rating, global_ranking, badges }`
- This endpoint is flaky — use retry with `wait_exponential`, and if it fails after 3 attempts return `{}` silently

---

### `Brewfolio-backend/app/scrapers/codeforces.py`

Implement `CodeforceScraper(BaseScraper)`:

- Official API: `https://codeforces.com/api/`
- Endpoints:
  - `user.info?handles={username}` → rating, maxRating, rank, maxRank, avatar
  - `user.rating?handle={username}` → last 10 contest results for rating history
  - `user.status?handle={username}&from=1&count=10` → recent submissions
- `scrape(username)` returns: `{ rating, max_rating, rank, max_rank, avatar_url, contests_count, recent_contests }`

---

### `Brewfolio-backend/app/scrapers/atcoder.py`

Implement `AtcoderScraper(BaseScraper)`:

- No official API — scrape HTML from `https://atcoder.jp/users/{username}`
- Use `BeautifulSoup(response.text, 'lxml')`
- Parse: rating (from `.user-rating` span), rank, handle, avatar
- From `https://atcoder.jp/users/{username}/history/json` → list of contest results, get count and highest rating
- `is_healthy()` returns `True` by default but log a warning if the HTML structure changes
- `scrape(username)` returns: `{ rating, max_rating, rank, contests_count }`

---

### `Brewfolio-backend/app/scrapers/codechef.py`

Implement `CodechefScraper(BaseScraper)`:

- No official API — scrape `https://www.codechef.com/users/{username}`
- Parse: current rating, highest rating, stars (from `.rating-star` or similar), global rank, country rank
- Use BeautifulSoup + lxml
- This scraper is the most fragile — wrap everything in broad try/except
- `scrape(username)` returns: `{ rating, max_rating, stars, global_rank, problems_solved }`

---

### `Brewfolio-backend/app/services/ai_service.py`

```python
import anthropic
from app.config import settings
from app.models.profile import DeveloperProfile, RawScrapedData

client = anthropic.Anthropic(api_key=settings.anthropic_api_key)

SYSTEM_PROMPT = """You are an expert technical writer and developer advocate.
You receive raw data scraped from a developer's coding profiles and transform it
into polished, authentic portfolio content. You never sound like ChatGPT wrote it.
You write like a senior developer with personality — confident but not arrogant.
Always respond with valid JSON only. No markdown, no preamble, no explanation."""

def build_user_prompt(raw_data: RawScrapedData, portfolio_type: str, ai_hint: str) -> str:
    return f"""
Here is the raw developer data:

GITHUB:
{raw_data.github}

LEETCODE:
{raw_data.leetcode}

CODEFORCES:
{raw_data.codeforces}

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
- Use their ACTUAL languages from GitHub repos, not generic lists
- Reference their real LeetCode/CF stats in the bio if impressive
- headline must NOT contain: "passionate", "enthusiastic", "developer", "engineer" alone
- bio should feel written by them, not about them
- project_descriptions: only describe repos that have meaningful content
"""

async def generate_profile_content(
    raw_data: RawScrapedData,
    portfolio_type: str,
    ai_hint: str
) -> dict:
    message = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=1500,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": build_user_prompt(raw_data, portfolio_type, ai_hint)}]
    )
    import json
    text = message.content[0].text.strip()
    # Strip any accidental markdown fences
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
    return json.loads(text)
```

---

### `Brewfolio-backend/app/routers/scrape.py`

Implement these endpoints:

**`POST /scrape/init`**
- Body: `PlatformInputs` (github, leetcode, etc.)
- Creates a job entry in Upstash Redis: `job:{job_id}` = `{ status: "pending", progress: 0, message: "Starting..." }`
- Fires off a background task using FastAPI's `BackgroundTasks` that:
  1. Sets status → `"scraping"`, progress `10`, message `"Connecting to platforms..."`
  2. Runs all provided scrapers concurrently with `asyncio.gather()` — skip platforms with empty username
  3. Updates progress to `60`, message `"Processing your data..."`
  4. Stores raw results in Redis as `raw:{job_id}`
  5. Sets status → `"complete"`, progress `100`
- Returns: `{ "job_id": "uuid4" }`

**`GET /scrape/status/{job_id}`**
- Reads from Redis
- Returns `ScrapeJobStatus`
- If job_id not found: 404

**Error handling:** If any individual scraper fails, the job continues with partial data. Only fail the whole job if ALL scrapers fail.

---

### `Brewfolio-backend/app/routers/ai.py`

**`POST /ai/generate`**
- Body: `{ job_id, portfolio_type, ai_prompt, theme, accent_color, features }`
- Reads raw scraped data from Redis at `raw:{job_id}`
- Calls `ai_service.generate_profile_content()`
- Merges AI output with raw scraped data into a full `DeveloperProfile`
- Saves profile to Supabase `profiles` table
- Stores AI-generated profile in Redis at `profile:{job_id}` with 24hr TTL
- Returns: full `DeveloperProfile`

**`POST /ai/regenerate`**
- Body: `{ profile_id, ai_prompt }`
- Reads existing profile from Supabase
- Re-runs AI generation with new prompt
- Updates Supabase record, updates Redis cache
- Returns: updated `DeveloperProfile`

---

### `Brewfolio-backend/app/routers/auth.py`

**`GET /auth/github`**
- Redirects to GitHub OAuth URL with your app's client_id
- Use Supabase Auth's OAuth flow: redirect to `supabase.auth.sign_in_with_oauth(provider="github")`

**`GET /auth/callback`**
- Handles OAuth callback from GitHub
- Extracts session from Supabase
- Stores JWT in httpOnly cookie
- Redirects to `{FRONTEND_URL}/build`

**`GET /auth/session`**
- Validates JWT from Authorization header OR cookie
- Returns user info if valid, 401 if not

**`POST /auth/logout`**
- Clears session cookie
- Returns 200

---

### `Brewfolio-backend/app/routers/portfolio.py`

**`POST /portfolio/save`**
- Saves/updates `DeveloperProfile` in Supabase `profiles` table
- Returns saved profile with generated `id`

**`POST /portfolio/publish/{profile_id}`**
- Reads profile from Supabase
- Renders portfolio HTML using a Jinja2 template that imports the correct theme
- Uploads `{username}/index.html` to Cloudflare R2
- Updates Supabase record: `is_published=True`, `published_url`
- Returns: `PublishResponse`

**`GET /portfolio/{slug}`**
- Reads profile by slug from Supabase
- Returns `DeveloperProfile`
- Cache in Redis for 5 minutes

**`GET /portfolio/pdf/{profile_id}`**
- Note: For hackathon, return a 501 with message "PDF export coming soon" — do NOT attempt to implement Puppeteer in this session

---

### `Brewfolio-backend/main.py`

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import auth, scrape, ai, portfolio

app = FastAPI(title="Brewfolio API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(scrape.router, prefix="/scrape", tags=["scrape"])
app.include_router(ai.router, prefix="/ai", tags=["ai"])
app.include_router(portfolio.router, prefix="/portfolio", tags=["portfolio"])

@app.get("/health")
async def health():
    return {"status": "ok", "service": "brewfolio-api"}
```

---

## PART 4 — THEME COMPONENTS

All themes live in `Brewfolio-frontend/src/themes/`. Every theme:
- Accepts exactly one prop: `profile: DeveloperProfile`
- Is a full-page React component (no layout wrapper needed — it IS the page)
- Uses only the Neural Forge CSS variables already in `index.css` + its own overrides
- Respects `profile.sections_visible` to show/hide sections
- Respects `profile.accent_color` — map it to the correct hex and apply as `--theme-accent`
- Is fully responsive (mobile-first)
- Uses Framer Motion for entrance animations (the same `framer-motion` already in package.json)

### Accent color map (use in all themes):
```typescript
const ACCENT_COLORS = {
  violet:  '#7C3AED',
  cyan:    '#06B6D4',
  pink:    '#EC4899',
  green:   '#10B981',
  orange:  '#F59E0B',
  mono:    '#6B7280',
}
```

---

### Theme 1: MinimalTheme.tsx

**Philosophy:** Radical whitespace. Typography-first. The developer's name is the hero.

**Layout:**
```
─────────────────────────────────────
  [Avatar 80px]  Name (Syne 56px bold)
                 Headline (DM Sans 20px muted)
                 [Links row — icon only]
─────────────────────────────────────
  Bio (DM Sans 18px, max-width 600px, centered)
─────────────────────────────────────
  Stats row: 4 numbers, large, centered
  [Repos] [Stars] [LeetCode] [CF Rating]
─────────────────────────────────────
  Projects grid (2 col desktop, 1 col mobile)
  Clean cards: name + description + language dot + stars
─────────────────────────────────────
  Skills: flat tag list, no categories shown
─────────────────────────────────────
  Competitive: simple 2-col table
─────────────────────────────────────
```

**Colors:** bg `#08080F`, cards `#0F0F1A`, text `#F0EEFF`. Accent color used only on: link hover underlines, stat numbers, active skill tags. Everything else is monochrome.

**Animation:** On mount, elements stagger up with `y: 20 → 0, opacity: 0 → 1`, 0.08s delay increments.

---

### Theme 2: TerminalTheme.tsx

**Philosophy:** Everything looks like a CLI session. No rounded corners. Monospace everything.

**Layout:** Single column, full width. Everything rendered as terminal output:

```
┌─────────────────────────────────────────────────────┐
│  brewfolio ~ $ whoami                                │
│                                                      │
│  > name:      John Doe                               │
│  > handle:    johndoe                                │
│  > location:  Mumbai, IN                             │
│  > bio:       [AI generated bio text]                │
│                                                      │
│  brewfolio ~ $ cat skills.txt                        │
│                                                      │
│  Languages:   Python  TypeScript  Go                 │
│  Frameworks:  FastAPI  React  gRPC                   │
│  Tools:       Docker  K8s  PostgreSQL                │
│                                                      │
│  brewfolio ~ $ ls projects/                          │
│                                                      │
│  [project-name/]  ★42  Python                        │
│  └── description text                                │
│                                                      │
│  brewfolio ~ $ cat stats.json                        │
│  { "github_repos": 34, "leetcode_solved": 312 ... }  │
└─────────────────────────────────────────────────────┘
```

**Colors:** bg true `#0A0A0A`, ALL text `#00FF41` (matrix green) at various opacities. Prompt symbol `>` and `$` in accent color. Borders are `1px dashed rgba(0,255,65,0.3)`. `border-radius: 0` everywhere.

**Font:** 100% JetBrains Mono. No other font.

**Animation:** Each line "types in" sequentially on mount — not character by character (too slow), but line by line with 0.06s stagger. Use `opacity: 0 → 1` + `x: -8 → 0`.

**Special details:**
- Blinking cursor `_` after the last prompt line using CSS animation
- Section headers are `brewfolio ~ $ {command}` style
- Stats are rendered as a JSON object literal
- Projects are rendered as `ls -la` style directory listing

---

### Theme 3: MagazineTheme.tsx

**Philosophy:** Editorial. Bold. Asymmetric. Feels like a Wired or Verge feature article.

**Layout:**
```
┌──────────────────────────────────────────────────────┐
│  [LARGE NAME — Syne 96px, breaks across 2 lines]      │
│  ─────────────────────────── [Avatar 200px, right]    │
│  [Accent color bar, full width, 4px]                  │
├──────────────────────────────────────────────────────┤
│  [Bio — large pull quote style, Syne italic 24px]     │
├──────────────┬───────────────────────────────────────┤
│  STATS       │  SKILLS                               │
│  (2×2 grid   │  Bold category headers                │
│  big numbers)│  Items as comma-separated text        │
├──────────────┴───────────────────────────────────────┤
│  PROJECTS — Featured (first project, full width)      │
│  [Project name large] [Stars] [Language]              │
│  [Description]                                        │
│  ─────────────────────────────────────────────────── │
│  Remaining projects in 3-col grid                     │
├──────────────────────────────────────────────────────┤
│  COMPETITIVE — Side-by-side platform cards            │
└──────────────────────────────────────────────────────┘
```

**Colors:** bg `#0E0E14` (slightly warmer), surface `#141420`. The accent color is used as a bold left-border stripe (`border-left: 6px solid var(--theme-accent)`) on section headers and the featured project card. Large typography creates visual weight.

**Typography:** Syne for ALL headings (name, section titles, featured project name). DM Sans for body text. This creates editorial contrast.

**Animation:** Sections animate in on scroll using Framer Motion's `whileInView`. Each section slides up from `y: 40` with `once: true`.

---

### Theme 4: GlassmorphismTheme.tsx

**Philosophy:** Everything is frosted glass floating in space. The Neural Forge ambient glows are prominent here.

**Layout:** CSS Grid, cards float with generous gaps:
```
┌──────────────────── HERO GLASS CARD ─────────────────┐
│  [Avatar with glow ring]  Name  Headline  Links       │
│  Bio text                                             │
└──────────────────────────────────────────────────────┘
     ┌─── STATS CARD ──┐    ┌──── SKILLS CARD ─────────┐
     │  4 stat numbers  │    │  Category pill groups    │
     └─────────────────┘    └──────────────────────────┘
┌───────────────── PROJECTS GRID ──────────────────────┐
│  [Glass card]  [Glass card]  [Glass card]             │
│  [Glass card]  [Glass card]  [Glass card]             │
└──────────────────────────────────────────────────────┘
┌──── COMPETITIVE ───────────────────────────────────── ┐
│  [Platform glass card × n]                            │
└──────────────────────────────────────────────────────┘
```

**Glass card CSS pattern (apply to every card):**
```css
background: rgba(255, 255, 255, 0.04);
backdrop-filter: blur(20px);
-webkit-backdrop-filter: blur(20px);
border: 1px solid rgba(255, 255, 255, 0.08);
border-radius: 20px;
box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.06);
```

**Background:** Two large radial gradient blobs (fixed position, behind everything):
- Violet blob: `radial-gradient(600px circle at 20% 30%, rgba(124, 58, 237, 0.15), transparent)`
- Cyan blob: `radial-gradient(500px circle at 80% 70%, rgba(6, 182, 212, 0.12), transparent)`

**Avatar:** Has a glowing ring `box-shadow: 0 0 0 3px var(--theme-accent), 0 0 20px rgba(theme-accent, 0.4)`

**Animation:** Cards use `whileHover={{ scale: 1.02, borderColor: 'rgba(255,255,255,0.15)' }}` for subtle lift. On mount, stagger fade-in from `y: 30, opacity: 0`.

---

### `Brewfolio-frontend/src/themes/index.ts`

```typescript
export { default as MinimalTheme } from './MinimalTheme'
export { default as TerminalTheme } from './TerminalTheme'
export { default as MagazineTheme } from './MagazineTheme'
export { default as GlassmorphismTheme } from './GlassmorphismTheme'

import type { ThemeType } from '@/types'
import { MinimalTheme, TerminalTheme, MagazineTheme, GlassmorphismTheme } from '.'

export const THEME_MAP: Record<ThemeType, React.ComponentType<{ profile: any }>> = {
  minimal: MinimalTheme,
  terminal: TerminalTheme,
  magazine: MagazineTheme,
  glassmorphism: GlassmorphismTheme,
}
```

---

## PART 5 — FRONTEND WIRING

### Rules for modifying existing frontend files:
- **DO NOT** change any visual styling, layout, or component structure
- **DO NOT** remove any existing JSX
- **ONLY** replace hardcoded mock data with real API calls
- **ONLY** add loading states, error states, and real data binding where mock data exists
- If a component has a `TODO` comment, that's where you wire things in
- Add `import type { ... } from '@/types'` at the top of files you modify

### Wire these specific flows:

**`StepConnect.tsx`:**
- On "Build my profile" button click: call `scraper.initJob(platforms)`
- Store `job_id` in parent state (passed up via callback prop)
- Show a progress indicator while polling `scraper.pollUntilDone()`
- Display real-time `status.message` during scraping
- On complete: call parent's `onComplete(profile)` with the scraped data

**`StepCustomize.tsx`:**
- On "Generate Portfolio" button click: call `ai.generate(job_id, config)`
- Show loading shimmer state during generation
- On complete: update parent state with full `DeveloperProfile`
- The live preview panel should render `THEME_MAP[selectedTheme]` with the current profile data

**`StepPreview.tsx`:**
- Render `THEME_MAP[profile.theme]` with the real `profile` prop
- "Publish" button calls `portfolio.publish(profile.id)`
- On publish success: show the celebration overlay with the real URL
- "Download PDF" button: link to `portfolio.exportPdf(profile.id)` (returns 501 — that's fine for hackathon)
- "Download ZIP": not implemented yet — show "coming soon" toast

**`Build.tsx` (parent page):**
- Manage `BuilderState` with `useState`
- Pass down: `platforms`, `job_id`, `profile`, step handlers
- Add `VITE_API_URL` usage: ensure `api.ts` is imported and initialized

### Create `Brewfolio-frontend/.env.example`:
```env
VITE_API_URL=http://localhost:8000
```

---

## PART 6 — SUPABASE SCHEMA

Create this SQL. Run it in Supabase SQL editor or include as `Brewfolio-backend/supabase/schema.sql`:

```sql
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table
create table profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  slug text unique,
  name text not null,
  username text not null,
  headline text,
  bio text,
  avatar_url text,
  location text,
  email text,
  links jsonb default '{}',
  stats jsonb default '{}',
  projects jsonb default '[]',
  skills jsonb default '[]',
  competitive jsonb default '[]',
  theme text default 'minimal',
  accent_color text default 'violet',
  sections_visible jsonb default '{"projects":true,"skills":true,"stats":true,"competitive":true,"blog":false,"contact":false}',
  is_published boolean default false,
  published_url text,
  last_generated_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS policies
alter table profiles enable row level security;

create policy "Users can read own profiles"
  on profiles for select using (auth.uid() = user_id);

create policy "Users can insert own profiles"
  on profiles for insert with check (auth.uid() = user_id);

create policy "Users can update own profiles"
  on profiles for update using (auth.uid() = user_id);

-- Public portfolios are readable by anyone
create policy "Published profiles are public"
  on profiles for select using (is_published = true);
```

---

## PART 7 — BUILD ORDER & CHECKPOINTS

Build in this exact order. After each checkpoint, verify it works before proceeding.

**Checkpoint 1 — Types & API client**
- Create `src/types/index.ts`
- Create `src/lib/api.ts`
- Run `cd Brewfolio-frontend && npx tsc --noEmit` — must pass with zero errors

**Checkpoint 2 — Backend skeleton**
- Create entire `Brewfolio-backend/` structure
- Install requirements: `pip install -r requirements.txt`
- Run `uvicorn main:app --reload` from `Brewfolio-backend/`
- `GET /health` must return `{"status": "ok"}`
- All 4 routers must import without errors

**Checkpoint 3 — Scrapers**
- Implement all 5 scrapers
- Test each with a known public username
- GitHub: test with `torvalds`
- LeetCode: test with `neal_wu`
- Codeforces: test with `tourist`
- AtCoder/CodeChef: test with any valid public username

**Checkpoint 4 — AI service**
- Implement `ai_service.py`
- Test with a real Anthropic API key
- Verify output is valid JSON matching the expected schema

**Checkpoint 5 — Full scrape → AI flow**
- `POST /scrape/init` with GitHub + LeetCode usernames
- Poll `/scrape/status/{job_id}` until complete
- `POST /ai/generate` with the job_id
- Verify a full `DeveloperProfile` is returned

**Checkpoint 6 — Themes**
- Build all 4 theme components
- Test each by rendering with a hardcoded `DeveloperProfile` mock in a test page
- Verify all 6 accent colors work in each theme
- Verify `sections_visible` toggles work

**Checkpoint 7 — Frontend wiring**
- Wire StepConnect → StepCustomize → StepPreview
- Test full flow end-to-end with real backend running
- Verify theme preview updates live when theme is changed in Step 2

**Checkpoint 8 — Final**
- Run `npx tsc --noEmit` in frontend — zero errors
- Run `pytest` in backend — all tests pass
- Test the complete user journey once from blank to "Publish" button

---

## CONSTRAINTS — WHAT NOT TO DO

- **DO NOT** install any new npm packages in the frontend — everything needed is already in `package.json`
- **DO NOT** change `tailwind.config.ts`, `vite.config.ts`, or any config files
- **DO NOT** modify any file in `src/components/ui/` — these are Shadcn components
- **DO NOT** modify `src/lib/utils.ts`
- **DO NOT** change the visual design, colors, fonts, or animations of any existing component
- **DO NOT** implement Puppeteer or PDF generation — return 501 for that endpoint
- **DO NOT** implement Cloudflare R2 publishing if CF credentials are not in .env — return a mock URL instead and log a warning
- **DO NOT** use `any` type in TypeScript except where explicitly shown in this prompt
- **DO NOT** commit `.env` files — only `.env.example`
