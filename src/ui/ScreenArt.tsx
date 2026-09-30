// Self-made pixel art for the evening's rooms: the court's empty jury seats and its crest, the adding machine
// that prints the accounts, and the time clock the night shift punches out on. Drawn as the desk's sprites are
// (src/ui/DeskArt.tsx): one string per row, '.' is transparent, every other letter a palette colour, and each
// sprite pixel is one art pixel, 2 design pixels.
import { CREST } from './DeskArt';
import type { Sprite } from './sprites';

/** The Ministry's seal in brass, on the front of the court's bench. */
export const CREST_BRASS: Sprite = { rows: CREST.rows, palette: { g: '#e2b75c' } };

/** A drawing surface for the sprites below: rectangles of palette letters, later ones on top. */
function canvas(width: number, height: number) {
  const grid = Array.from({ length: height }, () => Array<string>(width).fill('.'));
  const put = (x: number, y: number, ch: string) => {
    if (y >= 0 && y < height && x >= 0 && x < width) grid[y][x] = ch;
  };
  const rect = (x: number, y: number, w: number, h: number, ch: string) => {
    for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) put(i, j, ch);
  };
  /** A box: its fill, lit along the top and shaded along the foot, in an outline. */
  const box = (x: number, y: number, w: number, h: number, c: { fill: string; lit?: string; shade?: string; edge: string }) => {
    // An open box ('.' for its fill) is only its outline.
    if (c.fill === '.') {
      rect(x, y, w, 1, c.edge);
      rect(x, y + h - 1, w, 1, c.edge);
      rect(x, y, 1, h, c.edge);
      rect(x + w - 1, y, 1, h, c.edge);
      return;
    }
    rect(x, y, w, h, c.edge);
    rect(x + 1, y + 1, w - 2, h - 2, c.fill);
    if (c.lit) rect(x + 1, y + 1, w - 2, 1, c.lit);
    if (c.shade) rect(x + 1, y + h - 2, w - 2, 1, c.shade);
  };
  return { put, rect, box, rows: () => grid.map((row) => row.join('')) };
}

/**
 * An empty seat in the jury box, the back of its chair over the rail: an oak frame, lit along its top and left,
 * round a panel of the table's green leather with a row of brass studs. A case that came with its evidence
 * needs no jury. 20 by 16 art pixels.
 */
export const EMPTY_SEAT: Sprite = (() => {
  const c = canvas(20, 16);
  c.rect(3, 0, 14, 1, 'o');
  c.rect(1, 1, 18, 1, 'o');
  c.rect(0, 2, 20, 14, 'o');
  c.rect(3, 1, 14, 1, 'h');
  c.rect(1, 2, 18, 13, 'm');
  c.rect(1, 2, 18, 1, 'h');
  c.rect(1, 2, 1, 13, 'h');
  c.rect(18, 3, 1, 12, 'd');
  c.box(3, 4, 14, 12, { fill: 'l', lit: 'L', edge: 'o' });
  for (let stud = 0; stud < 4; stud++) c.put(5 + stud * 3, 5, 'b');
  return { rows: c.rows(), palette: { o: '#2f2117', h: '#b48a5e', m: '#8a6545', d: '#5f432d', l: '#2a382d', L: '#3a4c3e', b: '#e2b75c' } };
})();

/**
 * The adding machine at the back of the desk, seen from the clerk's chair: the paper roll on its arms at the
 * back, the steel cover with the platen's window, the keys (nine rows of figures, a red key and the total
 * bar), the lamp and the maker's plate, the crank at its side, and along its foot the slot the roll comes out
 * of. 320 by 76 art pixels; the slot is the till roll's width (280), centred.
 */
