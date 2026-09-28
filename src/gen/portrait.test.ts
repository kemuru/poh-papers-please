import { describe, expect, it } from 'vitest';
import { CAST_PORTRAITS, UNIT_FACES, UNIT_PANELS } from '../content/portraits';
import { drawPortrait, PORTRAIT_HEIGHT, PORTRAIT_WIDTH, type PixelImage } from './drawPortrait';
import { PROPS, SKIN } from './portraitParts';
import {
  ACCESSORIES, AGES, BROW_STYLES, EAR_STYLES, EYE_COLORS, EYE_STYLES, FACIAL_HAIR, generatePortrait,
  HAIR_COLORS, HAIR_STYLES, HEAD_SHAPES, MARKS, MOUTH_STYLES, NOSE_STYLES, OUTFIT_COLORS, OUTFITS, PANEL_SPOTS,
  SKIN_TONES, type Portrait,
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
      expect(p.panel).toBeUndefined();
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

  // The tell must read without colour: some part of it contrasts 3:1 or more with every skin tone.
  it("draws a unit's open panel that reads on every skin tone, in any colour vision", () => {
    const luminance = (hex: string) => {
      const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    const contrast = (a: string, b: string) => {
      const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
      return (hi + 0.05) / (lo + 0.05);
    };
    for (const [tone, skin] of Object.entries(SKIN)) {
      const best = Math.max(contrast(PROPS.machine.edge, skin.base), contrast(PROPS.machine.flap, skin.base));
      expect(best, tone).toBeGreaterThanOrEqual(3);
    }
  });

  it("shows a unit's open panel at every spot, on every unit and on random heads, and nowhere else", () => {
    for (const p of [...UNIT_FACES, ...randomPeople.slice(0, 40)]) {
      for (const spot of PANEL_SPOTS) {
        for (const pose of [{}, { eyes: 'closed' as const }, { mouth: 'open' as const }]) {
          const diff = changed(drawPortrait(p, pose), drawPortrait({ ...p, panel: spot }, pose));
          expect(diff.length, spot).toBeGreaterThanOrEqual(16);
          expect(rowSpan(diff), spot).toBeLessThanOrEqual(5);
        }
      }
    }
  });

  it("opens each day's unit on bare skin, whole: no eye, brow, nose, mouth, hair or clothing under it, so it cannot pass for anything worn", () => {
    let opened = 0;
    UNIT_FACES.forEach((p, d) => {
      const panel = UNIT_PANELS[d];
      if (!panel) return;
      opened++;
      const skin = SKIN[p.face.skin];
      const bare = new Set([skin.hi, skin.base, skin.lo, skin.deep]);
      for (const pose of [{}, { eyes: 'closed' as const }, { mouth: 'open' as const }]) {
        const before = drawPortrait(p, pose);
        const diff = changed(before, drawPortrait({ ...p, panel: panel.where }, pose));
        expect(diff.length, `day ${d + 1}`).toBe(28);
        for (const { x, y } of diff) expect(bare.has(before.pixels[y * before.width + x]!), `day ${d + 1} at ${x},${y}`).toBe(true);
      }
    });
    expect(opened).toBe(4);
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
    expect(ascii(drawPortrait({ ...UNIT_FACES[0], panel: UNIT_PANELS[0]!.where }, { mouth: 'open' }))).toMatchSnapshot();
  });
});
