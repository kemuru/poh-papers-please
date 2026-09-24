import { describe, expect, it } from 'vitest';
import { createRng } from './rng';

const take = (seed: number, n: number) => {
  const rng = createRng(seed);
  return Array.from({ length: n }, () => rng.next());
};

describe('createRng', () => {
  it('gives the same sequence for the same seed', () => {
    expect(take(42, 100)).toEqual(take(42, 100));
  });

  it('gives different sequences for different seeds', () => {
    expect(take(1, 10)).not.toEqual(take(2, 10));
  });

  it('returns floats in [0, 1)', () => {
    for (const x of take(7, 10_000)) {
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThan(1);
    }
  });

  it('int() stays within inclusive bounds and hits both ends', () => {
    const rng = createRng(3);
    const seen = new Set<number>();
    for (let i = 0; i < 1000; i++) {
      const v = rng.int(1, 6);
      expect(Number.isInteger(v)).toBe(true);
      expect(v).toBeGreaterThanOrEqual(1);
      expect(v).toBeLessThanOrEqual(6);
      seen.add(v);
    }
    expect([...seen].sort()).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('pick() returns an element and rejects empty arrays', () => {
    const rng = createRng(9);
    const items = ['raccoon', 'toaster', 'philosopher'] as const;
    expect(items).toContain(rng.pick(items));
    expect(() => rng.pick([])).toThrow();
  });
});
