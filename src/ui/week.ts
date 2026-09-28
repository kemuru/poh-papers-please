// The week as the UI tracks it: which day, which screen, and what the clerk has done so far.
// It only records player actions; judgments come from src/rules, hearings from src/court, money
// from src/economy and the words from src/content through src/gen.
import { CAST_RULINGS, CITATION_MEMOS, DISMISSED_NOTES, UNIT_MEMOS, UPHELD_NOTES } from '../content/verdicts';
import { hearChallenges, stamp } from '../court/court';
import { citationFor, endDay, STARTING_SAVINGS, type Citation, type DayEnd } from '../economy/economy';
import type { GeneratedApplicant } from '../gen/applicant';
import { DAYS, morning, morningRegistry } from '../gen/day';
import { writeGazette, type Gazette, type Yesterday } from '../gen/gazette';
import { freshLine } from '../gen/lines';
import type { Decision, Outcome } from '../rules/judge';
import type { Registry } from '../rules/types';

export type Phase = 'shift' | 'court' | 'statement' | 'ending';

/** A decision at the window, with what the rulebook says about it and the citation it printed, with its memo. */
export type Decided = { decision: Decision; outcome: Outcome; citation: Citation | null; memo?: string };

/** What the court made of a challenge at five o'clock. */
export type Ruling = {
  /** Where the applicant was in the day's queue. */
  index: number;
  upheld: boolean;
  /** Whoever vouched for them, removed from the registry with them. */
  removed: string | null;
  /** The court's closing line, if the pools have one left this run. */
  note: string | null;
};

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
  /** The registry as the clerk has built it: every stamp this week, every ruling. */
  registry: Registry;
  /** The court's rulings on today's challenges, once the shift is closed. */
  rulings: Ruling[];
  /** This morning's Gazette; none on day 1, when the supervisor's letter is on the desk instead. */
  gazette: Gazette | null;
  /** Lines from the content pools printed so far this run: none is printed twice. */
  shown: string[];
};

export type Action =
  | { type: 'open' }
  | { type: 'call' }
  | { type: 'decide'; applicant: GeneratedApplicant; decision: Decision }
  | { type: 'time-up' }
  | { type: 'close'; queue: GeneratedApplicant[] }
  | { type: 'statement' }
  | { type: 'next-day'; queue: GeneratedApplicant[] };

/** A week begun on `day`: the registry as a clerk with no mistakes would have left it. */
export function startWeek(seed: number, day = 1): GameState {
  const gazette = day >= 2 ? writeGazette(day, null, []) : null;
  return {
    seed,
    day,
    savings: STARTING_SAVINGS,
    phase: 'shift',
    opened: false,
    called: 0,
    decided: [],
    timeUp: false,
    end: null,
    registry: morningRegistry(seed, day),
    rulings: [],
    gazette,
    shown: gazette ? [gazette.headlineLine] : [],
  };
}

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
    case 'decide': {
      // The first stamp stands, however fast the second one comes down.
      if (atWindow(s) === null || s.timeUp) return s;
      const { applicant, decision } = action;
      const { outcome, registry } = stamp(s.registry, s.day, applicant, decision);
      const cases = [...s.decided, { decision, outcome }].map((d) => ({ decision: d.decision, correct: d.outcome.correct }));
      const citation = citationFor(cases, s.decided.length);
      const memo = citation ? citationMemo(s, applicant, outcome) : null;
      const decided: Decided = { decision, outcome, citation, ...(memo ? { memo } : {}) };
      return { ...s, registry, decided: [...s.decided, decided], shown: memo ? [...s.shown, memo] : s.shown };
    }
    case 'time-up':
      return s.phase === 'shift' && s.opened && !shiftOver(s) ? { ...s, timeUp: true } : s;
    case 'close': {
      if (s.phase !== 'shift' || !shiftOver(s)) return s;
      const challenges = s.decided.flatMap((d, index) => (d.decision === 'challenge' ? [{ index, applicant: action.queue[index], outcome: d.outcome }] : []));
      const { hearings, registry } = hearChallenges(s.registry, s.day, challenges);
      const shown = [...s.shown];
      const rulings = hearings.map((h, n): Ruling => {
        const { index, applicant } = challenges[n];
        const note = courtNote(s.day, applicant, h.upheld, index, shown);
        if (note) shown.push(note);
        return { index, upheld: h.upheld, removed: h.removed, note };
      });
      const cases = s.decided.map((d) => ({ decision: d.decision, correct: d.outcome.correct }));
      return { ...s, phase: 'court', end: endDay(s.savings, s.day, cases, s.seed), registry, rulings, shown };
    }
    case 'statement':
      return s.phase === 'court' ? { ...s, phase: 'statement' } : s;
    case 'next-day': {
      if (s.phase !== 'statement' || !s.end) return s;
      if (s.end.fired || s.end.promoted) return { ...s, phase: 'ending', savings: s.end.after };
      const day = s.day + 1;
      const gazette = writeGazette(day, yesterday(s, action.queue), s.shown);
      return {
        ...startWeek(s.seed, day),
        savings: s.end.after,
        registry: morning(s.registry, day),
        gazette,
        shown: [...s.shown, gazette.headlineLine],
      };
    }
  }
}

/** The memo at the foot of a citation: a unit's is the day's, everyone else's the rule's. */
function citationMemo(s: GameState, applicant: GeneratedApplicant, outcome: Outcome): string | null {
  if (applicant.cast === 'unit') {
    const line = UNIT_MEMOS[s.day - 1];
    if (line && !s.shown.includes(line)) return line;
  }
  const rule = outcome.violations[0]?.rule;
  return rule ? freshLine(CITATION_MEMOS[rule], s.shown, s.decided.length + s.day) : null;
}

/** The court's closing line: what it adds for someone it has met before, or the general run of them. */
function courtNote(day: number, a: GeneratedApplicant, upheld: boolean, index: number, shown: readonly string[]): string | null {
  const cast = a.cast ? CAST_RULINGS[a.cast][upheld ? 'upheld' : 'dismissed'] : undefined;
  const from = a.cast === 'unit' ? day - 1 : index + day;
  return (cast && freshLine(cast, shown, from)) ?? freshLine(upheld ? UPHELD_NOTES : DISMISSED_NOTES, shown, index + day);
}

/** What the Gazette's reporter saw at Window 3 today. */
function yesterday(s: GameState, queue: GeneratedApplicant[]): Yesterday {
  const rulingAt = new Map(s.rulings.map((r) => [r.index, r]));
  return {
    day: s.day,
    cases: s.decided.map((d, i) => ({
      name: queue[i].name,
      unit: queue[i].cast === 'unit',
      decision: d.decision,
      broke: d.outcome.violations.map((v) => v.rule),
      ...(d.decision === 'challenge' ? { upheld: rulingAt.get(i)?.upheld ?? false, removed: rulingAt.get(i)?.removed ?? null } : {}),
    })),
    unprocessed: queue.length - s.decided.length,
  };
}
