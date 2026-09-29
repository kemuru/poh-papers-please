import { describe, expect, it } from 'vitest';
import { generateWeek } from '../gen/day';
import { inspect, type Item } from '../rules/inspect';
import { judge, rulebookForDay } from '../rules/judge';
import type { Applicant, Registry, Rulebook } from '../rules/types';
import { canAppeal, type Evidence } from './court';
import { evidenceWords } from './evidence';
import { loadRun, SAVE_KEY, saveOf, stepOf, writeSave, type Step } from './save';
import { evidenceOf } from './Shift';
import { reduce, startWeek, type Action, type GameState } from './week';

// A court with evidence, hunches and an appeal, saved as steps and played back after a reload.

function fakeStore() {
  const items = new Map<string, string>();
  return {
    items,
    getItem: (key: string) => items.get(key) ?? null,
    setItem: (key: string, value: string) => void items.set(key, value),
    removeItem: (key: string) => void items.delete(key),
  };
}

/** Everything on the desk the clerk can point at, as src/court/jury.test.ts lists it. */
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

/** What a careful clerk's Inspect finds on them: the first two things on the desk that disagree under a rule in force. */
function inspected(a: Applicant, rulebook: Rulebook, registry: Registry): Evidence {
  const items = itemsFor(a, rulebook);
  for (const [i, x] of items.entries()) {
    for (const y of items.slice(i + 1)) {
      const finding = inspect(x, y, a, rulebook, registry);
      if (finding?.inForce) return { rule: finding.rule, items: [x, y] };
    }
  }
  throw new Error(`nothing on the desk shows what ${a.name} broke`);
}

/**
 * Day 1 of a week, played by a clerk who challenges every fake: the first on what Inspect would find,
 * the rest on a hunch. Then the first dismissed hunch is appealed, if there is one.
 */
function courtDay(seed: number) {
  const week = generateWeek(seed);
  const queue = week[0];
  let s: GameState = startWeek(seed, 1);
  const steps: Step[] = [];
  const act = (action: Action) => {
    const next = reduce(s, action);
    if (next !== s) steps.push(stepOf(action));
    s = next;
  };
  act({ type: 'open' });
  let proven = false;
  queue.forEach((a) => {
    act({ type: 'call' });
    const { violations } = judge(a, rulebookForDay(1), s.registry);
    if (violations.length === 0) return act({ type: 'decide', applicant: a, decision: 'accept' });
    const evidence = proven ? null : inspected(a, rulebookForDay(1), s.registry);
    proven = true;
    act({ type: 'decide', applicant: a, decision: 'challenge', evidence });
  });
  act({ type: 'close', queue });
  const hunch = s.rulings.find((r) => canAppeal(r.court));
  if (hunch) act({ type: 'appeal', index: hunch.index });
  return { s, steps, appealed: hunch?.index ?? null };
}

