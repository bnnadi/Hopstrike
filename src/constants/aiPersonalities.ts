/**
 * AI Personality Definitions
 * Each kangaroo has a unique personality that defines their fighting style
 *
 * Personality affects HOW the AI fights, not HOW WELL
 */

import type { AIPersonality } from '@/types/ai';
import type { FighterId } from '@/types';

// ============================================================================
// FIGHTER PERSONALITIES
// ============================================================================

export const AI_PERSONALITIES: Record<FighterId, AIPersonality> = {
  // ---------------------------------------------------------------------------
  // ROCKY ROO - The Classic Brawler
  // Balanced, fundamentals-focused, adapts well
  // ---------------------------------------------------------------------------
  rocky_roo: {
    fighterId: 'rocky_roo',
    aggression: 0.5,
    defensiveBias: 0.5,
    riskTolerance: 0.4,
    comboDiscipline: 0.6,
    preferredRange: 0.5,
    patience: 0.5,
    punishmentFocus: 0.5,
    specialCaution: 0.5,
    specialConfidence: 0.6,
    weights: {
      jab: 1.0,
      hook: 0.8,
      uppercut: 0.7,
      block: 0.8,
      dodge: 0.6,
      special: 0.7,
    },
  },

  // ---------------------------------------------------------------------------
  // BELLA BOUNCE - The Speedster
  // Aggressive, loves jabs, takes risks
  // ---------------------------------------------------------------------------
  bella_bounce: {
    fighterId: 'bella_bounce',
    aggression: 0.8,
    defensiveBias: 0.3,
    riskTolerance: 0.7,
    comboDiscipline: 0.4,
    preferredRange: 0.3, // Likes to get close
    patience: 0.2,
    punishmentFocus: 0.3,
    specialCaution: 0.3,
    specialConfidence: 0.8,
    weights: {
      jab: 1.5, // Loves jabs
      hook: 0.6,
      uppercut: 0.5,
      block: 0.4,
      dodge: 1.2, // Good at dodging
      special: 0.8,
    },
  },

  // ---------------------------------------------------------------------------
  // THUNDER JACK - The Heavy Hitter
  // Patient, power-focused, waits for openings
  // ---------------------------------------------------------------------------
  thunder_jack: {
    fighterId: 'thunder_jack',
    aggression: 0.3,
    defensiveBias: 0.7,
    riskTolerance: 0.3,
    comboDiscipline: 0.7,
    preferredRange: 0.6, // Slight distance preference
    patience: 0.8,
    punishmentFocus: 0.9, // Lives to punish
    specialCaution: 0.6,
    specialConfidence: 0.5,
    weights: {
      jab: 0.5,
      hook: 1.2, // Loves hooks
      uppercut: 1.3, // Loves uppercuts
      block: 1.2, // Patient blocker
      dodge: 0.4,
      special: 0.9,
    },
  },

  // ---------------------------------------------------------------------------
  // SWIFT SALLY - The Counter Fighter
  // Defensive, reactive, punishes hard
  // ---------------------------------------------------------------------------
  swift_sally: {
    fighterId: 'swift_sally',
    aggression: 0.25,
    defensiveBias: 0.4, // Balanced defense
    riskTolerance: 0.5,
    comboDiscipline: 0.8,
    preferredRange: 0.5,
    patience: 0.9, // Extremely patient
    punishmentFocus: 1.0, // Maximum punishment focus
    specialCaution: 0.4, // Counter special is risky
    specialConfidence: 0.9, // Very confident in counter
    weights: {
      jab: 0.6,
      hook: 0.7,
      uppercut: 1.0, // Counter uppercut
      block: 1.0,
      dodge: 1.3, // Master dodger
      special: 1.0,
    },
  },

  // ---------------------------------------------------------------------------
  // IRON JOEY - The Tank
  // Defensive wall, absorbs damage, counter-punches
  // ---------------------------------------------------------------------------
  iron_joey: {
    fighterId: 'iron_joey',
    aggression: 0.2,
    defensiveBias: 0.9, // Heavily block-focused
    riskTolerance: 0.2,
    comboDiscipline: 0.6,
    preferredRange: 0.3, // Gets in your face
    patience: 0.7,
    punishmentFocus: 0.6,
    specialCaution: 0.7,
    specialConfidence: 0.6,
    weights: {
      jab: 0.6,
      hook: 0.9,
      uppercut: 0.8,
      block: 1.5, // Loves to block
      dodge: 0.3, // Rarely dodges
      special: 0.7,
    },
  },

  // ---------------------------------------------------------------------------
  // WILD WALLY - The Unpredictable
  // Chaotic, high variance, takes big risks
  // ---------------------------------------------------------------------------
  wild_wally: {
    fighterId: 'wild_wally',
    aggression: 0.7,
    defensiveBias: 0.3,
    riskTolerance: 0.9, // Maximum risk
    comboDiscipline: 0.2, // Freestyler
    preferredRange: 0.4,
    patience: 0.2,
    punishmentFocus: 0.4,
    specialCaution: 0.1, // Throws specials freely
    specialConfidence: 0.5,
    weights: {
      jab: 0.7,
      hook: 1.1,
      uppercut: 1.2, // Lead uppercut style
      block: 0.5,
      dodge: 0.8,
      special: 1.1,
    },
  },

  // ---------------------------------------------------------------------------
  // DUCHESS DOT - The Elegant Fighter
  // Technical, precise, calculated
  // ---------------------------------------------------------------------------
  duchess_dot: {
    fighterId: 'duchess_dot',
    aggression: 0.45,
    defensiveBias: 0.5,
    riskTolerance: 0.3,
    comboDiscipline: 1.0, // Perfect combo discipline
    preferredRange: 0.5,
    patience: 0.7,
    punishmentFocus: 0.8,
    specialCaution: 0.8, // Very careful with specials
    specialConfidence: 0.95, // But extremely precise
    weights: {
      jab: 1.0,
      hook: 0.9,
      uppercut: 0.9,
      block: 0.9,
      dodge: 0.9,
      special: 0.85, // Calculated special use
    },
  },

  // ---------------------------------------------------------------------------
  // BRAWLER BRUCE - The Pressure Fighter
  // Relentless, in-your-face, wears you down
  // ---------------------------------------------------------------------------
  brawler_bruce: {
    fighterId: 'brawler_bruce',
    aggression: 0.85,
    defensiveBias: 0.4,
    riskTolerance: 0.6,
    comboDiscipline: 0.5,
    preferredRange: 0.2, // Wants to be close
    patience: 0.1, // Never stops
    punishmentFocus: 0.4,
    specialCaution: 0.4,
    specialConfidence: 0.7,
    weights: {
      jab: 1.3, // Body jab spam
      hook: 0.9,
      uppercut: 0.7,
      block: 0.5,
      dodge: 0.5,
      special: 0.8,
    },
  },
};

// ============================================================================
// PERSONALITY HELPERS
// ============================================================================

export function getPersonality(fighterId: FighterId): AIPersonality {
  return AI_PERSONALITIES[fighterId];
}

/**
 * Get a description of the AI's fighting style for UI display
 */
export function getPersonalityDescription(fighterId: FighterId): string {
  const personality = AI_PERSONALITIES[fighterId];

  const traits: string[] = [];

  if (personality.aggression >= 0.7) traits.push('Aggressive');
  else if (personality.aggression <= 0.3) traits.push('Defensive');

  if (personality.patience >= 0.7) traits.push('Patient');
  else if (personality.patience <= 0.3) traits.push('Impatient');

  if (personality.riskTolerance >= 0.7) traits.push('Risk-Taker');
  else if (personality.riskTolerance <= 0.3) traits.push('Cautious');

  if (personality.punishmentFocus >= 0.8) traits.push('Punisher');
  if (personality.comboDiscipline >= 0.8) traits.push('Technical');

  return traits.join(' • ') || 'Balanced';
}
