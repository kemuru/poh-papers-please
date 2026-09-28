import { describe, expect, it } from 'vitest';
import { generateWeek } from '../gen/day';
import { dayAgain, dayBegun, fingerprint, loadRun, newRun, replay, SAVE_KEY, saveOf, stepOf, writeSave, type Step } from './save';
import { reduce, startWeek, type Action, type GameState } from './week';

/** Storage as the browser keeps it, in memory; `blocked` throws as a refusing browser does. */
function fakeStore(blocked = false) {
  const items = new Map<string, string>();
  const refuse = () => {
    if (blocked) throw new DOMException('The operation is insecure.', 'SecurityError');
  };
  return {
    items,
    getItem: (key: string) => (refuse(), items.get(key) ?? null),
    setItem: (key: string, value: string) => (refuse(), void items.set(key, value)),
    removeItem: (key: string) => (refuse(), void items.delete(key)),
  };
}

/** Plays a week as a clerk would, noting each step that changed something, until `stop` says so. */
function play(seed: number, stop: (s: GameState) => boolean, decide: (i: number) => Omit<Extract<Action, { type: 'decide' }>, 'type' | 'applicant'>) {
  const week = generateWeek(seed);
  let s = startWeek(seed, 1);
  const steps: Step[] = [];
  const act = (action: Action) => {
    const next = reduce(s, action);
    if (next !== s) steps.push(stepOf(action));
    s = next;
  };
  const mornings: number[] = [];
  while (!stop(s) && s.phase !== 'ending') {
    const queue = week[s.day - 1];
    mornings[s.day] = s.savings;
    act({ type: 'open' });
    for (let i = 0; i < queue.length && !stop(s); i++) {
      act({ type: 'call' });
      if (!stop(s)) act({ type: 'decide', applicant: queue[i], ...decide(i) });
    }
    if (stop(s)) break;
    act({ type: 'close', queue });
    act({ type: 'statement' });
    act({ type: 'next-day', queue });
  }
  return { s, steps, week, mornings };
}

const careful = (i: number) => (i % 3 === 2 ? { decision: 'challenge' as const } : { decision: 'accept' as const });

describe('the save', () => {
  it('plays back a shift the clock ended, and keeps the clock at closing time', () => {
    const { s: before, steps } = play(4, (s) => s.day === 2 && s.decided.length === 2, careful);
    const s = reduce(before, { type: 'time-up' });
    expect(s.timeUp).toBe(true);
    const store = fakeStore();
    writeSave(store, saveOf({ seed: 4, startDay: 1 }, [...steps, 'time-up'], s, 150));

    const run = loadRun(store);
    expect(run.resumed).toBe(true);
    expect(run.state).toEqual(s);
    expect(run.clock).toBe(150);
  });

  it('plays back to the very same desk, mid-shift on day 2, with the clock where it was', () => {
    const { s, steps } = play(4, (s) => s.day === 2 && s.decided.length === 3, careful);
    expect(steps).toContain('challenge');
    const store = fakeStore();
    writeSave(store, saveOf({ seed: 4, startDay: 1 }, steps, s, 97.5));

    const run = loadRun(store);
    expect(run.resumed).toBe(true);
    expect(run.setAside).toBe(false);
    expect(run.state).toEqual(s);
    expect(run.steps).toEqual(steps);
    expect(run.clock).toBe(97.5);
  });

  it('keeps no clock once the window is shut', () => {
    const { s, steps } = play(4, (s) => s.day === 2, careful);
    const store = fakeStore();
    writeSave(store, saveOf({ seed: 4, startDay: 1 }, steps, s, 360));
    expect(loadRun(store)).toMatchObject({ resumed: true, clock: 0, state: { day: 2, opened: false } });
  });

  it('begins seed 1 afresh when nothing is saved', () => {
    const run = loadRun(fakeStore());
    expect(run).toMatchObject({ seed: 1, startDay: 1, steps: [], resumed: false, setAside: false });
    expect(run.state).toEqual(startWeek(1, 1));
  });

  it('sets aside a save that is not a save, and begins again', () => {
    const store = fakeStore();
    store.setItem(SAVE_KEY, '{"v":1,"seed":');
    expect(loadRun(store)).toMatchObject({ seed: 1, resumed: false, setAside: true });
    expect(store.items.get(SAVE_KEY)).toBeUndefined();
    expect(store.items.get('poh-save-set-aside')).toBe('{"v":1,"seed":');
  });

  it('sets aside a save the game no longer leads to, keeping its seed', () => {
    const { s, steps } = play(9, (s) => s.day === 1 && s.decided.length === 2, careful);
    const store = fakeStore();
    // As if the generator had changed since: the same steps now end somewhere else.
    writeSave(store, { ...saveOf({ seed: 9, startDay: 1 }, steps, s, 0), check: fingerprint({ ...s, savings: s.savings + 1 }) });
    expect(loadRun(store)).toMatchObject({ seed: 9, steps: [], resumed: false, setAside: true });
  });

  it('sets aside steps that could not have been taken', () => {
    const store = fakeStore();
    const s = startWeek(2, 1);
    store.setItem(SAVE_KEY, JSON.stringify({ ...saveOf({ seed: 2, startDay: 1 }, [], s, 0), steps: ['open', 'accept'] }));
    expect(loadRun(store).setAside).toBe(true);
    // A challenge on a named rule is from before challenges named none.
    store.setItem(SAVE_KEY, JSON.stringify({ ...saveOf({ seed: 2, startDay: 1 }, [], s, 0), steps: ['open', 'call', 'challenge:phrase'] }));
    expect(loadRun(store).setAside).toBe(true);
    expect(replay(2, 1, ['open', 'accept'], generateWeek(2))).toBeNull();
  });

  it('plays on in memory when the browser refuses storage', () => {
    const store = fakeStore(true);
    expect(() => writeSave(store, saveOf({ seed: 1, startDay: 1 }, [], startWeek(1, 1), 0))).not.toThrow();
    expect(loadRun(store)).toMatchObject({ seed: 1, resumed: false, setAside: false });
  });

  it('starts today again at this morning’s paper, with this morning’s savings', () => {
    const { s, steps, week, mornings } = play(4, (s) => s.day === 3 && s.decided.length === 4, careful);
    const run = { ...newRun(4, 1, week), steps, state: s };
    expect(dayBegun(steps, s)).toBe(true);
    const again = dayAgain(run, steps, s);
    expect(again.state).toMatchObject({ day: 3, phase: 'shift', opened: false, called: 0, decided: [], savings: mornings[3] });
    expect(again.steps).toEqual(steps.slice(0, steps.lastIndexOf('next-day') + 1));
    expect(dayBegun(again.steps, again.state)).toBe(false);
  });

  it('after the letter, starts the day that ended the week again', () => {
    // A clerk who challenges everyone runs out of money before Humanity Day.
    const { s, steps, week, mornings } = play(4, () => false, () => ({ decision: 'challenge' }));
    expect(s.phase).toBe('ending');
    expect(s.end?.fired).toBe(true);
    const again = dayAgain({ ...newRun(4, 1, week), steps, state: s }, steps, s);
    expect(again.state).toMatchObject({ day: s.day, phase: 'shift', opened: false, savings: mornings[s.day] });
  });
});