describe('the court in the save', () => {
  it('keeps a challenge with its evidence and an appeal, and plays them back to the same court', () => {
    const found = Array.from({ length: 60 }, (_, k) => courtDay(k + 1)).find((d) => d.appealed !== null)!;
    expect(found).toBeDefined();
    const { s, steps, appealed } = found;
    expect(steps).toContainEqual({ appeal: appealed });
    expect(steps.some((step) => typeof step === 'object' && 'challenge' in step)).toBe(true);

    const store = fakeStore();
    writeSave(store, saveOf({ seed: s.seed, startDay: 1 }, steps, s, 0));
    const run = loadRun(store);
    expect(run.resumed).toBe(true);
    expect(run.state.rulings).toEqual(s.rulings);
    expect(run.state.decided).toEqual(s.decided);
    expect(run.state.rulings.find((r) => r.index === appealed)!.court.rounds).toHaveLength(2);
  });

  it('files a challenge with evidence as evidence, and one without it as a plain challenge', () => {
    const { s } = courtDay(1);
    const withEvidence = s.decided.filter((d) => d.evidence);
    expect(withEvidence).toHaveLength(1);
    const ruling = s.rulings.find((r) => r.court.evidence);
    expect(ruling?.upheld).toBe(true);
    // An accept carries no evidence key at all.
    expect(s.decided.filter((d) => d.decision === 'accept').every((d) => !('evidence' in d))).toBe(true);
  });

  it('sets aside a save whose evidence or appeal is not one', () => {
    const { s, steps } = courtDay(1);
    for (const bad of [{ challenge: { rule: 'nope', items: [] } }, { challenge: { rule: 'sign', items: [{ kind: 'sign' }] } }, { appeal: -1 }, { appeal: 'x' }]) {
      const store = fakeStore();
      writeSave(store, { ...saveOf({ seed: s.seed, startDay: 1 }, steps, s, 0), steps: [...steps, bad as unknown as Step] });
      const run = loadRun(store);
      expect(run.setAside).toBe(true);
      expect(store.items.has(SAVE_KEY)).toBe(false);
    }
  });

  it('refuses an appeal of a case that cannot go further', () => {
    const { s } = courtDay(1);
    const done = s.rulings.find((r) => !canAppeal(r.court));
    if (done) expect(reduce(s, { type: 'appeal', index: done.index })).toBe(s);
    expect(reduce(s, { type: 'appeal', index: 999 })).toBe(s);
  });
});

/** A day begun on `day`: every fake challenged with what Inspect finds on them at the window, everyone else accepted. */
function inspectedDay(seed: number, day: number) {
  const queue = generateWeek(seed)[day - 1];
  let s: GameState = startWeek(seed, day);
  const steps: Step[] = [];
  const act = (action: Action) => {
    const next = reduce(s, action);
    if (next !== s) steps.push(stepOf(action));
    s = next;
  };
  act({ type: 'open' });
  for (const a of queue) {
    act({ type: 'call' });
    const rulebook = rulebookForDay(day);
    if (judge(a, rulebook, s.registry).valid) act({ type: 'decide', applicant: a, decision: 'accept' });
    else act({ type: 'decide', applicant: a, decision: 'challenge', evidence: inspected(a, rulebook, s.registry) });
  }
  act({ type: 'close', queue });
  return { s, steps };
}

/** The first applicant of a day begun on `day`, challenged with this evidence as the reducer takes it, saved and loaded again. */
function challengeFirst(seed: number, day: number, evidence: Evidence) {
  const applicant = generateWeek(seed)[day - 1][0];
  const actions: Action[] = [{ type: 'open' }, { type: 'call' }, { type: 'decide', applicant, decision: 'challenge', evidence }];
  const s = actions.reduce(reduce, startWeek(seed, day));
  const store = fakeStore();
  writeSave(store, saveOf({ seed, startDay: day }, actions.map(stepOf), s, 0));
  return { run: loadRun(store), store, applicant };
}

