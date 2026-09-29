// The letters at the end of the week, filled from what this week did (notes/game-design.md, Endings).
// Pure: the same week always writes the same letters. The words are src/content's.
import { FIRST_APPLICANT } from '../content/cast';
import { ENDINGS, FIRED_COSTS, HEADHUNTED, LETTER_NOTES, VOUCHER_REMOVED } from '../content/verdicts';
import { headhunted, type EndingId, type Grade } from '../economy/endings';

/** What the evening at the end of the week knows. */
export type WeekEnd = {
  ending: EndingId;
  /** The day the week ended on. */
  day: number;
  savings: number;
  grade: Grade;
  /** Likeness units the clerk stamped in, in order, with the day. */
  unitsStamped: readonly { name: string; day: number }[];
  /** What became of the clerk's own renewal on Humanity Day: stamped in, or challenged and then upheld or dismissed. */
  self: 'accepted' | 'upheld' | 'dismissed' | null;
  /** Whoever vouched for the clerk, removed from the registry with them when their own challenge was upheld. */
  voucherRemoved: string | null;
  /** Applicants the clerk stamped in who broke a rule, and challenged who broke none. */
  fakesRegistered: number;
  humansChallenged: number;
  offer: 'signed' | 'handed-in' | null;
};

export type Letter = { title: string; stamp: string; lines: string[]; grade: string | null; note: string | null };
export type Clip = { head: string; title: string; lines: string[]; sign: string };

const fill = (line: string, values: Record<string, string | number>) =>
  Object.entries(values).reduce((out, [key, value]) => out.replaceAll(`{${key}}`, String(value)), line);

const count = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/** "Clara Voss (day 1), Martin Ellery (day 2) and Joanna Pike (day 3)". */
export function listOf(items: readonly string[]): string {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

const unitNames = (w: WeekEnd) => listOf(w.unitsStamped.map((u) => `${u.name} (day ${u.day})`));

/** Human Resources' letter: the ending's lines, the ones about the clerk's own renewal chosen by what became of it. */
export function writeLetter(w: WeekEnd): Letter {
  const text = ENDINGS[w.ending];
  const values = {
    day: w.day,
    savings: w.savings,
    count: ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven'][w.unitsStamped.length] ?? w.unitsStamped.length,
    units: unitNames(w),
    fakes: count(w.fakesRegistered, 'applicant', 'applicants'),
    humans: count(w.humansChallenged, 'applicant', 'applicants'),
    grade: w.grade,
  };
  const lines = text.lines.flatMap((line): string[] => {
    if (line === '{voucherRemoved}') return w.voucherRemoved ? [voucherLine(w.voucherRemoved)] : [];
    if (line === '{costs}') {
      const which = w.fakesRegistered > 0 ? (w.humansChallenged > 0 ? 'both' : 'fakes') : w.humansChallenged > 0 ? 'humans' : null;
      return which ? [fill(FIRED_COSTS[which], values)] : [];
    }
    if (typeof line === 'string') return [fill(line, values)];
    const chosen = w.self ? (line as Partial<Record<NonNullable<WeekEnd['self']>, string>>)[w.self] : undefined;
    return chosen ? [chosen] : [];
  });
  const grade = 'grade' in text ? fill(text.grade, values) : null;
  return { title: text.title, stamp: text.stamp, lines, grade, note: noteFor(w) };
}

/** The clerk's voucher, gone with them; if it was Hortense Cobbold, who she was. */
const voucherLine = (voucher: string) =>
  [fill(VOUCHER_REMOVED.line, { voucher }), voucher === FIRST_APPLICANT.name ? VOUCHER_REMOVED.first : ''].filter(Boolean).join(' ');

/** What the letter adds about Likeness's offer, unless Likeness's own letter is clipped to it. */
function noteFor(w: WeekEnd): string | null {
  if (w.offer === 'handed-in') return LETTER_NOTES.handedIn;
  if (w.offer !== 'signed' || writeClip(w)) return null;
  return w.ending === 'replaced' ? LETTER_NOTES.signedReplaced : LETTER_NOTES.signed;
}

/** Likeness's letter, clipped to the clerk's: to the clerk, or to the Ministry about its new equipment. */
export function writeClip(w: WeekEnd): Clip | null {
  if (!headhunted(w.ending, w.offer === 'signed', w.unitsStamped.length)) return null;
  const lines = w.ending === 'reclassified' ? HEADHUNTED.equipment : HEADHUNTED.lines;
  return { head: HEADHUNTED.head, title: HEADHUNTED.title, lines: lines.map((line) => fill(line, { units: unitNames(w) })), sign: HEADHUNTED.sign };
}
