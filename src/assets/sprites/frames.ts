/**
 * Static frame requires. Metro and Jest only bundle a png when the
 * require() path is a string literal, so every frame is listed here.
 */

import type { ImageSourcePropType } from 'react-native';

import type { SpritePose } from '@/constants/spriteCast';

const FRAMES = {
  spike: {
    idle: require('./spike/01_idle.png') as ImageSourcePropType,
    jab: require('./spike/02_jab.png') as ImageSourcePropType,
    straight: require('./spike/03_straight.png') as ImageSourcePropType,
    follow_a: require('./spike/04_follow_a.png') as ImageSourcePropType,
    follow_b: require('./spike/05_follow_b.png') as ImageSourcePropType,
    lean: require('./spike/06_lean.png') as ImageSourcePropType,
    guard: require('./spike/07_guard.png') as ImageSourcePropType,
    face: require('./spike/08_face.png') as ImageSourcePropType,
    head_back: require('./spike/09_head_back.png') as ImageSourcePropType,
    low: require('./spike/10_low.png') as ImageSourcePropType,
  },
  big_t: {
    idle: require('./big_t/01_idle.png') as ImageSourcePropType,
    jab: require('./big_t/02_jab.png') as ImageSourcePropType,
    straight: require('./big_t/03_straight.png') as ImageSourcePropType,
    follow_a: require('./big_t/04_follow_a.png') as ImageSourcePropType,
    follow_b: require('./big_t/05_follow_b.png') as ImageSourcePropType,
    lean: require('./big_t/06_lean.png') as ImageSourcePropType,
    guard: require('./big_t/07_guard.png') as ImageSourcePropType,
    face: require('./big_t/08_face.png') as ImageSourcePropType,
    head_back: require('./big_t/09_head_back.png') as ImageSourcePropType,
    low: require('./big_t/10_low.png') as ImageSourcePropType,
  },
  eris: {
    idle: require('./eris/01_idle.png') as ImageSourcePropType,
    jab: require('./eris/02_jab.png') as ImageSourcePropType,
    straight: require('./eris/03_straight.png') as ImageSourcePropType,
    follow_a: require('./eris/04_follow_a.png') as ImageSourcePropType,
    follow_b: require('./eris/05_follow_b.png') as ImageSourcePropType,
    lean: require('./eris/06_lean.png') as ImageSourcePropType,
    guard: require('./eris/07_guard.png') as ImageSourcePropType,
    face: require('./eris/08_face.png') as ImageSourcePropType,
    head_back: require('./eris/09_head_back.png') as ImageSourcePropType,
    low: require('./eris/10_low.png') as ImageSourcePropType,
  },
  jaquontavius: {
    idle: require('./jaquontavius/01_idle.png') as ImageSourcePropType,
    jab: require('./jaquontavius/02_jab.png') as ImageSourcePropType,
    straight: require('./jaquontavius/03_straight.png') as ImageSourcePropType,
    follow_a: require('./jaquontavius/04_follow_a.png') as ImageSourcePropType,
    follow_b: require('./jaquontavius/05_follow_b.png') as ImageSourcePropType,
    lean: require('./jaquontavius/06_lean.png') as ImageSourcePropType,
    guard: require('./jaquontavius/07_guard.png') as ImageSourcePropType,
    face: require('./jaquontavius/08_face.png') as ImageSourcePropType,
    head_back: require('./jaquontavius/09_head_back.png') as ImageSourcePropType,
    low: require('./jaquontavius/10_low.png') as ImageSourcePropType,
  },
  jecka: {
    idle: require('./jecka/01_idle.png') as ImageSourcePropType,
    jab: require('./jecka/02_jab.png') as ImageSourcePropType,
    straight: require('./jecka/03_straight.png') as ImageSourcePropType,
    follow_a: require('./jecka/04_follow_a.png') as ImageSourcePropType,
    follow_b: require('./jecka/05_follow_b.png') as ImageSourcePropType,
    lean: require('./jecka/06_lean.png') as ImageSourcePropType,
    guard: require('./jecka/07_guard.png') as ImageSourcePropType,
    face: require('./jecka/08_face.png') as ImageSourcePropType,
    head_back: require('./jecka/09_head_back.png') as ImageSourcePropType,
    low: require('./jecka/10_low.png') as ImageSourcePropType,
  },
  juno: {
    idle: require('./juno/01_idle.png') as ImageSourcePropType,
    jab: require('./juno/02_jab.png') as ImageSourcePropType,
    straight: require('./juno/03_straight.png') as ImageSourcePropType,
    follow_a: require('./juno/04_follow_a.png') as ImageSourcePropType,
    follow_b: require('./juno/05_follow_b.png') as ImageSourcePropType,
    lean: require('./juno/06_lean.png') as ImageSourcePropType,
    guard: require('./juno/07_guard.png') as ImageSourcePropType,
    face: require('./juno/08_face.png') as ImageSourcePropType,
    head_back: require('./juno/09_head_back.png') as ImageSourcePropType,
    low: require('./juno/10_low.png') as ImageSourcePropType,
  },
  nana: {
    idle: require('./nana/01_idle.png') as ImageSourcePropType,
    jab: require('./nana/02_jab.png') as ImageSourcePropType,
    straight: require('./nana/03_straight.png') as ImageSourcePropType,
    follow_a: require('./nana/04_follow_a.png') as ImageSourcePropType,
    follow_b: require('./nana/05_follow_b.png') as ImageSourcePropType,
    lean: require('./nana/06_lean.png') as ImageSourcePropType,
    guard: require('./nana/07_guard.png') as ImageSourcePropType,
    face: require('./nana/08_face.png') as ImageSourcePropType,
    head_back: require('./nana/09_head_back.png') as ImageSourcePropType,
    low: require('./nana/10_low.png') as ImageSourcePropType,
  },
  lord_of_darkness: {
    idle: require('./lord_of_darkness/01_idle.png') as ImageSourcePropType,
    jab: require('./lord_of_darkness/02_jab.png') as ImageSourcePropType,
    straight: require('./lord_of_darkness/03_straight.png') as ImageSourcePropType,
    follow_a: require('./lord_of_darkness/04_follow_a.png') as ImageSourcePropType,
    follow_b: require('./lord_of_darkness/05_follow_b.png') as ImageSourcePropType,
    lean: require('./lord_of_darkness/06_lean.png') as ImageSourcePropType,
    guard: require('./lord_of_darkness/07_guard.png') as ImageSourcePropType,
    face: require('./lord_of_darkness/08_face.png') as ImageSourcePropType,
    head_back: require('./lord_of_darkness/09_head_back.png') as ImageSourcePropType,
    low: require('./lord_of_darkness/10_low.png') as ImageSourcePropType,
  },
} as const;

export function getFrame(spriteId: string, pose: string): ImageSourcePropType {
  const sheet = FRAMES[spriteId as keyof typeof FRAMES];
  return sheet[pose as SpritePose];
}
