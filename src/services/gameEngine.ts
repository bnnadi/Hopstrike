/**
 * Core Game Engine for Hopstrike
 * Deterministic combat simulation for PvP-ready architecture
 */

import type {
  MatchState,
  PlayerState,
  PlayerSide,
  Fighter,
  Move,
  SpecialMove,
  TapZone,
  TapEvent,
  GameConfig,
  FighterState,
} from '@/types';
import { DEFAULT_GAME_CONFIG } from '@/types';

// ============================================================================
// STATE CREATION
// ============================================================================

export function createPlayerState(
  side: PlayerSide,
  fighter: Fighter,
  isAI: boolean,
  startPosition: number,
): PlayerState {
  return {
    side,
    fighter,
    health: fighter.stats.maxHealth,
    meter: 0,
    state: 'idle',
    currentFrame: 0,
    totalFrames: 0,
    position: startPosition,
    currentMove: null,
    comboBuffer: [],
    isAI,
    roundsWon: 0,
  };
}

export function createMatchState(
  fighter1: Fighter,
  fighter2: Fighter,
  player2IsAI: boolean = true,
  config: GameConfig = DEFAULT_GAME_CONFIG,
): MatchState {
  return {
    roundNumber: 1,
    maxRounds: config.roundsToWin * 2 - 1,
    roundState: 'ready',
    timeRemaining: config.roundTime,
    roundTime: config.roundTime,
    player1: createPlayerState('left', fighter1, false, config.startPositions.left),
    player2: createPlayerState('right', fighter2, player2IsAI, config.startPositions.right),
    winner: null,
    frameCount: 0,
    isPaused: false,
  };
}

// ============================================================================
// DISTANCE & COLLISION
// ============================================================================

export function getDistance(state: MatchState): number {
  return Math.abs(state.player1.position - state.player2.position);
}

export function isInRange(state: MatchState, config: GameConfig = DEFAULT_GAME_CONFIG): boolean {
  return getDistance(state) <= config.attackRange;
}

// ============================================================================
// STATE CHECKS
// ============================================================================

export function canAct(player: PlayerState): boolean {
  return (
    player.state === 'idle' ||
    player.state === 'moving_forward' ||
    player.state === 'moving_backward'
  );
}

export function isInvulnerable(player: PlayerState): boolean {
  return player.state === 'dodging' && player.currentFrame >= 3 && player.currentFrame <= 12;
}

export function isBlocking(player: PlayerState): boolean {
  return player.state === 'blocking' && player.currentFrame >= 2;
}

export function isVulnerable(player: PlayerState): boolean {
  return (
    player.state === 'vulnerable' ||
    player.state === 'hit_stun' ||
    (player.state === 'attacking' &&
      player.currentMove !== null &&
      player.currentFrame >
        (player.currentMove as Move).startupFrames + (player.currentMove as Move).activeFrames)
  );
}

// ============================================================================
// MOVE EXECUTION
// ============================================================================

export function executeMove(
  player: PlayerState,
  move: Move,
): PlayerState {
  if (!canAct(player)) {
    return player;
  }

  const newState: FighterState = move.type === 'block' ? 'blocking' : move.type === 'dodge' ? 'dodging' : 'attacking';

  return {
    ...player,
    state: newState,
    currentMove: move,
    currentFrame: 0,
    totalFrames: move.startupFrames + move.activeFrames + move.recoveryFrames,
  };
}

export function executeSpecial(
  player: PlayerState,
  special: SpecialMove,
): PlayerState {
  if (!canAct(player) || player.meter < special.meterCost) {
    return player;
  }

  return {
    ...player,
    state: 'special',
    currentMove: special,
    currentFrame: 0,
    totalFrames: special.totalFrames,
    meter: player.meter - special.meterCost,
    comboBuffer: [],
  };
}

// ============================================================================
// COMBO SYSTEM
// ============================================================================

export function addToComboBuffer(
  player: PlayerState,
  zone: TapZone,
  timestamp: number,
  config: GameConfig = DEFAULT_GAME_CONFIG,
): PlayerState {
  const newBuffer = [
    ...player.comboBuffer.filter(
      (tap) => timestamp - tap.timestamp < config.comboWindowMs,
    ),
    { zone, timestamp },
  ];

  return {
    ...player,
    comboBuffer: newBuffer.slice(-10), // Keep last 10 inputs max
  };
}

