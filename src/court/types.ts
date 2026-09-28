// The Humanity Court as the desk, the court screen and the accounts share it (slice 4).
// A challenge goes to court with evidence (what Inspect found on the applicant) or on a hunch. The
// first jury has 3 seats; a dismissed hunch can be appealed to 7, then 15, each round for a fee and
// each looking harder. The engine (src/court/jury.ts) hears cases, the court screen (src/ui) shows
// them, the economy (src/economy) pays for them. Juror names, faces and bubbles are src/content's.
// Everything here follows from the week's seed, the day, the place in the queue, what the applicant
// broke and what the clerk found: the same week always gives the same court, appeals included.
import type { Item } from '../rules/inspect';
import type { Applicant, Registry, RuleId, Violation } from '../rules/types';

/** Seats in each round: the first jury, then the two appeals. There is no fourth round. */
export const JURY_SIZES = [3, 7, 15] as const;

/**
 * How many jurors the court draws from. A seat is drawn in proportion to stake, with replacement,
 * as Kleros draws: one juror can sit in several seats of a round, with one vote per seat.
 */
export const JUROR_POOL = 12;

/**
 * What Inspect found on the applicant at the window before the challenge: two things that disagree
 * and the rule in force they break (a finding under a rule not in force is not evidence). The case
 * slip prints it: "Evidence: Rule 3, the sign against the form."
 */
export type Evidence = { rule: RuleId; items: readonly [Item, Item] };

export type Vote = 'uphold' | 'dismiss' | 'abstain';

/**
 * What a juror's bubble says. Flavour only: a seat's vote comes from whether that juror found a
 * real fault, never from its reason, and a juror never finds a fault that is not there.
 * - evidence: the clerk's evidence was in front of them (uphold).
 * - found: looked and found a fault, `found` says under which rule (uphold).
 * - missed: looked and found nothing (dismiss).
 * - unopened: did not open the file (dismiss).
 * - follows: "Voting with the others." Only on a seat whose vote is the round's result.
 * - refuses: refused to arbitrate (abstain, which does not uphold).
 */
export type Reason = 'evidence' | 'found' | 'missed' | 'unopened' | 'follows' | 'refuses';

export type Seat = {
  /** Who sits here: 0 to JUROR_POOL - 1. */
  juror: number;
  vote: Vote;
  reason: Reason;
  /** The rule of the fault this juror found; only with reason 'found'. */
  found?: RuleId;
};

export type Round = {
  /** JURY_SIZES[n] for the n-th round. */
  size: number;
  /** What the clerk paid to call this round: 0 for the first jury, then APPEALS.fees in src/economy. */
  fee: number;
  seats: readonly Seat[];
  /** More than half of the seats voted uphold. */
  upheld: boolean;
};

export type CourtCase = {
  /** Where the applicant was in the day's queue. */
  index: number;
  /** The case's own seed, from the week's seed, the day and `index`. Every round is drawn from it. */
  seed: number;
  /** What the clerk found, or null: a hunch, and the jury looks for itself. */
  evidence: Evidence | null;
  /**
   * Every rule the applicant broke, as judge() found at the window against the live registry; empty
   * when they broke none. An upheld ruling names every one, with the things that disagree.
   */
  violations: readonly Violation[];
  /** The rounds heard so far, in order: the first jury, then each appeal. Never empty. */
  rounds: readonly Round[];
};

/** A challenge as it reaches the court at five o'clock. */
export type Filed = {
  /** The week's seed. */
  seed: number;
  day: number;
  index: number;
  violations: readonly Violation[];
  evidence: Evidence | null;
};

/**
 * The engine: src/court/jury.ts exports each of these under its own name, checked with
 * `satisfies CourtEngine[name]`. The UI and the economy use only these and the types above.
 */
export type CourtEngine = {
  /**
   * The first jury of 3. With evidence under a rule the applicant broke, every seat upholds. Otherwise
   * (a hunch, or evidence that names nothing they broke) each seat looks for itself and finds a real
   * fault with a chance set by how visible it is; a valid applicant is never upheld.
   */
  hearCase: (filed: Filed) => CourtCase;
  /** A dismissed hunch, heard again by the next jury: 7, then 15. Anything else comes back unchanged. */
  appealCase: (c: CourtCase) => CourtCase;
  /** The case can go to another round: a dismissed hunch with a jury size left. */
  canAppeal: (c: CourtCase) => boolean;
  /** The fee for the next round, or null when there is none. */
  appealFee: (c: CourtCase) => number | null;
  /** The case as it stands: its last round upheld the challenge. */
  isUpheld: (c: CourtCase) => boolean;
  /**
   * The day's cases as they stand, applied to the registry as it was when the court sat: upheld, the
   * applicant stays out and whoever vouched for them is removed; dismissed, the applicant is
   * registered. `removed[n]` is the voucher removed with the n-th case, if any.
   */
  settle: (
    registry: Registry,
    day: number,
    cases: readonly { applicant: Applicant; upheld: boolean }[],
  ) => { removed: (string | null)[]; registry: Registry };
};
