/**
 * Main Menu Screen
 * Entry point for the game
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, FONT_SIZES } from '@/constants';
import type { MainMenuScreenProps } from '@/navigation';

export function MainMenuScreen({ navigation }: MainMenuScreenProps) {
  const insets = useSafeAreaInsets();

  const handlePlayVsAI = () => {
    navigation.navigate('FighterSelect');
  };

  const handlePlayVsHuman = () => {
    Alert.alert('Coming Soon', 'VS Human mode is coming in a future update!');
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      {/* Background decoration */}
      <View style={styles.backgroundDecor}>
        <View style={[styles.circle, styles.circle1]} />
        <View style={[styles.circle, styles.circle2]} />
        <View style={[styles.circle, styles.circle3]} />
      </View>

      {/* Logo area */}
      <View style={styles.logoContainer}>
        <Text style={styles.logoEmoji}>🥊</Text>
        <Text style={styles.logoTitle}>HOPSTRIKE</Text>
        <Text style={styles.logoSubtitle}>KANGAROO BOXING</Text>
      </View>

      {/* Menu buttons */}
      <View style={styles.menuContainer}>
        <TouchableOpacity
          style={[styles.menuButton, styles.primaryButton]}
          onPress={handlePlayVsAI}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonEmoji}>🤖</Text>
          <View style={styles.buttonTextContainer}>
            <Text style={styles.buttonTitle}>VS AI</Text>
            <Text style={styles.buttonSubtitle}>Fight the computer</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuButton, styles.secondaryButton]}
          onPress={handlePlayVsHuman}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonEmoji}>👥</Text>
          <View style={styles.buttonTextContainer}>
            <Text style={styles.buttonTitle}>VS HUMAN</Text>
            <Text style={styles.buttonSubtitle}>Coming soon...</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Tap to box!</Text>
        <View style={styles.kangarooRow}>
          <Text style={styles.footerEmoji}>🦘</Text>
          <Text style={styles.footerEmoji}>🥊</Text>
          <Text style={styles.footerEmoji}>🦘</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  backgroundDecor: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  circle: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.1,
  },
  circle1: {
    width: 300,
    height: 300,
    backgroundColor: COLORS.primary,
    top: -100,
    left: -100,
  },
  circle2: {
    width: 200,
    height: 200,
    backgroundColor: COLORS.secondary,
    top: '40%',
    right: -80,
  },
  circle3: {
    width: 250,
    height: 250,
    backgroundColor: COLORS.special,
    bottom: -80,
    left: '20%',
  },
  logoContainer: {
    alignItems: 'center',
    paddingTop: SPACING.xxl,
  },
  logoEmoji: {
    fontSize: 80,
    marginBottom: SPACING.md,
  },
  logoTitle: {
    fontSize: FONT_SIZES.title + 2,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: 6,
    textShadowColor: COLORS.primary,
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 6,
  },
  logoSubtitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.textSecondary,
    letterSpacing: 4,
    marginTop: SPACING.sm,
  },
  menuContainer: {
    width: '100%',
    gap: SPACING.md,
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    borderRadius: 16,
    borderWidth: 2,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primaryDark,
  },
  secondaryButton: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.surfaceLight,
    opacity: 0.6,
  },
  buttonEmoji: {
    fontSize: 40,
    marginRight: SPACING.lg,
  },
  buttonTextContainer: {
    flex: 1,
  },
  buttonTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: 2,
  },
  buttonSubtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    opacity: 0.7,
    marginTop: SPACING.xs,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: SPACING.xl,
  },
  footerText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  kangarooRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  footerEmoji: {
    fontSize: 32,
  },
});
