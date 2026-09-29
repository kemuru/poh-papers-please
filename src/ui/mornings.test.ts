import { describe, expect, it } from 'vitest';
import { generateWeek } from '../gen/day';
import { backTo, newRun, replay, stepOf, type Run, type Step } from './save';
import { reduce, startWeek, type Action, type GameState } from './week';

// notes/game-design.md, Coming back (slice 6): go back to any earlier morning of the week. The saved
// steps make it a cut: everything before that morning is kept, nothing after.

/** Plays the week by the rulebook, day by day, to `lastDay`'s evening; returns the run and each morning as it was. */
function playTo(seed: number, lastDay: number, startDay = 1) {
  const week = generateWeek(seed);
  let s = startWeek(seed, startDay);
  const steps: Step[] = [];
  const mornings = new Map<number, GameState>();
  const act = (action: Action) => {
    const next = reduce(s, action);
    if (next !== s) steps.push(stepOf(action));
    s = next;
  };
  for (;;) {
    mornings.set(s.day, s);
    const queue = week[s.day - 1];
    act({ type: 'open' });
    for (const a of queue) {
      act({ type: 'call' });
      act({ type: 'decide', applicant: a, decision: a.planted.length === 0 ? 'accept' : 'challenge' });
    }
    act({ type: 'close', queue });
    act({ type: 'statement' });
    if (s.day === lastDay) break;
    act({ type: 'next-day', queue });
  }
  const run: Run = { ...newRun(seed, startDay, week), steps, state: s };
  return { run, steps, mornings };
}

describe('going back to an earlier morning', () => {
  it('lays out that morning’s paper and savings as they were, with the steps before it and none after', () => {
    const { run, steps, mornings } = playTo(3, 4);
    for (const day of [1, 2, 3, 4]) {
      const back = backTo(run, steps, day);
      expect(back.state, `day ${day}`).toEqual(mornings.get(day));
      expect(back.steps.filter((x) => x === 'next-day')).toHaveLength(day - 1);
      expect(replay(3, 1, back.steps, run.week)).toEqual(back.state);
    }
  });

  it('counts mornings from the day the week began on, for a week a link began later', () => {
    const { run, steps, mornings } = playTo(5, 5, 3);
    expect(backTo(run, steps, 3).state).toEqual(mornings.get(3));
    expect(backTo(run, steps, 4).state).toEqual(mornings.get(4));
  });

  it('goes back from the letter at the end of the week to any of its mornings, Humanity Day’s included', () => {
    const { run, steps, mornings } = playTo(2, 7);
    const week = generateWeek(2);
    const ended = reduce(run.state, { type: 'next-day', queue: week[6] });
    expect(ended.phase).toBe('ending');
    const all = [...steps, 'next-day' as const];
    expect(backTo({ ...run, state: ended }, all, 7).state).toEqual(mornings.get(7));
    expect(backTo({ ...run, state: ended }, all, 1).state).toEqual(mornings.get(1));
  });
});
