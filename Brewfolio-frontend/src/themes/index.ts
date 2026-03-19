export { default as MinimalTheme } from './MinimalTheme'
export { default as TerminalTheme } from './TerminalTheme'
export { default as MagazineTheme } from './MagazineTheme'
export { default as GlassmorphismTheme } from './GlassmorphismTheme'

import type { ThemeType } from '@/types'
import type { DeveloperProfile } from '@/types'
import { MinimalTheme, TerminalTheme, MagazineTheme, GlassmorphismTheme } from '.'

export const THEME_MAP: Record<ThemeType, React.ComponentType<{ profile: DeveloperProfile }>> = {
  minimal: MinimalTheme,
  terminal: TerminalTheme,
  magazine: MagazineTheme,
  glassmorphism: GlassmorphismTheme,
}
