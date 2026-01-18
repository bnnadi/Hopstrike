/**
 * AI Engine for Hopstrike
 * Main entry point for AI opponent behavior
 *
 * This engine provides intelligent, adaptive opponents that:
 * - Follow identical combat rules as human players
 * - Learn and adapt to player patterns
 * - Have unique personalities per fighter
 * - Scale difficulty through execution quality, not power
 */

import type {
  MatchState,
  TapZone,
  TapEvent,
  GameConfig,
  FighterId,
} from '@/types';
import { DEFAULT_GAME_CONFIG } from '@/types';
import type { AIDifficulty, AIBrainState } from '@/types/ai';
import {
  initializeBrain,
  getBrain,
  resetBrain,
  makeDecision,
  onRoundEnd,
  DIFFICULTY_CONFIGS,
} from './aiBrain';
import { recordPlayerAction, resetObservationData } from './aiObserver';
import { canAct } from './gameEngine';

// ============================================================================
// RE-EXPORTS
// ============================================================================

export type { AIDifficulty } from '@/types/ai';
export { DIFFICULTY_CONFIGS };

// ============================================================================
// AI STATE MANAGEMENT
// ============================================================================

interface AIEngineState {
  matchId: string;
  difficulty: AIDifficulty;
  brain: AIBrainState | null;
  lastRound: number;
  isInitialized: boolean;
}

const engineStates = new Map<string, AIEngineState>();

/**
 * Initialize AI for a new match
 */
export function initializeAI(
  matchId: string,
  fighterId: FighterId,
  difficulty: AIDifficulty = 'medium',
): void {
  // Clean up any existing state
  resetAIState(matchId);

  // Initialize brain
  const brain = initializeBrain(matchId, fighterId, difficulty);

  engineStates.set(matchId, {
    matchId,
    difficulty,
    brain,
    lastRound: 1,
    isInitialized: true,
  });
}

/**
 * Reset all AI state for a match
 */
export function resetAIState(matchId: string): void {
  resetBrain(matchId);
  resetObservationData(matchId);
  engineStates.delete(matchId);
}

/**
 * Get engine state (for debugging)
 */
export function getAIEngineState(matchId: string): AIEngineState | null {
  return engineStates.get(matchId) || null;
}

// ============================================================================
// MAIN UPDATE FUNCTION
// ============================================================================

/**
 * Update AI and return action to execute (if any)
 */
export function updateAI(
  state: MatchState,
  matchId: string,
  difficulty: AIDifficulty = 'medium',
  _gameConfig: GameConfig = DEFAULT_GAME_CONFIG,
): TapEvent | null {
  // Only process if player 2 is AI
  if (!state.player2.isAI) {
    return null;
  }

  // Get or initialize engine state
  let engineState = engineStates.get(matchId);

  if (!engineState || !engineState.isInitialized) {
    // Auto-initialize if needed
    initializeAI(matchId, state.player2.fighter.id, difficulty);
    engineState = engineStates.get(matchId)!;
  }

  const brain = engineState.brain;
  if (!brain) {
    return null;
  }

  // Check for round transitions
  if (state.roundNumber > engineState.lastRound) {
    onRoundEnd(brain, state);
    engineState.lastRound = state.roundNumber;
  }

  // Don't act during non-fighting states
  if (state.roundState !== 'fighting') {
    return null;
  }

  // Make decision
  const action = makeDecision(brain, state);

  if (action) {
    return {
      zone: action,
      timestamp: Date.now(),
      playerId: 'right',
    };
  }

  return null;
}

// ============================================================================
// PLAYER ACTION RECORDING
// ============================================================================

/**
 * Record a player action for AI observation
 * Call this whenever the human player performs an action
 */
export function recordPlayerInput(
  matchId: string,
  event: TapEvent,
  state: MatchState,
  result: 'hit' | 'blocked' | 'dodged' | 'whiffed' | 'none',
): void {
  if (event.playerId !== 'left') {
    return; // Only track human player
  }

  recordPlayerAction(matchId, event, state, result);
}

// ============================================================================
// DIFFICULTY HELPERS
// ============================================================================

/**
 * Get all available difficulty levels
 */
export function getAllDifficulties(): AIDifficulty[] {
  return ['easy', 'medium', 'hard', 'expert'];
}

/**
 * Get human-readable difficulty description
 */
export function getDifficultyDescription(difficulty: AIDifficulty): string {
  switch (difficulty) {
    case 'easy':
      return 'Slow reactions, makes frequent mistakes. Great for learning.';
    case 'medium':
      return 'Balanced challenge. Adapts to your patterns over time.';
    case 'hard':
      return 'Quick reactions, consistent execution. Tests your skills.';
    case 'expert':
      return 'Near-perfect execution. Only for the most skilled boxers.';
  }
}

/**
 * Get difficulty config for a level
 */
export function getAIDifficultyConfig(difficulty: AIDifficulty) {
  return DIFFICULTY_CONFIGS[difficulty];
}

// ============================================================================
// DEBUG UTILITIES
// ============================================================================

/**
 * Get current AI adaptation summary (for debug display)
 */
export function getAIDebugInfo(matchId: string): {
  personality: string;
  adaptations: string[];
  confidence: number;
} | null {
  const engineState = engineStates.get(matchId);
  if (!engineState?.brain) {
    return null;
  }

  const brain = engineState.brain;
  const adaptations: string[] = [];

  const a = brain.adaptations;
  if (a.blockAgainstHeavy > 0.1) {
    adaptations.push(`Blocking heavy +${(a.blockAgainstHeavy * 100).toFixed(0)}%`);
  }
  if (a.punishOpenings > 0.1) {
    adaptations.push(`Punishing +${(a.punishOpenings * 100).toFixed(0)}%`);
  }
  if (a.baitAndPunish > 0.1) {
    adaptations.push(`Baiting +${(a.baitAndPunish * 100).toFixed(0)}%`);
  }
  if (a.tempoAdjustment < -0.1) {
    adaptations.push('Slowing tempo');
  } else if (a.tempoAdjustment > 0.1) {
    adaptations.push('Increasing tempo');
  }

  return {
    personality: brain.personality.fighterId,
    adaptations,
    confidence: brain.observations.confidence,
  };
}
