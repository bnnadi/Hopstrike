/**
 * Fighter Display Component
 * Renders an exported pixel-art sprite for the current pose.
 */

import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONT_SIZES } from '@/constants';
import { getSpriteCast, poseFor } from '@/constants/spriteCast';
import { getFrame } from '@/assets/sprites/frames';
import type { PlayerState, FighterState } from '@/types';

interface FighterProps {
  player: PlayerState;
  onHitLanded?: () => void;
}

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

function nudgeFor(state: FighterState): number {
  if (state === 'hit_stun' || state === 'block_stun') {
    return 4;
  }
  if (state === 'dodging') {
    return 8;
  }
  return 0;
}

export function Fighter({ player }: FighterProps) {
  const isLeft = player.side === 'left';
  const cast = getSpriteCast(player.fighter.id);
  const pose = poseFor(player.state, player.currentMove);
  const stateColor = STATE_COLORS[player.state];
  const nudge = nudgeFor(player.state);
  const translateX = nudge === 0 ? 0 : isLeft ? -nudge : nudge;

  return (
    <View style={[styles.container, { transform: [{ translateX }] }]}>
      {stateColor !== 'transparent' && (
        <View style={[styles.stateIndicator, { backgroundColor: stateColor }]} />
      )}

      <Image
        source={getFrame(cast.spriteId, pose)}
        style={[styles.sprite, !isLeft && styles.spriteFacingLeft]}
        resizeMode="contain"
      />

      <Text
        style={[styles.fighterName, { color: cast.labelColor }]}
        numberOfLines={1}
      >
        {cast.name}
      </Text>
    </View>
  );
}

const NAME_LINE_HEIGHT = 16;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: 128,
    height: 128 + SPACING.sm + NAME_LINE_HEIGHT,
  },
  stateIndicator: {
    position: 'absolute',
    top: -5,
    width: 10,
    height: 10,
    borderRadius: 5,
    zIndex: 10,
  },
  sprite: {
    width: 128,
    height: 128,
  },
  spriteFacingLeft: {
    transform: [{ scaleX: -1 }],
  },
  fighterName: {
    width: 128,
    marginTop: SPACING.sm,
    fontSize: FONT_SIZES.sm,
    lineHeight: NAME_LINE_HEIGHT,
    fontWeight: '700',
    textAlign: 'center',
  },
});
