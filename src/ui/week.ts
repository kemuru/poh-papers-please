// The week as the UI tracks it: which day, which screen, and what the clerk has done so far.
// It only records player actions; judgments come from src/rules, hearings from src/court, money
// from src/economy and the words from src/content through src/gen.
import { CLERK, PAT } from '../content/cast';
import { CAST_RULINGS, CITATION_MEMOS, CLERK_MEMO, DISMISSED_NOTES, UNIT_MEMOS, UPHELD_NOTES } from '../content/verdicts';
import { stamp } from '../court/court';
import { citationFor, endDay, OFFER, STARTING_SAVINGS, type Citation, type Credit, type DayEnd } from '../economy/economy';
import { endingTonight, gradeOf, type EndingId } from '../economy/endings';
import type { GeneratedApplicant } from '../gen/applicant';
import { DAYS, LAST_DAY, morning, morningRegistry, PAT_DAYS } from '../gen/day';
import { writeGazette, type Gazette, type WeekInNumbers, type Yesterday } from '../gen/gazette';
import type { WeekEnd } from '../gen/letters';
import { freshLine } from '../gen/lines';
import type { Decision, Outcome } from '../rules/judge';
import type { Registry } from '../rules/types';
import { appealCase, canAppeal, hearCase, isUpheld, settle, type CourtCase, type Evidence } from './court';

export type Phase = 'shift' | 'court' | 'statement' | 'ending';

/**
 * A decision at the window, with what the rulebook says about it and the citation it printed, with its
 * memo; a challenge filed on what Inspect found carries it as evidence.
 */
export type Decided = { decision: Decision; outcome: Outcome; citation: Citation | null; memo?: string; evidence?: Evidence };

/** What the court made of a challenge at five o'clock. */
export type Ruling = {
  /** Where the applicant was in the day's queue. */
  index: number;
  upheld: boolean;
  /** Whoever vouched for them, removed from the registry with them. */
  removed: string | null;
  /** The court's closing line, if the pools have one left this run. */
  note: string | null;
  /** The case as heard so far, appeals included. */
  court: CourtCase;
};

/** A day of the week as its evening closed it: what the week's report, its letter and the copy of the week are made from. */
export type DayLog = {
  day: number;
  /** Each applicant in queue order: stamped right or wrong, by the rulebook at the window, or sent home. */
  marks: ('right' | 'wrong' | 'home')[];
  /** Registered today, by the clerk's stamp or by the court: who, whether they broke a rule, whether a Likeness unit. */
  registered: { name: string; broke: boolean; unit: boolean; by: 'stamp' | 'court' }[];
  challenged: number;
  upheld: number;
  /** Stamped in though they broke a rule; challenged though they broke none. */
  fooled: number;
  wronged: number;
  /** On Humanity Day: what became of the clerk's own renewal, and whoever vouched for it, if they went with it. */
  self?: 'accepted' | 'upheld' | 'dismissed';
  selfVoucher?: string;
  /** Savings carried forward. */
  savings: number;
};

/** What the court sat with at five o'clock, so an appeal can settle the day again from the same place. */
export type Bench = {
  /** The registry as it stood when the court sat. */
  registry: Registry;
  /** Whoever was challenged, in the order of the rulings. */
  applicants: GeneratedApplicant[];
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
  /** Today's court, once it has sat. */
  bench: Bench | null;
  /** Likeness's letter, from the morning of day 3: signed, handed in, or neither. */
  offer: 'signed' | 'handed-in' | null;
  /** Money due on today's statement that is not pay: Likeness's envelope, the Ministry's commendation. */
  credits: Credit[];
  /** The days so far, as their evenings closed them. */
  history: DayLog[];
  /** The letter the week ended with, once it has. */
  ending: EndingId | null;
};

export type Action =
  /** Day 3's morning: Likeness's letter, signed or handed to the supervisor. */
  | { type: 'offer'; choice: 'signed' | 'handed-in' }
  | { type: 'open' }
  | { type: 'call' }
  | { type: 'decide'; applicant: GeneratedApplicant; decision: Decision; evidence?: Evidence | null }
  | { type: 'time-up' }
  | { type: 'close'; queue: GeneratedApplicant[] }
  /** The case of the index-th applicant goes to the next jury. */
  | { type: 'appeal'; index: number }
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
    bench: null,
    offer: null,
    credits: [],
    history: [],
    ending: null,
  };
}

/** The applicant standing at the window, waiting for a stamp; null if nobody is. */
export const atWindow = (s: GameState): number | null => (s.called > s.decided.length ? s.called - 1 : null);