export const ADDING_MACHINE: Sprite = (() => {
  const c = canvas(320, 76);
  // The roll's arms, then the roll: paper, its ends a shade darker, a shadow under its curve.
  c.box(62, 3, 8, 14, { fill: 'S', lit: 'W', edge: 'o' });
  c.box(250, 3, 8, 14, { fill: 'S', lit: 'W', edge: 'o' });
  c.box(68, 0, 184, 13, { fill: 'p', lit: 'p', shade: 'q', edge: 'o' });
  c.rect(69, 8, 182, 3, 'P');
  c.rect(69, 1, 4, 11, 'q');
  c.rect(247, 1, 4, 11, 'q');
  // The cover: steel, lit along its top, the platen's window with the paper running over it.
  c.box(28, 12, 264, 12, { fill: 'S', lit: 'W', shade: 'D', edge: 'o' });
  c.box(96, 15, 128, 6, { fill: 'K', edge: 'o' });
  c.rect(97, 17, 126, 2, 'p');
  // The body: charcoal, lit along its top edge.
  c.box(6, 23, 298, 44, { fill: 'c', lit: 'C', edge: 'o' });
  // Nine columns of figure keys, four rows deep: cream caps, a shade darker at the foot, in black.
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 9; col++) c.box(20 + col * 16, 27 + row * 9, 13, 8, { fill: 'n', shade: 'N', edge: 'o' });
  }
  // The red key and the black one beside the figures, and the long total bar under them.
  c.box(170, 27, 15, 17, { fill: 'r', lit: 'R', shade: 'x', edge: 'o' });
  c.box(170, 45, 15, 17, { fill: 'K', lit: 'k', edge: 'o' });
  c.box(190, 54, 44, 8, { fill: 'b', lit: 'B', shade: 'y', edge: 'Y' });
  // The lamp, lit, and the maker's plate: plain brass, screwed on.
  c.box(190, 28, 6, 6, { fill: 'g', edge: 'o' });
  c.box(204, 27, 88, 11, { fill: 'b', lit: 'B', shade: 'y', edge: 'Y' });
  c.rect(206, 31, 2, 2, 'y');
  c.rect(288, 31, 2, 2, 'y');
  // A vent: dark slits in the body.
  for (let slit = 0; slit < 5; slit++) c.rect(244, 42 + slit * 4, 48, 2, 'k');
  // The crank at the side: a steel arm out of the body and a brass grip.
  c.box(302, 40, 12, 5, { fill: 'S', lit: 'W', edge: 'o' });
  c.box(310, 30, 9, 26, { fill: 'b', lit: 'B', shade: 'y', edge: 'Y' });
  // The front, a shade darker, with the slot the roll comes out of along its foot.
  c.box(6, 66, 298, 10, { fill: 'k', lit: 'C', edge: 'o' });
  c.rect(20, 72, 280, 4, 'K');
  return {
    rows: c.rows(),
    palette: {
      o: '#121411',
      W: '#c4ccce',
      S: '#9ba5a8',
      D: '#4c555a',
      p: '#efeee6',
      P: '#dcdbd0',
      q: '#b4b2a5',
      c: '#363a39',
      C: '#4a4f4d',
      k: '#1c1e1e',
      K: '#121313',
      n: '#e2dfd6',
      N: '#a9a59a',
      r: '#b0302a',
      R: '#d05a50',
      x: '#7f2a23',
      b: '#c28f36',
      B: '#e2b75c',
      y: '#8a6220',
      Y: '#4a3312',
      g: '#8fe07c',
    },
  };
})();

/**
 * The time clock by the staff door, that the night shift punches out on: a steel cabinet with a lit top, the
 * clock's round face (its hour marks, and the hands at three in the morning), the slot the card goes into under
 * a brass lip, and the Ministry's plate. 96 by 112 art pixels.
 */
