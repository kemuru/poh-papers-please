// A rubber stamp's impression, drawn in pixels: the word in the Ministry's stamp face, from the face's own drawings
// (scripts/fonts/stamp.txt), worn where the rubber took too little ink, and set down by hand, a few degrees off
// level and a few pixels off its place, not twice alike. It is turned pixel by pixel (the nearest pixel of the level
// impression, for each pixel of the turned one), so it stays on the art-pixel grid, with the stepped edges a stamp
// would leave, where a CSS rotation would blur its lettering (notes/art-direction.md). The word has no frame: a
// frame two pixels thick, turned a few degrees, can only be drawn as a staircase of two rows, and on a scaled stage
// that read as two thin lines around the word (until 30 Sep 2026).
import STAMP_FACE from '../../scripts/fonts/stamp.txt?raw';

/** The stamp face's drawn characters, by character: ten rows of '#' (inked) and '.', as in the font file. */
const GLYPHS: Record<string, string[]> = {};
{
  let char: string | null = null;
  for (const line of STAMP_FACE.split('\n')) {
    if (line.startsWith('== ')) GLYPHS[(char = line.slice(3).trim())] = [];
    else if (char && /^[.#]+$/.test(line)) GLYPHS[char].push(line);
  }
}

/** The face's capitals stand on rows 1 to 7; a glyph is followed by a blank column, and a space is three wide. */
const CAPS = [1, 8] as const;
const SPACE = 3;
/** In art pixels (a font pixel of 40px type is two): the bare rubber round the word, which leaves no ink. */
const PAD = { x: 2, y: 2 };

export type Impression = { width: number; height: number; inked: boolean[] };

/** A number from 0 to 1 for a pixel of a stamp's rubber: the same for the same pixel and the same stamp. */
function grain(x: number, y: number, seed: number) {
  let h = Math.imul(x, 0x27d4eb2d) ^ Math.imul(y, 0x165667b1) ^ Math.imul(seed, 0x9e3779b1);
  h = Math.imul(h ^ (h >>> 15), 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  return ((h ^ (h >>> 16)) >>> 0) / 0x100000000;
}

/** Where the rubber took too little ink: a few pairs of pixels, and the odd single one, left bare. */
function worn(flat: Impression, seed: number): Impression {
  const inked = flat.inked.map((ink, i) => {
    const [x, y] = [i % flat.width, Math.floor(i / flat.width)];
    return ink && grain(x >> 1, y >> 1, seed) >= 0.05 && grain(x, y, seed + 1) >= 0.03;
  });
  return { ...flat, inked };
}

/** The word as the stamp's rubber carries it, level, one art pixel to a cell. */
function level(word: string): Impression {
  const glyphs = [...word.toUpperCase()].map((ch) => GLYPHS[ch] ?? (ch === ' ' ? null : GLYPHS['?']));
  const widths = glyphs.map((g) => (g ? g[0].length : SPACE));
  const textWidth = (widths.reduce((sum, w) => sum + w + 1, 0) - 1) * 2;
  const textHeight = (CAPS[1] - CAPS[0]) * 2;
  const width = textWidth + 2 * PAD.x;
  const height = textHeight + 2 * PAD.y;
  const inked = new Array<boolean>(width * height).fill(false);
  let left = PAD.x;
  glyphs.forEach((glyph, i) => {
    if (glyph) {
      for (let row = CAPS[0]; row < CAPS[1]; row++) {
        [...glyph[row]].forEach((cell, col) => {
          if (cell !== '#') return;
          const [x, y] = [left + col * 2, PAD.y + (row - CAPS[0]) * 2];
          for (const [dx, dy] of [[0, 0], [1, 0], [0, 1], [1, 1]]) inked[(y + dy) * width + x + dx] = true;
        });
      }
    }
    left += (widths[i] + 1) * 2;
  });
  return { width, height, inked };
}

/** The impression of `word`, turned `degrees` (clockwise when positive), still in whole art pixels, worn as `wear` says (0: fully inked). */
export function impression(word: string, degrees: number, wear = 0): Impression {
  const flat = wear ? worn(level(word), wear) : level(word);
  if (!degrees) return flat;
  const turn = (degrees * Math.PI) / 180;
  const [cos, sin] = [Math.cos(turn), Math.sin(turn)];
  const width = Math.ceil(Math.abs(flat.width * cos) + Math.abs(flat.height * sin));
  const height = Math.ceil(Math.abs(flat.width * sin) + Math.abs(flat.height * cos));
  const inked = new Array<boolean>(width * height).fill(false);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      // Each pixel of the turned impression takes the level impression's pixel under its centre, turned back.
      const [cx, cy] = [x + 0.5 - width / 2, y + 0.5 - height / 2];
      const sx = Math.floor(cx * cos + cy * sin + flat.width / 2);
      const sy = Math.floor(-cx * sin + cy * cos + flat.height / 2);
      if (sx >= 0 && sy >= 0 && sx < flat.width && sy < flat.height) inked[y * width + x] = flat.inked[sy * flat.width + sx];
    }
  }
  return { width, height, inked };
}

/**
 * An SVG path of the impression's inked pixels, in art pixels: the outline of each patch of ink, never the pixels
 * one by one. Squares or runs laid side by side meet on edges that a scaled stage softens from both sides, which
 * left a hairline of paper between every two rows (a frame two pixels thick read as a double line); an outline has
 * no inner edges to soften. Each boundary edge runs clockwise round the ink, so the loops fill it by any pairing.
 */
export function inkPath({ width, height, inked }: Impression): string {
  const ink = (x: number, y: number) => x >= 0 && y >= 0 && x < width && y < height && inked[y * width + x];
  const edges = new Map<string, [number, number][]>();
  const add = (x0: number, y0: number, x1: number, y1: number) => {
    const key = `${x0},${y0}`;
    edges.set(key, [...(edges.get(key) ?? []), [x1, y1]]);
  };
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (!ink(x, y)) continue;
      if (!ink(x, y - 1)) add(x, y, x + 1, y);
      if (!ink(x + 1, y)) add(x + 1, y, x + 1, y + 1);
      if (!ink(x, y + 1)) add(x + 1, y + 1, x, y + 1);
      if (!ink(x - 1, y)) add(x, y + 1, x, y);
    }
  }
  const loops: string[] = [];
  for (const start of [...edges.keys()]) {
    while (edges.get(start)?.length) {
      const [sx, sy] = start.split(',').map(Number);
      const points: [number, number][] = [[sx, sy]];
      let [x, y] = [sx, sy];
      for (;;) {
        const out = edges.get(`${x},${y}`);
        if (!out?.length) break;
        [x, y] = out.shift()!;
        if (x === sx && y === sy) break;
        points.push([x, y]);
      }
      // Only the corners: a point where the outline carries straight on is left out.
      const corners = points.filter(([px, py], i) => {
        const [ax, ay] = points[(i - 1 + points.length) % points.length];
        const [bx, by] = points[(i + 1) % points.length];
        return (px - ax) * (by - py) !== (py - ay) * (bx - px);
      });
      loops.push(`M${corners.map(([px, py]) => `${px} ${py}`).join('L')}Z`);
    }
  }
  return loops.join('');
}

/** The turns a hand gives a stamp: a few degrees either way, never level. */
const TURNS = [-7, -5, -4, -3, 3, 4, 5, 6];
/** And how far off its place it lands, in design pixels (whole art pixels). */
const NUDGES = [-4, -2, 0, 2, 4];

/** How the stamp came down on this case, and how its rubber was inked: the same case, the same impression, on every look and after a reload. */
export function handOf(caseNo: string): { degrees: number; dx: number; dy: number; wear: number } {
  let hash = 0x811c9dc5;
  for (const ch of caseNo) hash = Math.imul(hash ^ ch.charCodeAt(0), 0x01000193);
  const h = hash >>> 0;
  return { degrees: TURNS[h % TURNS.length], dx: NUDGES[(h >>> 8) % NUDGES.length], dy: NUDGES[(h >>> 16) % NUDGES.length], wear: (h % 9973) + 1 };
}
