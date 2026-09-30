// Self-made pixel art for the booth and the desk, drawn like the hall's sprites (src/ui/sprites.ts): one
// string per row, '.' is transparent and every other letter is looked up in the palette. Each sprite pixel
// is one art pixel, 2 design pixels, as the portraits are drawn.
import { memo } from 'react';
import { pixelPaths } from './PixelPortrait';
import { spriteImage, type Sprite } from './sprites';

const LIGHT = '#c4ccce';
const DIM = '#6f787b';
const RED = '#e0574c';

export const SPEAKER: Sprite = {
  rows: ['...a.....', '..aa...b.', 'aaaa.b..b', 'aaaa..b.b', 'aaaa..b.b', 'aaaa.b..b', '..aa...b.', '...a.....'],
  palette: { a: LIGHT, b: LIGHT },
};

export const SPEAKER_OFF: Sprite = {
  rows: ['...a.....', '..aa.....', 'aaaa.r..r', 'aaaa..rr.', 'aaaa..rr.', 'aaaa.r..r', '..aa.....', '...a.....'],
  palette: { a: DIM, r: RED },
};

export const NOTE: Sprite = {
  rows: ['...aaaaa', '...aaaaa', '...a...a', '...a...a', '...a...a', '.aaa.aaa', 'aaa.aaa.'],
  palette: { a: LIGHT },
};

export const NOTE_OFF: Sprite = { rows: NOTE.rows, palette: { a: DIM } };

/** The clerk's break: the menu. */
export const PAUSE: Sprite = {
  rows: ['aa.aa', 'aa.aa', 'aa.aa', 'aa.aa', 'aa.aa', 'aa.aa'],
  palette: { a: LIGHT },
};

/** Beside the count of those seen today, on the booth's counter. */
export const PERSON: Sprite = {
  rows: ['..aa..', '.aaaa.', '.aaaa.', '..aa..', '.aaaa.', 'aaaaaa', 'aaaaaa'],
  palette: { a: '#8a5f22' },
};

/** Beside the day, on the booth's counter: a page off the calendar. */
export const CALENDAR: Sprite = {
  rows: ['.a...a.', 'aaaaaaa', 'aaaaaaa', 'a.....a', 'a.a.a.a', 'a.....a', 'aaaaaaa'],
  palette: { a: '#8a5f22' },
};

/** Inspect's magnifying glass: a steel ring, the glass, a wooden handle. Its key cap sits on the glass. */
export const MAGNIFIER: Sprite = {
  rows: [
    '....rrrrr.......',
    '..rrgggggrr.....',
    '.rgggggggggr....',
    '.rgggggggggr....',
    'rgggggggggggr...',
    'rgggggggggggr...',
    'rgggggggggggr...',
    'rgggggggggggr...',
    'rgggggggggggr...',
    '.rgggggggggr....',
    '.rgggggggggr....',
    '..rrgggggrrww...',
    '....rrrrr..www..',
    '............www.',
    '.............www',
    '..............ww',
  ],
  palette: { r: '#1b1c1c', g: '#bcd3d6', w: '#7e5b3d' },
};

/** A rubber stamp's wooden knob, lit from the top left. Its key cap sits on top. */
export const KNOB: Sprite = {
  rows: [
    '........oooooooo........',
    '.....ooommmmmmmmooo.....',
    '...oomhhhmmmmmmmmddoo...',
    '..omhhhhmmmmmmmmmmmddo..',
    '.omhhmmmmmmmmmmmmmmmddo.',
    '.ommmmmmmmmmmmmmmmmmddo.',
    'ommmmmmmmmmmmmmmmmmmdddo',
    'odmmmmmmmmmmmmmmmmmmdddo',
    'odddmmmmmmmmmmmmmmmddddo',
    '.oddddddddddddddddddddo.',
    '...oooooooooooooooooo...',
  ],
  palette: { o: '#2f2117', m: '#8a6545', h: '#b48a5e', d: '#5f432d' },
};

/** Rule 2's figure: allowed, ink on the paper. */
export const MARK_OK: Sprite = {
  rows: ['..kkkkk..', '.kpppppk.', 'kpppppppk', 'kpppppkpk', 'kpkppkppk', 'kppkkpppk', 'kpppppppk', '.kpppppk.', '..kkkkk..'],
  palette: { k: '#1f1d1a', p: '#e9dcb6' },
};

