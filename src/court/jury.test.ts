import { describe, expect, it } from 'vitest';
import { APPEALS } from '../economy/economy';
import { planWeek } from '../gen/day';
import { inspect, type Item } from '../rules/inspect';
import { judge, rulebookForDay, type Decision } from '../rules/judge';
import type { Applicant, Registry, RuleId, Rulebook, Violation } from '../rules/types';
import { hearChallenges, playDay } from './court';
import { appealCase, appealFee, canAppeal, caseSeed, FIND, hearCase, isUpheld, JUROR_STAKES, plainest, settle, TIERS, visibility } from './jury';
import { JUROR_POOL, JURY_SIZES, type CourtCase, type Evidence, type Filed } from './types';

// acceptance.md, slice 4: the jury. Real applicants from 200 seeded weeks, each judged under the
// rulebook of their day against the registry they find at the window (as src/oracle.test.ts does),
// so every kind of fault the generator plants goes to court.
const WEEKS = 200;

type Heard = { seed: number; day: number; index: number; applicant: Applicant; rulebook: Rulebook; registry: Registry; violations: Violation[]; kind: string };
const everyone: Heard[] = Array.from({ length: WEEKS }, (_, w) => w + 1).flatMap((seed) => {
  const week = planWeek(seed);
  return week.queues.flatMap((queue, d) =>
    queue.map(({ planted, cast, lookAlike, ...applicant }, index) => {
      const rulebook = rulebookForDay(d + 1);
      const registry = week.seen[d][index];
      const kind = planted.map((p) => `${p.rule}:${p.mistake}`).join(' + ') || 'valid';
      return { seed, day: d + 1, index, applicant, rulebook, registry, violations: judge(applicant, rulebook, registry).violations, kind };
    }),
  );
});
const fakes = everyone.filter((h) => h.violations.length > 0);
const valid = everyone.filter((h) => h.violations.length === 0);
const kinds = [...new Set(fakes.map((h) => h.kind))];

/** Everything on the desk the clerk can point at, as src/rules/inspect.test.ts lists it. */
const itemsFor = (a: Applicant, rulebook: Rulebook): Item[] => [
  { kind: 'photo' },
  { kind: 'frame', frame: 1 },
  { kind: 'frame', frame: 2 },
  { kind: 'frame', frame: 3 },
  { kind: 'transcript' },
  { kind: 'name' },
  { kind: 'birth-year' },
  ...(a.wallet !== undefined ? [{ kind: 'wallet' } as Item, { kind: 'sign' } as Item] : []),
  ...(a.voucher !== undefined ? [{ kind: 'voucher' } as Item, { kind: 'name-record', name: a.voucher ?? '' } as Item] : []),
  ...(rulebook.includes('duplicate') ? [{ kind: 'face-record' } as Item] : []),
  ...rulebook.map((rule): Item => ({ kind: 'rule', rule })),
];

/** What Inspect finds on them under this rule: the first two things on the desk that disagree under it. */
function evidenceFor(h: Heard, rule: RuleId): Evidence {
  const items = itemsFor(h.applicant, h.rulebook);
  for (const [i, x] of items.entries()) {
    for (const y of items.slice(i + 1)) if (inspect(x, y, h.applicant, h.rulebook, h.registry)?.rule === rule) return { rule, items: [x, y] };
  }
  throw new Error(`nothing on the desk shows ${rule} for ${h.applicant.name}`);
}

const filed = (h: Heard, evidence: Evidence | null, seed = h.seed): Filed => ({ seed, day: h.day, index: h.index, violations: h.violations, evidence });
/** Appealed as far as it goes. */
const toTheEnd = (c: CourtCase): CourtCase => (canAppeal(c) ? toTheEnd(appealCase(c)) : c);
const upholds = (c: CourtCase) => c.rounds.flatMap((r) => r.seats).filter((s) => s.vote === 'uphold').length;

