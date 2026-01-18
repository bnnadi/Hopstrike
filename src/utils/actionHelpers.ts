/**
 * Action Helper Utilities
 * Shared functions for determining action types across AI systems
 */

import type { TapZone } from '@/types';
import type { AIAction } from '@/types/ai';

/**
 * Check if an AI action is offensive (attack-based)
 */
export function isOffensiveAIAction(action: AIAction): boolean {
  return (
    action === 'jab_left' ||
    action === 'jab_right' ||
    action === 'hook' ||
    action === 'uppercut' ||
    action === 'special'
  );
}

/**
 * Check if an AI action is defensive (block/dodge)
 */
export function isDefensiveAIAction(action: AIAction): boolean {
  return (
    action === 'block' ||
    action === 'dodge_left' ||
    action === 'dodge_right'
  );
}

/**
 * Check if a tap zone action is offensive (attack-based)
 */
export function isOffensiveTapZone(action: TapZone | 'idle'): boolean {
  return (
    action === 'left_light' ||
    action === 'right_light' ||
    action === 'left_heavy' ||
    action === 'right_heavy'
  );
}

/**
 * Check if a tap zone action is defensive (block/dodge)
 */
export function isDefensiveTapZone(action: TapZone | 'idle'): boolean {
  return (
    action === 'block' ||
    action === 'dodge_left' ||
    action === 'dodge_right'
  );
}
