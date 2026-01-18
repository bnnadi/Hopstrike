/**
 * Hit Indicator Component
 * Shows floating damage numbers and hit effects
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { COLORS, FONT_SIZES } from '@/constants';
import type { PlayerSide } from '@/types';

interface HitIndicatorProps {
  damage: number;
  side: PlayerSide;
  type: 'hit' | 'blocked' | 'special';
  visible: boolean;
  onComplete?: () => void;
}

export function HitIndicator({
  damage,
  side,
  type,
  visible,
  onComplete,
}: HitIndicatorProps) {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    if (visible && damage > 0) {
      // Reset
      translateY.setValue(0);
      opacity.setValue(1);
      scale.setValue(0.5);

      // Animate
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -80,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.spring(scale, {
            toValue: 1.2,
            friction: 4,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.delay(400),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => {
        onComplete?.();
      });
    }
  }, [visible, damage, translateY, opacity, scale, onComplete]);

  if (!visible || damage <= 0) {
    return null;
  }

  const isLeft = side === 'left';
  const color =
    type === 'special'
      ? COLORS.special
      : type === 'blocked'
        ? COLORS.block
        : COLORS.hit;

  const text =
    type === 'blocked' ? 'BLOCKED!' : type === 'special' ? `💥 ${damage}` : `-${damage}`;

  return (
    <Animated.View
      style={[
        styles.container,
        isLeft ? styles.left : styles.right,
        {
          transform: [{ translateY }, { scale }],
          opacity,
        },
      ]}
    >
      <Text style={[styles.damageText, { color }]}>{text}</Text>
    </Animated.View>
  );
}

interface ActionIndicatorProps {
  action: string;
  side: PlayerSide;
  visible: boolean;
}

export function ActionIndicator({ action, side, visible }: ActionIndicatorProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (visible && action) {
      opacity.setValue(1);
      scale.setValue(0.8);

      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          friction: 6,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.delay(200),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    }
  }, [visible, action, opacity, scale]);

  if (!visible || !action) {
    return null;
  }

  const isLeft = side === 'left';

  return (
    <Animated.View
      style={[
        styles.actionContainer,
        isLeft ? styles.actionLeft : styles.actionRight,
        {
          opacity,
          transform: [{ scale }],
        },
      ]}
    >
      <Text style={styles.actionText}>{action}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 200,
  },
  left: {
    left: '15%',
    top: '40%',
  },
  right: {
    right: '15%',
    top: '40%',
  },
  damageText: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  actionContainer: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    zIndex: 150,
  },
  actionLeft: {
    left: '20%',
    top: '55%',
  },
  actionRight: {
    right: '20%',
    top: '55%',
  },
  actionText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.text,
    textTransform: 'uppercase',
  },
});
