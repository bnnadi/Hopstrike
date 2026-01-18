/**
 * AI Observer System
 * Tracks player patterns and computes tendencies for adaptation
 *
 * Design principles:
 * - Lightweight data collection
 * - Deterministic analysis
 * - Privacy-respecting (no external data)
 */

import type {
  ActionRecord,
  ObservationData,
  PlayerTendencies,
  RoundSummary,
} from '@/types/ai';
import { DEFAULT_TENDENCIES } from '@/types/ai';
import type { MatchState, TapZone, TapEvent, FighterState } from '@/types';
import { isOffensiveTapZone, isDefensiveTapZone } from '@/utils';

// ============================================================================
// CONSTANTS
// ============================================================================

/** Minimum observations for reliable tendencies */
const MIN_OBSERVATIONS_FOR_CONFIDENCE = 10;

/** Maximum action history to keep (performance) */
const MAX_ACTION_HISTORY = 200;

/** Weight for recent actions vs older ones */
const RECENCY_WEIGHT = 0.7;

// ============================================================================
// OBSERVER STATE
// ============================================================================

const observerStates = new Map<string, ObservationData>();

export function getObservationData(matchId: string): ObservationData {
  if (!observerStates.has(matchId)) {
    observerStates.set(matchId, createEmptyObservationData());
  }
  return observerStates.get(matchId)!;
}

export function resetObservationData(matchId: string): void {
  observerStates.delete(matchId);
}

function createEmptyObservationData(): ObservationData {
  return {
    actionHistory: [],
    tendencies: { ...DEFAULT_TENDENCIES },
    roundSummaries: [],
    totalFramesObserved: 0,
    confidence: 0,
  };
}

// ============================================================================
// ACTION RECORDING
// ============================================================================

/**
 * Record a player action for pattern analysis
 */
export function recordPlayerAction(
  matchId: string,
  event: TapEvent,
  state: MatchState,
  result: ActionRecord['result'],
): void {
  const data = getObservationData(matchId);

  const record: ActionRecord = {
    frame: state.frameCount,
    action: event.zone,
    result,
    context: {
      inRange: getInRange(state),
      playerHealth: state.player1.health / state.player1.fighter.stats.maxHealth,
      opponentHealth: state.player2.health / state.player2.fighter.stats.maxHealth,
      playerMeter: state.player1.meter,
      opponentState: state.player2.state,
    },
  };

  data.actionHistory.push(record);
  data.totalFramesObserved = state.frameCount;

  // Trim old history for performance
  if (data.actionHistory.length > MAX_ACTION_HISTORY) {
    data.actionHistory = data.actionHistory.slice(-MAX_ACTION_HISTORY);
  }
}

function getInRange(state: MatchState): boolean {
  const distance = Math.abs(state.player1.position - state.player2.position);
  return distance <= 25; // Default attack range
}

// ============================================================================
// TENDENCY COMPUTATION
// ============================================================================

/**
 * Analyze recorded actions and compute player tendencies
 * Called between rounds or periodically
 */
export function computeTendencies(matchId: string): PlayerTendencies {
  const data = getObservationData(matchId);
  const history = data.actionHistory;

  if (history.length < 3) {
    return { ...DEFAULT_TENDENCIES };
  }

  const tendencies: PlayerTendencies = { ...DEFAULT_TENDENCIES };

  // Count action types with recency weighting
  const actionCounts = computeActionCounts(history);
  const totalActions = Object.values(actionCounts).reduce((a, b) => a + b, 0);

  if (totalActions > 0) {
    // Attack frequencies
    const jabCount = actionCounts.left_light + actionCounts.right_light;
    const hookCount = actionCounts.left_heavy;
    const uppercutCount = actionCounts.right_heavy;
    const attackTotal = jabCount + hookCount + uppercutCount;

    if (attackTotal > 0) {
      tendencies.jabFrequency = jabCount / attackTotal;
      tendencies.hookFrequency = hookCount / attackTotal;
      tendencies.uppercutFrequency = uppercutCount / attackTotal;

      // Light vs Heavy
      const lightTotal = jabCount;
      const heavyTotal = hookCount + uppercutCount;
      tendencies.lightVsHeavyRatio = heavyTotal / (lightTotal + heavyTotal);
    }

    // Defensive patterns
    const blockCount = actionCounts.block;
    const dodgeCount = actionCounts.dodge_left + actionCounts.dodge_right;
    const defenseTotal = blockCount + dodgeCount;

    if (defenseTotal > 0) {
      tendencies.blockVsDodgeRatio = dodgeCount / defenseTotal;
    }
  }

  // Analyze patterns
  tendencies.commonStarters = findCommonStarters(history);
  tendencies.averageComboLength = computeAverageComboLength(history);
  tendencies.comboAttemptRate = computeComboAttemptRate(history);

  // Analyze defensive reactions
  tendencies.defensiveReactionRate = computeDefensiveReactionRate(history);
  tendencies.counterAttackRate = computeCounterAttackRate(history);

  // Analyze recovery patterns
  tendencies.whiffRecoveryAction = findWhiffRecoveryPattern(history);
  tendencies.postBlockAction = findPostBlockPattern(history);

  // Analyze panic behavior (low health actions)
  tendencies.panicBehavior = analyzePanicBehavior(history);

  // Update confidence based on sample size
  data.confidence = Math.min(1, history.length / MIN_OBSERVATIONS_FOR_CONFIDENCE);
  data.tendencies = tendencies;

  return tendencies;
}

