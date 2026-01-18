/**
 * Screen Shake Hook
 * Provides screen shake effects for impactful moments
 */

import { useCallback } from 'react';
import {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';

export type ShakeIntensity = 'light' | 'medium' | 'heavy' | 'explosive';

interface ShakeConfig {
  translateX: number;
  translateY: number;
  rotation: number;
  duration: number;
  iterations: number;
}

const SHAKE_CONFIGS: Record<ShakeIntensity, ShakeConfig> = {
  light: {
    translateX: 3,
    translateY: 2,
    rotation: 0.5,
    duration: 30,
    iterations: 3,
  },
  medium: {
    translateX: 6,
    translateY: 4,
    rotation: 1,
    duration: 35,
    iterations: 4,
  },
  heavy: {
    translateX: 12,
    translateY: 8,
    rotation: 2,
    duration: 40,
    iterations: 5,
  },
  explosive: {
    translateX: 20,
    translateY: 15,
    rotation: 3,
    duration: 50,
    iterations: 6,
  },
};

export function useScreenShake() {
  const shakeX = useSharedValue(0);
  const shakeY = useSharedValue(0);
  const shakeRotation = useSharedValue(0);

  const shake = useCallback(
    (intensity: ShakeIntensity = 'medium') => {
      'worklet';
      const config = SHAKE_CONFIGS[intensity];

      // Build shake sequence for X
      const xSequence: number[] = [];
      const ySequence: number[] = [];
      const rotSequence: number[] = [];

      for (let i = 0; i < config.iterations; i++) {
        const dampening = 1 - i / config.iterations;
        xSequence.push(config.translateX * dampening * (i % 2 === 0 ? 1 : -1));
        ySequence.push(config.translateY * dampening * (i % 2 === 0 ? 1 : -1));
        rotSequence.push(config.rotation * dampening * (i % 2 === 0 ? 1 : -1));
      }

      // Animate X shake
      shakeX.value = withSequence(
        ...xSequence.map((val) =>
          withTiming(val, {
            duration: config.duration,
            easing: Easing.out(Easing.quad),
          }),
        ),
        withSpring(0, { damping: 15, stiffness: 200 }),
      );

      // Animate Y shake
      shakeY.value = withSequence(
        ...ySequence.map((val) =>
          withTiming(val, {
            duration: config.duration,
            easing: Easing.out(Easing.quad),
          }),
        ),
        withSpring(0, { damping: 15, stiffness: 200 }),
      );

      // Animate rotation shake
      shakeRotation.value = withSequence(
        ...rotSequence.map((val) =>
          withTiming(val, {
            duration: config.duration,
            easing: Easing.out(Easing.quad),
          }),
        ),
        withSpring(0, { damping: 15, stiffness: 200 }),
      );
    },
    [shakeX, shakeY, shakeRotation],
  );

  const triggerShake = useCallback(
    (intensity: ShakeIntensity = 'medium') => {
      const config = SHAKE_CONFIGS[intensity];

      // Build shake animation sequences
      const createShakeSequence = (
        maxVal: number,
        iterations: number,
        duration: number,
      ) => {
        const timings = [];
        for (let i = 0; i < iterations; i++) {
          const dampening = 1 - i / iterations;
          const direction = i % 2 === 0 ? 1 : -1;
          timings.push(
            withTiming(maxVal * dampening * direction, {
              duration,
              easing: Easing.out(Easing.quad),
            }),
          );
        }
        return withSequence(
          ...timings,
          withSpring(0, { damping: 15, stiffness: 200 }),
        );
      };

      shakeX.value = createShakeSequence(
        config.translateX,
        config.iterations,
        config.duration,
      );

      shakeY.value = createShakeSequence(
        config.translateY,
        config.iterations,
        config.duration,
      );

      shakeRotation.value = createShakeSequence(
        config.rotation,
        config.iterations,
        config.duration,
      );
    },
    [shakeX, shakeY, shakeRotation],
  );

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: shakeX.value },
      { translateY: shakeY.value },
      { rotate: `${shakeRotation.value}deg` },
    ],
  }));

  return {
    shakeStyle,
    triggerShake,
    shakeX,
    shakeY,
    shakeRotation,
  };
}

/**
 * Determine shake intensity based on damage
 */
export function getShakeIntensity(damage: number): ShakeIntensity {
  if (damage >= 30) return 'explosive';
  if (damage >= 20) return 'heavy';
  if (damage >= 10) return 'medium';
  return 'light';
}
