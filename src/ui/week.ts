// The week as the UI tracks it: which day, which screen, and what the clerk has done so far.
// It only records player actions; judgments come from src/rules, hearings from src/court, money
// from src/economy and the words from src/content through src/gen.
import { AGENT, CLERK, FIRST_APPLICANT, PAT, REGULARS, SYBIL_FARM } from '../content/cast';
import { ETHEL_LINES } from '../content/finale';
import { CAST_PORTRAITS, CLONE_PORTRAIT, FARM_HATS, FIRST_APPLICANT_PORTRAIT, UNIT_LAMPS } from '../content/portraits';
import { CAST_RULINGS, CITATION_MEMOS, CLERK_MEMO, DISMISSED_NOTES, FIRST_UNIT_DISMISSED, UNIT_MEMOS, UPHELD_NOTES, YEAR_MEMOS } from '../content/verdicts';
import { stamp } from '../court/court';
import { citationFor, endDay, OFFER, STARTING_SAVINGS, type Citation, type Credit, type DayEnd } from '../economy/economy';
import { endingTonight, gradeOf, type EndingId } from '../economy/endings';
import type { GeneratedApplicant } from '../gen/applicant';
import { DAYS, FIRST_UNIT_WITHDRAWN, LAST_DAY, morning, morningRegistry, PAT_DAYS } from '../gen/day';
import type { FinaleFacts, Sitter, Speaker } from '../gen/finale';
import { writeGazette, type Gazette, type WeekInNumbers, type Yesterday } from '../gen/gazette';
import type { WeekEnd } from '../gen/letters';
import { freshLine } from '../gen/lines';
import type { Accessory, Portrait } from '../gen/portrait';
import { RULE_DAYS, type Decision, type Outcome } from '../rules/judge';
import { sameName } from '../rules/registry';
import type { Registry } from '../rules/types';
import { appealCase, canAppeal, hearCase, isUpheld, settle, type CourtCase, type Evidence } from './court';

/**
 * Where the week is: at the window, in court, at the accounts, and at the end the letter. Every letter but
 * Fired's comes after six o'clock on Humanity Day, the first hour of the income, played in the hall (`finale`).
 */
export type Phase = 'shift' | 'court' | 'statement' | 'finale' | 'ending';

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
  | { type: 'next-day'; queue: GeneratedApplicant[] }
  /** Six o'clock is over, played through or skipped: on to the letter. */
  | { type: 'letter' };

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
      // A fired clerk never sees six o'clock: the letter comes that evening. Every other week ends in the hall first.
      if (ending) return { ...s, phase: ending === 'fired' ? 'ending' : 'finale', savings: s.end.after, history, ending };
      const day = s.day + 1;
      const gazette = writeGazette(day, yesterday(s, action.queue), s.shown, { handedIn: s.day === OFFER.day && s.offer === 'handed-in' });
      // Signed, Likeness pays for every unit stamped in: an envelope on the desk in the morning.
      const paid = s.offer === 'signed' ? log.registered.filter((r) => r.unit && r.broke && r.by === 'stamp').map((r) => r.name) : [];
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
    case 'letter':
      return s.phase === 'finale' ? { ...s, phase: 'ending' } : s;
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
/** Units the clerk's own stamp let in against the rulebook. Day 1's broke no rule, and does not count. */
export const unitsStamped = (history: readonly DayLog[]) =>
  history.flatMap((d) => d.registered.filter((r) => r.unit && r.broke && r.by === 'stamp').map((r) => ({ name: r.name, day: d.day })));

/** The first person the clerk stamped in this week, if the week began on day 1 and anyone was. */
const firstStamped = (history: readonly DayLog[]) => (history[0]?.day === 1 ? (history[0].registered.find((r) => r.by === 'stamp')?.name ?? '') : '');

/** A Robin Hale registered this week before Humanity Day: the clone, whose day is day 6. The clerk's own renewal is day 7's. */
const cloneOnFile = (registry: Registry) => registry.some((r) => r.name === CLERK.name && r.day >= 1 && r.day < LAST_DAY);

