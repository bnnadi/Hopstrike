/**
 * Game Overlay Component
 * Displays round start, end, and match result overlays
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { COLORS, SPACING, FONT_SIZES } from '@/constants';
import type { RoundState, PlayerSide, Fighter } from '@/types';

interface GameOverlayProps {
  roundState: RoundState;
  roundNumber: number;
  winner: PlayerSide | 'draw' | null;
  fighter1: Fighter;
  fighter2: Fighter;
  player1Wins: number;
  player2Wins: number;
  onStart: () => void;
  onNextRound: () => void;
  onRematch: () => void;
  onQuit: () => void;
}

export function GameOverlay({
  roundState,
  roundNumber,
  winner,
  fighter1,
  fighter2,
  player1Wins,
  player2Wins,
  onStart,
  onNextRound,
  onRematch,
  onQuit,
}: GameOverlayProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;

  const isVisible =
    roundState === 'ready' ||
    roundState === 'round_over' ||
    roundState === 'match_over';

  useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 100,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.5);
    }
  }, [isVisible, fadeAnim, scaleAnim]);

  if (!isVisible) {
    return null;
  }

  const getWinnerFighter = () => {
    if (winner === 'left') return fighter1;
    if (winner === 'right') return fighter2;
    return null;
  };

  const winnerFighter = getWinnerFighter();

  return (
    <Animated.View
      style={[
        styles.overlay,
        {
          opacity: fadeAnim,
        },
      ]}
    >
      <Animated.View
        style={[
          styles.content,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Ready screen */}
        {roundState === 'ready' && (
          <>
            <Text style={styles.title}>ROUND {roundNumber}</Text>
            <View style={styles.vsContainer}>
              <View style={styles.fighterPreview}>
                <Text style={styles.fighterEmoji}>🦘</Text>
                <Text
                  style={[styles.fighterName, { color: fighter1.primaryColor }]}
                >
                  {fighter1.name}
                </Text>
              </View>
              <Text style={styles.vsText}>VS</Text>
              <View style={styles.fighterPreview}>
                <Text style={styles.fighterEmoji}>🦘</Text>
                <Text
                  style={[styles.fighterName, { color: fighter2.primaryColor }]}
                >
                  {fighter2.name}
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.button} onPress={onStart}>
              <Text style={styles.buttonText}>FIGHT!</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Round over screen */}
        {roundState === 'round_over' && (
          <>
            <Text style={styles.title}>
              {winner === 'draw' ? 'DRAW!' : 'ROUND OVER'}
            </Text>
            {winnerFighter && (
              <View style={styles.winnerDisplay}>
                <Text style={styles.winnerEmoji}>🏆</Text>
                <Text
                  style={[
                    styles.winnerName,
                    { color: winnerFighter.primaryColor },
                  ]}
                >
                  {winnerFighter.name} WINS!
                </Text>
              </View>
            )}
            <View style={styles.scoreDisplay}>
              <Text style={styles.scoreText}>
                {player1Wins} - {player2Wins}
              </Text>
            </View>
            <TouchableOpacity style={styles.button} onPress={onNextRound}>
              <Text style={styles.buttonText}>NEXT ROUND</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Match over screen */}
        {roundState === 'match_over' && (
          <>
            <Text style={styles.title}>MATCH OVER</Text>
            {winnerFighter ? (
              <View style={styles.winnerDisplay}>
                <Text style={styles.championEmoji}>👑</Text>
                <Text
                  style={[
                    styles.championName,
                    { color: winnerFighter.primaryColor },
                  ]}
                >
                  {winnerFighter.name}
                </Text>
                <Text style={styles.championSubtext}>CHAMPION!</Text>
              </View>
            ) : (
              <Text style={styles.drawText}>DRAW!</Text>
            )}
            <View style={styles.finalScore}>
              <Text style={styles.finalScoreText}>
                {player1Wins} - {player2Wins}
              </Text>
            </View>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, styles.rematchButton]}
                onPress={onRematch}
              >
                <Text style={styles.buttonText}>REMATCH</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.quitButton]}
                onPress={onQuit}
              >
                <Text style={styles.buttonText}>QUIT</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  content: {
    backgroundColor: COLORS.background,
    borderRadius: 24,
    padding: SPACING.xl,
    alignItems: 'center',
    minWidth: 300,
    borderWidth: 3,
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
  },
  title: {
    fontSize: FONT_SIZES.title,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: 4,
    marginBottom: SPACING.lg,
    textShadowColor: COLORS.primary,
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  vsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xl,
    gap: SPACING.lg,
  },
  fighterPreview: {
    alignItems: 'center',
  },
  fighterEmoji: {
    fontSize: 48,
    marginBottom: SPACING.sm,
  },
  fighterName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
  },
  vsText: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '900',
    color: COLORS.special,
    marginHorizontal: SPACING.lg,
  },
  winnerDisplay: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  winnerEmoji: {
    fontSize: 64,
    marginBottom: SPACING.sm,
  },
  winnerName: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '800',
  },
  championEmoji: {
    fontSize: 72,
    marginBottom: SPACING.sm,
  },
  championName: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '900',
    marginBottom: SPACING.xs,
  },
  championSubtext: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.special,
    letterSpacing: 4,
  },
  drawText: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '800',
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  scoreDisplay: {
    marginBottom: SPACING.lg,
  },
  scoreText: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '800',
    color: COLORS.textSecondary,
  },
  finalScore: {
    marginBottom: SPACING.xl,
  },
  finalScoreText: {
    fontSize: FONT_SIZES.title,
    fontWeight: '900',
    color: COLORS.text,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    minWidth: 150,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: 2,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  rematchButton: {
    backgroundColor: COLORS.success,
  },
  quitButton: {
    backgroundColor: COLORS.error,
  },
});
