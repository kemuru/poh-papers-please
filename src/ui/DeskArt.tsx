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
