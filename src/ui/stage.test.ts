import { describe, expect, it } from 'vitest';
import { shiftFloor } from './room';
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
  // taken only if the desk's tallest state (a voucher's form over a phone, Rule 2's page under the registry's
  // tab) still fits under the shortest hall. Until 30 Sep 2026 these took scale 1 and lost up to 58px of it.
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
