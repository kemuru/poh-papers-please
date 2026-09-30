import { describe, expect, it } from 'vitest';

// Violet belongs to the units' lamp alone (notes/art-direction.md, "Palette"): the one saturated colour on a
// face, and the one thing a clerk looks for between the brows. Any other violet, on a face or on the desk,
// would read as a light on a valid human, or teach the eye to pass over one. So no colour in the game's
// source but the lamp's own sits in the violet hues with any colour to it.
const sources = import.meta.glob(['./**/*.ts', './**/*.tsx', './**/*.css', '!./**/*.test.ts', '!./**/*.test.tsx'], {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

/** Hue in degrees and chroma (the top channel less the bottom one, 0 to 255) of a hex colour. */
function hueChroma(hex: string) {
  const full = hex.length === 4 ? `#${[...hex.slice(1)].map((c) => c + c).join('')}` : hex;
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(full.slice(i, i + 2), 16));
  const max = Math.max(r, g, b);
  const chroma = max - Math.min(r, g, b);
  if (!chroma) return { hue: 0, chroma };
  const sector = max === r ? ((g - b) / chroma + 6) % 6 : max === g ? (b - r) / chroma + 2 : (r - g) / chroma + 4;
  return { hue: sector * 60, chroma };
}

/** Violet as the lamp's (hue 256): blue-violet to purple, with enough colour to read as one. */
const violet = (hex: string) => {
  const { hue, chroma } = hueChroma(hex);
  return hue >= 235 && hue <= 290 && chroma >= 16;
};

describe('violet', () => {
  it('reads the lamp as violet, and the plum, navy and near-black the cast wear as not', () => {
    expect(Object.keys(sources)).toContain('./gen/portraitParts.ts');
    for (const lamp of ['#3d2288', '#b39af7']) expect(violet(lamp), lamp).toBe(true);
    // A lilac sleep mask, worn across the brow by a valid human, until 30 Sep 2026.
    expect(violet('#b8a3d6')).toBe(true);
    for (const worn of ['#865680', '#674a64', '#3e4a68', '#2c3550', '#2d2c32']) expect(violet(worn), worn).toBe(false);
  });

  it('is the units’ lamp alone: no other colour in the game is violet', () => {
    const found = Object.entries(sources).flatMap(([path, source]) =>
      source.split('\n').flatMap((line, i) =>
        // The lamp's own definition is the one place violet may be written.
        /^\s*lamp: \{ core:/.test(line)
          ? []
          : [...line.matchAll(/#(?:[0-9a-f]{6}|[0-9a-f]{3})\b/gi)].filter((m) => violet(m[0])).map((m) => `${path}:${i + 1} ${m[0]}`),
      ),
    );
    expect(found).toEqual([]);
  });
});
