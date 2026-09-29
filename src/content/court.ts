// The Humanity Court's words: the jurors' names and what their bubbles say. The jurors are paid to
// agree, and some of them say so; the applicant is never the joke, and the court never gets a proven
// case wrong. A bubble is flavour: the same lines serve a valid applicant and a fake the jury missed.
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
  evidence: ['It is in the file.', 'The clerk found it. So did I.'],
  found: ['Rule {rule}. It is there if you look.', 'Rule {rule}. Uphold.'],
  missed: ['I looked. Nothing.', 'I found no fault.'],
  unopened: ['I did not open the file.', 'The file was very long.'],
  follows: ['Voting with the others.', 'Voting how I expect the others to vote.'],
  refuses: ['I refuse to arbitrate.'],
};

/** How a case came to court, above its jurors. */
export const HUNCH_LINE = 'No evidence filed. The jury looked for itself.';
