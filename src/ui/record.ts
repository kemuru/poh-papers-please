// The clerk's record (slice 6), kept in this browser beside the save: weeks finished, the letters found,
// the best of each, today's week and the Ministry that never closes. A save can be set aside; the record
// never is. Like the save, it is read and written through a Store, so tests can hand it a Map.
import { LETTERS, type EndingId, type Grade, type LetterId } from '../economy/endings';

export const RECORD_KEY = 'poh-record';

type Store = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export type ClerkRecord = {
  v: 1;
  /** Weeks that reached a letter. */
  weeks: number;
  /** Every letter found, in the order it was first found. */
  letters: LetterId[];
  bestSavings: number | null;
  bestGrade: Grade | null;
  /** Today's week, the last time it was finished: the date, the letter, the savings and the card to copy. */
  today: { date: string; letter: string; savings: number; card: string } | null;
  /** The Ministry never closes: the most stamps right before the third citation. */
  endless: number | null;
  /** The week last counted, so the same letter reloaded is not counted twice. */
  counted: string | null;
};

export const EMPTY_RECORD: ClerkRecord = { v: 1, weeks: 0, letters: [], bestSavings: null, bestGrade: null, today: null, endless: null, counted: null };

const GRADES: readonly Grade[] = ['First', 'Second', 'Third'];
const isLetter = (x: unknown): x is LetterId => typeof x === 'string' && (LETTERS as readonly string[]).includes(x);

/** The record in this browser, or an empty one: a record that cannot be read starts again, and says nothing. */
export function readRecord(store: Store | null): ClerkRecord {
  try {
    const raw = JSON.parse(store?.getItem(RECORD_KEY) ?? 'null') as Partial<ClerkRecord> | null;
    if (raw?.v !== 1) return EMPTY_RECORD;
    const whole = (n: unknown) => (Number.isSafeInteger(n) ? (n as number) : null);
    const today = raw.today;
    return {
      v: 1,
      weeks: Math.max(0, whole(raw.weeks) ?? 0),
      letters: Array.isArray(raw.letters) ? [...new Set(raw.letters.filter(isLetter))] : [],
      bestSavings: whole(raw.bestSavings),
      bestGrade: GRADES.includes(raw.bestGrade as Grade) ? (raw.bestGrade as Grade) : null,
      today:
        today && typeof today.date === 'string' && typeof today.letter === 'string' && typeof today.card === 'string' && Number.isSafeInteger(today.savings)
          ? { date: today.date, letter: today.letter, savings: today.savings, card: today.card }
          : null,
      endless: whole(raw.endless),
      counted: typeof raw.counted === 'string' ? raw.counted : null,
    };
  } catch {
    return EMPTY_RECORD;
  }
}

export function writeRecord(store: Store | null, record: ClerkRecord) {
  try {
    store?.setItem(RECORD_KEY, JSON.stringify(record));
  } catch {
    // Full or refused: the record lasts as long as the page.
  }
}

/** A week that has reached its letter, as the record keeps it. `id` names the week and where it ended, so it is counted once. */
export type Finished = {
  id: string;
  ending: EndingId;
  headhunted: boolean;
  savings: number;
  grade: Grade;
  /** Set when it was today's week: the date, the letter and its card. */
  today?: { date: string; letter: string; card: string };
};

/** The record with a finished week in it: counted once, however often its letter is shown again. */
export function withWeek(r: ClerkRecord, w: Finished): ClerkRecord {
  if (r.counted === w.id) return r;
  const found = [w.ending, ...(w.headhunted ? (['headhunted'] as const) : [])].filter((l) => !r.letters.includes(l));
  // Only a clerk who reached Humanity Day is graded; savings count whenever a week ends.
  const graded = w.ending === 'promoted' || w.ending === 'reclassified';
  const better = (a: Grade | null, b: Grade) => (a === null || GRADES.indexOf(b) < GRADES.indexOf(a) ? b : a);
  return {
    ...r,
    weeks: r.weeks + 1,
    letters: [...r.letters, ...found],
    bestSavings: r.bestSavings === null ? w.savings : Math.max(r.bestSavings, w.savings),
    bestGrade: graded ? better(r.bestGrade, w.grade) : r.bestGrade,
    today: w.today ? { ...w.today, savings: w.savings } : r.today,
    counted: w.id,
  };
}

/** The record with a finished endless shift in it: the best kept. */
export const withEndless = (r: ClerkRecord, right: number): ClerkRecord => ({ ...r, endless: r.endless === null ? right : Math.max(r.endless, right) });
