/**
 * AI Brain - Core Decision Making System
 * Combines personality, observations, and adaptations into intelligent decisions
 *
 * Design principles:
 * - No input reading or instant reactions
 * - Realistic reaction times
 * - Decisions feel human-like
 * - Difficulty affects execution, not power
 */

import type {
  AIAction,
  AIBrainState,
  AIPersonality,
  AdaptationModifiers,
  DecisionContext,
  DecisionResult,
  DifficultyConfig,
  ActionScore,
  AIDifficulty,
} from '@/types/ai';
import { DEFAULT_ADAPTATIONS } from '@/types/ai';
import type { MatchState, TapZone, FighterState, MoveType } from '@/types';
import { getPersonality } from '@/constants/aiPersonalities';
import { getObservationData, computeTendencies, recordRoundEnd } from './aiObserver';
import { computeAdaptations, resetAdaptations } from './aiAdapter';
import { canAct, isInRange, getDistance } from './gameEngine';
import { isOffensiveAIAction, isDefensiveAIAction } from '@/utils';

// ============================================================================
// DIFFICULTY CONFIGURATIONS
// ============================================================================

export const DIFFICULTY_CONFIGS: Record<AIDifficulty, DifficultyConfig> = {
  easy: {
    reactionFrames: 28,
    reactionVariance: 12,
    decisionSpeed: 50,
    comboAccuracy: 0.5,
    punishConsistency: 0.3,
    defenseReliability: 0.4,
    observationDepth: 0.3,
    adaptationStrength: 0.2,
    adaptationInterval: 180, // 3 seconds
    mistakeRate: 0.25,
    comboDropRate: 0.3,
  },
  medium: {
    reactionFrames: 18,
    reactionVariance: 8,
    decisionSpeed: 35,
    comboAccuracy: 0.7,
    punishConsistency: 0.5,
    defenseReliability: 0.6,
    observationDepth: 0.6,
    adaptationStrength: 0.5,
    adaptationInterval: 120, // 2 seconds
    mistakeRate: 0.15,
    comboDropRate: 0.2,
  },
  hard: {
    reactionFrames: 12,
    reactionVariance: 4,
    decisionSpeed: 22,
    comboAccuracy: 0.85,
    punishConsistency: 0.75,
    defenseReliability: 0.8,
    observationDepth: 0.85,
    adaptationStrength: 0.75,
    adaptationInterval: 90, // 1.5 seconds
    mistakeRate: 0.08,
    comboDropRate: 0.1,
  },
  expert: {
    reactionFrames: 8,
    reactionVariance: 2,
    decisionSpeed: 15,
    comboAccuracy: 0.95,
    punishConsistency: 0.9,
    defenseReliability: 0.9,
    observationDepth: 1.0,
    adaptationStrength: 0.9,
    adaptationInterval: 60, // 1 second
    mistakeRate: 0.03,
    comboDropRate: 0.05,
  },
};

// ============================================================================
// BRAIN STATE MANAGEMENT
// ============================================================================

const brainStates = new Map<string, AIBrainState>();

export function initializeBrain(
  matchId: string,
  fighterId: string,
  difficulty: AIDifficulty,
): AIBrainState {
  const personality = getPersonality(fighterId as any);
  const difficultyConfig = DIFFICULTY_CONFIGS[difficulty];

  const brain: AIBrainState = {
    matchId,
    difficulty,
    personality,
    observations: getObservationData(matchId),
    adaptations: resetAdaptations(),
    difficultyConfig,
    pendingAction: null,
    pendingActionFrame: 0,
    currentComboIndex: 0,
    comboQueue: [],
    lastDecisionFrame: 0,
    lastActionFrame: 0,
    lastAdaptationFrame: 0,
    currentRound: 1,
  };

  brainStates.set(matchId, brain);
  return brain;
}

export function getBrain(matchId: string): AIBrainState | null {
  return brainStates.get(matchId) || null;
}

export function resetBrain(matchId: string): void {
  brainStates.delete(matchId);
}

// ============================================================================
// MAIN DECISION FUNCTION
// ============================================================================

/**
 * Make a decision based on current game state
 * Returns the action to execute (may be null if waiting)
 */
