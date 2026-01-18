/**
 * Special Move Combo Definitions
 *
 * COMBO NOTATION:
 * ───────────────
 * L  = left_light  (Left Jab)
 * R  = right_light (Right Jab)
 * LH = left_heavy  (Hook)
 * RH = right_heavy (Uppercut)
 * B  = block
 * DL = dodge_left
 * DR = dodge_right
 *
 * TIMING WINDOWS:
 * ───────────────
 * Tight   = 150-180ms (requires precision)
 * Normal  = 200-250ms (standard timing)
 * Relaxed = 300-400ms (forgiving)
 *
 * DESIGN PHILOSOPHY:
 * ──────────────────
 * - Each combo should feel unique and match the fighter's style
 * - Harder combos = higher reward (damage/utility)
 * - Easier combos = lower meter cost but less damage
 * - Defensive characters start with defensive inputs
 * - Aggressive characters have rapid, flowing inputs
 */

import type { ComboInput, TapZone } from '@/types';

// ============================================================================
// COMBO BUILDER HELPERS
// ============================================================================

type TimingPreset = 'tight' | 'normal' | 'relaxed' | 'very_tight';

const TIMING: Record<TimingPreset, number> = {
  very_tight: 150,
  tight: 180,
  normal: 220,
  relaxed: 300,
};

function combo(
  ...inputs: Array<[TapZone, TimingPreset]>
): ComboInput[] {
  return inputs.map(([zone, timing]) => ({
    zone,
    windowMs: TIMING[timing],
  }));
}

// Shorthand for zones
const L: TapZone = 'left_light';
const R: TapZone = 'right_light';
const LH: TapZone = 'left_heavy';
const RH: TapZone = 'right_heavy';
const B: TapZone = 'block';
const DL: TapZone = 'dodge_left';
const DR: TapZone = 'dodge_right';

// ============================================================================
// SPECIAL MOVE COMBO SEQUENCES
// ============================================================================

/**
 * ROCKY ROO - Outback Fury
 * ─────────────────────────
 * Notation: L → R → L → LH → RH
 * Pattern:  Classic 1-2 combo flow into power finisher
 * Style:    Balanced, rhythmic, easy to learn
 * Timing:   Normal throughout - beginner friendly
 *
 * Visual: Jab-Jab-Jab-Hook-Uppercut combination
 */
export const ROCKY_ROO_COMBO = combo(
  [L, 'normal'],    // Left jab starter
  [R, 'normal'],    // Right jab follow
  [L, 'normal'],    // Left jab setup
  [LH, 'normal'],   // Hook body shot
  [RH, 'relaxed'],  // Uppercut finisher
);

/**
 * BELLA BOUNCE - Thunder Rush
 * ───────────────────────────
 * Notation: L → R → L → R → L → R
 * Pattern:  Rapid alternating jabs - pure speed
 * Style:    Machine gun punches, tests rapid input
 * Timing:   Very tight - requires fast fingers
 *
 * Visual: Blinding flurry of alternating jabs
 */
export const BELLA_BOUNCE_COMBO = combo(
  [L, 'tight'],       // Left jab
  [R, 'very_tight'],  // Right jab (fast!)
  [L, 'very_tight'],  // Left jab (fast!)
  [R, 'very_tight'],  // Right jab (fast!)
  [L, 'tight'],       // Left jab
  [R, 'normal'],      // Right finisher (slight breather)
);

/**
 * THUNDER JACK - Earthquake Punch
 * ────────────────────────────────
 * Notation: B → B → LH → RH
 * Pattern:  Wind-up stance into devastating blow
 * Style:    Slow, deliberate, maximum power
 * Timing:   Relaxed - power over speed
 *
 * Visual: Plant feet, coil up, EXPLOSIVE double punch
 */
export const THUNDER_JACK_COMBO = combo(
  [B, 'relaxed'],   // First block (stance)
  [B, 'relaxed'],   // Second block (wind up)
  [LH, 'relaxed'],  // Massive hook
  [RH, 'relaxed'],  // Earth-shattering uppercut
);

/**
 * SWIFT SALLY - Perfect Counter
 * ──────────────────────────────
 * Notation: B → DL → DR → RH
 * Pattern:  Defensive weave into precision strike
 * Style:    Read and react, counter-fighter fantasy
 * Timing:   Mixed - setup is relaxed, strike is tight
 *
 * Visual: Block, slip left, slip right, devastating counter
 */
export const SWIFT_SALLY_COMBO = combo(
  [B, 'relaxed'],   // Parry stance
  [DL, 'normal'],   // Slip left
  [DR, 'normal'],   // Slip right
  [RH, 'tight'],    // Counter uppercut (precise timing!)
);

/**
 * IRON JOEY - Iron Fortress
 * ─────────────────────────
 * Notation: B → B → B → LH → RH
 * Pattern:  Ultimate defense into offense
 * Style:    Absorb punishment, then punish back
 * Timing:   Very relaxed blocks, tight finisher
 *
 * Visual: Hunker down behind guard, then EXPLODE
 */
