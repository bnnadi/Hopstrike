/**
 * Maps roster fighters onto exported pixel-art sprites.
 * Label color is palette.light when its sRGB relative luminance is above
 * 0.35, otherwise palette.glove_hi.
 */

import manifest from '@/assets/sprites/manifest.json';
import type { FighterId, FighterState, Move, SpecialMove } from '@/types';

const ROSTER = {
  rocky_roo: 'spike',
  bella_bounce: 'big_t',
  thunder_jack: 'eris',
  swift_sally: 'jaquontavius',
  iron_joey: 'jecka',
  wild_wally: 'juno',
  duchess_dot: 'nana',
  brawler_bruce: 'lord_of_darkness',
} as const satisfies Record<FighterId, keyof typeof manifest.fighters>;

export type SpriteId = (typeof ROSTER)[FighterId];

export const FRAME_FILES = {
  idle: '01_idle.png',
  jab: '02_jab.png',
  straight: '03_straight.png',
  follow_a: '04_follow_a.png',
  follow_b: '05_follow_b.png',
  lean: '06_lean.png',
  guard: '07_guard.png',
  face: '08_face.png',
  head_back: '09_head_back.png',
  low: '10_low.png',
} as const;

export type SpritePose = keyof typeof FRAME_FILES;

export interface SpriteCast {
  spriteId: SpriteId;
  name: string;
  labelColor: string;
}

type PoseMove = Move | SpecialMove | { type?: string } | null;

function linearize(channel: number): number {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function relativeLuminance(hex: string): number {
  const normalized = hex.replace('#', '');
  const r = linearize(parseInt(normalized.slice(0, 2), 16));
  const g = linearize(parseInt(normalized.slice(2, 4), 16));
  const b = linearize(parseInt(normalized.slice(4, 6), 16));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function labelColorFor(light: string, gloveHi: string): string {
  return relativeLuminance(light) > 0.35 ? light : gloveHi;
}

export function getSpriteCast(fighterId: FighterId): SpriteCast {
  const spriteId = ROSTER[fighterId];
  const fighter = manifest.fighters[spriteId];
  return {
    spriteId,
    name: fighter.name,
    labelColor: labelColorFor(fighter.palette.light, fighter.palette.glove_hi),
  };
}

function poseForAttack(currentMove: PoseMove): SpritePose {
  if (currentMove === null || !('type' in currentMove)) {
    return 'jab';
  }
  if (currentMove.type === 'hook') {
    return 'follow_a';
  }
  if (currentMove.type === 'uppercut') {
    return 'straight';
  }
  return 'jab';
}

export function poseFor(state: FighterState, currentMove: PoseMove): SpritePose {
  switch (state) {
    case 'idle':
      return 'idle';
    case 'moving_forward':
    case 'moving_backward':
      return 'lean';
    case 'attacking':
      return poseForAttack(currentMove);
    case 'blocking':
    case 'block_stun':
      return 'guard';
    case 'dodging':
    case 'knocked_down':
      return 'low';
    case 'hit_stun':
      return 'head_back';
    case 'vulnerable':
      return 'face';
    case 'special':
      return 'follow_b';
    default: {
      const exhaustive: never = state;
      return exhaustive;
    }
  }
}

export function frameFile(pose: SpritePose): string {
  return FRAME_FILES[pose];
}