/** What the letter and the special edition need to know about a week that has ended: at six o'clock, or at the letter. */
export function weekEnd(s: GameState): { end: WeekEnd; numbers: WeekInNumbers } | null {
  if ((s.phase !== 'ending' && s.phase !== 'finale') || !s.ending) return null;
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
      voucherFirst: firstStamped(s.history) === (s.history.find((d) => d.selfVoucher)?.selfVoucher ?? null),
      fakesRegistered: s.history.reduce((n, d) => n + d.fooled, 0),
      humansChallenged: s.history.reduce((n, d) => n + d.wronged, 0),
      offer: s.offer,
    },
    numbers: {
      // A unit here is one let in against the rulebook: day 1's broke no rule, and left the next morning.
      registered: s.history.flatMap((d) => d.registered.map((r) => ({ name: r.name, day: d.day, unit: r.unit && r.broke, by: r.by }))),
      challenged: s.history.reduce((n, d) => n + d.challenged, 0),
      upheld: s.history.reduce((n, d) => n + d.upheld, 0),
      patDay: pat.length > 0 ? Math.min(...pat) : null,
      patDays: PAT_DAYS,
    },
  };
}

/** Who is in the hall at six o'clock on Humanity Day, and where: what the finale is drawn and written from. */
export type AtSix = {
  facts: FinaleFacts;
  /**
   * Window 3's bench, left to right: the humans of the last queue, then everyone else this week's registry holds (the
   * units the clerk or the court let in among them, and Pat in the middle), then the farm, sharing its one face.
   */
  here: Sitter[];
  /**
   * Window 2's bench: the units Window 3 refused, which the other Ministry registered, whoever else it refused, and
   * at the end nearest Window 2 the other Robin Hale, unless the registry kept him (then he is on Window 3's).
   */
  there: Sitter[];
  /** The board's number before the first hour: the week's last ticket. */
  serving: number;
};

/** Seats on each bench, the speakers included, filled out with the week's own people where there are fewer. */
const BENCH_HERE = 10;
const BENCH_THERE = 8;

/**
 * The hall at six, read from the week: the registry as it stands, the evenings' logs, and the queues (the days
 * before a week began on a later morning are as a clerk with no mistakes left them). It decides nothing: the
 * ending is already the week's.
 */