describe('evidence in the save is what Inspect finds at the window', () => {
  it('plays back every finding in force, the registry\'s answers included, against the registry as it stood at the window', () => {
    const filed: Evidence[] = [];
    for (let seed = 1; seed <= 8; seed++) {
      for (let day = 3; day <= 6; day++) {
        const { s, steps } = inspectedDay(seed, day);
        const store = fakeStore();
        writeSave(store, saveOf({ seed, startDay: day }, steps, s, 0));
        const run = loadRun(store);
        expect(run.resumed, `seed ${seed} day ${day}`).toBe(true);
        expect(run.state.decided).toEqual(s.decided);
        filed.push(...s.decided.flatMap((d) => (d.evidence ? [d.evidence] : [])));
      }
    }
    const kinds = filed.flatMap((e) => e.items.map((item) => item.kind));
    expect(kinds).toContain('name-record');
    expect(kinds).toContain('face-record');
  });

  it('sets aside a finding under a rule not in force yet: Rule 3 on day 2, with nothing held up', () => {
    const sign: Evidence = { rule: 'sign', items: [{ kind: 'sign' }, { kind: 'rule', rule: 'sign' }] };
    const { applicant } = challengeFirst(1, 2, sign);
    expect(inspect(sign.items[0], sign.items[1], applicant, rulebookForDay(2), startWeek(1, 2).registry), 'seed 1 day 2 changed: pick another').toEqual({
      rule: 'sign',
      inForce: false,
    });
    const { run, store } = challengeFirst(1, 2, sign);
    expect(run.setAside).toBe(true);
    expect(store.items.has(SAVE_KEY)).toBe(false);
  });

  it('sets aside evidence under a rule the applicant did not break, or of two things that do not disagree', () => {
    // Seed 1, day 3: Pat's sign is two characters off the wallet, and that is all that is wrong with Pat.
    const pat = generateWeek(1)[2][0];
    expect(pat.planted, 'seed 1 day 3 changed: pick another').toEqual([{ rule: 'sign', mistake: 'two-wrong' }]);
    const real: Evidence = { rule: 'sign', items: [{ kind: 'sign' }, { kind: 'wallet' }] };
    expect(challengeFirst(1, 3, real).run.resumed).toBe(true);
    for (const bad of [
      { rule: 'phrase', items: [{ kind: 'sign' }, { kind: 'wallet' }] },
      { rule: 'phrase', items: [{ kind: 'transcript' }, { kind: 'rule', rule: 'phrase' }] },
      { rule: 'sign', items: [{ kind: 'photo' }, { kind: 'frame', frame: 1 }] },
      { rule: 'sign', items: [{ kind: 'sign' }, { kind: 'sign' }] },
      { rule: 'sign', items: [{ kind: 'frame', frame: 4 }, { kind: 'rule', rule: 'sign' }] },
    ] satisfies Evidence[]) {
      const { run, store } = challengeFirst(1, 3, bad);
      expect(run.setAside, JSON.stringify(bad)).toBe(true);
      expect(store.items.has(SAVE_KEY)).toBe(false);
    }
  });

  it('files the registry\'s record of the voucher under the name on the form, however the clerk typed the search', () => {
    // Seed 1, day 4: Pat's voucher is not registered, as the record says.
    const pat = generateWeek(1)[3][0];
    expect(pat.planted, 'seed 1 day 4 changed: pick another').toEqual([{ rule: 'vouch', mistake: 'unregistered' }]);
    const voucher = pat.voucher!;
    const typed: Item = { kind: 'name-record', name: ` ${voucher.toLowerCase().replace(' ', '   ')} ` };
    expect(inspect({ kind: 'voucher' }, typed, pat, rulebookForDay(4), startWeek(1, 4).registry)).toEqual({ rule: 'vouch', inForce: true });

    const evidence = evidenceOf('vouch', [{ kind: 'voucher' }, typed], pat);
    expect(evidence.items).toEqual([{ kind: 'voucher' }, { kind: 'name-record', name: voucher }]);
    expect(evidenceWords(evidence)).toBe(`Rule 4, the voucher against the registry's record of ${voucher}.`);
    expect(evidenceOf('vouch', [typed, { kind: 'voucher' }], pat).items[0]).toEqual({ kind: 'name-record', name: voucher });
    // Someone else's record, and anything that is not a record, is filed as it was pointed at.
    const other: Item = { kind: 'name-record', name: 'ethel   pargeter' };
    expect(evidenceOf('vouch', [{ kind: 'voucher' }, other], pat).items).toEqual([{ kind: 'voucher' }, other]);
    expect(evidenceOf('sign', [{ kind: 'sign' }, { kind: 'wallet' }], pat)).toEqual({ rule: 'sign', items: [{ kind: 'sign' }, { kind: 'wallet' }] });

    // Filed either way, it plays back: the registry reads a name as the clerk types it.
    for (const e of [evidence, { rule: 'vouch', items: [{ kind: 'voucher' }, typed] } satisfies Evidence]) {
      const { run } = challengeFirst(1, 4, e);
      expect(run.resumed).toBe(true);
      expect(run.state.decided[0].evidence).toEqual(e);
    }
  });
});
