import { describe, expect, it } from 'vitest';
import { ASIDES, SLIPS } from '../content/applicants';
import { FIRST_APPLICANT, PAT, PAT_MOTHER } from '../content/cast';
import { UNIT_FACES } from '../content/portraits';
import { endDay } from '../economy/economy';
import { judge, RULE_DAYS, RULES, rulebookForDay } from '../rules/judge';
import { PHRASE } from '../rules/phrase';
import type { RuleId } from '../rules/types';
import { LAST_DAY, planWeek } from './day';

// acceptance.md, slice 3: what the week's queues are made of.
const SEEDS = Array.from({ length: 20 }, (_, i) => i + 1);
const weeks = SEEDS.map(planWeek);
/** Every applicant with where they stood and the registry they find at the window, under correct play. */
const everyone = weeks.flatMap((week, w) =>
  week.queues.flatMap((queue, d) => queue.map((a, i) => ({ ...a, seed: SEEDS[w], day: d + 1, place: i, length: queue.length, registry: week.seen[d][i] }))),
);
const newRule = (day: number) => RULES.find((r) => RULE_DAYS[r] === day);

describe('the week', () => {
  it('has every invalid applicant break exactly one rule, and a non-human Rule 0 as well, on every day', () => {
    const invalid = everyone.filter((a) => a.planted.length > 0);
    expect(invalid.length).toBeGreaterThan(250);
    for (const a of invalid) {
      const { planted, cast, lookAlike, seed, day, place, length, registry, ...visible } = a;
      const besides = planted.filter((p) => p.rule !== 'human');
      expect(besides.length, `${a.name}, day ${day}`).toBeLessThanOrEqual(1);
      if (planted.length > 1) expect(['agent', 'cutout'], `${a.name}, day ${day}`).toContain(cast);
      expect(planted.length, `${a.name}, day ${day}`).toBe(besides.length + (planted[0].rule === 'human' ? 1 : 0));
      expect(judge(visible, rulebookForDay(day), registry).violations.map((v) => v.rule), `${a.name}, day ${day}`).toEqual(planted.map((p) => p.rule));
    }
  });

  it('brings the unit, Pat and the day’s set piece in the first half of the queue', () => {
    const scripted = everyone.filter(
      (a) => a.cast === 'unit' || a.cast === 'pat' || (a.day === 4 && a.cast === 'patMother') || (a.day === 5 && a.cast === 'sybilFarm') || (a.day === 1 && a.place < 2),
    );
    expect(scripted.length).toBeGreaterThan(SEEDS.length * 12);
    for (const a of scripted) expect(a.place, `seed ${a.seed}, day ${a.day}: ${a.name}`).toBeLessThan(a.length / 2);
  });

  it('sends a Likeness unit once a day on days 1 to 6, with a new face each day, caught by one thing only', () => {
    for (const week of weeks) {
      const units = week.queues.map((queue) => queue.filter((a) => a.cast === 'unit'));
      expect(units.map((u) => u.length)).toEqual([1, 1, 1, 1, 1, 1, 0]);
      // An open panel under Rule 0, but on day 4 its maker's vouch, and on day 5 its factory face, on file at Window 7.
      expect(units.slice(0, 6).map(([u]) => u.planted.map((p) => `${p.rule}:${p.mistake}`))).toEqual([
        ['human:machine'], ['human:machine'], ['human:machine'], ['vouch:company'], ['duplicate:unit'], ['human:machine'],
      ]);
      // Nothing at the window gives a unit away: its photo is its own face, and each day's face is new.
      units.slice(0, 6).forEach(([u], i) => expect(u.photo).toEqual(UNIT_FACES[i]));
      expect(new Set(units.slice(0, 6).map(([u]) => JSON.stringify(u.photo.face))).size).toBe(6);
    }
  });

  it('sends Pat on days 1 to 4, breaking the newest rule each time, and on day 6 with nothing wrong', () => {
    for (const a of everyone.filter((x) => x.cast === 'pat')) {
      expect([1, 2, 3, 4, 6]).toContain(a.day);
      if (a.day <= 4) expect(a.planted.map((p) => p.rule), `day ${a.day}`).toEqual([newRule(a.day)]);
      else {
        const { planted, cast, lookAlike, seed, day, place, length, registry, ...visible } = a;
        expect(planted).toEqual([]);
        expect(judge(visible, rulebookForDay(day), registry).valid).toBe(true);
      }
    }
    for (const week of weeks) {
      expect(week.queues.map((queue) => queue.filter((a) => a.cast === 'pat').length)).toEqual([1, 1, 1, 1, 0, 1, 0]);
      // Day 4: Pat's voucher is Pat's mother, three places behind.
      const day4 = week.queues[3];
      expect(day4.findIndex((a) => a.name === PAT_MOTHER.name) - day4.findIndex((a) => a.name === PAT.name)).toBe(3);
      expect(day4.find((a) => a.name === PAT.name)!.voucher).toBe(PAT_MOTHER.name);
    }
  });

  it('opens with the tutorial: the same two applicants every week, one valid, then the "hooman"', () => {
    for (const week of weeks) {
      const [first, second] = week.queues[0];
      expect(first).toMatchObject({ name: FIRST_APPLICANT.name, planted: [], cast: null });
      expect(second).toMatchObject({ name: PAT.name, planted: [{ rule: 'phrase', mistake: 'wrong-word' }], cast: 'pat' });
      expect(second.video.transcript).toContain('hooman');
      expect(week.queues[0].slice(0, 2)).toEqual(weeks[0].queues[0].slice(0, 2));
    }
  });

  it('lets no ending trigger on day 1, however the day goes', () => {
    for (const savings of [0, -10_000, 10_000]) {
      const end = endDay(savings, 1, [{ decision: 'accept', correct: false }, { decision: 'challenge', correct: false }], 1);
      expect(end).toMatchObject({ fired: false, promoted: false });
    }
    expect(LAST_DAY).toBe(7);
  });

  it('has at least three kinds of offender and one valid look-alike for every rule', () => {
    const offenders = new Map<RuleId, Set<string>>(RULES.map((r) => [r, new Set()]));
    const lookAlikes = new Map<RuleId, Set<string>>(RULES.map((r) => [r, new Set()]));
    for (let seed = 1; seed <= 200; seed++) {
      const week = planWeek(seed);
      week.queues.forEach((queue, d) =>
        queue.forEach((a, n) => {
          const { planted, cast, lookAlike, ...visible } = a;
          const judged = judge(visible, rulebookForDay(d + 1), week.seen[d][n]);
          expect(judged.violations.map((v) => v.rule)).toEqual(planted.map((p) => p.rule));
          for (const p of planted) offenders.get(p.rule)!.add(p.mistake);
          if (lookAlike) {
            expect(judged.valid, `${a.name}: ${lookAlike.kind}`).toBe(true);
            lookAlikes.get(lookAlike.rule)!.add(lookAlike.kind);
          }
          // The phrase's look-alikes: an aside, a slip or chatter, and still every word that counts.
          const chatty = a.video.transcript !== PHRASE && (ASIDES.some((x) => a.video.transcript.includes(`${x},`)) || SLIPS.some(([, to]) => a.video.transcript.includes(to)));
          if (planted.length === 0 && chatty) {
            expect(judged.valid).toBe(true);
            lookAlikes.get('phrase')!.add('aside or slip');
          }
        }),
      );
    }
    for (const rule of RULES) {
      expect(offenders.get(rule)!.size, `${rule}: ${[...offenders.get(rule)!]}`).toBeGreaterThanOrEqual(3);
      expect(lookAlikes.get(rule)!.size, `${rule} look-alikes`).toBeGreaterThanOrEqual(1);
    }
  });
});
