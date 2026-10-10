import { getFighterIds } from '@/constants/fighters';
import { frameFile, getSpriteCast, poseFor } from '@/constants/spriteCast';
import { getFrame } from '@/assets/sprites/frames';
import type { FighterId } from '@/types';

type Palette = {
  body: string;
  light: string;
  glove_hi: string;
};

type SpriteManifest = {
  poses: string[];
  fighters: Record<
    string,
    {
      name: string;
      frames: string[];
      palette: Palette;
    }
  >;
};

type FrameModule = { testUri: string };

const manifest = require('../src/assets/sprites/manifest.json') as SpriteManifest;

const CAST: Record<FighterId, { spriteId: string; name: string }> = {
  rocky_roo: { spriteId: 'spike', name: 'Spike' },
  bella_bounce: { spriteId: 'big_t', name: 'Big T' },
  thunder_jack: { spriteId: 'eris', name: 'Eris' },
  swift_sally: { spriteId: 'jaquontavius', name: 'Jaquontavius' },
  iron_joey: { spriteId: 'jecka', name: 'Jecka' },
  wild_wally: { spriteId: 'juno', name: 'Juno' },
  duchess_dot: { spriteId: 'nana', name: 'Nana' },
  brawler_bruce: {
    spriteId: 'lord_of_darkness',
    name: 'The Lord Of Darkness',
  },
};

const POSES = [
  'idle',
  'jab',
  'straight',
  'follow_a',
  'follow_b',
  'lean',
  'guard',
  'face',
  'head_back',
  'low',
] as const;

type Pose = (typeof POSES)[number];

const FRAME_FILES: Record<Pose, string> = {
  idle: '01_idle.png',
  jab: '02_jab.png',
  straight: '03_straight.png',
  follow_a: '04_follow_a.png',
  follow_b: '05_follow_b.png',
  lean: '06_lean.png',
  guard: '07_guard.png',
  face: '08_face.png',
  head_back: '09_head_back.png',
  low: '10_low.png',
};

