import { describe, expect, it } from 'vitest';
import { REGULARS, type CastId } from './content/cast';
import { planWeek } from './gen/day';
import { judge, rulebookForDay } from './rules/judge';

// The recurring cast against the rule engine, one block per character: over the seeds the tests
// use, they turn up, and judge() finds exactly what was planted on them, as in the oracle check,
// against the registry as it would stand when they reach the window.
const SEEDS = Array.from({ length: 20 }, (_, i) => i + 1);
const weeks = SEEDS.map(planWeek);
const appearances = (id: CastId) =>
  weeks.flatMap((week) =>
    week.queues.flatMap((queue, i) => queue.flatMap((a, n) => (a.cast === id ? [{ ...a, day: i + 1, registry: week.seen[i][n] }] : []))),
  );

describe('Dawn Hollis', () => {
  const dawn = appearances('nightShiftDawn');

  it('comes in at least once', () => {
    expect(dawn.length).toBeGreaterThan(0);
  });

  it('is valid on every appearance: judge() finds exactly the planted rules, which is none', () => {
    for (const { planted, cast, lookAlike, day, registry, ...visible } of dawn) {
      const { valid, violations } = judge(visible, rulebookForDay(day), registry);
      expect(violations.map((v) => v.rule), `day ${day}`).toEqual(planted.map((p) => p.rule));
      expect(planted, `day ${day}`).toEqual([]);
      expect(valid, `day ${day}`).toBe(true);
    }
  });

  it('yawns in every video, between two words, and every video passes on every day she comes', () => {
    for (const { planted, cast, lookAlike, day, registry, ...visible } of dawn) {
      for (const transcript of REGULARS.nightShiftDawn.videos) {
        expect(transcript).toMatch(/ \(yawns\) /);
        expect(judge({ ...visible, video: { ...visible.video, transcript } }, rulebookForDay(day), registry).valid, `day ${day}: ${transcript}`).toBe(true);
      }
    }
    // She comes once a week, on any day from 2 to 7, and over 20 weeks on every one of them.
    expect(new Set(dawn.map((a) => a.day))).toEqual(new Set([2, 3, 4, 5, 6, 7]));
  });
});
