// Stand-in until src/court/jury.ts: a jury good enough to build the court screen against. It keeps
// the contract (src/court/types.ts) and its promises: evidence is upheld by every seat, a hunch is
// looked into seat by seat, a valid applicant is never upheld, and the same case always draws the
// same jurors. The odds are rough; the real engine sets them.
import { createRng } from '../gen/rng';
import { APPEALS } from '../economy/economy';
import { register, remove } from '../rules/registry';
import type { Violation } from '../rules/types';
import { JURY_SIZES, JUROR_POOL, type CourtCase, type CourtEngine, type Round, type Seat } from '../court/types';

/** Stakes: a few jurors hold most of it, so the same face turns up in two seats. */
const STAKES = Array.from({ length: JUROR_POOL }, (_, j) => [6, 1, 3, 1, 2, 1, 4, 1, 1, 2, 1, 1][j] ?? 1);
const TOTAL_STAKE = STAKES.reduce((a, b) => a + b, 0);

/** How often one look finds this fault, before a round looks harder. */
function visibility(v: Violation): number {
  if (v.rule === 'phrase') return v.heard.length === 0 ? 0.95 : 0.6;
  if (v.rule === 'sign') return !v.sign || v.sign.kind === 'qr' ? 0.95 : 0.55;
  if (v.rule === 'photo') return v.mirrored ? 0.6 : 0.7;
  if (v.rule === 'human') return v.problem === 'machine' || v.problem === 'changes' ? 0.25 : 0.6;
  if (v.rule === 'living') return v.problem === 'blink' ? 0.3 : 0.8;
  return 0.5;
}

const caseSeed = (seed: number, day: number, index: number) => (Math.imul(seed ^ 0x5bd1e995, 31) + day * 7919 + (index + 1) * 104729) >>> 0;

function drawJuror(next: () => number): number {
  let r = next() * TOTAL_STAKE;
  for (let j = 0; j < JUROR_POOL; j++) {
    r -= STAKES[j];
    if (r < 0) return j;
  }
  return JUROR_POOL - 1;
}

function round(c: Pick<CourtCase, 'seed' | 'evidence' | 'violations'>, n: number): Round {
  const size = JURY_SIZES[n];
  const fee = n === 0 ? 0 : APPEALS.fees[n - 1];
  const rng = createRng((c.seed + Math.imul(n + 1, 0x9e3779b9)) >>> 0);
  const proven = c.evidence !== null && c.violations.some((v) => v.rule === c.evidence!.rule);
  const seats: Seat[] = Array.from({ length: size }, (): Seat => {
    const juror = drawJuror(rng.next);
    if (proven) return { juror, vote: 'uphold', reason: 'evidence' };
    const roll = rng.next();
    if (roll < 0.08) return { juror, vote: 'abstain', reason: 'refuses' };
    if (roll < 0.2) return { juror, vote: 'dismiss', reason: 'unopened' };
    // Each round looks harder: the chance of finding a fault rises toward certainty.
    const found = c.violations.find((v) => rng.next() < 1 - (1 - visibility(v)) ** (n + 1));
    return found ? { juror, vote: 'uphold', reason: 'found', found: found.rule } : { juror, vote: 'dismiss', reason: 'missed' };
  });
  const upheld = seats.filter((s) => s.vote === 'uphold').length * 2 > size;
  // A few of those who voted with the result say so.
  const result = upheld ? 'uphold' : 'dismiss';
  const labelled = seats.map((s): Seat => (!proven && s.vote === result && rng.next() < 0.2 ? { juror: s.juror, vote: s.vote, reason: 'follows' } : s));
  return { size, fee, seats: labelled, upheld };
}

export const hearCase: CourtEngine['hearCase'] = (f) => {
  const c = { index: f.index, seed: caseSeed(f.seed, f.day, f.index), evidence: f.evidence, violations: f.violations };
  return { ...c, rounds: [round(c, 0)] };
};

export const isUpheld: CourtEngine['isUpheld'] = (c) => c.rounds[c.rounds.length - 1].upheld;

export const canAppeal: CourtEngine['canAppeal'] = (c) => !isUpheld(c) && c.rounds.length < JURY_SIZES.length;

export const appealFee: CourtEngine['appealFee'] = (c) => (canAppeal(c) ? APPEALS.fees[c.rounds.length - 1] : null);

export const appealCase: CourtEngine['appealCase'] = (c) => (canAppeal(c) ? { ...c, rounds: [...c.rounds, round(c, c.rounds.length)] } : c);

export const settle: CourtEngine['settle'] = (registry, day, cases) => {
  let after = registry;
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
};