export const TIME_CLOCK: Sprite = (() => {
  const c = canvas(96, 112);
  c.box(4, 4, 88, 106, { fill: 's', lit: 'S', shade: 'D', edge: 'o' });
  // The cabinet's roof, a step wider, and its foot.
  c.box(0, 0, 96, 8, { fill: 'S', lit: 'W', shade: 's', edge: 'o' });
  c.box(0, 104, 96, 8, { fill: 'D', lit: 's', edge: 'o' });
  // The face: a steel bezel, the white dial, a mark every hour and a longer one every three.
  const [cx, cy] = [47.5, 42.5];
  for (let y = 0; y < 112; y++) {
    for (let x = 0; x < 96; x++) {
      const d = Math.hypot(x - cx, y - cy);
      if (d <= 32) c.put(x, y, d > 30 ? 'o' : d > 27 ? (y < cy ? 'W' : 'D') : d > 26 ? 'o' : 'w');
    }
  }
  for (let hour = 0; hour < 12; hour++) {
    const a = (hour / 12) * 2 * Math.PI;
    const long = hour % 3 === 0 ? 5 : 3;
    for (let r = 25 - long; r <= 24; r++) c.put(Math.round(cx + Math.sin(a) * r), Math.round(cy - Math.cos(a) * r), 'k');
  }
  // Three o'clock: the minute hand up, the hour hand across, and the pin.
  c.rect(47, 22, 2, 21, 'k');
  c.rect(47, 42, 16, 2, 'k');
  c.rect(46, 41, 4, 4, 'r');
  // The card slot under its brass lip, and the Ministry's plate.
  c.box(14, 80, 68, 6, { fill: 'b', lit: 'B', shade: 'y', edge: 'Y' });
  c.rect(18, 86, 60, 4, 'K');
  c.box(30, 94, 36, 6, { fill: 'b', lit: 'B', shade: 'y', edge: 'Y' });
  return {
    rows: c.rows(),
    palette: {
      o: '#121411',
      W: '#c4ccce',
      S: '#9ba5a8',
      s: '#737d82',
      D: '#4c555a',
      w: '#f1efe6',
      k: '#1f1d1a',
      r: '#b0302a',
      K: '#121313',
      b: '#c28f36',
      B: '#e2b75c',
      y: '#8a6220',
      Y: '#4a3312',
    },
  };
})();

/**
 * A card rack beside the time clock: a steel frame of eight slots, every one holding a clerk's clock card, its
 * top edge showing over the slot's lip with a stripe of the shift's colour. The Ministry never closes. 56 by 104
 * art pixels.
 */
export const CARD_RACK: Sprite = (() => {
  const c = canvas(56, 104);
  c.box(0, 0, 56, 104, { fill: 'D', lit: 's', shade: 'K', edge: 'o' });
  for (let slot = 0; slot < 8; slot++) {
    const y = 6 + slot * 12;
    // The card, standing a little proud of its slot, and the slot's steel lip in front of it.
    c.box(8 + ((slot * 5) % 3) * 2, y, 38, 10, { fill: 'c', lit: 'C', edge: 'e' });
    c.rect(12 + ((slot * 5) % 3) * 2, y + 3, 10, 2, slot % 3 === 0 ? 'r' : 'k');
    c.box(4, y + 7, 48, 5, { fill: 'S', lit: 'W', edge: 'o' });
  }
  return {
    rows: c.rows(),
    palette: { o: '#121411', D: '#4c555a', s: '#737d82', K: '#2e3438', S: '#9ba5a8', W: '#c4ccce', c: '#e9dcb6', C: '#f3ead0', e: '#8b7747', r: '#b0302a', k: '#1f1d1a' },
  };
})();

/**
 * The day's bills on the spike at the side of the desk: a weighted steel base, the spike, and three slips run
 * through it (a pink carbon, a buff one and a white one), each ruled with its typed lines. 40 by 76 art pixels.
 */
export const BILL_SPIKE: Sprite = (() => {
  const c = canvas(40, 76);
  // The spike, lit on its left, and the base it stands on.
  c.rect(19, 0, 2, 68, 'S');
  c.rect(19, 0, 1, 68, 'W');
  c.box(3, 66, 34, 10, { fill: 'k', lit: 'D', edge: 'o' });
  // The slips, the lowest first, each pierced where the spike goes through.
  const slip = (x: number, y: number, w: number, h: number, fill: string, edge: string) => {
    c.box(x, y, w, h, { fill, edge });
    for (let line = y + 4; line < y + h - 2; line += 3) c.rect(x + 4, line, w - 10 - ((line * 7) % 6), 1, 't');
    c.rect(19, y + 2, 2, 1, 'o');
  };
  slip(3, 44, 33, 21, 'p', 'P');
  slip(7, 26, 30, 19, 'b', 'B');
  slip(4, 10, 31, 17, 'w', 'l');
  return {
    rows: c.rows(),
    palette: { o: '#121411', S: '#9ba5a8', W: '#c4ccce', D: '#4c555a', k: '#282b2b', p: '#eec8c1', P: '#b7837c', b: '#e9dcb6', B: '#8b7747', w: '#f1efe6', l: '#a9b0b3', t: '#57524a' },
  };
})();

