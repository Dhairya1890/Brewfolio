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
