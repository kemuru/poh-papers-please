import { describe, expect, it } from 'vitest';
import { STREETS, TOWNS } from '../content/applicants';
import { FIRST_UNIT_FACE } from '../content/portraits';
import { FIRST_UNIT, REGULARS } from '../content/cast';
import { RULE_DAYS } from '../rules/judge';
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

  it('has the applicant counts of the day table: 6, 7, 8, 8, 9, 10, and on Humanity Day six and the clerk', () => {
    expect(DAYS.map((d) => d.applicants)).toEqual([6, 7, 8, 8, 9, 10, 7]);
    for (const week of weeks) expect(week.map((day) => day.length)).toEqual(DAYS.map((d) => d.applicants));
  });

  it('has a clock on days 2 to 6 only', () => {
    expect(DAYS.map((d) => d.shiftSeconds !== null)).toEqual([false, true, true, true, true, true, false]);
  });

  it('keeps 65 to 75% of each day valid but for one ordinary offender on days 2 to 5, and most of it with them (day 1: 4 of 6; day 7, the six before the clerk)', () => {
    for (const week of weeks) {
      week.forEach((day, i) => {
        // The clerk's own renewal ends Humanity Day, and is not the public's queue.
        const queue = day.filter((a) => a.cast !== 'clerk');
        const offenders = i >= 1 && i <= 4 ? queue.filter((a) => a.cast === null && !valid(a)).length : 0;
        expect(offenders, `day ${i + 1}`).toBeLessThanOrEqual(1);
        // The cast alone, counting an offender among the honest people they stand in for.
        const share = (queue.filter(valid).length + offenders) / queue.length;
        expect(share, `day ${i + 1}`).toBeGreaterThanOrEqual(0.65);
        expect(share, `day ${i + 1}`).toBeLessThanOrEqual(0.75);
        expect(queue.filter(valid).length / queue.length, `day ${i + 1}`).toBeGreaterThanOrEqual(0.55);
      });
    }
  });

  it('on about half of days 2 to 5 sends someone ordinary with one ordinary fault: never the phrase, never the one Pat or the unit has', () => {
    let days = 0;
    for (const week of weeks) {
      week.slice(1, 5).forEach((queue, i) => {
        const day = i + 2;
        const offender = queue.find((a) => a.cast === null && !valid(a));
        if (!offender) return;
        days++;
        expect(offender.planted, `day ${day}`).toHaveLength(1);
        const [{ rule, mistake }] = offender.planted;
        expect(rule, `day ${day}`).not.toBe('phrase');
        expect(RULE_DAYS[rule], `day ${day}: ${mistake}`).toBeLessThanOrEqual(day);
        const cast = queue.filter((a) => a.cast === 'pat' || a.cast === 'unit').flatMap((a) => a.planted.map((p) => p.mistake));
        expect(cast, `day ${day}`).not.toContain(mistake);
      });
    }
    expect(days).toBeGreaterThanOrEqual(SEEDS.length * 4 * 0.3);
    expect(days).toBeLessThanOrEqual(SEEDS.length * 4 * 0.7);
  });

  it('makes at least 40% of the absurd cast appearances valid, across full weeks', () => {
    const cast = weeks.flat(2).filter((a) => a.cast !== null);
    expect(cast.filter(valid).length / cast.length).toBeGreaterThanOrEqual(0.4);
  });

  it('sends a Likeness unit once a day, each with a new face: legal on day 1, when no rule reads a face, and never valid after, with one fault', () => {
    for (const week of weeks) {
      const units = week.map((queue) => queue.filter((a) => a.cast === 'unit'));
      expect(units.map((u) => u.length)).toEqual([1, 1, 1, 1, 1, 1, 1]);
      units.forEach(([unit], i) => {
        // Day 1's is the tutorial's; from day 2 each is a face drawn for the week, a home robot's drawn as a human's.
        if (i === 0) expect(unit.photo).toEqual(FIRST_UNIT_FACE);
        else expect(unit.photo.species).toBe('android');
        expect(unit.planted).toHaveLength(i === 0 ? 0 : 1);
      });
    }
    // And a new set each week: no face of days 2 to 7 comes back in another week.
    const faces = weeks.flatMap((week) => week.slice(1).map((queue) => JSON.stringify(queue.find((a) => a.cast === 'unit')!.photo.face)));
    expect(new Set(faces).size).toBe(faces.length);
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

  it('never gives an ordinary applicant the name or address of someone in the cast, or of one of the week’s units', () => {
    // From day 2 the units are drawn from everyone's names and streets, a week at a time: another week may use them.
    const drawn = (a: { cast: string | null; name: string }) => a.cast === 'unit' && a.name !== FIRST_UNIT.name;
    const cast = weeks.flat(2).filter((a) => a.cast !== null && !drawn(a));
    const taken = new Set(cast.flatMap((a) => [a.name, a.address]));
    for (const week of [generateWeek(86), generateWeek(168), ...weeks]) {
      const units = new Set(week.flat().filter(drawn).flatMap((a) => [a.name, a.address]));
      for (const a of week.flat()) {
        if (a.cast !== null) continue;
        for (const used of [taken, units]) {
          expect(used, a.address).not.toContain(a.address);
          expect(used, a.name).not.toContain(a.name);
        }
      }
    }
  });

  it('opens the week with an ordinary applicant who breaks no rule', () => {
    for (const week of weeks) expect(week[0][0]).toMatchObject({ cast: null, planted: [] });
  });

  it('plants one rule at most on each applicant, but on the Agent, whose generated video breaks Rule 6 too', () => {
    for (const a of weeks.flat(2)) {
      expect(a.planted.length).toBeLessThanOrEqual(2);
      // The only one with two faults: the Agent, whose video was generated and who slips on something else.
      if (a.planted.length > 1) expect(a.cast).toBe('agent');
    }
  });

  it('gives the units ordinary addresses, on the streets and in the towns everyone else lives in', () => {
    const ordinary = new RegExp(`^\\d+ (${STREETS.join('|')}), (${TOWNS.join('|')})$`);
    for (const unit of weeks.flat(2).filter((a) => a.cast === 'unit')) expect(unit.address, unit.name).toMatch(ordinary);
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
