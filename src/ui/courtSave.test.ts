import { describe, expect, it } from 'vitest';
import { generateWeek } from '../gen/day';
import { judge, rulebookForDay } from '../rules/judge';
import { canAppeal, type Evidence } from './court';
import { loadRun, SAVE_KEY, saveOf, stepOf, writeSave, type Step } from './save';
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
    const evidence: Evidence | null = proven ? null : { rule: violations[0].rule, items: [{ kind: 'transcript' }, { kind: 'rule', rule: violations[0].rule }] };
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
