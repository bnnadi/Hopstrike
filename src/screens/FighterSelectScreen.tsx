/**
 * Fighter Select Screen
 * Choose your kangaroo boxer and AI difficulty
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, FONT_SIZES, getAllFighters, COMBO_METADATA, DIFFICULTY_LIST, DIFFICULTY_DISPLAY } from '@/constants';
import { getSpriteCast } from '@/constants/spriteCast';
import { getFrame } from '@/assets/sprites/frames';
import { ComboNotationInline } from '@/components';
import type { Fighter, FighterId, AIDifficulty } from '@/types';
import { getDifficultyDescription } from '@/services/aiEngine';
import type { FighterSelectScreenProps } from '@/navigation';

function FighterCard({
  fighter,
  selected,
  onPress,
}: {
  fighter: Fighter;
  selected: boolean;
  onPress: () => void;
}) {
  const cast = getSpriteCast(fighter.id);

  return (
    <TouchableOpacity
      style={[
        styles.fighterCard,
        selected && styles.fighterCardSelected,
        { borderColor: selected ? cast.labelColor : COLORS.surface },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.fighterAvatar}>
        <Image
          source={getFrame(cast.spriteId, 'idle')}
          style={styles.fighterSprite}
          resizeMode="contain"
        />
      </View>
      <Text
        style={[styles.fighterName, { color: cast.labelColor }]}
        numberOfLines={1}
      >
        {cast.name}
      </Text>
      <Text style={styles.fighterNickname}>{fighter.nickname}</Text>

      {/* Stats preview */}
      <View style={styles.statsContainer}>
        <StatBar label="PWR" value={fighter.stats.power} color={COLORS.error} />
        <StatBar label="SPD" value={fighter.stats.speed} color={COLORS.success} />
        <StatBar label="DEF" value={fighter.stats.defense} color={COLORS.block} />
      </View>

      {selected && (
        <View
          style={[styles.selectedBadge, { backgroundColor: cast.labelColor }]}
        >
          <Text style={styles.selectedBadgeText}>✓</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

function StatBar({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  const percentage = Math.min(100, (value / 1.5) * 100);

  return (
    <View style={styles.statRow}>
      <Text style={styles.statLabel}>{label}</Text>
      <View style={styles.statBarBg}>
        <View
          style={[styles.statBarFill, { width: `${percentage}%`, backgroundColor: color }]}
        />
      </View>
    </View>
  );
}

function ComboDifficultyBadge({ difficulty }: { difficulty: string }) {
  const config = DIFFICULTY_DISPLAY[difficulty as keyof typeof DIFFICULTY_DISPLAY];
  const color = config?.color || DIFFICULTY_DISPLAY.medium.color;

  return (
    <View style={[styles.comboDifficultyBadge, { backgroundColor: color }]}>
      <Text style={styles.comboDifficultyText}>{difficulty.toUpperCase()}</Text>
    </View>
  );
}

// Using shared DIFFICULTY_LIST from constants

export function FighterSelectScreen({ navigation }: FighterSelectScreenProps) {
  const insets = useSafeAreaInsets();
  const [selectedFighter, setSelectedFighter] = useState<FighterId | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<AIDifficulty>('medium');
  const fighters = getAllFighters();

  const handleConfirm = () => {
    if (selectedFighter) {
      // Randomly select opponent
      const opponents = fighters.filter((f) => f.id !== selectedFighter);
      const randomOpponent =
        opponents[Math.floor(Math.random() * opponents.length)];

      navigation.navigate('Fight', {
        player1FighterId: selectedFighter,
        player2FighterId: randomOpponent.id,
        vsAI: true,
        aiDifficulty: selectedDifficulty,
      });
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const selectedFighterData = selectedFighter
    ? fighters.find((f) => f.id === selectedFighter)
    : null;
  const selectedCast = selectedFighterData
    ? getSpriteCast(selectedFighterData.id)
    : null;

  const comboMetadata = selectedFighterData
    ? COMBO_METADATA[selectedFighterData.special.id]
    : null;

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>← BACK</Text>
        </TouchableOpacity>
        <Text style={styles.title}>CHOOSE YOUR FIGHTER</Text>
        <View style={styles.backButton} />
      </View>

      {/* Fighter Grid */}
      <FlatList
        data={fighters}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.gridContainer}
        columnWrapperStyle={styles.gridRow}
        renderItem={({ item }) => (
          <FighterCard
            fighter={item}
            selected={selectedFighter === item.id}
            onPress={() => setSelectedFighter(item.id)}
          />
        )}
      />

      {/* Selected Fighter Info */}
      {selectedFighterData && selectedCast && (
        <View
          style={[
            styles.selectedInfo,
            { borderColor: selectedCast.labelColor },
          ]}
        >
          <View style={styles.selectedInfoContent}>
            <Text
              style={[
                styles.selectedName,
                { color: selectedCast.labelColor },
              ]}
            >
              {selectedCast.name}
            </Text>
            <Text style={styles.selectedDesc} numberOfLines={2}>
              {selectedFighterData.description}
            </Text>

            {/* Special Move Info */}
            <View style={styles.specialSection}>
              <View style={styles.specialHeader}>
                <Text style={styles.specialLabel}>SPECIAL:</Text>
                <Text style={styles.specialName}>
                  {selectedFighterData.special.name}
                </Text>
                {comboMetadata && (
                  <ComboDifficultyBadge difficulty={comboMetadata.difficulty} />
                )}
              </View>

              {/* Combo Notation */}
              <View style={styles.comboContainer}>
                <ComboNotationInline
                  comboSequence={selectedFighterData.special.comboSequence}
                />
              </View>

              {/* Combo Tips */}
              {comboMetadata?.tips && (
                <Text style={styles.comboTips}>💡 {comboMetadata.tips}</Text>
              )}
            </View>

            {/* AI Difficulty Selection */}
            <View style={styles.difficultySection}>
              <Text style={styles.difficultyLabel}>AI DIFFICULTY:</Text>
              <View style={styles.difficultyButtons}>
                {DIFFICULTY_LIST.map((diff) => (
                  <TouchableOpacity
                    key={diff.id}
                    style={[
                      styles.difficultyButton,
                      selectedDifficulty === diff.id && {
                        backgroundColor: diff.color,
                        borderColor: diff.color,
                      },
                    ]}
                    onPress={() => setSelectedDifficulty(diff.id as AIDifficulty)}
                  >
                    <Text
                      style={[
                        styles.difficultyButtonText,
                        selectedDifficulty === diff.id && styles.difficultyButtonTextActive,
                      ]}
                    >
                      {diff.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.difficultyDesc}>
                {getDifficultyDescription(selectedDifficulty)}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.confirmButton,
              { backgroundColor: selectedCast.labelColor },
            ]}
            onPress={handleConfirm}
          >
            <Text style={styles.confirmButtonText}>FIGHT!</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  backButton: {
    width: 80,
  },
  backButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: 2,
  },
  gridContainer: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  gridRow: {
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  fighterCard: {
    width: '48%',
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 16,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 3,
    position: 'relative',
  },
  fighterCardSelected: {
    backgroundColor: COLORS.surface,
  },
  fighterAvatar: {
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  fighterSprite: {
    width: 64,
    height: 64,
  },
  fighterName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '800',
    marginBottom: 2,
  },
  fighterNickname: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  statsContainer: {
    width: '100%',
    gap: 4,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  statLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.textSecondary,
    width: 30,
  },
  statBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: COLORS.surface,
    borderRadius: 3,
    overflow: 'hidden',
  },
  statBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  selectedBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  selectedBadgeText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '900',
    color: COLORS.text,
  },
  selectedInfo: {
    backgroundColor: COLORS.backgroundLight,
    margin: SPACING.md,
    padding: SPACING.md,
    borderRadius: 16,
    borderWidth: 2,
  },
  selectedInfoContent: {
    marginBottom: SPACING.md,
  },
  selectedName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '800',
    marginBottom: SPACING.xs,
  },
  selectedDesc: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    lineHeight: 18,
  },
  specialSection: {
    backgroundColor: COLORS.surface,
    padding: SPACING.sm,
    borderRadius: 8,
    marginBottom: SPACING.sm,
  },
  specialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
    flexWrap: 'wrap',
  },
  specialLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.special,
  },
  specialName: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
  },
  comboDifficultyBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  comboDifficultyText: {
    fontSize: FONT_SIZES.xs - 1,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: 0.5,
  },
  comboContainer: {
    marginBottom: SPACING.sm,
  },
  comboTips: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    lineHeight: 16,
  },
  difficultySection: {
    backgroundColor: COLORS.surface,
    padding: SPACING.sm,
    borderRadius: 8,
  },
  difficultyLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  difficultyButtons: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  difficultyButton: {
    flex: 1,
    paddingVertical: SPACING.xs,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.surfaceLight,
    alignItems: 'center',
  },
  difficultyButtonText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  difficultyButtonTextActive: {
    color: COLORS.text,
  },
  difficultyDesc: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  confirmButton: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: 2,
  },
});
