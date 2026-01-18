/**
 * AI Adaptation System
 * Computes between-round adjustments based on observed player behavior
 *
 * Design principles:
 * - Adaptations feel earned and readable
 * - Incremental adjustments, never perfect
 * - Respects player skill - doesn't rubber-band
 */

import type {
  AdaptationModifiers,
  ObservationData,
  PlayerTendencies,
  RoundSummary,
  AIPersonality,
  DifficultyConfig,
} from '@/types/ai';
import { DEFAULT_ADAPTATIONS } from '@/types/ai';

// ============================================================================
// CONSTANTS
// ============================================================================

/** Maximum strength for any single adaptation */
const MAX_ADAPTATION_STRENGTH = 0.6;

/** How much adaptations decay each round */
const ADAPTATION_DECAY = 0.15;

/** Minimum confidence to apply adaptations */
const MIN_CONFIDENCE_FOR_ADAPTATION = 0.3;

// ============================================================================
// MAIN ADAPTATION COMPUTATION
// ============================================================================

/**
 * Compute adaptation modifiers based on observations
 * Called between rounds
 */
export function computeAdaptations(
  observations: ObservationData,
  previousAdaptations: AdaptationModifiers,
  personality: AIPersonality,
  difficultyConfig: DifficultyConfig,
): AdaptationModifiers {
  // Start with decayed previous adaptations
  const adaptations = decayAdaptations(previousAdaptations);

  // Don't adapt if we don't have enough data
  if (observations.confidence < MIN_CONFIDENCE_FOR_ADAPTATION) {
    return adaptations;
  }

  const tendencies = observations.tendencies;
  const roundSummaries = observations.roundSummaries;
  const difficultyMultiplier = difficultyConfig.adaptationStrength;

  // Apply each adaptation type
  applyDefensiveAdaptations(adaptations, tendencies, difficultyMultiplier);
  applyOffensiveAdaptations(adaptations, tendencies, difficultyMultiplier);
  applyCounterStrategyAdaptations(adaptations, tendencies, roundSummaries, difficultyMultiplier);
  applyTempoAdaptations(adaptations, tendencies, difficultyMultiplier);
  applySpecialMoveAdaptations(adaptations, tendencies, difficultyMultiplier);

  // Set overall adaptation strength based on confidence
  adaptations.adaptationStrength = Math.min(
    observations.confidence * difficultyMultiplier,
    MAX_ADAPTATION_STRENGTH,
  );

  // Clamp all values
  return clampAdaptations(adaptations);
}

// ============================================================================
// ADAPTATION STRATEGIES
// ============================================================================

/**
 * Defensive adjustments based on player attack patterns
 */
function applyDefensiveAdaptations(
  adaptations: AdaptationModifiers,
  tendencies: PlayerTendencies,
  multiplier: number,
): void {
  // If player uses heavy attacks a lot, increase block rate against them
  if (tendencies.lightVsHeavyRatio > 0.6) {
    adaptations.blockAgainstHeavy += (tendencies.lightVsHeavyRatio - 0.5) * multiplier;
  }

  // If player has predictable combo starters, prepare to dodge
  if (tendencies.commonStarters.length > 0 && tendencies.comboAttemptRate > 0.4) {
    adaptations.dodgePredictablePatterns += tendencies.comboAttemptRate * 0.5 * multiplier;
  }
}

/**
 * Offensive adjustments to exploit player weaknesses
 */
function applyOffensiveAdaptations(
  adaptations: AdaptationModifiers,
  tendencies: PlayerTendencies,
  multiplier: number,
): void {
  // If player rarely defends, be more aggressive with punishes
  if (tendencies.defensiveReactionRate < 0.4) {
    adaptations.punishOpenings += (0.5 - tendencies.defensiveReactionRate) * multiplier;
  }

  // If player blocks more than dodges, use more mix-ups
  if (tendencies.blockVsDodgeRatio < 0.3) {
    // Player blocks a lot - can throw more heavies
    adaptations.exploitDefense += 0.3 * multiplier;
  }

  // If player whiffs often and doesn't recover well
  if (tendencies.whiffRecoveryAction === 'idle') {
    adaptations.punishOpenings += 0.2 * multiplier;
  }
}

/**
 * Counter-strategy adaptations
 */
function applyCounterStrategyAdaptations(
  adaptations: AdaptationModifiers,
  tendencies: PlayerTendencies,
  roundSummaries: RoundSummary[],
  multiplier: number,
): void {
  // Check recent round patterns
  const recentRounds = roundSummaries.slice(-2);

  // If player is winning with aggression, bait and punish
  const playerWinning = recentRounds.filter((r) => r.winner === 'player').length;
  const wasAggressive = recentRounds.filter(
    (r) => r.dominantStrategy === 'aggressive',
  ).length;

  if (playerWinning > 0 && wasAggressive > 0) {
    adaptations.baitAndPunish += 0.3 * multiplier;
  }

  // If player counters a lot, increase mix-ups
  if (tendencies.counterAttackRate > 0.5) {
    adaptations.mixUpIncrease += (tendencies.counterAttackRate - 0.3) * multiplier;
  }

  // If player has panic behavior, exploit it
  if (tendencies.panicBehavior === 'mash') {
    // Patient defense wins against mashers
    adaptations.baitAndPunish += 0.25 * multiplier;
  } else if (tendencies.panicBehavior === 'turtle') {
    // Pressure wins against turtlers
    adaptations.exploitDefense += 0.2 * multiplier;
  }
}

