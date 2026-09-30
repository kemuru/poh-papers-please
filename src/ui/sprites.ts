// Self-made pixel art for the waiting hall, in the same style as src/gen/portraitParts.ts:
// one string per row, '.' is transparent and every other letter is looked up in the palette.
import type { PixelImage } from '../gen/drawPortrait';
import { FONT } from '../gen/portraitParts';

export type Sprite = { rows: readonly string[]; palette: Readonly<Record<string, string>> };

export function spriteImage({ rows, palette }: Sprite): PixelImage {
  return {
    width: rows[0].length,
    height: rows.length,
    pixels: rows.flatMap((row) => [...row].map((ch) => (ch === '.' ? null : palette[ch]))),
  };
}

/** Text in the portraits' 3x5 font. Capitals, digits and . , ! ? ' - : only; anything else is a space. */
export function textImage(text: string, color: string): PixelImage {
  const chars = [...text.toUpperCase()];
  const width = Math.max(chars.length * 4 - 1, 1);
  const pixels: (string | null)[] = new Array(width * 5).fill(null);
  chars.forEach((ch, i) => {
    const glyph = FONT[ch] ?? FONT[' '];
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 3; col++) if (Number(glyph[row]) & (4 >> col)) pixels[row * width + i * 4 + col] = color;
    }
  });
  return { width, height: 5, pixels };
}

/** A drawing turned a quarter turn, clockwise or not: pixels stay pixels, so a hanging banner is re-lettered, not rotated. */
export function turned({ width, height, pixels }: PixelImage, way: 'cw' | 'ccw' = 'cw'): PixelImage {
  const out: (string | null)[] = new Array(width * height).fill(null);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const [nx, ny] = way === 'cw' ? [height - 1 - y, x] : [y, width - 1 - x];
      out[ny * height + nx] = pixels[y * width + x];
    }
  }
  return { width: height, height: width, pixels: out };
}

/** A drawing with each column dropped by `drop(x)` whole pixels: how a sign hangs crooked or a banner sags, in steps. */
export function sheared({ width, height, pixels }: PixelImage, drop: (x: number) => number): PixelImage {
  const drops = Array.from({ length: width }, (_, x) => drop(x));
  const tall = height + Math.max(0, ...drops);
  const out: (string | null)[] = new Array(width * tall).fill(null);
  for (let x = 0; x < width; x++) for (let y = 0; y < height; y++) out[(y + drops[x]) * width + x] = pixels[y * width + x];
  return { width, height: tall, pixels: out };
}

/** A card of one colour with pixel text on it, `pad` pixels in from its edges. */
export function card(text: PixelImage, color: string, pad: number): PixelImage {
  const width = text.width + 2 * pad;
  const height = text.height + 2 * pad;
  const pixels: (string | null)[] = new Array(width * height).fill(color);
  for (let y = 0; y < text.height; y++) {
    for (let x = 0; x < text.width; x++) {
      const ink = text.pixels[y * text.width + x];
      if (ink) pixels[(y + pad) * width + x + pad] = ink;
    }
  }
  return { width, height, pixels };
}

/** Greedy word wrap for the pixel font, `max` characters a line. */
export function wrapWords(text: string, max: number): string[] {
  const lines: string[] = [];
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const last = lines[lines.length - 1];
    if (last !== undefined && last.length + 1 + word.length <= max) lines[lines.length - 1] = `${last} ${word}`;
    else lines.push(word);
  }
  return lines;
}

const INK = '#2d2a2e';

/** Facing left. Pigeons do not queue; they wait. */
export const PIGEON: Sprite = {
  rows: [
    '..kk......',
    '.khok.....',
    'bkhhk.....',
    '.knngkk...',
    '..kggwwkk.',
    '..kgggwwtk',
    '...kgggktt',
    '....f.f...',
  ],
  palette: { k: INK, h: '#7d8594', o: '#e0782c', b: '#3b3838', n: '#5e8c7e', g: '#9aa0ab', w: '#c3c8cf', t: '#5f6570', f: '#c46f69' },
};

