import { describe, expect, it } from 'vitest';
import { CAST_PORTRAITS, UNIT_FACES, UNIT_LAMPS } from '../content/portraits';
import { drawPortrait, PORTRAIT_HEIGHT, PORTRAIT_WIDTH, type PixelImage } from './drawPortrait';
import { HAIR, INK, PROPS, SKIN } from './portraitParts';
import {
  ACCESSORIES, AGES, BROW_STYLES, EAR_STYLES, EYE_COLORS, EYE_STYLES, FACIAL_HAIR, generatePortrait,
  HAIR_COLORS, HAIR_STYLES, HEAD_SHAPES, LAMP_SIZES, MARKS, MOUTH_STYLES, NOSE_STYLES, OUTFIT_COLORS, OUTFITS,
  SKIN_TONES, type LampSize, type Portrait,
} from './portrait';

const seeds = (n: number) => Array.from({ length: n }, (_, i) => i + 1);
const key = (img: PixelImage) => img.pixels.join(',');
/** Coordinates of pixels that differ between two images. */
const changed = (a: PixelImage, b: PixelImage) =>
  a.pixels.flatMap((px, i) => (px === b.pixels[i] ? [] : [{ x: i % a.width, y: Math.floor(i / a.width) }]));
const rowSpan = (points: { y: number }[]) => Math.max(...points.map((p) => p.y)) - Math.min(...points.map((p) => p.y)) + 1;

const randomPeople = seeds(300).map(generatePortrait);
const everyone: Portrait[] = [...randomPeople, ...Object.values(CAST_PORTRAITS), ...UNIT_FACES];

describe('generatePortrait', () => {
  it('gives the same portrait for the same seed', () => {
    for (const seed of seeds(200)) expect(generatePortrait(seed)).toEqual(generatePortrait(seed));
  });

  it('rarely gives two seeds the same face', () => {
    const faces = new Set(seeds(500).map((seed) => JSON.stringify(generatePortrait(seed).face)));
    expect(faces.size).toBeGreaterThanOrEqual(495);
  });

  it('uses every option of every feature', () => {
    const all = Array.from({ length: 3000 }, (_, i) => generatePortrait(i));
    const seen = (get: (p: Portrait) => string) => new Set(all.map(get));
    expect(seen((p) => p.face.skin)).toEqual(new Set(SKIN_TONES));
    expect(seen((p) => p.face.shape)).toEqual(new Set(HEAD_SHAPES));
    expect(seen((p) => p.face.eyes)).toEqual(new Set(EYE_STYLES));
    expect(seen((p) => p.face.eyeColor)).toEqual(new Set(EYE_COLORS));
    expect(seen((p) => p.face.brows)).toEqual(new Set(BROW_STYLES));
    expect(seen((p) => p.face.nose)).toEqual(new Set(NOSE_STYLES));
    expect(seen((p) => p.face.mouth)).toEqual(new Set(MOUTH_STYLES));
    expect(seen((p) => p.face.ears)).toEqual(new Set(EAR_STYLES));
    expect(seen((p) => p.face.age)).toEqual(new Set(AGES));
    expect(seen((p) => p.face.mark)).toEqual(new Set(MARKS));
    expect(seen((p) => p.hair)).toEqual(new Set(HAIR_STYLES));
    expect(seen((p) => p.hairColor)).toEqual(new Set(HAIR_COLORS));
    expect(seen((p) => p.facialHair)).toEqual(new Set(FACIAL_HAIR));
    expect(seen((p) => p.outfit)).toEqual(new Set(OUTFITS.filter((o) => o !== 'toga')));
    expect(seen((p) => p.outfitColor)).toEqual(new Set(OUTFIT_COLORS));
  });

  it('only rolls ordinary humans: no disguises, props or togas', () => {
    for (const p of randomPeople) {
      expect(p.species).toBe('human');
      expect(p.outfit).not.toBe('toga');
      expect(p.lamp).toBeUndefined();
      expect(p.board).toBeUndefined();
      expect(p.mark).toBeUndefined();
      for (const item of p.accessories) expect(['glasses', 'earrings', 'pearls']).toContain(item);
    }
  });
});

