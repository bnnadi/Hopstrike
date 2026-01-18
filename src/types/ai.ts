/**
 * AI System Types for Hopstrike
 * Defines observation, personality, adaptation, and decision-making structures
 */

import type { TapZone, FighterId, FighterState, MoveType } from './game';

// ============================================================================
// OBSERVATION LAYER TYPES
// ============================================================================

/**
 * Tracks a single action event for pattern analysis
 */
export interface ActionRecord {
  /** Frame when action occurred */
  frame: number;
  /** Type of action */
  action: TapZone | 'idle';
  /** Result of the action */
  result: 'hit' | 'blocked' | 'dodged' | 'whiffed' | 'none';
  /** Context when action was taken */
  context: {
    inRange: boolean;
    playerHealth: number;
    opponentHealth: number;
    playerMeter: number;
    opponentState: FighterState;
  };
}

/**
 * Statistical breakdown of player tendencies
 */
export interface PlayerTendencies {
  // Attack patterns
  jabFrequency: number; // 0-1, how often they use jabs
  hookFrequency: number; // 0-1, how often they use hooks
  uppercutFrequency: number; // 0-1, how often they use uppercuts
  lightVsHeavyRatio: number; // 0-1, 0 = all light, 1 = all heavy

  // Combo patterns
  commonStarters: TapZone[]; // Most used combo starters
  averageComboLength: number; // Average inputs in combos
  comboAttemptRate: number; // How often they try combos

  // Special move behavior
  specialAttemptRate: number; // How often they try specials when meter is ready
  specialSuccessRate: number; // Success rate of special attempts
  specialTiming: 'early' | 'late' | 'optimal'; // When they try specials

  // Defensive patterns
  blockVsDodgeRatio: number; // 0-1, 0 = always block, 1 = always dodge
  defensiveReactionRate: number; // How often they defend when attacked
  counterAttackRate: number; // How often they attack after blocking

  // Mistakes and openings
  whiffRecoveryAction: TapZone | 'idle' | null; // What they do after whiffing
  postBlockAction: TapZone | 'idle' | null; // What they do after blocking
  panicBehavior: 'mash' | 'turtle' | 'calculated' | null; // Behavior at low health
}

/**
 * Complete observation data for a match
 */
export interface ObservationData {
  /** All recorded actions this match */
  actionHistory: ActionRecord[];
  /** Computed tendencies from observations */
  tendencies: PlayerTendencies;
  /** Round-by-round summary */
  roundSummaries: RoundSummary[];
  /** Total frames of observation */
  totalFramesObserved: number;
  /** Confidence in observations (0-1) */
  confidence: number;
}

export interface RoundSummary {
  roundNumber: number;
  winner: 'player' | 'ai' | 'draw';
  damageDealt: number;
  damageTaken: number;
  specialsAttempted: number;
  specialsLanded: number;
  dominantStrategy: 'aggressive' | 'defensive' | 'balanced';
}

// ============================================================================
// PERSONALITY LAYER TYPES
// ============================================================================

/**
 * Core personality traits that define how the AI fights
 * These are fixed per-fighter and do not change
 */
export interface AIPersonality {
  /** Fighter this personality belongs to */
  fighterId: FighterId;

  // Combat style (0-1 scales)
  /** How likely to attack vs wait */
  aggression: number;
  /** Preference for blocking over dodging */
  defensiveBias: number;
  /** Willingness to take risks for big damage */
  riskTolerance: number;
  /** Tendency to complete combos vs freestyle */
  comboDiscipline: number;

  // Tactical preferences
  /** Preferred fighting distance: 0 = close, 1 = far */
  preferredRange: number;
  /** Patience: how long to wait for openings */
  patience: number;
  /** Tendency to punish mistakes */
  punishmentFocus: number;

  // Special move behavior
  /** When to use special: 0 = ASAP, 1 = only when safe */
  specialCaution: number;
  /** Confidence in landing special combos */
  specialConfidence: number;

  // Decision weights for action selection
  weights: {
    jab: number;
    hook: number;
    uppercut: number;
    block: number;
    dodge: number;
    special: number;
  };
}

// ============================================================================
// ADAPTATION LAYER TYPES
// ============================================================================

/**
 * Modifiers applied based on observed player behavior
 * Updated between rounds
 */
export interface AdaptationModifiers {
  // Defensive adjustments
  /** Increase block rate against heavy attacks */
  blockAgainstHeavy: number;
  /** Increase dodge rate against predictable patterns */
  dodgePredictablePatterns: number;

  // Offensive adjustments
  /** Punish openings more aggressively */
  punishOpenings: number;
  /** Exploit defensive tendencies */
  exploitDefense: number;
  /** Adjust tempo based on player mashing */
  tempoAdjustment: number; // -1 to 1: negative = slower, positive = faster

  // Counter-strategy
  /** Bait and punish counter rate */
  baitAndPunish: number;
  /** Mix-up frequency increase */
  mixUpIncrease: number;