/** Nobody else will be seen today: the queue is done or the clock ran out. */
export const shiftOver = (s: GameState) => s.timeUp || s.decided.length === DAYS[s.day - 1].applicants;

export function reduce(s: GameState, action: Action): GameState {
  switch (action.type) {
    case 'offer': {
      if (s.phase !== 'shift' || s.opened || s.day !== OFFER.day || s.offer !== null) return s;
      const commendation: Credit[] = action.choice === 'handed-in' ? [{ kind: 'commendation', count: 1, each: OFFER.commendation }] : [];
      return { ...s, offer: action.choice, credits: [...s.credits, ...commendation] };
    }
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
      const evidence = decision === 'challenge' ? action.evidence : null;
      const decided: Decided = { decision, outcome, citation, ...(memo ? { memo } : {}), ...(evidence ? { evidence } : {}) };
      return { ...s, registry, decided: [...s.decided, decided], shown: memo ? [...s.shown, memo] : s.shown };
    }
    case 'time-up':
      return s.phase === 'shift' && s.opened && !shiftOver(s) ? { ...s, timeUp: true } : s;
    case 'close': {
      if (s.phase !== 'shift' || !shiftOver(s)) return s;
      const heard = s.decided.flatMap((d, index) =>
        d.decision === 'challenge'
          ? [{ applicant: action.queue[index], court: hearCase({ seed: s.seed, day: s.day, index, violations: d.outcome.violations, evidence: d.evidence ?? null }) }]
          : [],
      );
      const bench: Bench = { registry: s.registry, applicants: heard.map((h) => h.applicant) };
      return sit({ ...s, phase: 'court' }, bench, heard.map((h) => h.court), []);
    }
    case 'appeal': {
      const n = s.rulings.findIndex((r) => r.index === action.index);
      if (s.phase !== 'court' || !s.bench || n < 0 || !canAppeal(s.rulings[n].court)) return s;
      return sit(s, s.bench, s.rulings.map((r, k) => (k === n ? appealCase(r.court) : r.court)), s.rulings);
    }
    case 'statement':
      return s.phase === 'court' ? { ...s, phase: 'statement' } : s;
    case 'next-day': {
      if (s.phase !== 'statement' || !s.end) return s;
      const log = dayLog(s, action.queue);
      const history = [...s.history, log];
      const ending = endingTonight({
        fired: s.end.fired,
        lastDay: s.day === LAST_DAY,
        unitsStamped: unitsStamped(history).length,
        cloneOnFile: cloneOnFile(s.registry),
        clerkRegistered: s.registry.some((r) => r.name === CLERK.name && r.day === LAST_DAY),
      });
      if (ending) return { ...s, phase: 'ending', savings: s.end.after, history, ending };
      const day = s.day + 1;
      const gazette = writeGazette(day, yesterday(s, action.queue), s.shown, { handedIn: s.day === OFFER.day && s.offer === 'handed-in' });
      // Signed, Likeness pays for every unit stamped in: an envelope on the desk in the morning.
      const paid = s.offer === 'signed' ? log.registered.filter((r) => r.unit && r.by === 'stamp').map((r) => r.name) : [];
      return {
        ...startWeek(s.seed, day),
        savings: s.end.after,
        registry: morning(s.registry, day),
        gazette,
        shown: [...s.shown, gazette.headlineLine],
        offer: s.offer,
        credits: paid.length > 0 ? [{ kind: 'fee', count: paid.length, each: OFFER.fee, for: paid }] : [],
        history,
      };
    }
  }
}

/**
 * The day's cases as they stand, applied to the registry the court sat with: the rulings, their
 * notes, the registry and the accounts. Run at five o'clock, with nothing printed yet, and again
 * after every appeal, with the rulings as printed. A printed note stays where it is: a case gets a
 * new one only when its ruling changes, from the lines not shown yet this run.
 */
function sit(s: GameState, bench: Bench, cases: CourtCase[], printed: readonly Ruling[]): GameState {
  const settled = settle(bench.registry, s.day, cases.map((c, n) => ({ applicant: bench.applicants[n], upheld: isUpheld(c) })));
  const shown = [...s.shown];
  const rulings = cases.map((court, n): Ruling => {
    const upheld = isUpheld(court);
    const was = printed[n];
    const note = was && was.upheld === upheld ? was.note : courtNote(s.day, bench.applicants[n], upheld, court.index, shown);
    if (note && note !== was?.note) shown.push(note);
    return { index: court.index, upheld, removed: settled.removed[n], note, court };
  });
  // A challenge is paid as the court ends it: upheld, the bounty (and after an appeal the fees back
  // and the bonus); dismissed, the deposit and any fees.
  const heardAt = new Map(rulings.map((r) => [r.index, { upheld: r.upheld, appeals: r.court.rounds.length - 1 }]));
  const tally = s.decided.map((d, i) => {
    const court = d.decision === 'challenge' ? heardAt.get(i) : undefined;
    return { decision: d.decision, correct: d.outcome.correct, ...(court ? { court } : {}) };
  });
  return { ...s, bench, registry: settled.registry, rulings, shown, end: endDay(s.savings, s.day, tally, s.seed, s.credits) };
}