export function checkSpecialCombo(
  player: PlayerState,
  timestamp: number,
): boolean {
  const special = player.fighter.special;
  const buffer = player.comboBuffer;

  if (buffer.length < special.comboSequence.length) {
    return false;
  }

  // Check the last N inputs match the combo sequence
  const recentInputs = buffer.slice(-special.comboSequence.length);

  for (let i = 0; i < special.comboSequence.length; i++) {
    const required = special.comboSequence[i];
    const actual = recentInputs[i];

    if (actual.zone !== required.zone) {
      return false;
    }

    // Check timing window (except for first input)
    if (i > 0) {
      const timeDiff = actual.timestamp - recentInputs[i - 1].timestamp;
      if (timeDiff > required.windowMs) {
        return false;
      }
    }
  }

  return true;
}

// ============================================================================
// HIT DETECTION & DAMAGE
// ============================================================================

interface HitResult {
  hit: boolean;
  blocked: boolean;
  dodged: boolean;
  damage: number;
  attackerMeterGain: number;
  defenderStun: number;
}

export function calculateHit(
  attacker: PlayerState,
  defender: PlayerState,
  inRange: boolean,
): HitResult {
  const noHit: HitResult = {
    hit: false,
    blocked: false,
    dodged: false,
    damage: 0,
    attackerMeterGain: 0,
    defenderStun: 0,
  };

  if (!inRange) return noHit;
  if (!attacker.currentMove) return noHit;

  const move = attacker.currentMove as Move;
  const isActiveFrame =
    attacker.currentFrame >= move.startupFrames &&
    attacker.currentFrame < move.startupFrames + move.activeFrames;

  if (!isActiveFrame) return noHit;

  // Check dodge
  if (isInvulnerable(defender)) {
    return { ...noHit, dodged: true };
  }

  // Check block
  if (isBlocking(defender) && move.blockable) {
    return {
      hit: false,
      blocked: true,
      dodged: false,
      damage: 0,
      attackerMeterGain: move.meterGainOnBlock * attacker.fighter.stats.meterRate,
      defenderStun: move.blockStun,
    };
  }

  // Hit!
  const rawDamage = move.damage * attacker.fighter.stats.power;
  const damage = rawDamage / defender.fighter.stats.defense;

  return {
    hit: true,
    blocked: false,
    dodged: false,
    damage: Math.round(damage),
    attackerMeterGain: move.meterGain * attacker.fighter.stats.meterRate,
    defenderStun: move.hitStun,
  };
}

export function calculateSpecialHit(
  attacker: PlayerState,
  defender: PlayerState,
  inRange: boolean,
): HitResult {
  const noHit: HitResult = {
    hit: false,
    blocked: false,
    dodged: false,
    damage: 0,
    attackerMeterGain: 0,
    defenderStun: 0,
  };

  if (!inRange) return noHit;
  if (!attacker.currentMove) return noHit;

  const special = attacker.currentMove as SpecialMove;

  // Special moves hit during middle frames
  const activeStart = Math.floor(special.totalFrames * 0.2);
  const activeEnd = Math.floor(special.totalFrames * 0.7);
  const isActiveFrame =
    attacker.currentFrame >= activeStart && attacker.currentFrame < activeEnd;

  if (!isActiveFrame) return noHit;

  // Specials are unblockable
  if (isInvulnerable(defender)) {
    return { ...noHit, dodged: true };
  }

  const damage = special.damage * attacker.fighter.stats.power;

  return {
    hit: true,
    blocked: false,
    dodged: false,
    damage: Math.round(damage),
    attackerMeterGain: 0,
    defenderStun: 30,
  };
}

// ============================================================================
// STATE UPDATES
// ============================================================================

export function updatePlayerFrame(player: PlayerState): PlayerState {
  if (player.state === 'idle') {
    return player;
  }

  const nextFrame = player.currentFrame + 1;

  // Check if action is complete
  if (nextFrame >= player.totalFrames) {
    return {
      ...player,
      state: 'idle',
      currentFrame: 0,
      totalFrames: 0,
      currentMove: null,
    };
  }

  return {
    ...player,
    currentFrame: nextFrame,
  };
}

