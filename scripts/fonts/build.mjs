// Builds the Ministry's pixel fonts from their drawings (print.txt, stamp.txt): every inked pixel is
// a square on the grid, written as TrueType, with no other dependency. Self-made, so CC0 like the
// rest of the art. Usage: node scripts/fonts/build.mjs, which writes public/assets/fonts/*.ttf.
//
// A glyph pixel is 100 font units and the em is 10 pixels, so at font-size 20px one pixel of a glyph
// is exactly 2 CSS pixels: one art pixel of the desk, as the portraits are drawn.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, '..', '..', 'public', 'assets', 'fonts');

const UNIT = 100;
const EM = 1000;
/** Rows of every drawing: 0 for accents, 1 to 7 standing on the baseline, 8 and 9 below it. */
const ROWS = 10;
const BASELINE_ROW = 7;
const ASCENT = 900;
const DESCENT = 300;
/** 30 September 2026, in the font format's clock (seconds since 1904), so a rebuild writes the same bytes. */
const MADE = Date.UTC(2026, 8, 30) / 1000 + 2082844800;

/** The drawings in a glyph file: "== c" and ten rows of '.' and '#'. */
function parse(file) {
  const glyphs = new Map();
  let char = null;
  let rows = [];
  const flush = () => {
    if (char === null) return;
    if (rows.length !== ROWS) throw new Error(`${file} ${char}: ${rows.length} rows, not ${ROWS}`);
    if (rows.some((r) => r.length !== rows[0].length)) throw new Error(`${file} ${char}: rows of different widths`);
    glyphs.set(char, rows);
  };
  for (const line of readFileSync(join(here, file), 'utf8').split('\n')) {
    if (line.startsWith('== ')) {
      flush();
      char = line.slice(3);
      rows = [];
    } else if (/^[.#]+$/.test(line)) rows.push(line);
  }
  flush();
  return glyphs;
}

/** A blank drawing `width` pixels wide: a space. */
const blank = (width) => Array.from({ length: ROWS }, () => '.'.repeat(width));

/**
 * A drawing as rectangles in font units: each run of ink on a row, joined with the same run on the rows
 * below it. `shift(row)` moves a row sideways, in pixels (an italic leans), and `left` the whole glyph.
 */
function rectangles(rows, { shift = () => 0, left = 0 } = {}) {
  const done = [];
  let open = [];
  rows.forEach((row, r) => {
    const runs = [];
    for (let c = 0; c < row.length; ) {
      if (row[c] !== '#') {
        c++;
        continue;
      }
      let e = c;
      while (e < row.length && row[e] === '#') e++;
      runs.push([c + shift(r) + left, e + shift(r) + left]);
      c = e;
    }
    const next = [];
    for (const [x0, x1] of runs) {
      const above = open.find((o) => o.x0 === x0 && o.x1 === x1);
      if (above) {
        above.bottom = r;
        next.push(above);
        open = open.filter((o) => o !== above);
      } else next.push({ x0, x1, top: r, bottom: r });
    }
    done.push(...open);
    open = next;
  });
  done.push(...open);
  return done.map(({ x0, x1, top, bottom }) => ({
    x0: x0 * UNIT,
    x1: x1 * UNIT,
    y0: (BASELINE_ROW - bottom) * UNIT,
    y1: (BASELINE_ROW - top + 1) * UNIT,
  }));
}

/** A font: glyphs in order, each with its code points, rectangles and advance, and the font's names. */
function font({ family, style, weight, italic, mono, glyphs }) {
  // Glyph 0 is .notdef, a hollow box.
  const notdef = { codes: [], rects: rectangles(['....', '####', '#..#', '#..#', '#..#', '#..#', '#..#', '####', '....', '....']), advance: 5 * UNIT };
  return { family, style, weight, italic, mono, glyphs: [notdef, ...glyphs] };
}

// ------------------------------------------------------------------ the faces

const print = parse('print.txt');
const stamp = parse('stamp.txt');

/** Every drawn character of a face, as glyphs; the space and the no-break space are `spaceWidth` blank pixels. */
function glyphsOf(drawings, { spaceWidth, shape = (rows) => ({ rows }), advance = (width) => width + 1, extraCodes = () => [] }) {
  const list = [{ char: ' ', rows: blank(spaceWidth), codes: [0x20, 0xa0] }];
  for (const [char, rows] of drawings) list.push({ char, rows, codes: [char.codePointAt(0), ...extraCodes(char)] });
  return list.map(({ rows, codes }) => {
    const { rows: drawn, shift, left = 0, width = rows[0].length } = shape(rows);
    return { codes, rects: rectangles(drawn, { shift, left }), advance: advance(width) * UNIT };
  });
}

/** The print face leant over: rows 0 to 4 a pixel right, so the step falls inside the stems. */
const lean = (row) => (row <= 4 ? 1 : 0);
/** Letters the lean would break, drawn already leant (italic.txt); symbols it would break stay upright. */
const italic = parse('italic.txt');
const UPRIGHT = '}%*<>~×✓✗';

/**
 * The typewriter's changes to the print face: the narrow letters it serifs to fill a cell, as a
 * typewriter does. Anything else is the print face, centred in a six-pixel cell.
 */
const TYPEWRITER = {
  i: ['.....', '..#..', '.....', '.##..', '..#..', '..#..', '..#..', '.###.', '.....', '.....'],
  l: ['.....', '.##..', '..#..', '..#..', '..#..', '..#..', '..#..', '.###.', '.....', '.....'],
  I: ['.....', '.###.', '..#..', '..#..', '..#..', '..#..', '..#..', '.###.', '.....', '.....'],
  j: ['.....', '...#.', '.....', '..##.', '...#.', '...#.', '...#.', '...#.', '...#.', '.##..'],
  1: ['.....', '..#..', '.##..', '#.#..', '..#..', '..#..', '..#..', '.###.', '.....', '.....'],
  E: ['.....', '#####', '#....', '#....', '####.', '#....', '#....', '#####', '.....', '.....'],
  F: ['.....', '#####', '#....', '#....', '####.', '#....', '#....', '#....', '.....', '.....'],
  L: ['.....', '#....', '#....', '#....', '#....', '#....', '#....', '#####', '.....', '.....'],
  '—': ['......', '......', '......', '......', '......', '######', '......', '......', '......', '......'],
  r: ['.....', '.....', '.....', '##.#.', '.##.#', '.#...', '.#...', '###..', '.....', '.....'],
  f: ['.....', '..##.', '.#..#', '.#...', '####.', '.#...', '.#...', '###..', '.....', '.....'],
  t: ['.....', '.....', '.#...', '####.', '.#...', '.#...', '.#..#', '..##.', '.....', '.....'],
};
const CELL = 6;

const faces = [
  font({
    family: 'Ministry Print',
    style: 'Regular',
    weight: 400,
    italic: false,
    mono: false,
    glyphs: glyphsOf(print, { spaceWidth: 2 }),
  }),
  font({
    family: 'Ministry Print',
    style: 'Italic',
    weight: 400,
    italic: true,
    mono: false,
    glyphs: glyphsOf(print, {
      spaceWidth: 2,
      shape: (rows) => {
        const char = [...print].find(([, r]) => r === rows)?.[0];
        const own = italic.get(char);
        if (own) return { rows: own, width: rows[0].length };
        return UPRIGHT.includes(char) ? { rows } : { rows, shift: lean };
      },
    }),
  }),
  font({
    family: 'Ministry Type',
    style: 'Regular',
    weight: 400,
    italic: false,
    mono: true,
    glyphs: glyphsOf(print, {
      spaceWidth: CELL - 1,
      shape: (rows) => {
        const char = [...print].find(([, r]) => r === rows)?.[0];
        const own = char && TYPEWRITER[char];
        const drawn = own ?? rows;
        const width = drawn[0].length;
        return { rows: drawn, left: Math.max(0, Math.floor((CELL - 1 - width) / 2)), width: CELL - 1 };
      },
    }),
  }),
  font({
    family: 'Ministry Stamp',
    style: 'Bold',
    weight: 700,
    italic: false,
    mono: false,
    // Capitals only: a lowercase letter prints as its capital.
    glyphs: glyphsOf(stamp, { spaceWidth: 3, extraCodes: (char) => (/^[A-Z]$/.test(char) ? [char.toLowerCase().codePointAt(0)] : []) }),
  }),
];

// ------------------------------------------------------------------ TrueType

class Bytes {
  constructor() {
    this.parts = [];
    this.length = 0;
  }
  push(size, write) {
    const b = Buffer.alloc(size);
    write(b);
    this.parts.push(b);
    this.length += size;
    return this;
  }
  u8(v) { return this.push(1, (b) => b.writeUInt8(v)); }
  u16(v) { return this.push(2, (b) => b.writeUInt16BE(v & 0xffff)); }
  i16(v) { return this.push(2, (b) => b.writeInt16BE(v)); }
  u32(v) { return this.push(4, (b) => b.writeUInt32BE(v >>> 0)); }
  i32(v) { return this.push(4, (b) => b.writeInt32BE(v)); }
  u64(v) { return this.u32(Math.floor(v / 2 ** 32)).u32(v % 2 ** 32); }
  tag(s) { return this.push(4, (b) => b.write(s, 'latin1')); }
  raw(buf) {
    this.parts.push(buf);
    this.length += buf.length;
    return this;
  }
  pad(to = 4) {
    const rest = (to - (this.length % to)) % to;
    return rest ? this.push(rest, () => {}) : this;
  }
  done() {
    return Buffer.concat(this.parts);
  }
}

const checksum = (buf) => {
  const padded = Buffer.concat([buf, Buffer.alloc((4 - (buf.length % 4)) % 4)]);
  let sum = 0;
  for (let i = 0; i < padded.length; i += 4) sum = (sum + padded.readUInt32BE(i)) >>> 0;
  return sum;
};

const bounds = (rects) =>
  rects.length === 0
    ? { xMin: 0, yMin: 0, xMax: 0, yMax: 0 }
    : {
        xMin: Math.min(...rects.map((r) => r.x0)),
        yMin: Math.min(...rects.map((r) => r.y0)),
        xMax: Math.max(...rects.map((r) => r.x1)),
        yMax: Math.max(...rects.map((r) => r.y1)),
      };

/** One glyph's outline: each rectangle a clockwise contour of four points on the curve. */
function glyf(rects) {
  if (rects.length === 0) return Buffer.alloc(0);
  const b = new Bytes();
  const { xMin, yMin, xMax, yMax } = bounds(rects);
  b.i16(rects.length).i16(xMin).i16(yMin).i16(xMax).i16(yMax);
  rects.forEach((_, k) => b.u16(4 * k + 3));
  b.u16(0);
  for (let k = 0; k < rects.length * 4; k++) b.u8(0x01);
  const points = rects.flatMap((r) => [
    [r.x0, r.y0],
    [r.x0, r.y1],
    [r.x1, r.y1],
    [r.x1, r.y0],
  ]);
  let x = 0;
  for (const [px] of points) {
    b.i16(px - x);
    x = px;
  }
  let y = 0;
  for (const [, py] of points) {
    b.i16(py - y);
    y = py;
  }
  return b.pad(4).done();
}

/** The character map: one segment per code point (format 4), and the closing 0xFFFF. */
function cmap(map) {
  const codes = [...map.keys()].filter((c) => c <= 0xfffe).sort((a, b) => a - b);
  const segments = [...codes.map((c) => ({ start: c, end: c, delta: (map.get(c) - c) & 0xffff })), { start: 0xffff, end: 0xffff, delta: 1 }];
  const n = segments.length;
  const pow = 2 ** Math.floor(Math.log2(n));
  const sub = new Bytes();
  sub.u16(4).u16(16 + 8 * n).u16(0).u16(2 * n).u16(2 * pow).u16(Math.log2(pow)).u16(2 * n - 2 * pow);
  segments.forEach((s) => sub.u16(s.end));
  sub.u16(0);
  segments.forEach((s) => sub.u16(s.start));
  segments.forEach((s) => sub.u16(s.delta));
  segments.forEach(() => sub.u16(0));
  const body = sub.done();
  return new Bytes().u16(0).u16(1).u16(3).u16(1).u32(12).raw(body).done();
}

function nameTable(f) {
  const postscript = `${f.family.replace(/ /g, '')}-${f.style}`;
  const names = [
    [0, 'Self-made for Proof of Humanity: Papers, Please. Public domain (CC0).'],
    [1, f.family],
    [2, f.style],
    [3, `${postscript} 1.000`],
    [4, `${f.family} ${f.style}`],
    [5, 'Version 1.000'],
    [6, postscript],
  ];
  const strings = names.map(([, s]) => Buffer.from(s, 'utf16le').swap16());
  const b = new Bytes();
  b.u16(0).u16(names.length).u16(6 + 12 * names.length);
  let offset = 0;
  names.forEach(([id], k) => {
    b.u16(3).u16(1).u16(0x0409).u16(id).u16(strings[k].length).u16(offset);
    offset += strings[k].length;
  });
  strings.forEach((s) => b.raw(s));
  return b.done();
}

function ttf(f) {
  const glyphs = f.glyphs;
  const map = new Map();
  glyphs.forEach((g, id) => g.codes.forEach((code) => map.set(code, id)));
  const outlines = glyphs.map((g) => glyf(g.rects));
  const all = bounds(glyphs.flatMap((g) => g.rects));
  const advances = glyphs.map((g) => g.advance);
  const lsbs = glyphs.map((g) => (g.rects.length ? bounds(g.rects).xMin : 0));
  const maxPoints = Math.max(...glyphs.map((g) => g.rects.length * 4));
  const maxContours = Math.max(...glyphs.map((g) => g.rects.length));
  const codes = [...map.keys()].filter((c) => c <= 0xffff);
  const macStyle = (f.weight >= 700 ? 1 : 0) | (f.italic ? 2 : 0);
  const fsSelection = (f.italic ? 0x01 : 0) | (f.weight >= 700 ? 0x20 : 0) | (!f.italic && f.weight < 700 ? 0x40 : 0) | 0x80;

  const loca = new Bytes();
  let at = 0;
  for (const o of outlines) {
    loca.u32(at);
    at += o.length;
  }
  loca.u32(at);

  const tables = {
    'OS/2': new Bytes()
      .u16(4)
      .i16(Math.round(advances.reduce((s, a) => s + a, 0) / advances.length))
      .u16(f.weight)
      .u16(5)
      .u16(0)
      .i16(650).i16(600).i16(0).i16(75)
      .i16(650).i16(600).i16(0).i16(350)
      .i16(UNIT).i16(3 * UNIT)
      .i16(0)
      .raw(Buffer.alloc(10))
      .u32(0b11).u32(0).u32(0).u32(0)
      .tag('NONE')
      .u16(fsSelection)
      .u16(Math.min(...codes)).u16(Math.max(...codes))
      .i16(ASCENT).i16(-DESCENT).i16(0)
      .u16(ASCENT).u16(DESCENT)
      .u32(1).u32(0)
      .i16(5 * UNIT).i16(7 * UNIT)
      .u16(0).u16(0x20).u16(1)
      .done(),
    cmap: cmap(map),
    glyf: Buffer.concat(outlines),
    head: new Bytes()
      .u32(0x00010000).u32(0x00010000)
      .u32(0)
      .u32(0x5f0f3cf5)
      .u16(0x000b)
      .u16(EM)
      .u64(MADE).u64(MADE)
      .i16(all.xMin).i16(all.yMin).i16(all.xMax).i16(all.yMax)
      .u16(macStyle)
      .u16(8)
      .i16(2)
      .i16(1)
      .i16(0)
      .done(),
    hhea: new Bytes()
      .u32(0x00010000)
      .i16(ASCENT).i16(-DESCENT).i16(0)
      .u16(Math.max(...advances))
      .i16(Math.min(...lsbs))
      .i16(Math.min(...glyphs.map((g, k) => advances[k] - (g.rects.length ? bounds(g.rects).xMax : 0))))
      .i16(Math.max(...glyphs.map((g) => (g.rects.length ? bounds(g.rects).xMax : 0))))
      .i16(f.italic ? 4 : 1).i16(f.italic ? 1 : 0).i16(0)
      .i16(0).i16(0).i16(0).i16(0)
      .i16(0)
      .u16(glyphs.length)
      .done(),
    hmtx: (() => {
      const b = new Bytes();
      glyphs.forEach((_, k) => b.u16(advances[k]).i16(lsbs[k]));
      return b.done();
    })(),
    loca: loca.done(),
    maxp: new Bytes()
      .u32(0x00010000)
      .u16(glyphs.length)
      .u16(maxPoints).u16(maxContours)
      .u16(0).u16(0)
      .u16(2)
      .u16(0).u16(0).u16(0).u16(0).u16(0).u16(0).u16(0).u16(0)
      .done(),
    name: nameTable(f),
    post: new Bytes()
      .u32(0x00030000)
      .i32(f.italic ? -14 * 65536 : 0)
      .i16(-2 * UNIT).i16(UNIT)
      .u32(f.mono ? 1 : 0)
      .u32(0).u32(0).u32(0).u32(0)
      .done(),
  };

  const tags = Object.keys(tables).sort();
  const n = tags.length;
  const pow = 2 ** Math.floor(Math.log2(n));
  const file = new Bytes();
  file.u32(0x00010000).u16(n).u16(16 * pow).u16(Math.log2(pow)).u16(16 * n - 16 * pow);
  let offset = 12 + 16 * n;
  const placed = tags.map((tag) => {
    const data = tables[tag];
    const entry = { tag, data, offset, sum: checksum(data) };
    offset += data.length + ((4 - (data.length % 4)) % 4);
    return entry;
  });
  for (const e of placed) file.tag(e.tag).u32(e.sum).u32(e.offset).u32(e.data.length);
  for (const e of placed) file.raw(e.data).pad(4);
  const bytes = file.done();
  // head.checkSumAdjustment makes the whole file sum to 0xB1B0AFBA.
  const head = placed.find((e) => e.tag === 'head');
  bytes.writeUInt32BE((0xb1b0afba - checksum(bytes)) >>> 0, head.offset + 8);
  return bytes;
}

mkdirSync(out, { recursive: true });
for (const f of faces) {
  const name = `${f.family.toLowerCase().replace(/ /g, '-')}${f.italic ? '-italic' : ''}.ttf`;
  const bytes = ttf(f);
  writeFileSync(join(out, name), bytes);
  console.log(`${name}: ${f.glyphs.length} glyphs, ${bytes.length} bytes`);
}
