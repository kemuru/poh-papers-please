import { describe, expect, it } from 'vitest';
import { BUCKET, PIGEON, PLANTS, textImage, WET_FLOOR, wrapWords, type Sprite } from './sprites';

const sprites: Record<string, Sprite> = { PIGEON, BUCKET, WET_FLOOR, ...PLANTS };

describe('hall sprites', () => {
  it.each(Object.entries(sprites))('%s has rows of one width and a colour for every letter', (_, { rows, palette }) => {
    for (const row of rows) expect(row).toHaveLength(rows[0].length);
    for (const ch of new Set(rows.join('').replace(/\./g, ''))) expect(palette[ch], ch).toMatch(/^#[0-9a-f]{6}$/);
  });

  it('writes text four pixels to a letter, five high', () => {
    const img = textImage('HUMANS ONLY', '#000000');
    expect(img.width).toBe(11 * 4 - 1);
    expect(img.height).toBe(5);
    expect(img.pixels.filter(Boolean).length).toBeGreaterThan(40);
  });

  it('wraps poster text by words', () => {
    expect(wrapWords('CHECK EVERY FRAME', 9)).toEqual(['CHECK', 'EVERY', 'FRAME']);
    expect(wrapWords('ONE FACE PER HUMAN', 9)).toEqual(['ONE FACE', 'PER HUMAN']);
    expect(wrapWords('BE YOURSELF. ONCE.', 9)).toEqual(['BE', 'YOURSELF.', 'ONCE.']);
  });
});
