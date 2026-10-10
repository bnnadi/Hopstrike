/**
 * Game Loop Hook
 * Manages the 60fps game update cycle
 */

import { useEffect, useRef, useCallback } from 'react';
import type { MatchState, GameConfig } from '@/types';
import { DEFAULT_GAME_CONFIG } from '@/types';

declare const performance: { now(): number };

interface UseGameLoopProps {
  isRunning: boolean;
  onUpdate: (deltaTime: number) => void;
  fps?: number;
}

export function useGameLoop({
  isRunning,
  onUpdate,
  fps = DEFAULT_GAME_CONFIG.fps,
}: UseGameLoopProps): void {
  const frameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const accumulatorRef = useRef<number>(0);

  const frameTime = 1000 / fps;

  const gameLoop = useCallback(
    (currentTime: number) => {
      if (!isRunning) {
        return;
      }

      const deltaTime = currentTime - lastTimeRef.current;
      lastTimeRef.current = currentTime;

      // Accumulate time
      accumulatorRef.current += deltaTime;

      // Fixed timestep update
      while (accumulatorRef.current >= frameTime) {
        onUpdate(frameTime);
        accumulatorRef.current -= frameTime;
      }

      frameRef.current = requestAnimationFrame(gameLoop);
    },
    [isRunning, onUpdate, frameTime],
  );

  useEffect(() => {
    if (isRunning) {
      lastTimeRef.current = performance.now();
      accumulatorRef.current = 0;
      frameRef.current = requestAnimationFrame(gameLoop);
    }

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };
  }, [isRunning, gameLoop]);
}
