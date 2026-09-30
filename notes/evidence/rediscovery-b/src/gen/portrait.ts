// Procedural 32x32 pixel portraits. Pure: the same seed and accessories always give the same SVG.
import { createRng, type Rng } from './rng';

/** Worn on top of the face, painted in this order. They never change the face underneath. */
export const ACCESSORIES = ['fake-beard', 'mustache', 'monocle', 'raccoon-ears'] as const;
export type Accessory = (typeof ACCESSORIES)[number];

const SIZE = 32;
const HEAD_TOP = 6;
const EYE_TOP = 13;

// Every applicant is photographed against the same regulation backdrop.
const BACKDROP = '#c9d2d6';
const EYE_WHITE = '#f4f1ea';
const INK = '#1d1a1a';
const TIE = '#8c2f2f';
const MUSTACHE = '#2a1d15';
const BEARD = { base: '#a0612e', shade: '#7c4721' };
const ELASTIC = '#f2eee6';
const GOLD = '#d9aa2b';
const RACCOON = { g: '#7f8186', d: '#2f2c2c', w: '#e4e4e4' };

const SKINS = [
  { base: '#f6d7bd', shade: '#e0b394', deep: '#ad6f57' },
  { base: '#edc29e', shade: '#d4a07c', deep: '#9f5f47' },
  { base: '#d6a06a', shade: '#bb8452', deep: '#86502f' },
  { base: '#b57a4c', shade: '#98613a', deep: '#683b22' },
  { base: '#8c5a37', shade: '#72462a', deep: '#482815' },
  { base: '#5f3b25', shade: '#4b2d1b', deep: '#2c190d' },
];
const HAIRS = [
  { base: '#2b2522', shade: '#141110' },
  { base: '#4b3222', shade: '#2e1e14' },
  { base: '#7a5234', shade: '#583a24' },
  { base: '#8f3f22', shade: '#672c17' },
  { base: '#d6b25e', shade: '#a9873c' },
  { base: '#a3a3a3', shade: '#767676' },
];
const SHIRTS = [
  { base: '#35486b', shade: '#26344f' },
  { base: '#6f7a80', shade: '#535c61' },
  { base: '#7d5a45', shade: '#5e4232' },
  { base: '#6d7545', shade: '#525833' },
  { base: '#7c3a3a', shade: '#5c2a2a' },
  { base: '#2f6e6c', shade: '#225150' },
];
const HAIR_STYLES = ['bald', 'crop', 'side-part', 'long', 'curly', 'bun'] as const;
const COLLARS = ['crew', 'tie', 'turtleneck'] as const;

// Change in head half-width over the last five rows, down to the chin.
const JAWS = {
  round: [-1, -1, -2, -3, -5],
  square: [0, 0, 0, -1, -3],
  pointed: [-1, -2, -3, -4, -5],
};

// Sprites: one character per pixel, '.' is transparent. Eyes and brows are drawn for the
// left eye and mirrored.
const EYES = {
  bead: ['dd', 'dd'],
  open: ['wd', 'wd'],
  sleepy: ['ss', 'dd'],
  tired: ['dd', 'ss'],
};
const BROWS = {
  flat: ['...', '.bb'],
  raised: ['.bb', '...'],
  stern: ['.b.', '..b'],
  bushy: ['.bb', 'bbb'],
};
const NOSES = {
  button: ['....', '....', '.ss.'],
  long: ['..s.', '..s.', '.ss.'],
  wide: ['....', '....', 'ssss'],
};
const MOUTHS = {
  flat: ['......', '.mmmm.', '......'],
  small: ['......', '..mm..', '......'],
  smile: ['m....m', '.mmmm.', '......'],
  frown: ['......', '.mmmm.', 'm....m'],
};

type Canvas = (string | undefined)[];
type Face = ReturnType<typeof rollFace>;

const pickKey = <T extends object>(rng: Rng, map: T) => rng.pick(Object.keys(map) as (keyof T)[]);

// The draw order is part of the output: reordering these lines changes every portrait.
function rollFace(rng: Rng) {
  const width = rng.int(6, 8);
  return {
    width,
    jaw: pickKey(rng, JAWS),
    skin: rng.pick(SKINS),
    hair: rng.pick(HAIRS),
    hairStyle: rng.pick(HAIR_STYLES),
    eyes: pickKey(rng, EYES),
    eyeGap: rng.int(2, Math.min(3, width - 4)),
    brows: pickKey(rng, BROWS),
    nose: pickKey(rng, NOSES),
    mouth: pickKey(rng, MOUTHS),
    shirt: rng.pick(SHIRTS),
    collar: rng.pick(COLLARS),
  };
}

