import { describe, expect, it } from 'vitest';
import { PHRASE_MISTAKES, REMARKS } from '../content/applicants';
import { PHRASE } from '../rules/phrase';
import { generateApplicant } from './applicant';

const seeds = (n: number) => Array.from({ length: n }, (_, i) => i + 1);
const day = seeds(1000).map(generateApplicant);
const fakes = day.filter((a) => a.planted.length > 0);

describe('generateApplicant', () => {
  it('gives the same applicant for the same seed', () => {
    for (const seed of seeds(200)) expect(generateApplicant(seed)).toEqual(generateApplicant(seed));
  });

  it('gives the same applicants as last time (snapshot)', () => {
    expect(seeds(4).map(generateApplicant)).toMatchSnapshot();
  });

  it('keeps 65 to 75% of applicants valid', () => {
    const share = (day.length - fakes.length) / day.length;
    expect(share).toBeGreaterThanOrEqual(0.65);
    expect(share).toBeLessThanOrEqual(0.75);
  });

  it('makes about one fake in four a quiet one-word change, and plants every kind of mistake', () => {
    const quiet = fakes.filter((a) => a.planted[0].mistake === 'quiet-word').length / fakes.length;
    expect(quiet).toBeGreaterThanOrEqual(0.15);
    expect(quiet).toBeLessThanOrEqual(0.35);
    expect(new Set(fakes.map((a) => a.planted[0].mistake))).toEqual(new Set(Object.keys(PHRASE_MISTAKES)));
  });

  it('breaks at most one rule on day 1, and only the phrase rule', () => {
    for (const a of day) {
      expect(a.planted.length).toBeLessThanOrEqual(1);
      for (const p of a.planted) expect(p.rule).toBe('phrase');
    }
  });

  it('has valid applicants say exactly the phrase, and fakes say one of the mistake lines', () => {
    for (const a of day) {
      if (a.planted.length === 0) expect(a.video.transcript).toBe(PHRASE);
      else expect(PHRASE_MISTAKES[a.planted[0].mistake]).toContain(a.video.transcript);
    }
  });

  it('shows the same face in the photo and the video, blinking', () => {
    for (const a of day) {
      expect(a.video.face).toEqual(a.photo);
      expect(a.video.blinked).toBe(true);
    }
  });

  it('gives birth years that fit the face in the photo', () => {
    const range = { young: [1996, 2006], adult: [1965, 1995], old: [1931, 1964] };
    for (const a of day) {
      const [earliest, latest] = range[a.photo.face.age];
      expect(a.birthYear).toBeGreaterThanOrEqual(earliest);
      expect(a.birthYear).toBeLessThanOrEqual(latest);
    }
  });

  it('uses every remark', () => {
    expect(new Set(day.map((a) => a.remark))).toEqual(new Set(REMARKS));
  });
});

describe('transcripts', () => {
  /** Greedy word wrap, as the browser does it in a monospace box. */
  const wrap = (text: string, width: number) =>
    text.split(' ').reduce<string[]>((lines, word) => {
      const last = lines[lines.length - 1];
      if (last !== undefined && `${last} ${word}`.length <= width) lines[lines.length - 1] = `${last} ${word}`;
      else lines.push(word);
      return lines;
    }, []);

  // game-design.md: at most two lines. The transcript box in desk.css is 60 characters wide.
  it('fit on two lines of the video strip', () => {
    for (const line of [PHRASE, ...Object.values(PHRASE_MISTAKES).flat()]) {
      expect(wrap(line, 60).length, line).toBeLessThanOrEqual(2);
    }
  });
});
