/**
 * Fighter definitions for Hopstrike
 * 8 unique kangaroo boxers with distinct styles
 */

import type { Fighter, FighterId } from '@/types';
import { createMove } from './moves';
import { SPECIAL_COMBOS } from './combos';

// ============================================================================
// FIGHTER ROSTER
// ============================================================================

const FIGHTERS: Record<FighterId, Fighter> = {
  // -------------------------------------------------------------------------
  // ROCKY ROO - The Classic Brawler
  // Balanced all-rounder, great for beginners
  // Combo: L → R → L → LH → RH (Easy)
  // -------------------------------------------------------------------------
  rocky_roo: {
    id: 'rocky_roo',
    name: 'Rocky Roo',
    nickname: 'The Outback Champion',
    description:
      'A balanced brawler from the red desert. Rocky fights with heart and determination.',
    primaryColor: '#D35400',
    secondaryColor: '#E67E22',
    stats: {
      maxHealth: 100,
      speed: 1.0,
      power: 1.0,
      defense: 1.0,
      meterRate: 1.0,
    },
    moves: {
      jab: createMove('jab'),
      hook: createMove('hook'),
      uppercut: createMove('uppercut'),
      block: createMove('block'),
      dodge: createMove('dodge'),
    },
    special: {
      id: 'outback_fury',
      name: 'Outback Fury',
      description: 'A devastating 5-hit combination that showcases classic boxing fundamentals',
      meterCost: 50,
      comboSequence: SPECIAL_COMBOS.rocky_roo,
      damage: 35,
      totalFrames: 90,
      failPenaltyFrames: 30,
      effectType: 'flurry',
    },
    rhythm: 'balanced',
  },

  // -------------------------------------------------------------------------
  // BELLA BOUNCE - The Speedster
  // Fast and agile, builds meter quickly
  // Combo: L → R → L → R → L → R (Hard - requires speed)
  // -------------------------------------------------------------------------
  bella_bounce: {
    id: 'bella_bounce',
    name: 'Bella Bounce',
    nickname: 'The Lightning Paw',
    description:
      'Fastest paws in the bush. Bella overwhelms opponents with blinding speed.',
    primaryColor: '#9B59B6',
    secondaryColor: '#8E44AD',
    stats: {
      maxHealth: 85,
      speed: 1.4,
      power: 0.8,
      defense: 0.85,
      meterRate: 1.3,
    },
    moves: {
      jab: createMove('jab', {
        startupFrames: 3,
        recoveryFrames: 4,
        damage: 4,
      }),
      hook: createMove('hook', {
        startupFrames: 6,
        recoveryFrames: 9,
        damage: 10,
      }),
      uppercut: createMove('uppercut', {
        startupFrames: 10,
        recoveryFrames: 14,
        damage: 14,
      }),
      block: createMove('block', { startupFrames: 1 }),
      dodge: createMove('dodge', {
        startupFrames: 2,
        activeFrames: 15,
        recoveryFrames: 5,
      }),
    },
    special: {
      id: 'thunder_rush',
      name: 'Thunder Rush',
      description: 'A blindingly fast 6-hit flurry of alternating jabs',
      meterCost: 45,
      comboSequence: SPECIAL_COMBOS.bella_bounce,
      damage: 30,
      totalFrames: 65,
      failPenaltyFrames: 25,
      effectType: 'rush',
    },
    rhythm: 'aggressive',
  },

  // -------------------------------------------------------------------------
  // THUNDER JACK - The Heavy Hitter
  // Slow but devastating power
  // Combo: B → B → LH → RH (Easy - forgiving timing)
  // -------------------------------------------------------------------------
  thunder_jack: {
    id: 'thunder_jack',
    name: 'Thunder Jack',
    nickname: 'The Mountain',
    description:
      'Built like a boulder. Every punch from Jack shakes the ground.',
    primaryColor: '#2C3E50',
    secondaryColor: '#34495E',
    stats: {
      maxHealth: 120,
      speed: 0.7,
      power: 1.4,
      defense: 1.2,
      meterRate: 0.9,
    },
    moves: {
      jab: createMove('jab', {
        startupFrames: 6,
        recoveryFrames: 8,
        damage: 7,
        hitStun: 14,
      }),
      hook: createMove('hook', {
        startupFrames: 12,
        recoveryFrames: 16,
        damage: 18,
        hitStun: 24,
      }),
      uppercut: createMove('uppercut', {
        startupFrames: 18,
        recoveryFrames: 22,
        damage: 26,
        hitStun: 32,
      }),
      block: createMove('block', { activeFrames: 40 }),
      dodge: createMove('dodge', {
        startupFrames: 5,
        recoveryFrames: 12,
      }),
    },
    special: {
      id: 'earthquake_punch',
      name: 'Earthquake Punch',
      description: 'Wind up behind your guard, then unleash earth-shattering power',
      meterCost: 70,
      comboSequence: SPECIAL_COMBOS.thunder_jack,
      damage: 55,
      totalFrames: 120,
      failPenaltyFrames: 50,
      effectType: 'knockout',
    },
    rhythm: 'defensive',
  },

  // -------------------------------------------------------------------------
  // SWIFT SALLY - The Counter Fighter
  // Excels at defensive play and counters
  // Combo: B → DL → DR → RH (Medium - timing on finisher)
  // -------------------------------------------------------------------------
  swift_sally: {
    id: 'swift_sally',
    name: 'Swift Sally',
    nickname: 'The Counter Queen',
    description:
      'Patience is her weapon. Sally waits for mistakes and punishes them hard.',
    primaryColor: '#1ABC9C',
    secondaryColor: '#16A085',
    stats: {
      maxHealth: 95,
      speed: 1.1,
      power: 1.1,
      defense: 1.0,
      meterRate: 1.2,
    },
    moves: {
      jab: createMove('jab', { meterGain: 4 }),
      hook: createMove('hook', { meterGain: 8 }),
      uppercut: createMove('uppercut', { meterGain: 12, damage: 20 }),
      block: createMove('block', {
        startupFrames: 1,
        recoveryFrames: 2,
      }),
      dodge: createMove('dodge', {
        startupFrames: 2,
        activeFrames: 14,
        meterGain: 5,
      }),
    },
    special: {
      id: 'perfect_counter',
      name: 'Perfect Counter',
      description: 'Parry, weave through danger, and strike with perfect timing',
      meterCost: 40,
      comboSequence: SPECIAL_COMBOS.swift_sally,
      damage: 42,
      totalFrames: 55,
      failPenaltyFrames: 35,
      effectType: 'counter',
    },
    rhythm: 'technical',
  },

  // -------------------------------------------------------------------------
  // IRON JOEY - The Tank
  // Maximum defense, slow but unstoppable
  // Combo: B → B → B → LH → RH (Medium - many inputs)
  // -------------------------------------------------------------------------
  iron_joey: {
    id: 'iron_joey',
    name: 'Iron Joey',
    nickname: 'The Unbreakable',
    description:
      'Nothing stops Joey. He takes hits like they are nothing and keeps coming.',
    primaryColor: '#7F8C8D',
    secondaryColor: '#95A5A6',
    stats: {
      maxHealth: 130,
      speed: 0.6,
      power: 1.0,
      defense: 1.5,
      meterRate: 0.8,
    },
    moves: {
      jab: createMove('jab', {
        startupFrames: 5,
        recoveryFrames: 7,
      }),
      hook: createMove('hook', {
        startupFrames: 10,
        recoveryFrames: 14,
      }),
      uppercut: createMove('uppercut', {
        startupFrames: 16,
        recoveryFrames: 20,
      }),
      block: createMove('block', {
        startupFrames: 1,
        activeFrames: 50,
        recoveryFrames: 3,
      }),
      dodge: createMove('dodge', {
        startupFrames: 6,
        recoveryFrames: 14,
      }),
    },
    special: {
      id: 'iron_fortress',
      name: 'Iron Fortress',
      description: 'Build an impenetrable defense, then explode with crushing power',
      meterCost: 60,
      comboSequence: SPECIAL_COMBOS.iron_joey,
      damage: 48,
      totalFrames: 100,
      failPenaltyFrames: 40,
      effectType: 'counter',
    },
    rhythm: 'defensive',
  },

  // -------------------------------------------------------------------------
  // WILD WALLY - The Unpredictable
  // Chaotic fighting style, high risk high reward
  // Combo: RH → LH → R → LH → RH (Hard - unorthodox pattern)
  // -------------------------------------------------------------------------
  wild_wally: {
    id: 'wild_wally',
    name: 'Wild Wally',
    nickname: 'The Loose Cannon',
    description:
      'Nobody knows what Wally will do next. Not even Wally. Pure chaos in boxing gloves.',
    primaryColor: '#E74C3C',
    secondaryColor: '#C0392B',
    stats: {
      maxHealth: 90,
      speed: 1.2,
      power: 1.3,
      defense: 0.8,
      meterRate: 1.1,
    },
    moves: {
      jab: createMove('jab', {
        damage: 6,
        startupFrames: 3,
        recoveryFrames: 7,
      }),
      hook: createMove('hook', {
        damage: 15,
        startupFrames: 7,
        recoveryFrames: 14,
      }),
      uppercut: createMove('uppercut', {
        damage: 22,
        startupFrames: 12,
        recoveryFrames: 20,
      }),
      block: createMove('block', {
        activeFrames: 20,
        recoveryFrames: 6,
      }),
      dodge: createMove('dodge', {
        startupFrames: 2,
        activeFrames: 10,
        recoveryFrames: 10,
      }),
    },
    special: {
      id: 'wild_flurry',
      name: 'Wild Flurry',
      description: 'An unpredictable barrage starting with a lead uppercut - pure chaos!',
      meterCost: 35,
      comboSequence: SPECIAL_COMBOS.wild_wally,
      damage: 40,
      totalFrames: 75,
      failPenaltyFrames: 38,
      effectType: 'flurry',
    },
    rhythm: 'aggressive',
  },

  // -------------------------------------------------------------------------
  // DUCHESS DOT - The Elegant Fighter
  // Precise and technical, rewards skill
  // Combo: L → L → R → R → LH → RH → LH (Expert - longest combo)
  // -------------------------------------------------------------------------
  duchess_dot: {
    id: 'duchess_dot',
    name: 'Duchess Dot',
    nickname: 'The Aristocrat',
    description:
      'Boxing is an art form to Dot. Every punch is placed with surgical precision.',
    primaryColor: '#F39C12',
    secondaryColor: '#D68910',
    stats: {
      maxHealth: 90,
      speed: 1.0,
      power: 1.15,
      defense: 0.9,
      meterRate: 1.15,
    },
    moves: {
      jab: createMove('jab', {
        damage: 6,
        meterGain: 4,
        hitStun: 12,
      }),
      hook: createMove('hook', {
        damage: 14,
        meterGain: 8,
        hitStun: 20,
      }),
      uppercut: createMove('uppercut', {
        damage: 20,
        meterGain: 12,
        hitStun: 28,
      }),
      block: createMove('block', {
        startupFrames: 2,
        recoveryFrames: 3,
      }),
      dodge: createMove('dodge', {
        startupFrames: 3,
        activeFrames: 13,
        recoveryFrames: 6,
        meterGain: 3,
      }),
    },
    special: {
      id: 'royal_combination',
      name: 'Royal Combination',
      description: 'A perfectly executed 7-hit sequence - the pinnacle of boxing technique',
      meterCost: 55,
      comboSequence: SPECIAL_COMBOS.duchess_dot,
      damage: 50,
      totalFrames: 95,
      failPenaltyFrames: 30,
      effectType: 'flurry',
    },
    rhythm: 'technical',
  },

  // -------------------------------------------------------------------------
  // BRAWLER BRUCE - The Pressure Fighter
  // Constant aggression, wears opponents down
  // Combo: L → L → L → R → LH → RH (Medium - sustained pressure)
  // -------------------------------------------------------------------------
  brawler_bruce: {
    id: 'brawler_bruce',
    name: 'Brawler Bruce',
    nickname: 'The Relentless',
    description:
      'Bruce never stops coming. Endless pressure until you break.',
    primaryColor: '#27AE60',
    secondaryColor: '#229954',
    stats: {
      maxHealth: 105,
      speed: 1.1,
      power: 1.05,
      defense: 0.95,
      meterRate: 1.0,
    },
    moves: {
      jab: createMove('jab', {
        damage: 5,
        startupFrames: 4,
        recoveryFrames: 5,
        meterGain: 4,
      }),
      hook: createMove('hook', {
        damage: 11,
        startupFrames: 7,
        recoveryFrames: 10,
        meterGain: 7,
      }),
      uppercut: createMove('uppercut', {
        damage: 16,
        startupFrames: 12,
        recoveryFrames: 15,
        meterGain: 11,
      }),
      block: createMove('block', {
        activeFrames: 25,
        recoveryFrames: 5,
      }),
      dodge: createMove('dodge', {
        startupFrames: 3,
        activeFrames: 11,
        recoveryFrames: 7,
      }),
    },
    special: {
      id: 'relentless_assault',
      name: 'Relentless Assault',
      description: 'Sustained body work that breaks down defenses before the knockout blow',
      meterCost: 45,
      comboSequence: SPECIAL_COMBOS.brawler_bruce,
      damage: 36,
      totalFrames: 85,
      failPenaltyFrames: 28,
      effectType: 'rush',
    },
    rhythm: 'aggressive',
  },
};

// ============================================================================
// EXPORTS
// ============================================================================

export const getFighter = (id: FighterId): Fighter => {
  return FIGHTERS[id];
};

export const getAllFighters = (): Fighter[] => {
  return Object.values(FIGHTERS);
};

export const getFighterIds = (): FighterId[] => {
  return Object.keys(FIGHTERS) as FighterId[];
};

export { FIGHTERS };