/** Rule 2's figure: not allowed, the paper on the ink. */
export const MARK_NOT: Sprite = {
  rows: ['..kkkkk..', '.kkkkkkk.', 'kkpkkkpkk', 'kkkpkpkkk', 'kkkkpkkkk', 'kkkpkpkkk', 'kkpkkkpkk', '.kkkkkkk.', '..kkkkk..'],
  palette: { k: '#1f1d1a', p: '#e9dcb6' },
};

/**
 * The Registry Gazette's masthead, in the paper's own textura: heavy stems with a lozenge at the head
 * and the foot. Each glyph is 20 rows: capitals on rows 1 to 15, the x-height 5 to 15, descenders to 19.
 */
const TEXTURA: Record<string, readonly string[]> = {
  T: ['.............', '..#########..', '.##..###..##.', '##...###...##', '#....###....#', '.....###.....', '.....###.....', '.....###.....', '.....###.....', '.....###.....', '.....###.....', '.....###.....', '.....###.....', '.....###.....', '.....####....', '......##.....', '.............', '.............', '.............', '.............'],
  h: ['..........', '.##.......', '####......', '.###......', '.###......', '.###..##..', '.###.####.', '.####.###.', '.###..###.', '.###..###.', '.###..###.', '.###..###.', '.###..###.', '.###..###.', '.####.####', '..##...##.', '..........', '..........', '..........', '..........'],
  e: ['........', '........', '........', '........', '........', '.##.###.', '####...#', '.###...#', '.###...#', '.###..#.', '.#####..', '.###....', '.###....', '.###....', '.####..#', '..#####.', '........', '........', '........', '........'],
  R: ['.............', '.##.######...', '####.....##..', '.###......##.', '.###......##.', '.###......##.', '.###.....##..', '.###..####...', '.######......', '.###.##......', '.###..##.....', '.###...##....', '.###....##...', '.###.....##..', '.####.....##.', '..##.......##', '.............', '.............', '.............', '.............'],
  g: ['.........', '.........', '.........', '.........', '.........', '.##.####.', '####...##', '.###..###', '.###..###', '.###..###', '.###..###', '.###..###', '.###..###', '.###..###', '.####.###', '..#######', '......###', '#.....###', '.#...###.', '..####...'],
  i: ['.....', '.....', '.##..', '.##..', '.....', '.##..', '####.', '.###.', '.###.', '.###.', '.###.', '.###.', '.###.', '.###.', '.####', '..##.', '.....', '.....', '.....', '.....'],
  s: ['.......', '.......', '.......', '.......', '.......', '..#####', '.###..#', '.###...', '.###...', '..###..', '...###.', '....###', '....###', '....###', '#..###.', '#####..', '.......', '.......', '.......', '.......'],
  t: ['.......', '.......', '.##....', '.###...', '.###...', '#######', '.###...', '.###...', '.###...', '.###...', '.###...', '.###...', '.###...', '.###...', '.####.#', '..####.', '.......', '.......', '.......', '.......'],
  r: ['........', '........', '........', '........', '........', '.##...##', '####.###', '.#####..', '.###....', '.###....', '.###....', '.###....', '.###....', '.###....', '.####...', '..##....', '........', '........', '........', '........'],
  y: ['..........', '..........', '..........', '..........', '..........', '.##...##..', '####.####.', '.###..###.', '.###..###.', '.###..###.', '.###..###.', '.###..###.', '.###..###.', '.###..###.', '.###.####.', '..####.##.', '......###.', '......###.', '##...###..', '.####.....'],
  G: ['.............', '.....######..', '...###....##.', '..###......#.', '.###.........', '.###.........', '###..........', '###....######', '###......###.', '###......###.', '###......###.', '###......###.', '.###.....###.', '.###.....###.', '..####..####.', '....#####.#..', '.............', '.............', '.............', '.............'],
  a: ['.........', '.........', '.........', '.........', '.........', '...####..', '..#...###', '......###', '......###', '...######', '.###..###', '###...###', '###...###', '###...###', '####.####', '.###..##.', '.........', '.........', '.........', '.........'],
  z: ['........', '........', '........', '........', '........', '#######.', '#.....#.', '.....##.', '....###.', '...###..', '..###...', '.###....', '###.....', '###....#', '#######.', '......#.', '........', '........', '........', '........'],
  ' ': Array.from({ length: 20 }, () => '.......'),
};

