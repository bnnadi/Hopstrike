/**
 * Core game types for Hopstrike
 * Strongly typed definitions for fighters, moves, combos, and match state
 */

// ============================================================================
// MOVE TYPES
// ============================================================================

export type MoveType = 'jab' | 'hook' | 'uppercut' | 'block' | 'dodge';

export type TapZone =
  | 'left_light'
  | 'left_heavy'
  | 'right_light'
  | 'right_heavy'
  | 'block'
  | 'dodge_left'
  | 'dodge_right';

export interface Move {
  id: string;
  type: MoveType;
  name: string;
  damage: number;
  /** Frames to execute (at 60fps) */
  startupFrames: number;
  /** Frames where move is active */
  activeFrames: number;
  /** Frames to recover */
  recoveryFrames: number;
  /** Meter gained on hit */
  meterGain: number;
  /** Meter gained on block */
  meterGainOnBlock: number;
  /** Can this move be blocked? */
  blockable: boolean;
  /** Stun frames applied to opponent on hit */
  hitStun: number;
  /** Stun frames applied to opponent on block */
  blockStun: number;
}

// ============================================================================
// COMBO & SPECIAL MOVE TYPES
// ============================================================================

export interface ComboInput {
  zone: TapZone;
  /** Max time window (ms) from previous input */
  windowMs: number;
}

export interface SpecialMove {
  id: string;
  name: string;
  description: string;
  /** Required meter (0-100) */
  meterCost: number;
  /** Tap combo sequence to execute */
  comboSequence: ComboInput[];
  /** Damage dealt */
  damage: number;
  /** Total animation frames */
  totalFrames: number;
  /** Vulnerability frames on failed execution */
  failPenaltyFrames: number;
  /** Visual effect type */
  effectType: 'flurry' | 'counter' | 'knockout' | 'rush';
}

// ============================================================================
// FIGHTER TYPES
// ============================================================================

export type FighterId =
  | 'rocky_roo'
  | 'bella_bounce'
  | 'thunder_jack'
  | 'swift_sally'
  | 'iron_joey'
  | 'wild_wally'
  | 'duchess_dot'
  | 'brawler_bruce';

export interface FighterStats {
  /** Max health (100 is standard) */
  maxHealth: number;
  /** Movement speed multiplier */
  speed: number;
  /** Damage multiplier */
  power: number;
  /** Damage reduction multiplier */
  defense: number;
  /** Meter gain multiplier */
  meterRate: number;
}

export interface FighterMoves {
  jab: Move;
  hook: Move;
  uppercut: Move;
  block: Move;
  dodge: Move;
}

export interface Fighter {
  id: FighterId;
  name: string;
  nickname: string;
  description: string;
  /** Primary color for UI */
  primaryColor: string;
  /** Secondary/accent color */
  secondaryColor: string;
  stats: FighterStats;
  moves: FighterMoves;
  special: SpecialMove;
  /** Fighting rhythm: affects animation timing feel */
  rhythm: 'aggressive' | 'defensive' | 'balanced' | 'technical';
}

// ============================================================================
// GAME STATE TYPES
// ============================================================================

export type PlayerSide = 'left' | 'right';

export type FighterState =
  | 'idle'
  | 'moving_forward'
  | 'moving_backward'
  | 'attacking'
  | 'blocking'
  | 'dodging'
  | 'hit_stun'
  | 'block_stun'
  | 'knocked_down'
  | 'special'
  | 'vulnerable';

export interface PlayerState {
  side: PlayerSide;
  fighter: Fighter;
  health: number;
  meter: number;
  state: FighterState;
  /** Current frame in animation */
  currentFrame: number;
  /** Total frames for current action */
  totalFrames: number;
  /** Position on arena (0-100) */
  position: number;
  /** Current move being executed */
  currentMove: Move | SpecialMove | null;
  /** Combo input buffer */
  comboBuffer: { zone: TapZone; timestamp: number }[];
  /** Is this player controlled by AI? */
  isAI: boolean;
  /** Rounds won */
  roundsWon: number;
}

export type RoundState = 'ready' | 'fighting' | 'round_over' | 'match_over';

export interface MatchState {
  roundNumber: number;
  maxRounds: number;
  roundState: RoundState;
  /** Time remaining in round (seconds) */
  timeRemaining: number;
  /** Max round time (seconds) */
  roundTime: number;
  player1: PlayerState;
  player2: PlayerState;
  /** Winner of the match (null if ongoing) */
  winner: PlayerSide | 'draw' | null;
  /** Frame counter for deterministic simulation */
  frameCount: number;
  /** Is the game paused? */
  isPaused: boolean;
}

// ============================================================================
// INPUT TYPES
// ============================================================================

export interface TapEvent {
  zone: TapZone;
  timestamp: number;
  playerId: PlayerSide;
}

export interface InputState {
  /** Active tap zones being held */
  activeTaps: Set<TapZone>;
  /** Recent tap events for combo detection */
  tapHistory: TapEvent[];
}

// ============================================================================
// GAME CONFIG
// ============================================================================

export interface GameConfig {
  /** Frames per second for game logic */
  fps: number;
  /** Round time in seconds */
  roundTime: number;
  /** Number of rounds to win */
  roundsToWin: number;
  /** Combo input window (ms) */
  comboWindowMs: number;
  /** Max meter value */
  maxMeter: number;
  /** Distance for fighters to be in range */
  attackRange: number;
  /** Starting positions (0-100 scale) */
  startPositions: { left: number; right: number };
}

export const DEFAULT_GAME_CONFIG: GameConfig = {
  fps: 60,
  roundTime: 60,
  roundsToWin: 2,
  comboWindowMs: 300,
  maxMeter: 100,
  attackRange: 55, // Distance is 50 (75-25), so need range > 50 for hits to connect
  startPositions: { left: 25, right: 75 },
};
