// Rasterises a Portrait into a 40x48 pixel image. Pure: the same spec and pose
// always give the same pixels, and nothing here is random. The head is drawn first
// and returns anchors (eye, brow and mouth rows...); everything worn is placed from
// those anchors, so any accessory fits any head. An android is drawn as a human:
// nothing in its face gives it away, except, in a video frame with its eyes shut, its night lamp.
import type { Accessory, HairStyle, HeadShape, Pose, Portrait } from './portrait';
import {
  BROWS, CLOTH, EYES, EYE_WHITE, HAIR, INK, IRIS, LAMPS, MOUTHS, MOUTH_INSIDE, MOUTH_OPEN,
  NOSES, PROPS, SKIN, SLEEP_MASK_EYE, SWEAT_DROP, TEETH, type Ramp,
} from './portraitParts';

export const PORTRAIT_WIDTH = 40;
export const PORTRAIT_HEIGHT = 48;

/** Row-major pixel colours, null where transparent. */
export type PixelImage = { width: number; height: number; pixels: (string | null)[] };

export function drawPortrait(portrait: Portrait, pose: Partial<Pose> = {}): PixelImage {
  const c: Canvas = new Array(W * H).fill(null);
  const p: Pose = { eyes: 'open', mouth: 'closed', ...pose };
  const a = drawHuman(c, portrait, p);
  drawAccessories(c, portrait, a, p);
  return { width: W, height: H, pixels: c };
}

const W = PORTRAIT_WIDTH;
const H = PORTRAIT_HEIGHT;
const CX = W / 2; // faces are symmetric around the line between columns 19 and 20

type Canvas = (string | null)[];
type Mask = Uint8Array;

/** Where this head's parts are. Everything drawn after the head is placed from these. */
type Anchors = {
  head: Mask;
  top: number;
  chin: number;
  /** Top row of the eye stamps. */
  eyeY: number;
  /** Left column of the viewer's-left eye; the other eye mirrors it. */
  eyeL: number;
  eyeW: number;
  /** Bottom row of the eyebrows. */
  browY: number;
  /** Top row of the mouth. */
  mouthY: number;
  neckHalf: number;
  /** Exposed skin: neck, hands, bare shoulders. */
  skin: Ramp;
};

// ---------------------------------------------------------------- masks

