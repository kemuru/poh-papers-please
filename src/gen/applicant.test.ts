import { describe, expect, it } from 'vitest';
import { DAY_ONE_RULEBOOK, PHRASE_VARIANTS } from '../content/dayOne';
import { judge } from '../rules/judge';
import { generateApplicant } from './applicant';

const seeds = Array.from({ length: 500 }, (_, seed) => seed);

describe('seeded day 1 applicants', () => {
  it('reproduces the entire applicant, including portraits and video, for every seed', () => {
    for (const seed of seeds) expect(generateApplicant(seed)).toEqual(generateApplicant(seed));
    expect(generateApplicant(1)).not.toEqual(generateApplicant(2));
  });

  it('matches a snapshot of complete applicants', () => {
    expect([0, 2, 3, 5].map(generateApplicant)).toMatchSnapshot();
  });

  it('oracle: judge finds exactly the planted violations in 500 seeded applicants', () => {
    let invalid = 0;
    for (const seed of seeds) {
      const applicant = generateApplicant(seed);
      const judgment = judge(applicant, DAY_ONE_RULEBOOK, []);
      expect(judgment.violations, `seed ${seed}`).toEqual(applicant.planted);
      expect(judgment.valid, `seed ${seed}`).toBe(applicant.planted.length === 0);
      if (!judgment.valid) invalid++;
    }
    expect(invalid).toBeGreaterThan(100);
    expect(invalid).toBeLessThan(200);
  });

  it('fair clues: every planted violation is a visible transcript difference; all four mistakes occur', () => {
    const badTranscripts = new Set<string>();
    const visibleClues = { 'day-1-phrase': 'video.transcript' } as const;
    const requiredWords = DAY_ONE_RULEBOOK.requiredPhrase.toLowerCase().replace(/[.,!]/g, '').split(' ');
    for (const seed of seeds) {
      const applicant = generateApplicant(seed);
      for (const violation of applicant.planted) {
        expect(visibleClues[violation]).toBe('video.transcript');
        const visibleWords = applicant.video.transcript.toLowerCase().replace(/[.,!]/g, '').split(' ');
        expect(visibleWords, `seed ${seed}`).not.toEqual(requiredWords);
        badTranscripts.add(applicant.video.transcript);
      }
      expect(applicant.video.frames).toHaveLength(3);
      expect(applicant.video.frames.every((frame) => frame.portrait === applicant.portrait)).toBe(true);
      expect(applicant.video.blinked).toBe(applicant.video.frames.some((frame) => frame.pose.eyes === 'closed'));
      if (!applicant.video.transcript) expect(applicant.video.frames.every((frame) => frame.pose.mouth === 'closed')).toBe(true);
    }
    expect(badTranscripts).toEqual(new Set([
      PHRASE_VARIANTS.typo, PHRASE_VARIANTS.missing, PHRASE_VARIANTS.extra, PHRASE_VARIANTS.silence,
    ]));
  });

  it('contains valid costumed applicants and invalid ordinary applicants', () => {
    const applicants = seeds.map(generateApplicant);
    expect(applicants.some((a) => a.portrait.species === 'raccoon' && !a.planted.length)).toBe(true);
    expect(applicants.some((a) => a.portrait.species === 'human' && a.planted.length)).toBe(true);
    expect(applicants.filter((a) => a.name === 'Dave').every((a) => !a.planted.length)).toBe(true);
    expect(applicants.filter((a) => a.name === 'Gary').every((a) => a.planted.length === 1)).toBe(true);
  });
});
