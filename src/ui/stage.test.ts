import { describe, expect, it } from 'vitest';
import { deskNeeds, HALL_ROWS, RAIL, shiftFloor } from './room';
import { fit } from './Stage';

// The stage snaps down to a crisp scale, one art pixel (2 design pixels) to a whole number of device pixels,
// whenever that keeps enough of the fit, and lays the desk out a little taller or wider for it; otherwise it
// keeps the fractional fit. It fills the window, and is never narrower than 1400 nor shorter than 820.
describe('the stage', () => {
  it.each([
    // A 13-inch laptop at full screen; a 14-inch; a 27-inch Retina; a 1080p monitor.
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
    expect(box.height).toBeGreaterThanOrEqual(820);
    expect(box.width).toBeGreaterThanOrEqual(1400);
    expect((box.left * dpr) % 1).toBe(0);
  });

  // A small laptop's window, narrow and short: the stage is never laid out shorter than designed, so the desk's
  // tallest state (an applicant's papers: a voucher's form over a phone held up in the video) fits under the hall.
  // Until 30 Sep 2026 these took scale 1 and lost up to 58px of it.
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

  // A 13-inch MacBook's window, with the Dock and a bookmarks bar and without: the crisp step below (0.75) would keep
  // less than 85% of the fit and set every word a quarter smaller, so each takes its fit, a desk laid out 820 tall.
  // Until 30 Sep 2026 the first took 0.75, a 1760×1012 desk; until 1 Oct 2026 the second took 1, a 1440×789 desk
  // under a shorter hall than the first's.
  it.each([
    [1320, 759],
    [1440, 789],
  ])('takes the fit where the crisp step below would shrink the desk by more than 15%%: %i×%i at 2×', (w, h) => {
    const box = fit(w, h, 2);
    expect(box.scale).toBeCloseTo(h / 820, 9);
    expect(box.height).toBeCloseTo(820);
    expect(box.width).toBeCloseTo(w / (h / 820));
    expect(box.height).toBeGreaterThanOrEqual(shiftFloor(box.width));
    expect((box.left * 2) % 1).toBe(0);
  });

  it('keeps a crisp step at full size or more, however far below the fit: a full-screen 1080p monitor stays at 1', () => {
    const box = fit(1920, 1080, 1);
    expect(box.scale).toBe(1);
    expect(box.width).toBe(1920);
    expect(box.left).toBe(0);
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
      expect(box.width, `${w}×${h}`).toBeLessThanOrEqual(1920);
      expect(box.width * box.scale, `${w}×${h}`).toBeLessThanOrEqual(w + 0.001);
      expect(box.height * box.scale, `${w}×${h}`).toBeCloseTo(h);
    }
  });
});

// Every window gets the same hall (room.ts) and the papers at the same scale, and fills the window with them: only one
// wider than the widest desk gets bars. Until 1 Oct 2026 a big monitor's wider stage drew the evidence twice as big and
// took the room for it from the hall, down to its strip.
describe('the same hall in every window', () => {
  it.each([
    // A 13-inch MacBook's window, two of them, and full screen; a 1080p monitor's window and full screen; a 1440p
    // monitor's window at 1× and 2×; a 4K monitor's at 150%; a 1080p laptop at 125%; a 4:3 window.
    [1320, 759, 2],
    [1440, 789, 2],
    [1440, 900, 2],
    [1920, 955, 1],
    [1920, 1080, 1],
    [2560, 1300, 1],
    [2560, 1329, 2],
    [2560, 1300, 1.5],
    [1536, 740, 1.25],
    [1024, 768, 1],
  ])('%i×%i at %f×: the hall, the desk in its tallest state below it, and no bars', (w, h, dpr) => {
    const box = fit(w, h, dpr);
    expect(RAIL + 2 + HALL_ROWS * 2 + deskNeeds(box.width)).toBeLessThanOrEqual(box.height);
    expect(box.width * box.scale).toBeCloseTo(w);
    expect(box.height * box.scale).toBeCloseTo(h);
    expect(box.left).toBe(0);
  });
});