describe('the jury', () => {
  it('is not vacuous: thousands of fakes, every kind of fault the generator plants, and every tier', () => {
    expect(fakes.length).toBeGreaterThan(3000);
    expect(new Set(fakes.flatMap((h) => h.kind.split(' + ')))).toEqual(
      new Set([
        'human:machine', 'human:deepfake', 'human:printed', 'human:generated',
        'phrase:wrong-word', 'phrase:missing-words', 'phrase:silence', 'phrase:quiet-word',
        'photo:another-face', 'photo:mirrored', 'photo:filter',
        'sign:two-wrong', 'sign:no-sign', 'sign:qr', 'sign:wrong-address',
        'vouch:company', 'vouch:unregistered', 'vouch:busy',
        'duplicate:farm', 'duplicate:clone', 'duplicate:unit', 'duplicate:back-in-a-hat',
        // Socrates comes before day 6: 470 BC is never an offence in a generated week.
        'living:version', 'living:year-typo', 'living:no-blink',
      ]),
    );
    expect(new Set(fakes.flatMap((h) => h.violations.map(visibility)))).toEqual(new Set(TIERS));
  });

  it('sits 3, then 7, then 15, and there is no fourth round', () => {
    expect(JURY_SIZES).toEqual([3, 7, 15]);
    expect(JUROR_STAKES).toHaveLength(JUROR_POOL);
    for (const h of [...valid.slice(0, 100), ...fakes.slice(0, 100)]) {
      const c = toTheEnd(hearCase(filed(h, null)));
      c.rounds.forEach((r, n) => {
        expect(r.size).toBe(JURY_SIZES[n]);
        expect(r.seats).toHaveLength(r.size);
      });
      if (!isUpheld(c)) expect(c.rounds).toHaveLength(3);
      expect(canAppeal(c)).toBe(false);
      expect(appealFee(c)).toBeNull();
      expect(appealCase(c)).toBe(c);
    }
  });

  it('upholds evidence at the first jury, in every seed and for every kind of fault, every seat for the evidence', () => {
    for (const h of fakes) {
      for (const v of h.violations) {
        const c = hearCase(filed(h, evidenceFor(h, v.rule)));
        expect(c.rounds, `${h.kind}, week ${h.seed}`).toHaveLength(1);
        expect(c.rounds[0].seats.every((s) => s.vote === 'uphold' && s.reason === 'evidence')).toBe(true);
        expect(isUpheld(c)).toBe(true);
        expect(canAppeal(c)).toBe(false);
        expect(appealFee(c)).toBeNull();
        expect(appealCase(c)).toBe(c);
      }
    }
  });

  it('on a hunch, finds a plain fault more often than one often seen, and that more often than a rare one', () => {
    const rate = (tier: string) => {
      const heard = fakes.filter((h) => plainest(h.violations) === tier).map((h) => hearCase(filed(h, null)));
      return heard.filter(isUpheld).length / heard.length;
    };
    const rates = TIERS.map(rate);
    for (let t = 1; t < TIERS.length; t++) expect(rates[t], TIERS[t]).toBeLessThan(rates[t - 1]);
    expect(rates[0]).toBeGreaterThan(0.95);
    expect(rates[TIERS.length - 1]).toBeLessThan(0.5);
    // Each seat looks harder in each appeal.
    for (const tier of TIERS) for (let n = 1; n < 3; n++) expect(FIND[tier][n]).toBeGreaterThan(FIND[tier][n - 1]);
  });

  it('never has a seat uphold a valid applicant, on a hunch or on evidence that names nothing they broke, to the last round', () => {
    expect(valid.length).toBeGreaterThan(5000);
    for (const h of valid) {
      for (const evidence of [null, { rule: 'phrase', items: [{ kind: 'transcript' }, { kind: 'rule', rule: 'phrase' }] } as Evidence]) {
        const c = toTheEnd(hearCase(filed(h, evidence)));
        expect(c.rounds).toHaveLength(3);
        expect(upholds(c), h.applicant.name).toBe(0);
        expect(c.rounds.some((r) => r.upheld)).toBe(false);
      }
    }
  });

  it('hears evidence under a rule they did not break as a hunch: jurors find only what is there', () => {
    const other = (h: Heard): RuleId | undefined => h.rulebook.find((r) => !h.violations.some((v) => v.rule === r));
    for (const h of fakes.slice(0, 500)) {
      const rule = other(h);
      if (!rule) continue;
      const c = toTheEnd(hearCase(filed(h, { rule, items: [{ kind: 'rule', rule }, { kind: 'name' }] })));
      for (const s of c.rounds.flatMap((r) => r.seats)) {
        expect(s.reason).not.toBe('evidence');
        if (s.found) expect(h.violations.map((v) => v.rule)).toContain(s.found);
      }
    }
  });

  it('fairness: a correct hunch appealed to the last round wins in at least 95% of seeds, for every kind of fault', () => {
    for (const kind of kinds) {
      const some = fakes.filter((h) => h.kind === kind).slice(0, 5);
      const won = some.flatMap((h) => Array.from({ length: 200 }, (_, s) => isUpheld(toTheEnd(hearCase(filed(h, null, s + 1))))));
      expect(won.filter(Boolean).length / won.length, kind).toBeGreaterThanOrEqual(0.95);
    }
  });

  it('gives the same court for the same filed case, appeals included, whatever else was heard that day', () => {
    for (const h of fakes.slice(0, 300)) {
      const first = toTheEnd(hearCase(filed(h, null)));
      hearCase(filed(fakes[0], null));
      expect(toTheEnd(hearCase(filed(h, null)))).toEqual(first);
      // Round n comes from the case's seed and n alone.
      expect(hearCase(filed(h, null)).rounds[0]).toEqual(first.rounds[0]);
    }
    // A hash of the week, the day and the place in the queue, not their sum.
    const seeds = everyone.map((h) => caseSeed(h.seed, h.day, h.index));
    expect(new Set(seeds).size).toBe(seeds.length);
    expect(caseSeed(1, 2, 4)).not.toBe(caseSeed(2, 2, 3));
    expect(caseSeed(1, 2, 4)).not.toBe(caseSeed(1, 3, 3));
  });

  it('can draw one juror into several seats of a round, one vote each, and always does in a round of 15', () => {
    const heard = fakes.slice(0, 200).map((h) => toTheEnd(hearCase(filed(h, null))));
    const twice = (seats: readonly { juror: number }[]) => new Set(seats.map((s) => s.juror)).size < seats.length;
    const firstJuries = heard.map((c) => c.rounds[0]);
    expect(firstJuries.some((r) => twice(r.seats) && r.seats.length === r.size)).toBe(true);
    for (const r of heard.flatMap((c) => c.rounds)) {
      if (r.size === 15) expect(twice(r.seats)).toBe(true);
      for (const s of r.seats) expect(s.juror >= 0 && s.juror < JUROR_POOL).toBe(true);
    }
  });

  it('upholds on more than half the seats, and the bubbles never change a vote', () => {
    for (const h of [...fakes.slice(0, 500), ...valid.slice(0, 200)]) {
      for (const r of toTheEnd(hearCase(filed(h, null))).rounds) {
        expect(r.upheld).toBe(r.seats.filter((s) => s.vote === 'uphold').length * 2 > r.size);
        for (const s of r.seats) {
          if (s.reason === 'found') expect(s.vote === 'uphold' && s.found !== undefined).toBe(true);
          else expect(s.found).toBeUndefined();
          if (s.reason === 'missed' || s.reason === 'unopened') expect(s.vote).toBe('dismiss');
          if (s.reason === 'refuses') expect(s.vote).toBe('abstain');
          if (s.reason === 'follows') expect(s.vote).toBe(r.upheld ? 'uphold' : 'dismiss');
        }
      }
    }
  });

  it('charges the appeal fees from the economy: nothing for the first jury, then 10, then 20', () => {
    const dismissed = fakes.map((h) => hearCase(filed(h, null))).filter((c) => !isUpheld(c));
    expect(dismissed.length).toBeGreaterThan(100);
    let full = 0;
    for (let c of dismissed) {
      expect(c.rounds[0].fee).toBe(0);
      expect(canAppeal(c)).toBe(true);
      expect(appealFee(c)).toBe(APPEALS.fees[0]);
      c = appealCase(c);
      expect(c.rounds[1].fee).toBe(APPEALS.fees[0]);
      if (isUpheld(c)) {
        expect(canAppeal(c)).toBe(false);
        expect(appealFee(c)).toBeNull();
        expect(appealCase(c)).toBe(c);
        continue;
      }
      expect(appealFee(c)).toBe(APPEALS.fees[1]);
      c = appealCase(c);
      expect(c.rounds[2].fee).toBe(APPEALS.fees[1]);
      expect(appealFee(c)).toBeNull();
      full++;
    }
    expect(full).toBeGreaterThan(0);
  });
});

