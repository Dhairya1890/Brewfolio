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
