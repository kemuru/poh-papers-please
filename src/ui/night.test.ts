import { describe, expect, it } from 'vitest';
import { generateDay } from '../gen/day';
import { judge, rulebookForDay } from '../rules/judge';
import { CITATIONS, NIGHT_DAY, nightReduce, secondsFor, startNight, type NightState } from './Night';

// notes/game-design.md, Coming back (slice 6): the night shift. Every shift another week's day 6, every
// stamp judged at once, three citations and the night is over.
const queueOf = (n: NightState) => generateDay(n.seed + n.shift - 1, NIGHT_DAY);

/** Stamps the next applicant at the window, right or wrong by the rulebook against the live registry. */
function stampNext(n: NightState, wrong: boolean): NightState {
  const queue = queueOf(n);
  let s = nightReduce(n, { type: 'call' });
  const a = queue[s.day.called - 1];
  const valid = judge(a, rulebookForDay(NIGHT_DAY), s.day.registry).valid;
  s = nightReduce(s, { type: 'decide', applicant: a, decision: valid !== wrong ? 'accept' : 'challenge' });
  return s;
}

describe('the night shift', () => {
  it('counts every stamp the rulebook agrees with, and a fake stamped in or a human challenged as a citation', () => {
    let n = nightReduce(startNight(1), { type: 'open' });
    n = stampNext(n, false);
    expect(n).toMatchObject({ right: 1, citations: 0 });
    n = stampNext(n, true);
    expect(n).toMatchObject({ right: 1, citations: 1 });
  });

  it('brings the next week’s day 6 when a queue is done, on a shorter clock, the night’s counts kept', () => {
    let n = nightReduce(startNight(5), { type: 'open' });
    for (let i = 0; i < queueOf(n).length; i++) n = stampNext(n, false);
    const shown = n.day.shown;
    n = nightReduce(n, { type: 'close', queue: queueOf(n) });
    expect(n).toMatchObject({ shift: 2, right: 10, citations: 0 });
    expect(n.day).toMatchObject({ day: NIGHT_DAY, opened: false, called: 0 });
    expect(queueOf(n)).toEqual(generateDay(6, NIGHT_DAY));
    expect(n.day.shown).toEqual(shown);
    expect([1, 2, 3, 8, 20].map(secondsFor)).toEqual([360, 330, 300, 150, 150]);
  });

  it('is over at the third citation, and nothing more is stamped', () => {
    let n = nightReduce(startNight(2), { type: 'open' });
    for (let k = 0; k < CITATIONS; k++) n = stampNext(n, true);
    expect(n.citations).toBe(CITATIONS);
    expect(nightReduce(n, { type: 'call' })).toBe(n);
  });
});