/** The same pigeon between steps, head down at the floor, tail up: the frame it pecks with. */
export const PIGEON_PECK: Sprite = {
  rows: [
    '..........',
    '..........',
    '..........',
    '...kkkk...',
    '..knggwkk.',
    '.kngggwwtk',
    'khokgggktt',
    'bkk.f.f...',
  ],
  palette: PIGEON.palette,
};

/** A bunting flag, hanging from its rope. */
export const FLAG = ['fffffff', '.fffff.', '..fff..', '...f...'];

/** The hall's wall clock: a black rim, a cream face and a mark at twelve, three, six and nine. Hall.tsx draws the hands by the minute. */
export const CLOCK: Sprite = {
  rows: [
    '.......rrrrr.......',
    '.....rrrrrrrrr.....',
    '...rrrrffkffrrrr...',
    '..rrrffffkffffrrr..',
    '..rrfffffffffffrr..',
    '.rrfffffffffffffrr.',
    '.rrfffffffffffffrr.',
    'rrfffffffffffffffrr',
    'rrfffffffffffffffrr',
    'rrkkfffffffffffkkrr',
    'rrfffffffffffffffrr',
    'rrfffffffffffffffrr',
    '.rrfffffffffffffrr.',
    '.rrfffffffffffffrr.',
    '..rrfffffffffffrr..',
    '..rrrffffkffffrrr..',
    '...rrrrffkffrrrr...',
    '.....rrrrrrrrr.....',
    '.......rrrrr.......',
  ],
  palette: { r: '#2d2a2e', f: '#efe9d6', k: '#57524a' },
};

const POT = { p: '#9a5b3b', q: '#6f3d27', s: '#3b2a1f' };
const POT_ROWS = ['...ppppppp...', '...qsssssq...', '...qpppppq...', '....qpppq....', '....qpppq....', '.....qqq.....'];

/** The Ministry plant, by how the week is going. */
export const PLANTS: Record<'fresh' | 'droopy' | 'dead', Sprite> = {
  fresh: {
    rows: [
      '.....l.l.....',
      '...l.lgl.l...',
      '..lgl.g.lgl..',
      '.lg..lgl..gl.',
      '.g..lgdgl..g.',
      '...lg.d.gl...',
      '..lg..d..gl..',
      '..g...d...g..',
      '......d......',
      ...POT_ROWS,
    ],
    palette: { l: '#79a857', g: '#4f7a3c', d: '#37562b', ...POT },
  },
  droopy: {
    rows: [
      '.............',
      '.............',
      '......d......',
      '....lgdgl....',
      '...lg.d.gl...',
      '..lg..d..gl..',
      '.lg...d...gl.',
      '.g....d....g.',
      'g.....d.....g',
      ...POT_ROWS,
    ],
    palette: { l: '#a3a65c', g: '#7c8a45', d: '#5a5f33', ...POT },
  },
  dead: {
    rows: [
      '.............',
      '......d......',
      '....d.d......',
      '.....dd..d...',
      '......d.d....',
      '...d..dd.....',
      '....d.d......',
      '.....dd......',
      '......d......',
      ...POT_ROWS,
    ],
    palette: { d: '#6b5238', ...POT },
  },
};

export const BUCKET: Sprite = {
  rows: ['.d.....d.', 'dlllllllm', 'dmwwwwwmd', '.dmmmmmd.', '.dmmmmmd.', '..dmmmd..', '..ddddd..'],
  palette: { d: '#4d545b', l: '#b8bec4', m: '#8d949b', w: '#6f9fbf' },
};

export const WET_FLOOR: Sprite = {
  rows: [
    '....d....',
    '...dyd...',
    '...yyy...',
    '..yykyy..',
    '..yykyy..',
    '.yyykyyy.',
    '.yyyyyyy.',
    'yyyykyyyy',
    'yyyyyyyyy',
    'd.......d',
    'd.......d',
  ],
  palette: { y: '#e2b93b', d: '#8a6a1a', k: INK },
};