const mask = (test: (x: number, y: number) => boolean): Mask => {
  const m = new Uint8Array(W * H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (test(x, y)) m[y * W + x] = 1;
  return m;
};
const has = (m: Mask, x: number, y: number) => x >= 0 && x < W && y >= 0 && y < H && m[y * W + x] === 1;
const union = (...ms: Mask[]) => ms.reduce((out, m) => out.map((v, i) => v | m[i]), new Uint8Array(W * H));
const within = (a: Mask, b: Mask) => a.map((v, i) => v & b[i]);
const minus = (a: Mask, b: Mask) => a.map((v, i) => v & (1 - b[i]));
const mirror = (m: Mask) => mask((x, y) => has(m, W - 1 - x, y));
const sym = (m: Mask) => union(m, mirror(m));
/** The 1px border just outside m. 4-connected, so diagonal edges stay thin. */
const ring = (m: Mask) =>
  mask((x, y) => !has(m, x, y) && (has(m, x - 1, y) || has(m, x + 1, y) || has(m, x, y - 1) || has(m, x, y + 1)));
const grow = (m: Mask, n: number) => {
  let out = m;
  for (let i = 0; i < n; i++) out = union(out, ring(out));
  return out;
};
/** Pixels of m whose neighbour at (dx, dy) is outside m: the edge facing that way. */
const edge = (m: Mask, dx: number, dy: number) => mask((x, y) => has(m, x, y) && !has(m, x + dx, y + dy));
const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  mask((x, y) => ((x + 0.5 - cx) / rx) ** 2 + ((y + 0.5 - cy) / ry) ** 2 <= 1);
const box = (x0: number, y0: number, x1: number, y1: number) => mask((x, y) => x >= x0 && x <= x1 && y >= y0 && y <= y1);
const rows = (y0: number, y1: number) => box(0, y0, W - 1, y1);
/** Filled triangle; corners are pixel coordinates. */
const triangle = (ax: number, ay: number, bx: number, by: number, cx: number, cy: number) =>
  mask((x, y) => {
    const d1 = (bx - ax) * (y - ay) - (by - ay) * (x - ax);
    const d2 = (cx - bx) * (y - by) - (cy - by) * (x - bx);
    const d3 = (ax - cx) * (y - cy) - (ay - cy) * (x - cx);
    return (d1 >= 0 && d2 >= 0 && d3 >= 0) || (d1 <= 0 && d2 <= 0 && d3 <= 0);
  });
const fromMid = (x: number) => Math.abs(x + 0.5 - CX);
const rowHalf = (m: Mask, y: number) => {
  let n = 0;
  for (let x = 0; x < W; x++) if (has(m, x, y)) n++;
  return n / 2;
};
const curlDots = mask((x, y) => y % 2 === 0 && (x + y) % 4 === 0);
const stubbleDots = mask((x, y) => (x + 2 * y) % 3 === 0);
/** Blend two #rrggbb colours: t = 0 gives a, t = 1 gives b. */
const mix = (a: string, b: string, t: number) =>
  `#${[1, 3, 5]
    .map((i) => Math.round(parseInt(a.slice(i, i + 2), 16) * (1 - t) + parseInt(b.slice(i, i + 2), 16) * t))
    .map((v) => v.toString(16).padStart(2, '0'))
    .join('')}`;

// ---------------------------------------------------------------- painting

const paint = (c: Canvas, m: Mask, color: string) => {
  for (let i = 0; i < m.length; i++) if (m[i]) c[i] = color;
};
const dot = (c: Canvas, x: number, y: number, color: string) => {
  if (x >= 0 && x < W && y >= 0 && y < H) c[y * W + x] = color;
};
/** Ink outline, base fill, lit upper-left edge, shaded lower-right edge. */
const solid = (c: Canvas, m: Mask, ramp: Ramp) => {
  paint(c, ring(m), INK);
  paint(c, m, ramp.base);
  paint(c, edge(m, -1, -1), ramp.hi);
  paint(c, edge(m, 1, 1), ramp.lo);
};
const stamp = (c: Canvas, art: readonly string[], x: number, y: number, colors: Record<string, string>, flip = false) => {
  art.forEach((row, dy) => {
    for (let i = 0; i < row.length; i++) {
      const ch = row[flip ? row.length - 1 - i : i];
      if (ch !== '.') dot(c, x + i, y + dy, colors[ch]);
    }
  });
};
/** Stamp at x on the viewer's left and its mirror image on the right. */
const pair = (c: Canvas, art: readonly string[], x: number, y: number, colors: Record<string, string>) => {
  stamp(c, art, x, y, colors);
  stamp(c, art, W - x - art[0].length, y, colors, true);
};
const centred = (c: Canvas, art: readonly string[], y: number, colors: Record<string, string>) =>
  stamp(c, art, CX - Math.floor(art[0].length / 2), y, colors);
const line = (c: Canvas, x0: number, y0: number, x1: number, y1: number, color: string) => {
  const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
  for (let i = 0; i <= steps; i++) {
    dot(c, Math.round(x0 + ((x1 - x0) * i) / steps), Math.round(y0 + ((y1 - y0) * i) / steps), color);
  }
};
// ---------------------------------------------------------------- humans

const HEADS: Record<HeadShape, { half: number; height: number; chin: number; lower: 'round' | 'square' | 'taper' }> = {
  oval: { half: 10, height: 25, chin: 3, lower: 'round' },
  round: { half: 11, height: 24, chin: 5, lower: 'round' },
  square: { half: 11, height: 25, chin: 6, lower: 'square' },
  long: { half: 9, height: 27, chin: 3, lower: 'round' },
  heart: { half: 11, height: 25, chin: 2, lower: 'taper' },
  wide: { half: 12, height: 24, chin: 6, lower: 'square' },
};
const EARS = { small: [1.6, 2.4], normal: [2, 3], big: [2.6, 3.6] } as const;

function humanAnchors(p: Portrait): Anchors {
  const s = HEADS[p.face.shape];
  const chin = 33;
  const top = chin - s.height + 1;
  // Half-width per row: a dome for the cranium, straight sides, then the lower face narrowing to the chin.
  const halfWidth = (y: number) => {
    const t = (y - top + 0.5) / s.height;
    if (t < 0 || t > 1) return 0;
    if (t < 0.42) return s.half * Math.sqrt(1 - ((0.42 - t) / 0.42) ** 2);
    if (t < 0.62) return s.half;
    const u = (t - 0.62) / 0.38;
    const k = s.lower === 'square' ? 1 - u ** 3 : s.lower === 'taper' ? 1 - u : Math.sqrt(1 - u * u);
    return s.chin + (s.half - s.chin) * k;
  };
  const eyeY = top + Math.round(s.height * 0.46);
  return {
    head: mask((x, y) => fromMid(x) <= Math.round(halfWidth(y))),
    top,
    chin,
    eyeY,
    eyeL: CX - (s.half >= 11 ? 3 : 2) - 4,
    eyeW: 4,
    browY: eyeY - 2,
    mouthY: eyeY + 7,
    neckHalf: s.half >= 11 ? 5 : 4,
    skin: SKIN[p.face.skin],
  };
}

function drawHuman(c: Canvas, p: Portrait, pose: Pose): Anchors {
  const a = humanAnchors(p);
  const skin = SKIN[p.face.skin];
  const hair = HAIR[p.hairColor];
  const shape = hairShape(p.hair, a);
  if (shape.back) {
    solid(c, shape.back, hair);
    if (shape.curls) paint(c, within(minus(shape.back, edge(shape.back, 1, 1)), curlDots), hair.lo);
  }
  drawBody(c, p, a);
  if (!shape.coversEars) {
    const [rx, ry] = EARS[p.face.ears];
    const side = CX - rowHalf(a.head, a.eyeY + 1);
    solid(c, sym(ellipse(side, a.eyeY + 2, rx, ry)), skin);
    paint(c, sym(box(side - 1, a.eyeY + 1, side - 1, a.eyeY + 2)), skin.lo);
  }
  solid(c, a.head, skin);
  paint(c, within(edge(a.head, 2, 0), rows(a.browY, a.chin)), skin.lo);
  drawFace(c, p, a, pose);
  drawFacialHair(c, p, a);
  if (shape.front) {
    if (p.hair === 'buzz') {
      paint(c, shape.front, mix(skin.base, hair.base, 0.6));
      paint(c, within(shape.front, stubbleDots), hair.lo);
    } else {
      solid(c, shape.front, hair);
      if (shape.curls) paint(c, within(minus(shape.front, edge(shape.front, 1, 1)), curlDots), hair.lo);
    }
  }
  return a;
}

/** Head grown by `grown` pixels and cut at the hairline: `fringe` over the forehead, `sides` at the temples. */
function cap(a: Anchors, grown: number, fringe: number | ((x: number) => number), sides: number): Mask {
  const g = grow(a.head, grown);
  const temple = rowHalf(a.head, a.eyeY) - 3;
  return mask((x, y) => has(g, x, y) && y <= (fromMid(x) > temple ? sides : typeof fringe === 'number' ? fringe : fringe(x)));
}

type HairShape = { back?: Mask; front?: Mask; coversEars?: boolean; curls?: boolean };

function hairShape(style: HairStyle, a: Anchors): HairShape {
  const { top, browY, eyeY, chin } = a;
  const half = rowHalf(a.head, eyeY);
  const fringe = browY - 3; // keeps the hairline's outline clear of two-row brows
  switch (style) {
    case 'bald':
      return {};
    case 'buzz':
      return { front: cap(a, 0, fringe, eyeY - 2) };
    case 'short':
      return { front: cap(a, 1, fringe, eyeY - 1) };
    case 'side-part':
      return { front: cap(a, 1, (x) => Math.min(fringe, browY - 6 + Math.floor((x - 8) / 5)), eyeY - 1) };
    case 'curly':
      return { front: cap(a, 2, fringe, eyeY), curls: true };
    case 'afro':
      return {
        back: within(ellipse(CX, top + 6, half + 6, 12), rows(0, eyeY + 3)),
        front: cap(a, 1, fringe, eyeY),
        coversEars: true,
        curls: true,
      };
    case 'long':
      return {
        back: union(ellipse(CX, top + 8, half + 3, 9), box(CX - half - 3, top + 8, CX + half + 2, 44)),
        front: cap(a, 1, fringe, eyeY + 3),
        coversEars: true,
      };
    case 'bob':
      return {
        back: union(ellipse(CX, top + 8, half + 3, 9), box(CX - half - 3, top + 8, CX + half + 2, chin - 3)),
        front: cap(a, 1, fringe, eyeY + 3),
        coversEars: true,
      };
    case 'bun':
      return { back: ellipse(CX, top - 1, 4, 3.5), front: cap(a, 1, fringe, eyeY - 2) };
    case 'mohawk':
      return { front: within(grow(a.head, 4), mask((x, y) => fromMid(x) <= 2 && y <= fringe - 1)) };
    case 'receding':
      return { front: within(cap(a, 1, eyeY - 1, eyeY - 1), mask((x, y) => fromMid(x) > half - 4 && y >= top + 5)) };
    case 'spiky': {
      const spikes = [-8, -4, 0, 4, 8].map((dx) => triangle(CX + dx - 3, top + 2, CX + dx, top - 4 + Math.abs(dx) / 2, CX + dx + 2, top + 2));
      return { front: union(cap(a, 1, fringe, eyeY - 1), ...spikes) };
    }
    case 'pompadour':
      return { front: union(cap(a, 1, fringe, eyeY - 1), within(ellipse(CX + 1, top + 1, half - 1, 4.5), rows(0, top + 3))) };
    case 'bowl':
      return { front: cap(a, 1, fringe, fringe) };
  }
}

function drawFace(c: Canvas, p: Portrait, a: Anchors, pose: Pose) {
  const f = p.face;
  const skin = SKIN[f.skin];
  const colors = {
    k: INK, w: EYE_WHITE, i: IRIS[f.eyeColor], d: INK, g: EYE_WHITE, b: HAIR[p.hairColor].lo,
    s: skin.lo, h: skin.hi, l: skin.lip, m: MOUTH_INSIDE, t: TEETH,
  };
  pair(c, EYES[f.eyes][pose.eyes], a.eyeL, a.eyeY, colors);
  const brow = BROWS[f.brows];
  pair(c, brow, a.eyeL + a.eyeW - brow[0].length, a.browY - brow.length + 1, colors);
  if (f.brows === 'unibrow') paint(c, box(a.eyeL + a.eyeW, a.browY, W - a.eyeL - a.eyeW - 1, a.browY), colors.b);
  centred(c, NOSES[f.nose], a.eyeY + 2, colors);
  centred(c, pose.mouth === 'open' ? MOUTH_OPEN : MOUTHS[f.mouth], a.mouthY, colors);

  const both = (x: number, y: number, color: string) => {
    dot(c, x, y, color);
    dot(c, W - 1 - x, y, color);
  };
  if (f.age === 'old') {
    both(a.eyeL - 1, a.eyeY + 1, skin.lo);
    both(a.eyeL - 1, a.eyeY + 2, skin.lo);
    both(CX - 5, a.eyeY + 5, skin.lo);
    both(CX - 5, a.eyeY + 6, skin.lo);
    paint(c, box(CX - 3, a.browY - 2, CX + 2, a.browY - 2), skin.lo);
  }
  if (f.mark === 'freckles') {
    for (const [dx, dy] of [[0, 4], [2, 4], [1, 5], [3, 5]]) both(a.eyeL + dx, a.eyeY + dy, skin.deep);
  } else if (f.mark === 'mole') {
    dot(c, CX + 4, a.mouthY - 1, skin.deep);
  } else if (f.mark === 'blush') {
    paint(c, sym(box(a.eyeL, a.eyeY + 4, a.eyeL + 2, a.eyeY + 4)), skin.lip);
  } else if (f.mark === 'scar') {
    line(c, W - a.eyeL - 3, a.browY - 2, W - a.eyeL, a.eyeY + 3, skin.lip);
  }
}

function drawFacialHair(c: Canvas, p: Portrait, a: Anchors) {
  const hair = HAIR[p.hairColor];
  const mouthHole = box(CX - 3, a.mouthY, CX + 2, a.mouthY + 2);
  const mustache = minus(box(CX - 4, a.mouthY - 2, CX + 3, a.mouthY - 1), sym(box(CX - 4, a.mouthY - 2, CX - 4, a.mouthY - 2)));
  const soft = (m: Mask) => {
    paint(c, m, hair.base);
    paint(c, edge(m, 0, 1), hair.lo);
  };
  switch (p.facialHair) {
    case 'none':
      return;
    case 'stubble': {
      const halves = Array.from({ length: H }, (_, y) => rowHalf(a.head, y));
      const stubbled = mask((x, y) => y >= a.mouthY - 2 || (y >= a.eyeY + 4 && fromMid(x) > halves[y] - 3));
      paint(c, within(minus(within(a.head, stubbled), mouthHole), stubbleDots), mix(SKIN[p.face.skin].base, hair.lo, 0.45));
      return;
    }
    case 'mustache':
      soft(mustache);
      return;
    case 'goatee':
      soft(minus(union(mustache, box(CX - 3, a.mouthY + 1, CX + 2, a.chin + 1)), mouthHole));
      return;
    case 'beard': {
      const side = rowHalf(a.head, a.eyeY + 3) - 3;
      const sides = mask((x, y) => y >= a.mouthY - 2 || (y >= a.eyeY + 3 && fromMid(x) > side));
      const beard = minus(union(within(grow(a.head, 1), sides), ellipse(CX, a.chin, rowHalf(a.head, a.chin - 3) + 1, 3)), mouthHole);
      paint(c, ring(union(beard, mouthHole)), INK);
      paint(c, beard, hair.base);
      paint(c, edge(beard, 1, 1), hair.lo);
      paint(c, within(minus(beard, edge(beard, 1, 1)), curlDots), hair.lo);
      return;
    }
  }
}

// ---------------------------------------------------------------- bodies

const SHOULDERS = [2, 6, 14, 16, 17, 18, 18, 19, 19, 19, 19, 19]; // half-widths from row 36 down; first two add to the neck
const coatGap = mask((x, y) => y >= 38 && fromMid(x) <= 1 + (y - 38) * 0.5);

function drawBody(c: Canvas, p: Portrait, a: Anchors) {
  const cloth = CLOTH[p.outfitColor];
  const n = a.neckHalf;
  const body = mask((x, y) => y >= 36 && fromMid(x) <= (y < 38 ? n + SHOULDERS[y - 36] : SHOULDERS[y - 36]));
  const neck = box(CX - n, a.chin - 4, CX + n - 1, 40);
  if (p.outfit === 'hoodie') solid(c, within(ellipse(CX, 36, n + 7, 4), rows(0, 38)), cloth);
  solid(c, neck, a.skin);
  paint(c, within(neck, rows(a.chin + 1, a.chin + 2)), a.skin.lo);
  solid(c, body, p.outfit === 'toga' ? a.skin : cloth);
  const neckline = (rx: number, ry: number) => {
    const hole = within(ellipse(CX, 35.5, rx, ry), body);
    paint(c, within(ring(hole), body), cloth.lo);
    paint(c, hole, a.skin.base);
  };
  switch (p.outfit) {
    case 'tshirt':
      neckline(n + 1.5, 3);
      return;
    case 'sweater':
      paint(c, within(ellipse(CX, 35.5, n + 2.5, 4), body), cloth.lo);
      neckline(n + 0.5, 2);
      return;
    case 'hoodie':
      neckline(n + 0.5, 2.5);
      paint(c, sym(box(CX - 3, 38, CX - 3, 43)), cloth.hi);
      return;
    case 'turtleneck':
      solid(c, box(CX - n - 1, a.chin - 1, CX + n, 37), cloth);
      paint(c, box(CX - n, 35, CX + n - 1, 35), cloth.lo);
      return;
    case 'shirt':
      paint(c, within(mask((x, y) => y <= 39 && fromMid(x) <= 39.5 - y), body), a.skin.base);
      solid(c, sym(triangle(CX - n - 3, 36, CX - 2, 36, CX - 3, 39)), cloth);
      paint(c, box(CX - 1, 41, CX - 1, 41), cloth.lo);
      paint(c, box(CX - 1, 44, CX - 1, 44), cloth.lo);
      return;
    case 'suit': {
      const v = within(mask((x, y) => fromMid(x) <= 3.5 - (y - 36) * 0.25), body);
      paint(c, within(ring(v), body), cloth.lo);
      paint(c, v, PROPS.shirt);
      paint(c, box(CX - 1, 37, CX, 47), PROPS.tie);
      return;
    }
    case 'trenchcoat':
      solid(c, sym(triangle(CX - n - 1, a.chin - 3, CX - n - 8, 39, CX - 2, 40)), cloth);
      paint(c, within(ring(coatGap), body), cloth.lo);
      paint(c, within(coatGap, body), PROPS.shirt);
      for (const y of [41, 44]) paint(c, sym(box(CX - 6, y, CX - 6, y)), cloth.lo);
      return;
    case 'toga': {
      const drape = within(body, mask((x, y) => x <= 12 + (y - 36) * 1.6));
      solid(c, drape, cloth);
      paint(c, within(minus(drape, edge(drape, 1, 1)), mask((x, y) => (x + Math.round(y * 0.6)) % 5 === 0)), cloth.lo);
      return;
    }
  }
}

// ---------------------------------------------------------------- accessories

/** The first row with anything drawn down the middle: the top of the hair, or of the head. */
function topRow(c: Canvas) {
  let top = 0;
  while (top < H - 1 && c.slice(top * W + CX - 4, top * W + CX + 4).every((px) => px === null)) top++;
  return top;
}

function drawAccessories(c: Canvas, p: Portrait, a: Anchors, pose: Pose) {
  const wears = (item: Accessory) => p.accessories.includes(item);
  const side = rowHalf(a.head, a.eyeY + 1);
  const both = (x: number, y: number, color: string) => {
    dot(c, x, y, color);
    dot(c, W - 1 - x, y, color);
  };

  if (wears('earrings')) {
    const x = Math.round(CX - side) - 2;
    both(x, a.eyeY + 5, PROPS.gold.hi);
    both(x, a.eyeY + 6, PROPS.gold.lo);
  }
  if (wears('pearls')) {
    const n = a.neckHalf + 1.5;
    for (let x = Math.floor(CX - n); x < CX + n; x++) {
      const y = 36 + Math.round(2.5 * (1 - ((x + 0.5 - CX) / n) ** 2));
      dot(c, x, y, x % 2 === 0 ? PROPS.pearl : INK); // dark string between pearls reads on any collar
    }
  }
  if (wears('glasses')) {
    const { eyeL: l, eyeW: w, eyeY: y } = a;
    paint(c, sym(minus(box(l - 1, y - 1, l + w, y + 2), box(l, y, l + w - 1, y + 1))), PROPS.frame);
    paint(c, box(l + w + 1, y, W - l - w - 2, y), PROPS.frame);
    paint(c, sym(box(Math.round(CX - side), y, l - 2, y)), PROPS.frame);
  }
  if (wears('monocle')) {
    const mx = a.eyeL + a.eyeW / 2;
    const my = a.eyeY + 1;
    const lens = ellipse(mx, my, 3.5, 3.5);
    const rim = minus(lens, ellipse(mx, my, 2.5, 2.5));
    paint(c, ring(lens), INK);
    paint(c, rim, PROPS.gold.base);
    paint(c, within(rim, edge(lens, -1, -1)), PROPS.gold.hi);
    paint(c, within(rim, edge(lens, 1, 1)), PROPS.gold.lo);
    for (let y = my + 4; y <= 41; y++) dot(c, Math.floor(mx) - 3 - Math.floor((y - my - 4) / 3), y, y % 2 ? PROPS.gold.base : PROPS.gold.lo);
  }
  // A hat sits on the head, over any hair piled high, rather than off the top of the frame.
  const hatTop = () => Math.max(topRow(c), a.top - 4);
  if (wears('top-hat')) {
    const brim = hatTop() + 2;
    solid(c, box(CX - 6, brim - 8, CX + 5, brim - 1), PROPS.hat);
    paint(c, box(CX - 6, brim - 2, CX + 5, brim - 1), PROPS.hatBand);
    solid(c, box(CX - 9, brim, CX + 8, brim + 1), PROPS.hat);
  }
  if (wears('flat-cap') || wears('bobble-hat')) {
    const top = hatTop();
    const half = rowHalf(a.head, Math.min(a.browY, top + 6)) + 1;
    const crown = within(ellipse(CX, top + 5, half + 1, 6.5), rows(top - 2, top + 4));
    if (wears('flat-cap')) {
      solid(c, union(crown, box(CX - half - 1, top + 4, CX + half + 3, top + 5)), PROPS.tweed);
      paint(c, box(CX - half, top + 3, CX + half + 2, top + 3), PROPS.tweed.lo);
    } else {
      const hat = union(crown, box(CX - half - 1, top + 3, CX + half, top + 5));
      solid(c, hat, PROPS.knit);
      paint(c, within(hat, mask((x, y) => y >= top + 3 && x % 2 === 0)), PROPS.knit.lo);
      solid(c, ellipse(CX, top - 3, 2.6, 2.4), PROPS.bobble);
    }
  }
  if (p.board === 'phone') {
    // A phone held up in both hands, the address on its lit screen, too small to read in the frame.
    paint(c, box(12, 33, 27, 47), PROPS.phone.body);
    paint(c, box(14, 35, 25, 45), PROPS.phone.screen);
    paint(c, within(box(15, 37, 24, 43), mask((x, y) => (y === 37 || y === 40 || y === 43) && (x * 5 + y) % 6 !== 0)), INK);
    solid(c, sym(ellipse(12, 41, 2.2, 2)), a.skin);
  } else if (p.board) {
    const board = box(4, 35, 35, 47);
    solid(c, board, p.board === 'qr' ? { hi: PROPS.paper, base: PROPS.paper, lo: PROPS.paper } : PROPS.cardboard);
    if (p.board === 'qr') {
      // Three corner squares and a pattern of dots, as on any square of dots.
      for (const [x0, y0] of [[7, 36], [28, 36]]) paint(c, minus(box(x0, y0, x0 + 4, y0 + 4), box(x0 + 1, y0 + 1, x0 + 3, y0 + 3)), INK);
      paint(c, minus(box(7, 42, 11, 46), box(8, 43, 10, 45)), INK);
      paint(c, within(box(14, 36, 26, 46), mask((x, y) => (x * 7 + y * 13) % 5 < 2)), INK);
    } else {
      paint(c, within(box(7, 38, 32, 44), mask((x, y) => (y === 38 || y === 41 || y === 44) && (x * 5 + y) % 7 !== 0)), INK);
    }
    solid(c, sym(ellipse(4, 36, 2.2, 2)), a.skin);
  }
  if (wears('robot-helmet')) {
    // A party costume's robot head, carried under the arm on the viewer's right,
    // in front of any sign. It is not a face.
    const helmet = union(box(28, 38, 38, 47), box(29, 37, 37, 37));
    solid(c, helmet, PROPS.helmet);
    paint(c, box(30, 40, 36, 42), PROPS.helmet.visor);
    dot(c, 31, 40, PROPS.helmet.hi);
    paint(c, box(33, 34, 33, 36), PROPS.helmet.lo);
    dot(c, 33, 33, PROPS.helmet.bulb);
  }
  if (wears('sleep-mask')) {
    // Pushed up off the eyes, onto the forehead; the strap goes round the back of the head.
    // One soft band with a dip for the nose, and a closed eye stitched over each eye.
    const y = Math.max(a.browY - 4, a.top + 4);
    const cx = a.eyeL + a.eyeW / 2;
    const band = union(sym(ellipse(cx, y + 0.5, a.eyeW / 2 + 1.5, 1.6)), box(cx, y - 1, W - 1 - cx, y));
    paint(c, minus(within(grow(a.head, 1), rows(y, y)), band), PROPS.sleepMask.lo);
    paint(c, ring(band), INK);
    paint(c, band, PROPS.sleepMask.base);
    paint(c, edge(band, 0, 1), PROPS.sleepMask.lo);
    pair(c, SLEEP_MASK_EYE, Math.round(cx) - 2, y - 1, { s: PROPS.sleepMask.stitch });
  }
  if (wears('sweat')) {
    const colors = { o: PROPS.sweat.lo, h: PROPS.sweat.hi, a: PROPS.sweat.base };
    const half = rowHalf(a.head, a.browY);
    stamp(c, SWEAT_DROP, Math.round(CX - half) - 2, a.browY - 3, colors);
    stamp(c, SWEAT_DROP, Math.round(CX + half) - 1, a.browY - 1, colors);
  }
  if (p.lamp && pose.eyes === 'closed') {
    // A unit's tell: its eyes are cameras, and with the lids shut they are in the dark, so its night
    // lamp comes on between the brows. A camera sees that light as violet-white, falling on the brows
    // and the fringe. On the face's midline, above the eyes: clear of the eyes, the nose and the mouth
    // on every head and under every hair. A white core in a dark ring reads in any colour vision.
    const { art, spill } = LAMPS[p.lamp];
    art.forEach((row, dy) => {
      for (let dx = 0; dx < row.length; dx++) {
        const i = (a.browY - 4 + dy) * W + CX - 4 + dx;
        const px = c[i];
        if (row[dx] === 'c') c[i] = PROPS.lamp.core;
        else if (row[dx] === 'r') c[i] = PROPS.lamp.ring;
        else if (row[dx] === 's' && px) c[i] = mix(px, PROPS.lamp.spill, spill);
      }
    });
  }
  if (p.mark) {
    // A four-pointed sparkle in the top corner, outlined so it shows on any hair or background.
    const star = mask((x, y) => {
      const dx = Math.abs(x - 35);
      const dy = Math.abs(y - 4);
      return (dx === 0 && dy <= 3) || (dy === 0 && dx <= 3) || dx + dy <= 1;
    });
    paint(c, grow(star, 1), PROPS.markEdge);
    paint(c, star, PROPS.pearl);
  }
}
