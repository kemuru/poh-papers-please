// Rule 6: living. Born between 1900 and today, and alive on camera: filmed, not generated; a person,
// not a picture held up; and seen to blink.
import type { Applicant, Violation } from './types';

/** The year it is at the Ministry. */
export const THIS_YEAR = 2026;
export const EARLIEST_BIRTH = 1900;

export const isLivingYear = (year: number | string) => typeof year === 'number' && year >= EARLIEST_BIRTH && year <= THIS_YEAR;

/** Null when the video is a live person's, filmed, the year is a living one and a frame shows a blink. */
export function checkLiving(a: Applicant): Omit<Extract<Violation, { rule: 'living' }>, 'rule'> | null {
  if (!isLivingYear(a.birthYear)) return { problem: 'born', born: a.birthYear };
  if (a.video.still) return { problem: 'picture', born: a.birthYear };
  if (a.video.generated) return { problem: 'generated', born: a.birthYear };
  if (!a.video.blinked) return { problem: 'blink', born: a.birthYear };
  return null;
}
