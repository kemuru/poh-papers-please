import { describe, expect, it } from 'vitest';
import { REGULARS, type CastId } from './content/cast';
import { generateWeek, LAST_DAY } from './gen/day';
import { judge, rulebookForDay } from './rules/judge';

// The recurring cast, one character at a time: on every appearance in the twenty seeded weeks
// the generator tests use, judge() finds exactly what the character was built with.
const SEEDS = Array.from({ length: 20 }, (_, i) => i + 1);
const weeks = SEEDS.map(generateWeek);
const appearances = (id: CastId) =>
  weeks.flatMap((week) => week.flatMap((queue, i) => queue.filter((a) => a.cast === id).map((a) => ({ ...a, day: i + 1 }))));

describe('Denise Dozier', () => {
  const denise = appearances('nightShiftDenise');

  it('comes in at least once', () => {
    expect(denise.length).toBeGreaterThan(0);
  });

  it('is judged exactly as planted on every appearance, and is always valid', () => {
    for (const { planted, cast, day, ...visible } of denise) {
      // judge() only ever sees what the player sees: the answer is taken off first.
      const { valid, violations } = judge(visible, rulebookForDay(day), []);
      expect(violations.map((v) => v.rule), `day ${day}`).toEqual(planted.map((p) => p.rule));
      expect(valid, `day ${day}`).toBe(planted.length === 0);
      expect(planted, `day ${day}`).toEqual([]);
    }
  });

  it('yawns inside the phrase in every video, and every video passes every day’s rulebook', () => {
    const [template] = denise;
    for (const transcript of REGULARS.nightShiftDenise.videos) {
      expect(transcript).toMatch(/^I certify\b.*\(yawns\).*\bregistry\b/);
      const saying = { ...template, video: { ...template.video, transcript } };
      for (let day = 1; day <= LAST_DAY; day++) expect(judge(saying, rulebookForDay(day), []).valid, `${transcript}, day ${day}`).toBe(true);
    }
  });
});