describe('drawPortrait', () => {
  it('returns a 40x48 image of #rrggbb colours and transparency', () => {
    for (const p of everyone) {
      for (const img of [drawPortrait(p), drawPortrait(p, { eyes: 'closed', mouth: 'open' })]) {
        expect(img.width).toBe(PORTRAIT_WIDTH);
        expect(img.height).toBe(PORTRAIT_HEIGHT);
        expect(img.pixels).toHaveLength(PORTRAIT_WIDTH * PORTRAIT_HEIGHT);
        expect(img.pixels.filter((px) => px !== null && !/^#[0-9a-f]{6}$/.test(px))).toEqual([]);
      }
    }
  });

  it('draws the same pixels for the same seed', () => {
    for (const seed of seeds(100)) expect(key(drawPortrait(generatePortrait(seed)))).toBe(key(drawPortrait(generatePortrait(seed))));
  });

  it('draws different seeds differently', () => {
    expect(new Set(randomPeople.map((p) => key(drawPortrait(p)))).size).toBe(randomPeople.length);
  });

  it('does not modify the portrait it draws', () => {
    for (const p of [...randomPeople.slice(0, 20), ...UNIT_FACES]) {
      const before = structuredClone(p);
      drawPortrait(p, { eyes: 'closed', mouth: 'open' });
      expect(p).toEqual(before);
    }
  });

  // The video strip relies on these: a blink or a spoken word must be visible on every face.
  it('shows every blink, and only around the eyes', () => {
    for (const p of everyone) {
      const diff = changed(drawPortrait(p), drawPortrait(p, { eyes: 'closed' }));
      expect(diff.length).toBeGreaterThanOrEqual(4);
      expect(rowSpan(diff)).toBeLessThanOrEqual(4);
    }
  });

  it('shows every open mouth, and only around the mouth', () => {
    for (const p of everyone) {
      const diff = changed(drawPortrait(p), drawPortrait(p, { mouth: 'open' }));
      expect(diff.length).toBeGreaterThanOrEqual(4);
      expect(rowSpan(diff)).toBeLessThanOrEqual(3);
    }
  });

  it('makes every accessory visible on every kind of head', () => {
    for (const p of [...randomPeople.slice(0, 60), ...UNIT_FACES]) {
      const plain = drawPortrait({ ...p, accessories: [] });
      for (const item of ACCESSORIES) {
        expect(changed(plain, drawPortrait({ ...p, accessories: [item] })).length, item).toBeGreaterThanOrEqual(4);
      }
    }
  });

  it('draws an android exactly as a human: nothing in its face gives it away', () => {
    for (const face of UNIT_FACES) expect(key(drawPortrait(face))).toBe(key(drawPortrait({ ...face, species: 'human' })));
  });

  // The tell must read without colour: the core or the ring contrasts 3:1 or more with every shade of
  // every skin, and the core stands out from its ring, as a light does.
  it("draws a unit's lamp that reads on every skin tone, in any colour vision", () => {
    const luminance = (hex: string) => {
      const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    const contrast = (a: string, b: string) => {
      const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
      return (hi + 0.05) / (lo + 0.05);
    };
    for (const [tone, skin] of Object.entries(SKIN)) {
      for (const shade of [skin.hi, skin.base, skin.lo]) {
        const best = Math.max(contrast(PROPS.lamp.core, shade), contrast(PROPS.lamp.ring, shade));
        expect(best, `${tone} ${shade}`).toBeGreaterThanOrEqual(3);
      }
    }
    expect(contrast(PROPS.lamp.core, PROPS.lamp.ring)).toBeGreaterThanOrEqual(7);
  });

  /** Pixels the lamp changes, and how many of them are its core, by size. */
  const LIT: Record<LampSize, { changed: number; core: number }> = {
    bloom: { changed: 36, core: 4 },
    glow: { changed: 36, core: 4 },
    small: { changed: 8, core: 2 },
    slit: { changed: 4, core: 2 },
  };
  /** The top row of the eyes: the first row a blink changes. */
  const eyeTop = (p: Portrait) => Math.min(...changed(drawPortrait(p), drawPortrait(p, { eyes: 'closed' })).map(({ y }) => y));

  it('lights the lamp only with the eyes shut, on every unit and 40 random heads', () => {
    for (const p of [...UNIT_FACES, ...randomPeople.slice(0, 40)]) {
      const plain = [{}, { mouth: 'open' as const }].map((pose) => key(drawPortrait(p, pose)));
      const dark = drawPortrait(p, { eyes: 'closed' });
      const eyes = eyeTop(p);
      for (const lamp of LAMP_SIZES) {
        [{}, { mouth: 'open' as const }].forEach((pose, k) => expect(key(drawPortrait({ ...p, lamp }, pose)), lamp).toBe(plain[k]));
        const shut = drawPortrait({ ...p, lamp }, { eyes: 'closed' });
        const diff = changed(dark, shut);
        expect(diff.length, lamp).toBe(LIT[lamp].changed);
        const core = diff.filter(({ x, y }) => shut.pixels[y * shut.width + x] === PROPS.lamp.core);
        expect(core.length, lamp).toBe(LIT[lamp].core);
        expect(core.every(({ x }) => x === 19 || x === 20), lamp).toBe(true);
        // Centred on the face's mirror line, between the brows, and above the eyes.
        const at = new Set(diff.map(({ x, y }) => `${x},${y}`));
        const astray = diff.filter(({ x, y }) => !at.has(`${PORTRAIT_WIDTH - 1 - x},${y}`) || x < 16 || x > 23 || y >= eyes);
        expect(astray, lamp).toEqual([]);
      }
    }
  });

  it("lights each day's unit between the brows, on the face: never on an eye, the nose, the mouth or clothing", () => {
    let lit = 0;
    UNIT_FACES.forEach((p, d) => {
      const tell = UNIT_LAMPS[d];
      if (!tell) return;
      lit++;
      const skin = SKIN[p.face.skin];
      const hair = HAIR[p.hairColor];
      const face = new Set([skin.hi, skin.base, skin.lo, skin.deep, hair.hi, hair.base, hair.lo, INK]);
      const before = drawPortrait(p, { eyes: 'closed' });
      const diff = changed(before, drawPortrait({ ...p, lamp: tell.lamp }, { eyes: 'closed' }));
      const under = diff.map(({ x, y }) => before.pixels[y * before.width + x]!);
      expect(diff.length, `day ${d + 1}`).toBe(LIT[tell.lamp].changed);
      for (const [k, px] of under.entries()) expect(face.has(px), `day ${d + 1} at ${diff[k].x},${diff[k].y}`).toBe(true);
      // Its light falls on the brows, as light does and paint does not; the small lamp and the slit spill none.
      if (tell.lamp === 'bloom' || tell.lamp === 'glow') expect(under, `day ${d + 1}`).toContain(hair.lo);
    });
    expect(lit).toBe(5);
  });

  it('matches the golden images', () => {
    const ascii = (img: PixelImage) => {
      const legend = new Map<string, string>();
      const letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      const char = (px: string | null) => {
        if (px === null) return '.';
        if (!legend.has(px)) legend.set(px, letters[legend.size]);
        return legend.get(px);
      };
      return Array.from({ length: img.height }, (_, y) => img.pixels.slice(y * img.width, (y + 1) * img.width).map(char).join(''));
    };
    expect(ascii(drawPortrait(generatePortrait(1)))).toMatchSnapshot();
    expect(ascii(drawPortrait({ ...UNIT_FACES[0], lamp: 'bloom' }, { eyes: 'closed' }))).toMatchSnapshot();
  });
});
