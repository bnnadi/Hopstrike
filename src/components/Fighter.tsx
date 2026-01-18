/**
 * Fighter Display Component
 * Renders a kangaroo fighter with spring-based Reanimated animations
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  withRepeat,
  withDelay,
  interpolate,
  Easing,
  cancelAnimation,
  runOnJS,
} from 'react-native-reanimated';
import { COLORS, SPACING, FONT_SIZES } from '@/constants';
import type { PlayerState, FighterState } from '@/types';

interface FighterProps {
  player: PlayerState;
  onHitLanded?: () => void;
}

// Emoji-based fighter representation (placeholder for actual sprites)
const FIGHTER_POSES: Record<FighterState, string> = {
  idle: '🦘',
  moving_forward: '🦘',
  moving_backward: '🦘',
  attacking: '👊',
  blocking: '🛡️',
  dodging: '💨',
  hit_stun: '😵',
  block_stun: '😤',
  knocked_down: '💫',
  special: '⭐',
  vulnerable: '😰',
};

const STATE_COLORS: Record<FighterState, string> = {
  idle: 'transparent',
  moving_forward: 'transparent',
  moving_backward: 'transparent',
  attacking: COLORS.hit,
  blocking: COLORS.block,
  dodging: COLORS.dodge,
  hit_stun: COLORS.error,
  block_stun: COLORS.warning,
  knocked_down: COLORS.error,
  special: COLORS.special,
  vulnerable: COLORS.error,
};

// Spring configs for different animation feels
const SPRING_CONFIGS = {
  punch: { damping: 8, stiffness: 300, mass: 0.5 },
  hit: { damping: 12, stiffness: 400, mass: 0.3 },
  bounce: { damping: 10, stiffness: 150, mass: 0.8 },
  snappy: { damping: 15, stiffness: 500, mass: 0.2 },
};

export function Fighter({ player, onHitLanded }: FighterProps) {
  const isLeft = player.side === 'left';

  // Shared values for animations
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const gloveExtension = useSharedValue(0);
  const gloveRotation = useSharedValue(0);
  const bodySquash = useSharedValue(1);
  const bodyStretch = useSharedValue(1);
  const glowOpacity = useSharedValue(0);
  const glowScale = useSharedValue(1);

  // Idle breathing animation
  useEffect(() => {
    if (player.state === 'idle') {
      // Subtle breathing bounce
      translateY.value = withRepeat(
        withSequence(
          withTiming(-3, { duration: 800, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        true,
      );

      // Subtle scale breathing
      bodySquash.value = withRepeat(
        withSequence(
          withTiming(0.98, { duration: 800 }),
          withTiming(1.02, { duration: 800 }),
        ),
        -1,
        true,
      );
    }

    return () => {
      cancelAnimation(translateY);
      cancelAnimation(bodySquash);
    };
  }, [player.state, translateY, bodySquash]);

  // State-based animations
  useEffect(() => {
    switch (player.state) {
      case 'attacking':
        // Anticipation (wind up)
        translateX.value = withSequence(
          // Pull back
          withTiming(isLeft ? -8 : 8, { duration: 50 }),
          // Punch forward with spring
          withSpring(isLeft ? 25 : -25, SPRING_CONFIGS.punch),
          // Return to neutral
          withSpring(0, SPRING_CONFIGS.bounce),
        );

        // Squash and stretch
        bodySquash.value = withSequence(
          withTiming(1.1, { duration: 50 }), // Anticipation squash
          withTiming(0.9, { duration: 80 }), // Stretch on punch
          withSpring(1, SPRING_CONFIGS.bounce),
        );

        bodyStretch.value = withSequence(
          withTiming(0.9, { duration: 50 }),
          withTiming(1.15, { duration: 80 }),
          withSpring(1, SPRING_CONFIGS.bounce),
        );

        // Glove punch animation
        gloveExtension.value = withSequence(
          withTiming(0, { duration: 50 }),
          withSpring(1, SPRING_CONFIGS.snappy),
          withDelay(100, withSpring(0, SPRING_CONFIGS.bounce)),
        );

        gloveRotation.value = withSequence(
          withTiming(isLeft ? -15 : 15, { duration: 50 }),
          withSpring(isLeft ? 10 : -10, SPRING_CONFIGS.punch),
          withSpring(0, SPRING_CONFIGS.bounce),
        );
        break;

      case 'hit_stun':
        // Shake on hit
        translateX.value = withSequence(
          withTiming(isLeft ? -15 : 15, { duration: 30 }),
          withTiming(isLeft ? 12 : -12, { duration: 30 }),
          withTiming(isLeft ? -8 : 8, { duration: 30 }),
          withTiming(isLeft ? 5 : -5, { duration: 30 }),
          withSpring(0, SPRING_CONFIGS.hit),
        );

        // Impact squash
        scale.value = withSequence(
          withTiming(0.85, { duration: 50 }),
          withSpring(1, SPRING_CONFIGS.bounce),
        );

        // Slight rotation on impact
        rotation.value = withSequence(
          withTiming(isLeft ? -5 : 5, { duration: 50 }),
          withSpring(0, SPRING_CONFIGS.bounce),
        );
        break;

      case 'blocking':
        // Brace for impact
        translateX.value = withSpring(isLeft ? -5 : 5, SPRING_CONFIGS.snappy);
        scale.value = withSpring(0.95, SPRING_CONFIGS.snappy);
        bodySquash.value = withSpring(1.05, SPRING_CONFIGS.snappy);
        bodyStretch.value = withSpring(0.95, SPRING_CONFIGS.snappy);
        break;

      case 'block_stun':
        // Pushed back while blocking
        translateX.value = withSequence(
          withTiming(isLeft ? -20 : 20, { duration: 80 }),
          withSpring(0, SPRING_CONFIGS.bounce),
        );
        break;

      case 'dodging':
        // Quick sidestep
        translateX.value = withSequence(
          withSpring(isLeft ? -30 : 30, SPRING_CONFIGS.snappy),
          withDelay(150, withSpring(0, SPRING_CONFIGS.bounce)),
        );

        // Duck down slightly
        translateY.value = withSequence(
          withTiming(10, { duration: 100 }),
          withSpring(0, SPRING_CONFIGS.bounce),
        );

        // Lean into dodge
        rotation.value = withSequence(
          withTiming(isLeft ? 10 : -10, { duration: 100 }),
          withSpring(0, SPRING_CONFIGS.bounce),
        );
        break;

      case 'special':
        // Epic special move animation
        glowOpacity.value = withRepeat(
          withSequence(
            withTiming(1, { duration: 100 }),
            withTiming(0.3, { duration: 100 }),
          ),
          -1,
          true,
        );

        glowScale.value = withRepeat(
          withSequence(
            withTiming(1.3, { duration: 150 }),
            withTiming(1, { duration: 150 }),
          ),
          -1,
          true,
        );

        // Power-up scale
        scale.value = withSequence(
          withTiming(1.15, { duration: 150 }),
          withRepeat(
            withSequence(
              withTiming(1.1, { duration: 100 }),
              withTiming(1.15, { duration: 100 }),
            ),
            3,
            true,
          ),
          withSpring(1, SPRING_CONFIGS.bounce),
        );

        // Combo punch sequence
        gloveExtension.value = withRepeat(
          withSequence(
            withSpring(1, SPRING_CONFIGS.snappy),
            withTiming(0, { duration: 80 }),
          ),
          3,
          false,
        );
        break;

      case 'knocked_down':
        // Fall animation
        rotation.value = withSequence(
          withTiming(isLeft ? 20 : -20, { duration: 200 }),
          withSpring(isLeft ? 90 : -90, { damping: 20, stiffness: 80 }),
        );

        translateY.value = withSequence(
          withTiming(-20, { duration: 100 }),
          withSpring(30, { damping: 15, stiffness: 100 }),
        );

        scale.value = withTiming(0.8, { duration: 300 });
        break;

      case 'vulnerable':
        // Staggered/dazed
        translateX.value = withRepeat(
          withSequence(
            withTiming(5, { duration: 100 }),
            withTiming(-5, { duration: 100 }),
          ),
          -1,
          true,
        );
        break;

      default:
        // Reset to neutral for idle/movement states
        translateX.value = withSpring(0, SPRING_CONFIGS.bounce);
        scale.value = withSpring(1, SPRING_CONFIGS.bounce);
        rotation.value = withSpring(0, SPRING_CONFIGS.bounce);
        bodyStretch.value = withSpring(1, SPRING_CONFIGS.bounce);
        gloveExtension.value = withTiming(0, { duration: 100 });
        glowOpacity.value = withTiming(0, { duration: 100 });
        break;
    }
  }, [
    player.state,
    isLeft,
    translateX,
    translateY,
    scale,
    rotation,
    gloveExtension,
    gloveRotation,
    bodySquash,
    bodyStretch,
    glowOpacity,
    glowScale,
  ]);

  // Animated styles
  const containerStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
      { scaleX: isLeft ? 1 : -1 },
    ],
  }));

  const bodyStyle = useAnimatedStyle(() => ({
    transform: [
      { scaleX: bodySquash.value },
      { scaleY: bodyStretch.value },
    ],
  }));

  const gloveStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(gloveExtension.value, [0, 1], [0, isLeft ? 40 : -40]) },
      { translateY: interpolate(gloveExtension.value, [0, 1], [0, -10]) },
      { rotate: `${gloveRotation.value}deg` },
      { scale: interpolate(gloveExtension.value, [0, 0.5, 1], [0.8, 1.2, 1]) },
    ],
    opacity: interpolate(gloveExtension.value, [0, 0.2, 1], [0.3, 1, 1]),
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [{ scale: glowScale.value }],
  }));

  const pose = FIGHTER_POSES[player.state];
  const stateColor = STATE_COLORS[player.state];

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      {/* Glow effect for special moves */}
      <Animated.View
        style={[
          styles.glow,
          glowStyle,
          { backgroundColor: COLORS.special },
        ]}
      />

      {/* State indicator */}
      {stateColor !== 'transparent' && (
        <View
          style={[styles.stateIndicator, { backgroundColor: stateColor }]}
        />
      )}

      {/* Fighter body */}
      <Animated.View style={[styles.fighterBody, bodyStyle]}>
        <View
          style={[
            styles.fighterInner,
            { backgroundColor: player.fighter.primaryColor },
          ]}
        >
          <Text style={styles.fighterEmoji}>{pose}</Text>
        </View>
      </Animated.View>

      {/* Animated glove */}
      <Animated.View
        style={[
          styles.glove,
          isLeft ? styles.gloveRight : styles.gloveLeft,
          gloveStyle,
        ]}
      >
        <Text style={styles.gloveEmoji}>🥊</Text>
      </Animated.View>

      {/* Fighter name (flipped back to normal) */}
      <Text
        style={[styles.fighterName, { transform: [{ scaleX: isLeft ? 1 : -1 }] }]}
      >
        {player.fighter.name}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 120,
    height: 150,
  },
  glow: {
    position: 'absolute',
    width: 100,
    height: 120,
    borderRadius: 50,
    opacity: 0,
  },
  stateIndicator: {
    position: 'absolute',
    top: -5,
    width: 10,
    height: 10,
    borderRadius: 5,
    zIndex: 10,
  },
  fighterBody: {
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  fighterInner: {
    width: 80,
    height: 100,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  fighterEmoji: {
    fontSize: 48,
  },
  glove: {
    position: 'absolute',
    zIndex: 5,
  },
  gloveLeft: {
    left: -5,
    top: '35%',
  },
  gloveRight: {
    right: -5,
    top: '35%',
  },
  gloveEmoji: {
    fontSize: 36,
  },
  fighterName: {
    marginTop: SPACING.sm,
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
  },
});