export function atSix(s: GameState, week: readonly (readonly GeneratedApplicant[])[]): AtSix | null {
  if ((s.phase !== 'finale' && s.phase !== 'ending') || !s.ending || s.ending === 'fired') return null;
  const startDay = s.history[0]?.day ?? s.day;
  const onFile = (name: string, day?: number) => s.registry.some((r) => r.name === name && (day === undefined ? r.day >= 1 : r.day === day));
  const log = (day: number) => s.history.find((d) => d.day === day);
  /** Stamped or heard at Window 3 and not registered: refused (a week begun later: every fake before it was). */
  const refused = (a: GeneratedApplicant, day: number, i: number) => {
    if (onFile(a.name, day)) return false;
    if (day < startDay) return a.planted.length > 0;
    const marks = log(day)?.marks;
    return marks !== undefined && marks[i] !== 'home';
  };
  const came = (day: number, cast: GeneratedApplicant['cast']) =>
    week[day - 1].some((a, i) => a.cast === cast && (day < startDay || (log(day)?.marks[i] ?? 'home') !== 'home'));

  const pat = s.registry.filter((r) => r.name === PAT.name && r.day >= 1).map((r) => r.day);
  const facts: FinaleFacts = {
    cousinsRegistered: SYBIL_FARM.cousins.filter((c) => onFile(c.name)).length,
    agent: onFile(AGENT.name) ? 'registered' : came(6, 'agent') ? 'refused' : 'absent',
    robinOnFile: cloneOnFile(s.registry),
    offer: s.offer,
    hortenseRemoved: s.history.some((d) => d.selfVoucher === FIRST_APPLICANT.name),
    ethelSaidPaper: startDay === 1 && week[0].find((a) => a.cast === 'grandmaEthel')?.remark === ETHEL_LINES.paper,
    socratesRegistered: onFile(REGULARS.socrates.name),
    patAttempt: pat.length > 0 ? PAT_DAYS.indexOf(Math.min(...pat)) + 1 || null : null,
  };

  const sitter = (name: string, face: Portrait, speaker: Speaker | null = null, lamp: Sitter['lamp'] = null): Sitter => ({ name, face, lamp, speaker });
  // Every unit of the week but the first, which its household withdrew: on the bench of whichever Ministry has it.
  const units = week.slice(FIRST_UNIT_WITHDRAWN - 1).map((queue, k) => {
    const day = k + FIRST_UNIT_WITHDRAWN;
    const i = queue.findIndex((a) => a.cast === 'unit');
    const u = queue[i];
    // The current models, whose lamps wait out a blink, light up too, once the dark has lasted.
    const tell = UNIT_LAMPS[day - 1];
    const unit: Sitter = { ...sitter(u.name, u.photo, null, tell?.lamp ?? 'glow'), ...(tell ? {} : { waits: true as const }) };
    return { unit, day, here: onFile(u.name, day), there: refused(u, day, i) };
  });
  const agent = sitter(AGENT.name, CAST_PORTRAITS.agent, 'agent');
  const robin = sitter(CLERK.name, CLONE_PORTRAIT, 'robin');

  const named = new Set<string>([
    REGULARS.grandmaEthel.name, FIRST_APPLICANT.name, REGULARS.socrates.name, PAT.name, AGENT.name, CLERK.name,
    ...SYBIL_FARM.cousins.map((c) => c.name), ...week.flat().filter((a) => a.cast === 'unit').map((a) => a.name),
  ]);
  // Everyone else the registry took in this week, and everyone else Window 3 refused, by day: each once, whoever
  // came back in a hat.
  const once = <T extends { who: Sitter }>(seats: T[]) => seats.filter((x, i) => seats.findIndex((y) => y.who.name === x.who.name) === i);
  const registered = once(s.registry.filter((r) => r.day >= 1 && !named.has(r.name)).map((r) => ({ day: r.day, who: sitter(r.name, r.face) })));
  const turnedAway = once(
    week.flatMap((queue, d) =>
      queue.flatMap((a, i) => (!named.has(a.name) && !onFile(a.name) && refused(a, d + 1, i) ? [{ day: d + 1, who: sitter(a.name, a.video.face) }] : [])),
    ),
  );

  const humans = [
    sitter(REGULARS.grandmaEthel.name, CAST_PORTRAITS.grandmaEthel, 'ethel'),
    sitter(FIRST_APPLICANT.name, FIRST_APPLICANT_PORTRAIT, 'hortense'),
    sitter(REGULARS.socrates.name, CAST_PORTRAITS.socrates, 'socrates'),
  ];
  const farm = SYBIL_FARM.cousins.map((c, i) =>
    sitter(c.name, { ...CAST_PORTRAITS.sybilFarm, accessories: [FARM_HATS[i] as Accessory] }, (['terry', 'kerry', 'perry'] as const)[i]),
  );
  const middle = [
    ...units.filter((u) => u.here).map((u) => ({ day: u.day, who: u.unit })),
    ...(facts.agent === 'registered' ? [{ day: 6, who: agent }] : []),
    ...(facts.robinOnFile ? [{ day: 6, who: robin }] : []),
  ];
  const hereMiddle = byDay([...middle, ...spread(registered, BENCH_HERE - humans.length - farm.length - 1 - middle.length)]);
  // Pat in the middle of the bench, where the last line is said.
  const centre = Math.floor(hereMiddle.length / 2);
  const here = [...humans, ...hereMiddle.slice(0, centre), sitter(PAT.name, CAST_PORTRAITS.pat, 'pat'), ...hereMiddle.slice(centre), ...farm];

  const thereFixed = [
    ...units.filter((u) => u.there).map((u) => ({ day: u.day, who: u.unit })),
    ...(facts.agent !== 'registered' ? [{ day: 6, who: agent }] : []),
  ];
  // The other Robin Hale sits at the end nearest Window 2, which registered him.
  const robinThere = facts.robinOnFile ? [] : [robin];
  const there = [...byDay([...thereFixed, ...spread(turnedAway, BENCH_THERE - thereFixed.length - robinThere.length)]), ...robinThere];
  return { facts, here, there, serving: DAYS.reduce((n, d) => n + d.applicants, 0) };
}

