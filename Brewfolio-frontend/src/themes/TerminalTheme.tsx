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

const lineVariant = {
  hidden: { opacity: 0, x: -8 },
  show: { opacity: 1, x: 0 },
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
}

interface Props {
  profile: DeveloperProfile
}

const Prompt = ({ command, accent }: { command: string; accent: string }) => (
  <div style={{ marginBottom: 4, marginTop: 16 }}>
    <span style={{ color: '#00FF41', opacity: 0.6 }}>brewfolio</span>
    <span style={{ color: '#00FF41', opacity: 0.4 }}> ~ </span>
    <span style={{ color: accent }}>$ </span>
    <span style={{ color: '#00FF41' }}>{command}</span>
  </div>
)

const TerminalTheme = ({ profile }: Props) => {
  const accent = ACCENT_COLORS[profile.accent_color] || ACCENT_COLORS.violet
  const sv = profile.sections_visible

  const terminalStyle: React.CSSProperties = {
    backgroundColor: '#0A0A0A',
    color: '#00FF41',
    minHeight: '100vh',
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 14,
    lineHeight: 1.8,
  }

  const borderStyle = '1px dashed rgba(0,255,65,0.3)'

  return (
    <div style={terminalStyle}>
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        style={{
          maxWidth: 900,
          margin: '0 auto',
          padding: '40px 24px',
          border: borderStyle,
          borderRadius: 0,
          marginTop: 40,
          marginBottom: 40,
        }}
      >
        {/* whoami */}
        <motion.div variants={lineVariant}>
          <Prompt command="whoami" accent={accent} />
        </motion.div>
        <motion.div variants={lineVariant}>
          <span style={{ color: accent }}>{'> '}</span>
          <span>name:{'      '}</span>
          <span style={{ color: '#F0EEFF' }}>{profile.name}</span>
        </motion.div>
        <motion.div variants={lineVariant}>
          <span style={{ color: accent }}>{'> '}</span>
          <span>handle:{'    '}</span>
          <span style={{ color: '#F0EEFF' }}>{profile.username}</span>
        </motion.div>
        {profile.location && (
          <motion.div variants={lineVariant}>
            <span style={{ color: accent }}>{'> '}</span>
            <span>location:{'  '}</span>
            <span style={{ color: '#F0EEFF' }}>{profile.location}</span>
          </motion.div>
        )}
        <motion.div variants={lineVariant}>
          <span style={{ color: accent }}>{'> '}</span>
          <span>bio:{'       '}</span>
          <span style={{ color: '#F0EEFF', opacity: 0.9 }}>{profile.bio}</span>
        </motion.div>

        {/* Skills */}
        {sv.skills && profile.skills.length > 0 && (
          <>
            <motion.div variants={lineVariant}>
              <Prompt command="cat skills.txt" accent={accent} />
            </motion.div>
            {profile.skills.map(cat => (
              <motion.div key={cat.category} variants={lineVariant}>
                <span style={{ color: '#00FF41', opacity: 0.7 }}>
                  {cat.category}:{' '.repeat(Math.max(1, 14 - cat.category.length))}
                </span>
                <span style={{ color: '#F0EEFF' }}>{cat.items.join('  ')}</span>
              </motion.div>
            ))}
          </>
        )}

        {/* Projects */}
        {sv.projects && profile.projects.length > 0 && (
          <>
            <motion.div variants={lineVariant}>
              <Prompt command="ls projects/" accent={accent} />
            </motion.div>
            {profile.projects.map(p => (
              <motion.div key={p.name} variants={lineVariant} style={{ marginBottom: 8 }}>
                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: accent, textDecoration: 'none' }}
                >
                  [{p.name}/]
                </a>
                <span style={{ color: '#00FF41', opacity: 0.6 }}>{'  '}★{p.stars}</span>
                <span style={{ color: '#F0EEFF', opacity: 0.5 }}>{'  '}{p.language}</span>
                <div style={{ paddingLeft: 20 }}>
                  <span style={{ color: '#00FF41', opacity: 0.4 }}>└── </span>
                  <span style={{ color: '#F0EEFF', opacity: 0.7 }}>{p.description}</span>
                </div>
              </motion.div>
            ))}
          </>
        )}

        {/* Stats */}
        {sv.stats && (
          <>
            <motion.div variants={lineVariant}>
              <Prompt command="cat stats.json" accent={accent} />
            </motion.div>
            <motion.div variants={lineVariant} style={{ color: '#F0EEFF', opacity: 0.9 }}>
              <pre style={{ margin: 0, fontFamily: 'inherit' }}>
{JSON.stringify(
  {
    github_repos: profile.stats.github_repos,
    github_stars: profile.stats.github_stars,
    contributions: profile.stats.github_contributions,
    leetcode_solved: profile.stats.leetcode_solved,
    cf_rating: profile.stats.cf_rating || null,
  },
  null,
  2
)}
              </pre>
            </motion.div>
          </>
        )}

        {/* Competitive */}
        {sv.competitive && profile.competitive.length > 0 && (
          <>
            <motion.div variants={lineVariant}>
              <Prompt command="cat competitive.log" accent={accent} />
            </motion.div>
            {profile.competitive.map(cp => (
              <motion.div key={cp.platform} variants={lineVariant}>
                <span style={{ color: accent }}>[{cp.platform}]</span>
                <span style={{ color: '#F0EEFF' }}>
                  {' '}rating={cp.rating} rank="{cp.rank}"
                  {cp.max_rating && ` max_rating=${cp.max_rating}`}
                  {cp.solved && ` solved=${cp.solved}`}
                </span>
              </motion.div>
            ))}
          </>
        )}

        {/* Blinking cursor */}
        <motion.div variants={lineVariant} style={{ marginTop: 24 }}>
          <span style={{ color: accent }}>$ </span>
          <span
            style={{
              display: 'inline-block',
              width: 8,
              height: 16,
              backgroundColor: '#00FF41',
              animation: 'blink 1s step-end infinite',
            }}
          />
        </motion.div>
      </motion.div>

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  )
}

export default TerminalTheme