const STATIC_FRAMES: Record<string, Record<Pose, FrameModule>> = {
  spike: {
    idle: require('../src/assets/sprites/spike/01_idle.png'),
    jab: require('../src/assets/sprites/spike/02_jab.png'),
    straight: require('../src/assets/sprites/spike/03_straight.png'),
    follow_a: require('../src/assets/sprites/spike/04_follow_a.png'),
    follow_b: require('../src/assets/sprites/spike/05_follow_b.png'),
    lean: require('../src/assets/sprites/spike/06_lean.png'),
    guard: require('../src/assets/sprites/spike/07_guard.png'),
    face: require('../src/assets/sprites/spike/08_face.png'),
    head_back: require('../src/assets/sprites/spike/09_head_back.png'),
    low: require('../src/assets/sprites/spike/10_low.png'),
  },
  big_t: {
    idle: require('../src/assets/sprites/big_t/01_idle.png'),
    jab: require('../src/assets/sprites/big_t/02_jab.png'),
    straight: require('../src/assets/sprites/big_t/03_straight.png'),
    follow_a: require('../src/assets/sprites/big_t/04_follow_a.png'),
    follow_b: require('../src/assets/sprites/big_t/05_follow_b.png'),
    lean: require('../src/assets/sprites/big_t/06_lean.png'),
    guard: require('../src/assets/sprites/big_t/07_guard.png'),
    face: require('../src/assets/sprites/big_t/08_face.png'),
    head_back: require('../src/assets/sprites/big_t/09_head_back.png'),
    low: require('../src/assets/sprites/big_t/10_low.png'),
  },
  eris: {
    idle: require('../src/assets/sprites/eris/01_idle.png'),
    jab: require('../src/assets/sprites/eris/02_jab.png'),
    straight: require('../src/assets/sprites/eris/03_straight.png'),
    follow_a: require('../src/assets/sprites/eris/04_follow_a.png'),
    follow_b: require('../src/assets/sprites/eris/05_follow_b.png'),
    lean: require('../src/assets/sprites/eris/06_lean.png'),
    guard: require('../src/assets/sprites/eris/07_guard.png'),
    face: require('../src/assets/sprites/eris/08_face.png'),
    head_back: require('../src/assets/sprites/eris/09_head_back.png'),
    low: require('../src/assets/sprites/eris/10_low.png'),
  },
  jaquontavius: {
    idle: require('../src/assets/sprites/jaquontavius/01_idle.png'),
    jab: require('../src/assets/sprites/jaquontavius/02_jab.png'),
    straight: require('../src/assets/sprites/jaquontavius/03_straight.png'),
    follow_a: require('../src/assets/sprites/jaquontavius/04_follow_a.png'),
    follow_b: require('../src/assets/sprites/jaquontavius/05_follow_b.png'),
    lean: require('../src/assets/sprites/jaquontavius/06_lean.png'),
    guard: require('../src/assets/sprites/jaquontavius/07_guard.png'),
    face: require('../src/assets/sprites/jaquontavius/08_face.png'),
    head_back: require('../src/assets/sprites/jaquontavius/09_head_back.png'),
    low: require('../src/assets/sprites/jaquontavius/10_low.png'),
  },
  jecka: {
    idle: require('../src/assets/sprites/jecka/01_idle.png'),
    jab: require('../src/assets/sprites/jecka/02_jab.png'),
    straight: require('../src/assets/sprites/jecka/03_straight.png'),
    follow_a: require('../src/assets/sprites/jecka/04_follow_a.png'),
    follow_b: require('../src/assets/sprites/jecka/05_follow_b.png'),
    lean: require('../src/assets/sprites/jecka/06_lean.png'),
    guard: require('../src/assets/sprites/jecka/07_guard.png'),
    face: require('../src/assets/sprites/jecka/08_face.png'),
    head_back: require('../src/assets/sprites/jecka/09_head_back.png'),
    low: require('../src/assets/sprites/jecka/10_low.png'),
  },
  juno: {
    idle: require('../src/assets/sprites/juno/01_idle.png'),
    jab: require('../src/assets/sprites/juno/02_jab.png'),
    straight: require('../src/assets/sprites/juno/03_straight.png'),
    follow_a: require('../src/assets/sprites/juno/04_follow_a.png'),
    follow_b: require('../src/assets/sprites/juno/05_follow_b.png'),
    lean: require('../src/assets/sprites/juno/06_lean.png'),
    guard: require('../src/assets/sprites/juno/07_guard.png'),
    face: require('../src/assets/sprites/juno/08_face.png'),
    head_back: require('../src/assets/sprites/juno/09_head_back.png'),
    low: require('../src/assets/sprites/juno/10_low.png'),
  },
  nana: {
    idle: require('../src/assets/sprites/nana/01_idle.png'),
    jab: require('../src/assets/sprites/nana/02_jab.png'),
    straight: require('../src/assets/sprites/nana/03_straight.png'),
    follow_a: require('../src/assets/sprites/nana/04_follow_a.png'),
    follow_b: require('../src/assets/sprites/nana/05_follow_b.png'),
    lean: require('../src/assets/sprites/nana/06_lean.png'),
    guard: require('../src/assets/sprites/nana/07_guard.png'),
    face: require('../src/assets/sprites/nana/08_face.png'),
    head_back: require('../src/assets/sprites/nana/09_head_back.png'),
    low: require('../src/assets/sprites/nana/10_low.png'),
  },
  lord_of_darkness: {
    idle: require('../src/assets/sprites/lord_of_darkness/01_idle.png'),
    jab: require('../src/assets/sprites/lord_of_darkness/02_jab.png'),
    straight: require('../src/assets/sprites/lord_of_darkness/03_straight.png'),
    follow_a: require('../src/assets/sprites/lord_of_darkness/04_follow_a.png'),
    follow_b: require('../src/assets/sprites/lord_of_darkness/05_follow_b.png'),
    lean: require('../src/assets/sprites/lord_of_darkness/06_lean.png'),
    guard: require('../src/assets/sprites/lord_of_darkness/07_guard.png'),
    face: require('../src/assets/sprites/lord_of_darkness/08_face.png'),
    head_back: require('../src/assets/sprites/lord_of_darkness/09_head_back.png'),
    low: require('../src/assets/sprites/lord_of_darkness/10_low.png'),
  },
};