export function makeDecision(
  brain: AIBrainState,
  state: MatchState,
): TapZone | null {
  const currentFrame = state.frameCount;
  const config = brain.difficultyConfig;

  // Execute pending action if ready
  if (brain.pendingAction && currentFrame >= brain.pendingActionFrame) {
    const action = brain.pendingAction;
    brain.pendingAction = null;
    brain.lastActionFrame = currentFrame;
    return action;
  }

  // Execute queued combo inputs
  if (brain.comboQueue.length > 0 && brain.currentComboIndex < brain.comboQueue.length) {
    if (currentFrame >= brain.pendingActionFrame) {
      const action = brain.comboQueue[brain.currentComboIndex];
      brain.currentComboIndex++;

      // Check for combo drop (difficulty-based)
      if (Math.random() < config.comboDropRate) {
        // Dropped the combo
        brain.comboQueue = [];
        brain.currentComboIndex = 0;
        return null;
      }

      // Queue next input
      if (brain.currentComboIndex < brain.comboQueue.length) {
        brain.pendingActionFrame = currentFrame + 10 + Math.floor(Math.random() * 5);
      } else {
        brain.comboQueue = [];
        brain.currentComboIndex = 0;
      }

      return action;
    }
    return null;
  }

  // Don't decide too frequently
  if (currentFrame - brain.lastDecisionFrame < config.decisionSpeed) {
    return null;
  }

  // Can't decide if AI is busy
  if (!canAct(state.player2)) {
    return null;
  }

  brain.lastDecisionFrame = currentFrame;

  // Build decision context
  const context = buildDecisionContext(state);

  // Make the decision
  const decision = evaluateActions(brain, context, state);

  // Apply reaction delay (with variance)
  const reactionDelay =
    config.reactionFrames +
    Math.floor((Math.random() - 0.5) * 2 * config.reactionVariance);

  // Maybe make a mistake
  if (Math.random() < config.mistakeRate) {
    // Make a suboptimal choice
    const suboptimalActions = decision.scores.slice(1, 4);
    if (suboptimalActions.length > 0) {
      const randomSuboptimal =
        suboptimalActions[Math.floor(Math.random() * suboptimalActions.length)];
      return queueAction(brain, randomSuboptimal.action, currentFrame + reactionDelay);
    }
  }

  return queueAction(brain, decision.selectedAction, currentFrame + reactionDelay);
}

// ============================================================================
// CONTEXT BUILDING
// ============================================================================

function buildDecisionContext(state: MatchState): DecisionContext {
  const ai = state.player2;
  const player = state.player1;

  const aiMaxHealth = ai.fighter.stats.maxHealth;
  const playerMaxHealth = player.fighter.stats.maxHealth;

  let playerCurrentMove: MoveType | null = null;
  if (player.currentMove && 'type' in player.currentMove) {
    playerCurrentMove = player.currentMove.type;
  }

  return {
    inRange: isInRange(state),
    distance: getDistance(state),
    aiHealth: ai.health,
    aiHealthPercent: ai.health / aiMaxHealth,
    aiMeter: ai.meter,
    aiState: ai.state,
    playerHealth: player.health,
    playerHealthPercent: player.health / playerMaxHealth,
    playerMeter: player.meter,
    playerState: player.state,
    playerCurrentMove,
    frameCount: state.frameCount,
    roundTimeRemaining: state.timeRemaining,
    aiRoundsWon: ai.roundsWon,
    playerRoundsWon: player.roundsWon,
    canAct: canAct(ai),
    playerCanAct: canAct(player),
    frameAdvantage: computeFrameAdvantage(ai, player),
  };
}

function computeFrameAdvantage(
  ai: MatchState['player2'],
  player: MatchState['player1'],
): number {
  const aiFramesLeft = ai.state !== 'idle' ? ai.totalFrames - ai.currentFrame : 0;
  const playerFramesLeft =
    player.state !== 'idle' ? player.totalFrames - player.currentFrame : 0;

  return playerFramesLeft - aiFramesLeft;
}

// ============================================================================
// ACTION EVALUATION
// ============================================================================

function evaluateActions(
  brain: AIBrainState,
  context: DecisionContext,
  state: MatchState,
): DecisionResult {
  const personality = brain.personality;
  const adaptations = brain.adaptations;
  const config = brain.difficultyConfig;

  const actions: AIAction[] = [
    'jab_left',
    'jab_right',
    'hook',
    'uppercut',
    'block',
    'dodge_left',
    'dodge_right',
    'special',
    'wait',
  ];

  const scores: ActionScore[] = actions.map((action) => ({
    action,
    score: scoreAction(action, context, personality, adaptations, state),
    reasoning: '',
  }));

  // Sort by score descending
  scores.sort((a, b) => b.score - a.score);

  // Apply difficulty-based consistency
  let selectedAction = scores[0].action;

  // Defense reliability check
  if (isDefensiveAction(selectedAction)) {
    if (Math.random() > config.defenseReliability) {
      // Failed to defend properly
      selectedAction = 'wait';
    }
  }

  // Punish consistency check
  if (context.playerState === 'vulnerable' || context.playerState === 'hit_stun') {
    if (Math.random() > config.punishConsistency) {
      // Missed the punish window
      selectedAction = 'wait';
    }
  }

  return {
    selectedAction,
    scores,
    confidence: scores[0].score,
    executionDelay: brain.difficultyConfig.reactionFrames,
  };
}

