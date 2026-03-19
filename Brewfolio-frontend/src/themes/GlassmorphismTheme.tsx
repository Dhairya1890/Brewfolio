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
    transition: { staggerChildren: 0.1 },
  },
}

const cardItem = {
  hidden: { y: 30, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { duration: 0.6 } },
}

const glassCard: React.CSSProperties = {
  background: 'rgba(255, 255, 255, 0.04)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: 20,
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
}

interface Props {
  profile: DeveloperProfile
}

const GlassmorphismTheme = ({ profile }: Props) => {
  const accent = ACCENT_COLORS[profile.accent_color] || ACCENT_COLORS.violet
  const sv = profile.sections_visible

  return (
    <div style={{
      backgroundColor: '#08080F',
      color: '#F0EEFF',
      minHeight: '100vh',
      fontFamily: "'DM Sans', sans-serif",
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background blobs */}
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        background: `
          radial-gradient(600px circle at 20% 30%, rgba(124, 58, 237, 0.15), transparent),
          radial-gradient(500px circle at 80% 70%, rgba(6, 182, 212, 0.12), transparent)
        `,
      }} />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        style={{ maxWidth: 1000, margin: '0 auto', padding: '80px 24px', position: 'relative', zIndex: 1 }}
      >
        {/* Hero Card */}
        <motion.div
          variants={cardItem}
          whileHover={{ scale: 1.01, borderColor: 'rgba(255,255,255,0.15)' }}
          style={{ ...glassCard, padding: 40, marginBottom: 24 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 20 }}>
            {profile.avatar_url && (
              <img
                src={profile.avatar_url}
                alt={profile.name}
                style={{
                  width: 90,
                  height: 90,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  boxShadow: `0 0 0 3px ${accent}, 0 0 20px ${accent}66`,
                }}
              />
            )}
            <div>
              <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 36, fontWeight: 700, margin: 0 }}>
                {profile.name}
              </h1>
              <p style={{ fontSize: 16, color: '#9994B8', marginTop: 4 }}>{profile.headline}</p>
              <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
                {profile.links.github && (
                  <a href={profile.links.github} target="_blank" rel="noopener noreferrer"
                     style={{ color: accent, textDecoration: 'none', fontSize: 13 }}>GitHub</a>
                )}
                {profile.links.linkedin && (
                  <a href={profile.links.linkedin} target="_blank" rel="noopener noreferrer"
                     style={{ color: accent, textDecoration: 'none', fontSize: 13 }}>LinkedIn</a>
                )}
                {profile.links.blog && (
                  <a href={profile.links.blog} target="_blank" rel="noopener noreferrer"
                     style={{ color: accent, textDecoration: 'none', fontSize: 13 }}>Blog</a>
                )}
              </div>
            </div>
          </div>
          <p style={{ fontSize: 16, lineHeight: 1.7, color: '#C8C3E0', margin: 0 }}>
            {profile.bio}
          </p>
        </motion.div>

        {/* Stats + Skills row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
          {sv.stats && (
            <motion.div
              variants={cardItem}
              whileHover={{ scale: 1.02, borderColor: 'rgba(255,255,255,0.15)' }}
              style={{ ...glassCard, padding: 32 }}
            >
              <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 14, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: accent, marginTop: 0, marginBottom: 20 }}>
                Stats
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                {[
                  { label: 'Repos', value: profile.stats.github_repos },
                  { label: 'Stars', value: profile.stats.github_stars },
                  { label: 'LeetCode', value: profile.stats.leetcode_solved },
                  { label: 'Contributions', value: profile.stats.github_contributions },
                ].map(s => (
                  <div key={s.label}>
                    <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 700, color: accent }}>{s.value}</div>
                    <div style={{ fontSize: 12, color: '#9994B8' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {sv.skills && profile.skills.length > 0 && (
            <motion.div
              variants={cardItem}
              whileHover={{ scale: 1.02, borderColor: 'rgba(255,255,255,0.15)' }}
              style={{ ...glassCard, padding: 32 }}
            >
              <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 14, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: accent, marginTop: 0, marginBottom: 20 }}>
                Skills
              </h2>
              {profile.skills.map(cat => (
                <div key={cat.category} style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>{cat.category}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {cat.items.map(skill => (
                      <span key={skill} style={{
                        padding: '4px 12px',
                        borderRadius: 20,
                        fontSize: 12,
                        background: `${accent}15`,
                        border: `1px solid ${accent}30`,
                        color: '#F0EEFF',
                      }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </div>

        {/* Projects Grid */}
        {sv.projects && profile.projects.length > 0 && (
          <motion.div variants={cardItem} style={{ marginBottom: 24 }}>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 14, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: accent, marginBottom: 16 }}>
              Projects
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              {profile.projects.map(p => (
                <motion.a
                  key={p.name}
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.02, borderColor: 'rgba(255,255,255,0.15)' }}
                  style={{
                    ...glassCard,
                    padding: 20,
                    textDecoration: 'none',
                    color: 'inherit',
                    display: 'block',
                  }}
                >
                  <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 600, marginBottom: 8 }}>
                    {p.name}
                  </div>
                  <p style={{ fontSize: 13, color: '#9994B8', lineHeight: 1.5, margin: 0, marginBottom: 12 }}>
                    {p.description}
                  </p>
                  <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#9994B8' }}>
                    {p.language && (
                      <span style={{ color: accent }}>
                        <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: accent, marginRight: 4 }} />
                        {p.language}
                      </span>
                    )}
                    <span>★ {p.stars}</span>
                  </div>
                </motion.a>
              ))}
            </div>
          </motion.div>
        )}

        {/* Competitive */}
        {sv.competitive && profile.competitive.length > 0 && (
          <motion.div variants={cardItem}>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 14, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: accent, marginBottom: 16 }}>
              Competitive
            </h2>
            <div style={{ display: 'flex', gap: 16 }}>
              {profile.competitive.map(cp => (
                <motion.div
                  key={cp.platform}
                  whileHover={{ scale: 1.02, borderColor: 'rgba(255,255,255,0.15)' }}
                  style={{ ...glassCard, flex: 1, padding: 24 }}
                >
                  <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 2, color: '#9994B8', marginBottom: 12 }}>
                    {cp.platform}
                  </div>
                  <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 32, fontWeight: 700, color: accent }}>
                    {cp.rating}
                  </div>
                  <div style={{ fontSize: 13, color: '#9994B8', marginTop: 4 }}>{cp.rank}</div>
                  {cp.solved && (
                    <div style={{ fontSize: 12, color: '#9994B8', marginTop: 4 }}>{cp.solved} problems</div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}

export default GlassmorphismTheme