function dot(c: Canvas, x: number, y: number, color: string) {
  if (x >= 0 && x < SIZE && y >= 0 && y < SIZE) c[y * SIZE + x] = color;
}

/** Paints a pixel and its mirror image across the vertical centre line. */
function pair(c: Canvas, x: number, y: number, color: string) {
  dot(c, x, y, color);
  dot(c, SIZE - 1 - x, y, color);
}

function row(c: Canvas, y: number, x0: number, x1: number, color: string) {
  for (let x = x0; x <= x1; x++) dot(c, x, y, color);
}

/** Paints a row centred on the canvas, `half` pixels to each side of the centre line. */
function span(c: Canvas, y: number, half: number, color: string) {
  row(c, y, SIZE / 2 - half, SIZE / 2 + half - 1, color);
}

function sprite(c: Canvas, x0: number, y0: number, rows: string[], colors: Record<string, string>, mirrored = false) {
  rows.forEach((line, dy) =>
    [...line].forEach((ch, dx) => {
      if (ch !== '.') (mirrored ? pair : dot)(c, x0 + dx, y0 + dy, colors[ch]);
    }),
  );
}

/** Head half-width per row, from the top of the skull (HEAD_TOP) down to the chin. */
function headRows({ width, jaw }: Face): number[] {
  return [width - 3, width - 1, ...Array<number>(10).fill(width), ...JAWS[jaw].map((d) => Math.max(1, width + d))];
}

function drawBody(c: Canvas, { skin, shirt, collar }: Face) {
  for (let y = 20; y <= 25; y++) span(c, y, 3, skin.shade);
  [5, 9, 11, 12, 12, 12, 12].forEach((half, i) => span(c, 25 + i, half, shirt.base));
  if (collar === 'crew') {
    span(c, 25, 3, skin.shade);
    span(c, 26, 2, skin.shade);
    pair(c, 12, 25, shirt.shade);
    pair(c, 13, 26, shirt.shade);
    span(c, 27, 2, shirt.shade);
  } else if (collar === 'tie') {
    [4, 3, 2].forEach((half, i) => span(c, 25 + i, half, EYE_WHITE));
    for (let y = 25; y < SIZE; y++) span(c, y, 1, TIE);
  } else {
    for (let y = 22; y <= 25; y++) span(c, y, 4, y === 24 ? shirt.shade : shirt.base);
  }
}

function drawHead(c: Canvas, face: Face) {
  const { skin, width } = face;
  headRows(face).forEach((half, i) => span(c, HEAD_TOP + i, half, skin.base));
  for (let y = 13; y <= 16; y++) pair(c, SIZE / 2 - width - 1, y, y === 14 || y === 15 ? skin.shade : skin.base);
}

function drawFeatures(c: Canvas, { skin, hair, eyes, eyeGap, brows, nose, mouth }: Face) {
  const eyeX = SIZE / 2 - 2 - eyeGap;
  sprite(c, eyeX, EYE_TOP, EYES[eyes], { d: INK, w: EYE_WHITE, s: skin.shade }, true);
  sprite(c, eyeX - 1, EYE_TOP - 3, BROWS[brows], { b: hair.shade }, true);
  sprite(c, 14, 15, NOSES[nose], { s: skin.shade });
  sprite(c, 13, 18, MOUTHS[mouth], { m: skin.deep });
}

function drawHair(back: Canvas, front: Canvas, { hairStyle, width: w, hair }: Face) {
  const edge = SIZE / 2 - w;
  // A rounded cap from `top` down to the hairline at y = 8.
  const cap = (top: number) => {
    for (let y = top; y <= 8; y++) span(front, y, y === top ? w - 3 : y === top + 1 ? w - 1 : w, hair.base);
  };
  const sideburns = (from: number, to: number, thickness: number) => {
    for (let y = from; y <= to; y++) for (let x = edge - thickness + 1; x <= edge; x++) pair(front, x, y, hair.base);
  };
  switch (hairStyle) {
    case 'bald':
      sideburns(10, 12, 1);
      break;
    case 'crop':
      cap(5);
      sideburns(9, 11, 1);
      break;
    case 'side-part':
      cap(4);
      row(front, 9, edge, edge + 5, hair.base);
      row(front, 10, edge, edge + 2, hair.base);
      dot(front, edge + 4, 4, hair.shade);
      dot(front, edge + 4, 5, hair.shade);
      break;
    case 'long':
      for (let y = 7; y <= 25; y++) span(back, y, w + 1, hair.base);
      cap(5);
      span(front, 9, w, hair.base);
      sideburns(10, 18, 2);
      break;
    case 'curly':
      [w - 3, w - 1, w + 1, w + 2, w + 2, w + 2, w + 2].forEach((half, i) => span(front, 2 + i, half, hair.base));
      sideburns(9, 12, 3);
      front.forEach((color, i) => {
        if (color && ((i % SIZE) + 2 * Math.floor(i / SIZE)) % 4 === 0) front[i] = hair.shade;
      });
      break;
    case 'bun':
      cap(5);
      sideburns(9, 11, 1);
      [2, 3, 3, 2].forEach((half, i) => span(front, 1 + i, half, hair.base));
      break;
  }
}

