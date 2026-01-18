/**
 * Tap Zones Component
 * Touch input areas for combat controls
 */

import React, { useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Pressable,
} from 'react-native';
import { COLORS, SPACING, FONT_SIZES } from '@/constants';
import type { TapZone } from '@/types';

interface TapZonesProps {
  onTap: (zone: TapZone) => void;
  disabled?: boolean;
}

interface ZoneButtonProps {
  zone: TapZone;
  label: string;
  sublabel?: string;
  onPress: (zone: TapZone) => void;
  color: string;
  style?: object;
  disabled?: boolean;
}

function ZoneButton({
  zone,
  label,
  sublabel,
  onPress,
  color,
  style,
  disabled,
}: ZoneButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.9,
      useNativeDriver: true,
      speed: 50,
    }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
    }).start();
    onPress(zone);
  }, [scaleAnim, onPress, zone]);

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[styles.buttonContainer, style]}
    >
      <Animated.View
        style={[
          styles.button,
          {
            backgroundColor: color,
            transform: [{ scale: scaleAnim }],
            opacity: disabled ? 0.5 : 1,
          },
        ]}
      >
        <Text style={styles.buttonLabel}>{label}</Text>
        {sublabel && <Text style={styles.buttonSublabel}>{sublabel}</Text>}
      </Animated.View>
    </Pressable>
  );
}

export function TapZones({ onTap, disabled }: TapZonesProps) {
  return (
    <View style={styles.container}>
      {/* Left side controls */}
      <View style={styles.side}>
        {/* Dodge Left */}
        <ZoneButton
          zone="dodge_left"
          label="←"
          sublabel="DODGE"
          onPress={onTap}
          color={COLORS.dodge}
          style={styles.dodgeButton}
          disabled={disabled}
        />

        {/* Attack buttons */}
        <View style={styles.attackColumn}>
          <ZoneButton
            zone="left_light"
            label="JAB"
            onPress={onTap}
            color={COLORS.primary}
            style={styles.lightButton}
            disabled={disabled}
          />
          <ZoneButton
            zone="left_heavy"
            label="HOOK"
            onPress={onTap}
            color={COLORS.primaryDark}
            style={styles.heavyButton}
            disabled={disabled}
          />
        </View>
      </View>

      {/* Center - Block */}
      <View style={styles.center}>
        <ZoneButton
          zone="block"
          label="🛡️"
          sublabel="BLOCK"
          onPress={onTap}
          color={COLORS.block}
          style={styles.blockButton}
          disabled={disabled}
        />
      </View>

      {/* Right side controls */}
      <View style={styles.side}>
        {/* Attack buttons */}
        <View style={styles.attackColumn}>
          <ZoneButton
            zone="right_light"
            label="JAB"
            onPress={onTap}
            color={COLORS.secondary}
            style={styles.lightButton}
            disabled={disabled}
          />
          <ZoneButton
            zone="right_heavy"
            label="UPPER"
            onPress={onTap}
            color={COLORS.secondaryDark}
            style={styles.heavyButton}
            disabled={disabled}
          />
        </View>

        {/* Dodge Right */}
        <ZoneButton
          zone="dodge_right"
          label="→"
          sublabel="DODGE"
          onPress={onTap}
          color={COLORS.dodge}
          style={styles.dodgeButton}
          disabled={disabled}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    height: 160,
  },
  side: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  attackColumn: {
    gap: SPACING.sm,
  },
  buttonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  buttonLabel: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '800',
    color: COLORS.text,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  buttonSublabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.text,
    opacity: 0.8,
    marginTop: 2,
  },
  lightButton: {
    width: 70,
    height: 55,
  },
  heavyButton: {
    width: 70,
    height: 55,
  },
  dodgeButton: {
    width: 50,
    height: 110,
  },
  blockButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
});
