import { describe, expect, it } from 'vitest';
import { GARY_DISGUISES } from '../content/portraits';
import { REGULARS } from '../content/cast';
import { DAYS, generateDay, generateWeek, LAST_DAY } from './day';

const SEEDS = Array.from({ length: 20 }, (_, i) => i + 1);
const weeks = SEEDS.map(generateWeek);
const valid = (a: { planted: unknown[] }) => a.planted.length === 0;

describe('generateWeek', () => {
  it('gives the same week for the same seed, and a different one for another seed', () => {
    expect(generateWeek(3)).toEqual(generateWeek(3));
    expect(generateWeek(3)).not.toEqual(generateWeek(4));
    expect(generateDay(3, 5)).toEqual(generateWeek(3)[4]);
  });

  it('has the applicant counts of the day table: 5, 7, 8, 8, 9, 10, 6', () => {
    expect(DAYS.map((d) => d.applicants)).toEqual([5, 7, 8, 8, 9, 10, 6]);
    for (const week of weeks) expect(week.map((day) => day.length)).toEqual(DAYS.map((d) => d.applicants));
  });

  it('has a clock on days 2 to 6 only', () => {
    expect(DAYS.map((d) => d.shiftSeconds !== null)).toEqual([false, true, true, true, true, true, false]);
  });

  it('keeps 65 to 75% of each day valid (day 1: 3 of 5, the nearest its five applicants allow)', () => {
    for (const week of weeks) {
      week.forEach((queue, i) => {
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

  it('sends Gary once a day on days 1 to 6, in a different disguise each day, and never valid', () => {
    for (const week of weeks) {
      const garys = week.map((queue) => queue.filter((a) => a.cast === 'gary'));
      expect(garys.map((g) => g.length)).toEqual([1, 1, 1, 1, 1, 1, 0]);
      garys.slice(0, 6).forEach(([gary], i) => {
        expect(gary.photo).toMatchObject(GARY_DISGUISES[i]);
        expect(gary.planted).toHaveLength(1);
      });
    }
  });

  it('brings in one or two regulars a day, always valid, taking turns', () => {
    for (const week of weeks) {
      for (const queue of week) {
        const regulars = queue.filter((a) => a.cast !== null && a.cast !== 'gary');
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
    const taken = new Set(cast.flatMap((a) => [a.name, a.address, a.address.replace(/^Behind the bins, /, '')]));
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

  it('plants one rule at most on each applicant', () => {
    for (const a of weeks.flat(2)) expect(a.planted.length).toBeLessThanOrEqual(1);
  });

  it('covers every day of the week', () => {
    expect(LAST_DAY).toBe(7);
  });
});