/**
 * The morning's Gazette, folded in half and put down on the desk once read: grey newsprint, the masthead's black
 * letters and the paper's rules at the top, the headline's two lines under them, a photograph in its halftone and
 * the columns beside it; the half under the fold a shade darker. 100 by 64 art pixels.
 */
export const FOLDED_GAZETTE: Sprite = (() => {
  const c = canvas(100, 64);
  c.box(0, 0, 100, 64, { fill: 'n', edge: 'e' });
  // The half under the fold, a shade darker, and the crease.
  c.rect(1, 33, 98, 30, 'N');
  c.rect(1, 32, 98, 1, 'e');
  // The masthead: the textura's black letters, tall and short, in three words.
  const letters = [3, 2, 2, 0, 3, 2, 2, 2, 2, 2, 2, 2, 0, 3, 2, 2, 2, 2, 2, 2];
  let x = 18;
  for (const tall of letters) {
    if (tall === 0) {
      x += 3;
      continue;
    }
    c.rect(x, tall === 3 ? 3 : 4, 2, tall === 3 ? 6 : 5, 'k');
    x += 3;
  }
  // The rules under it, a thick one and a thin one.
  c.rect(4, 11, 92, 2, 'k');
  c.rect(4, 14, 92, 1, 'k');
  // The headline, two lines of the big print.
  for (const [line, width] of [
    [17, 80],
    [21, 56],
  ]) {
    for (let word = 10; word < 10 + width; word += 12) c.rect(word, line, Math.min(9, 10 + width - word), 3, 'k');
  }
  // The photograph in its halftone, framed, and the columns of the story beside it.
  c.box(6, 26, 22, 26, { fill: 'h', edge: 'k' });
  for (let y = 27; y < 51; y += 2) for (let dot = 7 + (y % 4 === 1 ? 1 : 0); dot < 27; dot += 2) c.put(dot, y, 'H');
  for (let line = 27; line < 60; line += 3) {
    if (line > 30 && line < 36) continue;
    c.rect(32, line, 28 - ((line * 5) % 7), 1, 't');
    c.rect(64, line, 30 - ((line * 3) % 5), 1, 't');
  }
  return {
    rows: c.rows(),
    palette: { n: '#c8c6bb', N: '#b8b6ab', e: '#7d7c73', k: '#161512', t: '#6e6c63', h: '#a3a197', H: '#7d7c73' },
  };
})();

/**
 * The day's papers in the out tray: a steel wire tray, and in it the forms of everyone seen today, Form 1's
 * green-grey stock, squared into a stack, the top one's printed lines showing. 88 by 48 art pixels.
 */
export const OUT_TRAY: Sprite = (() => {
  const c = canvas(88, 48);
  // The stack, a sheet at a time from the bottom, each a pixel off the one under it.
  for (let sheet = 0; sheet < 9; sheet++) {
    const y = 26 - sheet * 2;
    c.box(8 + (sheet % 3), y, 68, 8, { fill: 'f', lit: 'F', edge: 'e' });
  }
  // The top sheet's title band and printed lines.
  c.rect(14, 11, 40, 2, 'g');
  for (let line = 0; line < 2; line++) c.rect(14, 15 + line * 3, 52 - line * 14, 1, 'e');
  // The tray: its steel rim, the wires down its front, its foot.
  c.box(0, 22, 88, 20, { fill: '.', edge: 'o' });
  c.rect(1, 23, 86, 1, 'W');
  for (let wire = 7; wire < 84; wire += 7) c.rect(wire, 24, 1, 17, 'S');
  c.rect(1, 40, 86, 1, 'S');
  c.box(3, 42, 82, 6, { fill: 'D', lit: 's', edge: 'o' });
  return {
    rows: c.rows(),
    palette: { o: '#121411', W: '#c4ccce', S: '#9ba5a8', s: '#737d82', D: '#4c555a', f: '#d4dccb', F: '#e4e9dc', e: '#7c8a74', g: '#28452f' },
  };
})();
