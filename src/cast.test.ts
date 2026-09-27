import { describe, expect, it } from 'vitest';
import { REGULARS, type CastId } from './content/cast';
import { generateWeek, LAST_DAY } from './gen/day';
import { judge, rulebookForDay } from './rules/judge';

// The recurring cast against the rule engine, one block per character: over the seeds the tests
// use, they turn up, and judge() finds exactly what was planted on them, as in the oracle check.
const SEEDS = Array.from({ length: 20 }, (_, i) => i + 1);
const weeks = SEEDS.map(generateWeek);
const appearances = (id: CastId) =>
  weeks.flatMap((week) => week.flatMap((queue, i) => queue.filter((a) => a.cast === id).map((a) => ({ ...a, day: i + 1 }))));
const DAYS = Array.from({ length: LAST_DAY }, (_, i) => i + 1);

describe('Dawn Hollis', () => {
  const dawn = appearances('nightShiftDawn');

  it('comes in at least once', () => {
    expect(dawn.length).toBeGreaterThan(0);
  });

  it('is valid on every appearance: judge() finds exactly the planted rules, which is none', () => {
    for (const { planted, cast, day, ...visible } of dawn) {
      const { valid, violations } = judge(visible, rulebookForDay(day), []);
      expect(violations.map((v) => v.rule), `day ${day}`).toEqual(planted.map((p) => p.rule));
      expect(planted, `day ${day}`).toEqual([]);
      expect(valid, `day ${day}`).toBe(true);
    }
  });

  it('yawns in every video, between two words, and every video passes on every day', () => {
    const { planted, cast, day, ...visible } = dawn[0];
    for (const transcript of REGULARS.nightShiftDawn.videos) {
      expect(transcript).toMatch(/ \(yawns\) /);
      for (const d of DAYS) {
        expect(judge({ ...visible, video: { ...visible.video, transcript } }, rulebookForDay(d), []).valid, transcript).toBe(true);
      }
    }
  });
});