/**
 * Tempo adjustments based on player rhythm
 */
function applyTempoAdaptations(
  adaptations: AdaptationModifiers,
  tendencies: PlayerTendencies,
  multiplier: number,
): void {
  // Analyze average combo length for tempo
  const avgCombo = tendencies.averageComboLength;

  if (avgCombo > 3) {
    // Player likes long combos - slow down, wait for openings
    adaptations.tempoAdjustment -= 0.2 * multiplier;
  } else if (avgCombo < 1.5) {
    // Player uses single hits - can trade more safely
    adaptations.tempoAdjustment += 0.1 * multiplier;
  }

  // If player defends reactively, slow tempo
  if (tendencies.defensiveReactionRate > 0.7) {
    adaptations.tempoAdjustment -= 0.15 * multiplier;
  }
}

/**
 * Special move timing adjustments
 */
function applySpecialMoveAdaptations(
  adaptations: AdaptationModifiers,
  tendencies: PlayerTendencies,
  multiplier: number,
): void {
  // Adjust based on player's special success rate
  if (tendencies.specialSuccessRate > 0.7) {
    // Player is good at landing specials - be more cautious
    adaptations.specialTimingShift -= 0.15 * multiplier;
  } else if (tendencies.specialSuccessRate < 0.3) {
    // Player struggles with specials - exploit the whiffs
    adaptations.punishOpenings += 0.15 * multiplier;
  }

  // Adjust based on player's special timing
  switch (tendencies.specialTiming) {
    case 'early':
      // Player uses specials early - bait them
      adaptations.baitAndPunish += 0.1 * multiplier;
      break;
    case 'late':
      // Player holds specials - pressure them
      adaptations.tempoAdjustment += 0.1 * multiplier;
      break;
    case 'optimal':
      // Player times well - mix up more
      adaptations.mixUpIncrease += 0.1 * multiplier;
      break;
  }
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Decay adaptations between rounds to prevent over-adaptation
 */
function decayAdaptations(
  adaptations: AdaptationModifiers,
): AdaptationModifiers {
  const decayed: AdaptationModifiers = { ...adaptations };

  decayed.blockAgainstHeavy *= 1 - ADAPTATION_DECAY;
  decayed.dodgePredictablePatterns *= 1 - ADAPTATION_DECAY;
  decayed.punishOpenings *= 1 - ADAPTATION_DECAY;
  decayed.exploitDefense *= 1 - ADAPTATION_DECAY;
  decayed.tempoAdjustment *= 1 - ADAPTATION_DECAY;
  decayed.baitAndPunish *= 1 - ADAPTATION_DECAY;
  decayed.mixUpIncrease *= 1 - ADAPTATION_DECAY;
  decayed.specialTimingShift *= 1 - ADAPTATION_DECAY;

  return decayed;
}

/**
 * Clamp all adaptation values to reasonable ranges
 */
function clampAdaptations(
  adaptations: AdaptationModifiers,
): AdaptationModifiers {
  const clamp = (value: number, min: number, max: number) =>
    Math.max(min, Math.min(max, value));

  return {
    blockAgainstHeavy: clamp(adaptations.blockAgainstHeavy, 0, MAX_ADAPTATION_STRENGTH),
    dodgePredictablePatterns: clamp(adaptations.dodgePredictablePatterns, 0, MAX_ADAPTATION_STRENGTH),
    punishOpenings: clamp(adaptations.punishOpenings, 0, MAX_ADAPTATION_STRENGTH),
    exploitDefense: clamp(adaptations.exploitDefense, 0, MAX_ADAPTATION_STRENGTH),
    tempoAdjustment: clamp(adaptations.tempoAdjustment, -0.5, 0.5),
    baitAndPunish: clamp(adaptations.baitAndPunish, 0, MAX_ADAPTATION_STRENGTH),
    mixUpIncrease: clamp(adaptations.mixUpIncrease, 0, MAX_ADAPTATION_STRENGTH),
    specialTimingShift: clamp(adaptations.specialTimingShift, -0.5, 0.5),
    adaptationStrength: clamp(adaptations.adaptationStrength, 0, 1),
  };
}

/**
 * Reset adaptations to default values
 */
export function resetAdaptations(): AdaptationModifiers {
  return { ...DEFAULT_ADAPTATIONS };
}

/**
 * Get a human-readable summary of current adaptations for debugging
 */
export function getAdaptationSummary(adaptations: AdaptationModifiers): string {
  const lines: string[] = [];

  if (adaptations.blockAgainstHeavy > 0.1) {
    lines.push(`Blocking heavy attacks more (+${(adaptations.blockAgainstHeavy * 100).toFixed(0)}%)`);
  }
  if (adaptations.dodgePredictablePatterns > 0.1) {
    lines.push(`Dodging predictable patterns (+${(adaptations.dodgePredictablePatterns * 100).toFixed(0)}%)`);
  }
  if (adaptations.punishOpenings > 0.1) {
    lines.push(`Punishing openings more (+${(adaptations.punishOpenings * 100).toFixed(0)}%)`);
  }
  if (adaptations.baitAndPunish > 0.1) {
    lines.push(`Setting up baits (+${(adaptations.baitAndPunish * 100).toFixed(0)}%)`);
  }
  if (adaptations.tempoAdjustment > 0.1) {
    lines.push('Increasing tempo');
  } else if (adaptations.tempoAdjustment < -0.1) {
    lines.push('Slowing down');
  }

  return lines.length > 0 ? lines.join('\n') : 'No significant adaptations';
}
