// Seeded applicants. Each one carries `planted`, the violations it was built with,
// so tests can check the rule engine against the truth without trusting it.
import { FIRST_NAMES, LAST_NAMES, PHRASE_MISTAKES, REMARKS, STREETS, TOWNS } from '../content/applicants';
import { PHRASE } from '../rules/phrase';
import type { Applicant, RuleId } from '../rules/types';
import { generatePortrait, weighted, type Age } from './portrait';
import { createRng } from './rng';

export type PhraseMistake = 'wrong-word' | 'missing-words' | 'extra-words' | 'silence' | 'quiet-word';
export type Planted = { rule: RuleId; mistake: PhraseMistake };
export type GeneratedApplicant = Applicant & { planted: Planted[] };

/** Most applicants are valid (design: 65 to 75% on any day). */
const FAKE_SHARE = 0.3;
/** Day 1 fakes: mostly clear slips, about one in four a quiet one-word change. */
const MISTAKES: readonly (readonly [PhraseMistake, number])[] = [
  ['wrong-word', 9], ['missing-words', 7], ['extra-words', 9], ['silence', 5], ['quiet-word', 10],
];
/** Birth years that fit the face in the photo. */
const BIRTH_YEARS: Record<Age, readonly [number, number]> = {
  young: [1996, 2006],
  adult: [1965, 1995],
  old: [1931, 1964],
};

/** A day 1 applicant: an ordinary member of the public who may or may not say the phrase. */
export function generateApplicant(seed: number): GeneratedApplicant {
  const rng = createRng(seed);
  // The portrait gets its own seed so its features are independent of everything rolled here.
  const photo = generatePortrait(rng.int(0, 0xffffffff));
  const mistake = rng.next() < FAKE_SHARE ? weighted(rng, MISTAKES) : null;
  const [earliest, latest] = BIRTH_YEARS[photo.face.age];
  return {
    name: `${rng.pick(FIRST_NAMES)} ${rng.pick(LAST_NAMES)}`,
    address: `${rng.int(1, 199)} ${rng.pick(STREETS)}, ${rng.pick(TOWNS)}`,
    birthYear: rng.int(earliest, latest),
    photo,
    video: { face: photo, transcript: mistake ? rng.pick(PHRASE_MISTAKES[mistake]) : PHRASE, blinked: true },
    remark: rng.pick(REMARKS),
    planted: mistake ? [{ rule: 'phrase', mistake }] : [],
  };
}
