import { motion } from 'framer-motion'
import type { DeveloperProfile, AccentColor } from '@/types'

const ACCENT_COLORS: Record<AccentColor, string> = {
  violet: '#7C3AED',
  cyan: '#06B6D4',
  pink: '#EC4899',
  green: '#10B981',
  orange: '#F59E0B',
  mono: '#6B7280',
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { duration: 0.5 } },
}

interface Props {
  profile: DeveloperProfile
}

const MinimalTheme = ({ profile }: Props) => {
  const accent = ACCENT_COLORS[profile.accent_color] || ACCENT_COLORS.violet
  const sv = profile.sections_visible

  return (
    <div
      style={{
        '--theme-accent': accent,
        backgroundColor: '#08080F',
        color: '#F0EEFF',
        minHeight: '100vh',
        fontFamily: "'DM Sans', sans-serif",
      } as React.CSSProperties}
    >
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        style={{ maxWidth: 800, margin: '0 auto', padding: '80px 24px' }}
      >
        {/* Hero */}
        <motion.div variants={item} style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 48 }}>
          {profile.avatar_url && (
            <img
              src={profile.avatar_url}
              alt={profile.name}
              style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover' }}
            />
          )}
          <div>
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 56, fontWeight: 700, margin: 0, lineHeight: 1.1 }}>
              {profile.name}
            </h1>
            <p style={{ fontSize: 20, color: '#9994B8', marginTop: 8 }}>
              {profile.headline}
            </p>
            <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
              {profile.links.github && (
                <a href={profile.links.github} target="_blank" rel="noopener noreferrer"
                   style={{ color: '#9994B8', textDecoration: 'none', fontSize: 14, transition: 'color 0.2s' }}
                   onMouseEnter={e => (e.currentTarget.style.color = accent)}
                   onMouseLeave={e => (e.currentTarget.style.color = '#9994B8')}>
                  GitHub ↗
                </a>
              )}
              {profile.links.linkedin && (
                <a href={profile.links.linkedin} target="_blank" rel="noopener noreferrer"
                   style={{ color: '#9994B8', textDecoration: 'none', fontSize: 14 }}>
                  LinkedIn ↗
                </a>
              )}
              {profile.links.blog && (
                <a href={profile.links.blog} target="_blank" rel="noopener noreferrer"
                   style={{ color: '#9994B8', textDecoration: 'none', fontSize: 14 }}>
                  Blog ↗
                </a>
              )}
            </div>
          </div>
        </motion.div>

        {/* Bio */}
        <motion.p variants={item} style={{ fontSize: 18, lineHeight: 1.7, maxWidth: 600, margin: '0 auto 48px', textAlign: 'center', color: '#C8C3E0' }}>
          {profile.bio}
        </motion.p>

        {/* Stats */}
        {sv.stats && (
          <motion.div variants={item} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, marginBottom: 48, textAlign: 'center' }}>
            {[
              { label: 'Repos', value: profile.stats.github_repos },
              { label: 'Stars', value: profile.stats.github_stars },
              { label: 'LeetCode', value: profile.stats.leetcode_solved },
              { label: 'CF Rating', value: profile.stats.cf_rating || '—' },
            ].map(s => (
              <div key={s.label}>
                <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 36, fontWeight: 700, color: accent }}>
                  {s.value}
                </div>
                <div style={{ fontSize: 13, color: '#9994B8', marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Projects */}
        {sv.projects && profile.projects.length > 0 && (
          <motion.div variants={item} style={{ marginBottom: 48 }}>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 700, marginBottom: 20 }}>
              Projects
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
              {profile.projects.map(p => (
                <a
                  key={p.name}
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'block',
                    background: '#0F0F1A',
                    borderRadius: 12,
                    padding: 20,
                    textDecoration: 'none',
                    color: 'inherit',
                    border: '1px solid rgba(124,58,237,0.1)',
                    transition: 'border-color 0.2s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = accent)}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(124,58,237,0.1)')}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 15, fontWeight: 600 }}>{p.name}</span>
                    <span style={{ fontSize: 12, color: '#9994B8' }}>★ {p.stars}</span>
                  </div>
                  <p style={{ fontSize: 14, color: '#9994B8', lineHeight: 1.5, margin: 0 }}>{p.description}</p>
                  <div style={{ display: 'flex', gap: 8, marginTop: 12, alignItems: 'center' }}>
                    {p.language && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: accent }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: accent, display: 'inline-block' }} />
                        {p.language}
                      </span>
                    )}
                  </div>
                </a>
              ))}
            </div>
          </motion.div>
        )}

        {/* Skills */}
        {sv.skills && profile.skills.length > 0 && (
          <motion.div variants={item} style={{ marginBottom: 48 }}>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Skills</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {profile.skills.flatMap(cat => cat.items).map(skill => (
                <span
                  key={skill}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 8,
                    fontSize: 13,
                    fontFamily: "'JetBrains Mono', monospace",
                    background: `${accent}15`,
                    border: `1px solid ${accent}30`,
                    color: '#F0EEFF',
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Competitive */}
        {sv.competitive && profile.competitive.length > 0 && (
          <motion.div variants={item}>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Competitive</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {profile.competitive.map(cp => (
                <div key={cp.platform} style={{ background: '#0F0F1A', borderRadius: 12, padding: 20 }}>
                  <div style={{ fontSize: 13, color: '#9994B8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
                    {cp.platform}
                  </div>
                  <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 700, color: accent }}>
                    {cp.rating}
                  </div>
                  <div style={{ fontSize: 13, color: '#9994B8', marginTop: 4 }}>{cp.rank}</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}

export default MinimalTheme