// ============================================================================
// ANALYSIS HELPERS
// ============================================================================

interface ActionCounts {
  left_light: number;
  right_light: number;
  left_heavy: number;
  right_heavy: number;
  block: number;
  dodge_left: number;
  dodge_right: number;
  idle: number;
}

function computeActionCounts(history: ActionRecord[]): ActionCounts {
  const counts: ActionCounts = {
    left_light: 0,
    right_light: 0,
    left_heavy: 0,
    right_heavy: 0,
    block: 0,
    dodge_left: 0,
    dodge_right: 0,
    idle: 0,
  };

  const totalActions = history.length;

  history.forEach((record, index) => {
    // Apply recency weighting
    const recencyFactor =
      RECENCY_WEIGHT + ((1 - RECENCY_WEIGHT) * index) / totalActions;

    const action = record.action;
    if (action in counts) {
      counts[action as keyof ActionCounts] += recencyFactor;
    }
  });

  return counts;
}

function findCommonStarters(history: ActionRecord[]): TapZone[] {
  // Find actions that commonly start attack sequences
  const starterCounts: Record<string, number> = {};
  const windowSize = 5; // Frames to consider as "starting" an attack

  for (let i = 1; i < history.length; i++) {
    const current = history[i];
    const previous = history[i - 1];

    // Check if this looks like a combo starter
    const isOffensive = isOffensiveAction(current.action);
    const prevWasIdle =
      previous.action === 'idle' ||
      previous.frame < current.frame - windowSize * 60;

    if (isOffensive && prevWasIdle) {
      const action = current.action;
      if (action !== 'idle') {
        starterCounts[action] = (starterCounts[action] || 0) + 1;
      }
    }
  }

  // Sort by frequency and return top starters
  return Object.entries(starterCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([action]) => action as TapZone);
}

function computeAverageComboLength(history: ActionRecord[]): number {
  if (history.length < 2) return 1;

  const comboLengths: number[] = [];
  let currentComboLength = 0;
  let lastFrame = 0;

  for (const record of history) {
    const isOffensive = isOffensiveAction(record.action);

    if (isOffensive) {
      // Check if this continues a combo (within reasonable time)
      if (record.frame - lastFrame < 60) {
        // Within 1 second
        currentComboLength++;
      } else {
        // New combo started
        if (currentComboLength > 0) {
          comboLengths.push(currentComboLength);
        }
        currentComboLength = 1;
      }
      lastFrame = record.frame;
    }
  }

  if (currentComboLength > 0) {
    comboLengths.push(currentComboLength);
  }

  if (comboLengths.length === 0) return 1;

  return comboLengths.reduce((a, b) => a + b, 0) / comboLengths.length;
}

function computeComboAttemptRate(history: ActionRecord[]): number {
  if (history.length < 5) return 0.3;

  let comboAttempts = 0;
  let attackSequences = 0;
  let lastFrame = 0;
  let sequenceLength = 0;

  for (const record of history) {
    if (isOffensiveAction(record.action)) {
      if (record.frame - lastFrame < 45) {
        // Quick follow-up
        sequenceLength++;
      } else {
        if (sequenceLength > 0) {
          attackSequences++;
          if (sequenceLength >= 2) comboAttempts++;
        }
        sequenceLength = 1;
      }
      lastFrame = record.frame;
    }
  }

  if (attackSequences === 0) return 0.3;
  return comboAttempts / attackSequences;
}

function computeDefensiveReactionRate(history: ActionRecord[]): number {
  // How often does player defend when opponent is attacking?
  let attackedCount = 0;
  let defendedCount = 0;

  for (const record of history) {
    if (
      record.context.opponentState === 'attacking' ||
      record.context.opponentState === 'special'
    ) {
      attackedCount++;
      if (isDefensiveAction(record.action)) {
        defendedCount++;
      }
    }
  }

  if (attackedCount === 0) return 0.5;
  return defendedCount / attackedCount;
}

