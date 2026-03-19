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

const sectionVariant = {
  offscreen: { y: 40, opacity: 0 },
  onscreen: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
}

interface Props {
  profile: DeveloperProfile
}

const MagazineTheme = ({ profile }: Props) => {
  const accent = ACCENT_COLORS[profile.accent_color] || ACCENT_COLORS.violet
  const sv = profile.sections_visible

  return (
    <div style={{
      backgroundColor: '#0E0E14',
      color: '#F0EEFF',
      minHeight: '100vh',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '80px 24px' }}>

        {/* Hero — large name + avatar */}
        <motion.div
          initial="offscreen" whileInView="onscreen" viewport={{ once: true }}
          variants={sectionVariant}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 }}
        >
          <h1 style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: 'clamp(48px, 8vw, 96px)',
            fontWeight: 800,
            lineHeight: 1,
            margin: 0,
            maxWidth: '65%',
          }}>
            {profile.name}
          </h1>
          {profile.avatar_url && (
            <img
              src={profile.avatar_url}
              alt={profile.name}
              style={{ width: 200, height: 200, borderRadius: 12, objectFit: 'cover' }}
            />
          )}
        </motion.div>

        {/* Accent bar */}
        <div style={{ width: '100%', height: 4, background: accent, marginBottom: 40 }} />

        {/* Bio — pull quote */}
        <motion.div
          initial="offscreen" whileInView="onscreen" viewport={{ once: true }}
          variants={sectionVariant}
          style={{
            borderLeft: `6px solid ${accent}`,
            paddingLeft: 24,
            marginBottom: 56,
          }}
        >
          <p style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: 24,
            fontStyle: 'italic',
            lineHeight: 1.6,
            color: '#C8C3E0',
            margin: 0,
          }}>
            "{profile.bio}"
          </p>
          <p style={{ fontSize: 14, color: '#9994B8', marginTop: 12 }}>
            {profile.headline}
          </p>
        </motion.div>

        {/* Stats + Skills side by side */}
        <motion.div
          initial="offscreen" whileInView="onscreen" viewport={{ once: true }}
          variants={sectionVariant}
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, marginBottom: 56 }}
        >
          {sv.stats && (
            <div>
              <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 14, letterSpacing: 3, textTransform: 'uppercase', color: accent, marginBottom: 20 }}>
                Stats
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {[
                  { label: 'Repos', value: profile.stats.github_repos },
                  { label: 'Stars', value: profile.stats.github_stars },
                  { label: 'LeetCode', value: profile.stats.leetcode_solved },
                  { label: 'Contributions', value: profile.stats.github_contributions },
                ].map(s => (
                  <div key={s.label}>
                    <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 32, fontWeight: 700 }}>{s.value}</div>
                    <div style={{ fontSize: 12, color: '#9994B8', textTransform: 'uppercase', letterSpacing: 1 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {sv.skills && profile.skills.length > 0 && (
            <div>
              <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 14, letterSpacing: 3, textTransform: 'uppercase', color: accent, marginBottom: 20 }}>
                Skills
              </h2>
              {profile.skills.map(cat => (
                <div key={cat.category} style={{ marginBottom: 16 }}>
                  <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 16, marginBottom: 4 }}>
                    {cat.category}
                  </div>
                  <div style={{ fontSize: 14, color: '#C8C3E0' }}>
                    {cat.items.join(', ')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Projects */}
        {sv.projects && profile.projects.length > 0 && (
          <motion.div
            initial="offscreen" whileInView="onscreen" viewport={{ once: true }}
            variants={sectionVariant}
            style={{ marginBottom: 56 }}
          >
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 14, letterSpacing: 3, textTransform: 'uppercase', color: accent, marginBottom: 24 }}>
              Projects
            </h2>

            {/* Featured project — first one */}
            {profile.projects[0] && (
              <a
                href={profile.projects[0].url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'block',
                  background: '#141420',
                  borderLeft: `6px solid ${accent}`,
                  borderRadius: 8,
                  padding: 32,
                  marginBottom: 24,
                  textDecoration: 'none',
                  color: 'inherit',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 700, margin: 0 }}>
                    {profile.projects[0].name}
                  </h3>
                  <div style={{ display: 'flex', gap: 16, fontSize: 13, color: '#9994B8' }}>
                    <span>★ {profile.projects[0].stars}</span>
                    <span>{profile.projects[0].language}</span>
                  </div>
                </div>
                <p style={{ fontSize: 16, color: '#C8C3E0', marginTop: 12, lineHeight: 1.6 }}>
                  {profile.projects[0].description}
                </p>
              </a>
            )}

            {/* Rest in grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              {profile.projects.slice(1).map(p => (
                <a
                  key={p.name}
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'block',
                    background: '#141420',
                    borderRadius: 8,
                    padding: 20,
                    textDecoration: 'none',
                    color: 'inherit',
                    transition: 'transform 0.2s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
                  onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
                >
                  <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
                    {p.name}
                  </div>
                  <p style={{ fontSize: 13, color: '#9994B8', lineHeight: 1.5, margin: 0 }}>{p.description}</p>
                  <div style={{ display: 'flex', gap: 12, marginTop: 12, fontSize: 12, color: '#9994B8' }}>
                    <span>★ {p.stars}</span>
                    <span>{p.language}</span>
                  </div>
                </a>
              ))}
            </div>
          </motion.div>
        )}

        {/* Competitive */}
        {sv.competitive && profile.competitive.length > 0 && (
          <motion.div
            initial="offscreen" whileInView="onscreen" viewport={{ once: true }}
            variants={sectionVariant}
          >
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 14, letterSpacing: 3, textTransform: 'uppercase', color: accent, marginBottom: 24 }}>
              Competitive
            </h2>
            <div style={{ display: 'flex', gap: 16 }}>
              {profile.competitive.map(cp => (
                <div key={cp.platform} style={{
                  flex: 1,
                  background: '#141420',
                  borderRadius: 8,
                  borderLeft: `4px solid ${accent}`,
                  padding: 24,
                }}>
                  <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 2, color: '#9994B8', marginBottom: 12 }}>
                    {cp.platform}
                  </div>
                  <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 36, fontWeight: 700 }}>{cp.rating}</div>
                  <div style={{ fontSize: 13, color: '#9994B8', marginTop: 4 }}>{cp.rank}</div>
                  {cp.solved && (
                    <div style={{ fontSize: 12, color: '#9994B8', marginTop: 4 }}>{cp.solved} solved</div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default MagazineTheme
