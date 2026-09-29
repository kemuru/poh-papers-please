// Today's week (slice 6): the seed for a date, so everyone who plays on the same day gets the same
// week, and the card a clerk can copy at the end of it. Pure: the date comes in from the UI, which
// reads the clock; nothing here does.
import type { EndingId, Grade } from '../economy/endings';

/** A calendar date, as the player's own computer has it. */
export type CalendarDate = { year: number; month: number; day: number };

// Murmur3's finaliser: every bit of the input moves every bit of the output.
const fmix = (h: number) => {
  h = Math.imul(h ^ (h >>> 16), 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  return (h ^ (h >>> 16)) >>> 0;
};

/**
 * The week for a date: the same date always gives the same seed, and different dates different weeks.
 * Kept to 1 to 999,999,999, the range a ?seed= link can name, so today's week can be shared as a link too.
 */
export function seedForDate({ year, month, day }: CalendarDate): number {
  const h = [year, month, day].reduce((acc, part) => fmix(((acc ^ part) + 0x9e3779b9) >>> 0), 0x746f6461 /* "toda" */);
  return 1 + (h % 999_999_999);
}

/** How each applicant of a day went, as the card draws them: stamped right, stamped wrong, or sent home. */
export type Marks = readonly ('right' | 'wrong' | 'home')[];

const SQUARES = { right: '🟩', wrong: '🟥', home: '⬜' } as const;

/**
 * "Copy my week": one row per day of stamps, the letter, the grade and the savings, and nobody's name.
 * `title` says whose week it was: "Today's week, 29 September 2026", or "Week 1234".
 */
export function weekCard({ title, days, letter, grade, savings }: { title: string; days: readonly { day: number; marks: Marks }[]; letter: string; grade: string | null; savings: number }): string {
  return [
    `Registry Window 3 · ${title}`,
    ...days.map(({ day, marks }) => `Day ${day} ${marks.map((m) => SQUARES[m]).join('')}`),
    [letter, grade, `${savings} PNK`].filter(Boolean).join(' · '),
  ].join('\n');
}

/** The letter and grade as the card names them. */
export function cardLetter(ending: EndingId, grade: Grade): { letter: string; grade: string | null } {
  const letter = { fired: 'Terminated', replaced: 'Replaced', superseded: 'Superseded', reclassified: 'Reclassified', promoted: 'Promoted' }[ending];
  const kind = ending === 'reclassified' ? 'Equipment' : 'Clerk';
  return { letter, grade: ending === 'promoted' || ending === 'reclassified' ? `${kind}, ${grade} Class` : null };
}
