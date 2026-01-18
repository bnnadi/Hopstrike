/**
 * Match Hook
 * Central hook for managing a fighting match
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import type {
  MatchState,
  Fighter,
  TapEvent,
  TapZone,
  GameConfig,
  AIDifficulty,
} from '@/types';
import { DEFAULT_GAME_CONFIG } from '@/types';
import {
  createMatchState,
  updateMatchState,
  handleInput,
  startNextRound,
} from '@/services/gameEngine';
import {
  updateAI,
  resetAIState,
  initializeAI,
  recordPlayerInput,
} from '@/services/aiEngine';
import { useGameLoop } from './useGameLoop';

interface UseMatchProps {
  fighter1: Fighter;
  fighter2: Fighter;
  vsAI?: boolean;
  aiDifficulty?: AIDifficulty;
  config?: GameConfig;
}

interface UseMatchReturn {
  matchState: MatchState;
  startFight: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  handleTap: (zone: TapZone) => void;
  nextRound: () => void;
  resetMatch: () => void;
  aiDifficulty: AIDifficulty;
}

export function useMatch({
  fighter1,
  fighter2,
  vsAI = true,
  aiDifficulty = 'medium',
  config = DEFAULT_GAME_CONFIG,
}: UseMatchProps): UseMatchReturn {
  const matchIdRef = useRef<string>(
    `match_${Date.now()}_${Math.random().toString(36).slice(2)}`,
  );

  const [matchState, setMatchState] = useState<MatchState>(() =>
    createMatchState(fighter1, fighter2, vsAI, config),
  );

  const isRunning =
    matchState.roundState === 'fighting' && !matchState.isPaused;

  // Initialize AI on mount
  useEffect(() => {
    if (vsAI) {
      initializeAI(matchIdRef.current, fighter2.id, aiDifficulty);
    }
    return () => {
      resetAIState(matchIdRef.current);
    };
  }, [vsAI, fighter2.id, aiDifficulty]);

  // Main game update
  const handleUpdate = useCallback(() => {
    setMatchState((current) => {
      // Update game state
      let newState = updateMatchState(current, config);

      // Process AI if applicable
      if (vsAI && newState.player2.isAI) {
        const aiEvent = updateAI(
          newState,
          matchIdRef.current,
          aiDifficulty,
          config,
        );

        if (aiEvent) {
          newState = handleInput(newState, aiEvent, config);
        }
      }

      return newState;
    });
  }, [config, vsAI, aiDifficulty]);

  useGameLoop({
    isRunning,
    onUpdate: handleUpdate,
    fps: config.fps,
  });

  // Player input handler with observation recording
  const handleTap = useCallback(
    (zone: TapZone) => {
      if (matchState.roundState !== 'fighting' || matchState.isPaused) {
        return;
      }

      const event: TapEvent = {
        zone,
        timestamp: Date.now(),
        playerId: 'left',
      };

      setMatchState((current) => {
        const newState = handleInput(current, event, config);

        // Record player action for AI observation
        if (vsAI) {
          // Determine result based on state change
          let result: 'hit' | 'blocked' | 'dodged' | 'whiffed' | 'none' = 'none';
          if (newState.player2.state === 'hit_stun') {
            result = 'hit';
          } else if (newState.player2.state === 'block_stun') {
            result = 'blocked';
          } else if (newState.player2.state === 'dodging') {
            result = 'dodged';
          } else if (newState.player1.state === 'attacking') {
            result = 'whiffed';
          }

          recordPlayerInput(matchIdRef.current, event, newState, result);
        }

        return newState;
      });
    },
    [matchState.roundState, matchState.isPaused, config, vsAI],
  );

  // Game control functions
  const startFight = useCallback(() => {
    setMatchState((current) => ({
      ...current,
      roundState: 'fighting',
    }));
  }, []);

  const pauseGame = useCallback(() => {
    setMatchState((current) => ({
      ...current,
      isPaused: true,
    }));
  }, []);

  const resumeGame = useCallback(() => {
    setMatchState((current) => ({
      ...current,
      isPaused: false,
    }));
  }, []);

  const nextRound = useCallback(() => {
    setMatchState((current) => {
      const next = startNextRound(current, config);
      return {
        ...next,
        roundState: 'fighting',
      };
    });
  }, [config]);

  const resetMatch = useCallback(() => {
    resetAIState(matchIdRef.current);
    matchIdRef.current = `match_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    if (vsAI) {
      initializeAI(matchIdRef.current, fighter2.id, aiDifficulty);
    }
    setMatchState(createMatchState(fighter1, fighter2, vsAI, config));
  }, [fighter1, fighter2, vsAI, config, aiDifficulty]);

  return {
    matchState,
    startFight,
    pauseGame,
    resumeGame,
    handleTap,
    nextRound,
    resetMatch,
    aiDifficulty,
  };
}
