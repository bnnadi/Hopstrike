/**
 * App constants and configuration values
 */

export const APP_NAME = 'Hopstrike';

// Re-export game constants
export * from './moves';
export * from './combos';
export * from './fighters';
export * from './aiPersonalities';

// ============================================================================
// DIFFICULTY CONFIGURATION
// ============================================================================

export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'expert';

export interface DifficultyDisplayConfig {
  id: DifficultyLevel;
  label: string;
  color: string;
}

/**
 * Shared difficulty display configuration
 * Used across combo displays and fighter selection
 */
export const DIFFICULTY_DISPLAY: Record<DifficultyLevel, DifficultyDisplayConfig> = {
  easy: { id: 'easy', label: 'EASY', color: '#2ECC71' },     // COLORS.success
  medium: { id: 'medium', label: 'MEDIUM', color: '#F39C12' }, // COLORS.warning
  hard: { id: 'hard', label: 'HARD', color: '#E74C3C' },      // COLORS.error
  expert: { id: 'expert', label: 'EXPERT', color: '#FFD700' }, // COLORS.special
};

/**
 * Get difficulty display config as an array (for UI lists)
 */
export const DIFFICULTY_LIST: DifficultyDisplayConfig[] = [
  DIFFICULTY_DISPLAY.easy,
  DIFFICULTY_DISPLAY.medium,
  DIFFICULTY_DISPLAY.hard,
  DIFFICULTY_DISPLAY.expert,
];

// Theme Colors
export const COLORS = {
  // Primary palette
  primary: '#FF6B35',
  primaryDark: '#D94F1A',
  secondary: '#004E89',
  secondaryDark: '#003B66',

  // Game UI
  health: '#E74C3C',
  healthBg: '#2C1810',
  meter: '#F1C40F',
  meterBg: '#3D3A1A',

  // Backgrounds
  background: '#1A1A2E',
  backgroundLight: '#16213E',
  surface: '#0F3460',
  surfaceLight: '#1A4F7A',

  // Text
  text: '#FFFFFF',
  textSecondary: '#B8C5D6',
  textDark: '#1A1A2E',

  // Status
  success: '#2ECC71',
  warning: '#F39C12',
  error: '#E74C3C',

  // Effects
  hit: '#FF4444',
  block: '#4488FF',
  dodge: '#44FF88',
  special: '#FFD700',
};

// Spacing
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Font sizes
export const FONT_SIZES = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 18,
  xl: 24,
  xxl: 32,
  title: 48,
};

// Animation durations (ms)
export const DURATIONS = {
  fast: 100,
  normal: 200,
  slow: 300,
  veryFast: 50,
};