function scoreAction(
  action: AIAction,
  context: DecisionContext,
  personality: AIPersonality,
  adaptations: AdaptationModifiers,
  matchState: MatchState,
): number {
  let score = 0;

  // Base personality weights
  switch (action) {
    case 'jab_left':
    case 'jab_right':
      score = personality.weights.jab * personality.aggression;
      break;
    case 'hook':
      score = personality.weights.hook * personality.aggression * 0.9;
      break;
    case 'uppercut':
      score = personality.weights.uppercut * personality.aggression * 0.8;
      break;
    case 'block':
      score = personality.weights.block * personality.defensiveBias;
      break;
    case 'dodge_left':
    case 'dodge_right':
      score = personality.weights.dodge * (1 - personality.defensiveBias);
      break;
    case 'special':
      score = personality.weights.special * personality.riskTolerance;
      // Check if we have enough meter
      if (context.aiMeter < matchState.player2.fighter.special.meterCost) {
        score = 0; // Can't use special without meter
      } else {
        // Caution affects when to use special
        const healthFactor = context.playerHealthPercent < 0.3 ? 1.5 : 1.0;
        score *= healthFactor * (1 - personality.specialCaution * 0.5);
      }
      break;
    case 'wait':
      score = personality.patience * 0.5;
      break;
  }

  // Context modifiers
  score = applyContextModifiers(score, action, context, personality);

  // Adaptation modifiers
  score = applyAdaptationModifiers(score, action, context, adaptations);

  // Situation-specific bonuses
  score = applySituationBonuses(score, action, context, personality, matchState);

  return Math.max(0, score);
}

function applyContextModifiers(
  score: number,
  action: AIAction,
  context: DecisionContext,
  personality: AIPersonality,
): number {
  // Range considerations
  if (!context.inRange) {
    if (isOffensiveAction(action)) {
      score *= 0.1; // Heavily penalize attacks out of range
    }
    if (action === 'wait') {
      score *= 1.5; // Encourage patience
    }
  }

  // Player state reactions
  if (context.playerState === 'attacking') {
    if (isDefensiveAction(action)) {
      score *= 2.0; // Boost defense when being attacked
    }
    if (isOffensiveAction(action)) {
      score *= 0.5; // Reduce offense (might trade poorly)
    }
  }

  if (context.playerState === 'special') {
    if (action === 'dodge_left' || action === 'dodge_right') {
      score *= 2.5; // Strongly encourage dodging specials
    }
  }

  if (
    context.playerState === 'vulnerable' ||
    context.playerState === 'hit_stun'
  ) {
    if (isOffensiveAction(action)) {
      score *= 2.0; // Punish openings
    }
  }

  // Health considerations
  if (context.aiHealthPercent < 0.25) {
    // Low health - personality matters more
    if (personality.riskTolerance > 0.6) {
      // Risk-taker goes all-in
      if (isOffensiveAction(action)) score *= 1.3;
    } else {
      // Cautious player plays safe
      if (isDefensiveAction(action)) score *= 1.3;
    }
  }

  return score;
}

function applyAdaptationModifiers(
  score: number,
  action: AIAction,
  context: DecisionContext,
  adaptations: AdaptationModifiers,
): number {
  const strength = adaptations.adaptationStrength;

  // Defensive adaptations
  if (action === 'block' && context.playerState === 'attacking') {
    // Check if player tends to use heavy attacks
    score *= 1 + adaptations.blockAgainstHeavy * strength;
  }

  if ((action === 'dodge_left' || action === 'dodge_right')) {
    score *= 1 + adaptations.dodgePredictablePatterns * strength;
  }

  // Offensive adaptations
  if (isOffensiveAction(action)) {
    if (context.playerState === 'vulnerable' || context.playerState === 'hit_stun') {
      score *= 1 + adaptations.punishOpenings * strength;
    }
    score *= 1 + adaptations.exploitDefense * strength * 0.5;
  }

  // Tempo adjustments
  if (adaptations.tempoAdjustment < 0 && action === 'wait') {
    score *= 1 + Math.abs(adaptations.tempoAdjustment) * strength;
  }
  if (adaptations.tempoAdjustment > 0 && isOffensiveAction(action)) {
    score *= 1 + adaptations.tempoAdjustment * strength;
  }

  // Mix-up increase
  if (adaptations.mixUpIncrease > 0) {
    // Add some randomness
    score *= 1 + (Math.random() - 0.5) * adaptations.mixUpIncrease * strength;
  }

  // Bait and punish
  if (adaptations.baitAndPunish > 0) {
    if (action === 'wait' && context.inRange) {
      score *= 1 + adaptations.baitAndPunish * strength;
    }
  }

  return score;
}

