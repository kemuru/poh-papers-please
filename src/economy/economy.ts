// Pay, penalties and bills. Starting values from notes/game-design.md, tuned by balance.test.ts.
// Pure: the same decisions, seed and day always give the same money.
import { GAS_FEES, ODD_BILLS, RENT } from '../content/bills';
import { LAST_DAY } from '../gen/day';
import { createRng } from '../gen/rng';
import type { Decision } from '../rules/judge';

export const PAY = {
  /** Paid for each real human registered. */
  registration: 10,
  /** Paid when the court upholds a challenge. */
  bounty: 15,
  /** Lost when the court dismisses a challenge. */
  deposit: 15,
  /** Charged for registering someone who broke a rule. The first of each day is a warning. */
  fine: 20,
} as const;

/**
 * Appeals (slice 4): a dismissed hunch goes to 7 jurors for the first fee, then 15 for the second.
 * Upheld in the end, the fees are refunded and the bonus is paid on top of the bounty; dismissed in
 * the end, the fees are kept with the deposit.
 */
export const APPEALS = { fees: [10, 20], bonus: 10 } as const;

export const STARTING_SAVINGS = 240;

/** Per day. Perfect play clears the bills by about 20 PNK a day; see balance.test.ts. */
const RENT_BY_DAY = [30, 40, 50, 50, 60, 70, 40];
const GAS_BY_DAY: readonly (readonly [number, number])[] = [[3, 7], [4, 8], [5, 9], [5, 9], [6, 10], [6, 10], [4, 8]];
const ODD_BILL_BY_DAY = [5, 8, 10, 10, 12, 14, 6];

/**
 * One processed applicant: what the clerk did, and whether the rulebook agrees. A challenge carries
 * the court's result once it has been heard: whether it was upheld in the end and how many appeals
 * it took (0, 1 or 2). Without it, a challenge is settled by `correct`.
 */
export type Case = { decision: Decision; correct: boolean; court?: CourtResult };
export type CourtResult = { upheld: boolean; appeals: number };
export type Citation = 'warning' | 'fine';

/** The citation printed for case i, if registering them was a mistake. The day's first is a warning. */
export function citationFor(cases: readonly Case[], i: number): Citation | null {
  const wrongAccept = (c: Case) => c.decision === 'accept' && !c.correct;
  if (!wrongAccept(cases[i])) return null;
  return cases.slice(0, i).some(wrongAccept) ? 'fine' : 'warning';
}

export type ShiftPay = {
  /** Real humans registered. */
  registrations: number;
  /** Challenges the court upheld. */
  upheld: number;
  /** Challenges the court dismissed. */
  dismissed: number;
  warnings: number;
  fines: number;
  /**
   * Only on a day with an appeal. Challenges won after an appeal: the fees come back and the bonus
   * is paid on top of the bounty.
   */
  wonOnAppeal?: number;
  /** Only on a day with an appeal. Challenges lost after the first appeal, whose 7-juror fee is kept. */
  lostAt7?: number;
  /** Only on a day with an appeal. Challenges lost after the second appeal, whose 15-juror fee is kept too. */
  lostAt15?: number;
  /** PNK earned at the desk, after penalties. Can be negative. */
  total: number;
};

/** A challenge as the court ended it: upheld, or (without a court result) by the rulebook. */
const upheldInCourt = (c: Case) => c.court?.upheld ?? c.correct;

/** What the shift paid. A challenge is paid as the court ended it, appeals included. */
export function payShift(cases: readonly Case[]): ShiftPay {
  const count = (test: (c: Case) => boolean) => cases.filter(test).length;
  const challenge = (c: Case) => c.decision === 'challenge';
  const appeals = (c: Case) => (challenge(c) ? c.court?.appeals ?? 0 : 0);
  const citations = cases.map((_, i) => citationFor(cases, i));
  const pay: Omit<ShiftPay, 'total'> = {
    registrations: count((c) => c.decision === 'accept' && c.correct),
    upheld: count((c) => challenge(c) && upheldInCourt(c)),
    dismissed: count((c) => challenge(c) && !upheldInCourt(c)),
    warnings: citations.filter((c) => c === 'warning').length,
    fines: citations.filter((c) => c === 'fine').length,
    ...(cases.some((c) => appeals(c) > 0)
      ? {
          wonOnAppeal: count((c) => appeals(c) > 0 && upheldInCourt(c)),
          lostAt7: count((c) => appeals(c) >= 1 && !upheldInCourt(c)),
          lostAt15: count((c) => appeals(c) >= 2 && !upheldInCourt(c)),
        }
      : {}),
  };
  return { ...pay, total: payLines(pay).reduce((sum, line) => sum + line.amount, 0) };
}

export type PayLine = {
  kind: 'registrations' | 'upheld' | 'dismissed' | 'fines' | 'wonOnAppeal' | 'lostAt7' | 'lostAt15';
  count: number;
  each: number;
  amount: number;
};

/**
 * The shift's pay line by line, as the statement prints it: each count at its rate. The appeal lines
 * follow only on a day with an appeal. A fee refunded after a win is paid and returned, so it nets to
 * nothing and only the bonus is a line.
 */
export function payLines(pay: Omit<ShiftPay, 'total'>): PayLine[] {
  const line = (kind: PayLine['kind'], count: number, each: number) => ({ kind, count, each, amount: count * each });
  return [
    line('registrations', pay.registrations, PAY.registration),
    line('upheld', pay.upheld, PAY.bounty),
    line('dismissed', pay.dismissed, -PAY.deposit),
    line('fines', pay.fines, -PAY.fine),
    ...(pay.wonOnAppeal === undefined
      ? []
      : [
          line('wonOnAppeal', pay.wonOnAppeal, APPEALS.bonus),
          line('lostAt7', pay.lostAt7 ?? 0, -APPEALS.fees[0]),
          line('lostAt15', pay.lostAt15 ?? 0, -APPEALS.fees[1]),
        ]),
  ];
}

export type Bill = { item: string; amount: number };

/** The day's bills: rent, gas fees (which vary with the seed) and one odd item. */
export function billsFor(seed: number, day: number): Bill[] {
  const rng = createRng((seed ^ Math.imul(day, 0x9e3779b9)) >>> 0);
  const [low, high] = GAS_BY_DAY[day - 1];
  return [
    { item: RENT, amount: RENT_BY_DAY[day - 1] },
    { item: GAS_FEES[day - 1], amount: rng.int(low, high) },
    { item: rng.pick(ODD_BILLS[day - 1]), amount: ODD_BILL_BY_DAY[day - 1] },
  ];
}

export type DayEnd = {
  before: number;
  pay: ShiftPay;
  bills: Bill[];
  after: number;
  /** Savings below zero at the end of any day from day 2. Nobody can lose on day 1. */
  fired: boolean;
  /** Made it through the last day. */
  promoted: boolean;
};

/** Closes the books on a day: savings brought forward, plus the shift's pay, minus the bills. */
export function endDay(savings: number, day: number, cases: readonly Case[], seed: number): DayEnd {
  const pay = payShift(cases);
  const bills = billsFor(seed, day);
  const after = savings + pay.total - bills.reduce((sum, b) => sum + b.amount, 0);
  const fired = day >= 2 && after < 0;
  return { before: savings, pay, bills, after, fired, promoted: day === LAST_DAY && !fired };
}