  // Special move adjustments
  /** Adjust special timing based on success rate */
  specialTimingShift: number;

  // Confidence
  /** Overall adaptation confidence */
  adaptationStrength: number; // 0-1: how much to trust adaptations
}

// ============================================================================
// DECISION-MAKING TYPES
// ============================================================================

export type AIAction =
  | 'jab_left'
  | 'jab_right'
  | 'hook'
  | 'uppercut'
  | 'block'
  | 'dodge_left'
  | 'dodge_right'
  | 'special'
  | 'idle'
  | 'wait';

export interface DecisionContext {
  // Current state
  inRange: boolean;
  distance: number;
  aiHealth: number;
  aiHealthPercent: number;
  aiMeter: number;
  aiState: FighterState;
  playerHealth: number;
  playerHealthPercent: number;
  playerMeter: number;
  playerState: FighterState;
  playerCurrentMove: MoveType | null;

  // Timing
  frameCount: number;
  roundTimeRemaining: number;
  aiRoundsWon: number;
  playerRoundsWon: number;

  // Frame advantage
  canAct: boolean;
  playerCanAct: boolean;
  frameAdvantage: number; // Positive = AI advantage
}

export interface ActionScore {
  action: AIAction;
  score: number;
  reasoning: string;
}

export interface DecisionResult {
  selectedAction: AIAction;
  scores: ActionScore[];
  confidence: number;
  executionDelay: number; // Frames before execution
}

// ============================================================================
// DIFFICULTY SCALING TYPES
// ============================================================================

export type AIDifficulty = 'easy' | 'medium' | 'hard' | 'expert';

/**
 * Difficulty affects execution quality, NOT power
 */
export interface DifficultyConfig {
  // Reaction and timing
  /** Base reaction time in frames */
  reactionFrames: number;
  /** Variance in reaction time */
  reactionVariance: number;
  /** How quickly AI makes decisions */
  decisionSpeed: number;

  // Execution quality
  /** Chance to execute combo perfectly (0-1) */
  comboAccuracy: number;
  /** Chance to successfully punish openings (0-1) */
  punishConsistency: number;
  /** How often AI successfully defends (0-1) */
  defenseReliability: number;

  // Observation and adaptation
  /** How much observation data to use */
  observationDepth: number;
  /** How strongly to apply adaptations */
  adaptationStrength: number;
  /** Frames between adaptation updates */
  adaptationInterval: number;

  // Mistakes
  /** Chance to make a suboptimal decision (0-1) */
  mistakeRate: number;
  /** Chance to drop combo (0-1) */
  comboDropRate: number;
}

// ============================================================================
// AI BRAIN STATE
// ============================================================================

/**
 * Complete AI state for a match
 */
export interface AIBrainState {
  /** Unique match identifier */
  matchId: string;
  /** Selected difficulty */
  difficulty: AIDifficulty;
  /** Fighter personality */
  personality: AIPersonality;
  /** Observation data */
  observations: ObservationData;
  /** Current adaptation modifiers */
  adaptations: AdaptationModifiers;
  /** Difficulty configuration */
  difficultyConfig: DifficultyConfig;

  // Execution state
  /** Pending action to execute */
  pendingAction: TapZone | null;
  /** Frame to execute pending action */
  pendingActionFrame: number;
  /** Current combo being executed */
  currentComboIndex: number;
  /** Combo execution queue */
  comboQueue: TapZone[];

  // Timing state
  /** Last decision frame */
  lastDecisionFrame: number;
  /** Last action frame */
  lastActionFrame: number;
  /** Last adaptation frame */
  lastAdaptationFrame: number;

  // Round tracking
  /** Current round number */
  currentRound: number;
}

// ============================================================================
// DEFAULT VALUES
// ============================================================================

export const DEFAULT_TENDENCIES: PlayerTendencies = {
  jabFrequency: 0.4,
  hookFrequency: 0.3,
  uppercutFrequency: 0.3,
  lightVsHeavyRatio: 0.5,
  commonStarters: ['left_light', 'right_light'],
  averageComboLength: 2,
  comboAttemptRate: 0.3,
  specialAttemptRate: 0.5,
  specialSuccessRate: 0.5,
  specialTiming: 'optimal',
  blockVsDodgeRatio: 0.5,
  defensiveReactionRate: 0.5,
  counterAttackRate: 0.3,
  whiffRecoveryAction: null,
  postBlockAction: null,
  panicBehavior: null,
};

export const DEFAULT_ADAPTATIONS: AdaptationModifiers = {
  blockAgainstHeavy: 0,
  dodgePredictablePatterns: 0,
  punishOpenings: 0,
  exploitDefense: 0,
  tempoAdjustment: 0,
  baitAndPunish: 0,
  mixUpIncrease: 0,
  specialTimingShift: 0,
  adaptationStrength: 0,
};