/** The day as its evening closes it, for the week's log. */
function dayLog(s: GameState, queue: GeneratedApplicant[]): DayLog {
  const ruling = new Map(s.rulings.map((r) => [r.index, r]));
  const registered = s.decided.flatMap((d, i): DayLog['registered'] => {
    const by = d.decision === 'accept' ? 'stamp' : ruling.get(i)?.upheld === false ? 'court' : null;
    return by ? [{ name: queue[i].name, broke: d.outcome.violations.length > 0, unit: queue[i].cast === 'unit', by }] : [];
  });
  const own = queue.findIndex((a) => a.cast === 'clerk');
  const mine = own >= 0 ? s.decided[own] : undefined;
  return {
    day: s.day,
    marks: queue.map((_, i) => (!s.decided[i] ? 'home' : s.decided[i].outcome.correct ? 'right' : 'wrong')),
    registered,
    challenged: s.decided.filter((d) => d.decision === 'challenge').length,
    upheld: s.rulings.filter((r) => r.upheld).length,
    fooled: s.decided.filter((d) => d.decision === 'accept' && !d.outcome.correct).length,
    wronged: s.decided.filter((d) => d.decision === 'challenge' && !d.outcome.correct).length,
    ...(mine ? { self: mine.decision === 'accept' ? 'accepted' : ruling.get(own)?.upheld ? 'upheld' : 'dismissed' } : {}),
    ...(ruling.get(own)?.removed ? { selfVoucher: ruling.get(own)!.removed! } : {}),
    savings: s.end!.after,
  };
}

/** Likeness units the clerk stamped in this week, in order, with the day. */
export const unitsStamped = (history: readonly DayLog[]) =>
  history.flatMap((d) => d.registered.filter((r) => r.unit && r.by === 'stamp').map((r) => ({ name: r.name, day: d.day })));

/** A Robin Hale registered this week before Humanity Day: the clone, whose day is day 6. The clerk's own renewal is day 7's. */
const cloneOnFile = (registry: Registry) => registry.some((r) => r.name === CLERK.name && r.day >= 1 && r.day < LAST_DAY);

/** What the letter and the special edition need to know about a week that has ended. */
export function weekEnd(s: GameState): { end: WeekEnd; numbers: WeekInNumbers } | null {
  if (s.phase !== 'ending' || !s.ending) return null;
  const marks = s.history.flatMap((d) => d.marks);
  const right = marks.filter((m) => m === 'right').length;
  const stamped = marks.filter((m) => m !== 'home').length;
  const pat = s.registry.filter((r) => r.name === PAT.name && r.day >= 1).map((r) => r.day);
  return {
    end: {
      ending: s.ending,
      day: s.day,
      savings: s.savings,
      grade: gradeOf(right, stamped, s.savings),
      unitsStamped: unitsStamped(s.history),
      self: s.history.find((d) => d.self)?.self ?? null,
      voucherRemoved: s.history.find((d) => d.selfVoucher)?.selfVoucher ?? null,
      fakesRegistered: s.history.reduce((n, d) => n + d.fooled, 0),
      humansChallenged: s.history.reduce((n, d) => n + d.wronged, 0),
      offer: s.offer,
    },
    numbers: {
      registered: s.history.flatMap((d) => d.registered.map((r) => ({ name: r.name, day: d.day, unit: r.unit, by: r.by }))),
      challenged: s.history.reduce((n, d) => n + d.challenged, 0),
      upheld: s.history.reduce((n, d) => n + d.upheld, 0),
      patDay: pat.length > 0 ? Math.min(...pat) : null,
      patDays: PAT_DAYS,
      handedIn: s.offer === 'handed-in',
    },
  };
}

/** The memo at the foot of a citation: a unit's is the day's, the clerk's own is the week's last, everyone else's the rule's. */
function citationMemo(s: GameState, applicant: GeneratedApplicant, outcome: Outcome): string | null {
  if (applicant.cast === 'clerk' && !s.shown.includes(CLERK_MEMO)) return CLERK_MEMO;
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
