import { describe, expect, it } from 'vitest';
import { handOf, impression, inkPath } from './stampImpression';

const ink = (i: { inked: boolean[] }) => i.inked.filter(Boolean).length;

describe('the stamp’s impression', () => {
  it('is the word in the stamp face, in its inked frame, in whole art pixels', () => {
    const flat = impression('Registered', 0);
    // Ten capitals of the face with a blank column after each but the last, two art pixels a font pixel, inside a
    // frame two pixels thick with rubber between it and the word.
    expect(flat.height).toBe(7 * 2 + 2 * (2 + 3));
    expect(flat.width).toBeGreaterThan(flat.height * 4);
    // The frame is inked all round, and the rubber inside it is bare.
    const inked = (x: number, y: number) => flat.inked[y * flat.width + x];
    for (let x = 0; x < flat.width; x++) for (const y of [0, 1, flat.height - 2, flat.height - 1]) expect(inked(x, y), `${x},${y}`).toBe(true);
    for (let y = 0; y < flat.height; y++) for (const x of [0, 1, flat.width - 2, flat.width - 1]) expect(inked(x, y), `${x},${y}`).toBe(true);
    for (let x = 2; x < flat.width - 2; x++) expect(inked(x, 2), `${x},2`).toBe(false);
    // The word's first stroke: the R's stem, inside the rubber.
    expect(inked(7, 5)).toBe(true);
    // Lowercase prints as capitals.
    expect(impression('registered', 0)).toEqual(flat);
  });

  it('turns the frame with the word: at every turn, the frame still runs round the whole of it', () => {
    for (const degrees of [-7, -4, 3, 6]) {
      const turned = impression('Challenged', degrees);
      // Every row and every column across the turned impression meets ink at both of its ends: the frame's.
      const row = (y: number) => turned.inked.slice(y * turned.width, (y + 1) * turned.width);
      const middle = row(Math.floor(turned.height / 2));
      expect(middle.indexOf(true), `${degrees}°`).toBeLessThan(turned.width / 8);
      expect(middle.lastIndexOf(true), `${degrees}°`).toBeGreaterThan((turned.width * 7) / 8);
    }
  });

  it('turns by the pixel: the same ink, give or take its stepped edges, never blurred', () => {
    const flat = impression('Challenged', 0);
    for (const degrees of [-7, -3, 3, 6]) {
      const turned = impression('Challenged', degrees);
      expect(turned.inked.every((cell) => typeof cell === 'boolean')).toBe(true);
      expect(turned.width).toBeGreaterThan(flat.width - 1);
      expect(turned.height).toBeGreaterThan(flat.height);
      expect(Math.abs(ink(turned) - ink(flat)) / ink(flat), `${degrees}°`).toBeLessThan(0.1);
    }
    // Drawn as outlines of the ink, corner to corner, with no edge inside the ink.
    expect(inkPath(impression('Registered', 4))).toMatch(/^(M\d+ \d+(L\d+ \d+)+Z)+$/);
    expect(inkPath({ width: 2, height: 2, inked: [true, true, true, true] })).toBe('M0 0L2 0L2 2L0 2Z');
  });

  it('is worn where the rubber took too little ink: a little, the same for the same stamp, different for another', () => {
    const full = ink(impression('Registered', 0));
    const [a, b] = [impression('Registered', 0, 17), impression('Registered', 0, 18)];
    for (const worn of [a, b]) {
      expect(1 - ink(worn) / full).toBeGreaterThan(0.03);
      expect(1 - ink(worn) / full).toBeLessThan(0.15);
    }
    expect(impression('Registered', 0, 17)).toEqual(a);
    expect(a.inked).not.toEqual(b.inked);
  });

  it('comes down as the hand set it: never level, a few degrees and pixels off, the same for a case every time', () => {
    const cases = Array.from({ length: 60 }, (_, i) => `${1 + (i % 7)}-${String(i + 1).padStart(3, '0')}`);
    for (const no of cases) {
      const hand = handOf(no);
      expect(hand).toEqual(handOf(no));
      expect(Math.abs(hand.degrees)).toBeGreaterThanOrEqual(3);
      expect(Math.abs(hand.degrees)).toBeLessThanOrEqual(7);
      for (const nudge of [hand.dx, hand.dy]) expect(Math.abs(nudge % 2)).toBe(0);
    }
    // Not always the same turn.
    expect(new Set(cases.map((no) => handOf(no).degrees)).size).toBeGreaterThanOrEqual(6);
  });
});
