import { describe, expect, it } from 'vitest';
import { playDay } from '../court/court';
import { generateWeek, morning, morningRegistry } from '../gen/day';
import type { GeneratedApplicant } from '../gen/applicant';
import { createRng, type Rng } from '../gen/rng';
import type { Decision } from '../rules/judge';
import { endDay, STARTING_SAVINGS, type Case, type DayEnd } from './economy';

// acceptance.md, balance tests: 20 seeded weeks per bot, played through the same generator,
// rule engine, court and economy as the game, against the registry the bot's own stamps build.
const SEEDS = Array.from({ length: 20 }, (_, i) => i + 1);

/** Decides a whole day's queue at once. */
type Bot = (queue: GeneratedApplicant[], rng: Rng) => Decision[];

const truth = (a: GeneratedApplicant): Decision => (a.planted.length === 0 ? 'accept' : 'challenge');
const flip = (d: Decision): Decision => (d === 'accept' ? 'challenge' : 'accept');

/** Gets exactly n decisions wrong a day, chosen at random. */
const mistakes =
  (n: number): Bot =>
  (queue, rng) => {
    const wrong = new Set<number>();
    while (wrong.size < Math.min(n, queue.length)) wrong.add(rng.int(0, queue.length - 1));
    return queue.map((a, i) => (wrong.has(i) ? flip(truth(a)) : truth(a)));
  };

const BOTS = {
  perfect: (queue) => queue.map(truth),
  '2 mistakes a day': mistakes(2),
  '5 mistakes a day': mistakes(5),
  'always accept': (queue) => queue.map(() => 'accept'),
  'always challenge': (queue) => queue.map(() => 'challenge'),
  /** Challenges every recurring character and accepts every ordinary-looking person. */
  'judge by looks': (queue) => queue.map((a) => (a.cast === null ? 'accept' : 'challenge')),
} satisfies Record<string, Bot>;

type Week = { days: DayEnd[]; earned: number; firedOn: number | null; promoted: boolean };

function playWeek(seed: number, bot: Bot): Week {
  const rng = createRng(seed * 7919);
  const days: DayEnd[] = [];
  let savings = STARTING_SAVINGS;
  let registry = morningRegistry(seed, 1);
  for (const [i, queue] of generateWeek(seed).entries()) {
    const day = i + 1;
    registry = morning(registry, day);
    const decisions = bot(queue, rng);
    const played = playDay(registry, day, queue, decisions);
    registry = played.registry;
    const cases: Case[] = decisions.map((decision, j) => ({ decision, correct: played.outcomes[j].correct }));
    const end = endDay(savings, day, cases, seed);
    days.push(end);
    savings = end.after;
    if (end.fired || end.promoted) break;
  }
  const last = days[days.length - 1];
  return {
    days,
    earned: days.reduce((sum, d) => sum + d.pay.total, 0),
    firedOn: last.fired ? days.length : null,
    promoted: last.promoted,
  };
}

const play = (bot: Bot) => SEEDS.map((seed) => playWeek(seed, bot));
const results = Object.fromEntries(Object.entries(BOTS).map(([name, bot]) => [name, play(bot)])) as Record<
  keyof typeof BOTS,
  Week[]
>;

describe('balance (20 seeded weeks per bot)', () => {
  it('perfect: ends every day with more savings than it started', () => {
    for (const week of results.perfect) {
      expect(week.promoted).toBe(true);
      for (const day of week.days) expect(day.after).toBeGreaterThan(day.before);
    }
  });

  it('2 random mistakes a day: reaches the Promoted ending in most runs', () => {
    expect(results['2 mistakes a day'].filter((w) => w.promoted).length).toBeGreaterThan(SEEDS.length / 2);
  });

  it('5 random mistakes a day: is fired by day 5 in most runs', () => {
    const fired = results['5 mistakes a day'].filter((w) => w.firedOn !== null && w.firedOn <= 5).length;
    expect(fired).toBeGreaterThan(SEEDS.length / 2);
  });

  it('always accept: ends below zero', () => {
    for (const week of results['always accept']) expect(week.days[week.days.length - 1].after).toBeLessThan(0);
  });

  it('always challenge: ends below zero', () => {
    for (const week of results['always challenge']) expect(week.days[week.days.length - 1].after).toBeLessThan(0);
  });

  it('judge by looks: earns at most half of what the perfect bot earns', () => {
    SEEDS.forEach((_, i) => {
      expect(results['judge by looks'][i].earned).toBeLessThanOrEqual(results.perfect[i].earned / 2);
    });
  });
});