describe('settling the day', () => {
  it('applies the rulings to the registry as hearChallenges does when the court rules on the facts', () => {
    for (let seed = 1; seed <= 5; seed++) {
      const week = planWeek(seed);
      week.queues.forEach((queue, d) => {
        const day = d + 1;
        const decisions = queue.map((a) => (a.planted.length > 0 ? 'challenge' : 'accept') as Decision);
        const facts = playDay(week.mornings[d], day, queue, decisions);
        // A careful clerk, evidence on every challenge: the jury rules as the facts do.
        const withJury = playDay(week.mornings[d], day, queue, decisions, {
          seed,
          evidence: (index, outcome) => {
            const h = everyone.find((e) => e.seed === seed && e.day === day && e.index === index)!;
            return evidenceFor({ ...h, violations: outcome.violations }, outcome.violations[0].rule);
          },
          appeal: () => true,
        });
        expect(withJury.hearings).toEqual(facts.hearings);
        expect(withJury.registry).toEqual(facts.registry);
        expect(withJury.cases.every(isUpheld)).toBe(true);
        // settle() with the facts' rulings is hearChallenges.
        const challenged = queue.flatMap((applicant, i) => (decisions[i] === 'challenge' ? [{ applicant, outcome: facts.outcomes[i] }] : []));
        const settled = settle(week.mornings[d], day, challenged.map(({ applicant, outcome }) => ({ applicant, upheld: outcome.correct })));
        const heard = hearChallenges(week.mornings[d], day, challenged);
        expect(settled.removed).toEqual(heard.hearings.map((h) => h.removed));
        expect(settled.registry).toEqual(heard.registry);
      });
    }
  });

  it('registers a dismissed applicant and keeps their voucher; removes the voucher of an upheld one', () => {
    const week = planWeek(3);
    const day = 4;
    const queue = week.queues[day - 1];
    const i = queue.findIndex((a) => a.planted.length === 0 && a.voucher);
    const applicant = queue[i];
    const registry = week.seen[day - 1][i].map((r) => (r.name === applicant.voucher ? { ...r, vouching: applicant.name } : r));
    const up = settle(registry, day, [{ applicant, upheld: true }]);
    expect(up.removed).toEqual([applicant.voucher]);
    expect(up.registry.some((r) => r.name === applicant.voucher || r.name === applicant.name)).toBe(false);
    const down = settle(registry, day, [{ applicant, upheld: false }]);
    expect(down.removed).toEqual([null]);
    expect(down.registry.find((r) => r.name === applicant.name)).toMatchObject({ day });
    expect(down.registry.some((r) => r.name === applicant.voucher)).toBe(true);
  });

  it('plays a day without a litigant exactly as before: no cases, nothing new in the hearings', () => {
    const week = planWeek(2);
    const queue = week.queues[4];
    const decisions = queue.map((a) => (a.planted.length > 0 ? 'challenge' : 'accept') as Decision);
    const played = playDay(week.mornings[4], 5, queue, decisions);
    expect(Object.keys(played).sort()).toEqual(['hearings', 'outcomes', 'registry']);
    for (const h of played.hearings) expect(Object.keys(h).sort()).toEqual(['removed', 'upheld']);
  });
});
