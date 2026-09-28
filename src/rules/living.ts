// Rule 6: living. Born between 1900 and today, and blinks in the video.
import type { Applicant } from './types';

/** The year it is at the Ministry. */
export const THIS_YEAR = 2026;
export const EARLIEST_BIRTH = 1900;

export const isLivingYear = (year: number | string) => typeof year === 'number' && year >= EARLIEST_BIRTH && year <= THIS_YEAR;

/** Null when the year is a living one and a frame shows a blink. */
export function checkLiving(a: Applicant): { problem: 'born' | 'blink'; born: number | string } | null {
  if (!isLivingYear(a.birthYear)) return { problem: 'born', born: a.birthYear };
  if (!a.video.blinked) return { problem: 'blink', born: a.birthYear };
  return null;
}
