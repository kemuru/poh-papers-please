import { describe, expect, it } from 'vitest';
import { ASIDES, NOISE, PHRASE_MISTAKES, SLIPS } from './content/applicants';
import { GARY_DAYS, REGULARS } from './content/cast';
import { generateWeek } from './gen/day';
import { judge, rulebookForDay } from './rules/judge';
import { PHRASE } from './rules/phrase';

// acceptance.md, oracle check: the generator knows the truth by construction, so it
// tests the rule engine without trusting the engine's own logic.
// Ten seeded weeks (530 applicants), each judged under the rulebook of the day they came in.
const applicants = Array.from({ length: 10 }, (_, i) => generateWeek(i + 1)).flatMap((week) =>
  week.flatMap((queue, i) => queue.map((a) => ({ ...a, day: i + 1 }))),
);

describe('oracle check', () => {
  it('judge() finds exactly the planted violations in 500 seeded applicants, no more, no fewer', () => {
    expect(applicants.length).toBeGreaterThanOrEqual(500);
    for (const { planted, cast, day, ...visible } of applicants) {
      // judge() only ever sees what the player sees: the answer is taken off first.
      const { valid, violations } = judge(visible, rulebookForDay(day), []);
      const who = `${visible.name}, day ${day}`;
      expect(violations.map((v) => v.rule).sort(), who).toEqual(planted.map((p) => p.rule).sort());
      expect(valid, who).toBe(planted.length === 0);
    }
  });

  it('is not vacuous: the sample has valid applicants, every kind of mistake and the cast', () => {
    expect(applicants.filter((a) => a.planted.length === 0).length).toBeGreaterThan(300);
    expect(new Set(applicants.flatMap((a) => a.planted.map((p) => p.mistake)))).toEqual(new Set(Object.keys(PHRASE_MISTAKES)));
    expect(new Set(applicants.map((a) => a.cast))).toEqual(new Set([null, 'gary', ...Object.keys(REGULARS)]));
  });

  it('agrees with every line the generator can plant, sampled or not', () => {
    const [template] = applicants;
    const saying = (transcript: string) => ({ ...template, video: { ...template.video, transcript } });
    const before = Object.values(NOISE).flatMap((n) => n.before);
    const after = Object.values(NOISE).flatMap((n) => n.after);
    /** The line alone, with every slip in its small words, every piece of chatter before or after it, and every aside anywhere in it. */
    const chattered = (line: string) => {
      const words = line.split(' ');
      const asides = ASIDES.flatMap((aside) => words.slice(1).map((_, at) => [...words.slice(0, at), `${words[at]},`, `${aside},`, ...words.slice(at + 1)].join(' ')));
      const slips = SLIPS.map(([from, to]) => line.replace(from, to));
      return [line, ...slips, ...before.map((b) => `${b} ${line}`), ...after.map((a) => `${line} ${a}`), ...asides];
    };

    for (const line of [...chattered(PHRASE), ...Object.values(REGULARS).flatMap((r) => r.videos)]) {
      expect(judge(saying(line), rulebookForDay(1), []).valid, line).toBe(true);
    }
    const mistakes = Object.values(PHRASE_MISTAKES).flat();
    for (const line of [...mistakes.flatMap((l) => (l === '' ? [l] : chattered(l))), ...GARY_DAYS.map((g) => g.video)]) {
      expect(judge(saying(line), rulebookForDay(1), []).valid, line).toBe(false);
    }
  });
});
