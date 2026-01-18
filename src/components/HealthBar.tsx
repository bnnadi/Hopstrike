/**
 * Health Bar Component
 * Displays fighter health with smooth Reanimated animations
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  withDelay,
  interpolate,
  interpolateColor,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { COLORS, SPACING, FONT_SIZES } from '@/constants';
import type { PlayerSide } from '@/types';

interface HealthBarProps {
  currentHealth: number;
  maxHealth: number;
  fighterName: string;
  side: PlayerSide;
  primaryColor: string;
  onDamage?: (damage: number) => void;
}

export function HealthBar({
  currentHealth,
  maxHealth,
  fighterName,
  side,
  primaryColor,
  onDamage,
}: HealthBarProps) {
  const healthPercent = Math.max(0, currentHealth / maxHealth);
  const isLeft = side === 'left';

  // Shared values
  const healthWidth = useSharedValue(healthPercent);
  const damageWidth = useSharedValue(healthPercent); // Delayed "damage trail"
  const flashOpacity = useSharedValue(0);
  const shakeX = useSharedValue(0);
  const pulseScale = useSharedValue(1);

  // Track previous health for damage detection
  const prevHealthRef = React.useRef(currentHealth);

  useEffect(() => {
    const prevHealth = prevHealthRef.current;
    const damage = prevHealth - currentHealth;

    if (damage > 0) {
      // Damage taken!
      const damagePercent = damage / maxHealth;

      // Notify parent of damage
      if (onDamage) {
        runOnJS(onDamage)(damage);
      }

      // Flash effect
      flashOpacity.value = withSequence(
        withTiming(1, { duration: 50 }),
        withTiming(0, { duration: 200 }),
      );

      // Shake effect based on damage
      const shakeAmount = Math.min(damagePercent * 30, 15);
      shakeX.value = withSequence(
        withTiming(shakeAmount, { duration: 30 }),
        withTiming(-shakeAmount * 0.8, { duration: 30 }),
        withTiming(shakeAmount * 0.5, { duration: 30 }),
        withSpring(0, { damping: 10, stiffness: 200 }),
      );

      // Immediate health drop
      healthWidth.value = withTiming(healthPercent, {
        duration: 150,
        easing: Easing.out(Easing.quad),
      });

      // Delayed damage trail (the "ghost" bar)
      damageWidth.value = withDelay(
        200,
        withTiming(healthPercent, {
          duration: 400,
          easing: Easing.out(Easing.cubic),
        }),
      );
    } else if (damage < 0) {
      // Healing (if implemented)
      healthWidth.value = withSpring(healthPercent, {
        damping: 15,
        stiffness: 100,
      });
      damageWidth.value = withSpring(healthPercent, {
        damping: 15,
        stiffness: 100,
      });
    }

    prevHealthRef.current = currentHealth;
  }, [currentHealth, maxHealth, healthPercent, healthWidth, damageWidth, flashOpacity, shakeX, onDamage]);

  // Low health pulse warning
  useEffect(() => {
    if (healthPercent <= 0.25 && healthPercent > 0) {
      pulseScale.value = withSequence(
        withTiming(1.02, { duration: 300 }),
        withTiming(1, { duration: 300 }),
      );

      const interval = setInterval(() => {
        pulseScale.value = withSequence(
          withTiming(1.02, { duration: 300 }),
          withTiming(1, { duration: 300 }),
        );
      }, 600);

      return () => clearInterval(interval);
    } else {
      pulseScale.value = withSpring(1);
    }
  }, [healthPercent, pulseScale]);

  // Animated styles
  const containerShakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  const barScaleStyle = useAnimatedStyle(() => ({
    transform: [{ scaleY: pulseScale.value }],
  }));

  const healthFillStyle = useAnimatedStyle(() => {
    const width = `${healthWidth.value * 100}%`;
    const color = interpolateColor(
      healthWidth.value,
      [0, 0.25, 0.5, 1],
      [COLORS.error, COLORS.error, COLORS.warning, COLORS.success],
    );

    return {
      width,
      backgroundColor: color,
      ...(isLeft ? { left: 0 } : { right: 0 }),
    };
  });

  const damageFillStyle = useAnimatedStyle(() => ({
    width: `${damageWidth.value * 100}%`,
    ...(isLeft ? { left: 0 } : { right: 0 }),
  }));

  const flashStyle = useAnimatedStyle(() => ({
    opacity: flashOpacity.value,
    backgroundColor: COLORS.hit,
  }));

  const containerStyle: ViewStyle = {
    ...styles.container,
    alignItems: isLeft ? 'flex-start' : 'flex-end',
  };

  const barContainerStyle: ViewStyle = {
    ...styles.barContainer,
    flexDirection: isLeft ? 'row' : 'row-reverse',
  };

  return (
    <Animated.View style={[containerStyle, containerShakeStyle]}>
      <Text
        style={[
          styles.name,
          { color: primaryColor, textAlign: isLeft ? 'left' : 'right' },
        ]}
        numberOfLines={1}
      >
        {fighterName}
      </Text>

      <View style={barContainerStyle}>
        <Animated.View style={[styles.barBackground, barScaleStyle]}>
          {/* Damage trail (ghost bar) */}
          <Animated.View style={[styles.damageTrail, damageFillStyle]} />

          {/* Current health */}
          <Animated.View style={[styles.barFill, healthFillStyle]} />

          {/* Flash overlay */}
          <Animated.View style={[styles.flashOverlay, flashStyle]} />

          {/* Shine effect */}
          <View style={styles.shine} />
        </Animated.View>

        <View style={styles.healthText}>
          <Text style={styles.healthValue}>
            {Math.ceil(currentHealth)}/{maxHealth}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: SPACING.sm,
  },
  name: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    marginBottom: SPACING.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  barContainer: {
    alignItems: 'center',
    gap: SPACING.sm,
  },
  barBackground: {
    flex: 1,
    height: 22,
    backgroundColor: COLORS.healthBg,
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  damageTrail: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    backgroundColor: COLORS.warning,
    opacity: 0.6,
    borderRadius: 2,
  },
  barFill: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    borderRadius: 2,
  },
  flashOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  shine: {
    position: 'absolute',
    top: 2,
    left: 4,
    right: 4,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
  },
  healthText: {
    minWidth: 60,
    alignItems: 'center',
  },
  healthValue: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
  },
});