/** Words set in a pixel face, a pixel apart. */
function lettering(text: string, glyphs: Record<string, readonly string[]>, ink: string): Sprite {
  const set = [...text].map((ch) => glyphs[ch]);
  const rows = set[0].map((_, y) => set.map((glyph) => glyph[y].replaceAll('#', 'k')).join('.'));
  return { rows, palette: { k: ink } };
}

/** The masthead, without the glyphs' empty top row. */
export const MASTHEAD: Sprite = (({ rows, palette }) => ({ rows: rows.slice(1), palette }))(lettering('The Registry Gazette', TEXTURA, '#161512'));

/** A ring round a face on a press photo, as papers ring them: an ellipse in the paper's white, edged in its ink. */
function ring(width: number, height: number): Sprite {
  const [cx, cy, rx, ry] = [(width - 1) / 2, (height - 1) / 2, width / 2, height / 2];
  const inside = (x: number, y: number, r: number) => ((x - cx) / (rx - r)) ** 2 + ((y - cy) / (ry - r)) ** 2 <= 1;
  const band = (x: number, y: number) => (!inside(x, y, 0) ? '.' : !inside(x, y, 1) ? 'k' : !inside(x, y, 3) ? 'w' : !inside(x, y, 4) ? 'k' : '.');
  const rows = Array.from({ length: height }, (_, y) => Array.from({ length: width }, (_, x) => band(x, y)).join(''));
  return { rows, palette: { k: '#161512', w: '#f1efe6' } };
}

/** Round a face on the Gazette's photo (24 by 26 art pixels in its frame), clear of it. */
export const PHOTO_RING: Sprite = ring(34, 36);

/** The Ministry of Humanity's seal, at the head of its letters: a person in a ring. */
export const CREST: Sprite = {
  rows: [
    '.....gggggg.....',
    '...gg......gg...',
    '..g..........g..',
    '.g.....gg.....g.',
    '.g....gggg....g.',
    'g.....gggg.....g',
    'g......gg......g',
    'g....gggggg....g',
    'g...gggggggg...g',
    'g...g.gggg.g...g',
    'g.....gggg.....g',
    '.g....g..g....g.',
    '.g....g..g....g.',
    '..g..........g..',
    '...gg......gg...',
    '.....gggggg.....',
  ],
  palette: { g: '#28452f' },
};

/** The seal printed pale on the Ministry's own green, as on its poster. */
export const CREST_LIGHT: Sprite = { rows: CREST.rows, palette: { g: '#e4e9dc' } };

/** Likeness Robotics' mark, on its letters and envelopes: a face, pleased to meet you. */
export const LIKENESS_MARK: Sprite = {
  rows: [
    '..ccccccc..',
    '.cc.....cc.',
    'cc.......cc',
    'c..cc.cc..c',
    'c..cc.cc..c',
    'c.........c',
    'c.c.....c.c',
    'cc.ccccc.cc',
    '.cc.....cc.',
    '..ccccccc..',
  ],
  palette: { c: '#b9573a' },
};

/** An envelope's flap, folded down in a V, a shade lighter than the envelope and edged a shade darker. */
function flap(width: number, depth: number): Sprite {
  const half = (width - 1) / 2;
  const rows = Array.from({ length: depth }, (_, y) =>
    Array.from({ length: width }, (_, x) => {
      const edge = Math.round(((half - Math.abs(x - half)) / half) * (depth - 1));
      return y < edge ? 'f' : y === edge ? 'e' : '.';
    }).join(''),
  );
  return { rows, palette: { f: '#e3cb96', e: '#8c6f3c' } };
}

/** Likeness's envelope is 308 design pixels inside its edge: the flap spans it. */
export const ENVELOPE_FLAP: Sprite = flap(154, 16);

