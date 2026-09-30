import { describe, expect, it } from 'vitest';

// notes/art-direction.md, the look's style sheet, as far as a stylesheet can be read: one pixel grid,
// the Ministry's own pixel type at its own sizes, and none of the generated page's tells (system fonts,
// rounded corners, blurred shadows, tracked capitals). A rule broken here breaks the look everywhere.
const sheets = Object.entries(import.meta.glob('./*.css', { query: '?raw', import: 'default', eager: true }) as Record<string, string>).map(
  ([path, css]) => ({ file: path.slice(2), css: css.replace(/\/\*[\s\S]*?\*\//g, '') }),
);

/** Every `property: value` in every stylesheet, with where it is. */
const declarations = (property: string) =>
  sheets.flatMap(({ file, css }) =>
    [...css.matchAll(new RegExp(`(?:^|[;{\\s])${property}\\s*:\\s*([^;}]+)`, 'g'))].map((m) => ({ where: `${file}: ${property}: ${m[1].trim()}`, value: m[1].trim() })),
  );

describe('the look', () => {
  it('reads every stylesheet', () => {
    expect(sheets.map(({ file }) => file)).toEqual(expect.arrayContaining(['desk.css', 'hall.css', 'screens.css', 'board.css', 'type.css']));
  });

  it('is set in the Ministry’s own faces only: no system font anywhere', () => {
    const FACE = /^(var\(--(print|type|stamp|hand|typewriter|official)\)|'Ministry (Print|Type|Stamp|Hand)'|inherit)/;
    for (const { where, value } of declarations('font-family')) expect(value, where).toMatch(FACE);
    // The type's variables name a Ministry face first (a system face may only follow it, as a fallback).
    for (const name of ['print', 'type', 'stamp', 'hand', 'typewriter', 'official']) {
      for (const { where, value } of declarations(`--${name}`)) expect(value, where).toMatch(FACE);
    }
    for (const { where, value } of declarations('font')) expect(value, where).not.toMatch(/Courier|Arial|Helvetica|Georgia|Times|Bradley|Segoe|Noteworthy|sans-serif|serif/);
  });

  it('prints type at one font pixel to one art pixel (20px), or twice or three times over for display', () => {
    // The hall's screen-reader copy of what its PA says is 1px: it is not seen.
    for (const { where, value } of declarations('font-size')) expect(['20px', '30px', '40px', 'inherit', '1px'], where).toContain(value);
  });

  it('keeps line heights and letter spacing on the grid', () => {
    for (const { where, value } of declarations('line-height')) expect(value, where).toMatch(/^(0|[1-9]\d*[02468]px|[02468]px)$/);
    for (const { where, value } of declarations('letter-spacing')) expect(value, where).toMatch(/^0(px)?$/);
  });

  it('has none of the generated page’s tells: rounded corners, blur, soft shadows, tracked capitals', () => {
    for (const { where, value } of declarations('border-radius')) expect(value, where).toMatch(/^0(px)?$/);
    for (const { where, value } of declarations('text-transform')) expect(value, where).not.toMatch(/uppercase/);
    for (const property of ['filter', 'backdrop-filter']) for (const { where, value } of declarations(property)) expect(value, where).not.toMatch(/blur\(/);
    // A shadow is hard: an offset and a colour, with no blur radius (a third length, if any, is 0).
    for (const { where, value } of declarations('box-shadow')) {
      for (const shadow of value.split(/,(?![^(]*\))/)) {
        const lengths = shadow.match(/-?\d+(\.\d+)?px|\b0\b/g) ?? [];
        if (lengths.length >= 3) expect(lengths[2], where).toMatch(/^0(px)?$/);
      }
    }
  });

  it('turns nothing that carries type or pixel art by a fraction of a turn', () => {
    for (const { where, value } of [...declarations('rotate'), ...declarations('transform')]) {
      const turns = [...value.matchAll(/rotate\(\s*(-?[\d.]+)deg\s*\)/g), ...(/^-?[\d.]+deg$/.test(value) ? [[value, value.replace('deg', '')]] : [])];
      for (const [, deg] of turns) expect(Number(deg) % 90, where).toBe(0);
    }
  });
});
