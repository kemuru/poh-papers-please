import { describe, expect, it } from 'vitest';
import { ACCESSORIES, drawPortrait } from './portrait';

const SIZE = 32;
const HEAD_ROWS = 23; // everything above the shoulders
const MIN_VISIBLE = 6; // pixels an accessory must visibly change
const RECT = /<rect x="(\d+)" y="(\d+)" width="(\d+)" height="(\d+)" fill="(#[0-9a-f]{6})"\/>/g;

// Paints the SVG's rects in document order onto a 32x32 grid, the way a browser composites
// them, so the tests check what ends up on screen rather than how the SVG is structured.
function rasterize(svg: string): string[] {
  const rects = [...svg.matchAll(RECT)];
  if (rects.length !== svg.split('<rect').length - 1) throw new Error('unexpected <rect> format');
  const pixels = Array<string>(SIZE * SIZE).fill('');
  for (const [, x, y, w, h, fill] of rects) {
    for (let py = +y; py < +y + +h; py++) {
      for (let px = +x; px < +x + +w; px++) {
        if (px >= SIZE || py >= SIZE) throw new Error(`pixel ${px},${py} is outside the canvas`);
        pixels[py * SIZE + px] = fill;
      }
    }
  }
  return pixels;
}

const rgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));

// Counts pixels whose colour changes enough to notice: channel differences summing to 40 or more
// out of 765. A dark mustache painted over an equally dark mouth does not count.
function visibleDifference(a: string[], b: string[], rows = SIZE): number {
  let count = 0;
  for (let i = 0; i < rows * SIZE; i++) {
    const [p, q] = [rgb(a[i]), rgb(b[i])];
    if (Math.abs(p[0] - q[0]) + Math.abs(p[1] - q[1]) + Math.abs(p[2] - q[2]) >= 40) count++;
  }
  return count;
}

const SEEDS = Array.from({ length: 50 }, (_, i) => i + 1);

describe('drawPortrait', () => {
  it('returns an identical SVG for the same seed', () => {
    for (const seed of [0, 1, 42, 2 ** 31 + 7, 2 ** 32 - 1]) {
      expect(drawPortrait(seed)).toBe(drawPortrait(seed));
      expect(drawPortrait(seed, ACCESSORIES)).toBe(drawPortrait(seed, ACCESSORIES));
      expect(drawPortrait(seed, ['monocle', 'mustache'])).toBe(drawPortrait(seed, ['mustache', 'monocle']));
    }
  });

  it('paints every pixel of a 32x32 grid', () => {
    for (const seed of SEEDS) {
      const svg = drawPortrait(seed, ACCESSORIES);
      expect(svg).toMatch(/^<svg [^>]*viewBox="0 0 32 32"/);
      expect(rasterize(svg)).not.toContain('');
    }
  });

  it('gives at least 45 distinct faces for 50 seeds', () => {
    // Two portraits show the same face unless at least 10 pixels above the shoulders visibly
    // differ, so a different shirt or a single stray pixel does not make a new face.
    const faces: string[][] = [];
    for (const seed of SEEDS) {
      const face = rasterize(drawPortrait(seed));
      if (faces.every((other) => visibleDifference(face, other, HEAD_ROWS) >= 10)) faces.push(face);
    }
    expect(faces.length).toBeGreaterThanOrEqual(45);
  });
});

describe.each(ACCESSORIES)('accessory %s', (accessory) => {
  it('adds its own layer on top of the unchanged face', () => {
    const layer = new RegExp(`<g data-layer="${accessory}">.*?</g>`);
    for (const seed of SEEDS) {
      const worn = drawPortrait(seed, [accessory]);
      expect(worn).toMatch(layer);
      expect(worn.replace(layer, '')).toBe(drawPortrait(seed));
    }
  });

  it('is visible alone and when all four are worn', () => {
    const others = ACCESSORIES.filter((a) => a !== accessory);
    for (const seed of SEEDS) {
      const alone = visibleDifference(rasterize(drawPortrait(seed, [accessory])), rasterize(drawPortrait(seed)));
      const together = visibleDifference(rasterize(drawPortrait(seed, ACCESSORIES)), rasterize(drawPortrait(seed, others)));
      expect(alone, `seed ${seed}, alone`).toBeGreaterThanOrEqual(MIN_VISIBLE);
      expect(together, `seed ${seed}, with the others`).toBeGreaterThanOrEqual(MIN_VISIBLE);
    }
  });
});
