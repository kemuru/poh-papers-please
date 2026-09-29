import { describe, expect, it } from 'vitest';
import { playDay } from '../court/court';
import { isUpheld, plainest } from '../court/jury';
import type { CourtCase, Evidence } from '../court/types';
import type { GeneratedApplicant } from '../gen/applicant';
import { generateWeek, morning, morningRegistry } from '../gen/day';
import { createRng, type Rng } from '../gen/rng';
import type { Decision } from '../rules/judge';
import { APPEALS, endDay, PAY, payLines, payShift, STARTING_SAVINGS, type Case } from './economy';

// acceptance.md, slice 4: the jury's balance row, played through the same generator, rule engine,
// jury and economy as the game, over the same 20 seeds as balance.test.ts. Every bot goes to the jury.
const SEEDS = Array.from({ length: 20 }, (_, i) => i + 1);

const truth = (a: GeneratedApplicant): Decision => (a.planted.length === 0 ? 'accept' : 'challenge');
const flip = (d: Decision): Decision => (d === 'accept' ? 'challenge' : 'accept');

/** Inspect's finding on a fake: the first rule it broke, pointed at on the desk. */
const found = (rule: Evidence['rule']): Evidence => ({ rule, items: [{ kind: 'transcript' }, { kind: 'rule', rule }] });

type Clerk = {
  decide: (queue: GeneratedApplicant[], rng: Rng) => Decision[];
  /** Inspects before challenging: the challenge carries what it found. */
  inspects: boolean;
  appeal: (c: CourtCase) => boolean;
};

const careful: Clerk = { decide: (queue) => queue.map(truth), inspects: true, appeal: () => false };

/** Decides like the careful clerk but never inspects, and appeals a dismissed hunch only on a plain fault. */
const hunch: Clerk = { decide: (queue) => queue.map(truth), inspects: false, appeal: (c) => plainest(c.violations) === 'plain' };

/** Gets exactly 2 decisions wrong a day, chosen at random, and inspects every fake it challenges. */
const twoMistakes: Clerk = {
  decide: (queue, rng) => {
    const wrong = new Set<number>();
    while (wrong.size < Math.min(2, queue.length)) wrong.add(rng.int(0, queue.length - 1));
    return queue.map((a, i) => (wrong.has(i) ? flip(truth(a)) : truth(a)));
  },
  inspects: true,
  appeal: () => false,
};

type Week = {
  savings: number;
  earned: number;
  promoted: boolean;
  appeals: number;
  bonuses: number;
  feesKept: number;
  /** Every case the court heard this week, as it ended. */
  cases: CourtCase[];
};

function playWeek(seed: number, clerk: Clerk): Week {
  const rng = createRng(seed * 7919);
  let savings = STARTING_SAVINGS;
  let earned = 0;
  let registry = morningRegistry(seed, 1);
  const week: Week = { savings, earned, promoted: false, appeals: 0, bonuses: 0, feesKept: 0, cases: [] };
  for (const [i, queue] of generateWeek(seed).entries()) {
    const day = i + 1;
    registry = morning(registry, day);
    const decisions = clerk.decide(queue, rng);
    const played = playDay(registry, day, queue, decisions, {
      seed,
      evidence: (_, outcome) => (clerk.inspects && outcome.violations.length > 0 ? found(outcome.violations[0].rule) : null),
      appeal: clerk.appeal,
    });
    registry = played.registry;
    const courtAt = new Map(played.cases.map((c) => [c.index, c]));
    const cases: Case[] = decisions.map((decision, j) => {
      const c = courtAt.get(j);
      return { decision, correct: played.outcomes[j].correct, ...(c ? { court: { upheld: c.rounds[c.rounds.length - 1].upheld, appeals: c.rounds.length - 1 } } : {}) };
    });
    const end = endDay(savings, day, cases, seed);
    earned += end.pay.total;
    savings = end.after;
    week.cases.push(...played.cases);
    week.appeals += played.cases.reduce((n, c) => n + c.rounds.length - 1, 0);
    week.bonuses += end.pay.wonOnAppeal ?? 0;
    week.feesKept += (end.pay.lostAt7 ?? 0) * APPEALS.fees[0] + (end.pay.lostAt15 ?? 0) * APPEALS.fees[1];
    if (end.fired || end.promoted) {
      week.promoted = end.promoted;
      break;
    }
  }
  return { ...week, savings, earned };
}

const play = (clerk: Clerk) => SEEDS.map((seed) => playWeek(seed, clerk));
const results = { careful: play(careful), hunch: play(hunch), twoMistakes: play(twoMistakes) };
const mean = (weeks: Week[]) => weeks.reduce((sum, w) => sum + w.savings, 0) / weeks.length;

