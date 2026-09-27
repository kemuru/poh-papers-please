import { describe, expect, it } from 'vitest';
import { ODD_BILLS, RENT } from '../content/bills';
import { LAST_DAY } from '../gen/day';
import { billsFor, citationFor, endDay, PAY, payLines, payShift, type Case } from './economy';

const registered: Case = { decision: 'accept', correct: true };
const fooled: Case = { decision: 'accept', correct: false };
const upheld: Case = { decision: 'challenge', correct: true };
const dismissed: Case = { decision: 'challenge', correct: false };

describe('pay and penalties (notes/game-design.md, economy)', () => {
  it('pays 10 for a real human registered and 15 for an upheld challenge', () => {
    expect(PAY).toEqual({ registration: 10, bounty: 15, deposit: 15, fine: 20 });
    expect(payShift([registered]).total).toBe(10);
    expect(payShift([upheld]).total).toBe(15);
  });

  it('forfeits the 15 deposit when the court dismisses a challenge', () => {
    expect(payShift([dismissed]).total).toBe(-15);
  });

  it('warns for the first registration of a fake each day, then fines 20', () => {
    const cases = [registered, fooled, registered, fooled, fooled];
    expect(cases.map((_, i) => citationFor(cases, i))).toEqual([null, 'warning', null, 'fine', 'fine']);
    expect(payShift(cases)).toEqual({ registrations: 2, upheld: 0, dismissed: 0, warnings: 1, fines: 2, total: 20 - 40 });
  });

  it('counts a dismissed challenge as no citation: the warning is still there for the first fake', () => {
    const cases = [dismissed, fooled];
    expect(citationFor(cases, 0)).toBeNull();
    expect(citationFor(cases, 1)).toBe('warning');
  });

  it('prints the pay line by line, and the lines add up to the total', () => {
    const pay = payShift([registered, registered, upheld, dismissed, fooled, fooled]);
    expect(payLines(pay)).toEqual([
      { kind: 'registrations', count: 2, each: 10, amount: 20 },
      { kind: 'upheld', count: 1, each: 15, amount: 15 },
      { kind: 'dismissed', count: 1, each: -15, amount: -15 },
      { kind: 'fines', count: 1, each: -20, amount: -20 },
    ]);
    expect(pay.total).toBe(0);
  });

  it('charges nothing for applicants who went home unprocessed', () => {
    expect(payShift([])).toEqual({ registrations: 0, upheld: 0, dismissed: 0, warnings: 0, fines: 0, total: 0 });
  });
});

describe('bills', () => {
  it('charges rent, gas fees and one odd item each day', () => {
    for (let day = 1; day <= LAST_DAY; day++) {
      const [rent, gas, odd] = billsFor(1, day);
      expect(rent.item).toBe(RENT);
      expect(gas.item).toMatch(/^Gas fees/);
      expect(ODD_BILLS[day - 1]).toContain(odd.item);
      for (const bill of [rent, gas, odd]) expect(bill.amount).toBeGreaterThan(0);
    }
  });

  it('is the same for the same seed, and gas fees vary between seeds', () => {
    expect(billsFor(7, 3)).toEqual(billsFor(7, 3));
    const gas = new Set(Array.from({ length: 30 }, (_, seed) => billsFor(seed, 3)[1].amount));
    expect(gas.size).toBeGreaterThan(1);
  });
});

describe('endDay', () => {
  it('carries savings forward: before, plus the shift, minus the bills', () => {
    const end = endDay(100, 2, [registered, upheld], 5);
    const bills = billsFor(5, 2).reduce((sum, b) => sum + b.amount, 0);
    expect(end.before).toBe(100);
    expect(end.pay.total).toBe(25);
    expect(end.after).toBe(100 + 25 - bills);
  });

  it('never fires anyone on day 1', () => {
    const end = endDay(0, 1, [dismissed, dismissed], 1);
    expect(end.after).toBeLessThan(0);
    expect(end.fired).toBe(false);
  });

  it('fires the clerk whose savings end below zero from day 2', () => {
    expect(endDay(0, 2, [dismissed], 1).fired).toBe(true);
    expect(endDay(1000, 2, [dismissed], 1).fired).toBe(false);
  });

  it('promotes the clerk who gets through the last day, and nobody before it', () => {
    expect(endDay(1000, LAST_DAY, [], 1).promoted).toBe(true);
    expect(endDay(1000, LAST_DAY - 1, [], 1).promoted).toBe(false);
    expect(endDay(-1000, LAST_DAY, [], 1)).toMatchObject({ fired: true, promoted: false });
  });
});