export function applyDamage(
  player: PlayerState,
  damage: number,
  stunFrames: number,
): PlayerState {
  const newHealth = Math.max(0, player.health - damage);
  const newState: FighterState = newHealth <= 0 ? 'knocked_down' : 'hit_stun';

  return {
    ...player,
    health: newHealth,
    state: newState,
    currentFrame: 0,
    totalFrames: newHealth <= 0 ? 60 : stunFrames,
    currentMove: null,
  };
}

export function applyBlockStun(player: PlayerState, stunFrames: number): PlayerState {
  return {
    ...player,
    state: 'block_stun',
    currentFrame: 0,
    totalFrames: stunFrames,
    currentMove: null,
  };
}

export function addMeter(
  player: PlayerState,
  amount: number,
  config: GameConfig = DEFAULT_GAME_CONFIG,
): PlayerState {
  return {
    ...player,
    meter: Math.min(config.maxMeter, player.meter + amount),
  };
}

export function setVulnerable(player: PlayerState, frames: number): PlayerState {
  return {
    ...player,
    state: 'vulnerable',
    currentFrame: 0,
    totalFrames: frames,
    currentMove: null,
    comboBuffer: [],
  };
}

// ============================================================================
// ROUND MANAGEMENT
// ============================================================================

export function checkRoundEnd(state: MatchState): MatchState {
  const p1Dead = state.player1.health <= 0;
  const p2Dead = state.player2.health <= 0;
  const timeUp = state.timeRemaining <= 0;

  if (!p1Dead && !p2Dead && !timeUp) {
    return state;
  }

  let roundWinner: PlayerSide | 'draw';

  if (p1Dead && p2Dead) {
    roundWinner = 'draw';
  } else if (p1Dead) {
    roundWinner = 'right';
  } else if (p2Dead) {
    roundWinner = 'left';
  } else if (timeUp) {
    // Time up - winner is whoever has more health percentage
    const p1Percent = state.player1.health / state.player1.fighter.stats.maxHealth;
    const p2Percent = state.player2.health / state.player2.fighter.stats.maxHealth;

    if (p1Percent > p2Percent) {
      roundWinner = 'left';
    } else if (p2Percent > p1Percent) {
      roundWinner = 'right';
    } else {
      roundWinner = 'draw';
    }
  } else {
    return state;
  }

  // Update rounds won
  const newState: MatchState = { ...state, roundState: 'round_over' as const };

  if (roundWinner === 'left') {
    newState.player1 = { ...state.player1, roundsWon: state.player1.roundsWon + 1 };
  } else if (roundWinner === 'right') {
    newState.player2 = { ...state.player2, roundsWon: state.player2.roundsWon + 1 };
  }

  // Check for match winner
  const p1Wins = newState.player1.roundsWon;
  const p2Wins = newState.player2.roundsWon;
  const roundsToWin = Math.ceil((state.maxRounds + 1) / 2);

  if (p1Wins >= roundsToWin) {
    newState.roundState = 'match_over';
    newState.winner = 'left';
  } else if (p2Wins >= roundsToWin) {
    newState.roundState = 'match_over';
    newState.winner = 'right';
  }

  return newState;
}

export function startNextRound(
  state: MatchState,
  config: GameConfig = DEFAULT_GAME_CONFIG,
): MatchState {
  if (state.roundState !== 'round_over') {
    return state;
  }

  return {
    ...state,
    roundNumber: state.roundNumber + 1,
    roundState: 'ready',
    timeRemaining: config.roundTime,
    player1: {
      ...state.player1,
      health: state.player1.fighter.stats.maxHealth,
      meter: 0,
      state: 'idle',
      currentFrame: 0,
      totalFrames: 0,
      position: config.startPositions.left,
      currentMove: null,
      comboBuffer: [],
    },
    player2: {
      ...state.player2,
      health: state.player2.fighter.stats.maxHealth,
      meter: 0,
      state: 'idle',
      currentFrame: 0,
      totalFrames: 0,
      position: config.startPositions.right,
      currentMove: null,
      comboBuffer: [],
    },
  };
}

// ============================================================================
// MAIN GAME LOOP UPDATE
// ============================================================================