/**
 * The Ministry's poster capitals, for the notice board's title: heavy block letters 20 rows tall, with
 * 4-pixel stems and bars and corners cut a pixel at a time.
 */
const BLOCK: Record<string, readonly string[]> = {
  P: ['###########...', '############..', '#############.', '##############', ...Array(5).fill('####......####'), '##############', '#############.', '############..', '###########...', ...Array(7).fill('####..........')],
  R: ['###########...', '############..', '#############.', '##############', ...Array(5).fill('####......####'), '##############', '#############.', '############..', '###########...', '####...####...', '####....####..', '####....####..', '####.....####.', '####.....####.', '####......####', '####......####'],
  O: ['..##########..', '.############.', '##############', '##############', ...Array(12).fill('####......####'), '##############', '##############', '.############.', '..##########..'],
  F: [...Array(4).fill('#############'), ...Array(4).fill('####.........'), ...Array(4).fill('##########...'), ...Array(8).fill('####.........')],
  H: [...Array(8).fill('####......####'), ...Array(4).fill('##############'), ...Array(8).fill('####......####')],
  U: [...Array(16).fill('####......####'), '##############', '##############', '.############.', '..##########..'],
  M: ['####..........####', '#####........#####', '######......######', '#######....#######', '########..########', '####.########.####', '####..######..####', '####...####...####', '####....##....####', ...Array(11).fill('####..........####')],
  A: ['..##########..', '.############.', '##############', '##############', ...Array(5).fill('####......####'), ...Array(4).fill('##############'), ...Array(7).fill('####......####')],
  N: ['#####.....####', '#####.....####', '######....####', '######....####', '#######...####', '#######...####', '########..####', '########..####', '####.####.####', '####.####.####', '####..########', '####..########', '####...#######', '####...#######', '####....######', '####....######', '####.....#####', '####.....#####', '####......####', '####......####'],
  I: Array(20).fill('####'),
  T: [...Array(4).fill('##############'), ...Array(16).fill('.....####.....')],
  Y: [...Array(7).fill('####......####'), '#####....#####', '.############.', '..##########..', '...########...', '....######....', ...Array(8).fill('.....####.....')],
  ' ': Array(20).fill('........'),
};

/**
 * Words painted as a poster's title: each letter lit along its top edges and a shade darker in its lower
 * half, then outlined and cast down to the right by `depth` pixels, lit from the top left as the desk is.
 */
function posterLettering(text: string, colors: { lit: string; face: string; low: string; edge: string }, depth = 2): Sprite {
  const set = [...text].map((ch) => BLOCK[ch]);
  const height = set[0].length;
  const mask = Array.from({ length: height }, (_, y) => set.map((glyph) => glyph[y]).join('..'));
  const width = mask[0].length;
  const ink = (x: number, y: number) => y >= 1 && y <= height && mask[y - 1][x - 1] === '#';
  const cast = (x: number, y: number) => Array.from({ length: depth }, (_, d) => ink(x - d - 1, y - d - 1)).some(Boolean);
  const near = (x: number, y: number) => [-1, 0, 1].some((dy) => [-1, 0, 1].some((dx) => ink(x + dx, y + dy) || cast(x + dx, y + dy)));
  const rows = Array.from({ length: height + 2 + depth }, (_, y) =>
    Array.from({ length: width + 2 + depth }, (_, x) => {
      if (ink(x, y)) return !ink(x, y - 1) ? 't' : y <= height / 2 ? 'f' : 'l';
      return cast(x, y) || near(x, y) ? 'e' : '.';
    }).join(''),
  );
  return { rows, palette: { t: colors.lit, f: colors.face, l: colors.low, e: colors.edge } };
}

/** "Proof of Humanity", as the Ministry's poster on the notice board has it. */
export const POSTER_TITLE: Sprite = posterLettering('PROOF OF HUMANITY', { lit: '#f5f4ef', face: '#e4e9dc', low: '#b9c6ad', edge: '#121411' });

