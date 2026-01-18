/**
 * Fight Screen
 * Main gameplay screen for boxing matches with screen shake effects
 */

import React, { useCallback, useRef, useState, useEffect } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, getFighter } from '@/constants';
import type { TapZone } from '@/types';
import { useMatch, useScreenShake, getShakeIntensity } from '@/hooks';
import {
  HealthBar,
  MeterBar,
  TapZones,
  Fighter,
  RoundDisplay,
  GameOverlay,
  HitIndicator,
} from '@/components';
import type { FightScreenProps } from '@/navigation';

interface DamageEvent {
  id: number;
  damage: number;
  side: 'left' | 'right';
  type: 'hit' | 'blocked' | 'special';
}

export function FightScreen({ navigation, route }: FightScreenProps) {
  const insets = useSafeAreaInsets();
  const { player1FighterId, player2FighterId, vsAI, aiDifficulty } = route.params;

  const fighter1 = getFighter(player1FighterId);
  const fighter2 = getFighter(player2FighterId);

  // Screen shake hook
  const { shakeStyle, triggerShake } = useScreenShake();

  const {
    matchState,
    startFight,
    handleTap,
    nextRound,
    resetMatch,
  } = useMatch({
    fighter1,
    fighter2,
    vsAI,
    aiDifficulty,
  });

  // Track health changes for damage indicators
  const prevHealthRef = useRef({ p1: matchState.player1.health, p2: matchState.player2.health });
  const [damageEvents, setDamageEvents] = useState<DamageEvent[]>([]);
  const eventIdRef = useRef(0);

  // Detect health changes and create damage events
  useEffect(() => {
    const prevP1 = prevHealthRef.current.p1;
    const prevP2 = prevHealthRef.current.p2;
    const currP1 = matchState.player1.health;
    const currP2 = matchState.player2.health;

    const newEvents: DamageEvent[] = [];

    // Player 1 took damage
    if (currP1 < prevP1) {
      const damage = prevP1 - currP1;
      const type = matchState.player2.state === 'special' ? 'special' : 'hit';
      newEvents.push({
        id: ++eventIdRef.current,
        damage,
        side: 'left',
        type,
      });

      // Trigger screen shake based on damage
      const intensity = getShakeIntensity(damage);
      triggerShake(type === 'special' ? 'explosive' : intensity);
    }

    // Player 2 took damage
    if (currP2 < prevP2) {
      const damage = prevP2 - currP2;
      const type = matchState.player1.state === 'special' ? 'special' : 'hit';
      newEvents.push({
        id: ++eventIdRef.current,
        damage,
        side: 'right',
        type,
      });

      // Trigger screen shake based on damage
      const intensity = getShakeIntensity(damage);
      triggerShake(type === 'special' ? 'explosive' : intensity);
    }

    if (newEvents.length > 0) {
      setDamageEvents((prev) => [...prev, ...newEvents]);
    }

    prevHealthRef.current = { p1: currP1, p2: currP2 };
  }, [matchState.player1.health, matchState.player2.health, matchState.player1.state, matchState.player2.state, triggerShake]);

  // Remove completed damage events
  const handleDamageComplete = useCallback((id: number) => {
    setDamageEvents((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const handleNextRound = useCallback(() => {
    setDamageEvents([]);
    prevHealthRef.current = { p1: fighter1.stats.maxHealth, p2: fighter2.stats.maxHealth };
    nextRound();
  }, [nextRound, fighter1.stats.maxHealth, fighter2.stats.maxHealth]);

  const handleRematch = useCallback(() => {
    setDamageEvents([]);
    prevHealthRef.current = { p1: fighter1.stats.maxHealth, p2: fighter2.stats.maxHealth };
    resetMatch();
  }, [resetMatch, fighter1.stats.maxHealth, fighter2.stats.maxHealth]);

  const handleQuit = useCallback(() => {
    // Navigate back to the main menu (reset the stack)
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainMenu' }],
    });
  }, [navigation]);

  const isFighting = matchState.roundState === 'fighting';

  return (
    <View style={[styles.outerContainer, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" hidden />

      {/* Animated container for screen shake */}
      <Animated.View style={[styles.container, shakeStyle]}>
        {/* HUD - Top */}
        <View style={styles.hud}>
          {/* Health bars */}
          <View style={styles.healthRow}>
            <HealthBar
              currentHealth={matchState.player1.health}
              maxHealth={matchState.player1.fighter.stats.maxHealth}
              fighterName={matchState.player1.fighter.name}
              side="left"
              primaryColor={matchState.player1.fighter.primaryColor}
            />
            <HealthBar
              currentHealth={matchState.player2.health}
              maxHealth={matchState.player2.fighter.stats.maxHealth}
              fighterName={matchState.player2.fighter.name}
              side="right"
              primaryColor={matchState.player2.fighter.primaryColor}
            />
          </View>

          {/* Round display */}
          <RoundDisplay
            roundNumber={matchState.roundNumber}
            maxRounds={matchState.maxRounds}
            timeRemaining={matchState.timeRemaining}
            player1Wins={matchState.player1.roundsWon}
            player2Wins={matchState.player2.roundsWon}
            roundState={matchState.roundState}
          />

          {/* Meter bars */}
          <View style={styles.meterRow}>
            <MeterBar
              currentMeter={matchState.player1.meter}
              maxMeter={100}
              specialCost={matchState.player1.fighter.special.meterCost}
              specialName={matchState.player1.fighter.special.name}
              side="left"
              accentColor={matchState.player1.fighter.secondaryColor}
            />
            <MeterBar
              currentMeter={matchState.player2.meter}
              maxMeter={100}
              specialCost={matchState.player2.fighter.special.meterCost}
              specialName={matchState.player2.fighter.special.name}
              side="right"
              accentColor={matchState.player2.fighter.secondaryColor}
            />
          </View>
        </View>

        {/* Arena */}
        <View style={styles.arena}>
          <View style={styles.arenaBackground}>
            {/* Arena floor line */}
            <View style={styles.arenaFloor} />

            {/* Fighters */}
            <View
              style={[
                styles.fighterContainer,
                { left: `${matchState.player1.position - 10}%` },
              ]}
            >
              <Fighter player={matchState.player1} />
            </View>

            <View
              style={[
                styles.fighterContainer,
                { left: `${matchState.player2.position - 10}%` },
              ]}
            >
              <Fighter player={matchState.player2} />
            </View>

            {/* Damage indicators */}
            {damageEvents.map((event) => (
              <HitIndicator
                key={event.id}
                damage={event.damage}
                side={event.side}
                type={event.type}
                visible={true}
                onComplete={() => handleDamageComplete(event.id)}
              />
            ))}
          </View>
        </View>

        {/* Controls - Bottom */}
        <View style={[styles.controls, { paddingBottom: insets.bottom }]}>
          <TapZones onTap={handleTap} disabled={!isFighting} />
        </View>
      </Animated.View>

      {/* Overlays (outside shake container) */}
      <GameOverlay
        roundState={matchState.roundState}
        roundNumber={matchState.roundNumber}
        winner={matchState.winner}
        fighter1={fighter1}
        fighter2={fighter2}
        player1Wins={matchState.player1.roundsWon}
        player2Wins={matchState.player2.roundsWon}
        onStart={startFight}
        onNextRound={handleNextRound}
        onRematch={handleRematch}
        onQuit={handleQuit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
  },
  hud: {
    paddingHorizontal: SPACING.sm,
  },
  healthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  meterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  arena: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: SPACING.md,
  },
  arenaBackground: {
    flex: 1,
    position: 'relative',
    marginBottom: SPACING.md,
  },
  arenaFloor: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 2,
  },
  fighterContainer: {
    position: 'absolute',
    bottom: 20,
  },
  controls: {
    backgroundColor: COLORS.backgroundLight,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 2,
    borderColor: COLORS.surface,
  },
});