export function updateMatchState(
  state: MatchState,
  config: GameConfig = DEFAULT_GAME_CONFIG,
): MatchState {
  if (state.isPaused || state.roundState !== 'fighting') {
    return state;
  }

  let newState = { ...state, frameCount: state.frameCount + 1 };

  // Update time (every 60 frames = 1 second at 60fps)
  if (newState.frameCount % config.fps === 0) {
    newState.timeRemaining = Math.max(0, newState.timeRemaining - 1);
  }

  // Update player frames
  newState.player1 = updatePlayerFrame(newState.player1);
  newState.player2 = updatePlayerFrame(newState.player2);

  // Check for hits
  const inRange = isInRange(newState, config);

  // Player 1 attacking
  if (newState.player1.state === 'attacking' && newState.player1.currentMove) {
    const hitResult = calculateHit(newState.player1, newState.player2, inRange);

    if (hitResult.hit) {
      newState.player2 = applyDamage(newState.player2, hitResult.damage, hitResult.defenderStun);
      newState.player1 = addMeter(newState.player1, hitResult.attackerMeterGain, config);
    } else if (hitResult.blocked) {
      newState.player2 = applyBlockStun(newState.player2, hitResult.defenderStun);
      newState.player1 = addMeter(newState.player1, hitResult.attackerMeterGain, config);
    }
  }

  // Player 1 special
  if (newState.player1.state === 'special' && newState.player1.currentMove) {
    const hitResult = calculateSpecialHit(newState.player1, newState.player2, inRange);

    if (hitResult.hit) {
      newState.player2 = applyDamage(newState.player2, hitResult.damage, hitResult.defenderStun);
    }
  }

  // Player 2 attacking
  if (newState.player2.state === 'attacking' && newState.player2.currentMove) {
    const hitResult = calculateHit(newState.player2, newState.player1, inRange);

    if (hitResult.hit) {
      newState.player1 = applyDamage(newState.player1, hitResult.damage, hitResult.defenderStun);
      newState.player2 = addMeter(newState.player2, hitResult.attackerMeterGain, config);
    } else if (hitResult.blocked) {
      newState.player1 = applyBlockStun(newState.player1, hitResult.defenderStun);
      newState.player2 = addMeter(newState.player2, hitResult.attackerMeterGain, config);
    }
  }

  // Player 2 special
  if (newState.player2.state === 'special' && newState.player2.currentMove) {
    const hitResult = calculateSpecialHit(newState.player2, newState.player1, inRange);

    if (hitResult.hit) {
      newState.player1 = applyDamage(newState.player1, hitResult.damage, hitResult.defenderStun);
    }
  }

  // Check round end
  newState = checkRoundEnd(newState);

  return newState;
}

// ============================================================================
// INPUT HANDLING
// ============================================================================

export function handleInput(
  state: MatchState,
  event: TapEvent,
  config: GameConfig = DEFAULT_GAME_CONFIG,
): MatchState {
  if (state.roundState !== 'fighting') {
    return state;
  }

  const player = event.playerId === 'left' ? state.player1 : state.player2;
  const isPlayer1 = event.playerId === 'left';

  // Add to combo buffer
  let updatedPlayer = addToComboBuffer(player, event.zone, event.timestamp, config);

  // Check for special move activation
  if (checkSpecialCombo(updatedPlayer, event.timestamp) && updatedPlayer.meter >= player.fighter.special.meterCost) {
    updatedPlayer = executeSpecial(updatedPlayer, player.fighter.special);
  } else {
    // Execute regular move based on tap zone
    const move = getMoveFromTapZone(event.zone, player.fighter);
    if (move) {
      updatedPlayer = executeMove(updatedPlayer, move);
    }
  }

  return isPlayer1
    ? { ...state, player1: updatedPlayer }
    : { ...state, player2: updatedPlayer };
}

function getMoveFromTapZone(zone: TapZone, fighter: Fighter): Move | null {
  switch (zone) {
    case 'left_light':
    case 'right_light':
      return fighter.moves.jab;
    case 'left_heavy':
      return fighter.moves.hook;
    case 'right_heavy':
      return fighter.moves.uppercut;
    case 'block':
      return fighter.moves.block;
    case 'dodge_left':
    case 'dodge_right':
      return fighter.moves.dodge;
    default:
      return null;
  }
}
