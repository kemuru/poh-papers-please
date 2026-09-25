import { describe, expect, it } from 'vitest';
import { CAST_PORTRAITS } from '../content/portraits';
import { drawPortrait, type PixelImage } from '../gen/drawPortrait';
import { generatePortrait } from '../gen/portrait';
import { pixelPaths } from './PixelPortrait';

/** Paint the paths back onto a blank image, failing if any pixel is painted twice. */
const repaint = (img: PixelImage) => {
  const out: (string | null)[] = new Array(img.width * img.height).fill(null);
  for (const { color, d } of pixelPaths(img)) {
    for (const [, x, y, run] of d.matchAll(/M(\d+) (\d+)h(\d+)v1h-\d+z/g)) {
      for (let i = 0; i < Number(run); i++) {
        const at = Number(y) * img.width + Number(x) + i;
        expect(out[at]).toBeNull();
        out[at] = color;
      }
    }
  }
  return out;
};

describe('pixelPaths', () => {
  it('covers every opaque pixel exactly once, in its colour', () => {
    for (const p of [generatePortrait(1), generatePortrait(2), ...Object.values(CAST_PORTRAITS)]) {
      const img = drawPortrait(p);
      expect(repaint(img)).toEqual(img.pixels);
    }
  });

  it('merges runs so a portrait stays small', () => {
    const paths = pixelPaths(drawPortrait(generatePortrait(1)));
    expect(paths.length).toBeLessThan(60);
  });
});