/** Sitters in the order the week met them. */
const byDay = (seats: readonly { day: number; who: Sitter }[]) => [...seats].sort((a, b) => a.day - b.day).map((s) => s.who);

/** `count` of the week's people, spread across it rather than all from one day. */
function spread<T>(from: readonly T[], count: number): T[] {
  if (count <= 0) return [];
  if (from.length <= count) return [...from];
  return Array.from({ length: count }, (_, k) => from[Math.floor(((k + 0.5) * from.length) / count)]);
}

/** The memo at the foot of a citation: a unit's is the day's, the clerk's own is the week's last, everyone else's the rule's. */
function citationMemo(s: GameState, applicant: GeneratedApplicant, outcome: Outcome): string | null {
  if (applicant.cast === 'clerk' && !s.shown.includes(CLERK_MEMO)) return CLERK_MEMO;
  if (applicant.cast === 'unit') {
    const line = UNIT_MEMOS[s.day];
    if (line && !s.shown.includes(line)) return line;
  }
  const v = outcome.violations[0];
  if (!v) return null;
  return freshLine(v.rule === 'living' && v.problem === 'born' ? YEAR_MEMOS : CITATION_MEMOS[v.rule], s.shown, s.decided.length + s.day);
}

/** The court's closing line: what it adds for someone it has met before, or the general run of them. */
function courtNote(day: number, a: GeneratedApplicant, upheld: boolean, index: number, shown: readonly string[]): string | null {
  // Day 1's unit, challenged on a hunch: the court finds nothing it may find, and says so.
  if (a.cast === 'unit' && day < RULE_DAYS.face && !upheld && !shown.includes(FIRST_UNIT_DISMISSED)) return FIRST_UNIT_DISMISSED;
  const cast = a.cast ? CAST_RULINGS[a.cast][upheld ? 'upheld' : 'dismissed'] : undefined;
  const from = a.cast === 'unit' ? day - 1 : index + day;
  return (cast && freshLine(cast, shown, from)) ?? freshLine(upheld ? UPHELD_NOTES : DISMISSED_NOTES, shown, index + day);
}

/** What the Gazette's reporter saw at Window 3 today. A voucher removed at five is photographed as the registry had them at the window. */
function yesterday(s: GameState, queue: GeneratedApplicant[]): Yesterday {
  const rulingAt = new Map(s.rulings.map((r) => [r.index, r]));
  const onFile = (name: string) => (s.bench?.registry ?? s.registry).find((r) => sameName(r.name, name))?.face ?? null;
  return {
    day: s.day,
    cases: s.decided.map((d, i) => {
      const removed = d.decision === 'challenge' ? (rulingAt.get(i)?.removed ?? null) : null;
      return {
        name: queue[i].name,
        face: queue[i].photo,
        unit: queue[i].cast === 'unit',
        decision: d.decision,
        broke: d.outcome.violations.map((v) => v.rule),
        ...(d.decision === 'challenge' ? { upheld: rulingAt.get(i)?.upheld ?? false, removed, removedFace: removed ? onFile(removed) : null } : {}),
      };
    }),
    sentHome: queue.slice(s.decided.length).map((a) => ({ name: a.name, face: a.photo })),
  };
}
