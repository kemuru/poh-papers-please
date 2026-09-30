import { describe, expect, it } from 'vitest';
import { DESK_NEEDS, DESK_NEEDS_X2, evidenceX2, hallRows, RAIL, shiftFloor } from './room';
import { fit } from './Stage';

// The stage snaps to a crisp scale, one art pixel (2 design pixels) to a whole number of device pixels,
// whenever one fits, and lays the desk out a little taller or wider for it; only a window too small for
// any crisp step keeps the fractional fit.
describe('the stage', () => {
  it.each([
    // A 13-inch laptop's browser window, and full screen; a 14-inch; a 27-inch Retina; a 1080p monitor.
    [1440, 789, 2, 1],
    [1440, 900, 2, 1],
    [1512, 871, 2, 1],
    [2560, 1329, 2, 1.5],
    [1920, 960, 1, 1],
    // A 1080p Windows laptop at 125%, and a 720p one at 150%: one art pixel to two device pixels.
    [1536, 730, 1.25, 0.8],
    [1280, 600, 1.5, 2 / 3],
  ])('scales %i×%i at %f× crisply, to %f', (w, h, dpr, scale) => {
    const box = fit(w, h, dpr);
    expect(box.scale).toBeCloseTo(scale, 9);
    expect(Math.abs(((2 * box.scale * dpr) % 1) - Math.round((2 * box.scale * dpr) % 1))).toBeLessThan(1e-9);
    expect(box.height).toBeGreaterThanOrEqual(760);
    expect(box.width).toBeGreaterThanOrEqual(1240);
    expect((box.left * dpr) % 1).toBe(0);
  });

  // A small laptop's window, narrow and short: a crisp step that lays the stage out shorter than designed is
  // taken only if the desk's tallest state (an applicant's papers: a voucher's form over a phone held up in
  // the video) still fits under the shortest hall. Until 30 Sep 2026 these took scale 1 and lost up to 58px of it.
  it.each([
    [1240, 760, 1],
    [1240, 760, 2],
    [1280, 768, 1],
    [1280, 768, 2],
  ])('lays %i×%i at %f× out tall enough for the desk in its tallest state', (w, h, dpr) => {
    const box = fit(w, h, dpr);
    expect(box.height).toBeGreaterThanOrEqual(shiftFloor(box.width));
    expect(box.width * box.scale).toBeLessThanOrEqual(w + 0.001);
    expect(box.height * box.scale).toBeCloseTo(h);
  });

  // A 13-inch MacBook's window with the Dock and a bookmarks bar: its crisp step below (0.75) would keep only 81% of
  // its fit and set every word a quarter smaller, so it takes the fit, a desk laid out 820 tall. Until 30 Sep 2026 it
  // took 0.75, a 1760×1012 desk.
  it('takes the fit where the crisp step below would shrink the desk by more than 15%: 1320×759 at 2×', () => {
    const box = fit(1320, 759, 2);
    expect(box.scale).toBeCloseTo(759 / 820, 9);
    expect(box.height).toBeCloseTo(820);
    expect(box.width).toBeCloseTo(1320 / (759 / 820));
    expect(box.height).toBeGreaterThanOrEqual(shiftFloor(box.width));
    expect((box.left * 2) % 1).toBe(0);
  });

  it('keeps a crisp step at full size or more, however far below the fit: a full-screen 1080p monitor stays at 1', () => {
    const box = fit(1920, 1080, 1);
    expect(box.scale).toBe(1);
    expect(box.width).toBe(1760);
    expect(box.left).toBe(80);
  });

  it('keeps the fractional fit where no crisp step fits: a short window at 1×', () => {
    const box = fit(1280, 640, 1);
    expect(box.scale).toBeCloseTo(640 / 820);
    expect(box.height).toBeCloseTo(820);
  });

  it('never lays the desk out narrower than its narrowest, nor wider than its widest', () => {
    for (const [w, h, dpr] of [
      [1240, 820, 1],
      [1280, 700, 1],
      [3440, 1440, 1],
      [1024, 768, 2],
    ]) {
      const box = fit(w, h, dpr);
      expect(box.width, `${w}×${h}`).toBeLessThanOrEqual(1760);
      expect(box.width * box.scale, `${w}×${h}`).toBeLessThanOrEqual(w + 0.001);
      expect(box.height * box.scale, `${w}×${h}`).toBeCloseTo(h);
    }
  });
});

// Where the stage has the room, the stills and the form's photo are drawn at twice the art scale (room.ts): the hall
// gives way for the taller papers, and the crisp scale never depends on it. The stage decides from the shift's whole
// pixels, rounded down, as the hall measures them (rounded).
describe('the evidence at twice the art scale', () => {
  const need = (table: typeof DESK_NEEDS, width: number) => table.reduce((n, [w, h]) => (width >= w ? h : n), table[0][1]);
  it.each([
    // A 1080p monitor's browser window, with a bookmarks bar too; a 1080p laptop at 125% and at 150%; a 27-inch
    // 1440p monitor's window, at 1× and 2×; a 1680×1050 monitor's.
    [1920, 955, 1, true],
    [1920, 930, 1, true],
    [1536, 740, 1.25, true],
    [1280, 595, 1.5, true],
    [2560, 1300, 1, true],
    [2560, 1329, 2, true],
    [1680, 925, 1, true],
    // A full-screen 1080p monitor, crisp at 1 on a desk 1760 wide.
    [1920, 1080, 1, true],
    // Too narrow: a 13-inch MacBook's window at its crisp scale and at its fit; a 14-inch's and a 16-inch's; a 4K
    // monitor at 150%.
    [1440, 789, 2, false],
    [1320, 759, 2, false],
    [1512, 870, 2, false],
    [1728, 1000, 2, false],
    [2560, 1300, 1.5, false],
    // Wide enough but too short: a 1366×768 laptop's window, laid out 1723 wide and 820 tall.
    [1366, 650, 1, false],
  ])('%i×%i at %f×: %s', (w, h, dpr, doubled) => {
    const box = fit(w, h, dpr);
    const [width, height] = [Math.floor(box.width), Math.floor(box.height) - RAIL];
    expect(evidenceX2(width, height)).toBe(doubled);
    // The hall leaves the desk its tallest state, whichever it is; the scale is taken for the desk at the art scale.
    const rows = hallRows(Math.round(box.width), Math.round(box.height) - RAIL);
    expect(2 + rows * 2 + need(doubled ? DESK_NEEDS_X2 : DESK_NEEDS, width)).toBeLessThanOrEqual(height + 1);
    expect(box.height).toBeGreaterThanOrEqual(shiftFloor(box.width));
  });
});
