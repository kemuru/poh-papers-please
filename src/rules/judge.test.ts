import { describe, expect, it } from 'vitest';
import { generatePortrait } from '../gen/portrait';
import { decide, judge, rulebookForDay } from './judge';
import { PHRASE } from './phrase';
import type { Applicant } from './types';

const face = generatePortrait(1);
const applicant = (transcript: string): Applicant => ({
  name: 'Test Applicant',
  address: '1 Test Street, Testbury',
  birthYear: 1980,
  photo: face,
  video: { face, transcript, blinked: true },
  remark: '',
});

describe('rulebookForDay', () => {
  it('has the phrase rule from day 1', () => {
    expect(rulebookForDay(1)).toEqual(['phrase']);
  });
});

describe('judge', () => {
  it('finds nothing wrong with a valid applicant', () => {
    expect(judge(applicant(PHRASE), rulebookForDay(1), [])).toEqual({ valid: true, violations: [] });
  });

  it('reports the phrase rule for an invalid applicant', () => {
    const { valid, violations } = judge(applicant('I certify I am a real hooman.'), rulebookForDay(1), []);
    expect(valid).toBe(false);
    expect(violations.map((v) => v.rule)).toEqual(['phrase']);
  });

  it('only applies the rules in the rulebook', () => {
    expect(judge(applicant(''), [], []).valid).toBe(true);
  });

  it('does not read the remark: small talk at the window is not the video', () => {
    expect(judge({ ...applicant(PHRASE), remark: 'What is a human, really?' }, rulebookForDay(1), []).valid).toBe(true);
  });
});

describe('decide', () => {
  const validJudgment = judge(applicant(PHRASE), rulebookForDay(1), []);
  const invalidJudgment = judge(applicant(''), rulebookForDay(1), []);

  it('is correct to accept a valid applicant or challenge an invalid one', () => {
    expect(decide('accept', validJudgment)).toEqual({ correct: true, violations: [] });
    expect(decide('challenge', invalidJudgment)).toEqual({ correct: true, violations: invalidJudgment.violations });
  });

  it('is wrong to accept an invalid applicant or challenge a valid one', () => {
    expect(decide('accept', invalidJudgment)).toEqual({ correct: false, violations: invalidJudgment.violations });
    expect(decide('challenge', validJudgment)).toEqual({ correct: false, violations: [] });
  });
});
