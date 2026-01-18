/**
 * Combo Display Component
 * Shows special move combo notation with visual tap indicators
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, DIFFICULTY_DISPLAY, type DifficultyLevel } from '@/constants';
import type { ComboInput, TapZone } from '@/types';
import { COMBO_METADATA, ComboDifficulty } from '@/constants/combos';

// ============================================================================
// TAP ZONE VISUAL CONFIG
// ============================================================================

interface TapZoneVisual {
  symbol: string;
  label: string;
  color: string;
  shortLabel: string;
}

const TAP_ZONE_VISUALS: Record<TapZone, TapZoneVisual> = {
  left_light: {
    symbol: 'L',
    label: 'Left Jab',
    color: COLORS.primary,
    shortLabel: 'L',
  },
  right_light: {
    symbol: 'R',
    label: 'Right Jab',
    color: COLORS.secondary,
    shortLabel: 'R',
  },
  left_heavy: {
    symbol: 'LH',
    label: 'Hook',
    color: COLORS.primaryDark,
    shortLabel: 'H',
  },
  right_heavy: {
    symbol: 'RH',
    label: 'Uppercut',
    color: COLORS.secondaryDark,
    shortLabel: 'U',
  },
  block: {
    symbol: 'B',
    label: 'Block',
    color: COLORS.block,
    shortLabel: 'B',
  },
  dodge_left: {
    symbol: '←',
    label: 'Dodge Left',
    color: COLORS.dodge,
    shortLabel: 'DL',
  },
  dodge_right: {
    symbol: '→',
    label: 'Dodge Right',
    color: COLORS.dodge,
    shortLabel: 'DR',
  },
};

// Using shared difficulty configuration from constants
const getDifficultyConfig = (difficulty: ComboDifficulty) => {
  const config = DIFFICULTY_DISPLAY[difficulty as DifficultyLevel];
  return { color: config.color, label: config.label };
};

// ============================================================================
// COMPONENTS
// ============================================================================

interface TapIndicatorProps {
  zone: TapZone;
  timing?: number;
  showTiming?: boolean;
}

function TapIndicator({ zone, timing, showTiming }: TapIndicatorProps) {
  const visual = TAP_ZONE_VISUALS[zone];
  const isTight = timing && timing <= 180;

  return (
    <View style={styles.tapIndicatorContainer}>
      <View style={[styles.tapIndicator, { backgroundColor: visual.color }]}>
        <Text style={styles.tapSymbol}>{visual.symbol}</Text>
      </View>
      {showTiming && timing && (
        <Text style={[styles.timingText, isTight && styles.timingTextTight]}>
          {timing}ms
        </Text>
      )}
    </View>
  );
}

function Arrow() {
  return <Text style={styles.arrow}>→</Text>;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface ComboDisplayProps {
  specialId: string;
  comboSequence: ComboInput[];
  showTiming?: boolean;
  showDifficulty?: boolean;
  showTips?: boolean;
  compact?: boolean;
}

export function ComboDisplay({
  specialId,
  comboSequence,
  showTiming = false,
  showDifficulty = true,
  showTips = false,
  compact = false,
}: ComboDisplayProps) {
  const metadata = COMBO_METADATA[specialId];
  const difficulty = metadata?.difficulty;
  const tips = metadata?.tips;
  const notation = metadata?.notation;

  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      {/* Difficulty badge */}
      {showDifficulty && difficulty && (
        <View
          style={[
            styles.difficultyBadge,
            { backgroundColor: getDifficultyConfig(difficulty).color },
          ]}
        >
          <Text style={styles.difficultyText}>
            {getDifficultyConfig(difficulty).label}
          </Text>
        </View>
      )}

      {/* Notation text */}
      {notation && !compact && (
        <Text style={styles.notation}>{notation}</Text>
      )}

      {/* Visual combo sequence */}
      <View style={styles.comboSequence}>
        {comboSequence.map((input, index) => (
          <React.Fragment key={index}>
            <TapIndicator
              zone={input.zone}
              timing={input.windowMs}
              showTiming={showTiming && !compact}
            />
            {index < comboSequence.length - 1 && <Arrow />}
          </React.Fragment>
        ))}
      </View>

      {/* Tips */}
      {showTips && tips && (
        <Text style={styles.tips}>💡 {tips}</Text>
      )}
    </View>
  );
}

// ============================================================================
// COMPACT INLINE VERSION
// ============================================================================

interface ComboNotationInlineProps {
  comboSequence: ComboInput[];
}

export function ComboNotationInline({ comboSequence }: ComboNotationInlineProps) {
  return (
    <View style={styles.inlineContainer}>
      {comboSequence.map((input, index) => {
        const visual = TAP_ZONE_VISUALS[input.zone];
        return (
          <React.Fragment key={index}>
            <View
              style={[styles.inlineIndicator, { backgroundColor: visual.color }]}
            >
              <Text style={styles.inlineSymbol}>{visual.symbol}</Text>
            </View>
            {index < comboSequence.length - 1 && (
              <Text style={styles.inlineArrow}>›</Text>
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    padding: SPACING.md,
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 12,
    alignItems: 'center',
  },
  containerCompact: {
    padding: SPACING.sm,
  },
  difficultyBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: SPACING.sm,
  },
  difficultyText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: 1,
  },
  notation: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    fontFamily: 'monospace',
  },
  comboSequence: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: SPACING.xs,
  },
  tapIndicatorContainer: {
    alignItems: 'center',
  },
  tapIndicator: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  tapSymbol: {
    fontSize: FONT_SIZES.md,
    fontWeight: '900',
    color: COLORS.text,
  },
  timingText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  timingTextTight: {
    color: COLORS.warning,
    fontWeight: '600',
  },
  arrow: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textSecondary,
    marginHorizontal: 2,
  },
  tips: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  // Inline styles
  inlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  inlineIndicator: {
    width: 22,
    height: 22,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inlineSymbol: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '800',
    color: COLORS.text,
  },
  inlineArrow: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
});
