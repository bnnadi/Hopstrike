/**
 * Round Display Component
 * Shows round number, timer, and round indicators
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { COLORS, SPACING, FONT_SIZES } from '@/constants';
import type { RoundState } from '@/types';

interface RoundDisplayProps {
  roundNumber: number;
  maxRounds: number;
  timeRemaining: number;
  player1Wins: number;
  player2Wins: number;
  roundState: RoundState;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function RoundIndicator({
  won,
  position,
}: {
  won: boolean;
  position: 'left' | 'right';
}) {
  return (
    <View
      style={[
        styles.roundIndicator,
        won && styles.roundIndicatorWon,
        position === 'left' ? { marginRight: SPACING.xs } : { marginLeft: SPACING.xs },
      ]}
    />
  );
}

export function RoundDisplay({
  roundNumber,
  maxRounds,
  timeRemaining,
  player1Wins,
  player2Wins,
  roundState,
}: RoundDisplayProps) {
  const timerPulse = useRef(new Animated.Value(1)).current;
  const isLowTime = timeRemaining <= 10;

  useEffect(() => {
    if (isLowTime && roundState === 'fighting') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(timerPulse, {
            toValue: 1.1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(timerPulse, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      timerPulse.setValue(1);
    }
  }, [isLowTime, roundState, timerPulse]);

  const roundsToWin = Math.ceil((maxRounds + 1) / 2);

  return (
    <View style={styles.container}>
      {/* Player 1 round indicators */}
      <View style={styles.indicators}>
        {Array.from({ length: roundsToWin }).map((_, i) => (
          <RoundIndicator key={`p1-${i}`} won={i < player1Wins} position="left" />
        ))}
      </View>

      {/* Timer and round */}
      <View style={styles.center}>
        <Text style={styles.roundText}>ROUND {roundNumber}</Text>
        <Animated.View
          style={{
            transform: [{ scale: timerPulse }],
          }}
        >
          <Text
            style={[styles.timerText, isLowTime && styles.timerTextLow]}
          >
            {formatTime(timeRemaining)}
          </Text>
        </Animated.View>
      </View>

      {/* Player 2 round indicators */}
      <View style={styles.indicators}>
        {Array.from({ length: roundsToWin }).map((_, i) => (
          <RoundIndicator
            key={`p2-${i}`}
            won={i < player2Wins}
            position="right"
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  indicators: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roundIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.surfaceLight,
  },
  roundIndicatorWon: {
    backgroundColor: COLORS.special,
    borderColor: COLORS.special,
  },
  center: {
    alignItems: 'center',
  },
  roundText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 2,
    marginBottom: SPACING.xs,
  },
  timerText: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '800',
    color: COLORS.text,
    fontVariant: ['tabular-nums'],
  },
  timerTextLow: {
    color: COLORS.error,
  },
});
