/**
 * Special Meter Bar Component
 * Shows meter buildup with smooth Reanimated animations
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  withRepeat,
  interpolate,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import { COLORS, SPACING, FONT_SIZES } from '@/constants';
import type { PlayerSide } from '@/types';

interface MeterBarProps {
  currentMeter: number;
  maxMeter: number;
  specialCost: number;
  specialName: string;
  side: PlayerSide;
  accentColor: string;
}

export function MeterBar({
  currentMeter,
  maxMeter,
  specialCost,
  specialName,
  side,
  accentColor,
}: MeterBarProps) {
  const meterPercent = currentMeter / maxMeter;
  const isReady = currentMeter >= specialCost;
  const isLeft = side === 'left';

  // Shared values
  const meterWidth = useSharedValue(meterPercent);
  const pulseScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0);
  const badgeScale = useSharedValue(0);
  const shimmerPosition = useSharedValue(0);

  // Animate meter fill
  useEffect(() => {
    meterWidth.value = withSpring(meterPercent, {
      damping: 15,
      stiffness: 120,
      mass: 0.5,
    });
  }, [meterPercent, meterWidth]);

  // Ready state animations
  useEffect(() => {
    if (isReady) {
      // Glow pulse
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.8, { duration: 400 }),
          withTiming(0.3, { duration: 400 }),
        ),
        -1,
        true,
      );

      // Scale pulse
      pulseScale.value = withRepeat(
        withSequence(
          withSpring(1.05, { damping: 8, stiffness: 200 }),
          withSpring(1, { damping: 8, stiffness: 200 }),
        ),
        -1,
        true,
      );

      // Badge pop in
      badgeScale.value = withSequence(
        withSpring(1.3, { damping: 6, stiffness: 300 }),
        withSpring(1, { damping: 10, stiffness: 200 }),
      );

      // Shimmer effect
      shimmerPosition.value = withRepeat(
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        -1,
        false,
      );
    } else {
      // Reset animations
      cancelAnimation(glowOpacity);
      cancelAnimation(pulseScale);
      cancelAnimation(shimmerPosition);

      glowOpacity.value = withTiming(0, { duration: 200 });
      pulseScale.value = withSpring(1);
      badgeScale.value = withTiming(0, { duration: 150 });
      shimmerPosition.value = 0;
    }

    return () => {
      cancelAnimation(glowOpacity);
      cancelAnimation(pulseScale);
      cancelAnimation(shimmerPosition);
    };
  }, [isReady, glowOpacity, pulseScale, badgeScale, shimmerPosition]);

  // Animated styles
  const barPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const meterFillStyle = useAnimatedStyle(() => ({
    width: `${meterWidth.value * 100}%`,
    backgroundColor: isReady ? COLORS.special : accentColor,
    ...(isLeft ? { left: 0 } : { right: 0 }),
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    backgroundColor: COLORS.special,
  }));

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(
          shimmerPosition.value,
          [0, 1],
          [-100, 200],
        ),
      },
    ],
    opacity: interpolate(
      shimmerPosition.value,
      [0, 0.3, 0.7, 1],
      [0, 0.6, 0.6, 0],
    ),
  }));

  const badgeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: badgeScale.value }],
    opacity: interpolate(badgeScale.value, [0, 0.5, 1], [0, 1, 1]),
  }));

  const containerStyle: ViewStyle = {
    ...styles.container,
    alignItems: isLeft ? 'flex-start' : 'flex-end',
  };

  const thresholdPosition = (specialCost / maxMeter) * 100;

  return (
    <View style={containerStyle}>
      <View style={styles.barContainer}>
        <Animated.View style={[styles.barWrapper, barPulseStyle]}>
          {/* Glow effect when ready */}
          <Animated.View style={[styles.glow, glowStyle]} />

          <View style={styles.barBackground}>
            {/* Meter fill */}
            <Animated.View style={[styles.barFill, meterFillStyle]}>
              {/* Shimmer effect */}
              <Animated.View style={[styles.shimmer, shimmerStyle]} />
            </Animated.View>

            {/* Threshold marker */}
            <View
              style={[
                styles.threshold,
                {
                  left: isLeft ? `${thresholdPosition}%` : undefined,
                  right: !isLeft ? `${100 - thresholdPosition}%` : undefined,
                },
              ]}
            />

            {/* Inner shine */}
            <View style={styles.innerShine} />
          </View>
        </Animated.View>
      </View>

      {/* Ready badge */}
      <Animated.View
        style={[
          styles.readyBadge,
          badgeStyle,
          { backgroundColor: COLORS.special },
        ]}
      >
        <Text style={styles.readyText}>⚡ READY!</Text>
      </Animated.View>

      <Text
        style={[
          styles.specialName,
          { textAlign: isLeft ? 'left' : 'right', color: accentColor },
        ]}
      >
        {specialName}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: SPACING.sm,
  },
  barContainer: {
    width: '100%',
  },
  barWrapper: {
    position: 'relative',
  },
  glow: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 10,
    opacity: 0,
  },
  barBackground: {
    height: 14,
    backgroundColor: COLORS.meterBg,
    borderRadius: 7,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.surface,
  },
  barFill: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    borderRadius: 6,
    overflow: 'hidden',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    transform: [{ skewX: '-20deg' }],
  },
  threshold: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: COLORS.text,
    opacity: 0.5,
  },
  innerShine: {
    position: 'absolute',
    top: 2,
    left: 4,
    right: 4,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 1,
  },
  readyBadge: {
    marginTop: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'center',
    shadowColor: COLORS.special,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 5,
  },
  readyText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '800',
    color: COLORS.textDark,
    letterSpacing: 1,
  },
  specialName: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    marginTop: SPACING.xs,
    opacity: 0.7,
  },
});
