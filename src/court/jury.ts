// The Humanity Court's juries (slice 4): who sits, what each seat finds and how it votes.
// With evidence under a rule the applicant broke, the first jury upholds: the fault is in front of
// them. On a hunch each seat looks for itself and finds a real fault with a chance set by how visible
// it is, and each appeal looks harder. Nobody finds a fault that is not there.
// Pure and seeded: a case's seed comes from the week's seed, the day and the place in the queue, and
// each round from the case's seed and the round alone, so the same week always gives the same court.
import { APPEALS } from '../economy/economy';
import { createRng, type Rng } from '../gen/rng';
import { register, remove } from '../rules/registry';
import type { LampSize } from '../gen/portrait';
import type { Registry, RuleId, Violation } from '../rules/types';
import { JUROR_POOL, JURY_SIZES, type CourtCase, type CourtEngine, type Reason, type Round, type Seat } from './types';

/**
 * Each juror's stake, juror 0 first: a seat goes to a juror in proportion to it. The top stakes sit
 * often enough that the same face in two seats of a first jury is a thing the clerk sees.
 */
export const JUROR_STAKES: readonly number[] = [200, 150, 120, 100, 90, 80, 70, 60, 50, 40, 25, 15];

/** How visible a fault is to a juror who looks for it, plainest first. */
export const TIERS = ['plain', 'often', 'sometimes', 'rare'] as const;
export type Tier = (typeof TIERS)[number];

/**
 * A seat's chance of finding one fault of each tier: the first jury, then each appeal, looking harder
 * each time. Tuned by src/court/jury.test.ts (fairness) and the balance bots.
 */
export const FIND: Record<Tier, readonly [number, number, number]> = {
  plain: [0.95, 0.98, 0.99],
  often: [0.7, 0.85, 0.95],
  sometimes: [0.55, 0.75, 0.9],
  rare: [0.45, 0.65, 0.85],
};

/** How often a seat's bubble says something other than what it did. Flavour: no vote changes. */
const FLAVOUR = {
  /** A seat that found the fault votes "with the others" instead, when the others upheld. */
  follows: 0.15,
  /** A seat that found nothing did not open the file. */
  unopened: 0.12,
  /** A seat that found nothing votes "with the others", when the others dismissed. */
  followsDismissal: 0.15,
  /** A seat that found nothing refuses to arbitrate. */
  refuses: 0.06,
} as const;

/** Key words of the phrase a juror sees missing at a glance: half the phrase is not a slip. */
const MANY_MISSING = 3;
/** Sign characters wrong that take a character-by-character comparison to see. */
const FEW_WRONG = 3;

/**
 * How plainly a unit's lamp shows to a juror who looks for it: as plainly as it shows on the desk. The
 * day 1 unit's bloom often, the glow of days 2 and 3 sometimes, the small lamp and the slit rarely.
 */
const LAMP_TIERS: Record<LampSize, Tier> = { bloom: 'often', glow: 'sometimes', small: 'rare', slit: 'rare' };

/**
 * How visible a fault is. Silence, a square of dots, no sign, nobody vouching, a year before Christ
 * and a version number for a year are plain; a wrong word, a mirror, someone else's address often seen; a typo in the year, no
 * blink, another face, a picture held up and the generator's mark sometimes; a lamp lit only in the
 * frames with the eyes shut as its size allows (LAMP_TIERS); an ear that changes, two wrong characters,
 * and whatever needs the registry (a voucher not registered or already vouching, a face on file) rarely.
 */
export function visibility(v: Violation): Tier {
  switch (v.rule) {
    case 'human':
      if (v.problem === 'machine') return LAMP_TIERS[v.lamp ?? 'small'];
      return v.problem === 'changes' ? 'rare' : 'sometimes';
    case 'phrase':
      return v.heard.length === 0 || v.expected.filter((m) => !m.ok).length >= MANY_MISSING ? 'plain' : 'often';
    case 'photo':
      return v.mirrored ? 'often' : 'sometimes';
    case 'sign':
      if (v.sign === null || v.sign.kind === 'qr') return 'plain';
      return v.wrong.length > FEW_WRONG ? 'often' : 'rare';
    case 'vouch':
      return v.problem === 'none' || v.problem === 'self' ? 'plain' : 'rare';
    case 'duplicate':
      return 'rare';
    case 'living':
      if (v.problem === 'blink') return 'sometimes';
      return typeof v.born === 'string' || v.born < 1000 ? 'plain' : 'sometimes';
  }
}

/** The plainest tier among a case's faults; null for a valid applicant. */
export const plainest = (violations: readonly Violation[]): Tier | null =>
  TIERS.find((tier) => violations.some((v) => visibility(v) === tier)) ?? null;