/** A drawing pin, from above: a round head lit from the top left, and the hard shadow it casts on what it holds. */
function pin(palette: { o: string; d: string; m: string; h: string; w: string }): Sprite {
  return {
    rows: [
      '..oooo....',
      '.ohhmmo...',
      'ohwhmmdo..',
      'ohhmmmdos.',
      'ommmmmdos.',
      'ommmmddos.',
      '.oddddoss.',
      '..oooosss.',
      '...sssss..',
      '..........',
    ],
    palette: { ...palette, s: '#00000059' },
  };
}

export const PIN_RED: Sprite = pin({ o: '#4a120f', d: '#7f2a23', m: '#b0302a', h: '#d05a50', w: '#f2b0a4' });
export const PIN_BRASS: Sprite = pin({ o: '#4a3312', d: '#8a6220', m: '#c28f36', h: '#e2b75c', w: '#fbeec4' });

/** The night shift's padlock, on its notice until a week has ended with a letter: a steel shackle, a brass body. */
export const PADLOCK: Sprite = {
  rows: [
    '...ssss...',
    '..s....s..',
    '.s......s.',
    '.s......s.',
    '.s......s.',
    'oooooooooo',
    'obbbbbbbbo',
    'obbbkkbbbo',
    'obbbkkbbbo',
    'obbbbkbbbo',
    'oddddddddo',
    'oooooooooo',
  ],
  palette: { s: '#9ba5a8', o: '#4a3312', b: '#c28f36', d: '#8a6220', k: '#4a3312' },
};

/** A crescent moon over the night shift's notice. */
export const MOON: Sprite = {
  rows: ['...mmmm..', '.mmmm....', '.mmm.....', 'mmm......', 'mmm......', 'mmm......', 'mmmm.....', '.mmmm...m', '..mmmmmm.', '...mmm...'],
  palette: { m: '#e9dcb6' },
};

/** A steel paperclip, standing, as it holds one letter to another by their top edges. */
export const PAPERCLIP: Sprite = {
  rows: [
    '..www..',
    '.w...w.',
    'w.....w',
    'w...w.w',
    'w.w.w.w',
    'w.w.w.w',
    'w.w.w.w',
    'w.w.w.w',
    'w.w.w.w',
    'w.w.w.w',
    'w.w.w.w',
    'w.w.w.w',
    'w.w.w.w',
    'w.w.w.w',
    'w.w.w.w',
    'w.w.w.w',
    '.w..w.w',
    '....w.w',
    '....w.w',
    '.....w.',
  ],
  palette: { w: '#2e3438' },
};

/**
 * The court's gavel, lying across the bench at an angle: an oak head with a brass band near each face, its
 * lower face resting on the sound block, and the handle running down to the right. Lit from the top left.
 */
export const GAVEL: Sprite = (() => {
  const part = (x: number, y: number): string | null => {
    const [u, v] = [x + y, x - y];
    if (u >= 10 && u <= 14 && v >= -7 && v <= 7) return Math.abs(v) === 5 ? (u === 10 ? 'B' : 'b') : u === 10 ? 'h' : u === 14 ? 'd' : 'm';
    if (u >= 15 && u <= 31 && v >= -1 && v <= 1) return v === -1 ? 'h' : v === 1 ? 'd' : 'm';
    if (y >= 14 && y <= 16 && x >= 1 && x <= 9) return y === 14 ? 'K' : 'k';
    return null;
  };
  const rows = Array.from({ length: 18 }, (_, y) =>
    Array.from({ length: 18 }, (_, x) => part(x, y) ?? ([[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => part(x + dx, y + dy)) ? 'o' : '.')).join(''),
  );
  return { rows, palette: { o: '#2f2117', h: '#b48a5e', m: '#8a6545', d: '#5f432d', b: '#c28f36', B: '#e2b75c', K: '#6b4e36', k: '#4a3626' } };
})();

/** A sprite at one art pixel to two design pixels, for decoration: screen readers are told nothing. */
export const DeskSprite = memo(function DeskSprite({ sprite, className }: { sprite: Sprite; className?: string }) {
  const image = spriteImage(sprite);
  return (
    <svg
      className={className}
      viewBox={`0 0 ${image.width} ${image.height}`}
      width={image.width * 2}
      height={image.height * 2}
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {pixelPaths(image).map(({ color, d }) => (
        <path key={color} fill={color} d={d} />
      ))}
    </svg>
  );
});