function drawAccessory(c: Canvas, accessory: Accessory, face: Face) {
  const edge = SIZE / 2 - face.width;
  switch (accessory) {
    case 'fake-beard': {
      const rows = headRows(face);
      for (let y = 18; y <= 22; y++) span(c, y, rows[y - HEAD_TOP], BEARD.base);
      [face.width - 1, face.width - 2, face.width - 4].forEach((half, i) => span(c, 23 + i, half, BEARD.base));
      // Every other column from y = 20 down is darker, which reads as hair.
      c.forEach((color, i) => {
        if (color && i % 2 === 0 && i >= 20 * SIZE) c[i] = BEARD.shade;
      });
      for (let x = 14; x <= 17; x++) c[19 * SIZE + x] = undefined; // mouth hole
      // The elastic that holds it on, looped over the ears.
      [[edge, 17], [edge, 16], [edge - 1, 15], [edge - 1, 14]].forEach(([x, y]) => pair(c, x, y, ELASTIC));
      break;
    }
    case 'mustache':
      sprite(c, 12, 18, ['.mmmmmm.', 'mm....mm'], { m: MUSTACHE });
      break;
    case 'monocle': {
      const x = SIZE / 2 - 1 + face.eyeGap;
      sprite(c, x, EYE_TOP - 1, ['.gg.', 'g..g', 'g..g', '.gg.'], { g: GOLD });
      [[4, 16], [5, 18], [5, 20], [6, 22], [6, 24]].forEach(([dx, y]) => dot(c, x + dx, y, GOLD));
      break;
    }
    case 'raccoon-ears':
      sprite(c, edge, 2, ['.ww..', 'wggw.', 'wgdgw', 'gddgg', 'ggggg'], RACCOON, true);
      break;
  }
}

function toSvgLayer(name: string, c: Canvas): string {
  let rects = '';
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; ) {
      const fill = c[y * SIZE + x];
      let w = 1;
      while (fill && x + w < SIZE && c[y * SIZE + x + w] === fill) w++;
      if (fill) rects += `<rect x="${x}" y="${y}" width="${w}" height="1" fill="${fill}"/>`;
      x += w;
    }
  }
  return rects ? `<g data-layer="${name}">${rects}</g>` : '';
}

/** A 32x32 pixel-art portrait as an SVG string: one `<g data-layer>` group per non-empty layer, accessories last. */
export function drawPortrait(seed: number, accessories: readonly Accessory[] = []): string {
  const face = rollFace(createRng(seed));
  const blank = (): Canvas => new Array<string | undefined>(SIZE * SIZE).fill(undefined);
  const [backdrop, hairBack, body, head, features, hairFront] = [blank(), blank(), blank(), blank(), blank(), blank()];
  for (let y = 0; y < SIZE; y++) span(backdrop, y, SIZE / 2, BACKDROP);
  drawBody(body, face);
  drawHead(head, face);
  drawFeatures(features, face);
  drawHair(hairBack, hairFront, face);
  const layers = [
    toSvgLayer('backdrop', backdrop),
    toSvgLayer('hair-back', hairBack),
    toSvgLayer('body', body),
    toSvgLayer('head', head),
    toSvgLayer('features', features),
    toSvgLayer('hair', hairFront),
  ];
  for (const accessory of ACCESSORIES) {
    if (!accessories.includes(accessory)) continue;
    const layer = blank();
    drawAccessory(layer, accessory, face);
    layers.push(toSvgLayer(accessory, layer));
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SIZE} ${SIZE}" width="${SIZE}" height="${SIZE}" shape-rendering="crispEdges">${layers.join('')}</svg>`;
}
