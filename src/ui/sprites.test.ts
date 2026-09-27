import { describe, expect, it } from 'vitest';
import { BUCKET, PIGEON, PLANTS, TAIL, textImage, WET_FLOOR, wrapWords, type Sprite } from './sprites';

const sprites: Record<string, Sprite> = { PIGEON, BUCKET, WET_FLOOR, TAIL, ...PLANTS };

describe('hall sprites', () => {
  it.each(Object.entries(sprites))('%s has rows of one width and a colour for every letter', (_, { rows, palette }) => {
    for (const row of rows) expect(row).toHaveLength(rows[0].length);
    for (const ch of new Set(rows.join('').replace(/\./g, ''))) expect(palette[ch], ch).toMatch(/^#[0-9a-f]{6}$/);
  });

  it('writes text four pixels to a letter, five high', () => {
    const img = textImage('NOT RACCOONS', '#000000');
    expect(img.width).toBe(12 * 4 - 1);
    expect(img.height).toBe(5);
    expect(img.pixels.filter(Boolean).length).toBeGreaterThan(40);
  });

  it('wraps poster text by words', () => {
    expect(wrapWords('3 RACCOONS? SAY SOMETHING', 9)).toEqual(['3', 'RACCOONS?', 'SAY', 'SOMETHING']);
    expect(wrapWords('BE YOURSELF. ONCE.', 9)).toEqual(['BE', 'YOURSELF.', 'ONCE.']);
  });
});
