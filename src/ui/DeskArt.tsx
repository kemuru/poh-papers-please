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