export const IRON_JOEY_COMBO = combo(
  [B, 'relaxed'],   // Block (absorb)
  [B, 'relaxed'],   // Block (absorb more)
  [B, 'relaxed'],   // Block (opponent commits)
  [LH, 'normal'],   // Counter hook
  [RH, 'tight'],    // Crushing uppercut
);

/**
 * WILD WALLY - Wild Flurry
 * ────────────────────────
 * Notation: RH → LH → R → LH → RH
 * Pattern:  Chaotic, unorthodox sequence
 * Style:    Unpredictable - starts with power, mixes light
 * Timing:   Irregular - some tight, some relaxed
 *
 * Visual: Haymaker, hook, surprise jab, hook, uppercut
 */
export const WILD_WALLY_COMBO = combo(
  [RH, 'normal'],      // Lead uppercut (unorthodox!)
  [LH, 'tight'],       // Quick hook
  [R, 'very_tight'],   // Surprise jab
  [LH, 'normal'],      // Another hook
  [RH, 'relaxed'],     // Big finish
);

/**
 * DUCHESS DOT - Royal Combination
 * ────────────────────────────────
 * Notation: L → L → R → R → LH → RH → LH
 * Pattern:  The longest, most technical combo
 * Style:    Precision boxing - every hit placed perfectly
 * Timing:   Tight throughout - mastery required
 *
 * Visual: Textbook combination, each punch flows into the next
 */
export const DUCHESS_DOT_COMBO = combo(
  [L, 'normal'],   // Setup jab
  [L, 'tight'],    // Double jab
  [R, 'tight'],    // Cross
  [R, 'tight'],    // Double cross
  [LH, 'tight'],   // Body hook
  [RH, 'tight'],   // Head uppercut
  [LH, 'normal'],  // Finishing hook
);

/**
 * BRAWLER BRUCE - Relentless Assault
 * ───────────────────────────────────
 * Notation: L → L → L → R → LH → RH
 * Pattern:  Body work into power shots
 * Style:    Sustained pressure, wears down guard
 * Timing:   Quick jabs, deliberate power
 *
 * Visual: Pumping jabs to the body, then unload
 */
export const BRAWLER_BRUCE_COMBO = combo(
  [L, 'normal'],   // Body jab
  [L, 'tight'],    // Body jab
  [L, 'tight'],    // Body jab (guard drops)
  [R, 'normal'],   // Head jab (goes upstairs)
  [LH, 'normal'],  // Hook
  [RH, 'normal'],  // Uppercut finish
);

// ============================================================================
// COMBO DIFFICULTY RATINGS
// ============================================================================

export type ComboDifficulty = 'easy' | 'medium' | 'hard' | 'expert';

export interface ComboMetadata {
  inputs: ComboInput[];
  difficulty: ComboDifficulty;
  notation: string;
  tips: string;
}

export const COMBO_METADATA: Record<string, ComboMetadata> = {
  outback_fury: {
    inputs: ROCKY_ROO_COMBO,
    difficulty: 'easy',
    notation: 'L → R → L → LH → RH',
    tips: 'Classic boxing rhythm. Tap steadily like a metronome.',
  },
  thunder_rush: {
    inputs: BELLA_BOUNCE_COMBO,
    difficulty: 'hard',
    notation: 'L → R → L → R → L → R',
    tips: 'Speed is key! Alternate as fast as possible.',
  },
  earthquake_punch: {
    inputs: THUNDER_JACK_COMBO,
    difficulty: 'easy',
    notation: 'B → B → LH → RH',
    tips: 'Take your time. The power comes from patience.',
  },
  perfect_counter: {
    inputs: SWIFT_SALLY_COMBO,
    difficulty: 'medium',
    notation: 'B → DL → DR → RH',
    tips: 'Weave through the danger, strike at the end.',
  },
  iron_fortress: {
    inputs: IRON_JOEY_COMBO,
    difficulty: 'medium',
    notation: 'B → B → B → LH → RH',
    tips: 'Build the fortress, then destroy them.',
  },
  wild_flurry: {
    inputs: WILD_WALLY_COMBO,
    difficulty: 'hard',
    notation: 'RH → LH → R → LH → RH',
    tips: 'Embrace the chaos. Start heavy, stay unpredictable.',
  },
  royal_combination: {
    inputs: DUCHESS_DOT_COMBO,
    difficulty: 'expert',
    notation: 'L → L → R → R → LH → RH → LH',
    tips: 'The art of boxing. Every input must be precise.',
  },
  relentless_assault: {
    inputs: BRAWLER_BRUCE_COMBO,
    difficulty: 'medium',
    notation: 'L → L → L → R → LH → RH',
    tips: 'Pressure, pressure, pressure. Never let up.',
  },
};

// ============================================================================
// EXPORTS
// ============================================================================

export const SPECIAL_COMBOS = {
  rocky_roo: ROCKY_ROO_COMBO,
  bella_bounce: BELLA_BOUNCE_COMBO,
  thunder_jack: THUNDER_JACK_COMBO,
  swift_sally: SWIFT_SALLY_COMBO,
  iron_joey: IRON_JOEY_COMBO,
  wild_wally: WILD_WALLY_COMBO,
  duchess_dot: DUCHESS_DOT_COMBO,
  brawler_bruce: BRAWLER_BRUCE_COMBO,
};
