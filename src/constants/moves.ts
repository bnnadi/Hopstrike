/**
 * Base move definitions
 * These are template moves that fighters can customize
 */

import type { Move } from '@/types';

export const BASE_MOVES: Record<string, Move> = {
  // Light, fast jab
  jab: {
    id: 'jab',
    type: 'jab',
    name: 'Jab',
    damage: 5,
    startupFrames: 4,
    activeFrames: 3,
    recoveryFrames: 6,
    meterGain: 3,
    meterGainOnBlock: 1,
    blockable: true,
    hitStun: 10,
    blockStun: 5,
  },

  // Medium speed, good damage hook
  hook: {
    id: 'hook',
    type: 'hook',
    name: 'Hook',
    damage: 12,
    startupFrames: 8,
    activeFrames: 4,
    recoveryFrames: 12,
    meterGain: 6,
    meterGainOnBlock: 2,
    blockable: true,
    hitStun: 18,
    blockStun: 10,
  },

  // Slow but powerful uppercut
  uppercut: {
    id: 'uppercut',
    type: 'uppercut',
    name: 'Uppercut',
    damage: 18,
    startupFrames: 14,
    activeFrames: 5,
    recoveryFrames: 18,
    meterGain: 10,
    meterGainOnBlock: 4,
    blockable: true,
    hitStun: 25,
    blockStun: 15,
  },

  // Defensive block
  block: {
    id: 'block',
    type: 'block',
    name: 'Block',
    damage: 0,
    startupFrames: 2,
    activeFrames: 30,
    recoveryFrames: 4,
    meterGain: 0,
    meterGainOnBlock: 0,
    blockable: false,
    hitStun: 0,
    blockStun: 0,
  },

  // Evasive dodge
  dodge: {
    id: 'dodge',
    type: 'dodge',
    name: 'Dodge',
    damage: 0,
    startupFrames: 3,
    activeFrames: 12,
    recoveryFrames: 8,
    meterGain: 2,
    meterGainOnBlock: 0,
    blockable: false,
    hitStun: 0,
    blockStun: 0,
  },
};

/**
 * Create a customized move by overriding base values
 */
export function createMove(
  baseType: keyof typeof BASE_MOVES,
  overrides: Partial<Move> = {},
): Move {
  const base = BASE_MOVES[baseType];
  return {
    ...base,
    ...overrides,
    id: overrides.id ?? base.id,
  };
}