// Murmur3's finaliser: every bit of the input moves every bit of the output.
const fmix = (h: number) => {
  h = Math.imul(h ^ (h >>> 16), 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  return (h ^ (h >>> 16)) >>> 0;
};
const hash = (...parts: number[]) => parts.reduce((h, part) => fmix(((h ^ (part | 0)) + 0x9e3779b9) >>> 0), 0x2545f491);

/** A case's seed: the week's seed, the day and the place in the queue, hashed. */
export const caseSeed = (seed: number, day: number, index: number) => hash(seed, day, index);

/** Round n's fee: nothing for the first jury, then the appeal fees from the economy. */
const feeFor = (n: number) => (n === 0 ? 0 : APPEALS.fees[n - 1]);

/** A seat, drawn in proportion to stake, with replacement: the same juror can take several. */
function drawJuror(rng: Rng): number {
  const total = JUROR_STAKES.reduce((sum, s) => sum + s, 0);
  let at = rng.next() * total;
  for (let juror = 0; juror < JUROR_POOL; juror++) {
    at -= JUROR_STAKES[juror];
    if (at < 0) return juror;
  }
  return JUROR_POOL - 1;
}

/** The evidence names a rule the applicant broke: the fault is in front of the jury. */
const proven = (c: Pick<CourtCase, 'evidence' | 'violations'>) =>
  c.evidence !== null && c.violations.some((v) => v.rule === c.evidence!.rule);

/** Round n (0 for the first jury) of a case, from the case's seed and n alone. */
function hear(c: Pick<CourtCase, 'seed' | 'evidence' | 'violations'>, n: number): Round {
  const rng = createRng(hash(c.seed, n));
  const size = JURY_SIZES[n];
  const fee = feeFor(n);
  const jurors = Array.from({ length: size }, () => drawJuror(rng));
  if (n === 0 && proven(c)) {
    return { size, fee, seats: jurors.map((juror): Seat => ({ juror, vote: 'uphold', reason: 'evidence' })), upheld: true };
  }
  // Each seat looks for itself, plainest fault first, and names the first it finds.
  const faults = [...c.violations].sort((a, b) => TIERS.indexOf(visibility(a)) - TIERS.indexOf(visibility(b)));
  const found = jurors.map((): RuleId | null => faults.find((v) => rng.next() < FIND[visibility(v)][n])?.rule ?? null);
  const upheld = found.filter((f) => f !== null).length * 2 > size;
  // Flavour, after the tally: the bubbles never change the result.
  const seats = jurors.map((juror, i): Seat => {
    const rule = found[i];
    const roll = rng.next();
    if (rule !== null) return upheld && roll < FLAVOUR.follows ? { juror, vote: 'uphold', reason: 'follows' } : { juror, vote: 'uphold', reason: 'found', found: rule };
    let reason: Reason = 'missed';
    if (roll < FLAVOUR.unopened) reason = 'unopened';
    else if (!upheld && roll < FLAVOUR.unopened + FLAVOUR.followsDismissal) reason = 'follows';
    else if (roll >= 1 - FLAVOUR.refuses) return { juror, vote: 'abstain', reason: 'refuses' };
    return { juror, vote: 'dismiss', reason };
  });
  return { size, fee, seats, upheld };
}

export const hearCase = ((filed): CourtCase => {
  const c = { index: filed.index, seed: caseSeed(filed.seed, filed.day, filed.index), evidence: filed.evidence, violations: filed.violations };
  return { ...c, rounds: [hear(c, 0)] };
}) satisfies CourtEngine['hearCase'];

export const isUpheld = ((c) => c.rounds[c.rounds.length - 1].upheld) satisfies CourtEngine['isUpheld'];

export const canAppeal = ((c) => !isUpheld(c) && c.rounds.length < JURY_SIZES.length) satisfies CourtEngine['canAppeal'];

export const appealFee = ((c) => (canAppeal(c) ? feeFor(c.rounds.length) : null)) satisfies CourtEngine['appealFee'];

export const appealCase = ((c) => (canAppeal(c) ? { ...c, rounds: [...c.rounds, hear(c, c.rounds.length)] } : c)) satisfies CourtEngine['appealCase'];

export const settle = ((registry, day, cases) => {
  let after: Registry = registry;
  const removed = cases.map(({ applicant, upheld }) => {
    if (!upheld) {
      after = register(after, applicant, day);
      return null;
    }
    const voucher = after.find((r) => r.vouching === applicant.name) ?? null;
    if (voucher) after = remove(after, voucher.name);
    return voucher?.name ?? null;
  });
  return { removed, registry: after };
}) satisfies CourtEngine['settle'];