function linearize(channel: number): number {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function relativeLuminance(hex: string): number {
  const normalized = hex.replace('#', '');
  const r = linearize(parseInt(normalized.slice(0, 2), 16));
  const g = linearize(parseInt(normalized.slice(2, 4), 16));
  const b = linearize(parseInt(normalized.slice(4, 6), 16));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function expectedLabelColor(palette: Palette): string {
  return relativeLuminance(palette.light) > 0.35
    ? palette.light
    : palette.glove_hi;
}

describe('getSpriteCast', () => {
  test('maps every fighter id onto each manifest sprite exactly once', () => {
    const fighterIds = getFighterIds();
    expect(fighterIds).toEqual(Object.keys(CAST));

    const spriteIds = fighterIds.map(id => getSpriteCast(id).spriteId);
    const manifestKeys = Object.keys(manifest.fighters);

    expect(spriteIds).toHaveLength(manifestKeys.length);
    expect(new Set(spriteIds).size).toBe(manifestKeys.length);
    expect(new Set(spriteIds)).toEqual(new Set(manifestKeys));

    for (const id of fighterIds) {
      const cast = getSpriteCast(id);
      expect(cast.spriteId).toBe(CAST[id].spriteId);
      expect(cast.name).toBe(manifest.fighters[cast.spriteId].name);
      expect(cast.name).toBe(CAST[id].name);
    }
  });

  test('picks labelColor from light or glove_hi by relative luminance', () => {
    const spikePalette = manifest.fighters.spike.palette;
    expect(expectedLabelColor(spikePalette).toUpperCase()).toBe('#FF8C6E');
    expect(expectedLabelColor(spikePalette).toUpperCase()).toBe(
      spikePalette.glove_hi.toUpperCase(),
    );

    for (const id of getFighterIds()) {
      const cast = getSpriteCast(id);
      const palette = manifest.fighters[cast.spriteId].palette;
      expect(cast.labelColor.toUpperCase()).toBe(
        expectedLabelColor(palette).toUpperCase(),
      );
      expect(cast.labelColor.toUpperCase()).not.toBe(
        palette.body.toUpperCase(),
      );
    }

    expect(getSpriteCast('rocky_roo').labelColor.toUpperCase()).toBe('#FF8C6E');
  });
});

describe('poseFor', () => {
  test('idle stays idle', () => {
    expect(poseFor('idle', null)).toBe('idle');
  });

  test.each(['moving_forward', 'moving_backward'] as const)(
    '%s leans',
    state => {
      expect(poseFor(state, null)).toBe('lean');
    },
  );

  test('attacking jab uses jab', () => {
    expect(poseFor('attacking', { type: 'jab' })).toBe('jab');
  });

  test('attacking hook uses follow_a', () => {
    expect(poseFor('attacking', { type: 'hook' })).toBe('follow_a');
  });

  test('attacking uppercut uses straight', () => {
    expect(poseFor('attacking', { type: 'uppercut' })).toBe('straight');
  });

  test.each([
    ['null move', null],
    ['move without a type', {}],
    ['block move', { type: 'block' }],
  ] as const)('attacking with %s uses jab', (_label, currentMove) => {
    expect(poseFor('attacking', currentMove)).toBe('jab');
  });

  test.each(['blocking', 'block_stun'] as const)('%s guards', state => {
    expect(poseFor(state, null)).toBe('guard');
  });

  test.each(['dodging', 'knocked_down'] as const)('%s goes low', state => {
    expect(poseFor(state, null)).toBe('low');
  });

  test('hit_stun snaps the head back', () => {
    expect(poseFor('hit_stun', null)).toBe('head_back');
  });

  test('special uses follow_b even when the current move is a jab', () => {
    expect(poseFor('special', { type: 'jab' })).toBe('follow_b');
  });

  test('vulnerable shows the face', () => {
    expect(poseFor('vulnerable', null)).toBe('face');
  });
});

describe('frameFile', () => {
  test.each(Object.entries(FRAME_FILES))('%s maps to %s', (pose, filename) => {
    expect(frameFile(pose as Pose)).toBe(filename);
  });

  test('matches every fighter frame list in the manifest', () => {
    const filenames = POSES.map(pose => frameFile(pose));
    expect(manifest.poses).toEqual([...POSES]);
    expect(filenames).toEqual(Object.values(FRAME_FILES));

    for (const fighter of Object.values(manifest.fighters)) {
      expect(fighter.frames).toEqual(filenames);
    }
  });
});

describe('getFrame', () => {
  const cases = Object.keys(STATIC_FRAMES).flatMap(spriteId =>
    POSES.map(pose => [spriteId, pose] as const),
  );

  test.each(cases)(
    '%s %s is the static png require',
    (spriteId, pose) => {
      expect(getFrame(spriteId, pose)).toBe(STATIC_FRAMES[spriteId][pose]);
    },
  );
});
