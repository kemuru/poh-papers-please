// Stand-in for src/content/court.ts: the jurors' names and what their bubbles say. Integration moves
// this file there. The jurors are paid to agree, and some of them say so; the applicant is never
// the joke, and the court never gets a proven case wrong.
import type { Reason } from '../court/types';

/** The court's pool, by juror number (0 to 11). */
export const JUROR_NAMES = [
  'Marta Lind',
  'Oskar Brandt',
  'Ines Carvalho',
  'Tom Hale',
  'Priya Nair',
  'Walter Voss',
  'June Okafor',
  'Luca Moretti',
  'Agnes Pohl',
  'Sam Reyes',
  'Hana Sato',
  'Bert Ellery',
] as const;

/** Printed under the court's name. */
export const COURT_SESSION = 'Session of day {day}. Jurors are drawn in proportion to their stake.';

/** What each juror says, by why they voted as they did. `{rule}` is the rule's number. */
export const BUBBLES: Record<Reason, readonly string[]> = {
  evidence: ['It is in the file.', 'The clerk found it. So did I.', 'Upheld on the evidence.'],
  found: ['Rule {rule}. It is there if you look.', 'Rule {rule}. Uphold.', 'I checked Rule {rule}. It fails.'],
  missed: ['I looked. Nothing.', 'It all seems in order.', 'I found no fault.'],
  unopened: ['I did not open the file.', 'The file was very long.'],
  follows: ['Voting with the others.', 'Voting how I expect the others to vote.'],
  refuses: ['I refuse to arbitrate.', 'I decline to rule on this.'],
};

/** How a case came to court, above its jurors. */
export const HUNCH_LINE = 'No evidence filed. The jury looked for itself.';
