// The week as the UI tracks it: which day, which screen, and what the clerk has done so far.
// It only records player actions; judgments come from src/rules and money from src/economy.
import { STARTING_SAVINGS, type Citation, type DayEnd } from '../economy/economy';
import { DAYS } from '../gen/day';
import type { Decision, Outcome } from '../rules/judge';

export type Phase = 'shift' | 'court' | 'statement' | 'ending';

/** A decision at the window, with what the rulebook says about it and the citation it printed. */
export type Decided = { decision: Decision; outcome: Outcome; citation: Citation | null };

export type GameState = {
  seed: number;
  day: number;
  savings: number;
  phase: Phase;
  /** The morning shutter is up and the clock is running. */
  opened: boolean;
  /** How many applicants have been called to the window, in queue order. */
  called: number;
  /** decided[i] is about the i-th applicant in the day's queue. */
  decided: Decided[];
  /** The shift clock ran out: whoever is left goes home unprocessed. */
  timeUp: boolean;
  /** The day's accounts, once the shift is closed. */
  end: DayEnd | null;
};

export type Action =
  | { type: 'open' }
  | { type: 'call' }
  | { type: 'decide'; decided: Decided }
  | { type: 'time-up' }
  | { type: 'close'; end: DayEnd }
  | { type: 'statement' }
  | { type: 'next-day' };

export const startWeek = (seed: number, day = 1): GameState => ({
  seed,
  day,
  savings: STARTING_SAVINGS,
  phase: 'shift',
  opened: false,
  called: 0,
  decided: [],
  timeUp: false,
  end: null,
});

/** The applicant standing at the window, waiting for a stamp; null if nobody is. */
export const atWindow = (s: GameState): number | null => (s.called > s.decided.length ? s.called - 1 : null);

/** Nobody else will be seen today: the queue is done or the clock ran out. */
export const shiftOver = (s: GameState) => s.timeUp || s.decided.length === DAYS[s.day - 1].applicants;

export function reduce(s: GameState, action: Action): GameState {
  switch (action.type) {
    case 'open':
      return s.phase === 'shift' ? { ...s, opened: true } : s;
    case 'call':
      return s.opened && !shiftOver(s) && atWindow(s) === null && s.called < DAYS[s.day - 1].applicants
        ? { ...s, called: s.called + 1 }
        : s;
    case 'decide':
      // The first stamp stands, however fast the second one comes down.
      return atWindow(s) !== null && !s.timeUp ? { ...s, decided: [...s.decided, action.decided] } : s;
    case 'time-up':
      return s.phase === 'shift' && s.opened && !shiftOver(s) ? { ...s, timeUp: true } : s;
    case 'close':
      return s.phase === 'shift' && shiftOver(s) ? { ...s, phase: 'court', end: action.end } : s;
    case 'statement':
      return s.phase === 'court' ? { ...s, phase: 'statement' } : s;
    case 'next-day': {
      if (s.phase !== 'statement' || !s.end) return s;
      if (s.end.fired || s.end.promoted) return { ...s, phase: 'ending', savings: s.end.after };
      return { ...startWeek(s.seed, s.day + 1), savings: s.end.after };
    }
  }
}