function computeCounterAttackRate(history: ActionRecord[]): number {
  // How often does player attack after blocking?
  let blockCount = 0;
  let counterCount = 0;

  for (let i = 1; i < history.length; i++) {
    const current = history[i];
    const previous = history[i - 1];

    if (previous.action === 'block' && previous.result === 'blocked') {
      blockCount++;
      if (isOffensiveAction(current.action)) {
        counterCount++;
      }
    }
  }

  if (blockCount === 0) return 0.3;
  return counterCount / blockCount;
}

function findWhiffRecoveryPattern(
  history: ActionRecord[],
): TapZone | 'idle' | null {
  // What does player do after missing an attack?
  const recoveryActions: Record<string, number> = {};

  for (let i = 1; i < history.length; i++) {
    const previous = history[i - 1];
    const current = history[i];

    if (
      isOffensiveAction(previous.action) &&
      previous.result === 'whiffed'
    ) {
      const action = current.action;
      recoveryActions[action] = (recoveryActions[action] || 0) + 1;
    }
  }

  const sorted = Object.entries(recoveryActions).sort(([, a], [, b]) => b - a);
  if (sorted.length === 0) return null;

  return sorted[0][0] as TapZone | 'idle';
}

function findPostBlockPattern(
  history: ActionRecord[],
): TapZone | 'idle' | null {
  // What does player typically do after blocking?
  const postBlockActions: Record<string, number> = {};

  for (let i = 1; i < history.length; i++) {
    const previous = history[i - 1];
    const current = history[i];

    if (previous.action === 'block') {
      const action = current.action;
      postBlockActions[action] = (postBlockActions[action] || 0) + 1;
    }
  }

  const sorted = Object.entries(postBlockActions).sort(([, a], [, b]) => b - a);
  if (sorted.length === 0) return null;

  return sorted[0][0] as TapZone | 'idle';
}

function analyzePanicBehavior(
  history: ActionRecord[],
): 'mash' | 'turtle' | 'calculated' | null {
  // Analyze behavior when health is low
  const lowHealthActions = history.filter(
    (record) => record.context.playerHealth < 0.25,
  );

  if (lowHealthActions.length < 5) return null;

  const offensiveCount = lowHealthActions.filter((r) =>
    isOffensiveAction(r.action),
  ).length;
  const defensiveCount = lowHealthActions.filter((r) =>
    isDefensiveAction(r.action),
  ).length;

  const offensiveRatio = offensiveCount / lowHealthActions.length;
  const defensiveRatio = defensiveCount / lowHealthActions.length;

  // Check for mashing (very high action rate)
  const actionRate = lowHealthActions.length > 10 ? 'high' : 'normal';

  if (offensiveRatio > 0.7 && actionRate === 'high') {
    return 'mash';
  } else if (defensiveRatio > 0.6) {
    return 'turtle';
  } else if (offensiveRatio > 0.3 && offensiveRatio < 0.7) {
    return 'calculated';
  }

  return null;
}

// ============================================================================
// ROUND SUMMARY
// ============================================================================

export function recordRoundEnd(
  matchId: string,
  roundNumber: number,
  state: MatchState,
): void {
  const data = getObservationData(matchId);

  const playerWon = state.player1.health > state.player2.health;
  const aiWon = state.player2.health > state.player1.health;

  // Determine dominant strategy from history
  const recentHistory = data.actionHistory.slice(-50);
  const offensiveActions = recentHistory.filter((r) =>
    isOffensiveAction(r.action),
  ).length;
  const defensiveActions = recentHistory.filter((r) =>
    isDefensiveAction(r.action),
  ).length;

  let dominantStrategy: 'aggressive' | 'defensive' | 'balanced';
  if (offensiveActions > defensiveActions * 1.5) {
    dominantStrategy = 'aggressive';
  } else if (defensiveActions > offensiveActions * 1.5) {
    dominantStrategy = 'defensive';
  } else {
    dominantStrategy = 'balanced';
  }

  const summary: RoundSummary = {
    roundNumber,
    winner: playerWon ? 'player' : aiWon ? 'ai' : 'draw',
    damageDealt:
      state.player2.fighter.stats.maxHealth - state.player2.health,
    damageTaken:
      state.player1.fighter.stats.maxHealth - state.player1.health,
    specialsAttempted: 0, // Would need separate tracking
    specialsLanded: 0, // Would need separate tracking
    dominantStrategy,
  };

  data.roundSummaries.push(summary);

  // Recompute tendencies at round end
  computeTendencies(matchId);
}

// ============================================================================
// HELPERS (using shared utilities from @/utils)
// ============================================================================

// Aliased for backward compatibility within this file
const isOffensiveAction = isOffensiveTapZone;
const isDefensiveAction = isDefensiveTapZone;
