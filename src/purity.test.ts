import { describe, expect, it } from 'vitest';

// AGENTS.md: game logic is pure and seeded. No React, no clock, no Math.random.
const sources = import.meta.glob(
  ['./rules/**/*.ts', './gen/**/*.ts', './court/**/*.ts', './economy/**/*.ts', '!./**/*.test.ts'],
  { query: '?raw', import: 'default', eager: true },
) as Record<string, string>;

describe('pure modules', () => {
  it('finds the source files to check', () => {
    expect(Object.keys(sources)).toContain('./gen/rng.ts');
  });

  it.each(Object.entries(sources))('%s does not import React or read the clock or Math.random', (_, source) => {
    expect(source).not.toMatch(/from\s+['"]react/);
    expect(source).not.toMatch(/Math\.random|Date\.now|performance\.now/);
  });
});
