import { describe, expect, it } from 'vitest';
import { PHRASE_MISTAKES } from './content/applicants';
import { generateApplicant } from './gen/applicant';
import { judge, rulebookForDay } from './rules/judge';
import { PHRASE } from './rules/phrase';

// acceptance.md, oracle check: the generator knows the truth by construction, so it
// tests the rule engine without trusting the engine's own logic.
const applicants = Array.from({ length: 500 }, (_, i) => generateApplicant(i + 1));

describe('oracle check', () => {
  it('judge() finds exactly the planted violations in 500 seeded applicants, no more, no fewer', () => {
    applicants.forEach(({ planted, ...visible }, i) => {
      // judge() only ever sees what the player sees: the answer is taken off first.
      const { valid, violations } = judge(visible, rulebookForDay(1), []);
      expect(violations.map((v) => v.rule).sort(), `seed ${i + 1}`).toEqual(planted.map((p) => p.rule).sort());
      expect(valid, `seed ${i + 1}`).toBe(planted.length === 0);
    });
  });

  it('is not vacuous: the sample has valid applicants and every kind of mistake', () => {
    expect(applicants.filter((a) => a.planted.length === 0).length).toBeGreaterThan(300);
    expect(new Set(applicants.flatMap((a) => a.planted.map((p) => p.mistake)))).toEqual(new Set(Object.keys(PHRASE_MISTAKES)));
  });

  it('agrees with every line the generator can plant, sampled or not', () => {
    const [template] = applicants;
    const saying = (transcript: string) => ({ ...template, video: { ...template.video, transcript } });
    expect(judge(saying(PHRASE), rulebookForDay(1), []).valid).toBe(true);
    for (const line of Object.values(PHRASE_MISTAKES).flat()) {
      expect(judge(saying(line), rulebookForDay(1), []).valid, line).toBe(false);
    }
  });
});
