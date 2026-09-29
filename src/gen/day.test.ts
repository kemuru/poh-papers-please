import { describe, expect, it } from 'vitest';
import { STREETS, TOWNS } from '../content/applicants';
import { UNIT_FACES } from '../content/portraits';
import { REGULARS, UNITS } from '../content/cast';
import { findName } from '../rules/registry';
import { DAYS, generateDay, generateWeek, LAST_DAY, planWeek } from './day';

const SEEDS = Array.from({ length: 20 }, (_, i) => i + 1);
const weeks = SEEDS.map(generateWeek);
const valid = (a: { planted: unknown[] }) => a.planted.length === 0;

describe('generateWeek', () => {
  it('gives the same week for the same seed, and a different one for another seed', () => {
    expect(generateWeek(3)).toEqual(generateWeek(3));
    expect(generateWeek(3)).not.toEqual(generateWeek(4));
    expect(generateDay(3, 5)).toEqual(generateWeek(3)[4]);
  });

  it('has the applicant counts of the day table: 5, 7, 8, 8, 9, 10, and on Humanity Day six and the clerk', () => {
    expect(DAYS.map((d) => d.applicants)).toEqual([5, 7, 8, 8, 9, 10, 7]);
    for (const week of weeks) expect(week.map((day) => day.length)).toEqual(DAYS.map((d) => d.applicants));
  });

  it('has a clock on days 2 to 6 only', () => {
    expect(DAYS.map((d) => d.shiftSeconds !== null)).toEqual([false, true, true, true, true, true, false]);
  });

  it('keeps 65 to 75% of each day valid (day 1: 3 of 5, the nearest its five applicants allow; day 7, the six before the clerk)', () => {
    for (const week of weeks) {
      week.forEach((day, i) => {
        // The clerk's own renewal ends Humanity Day, and is not the public's queue.
        const queue = day.filter((a) => a.cast !== 'clerk');
        const share = queue.filter(valid).length / queue.length;
        if (i === 0) expect(share).toBe(0.6);
        else {
          expect(share, `day ${i + 1}`).toBeGreaterThanOrEqual(0.65);
          expect(share, `day ${i + 1}`).toBeLessThanOrEqual(0.75);
        }
      });
    }
  });

  it('makes at least 40% of the absurd cast appearances valid, across full weeks', () => {
    const cast = weeks.flat(2).filter((a) => a.cast !== null);
    expect(cast.filter(valid).length / cast.length).toBeGreaterThanOrEqual(0.4);
  });

  it('sends a Likeness unit once a day, each with a new face, never valid, with one fault', () => {
    for (const week of weeks) {
      const units = week.map((queue) => queue.filter((a) => a.cast === 'unit'));
      expect(units.map((u) => u.length)).toEqual([1, 1, 1, 1, 1, 1, 1]);
      units.forEach(([unit], i) => {
        expect(unit.photo).toEqual(UNIT_FACES[i]);
        expect(unit.planted).toHaveLength(1);
      });
    }
  });

  it('brings in one or two regulars a day, always valid, taking turns', () => {
    for (const week of weeks) {
      for (const queue of week) {
        // The regulars proper: the units, Pat and the week's other characters come on their own schedule.
        const regulars = queue.filter((a) => a.cast !== null && a.cast in REGULARS);
        expect(regulars.length).toBeGreaterThanOrEqual(1);
        expect(regulars.length).toBeLessThanOrEqual(2);
        for (const r of regulars) expect(valid(r)).toBe(true);
      }
      const seen = new Set(week.flat().map((a) => a.cast));
      for (const id of Object.keys(REGULARS)) expect(seen, id).toContain(id);
    }
  });

  it('never repeats a remark, a name or an address within a week', () => {
    for (const week of weeks) {
      const people = week.flat();
      const fillIns = people.filter((a) => a.cast === null);
      expect(new Set(people.map((a) => a.remark)).size).toBe(people.length);
      expect(new Set(fillIns.map((a) => a.name)).size).toBe(fillIns.length);
      expect(new Set(fillIns.map((a) => a.address)).size).toBe(fillIns.length);
    }
  });

  it('never gives an ordinary applicant the name or address of someone in the cast', () => {
    const cast = weeks.flat(2).filter((a) => a.cast !== null);
    const taken = new Set(cast.flatMap((a) => [a.name, a.address]));
    for (const a of generateWeek(86).flat().concat(generateWeek(168).flat(), weeks.flat(2))) {
      if (a.cast === null) {
        expect(taken, a.address).not.toContain(a.address);
        expect(taken, a.name).not.toContain(a.name);
      }
    }
  });

  it('opens the week with an ordinary applicant who breaks no rule', () => {
    for (const week of weeks) expect(week[0][0]).toMatchObject({ cast: null, planted: [] });
  });

  it('plants one rule at most on each applicant, besides Rule 0 on a non-human', () => {
    for (const a of weeks.flat(2)) {
      expect(a.planted.filter((p) => p.rule !== 'human').length).toBeLessThanOrEqual(1);
      // The only ones with two faults are the non-humans that also slip on something else.
      if (a.planted.length > 1) expect(['agent', 'cutout']).toContain(a.cast);
    }
  });

  it('gives the units ordinary addresses, on the streets and in the towns everyone else lives in', () => {
    const ordinary = new RegExp(`^\\d+ (${STREETS.join('|')}), (${TOWNS.join('|')})$`);
    for (const unit of UNITS) expect(unit.address, unit.name).toMatch(ordinary);
    for (const a of weeks.flat(2).filter((a) => a.cast === null)) expect(a.address).toMatch(ordinary);
  });

  it('lets no voucher say whether the papers are good: vouched for by the town or by this week, the odds are the same', () => {
    // Over 400 weeks, ordinary applicants from day 5 (the cast's vouchers, Ethel and the Binnses, are the week's story).
    const tally = { town: [0, 0], week: [0, 0] };
    for (let seed = 1; seed <= 400; seed++) {
      const plan = planWeek(seed);
      plan.queues.forEach((queue, d) =>
        queue.forEach((a, n) => {
          const voucher = d >= 4 && a.cast === null && a.voucher ? findName(plan.seen[d][n], a.voucher) : null;
          if (!voucher || voucher.name === REGULARS.grandmaEthel.name) return;
          tally[voucher.day === 0 ? 'town' : 'week'][valid(a) ? 0 : 1]++;
        }),
      );
    }
    const share = ([ok, fake]: number[]) => ok / (ok + fake);
    expect(tally.town[0] + tally.town[1]).toBeGreaterThan(300);
    expect(Math.abs(share(tally.town) - share(tally.week))).toBeLessThan(0.1);
  });

  it('covers every day of the week', () => {
    expect(LAST_DAY).toBe(7);
  });
});
