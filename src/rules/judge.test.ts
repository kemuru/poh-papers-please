import { describe, expect, it } from 'vitest';
import { DAY_ONE_RULEBOOK } from '../content/dayOne';
import { generateApplicant } from '../gen/applicant';
import type { Applicant } from '../model';
import { judge } from './judge';

// Independent fixture: these expected words are transcribed from the design, not the generator.
const phrase = 'I certify that I am a real human and that I am not already registered in this registry.';
const withTranscript = (transcript: string): Applicant => {
  const applicant = generateApplicant(0);
  return { ...applicant, video: { ...applicant.video, transcript } };
};

describe('day 1 phrase rule', () => {
  it('publishes the declaration specified by the design', () => {
    expect(DAY_ONE_RULEBOOK.requiredPhrase).toBe(phrase);
  });

  it.each([
    ['exact phrase', phrase],
    ['capitalization', phrase.toUpperCase()],
    ['punctuation', 'I certify, that I am a real human; and that I am not already registered in this registry!'],
    ['spacing', `  ${phrase.replaceAll(' ', ' \n\t ')}  `],
  ])('accepts %s', (_, transcript) => {
    expect(judge(withTranscript(transcript), DAY_ONE_RULEBOOK, [])).toEqual({ valid: true, violations: [] });
  });

  it.each([
    ['typo', phrase.replace('human', 'hooman')],
    ['ordinary typo', phrase.replace('registry', 'regsitry')],
    ['missing words', 'I certify that I am a real human.'],
    ['extra words', `${phrase} Please.`],
    ['silence', ''],
    ['whitespace only', ' \n\t '],
    ['punctuation only', '...'],
    ['changed order', phrase.replace('real human', 'human real')],
    ['joined words', phrase.replace('real human', 'realhuman')],
    ['split word', phrase.replace('human', 'hu-man')],
    ['a number added', `${phrase} 1`],
  ])('rejects %s with the named rule', (_, transcript) => {
    expect(judge(withTranscript(transcript), DAY_ONE_RULEBOOK, [])).toEqual({ valid: false, violations: ['day-1-phrase'] });
  });

  it('reads the supplied rulebook rather than a hardcoded declaration', () => {
    expect(judge(withTranscript(phrase), { day: 1, requiredPhrase: `${phrase} Please.` }, []).valid).toBe(false);
  });

  it('judges the visible declaration, never planted truth, looks, age or registry membership', () => {
    const applicant = { ...withTranscript(phrase), birthYear: -470, planted: ['day-1-phrase'] as const };
    expect(judge(applicant, DAY_ONE_RULEBOOK, [applicant])).toEqual({ valid: true, violations: [] });
    expect(judge({ ...withTranscript(''), planted: [] }, DAY_ONE_RULEBOOK, []).valid).toBe(false);
  });

  it('does not mutate any input', () => {
    const applicant = withTranscript(phrase);
    const registry = [applicant];
    const before = structuredClone({ applicant, rulebook: DAY_ONE_RULEBOOK, registry });
    judge(applicant, DAY_ONE_RULEBOOK, registry);
    expect({ applicant, rulebook: DAY_ONE_RULEBOOK, registry }).toEqual(before);
  });
});