describe('balance with the jury (20 seeded weeks per clerk)', () => {
  it('a clerk who never inspects, appealing only when sure, ends behind a careful clerk and ahead of 2 mistakes a day', () => {
    const [c, h, m] = [mean(results.careful), mean(results.hunch), mean(results.twoMistakes)];
    expect(h).toBeLessThan(c);
    expect(h).toBeGreaterThan(m);
    const behind = SEEDS.filter((_, i) => results.hunch[i].savings < results.careful[i].savings).length;
    const ahead = SEEDS.filter((_, i) => results.hunch[i].savings > results.twoMistakes[i].savings).length;
    expect(behind).toBeGreaterThanOrEqual(18);
    expect(ahead).toBeGreaterThanOrEqual(18);
  });

  it('a clerk who never inspects does go to appeal, now and then: over 100 weeks, at least once', () => {
    // A first jury nearly always finds a plain fault, so this clerk seldom has one to appeal: none in the
    // 20 weeks above since Humanity Day came to one slip of the tongue (slice 5). BALANCE_REPORT=1 prints how often.
    const weeks = Array.from({ length: 100 }, (_, i) => playWeek(i + 1, hunch));
    expect(weeks.reduce((n, w) => n + w.appeals, 0)).toBeGreaterThan(0);
  });

  it('a careful clerk is never dismissed on a real fault, so never appeals', () => {
    for (const w of results.careful) {
      // Every challenge carried evidence, and the first jury upheld it: nothing was left to appeal.
      expect(w.cases.length).toBeGreaterThan(0);
      for (const c of w.cases) {
        expect(c.evidence).not.toBeNull();
        expect(isUpheld(c)).toBe(true);
        expect(c.rounds).toHaveLength(1);
      }
      expect(w.promoted).toBe(true);
      expect(w.appeals).toBe(0);
    }
  });
});

describe('appeal fees, refunds and the bonus', () => {
  const challenge = (upheld: boolean, appeals: number, correct = true): Case => ({ decision: 'challenge', correct, court: { upheld, appeals } });

  it('matches the economy config: 10 then 20 PNK, refunded with a 10 PNK bonus on a win', () => {
    expect(APPEALS).toEqual({ fees: [10, 20], bonus: 10 });
  });

  it('pays the bounty for a first-jury win and adds no appeal lines', () => {
    const pay = payShift([challenge(true, 0)]);
    expect(pay.total).toBe(PAY.bounty);
    expect(pay.wonOnAppeal).toBeUndefined();
    expect(payLines(pay)).toHaveLength(4);
  });

  it('refunds the fees and pays the bonus on a win after one or two appeals', () => {
    for (const appeals of [1, 2]) {
      const pay = payShift([challenge(true, appeals)]);
      expect(pay).toMatchObject({ upheld: 1, dismissed: 0, wonOnAppeal: 1, lostAt7: 0, lostAt15: 0 });
      expect(pay.total).toBe(PAY.bounty + APPEALS.bonus);
    }
  });

  it('keeps the deposit and every fee paid on a loss after appeals', () => {
    expect(payShift([challenge(false, 1)]).total).toBe(-PAY.deposit - APPEALS.fees[0]);
    expect(payShift([challenge(false, 2)]).total).toBe(-PAY.deposit - APPEALS.fees[0] - APPEALS.fees[1]);
    expect(payShift([challenge(false, 2, false)]).total).toBe(-PAY.deposit - APPEALS.fees[0] - APPEALS.fees[1]);
  });

  it('settles a challenge by the court, not the rulebook, once it has been heard', () => {
    expect(payShift([challenge(false, 0, true)]).total).toBe(-PAY.deposit);
    expect(payShift([{ decision: 'challenge', correct: true }]).total).toBe(PAY.bounty);
  });

  it('prints one line per appeal outcome, each count at its rate, summing to the total', () => {
    const pay = payShift([challenge(true, 2), challenge(false, 1), challenge(false, 2), { decision: 'accept', correct: true }]);
    const lines = payLines(pay);
    expect(lines.map((l) => [l.kind, l.count, l.each])).toEqual([
      ['registrations', 1, PAY.registration],
      ['upheld', 1, PAY.bounty],
      ['dismissed', 2, -PAY.deposit],
      ['fines', 0, -PAY.fine],
      ['wonOnAppeal', 1, APPEALS.bonus],
      ['lostAt7', 2, -APPEALS.fees[0]],
      ['lostAt15', 1, -APPEALS.fees[1]],
    ]);
    expect(lines.reduce((sum, l) => sum + l.amount, 0)).toBe(pay.total);
    expect(pay.total).toBe(10 + 15 - 30 + 10 - 20 - 20);
  });
});

// The numbers behind the acceptance row, printed when run with BALANCE_REPORT=1.
const env = (globalThis as { process?: { env: Record<string, string | undefined> } }).process?.env ?? {};
if (env.BALANCE_REPORT) {
  for (const [name, weeks] of Object.entries(results)) {
    const s = weeks.map((w) => w.savings);
    console.log(`${name}: mean ${mean(weeks).toFixed(1)}, min ${Math.min(...s)}, max ${Math.max(...s)}, promoted ${weeks.filter((w) => w.promoted).length}/20, appeals ${weeks.reduce((n, w) => n + w.appeals, 0)}, bonuses ${weeks.reduce((n, w) => n + w.bonuses, 0)}, fees kept ${weeks.reduce((n, w) => n + w.feesKept, 0)}`);
  }
  console.log(`hunch behind careful ${SEEDS.filter((_, i) => results.hunch[i].savings < results.careful[i].savings).length}/20, ahead of 2 mistakes ${SEEDS.filter((_, i) => results.hunch[i].savings > results.twoMistakes[i].savings).length}/20`);
}