function applySituationBonuses(
  score: number,
  action: AIAction,
  context: DecisionContext,
  personality: AIPersonality,
  matchState: MatchState,
): number {
  const specialCost = matchState.player2.fighter.special.meterCost;

  // Round advantage - play safer when ahead
  if (context.aiRoundsWon > context.playerRoundsWon) {
    if (isDefensiveAction(action)) score *= 1.15;
    if (action === 'special') score *= 0.9; // Less risky with lead
  }

  // Round disadvantage - take more risks
  if (context.playerRoundsWon > context.aiRoundsWon) {
    if (action === 'special' && context.aiMeter >= specialCost) {
      score *= 1.2;
    }
    if (personality.riskTolerance > 0.5 && isOffensiveAction(action)) {
      score *= 1.1;
    }
  }

  // Time pressure
  if (context.roundTimeRemaining < 15) {
    const healthLead = context.aiHealthPercent - context.playerHealthPercent;

    if (healthLead > 0.1) {
      // Winning - run out clock
      if (isDefensiveAction(action) || action === 'wait') score *= 1.5;
    } else if (healthLead < -0.1) {
      // Losing - must attack
      if (isOffensiveAction(action)) score *= 1.5;
      if (action === 'special' && context.aiMeter >= specialCost) {
        score *= 2.0;
      }
    }
  }

  // Frame advantage
  if (context.frameAdvantage > 10) {
    // AI has advantage - attack
    if (isOffensiveAction(action)) score *= 1.3;
  } else if (context.frameAdvantage < -10) {
    // Player has advantage - defend
    if (isDefensiveAction(action)) score *= 1.3;
  }

  return score;
}

// ============================================================================
// ACTION QUEUEING
// ============================================================================

function queueAction(
  brain: AIBrainState,
  action: AIAction,
  executeFrame: number,
): TapZone | null {
  // Handle special move combo execution
  if (action === 'special') {
    return queueSpecialMove(brain, executeFrame);
  }

  const tapZone = actionToTapZone(action);
  if (tapZone) {
    brain.pendingAction = tapZone;
    brain.pendingActionFrame = executeFrame;
  }

  return null;
}

function queueSpecialMove(brain: AIBrainState, startFrame: number): TapZone | null {
  const special = brain.personality;
  // We need to get the fighter's special combo from somewhere
  // For now, we'll just return the first input and let the combo system handle it
  brain.comboQueue = []; // Would need to populate from fighter data
  brain.currentComboIndex = 0;
  brain.pendingActionFrame = startFrame;

  // This would need proper combo queue population
  // For simplicity, we'll treat it as a regular action attempt
  return null;
}

function actionToTapZone(action: AIAction): TapZone | null {
  switch (action) {
    case 'jab_left':
      return 'left_light';
    case 'jab_right':
      return 'right_light';
    case 'hook':
      return 'left_heavy';
    case 'uppercut':
      return 'right_heavy';
    case 'block':
      return 'block';
    case 'dodge_left':
      return 'dodge_left';
    case 'dodge_right':
      return 'dodge_right';
    case 'wait':
    case 'idle':
    case 'special':
    default:
      return null;
  }
}

// ============================================================================
// ROUND MANAGEMENT
// ============================================================================

export function onRoundEnd(brain: AIBrainState, state: MatchState): void {
  // Record round summary
  recordRoundEnd(brain.matchId, state.roundNumber, state);

  // Recompute tendencies
  computeTendencies(brain.matchId);

  // Update adaptations
  brain.adaptations = computeAdaptations(
    brain.observations,
    brain.adaptations,
    brain.personality,
    brain.difficultyConfig,
  );

  brain.currentRound = state.roundNumber + 1;
}

export function onMatchStart(brain: AIBrainState): void {
  brain.adaptations = resetAdaptations();
  brain.currentRound = 1;
}

// ============================================================================
// HELPERS (using shared utilities from @/utils)
// ============================================================================

// Aliased for backward compatibility within this file
const isOffensiveAction = isOffensiveAIAction;
const isDefensiveAction = isDefensiveAIAction;
