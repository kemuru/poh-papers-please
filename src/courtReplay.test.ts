import { describe, expect, it } from 'vitest';
import { canAppeal } from './court/jury';
import type { Evidence } from './court/types';
import type { GeneratedApplicant } from './gen/applicant';
import { generateWeek } from './gen/day';
import { inspect, type Item } from './rules/inspect';
import { judge, rulebookForDay, type Decision } from './rules/judge';
import type { Applicant, Registry, Rulebook } from './rules/types';
import { reduce, startWeek, type GameState } from './ui/week';

// Same seed, same court (slice 4): whole weeks through the reducer the desk uses (src/ui/week.ts),
// with the jury hearing every challenge and the clerk appealing at the court screen.

type Choice = { decision: Decision; evidence?: Evidence | null };
/** How a clerk decides: from the applicant, the day, their place in the queue and the state of the desk. */
type Clerk = (a: GeneratedApplicant, day: number, i: number, s: GameState) => Choice;

/**
 * Plays a week from day 1 to its ending. At the court, every dismissed hunch is appealed until it
 * can go no further. Every day is logged as the court and the accounts left it.
 */
function runWeek(seed: number, clerk: Clerk) {
  const week = generateWeek(seed);
  let s = startWeek(seed, 1);
  const days: GameState[] = [];
  for (;;) {
    const queue = week[s.day - 1];
    s = reduce(s, { type: 'open' });
    queue.forEach((a, i) => {
      s = reduce(s, { type: 'call' });
      s = reduce(s, { type: 'decide', applicant: a, ...clerk(a, s.day, i, s) });
    });
    s = reduce(s, { type: 'close', queue });
    for (const { index, court } of s.rulings) {
      if (court.evidence !== null) continue;
      const now = () => s.rulings.find((r) => r.index === index)!.court;
      while (canAppeal(now())) {
        const before = s;
        s = reduce(s, { type: 'appeal', index });
        if (s === before) throw new Error(`day ${s.day}: the appeal of case ${index} was not heard`);
      }
    }
    days.push(s);
    s = reduce(reduce(s, { type: 'statement' }), { type: 'next-day', queue });
    if (s.phase === 'ending') return days;
  }
}

/** Everything on the desk the clerk can point at, as src/rules/inspect.test.ts lists it. */
const deskItems = (a: Applicant, rulebook: Rulebook): Item[] => [
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

/** What Inspect finds at the window: the first two things on the desk that disagree under a rule in force. */
function inspected(a: Applicant, rulebook: Rulebook, registry: Registry): Evidence {
  const items = deskItems(a, rulebook);
  for (const [i, x] of items.entries()) {
    for (const y of items.slice(i + 1)) {
      const finding = inspect(x, y, a, rulebook, registry);
      if (finding?.inForce) return { rule: finding.rule, items: [x, y] };
    }
  }
  throw new Error(`nothing on the desk disagrees about ${a.name}`);
}

/**
 * Accepts whoever the rulebook, read against the live registry, has nothing against; challenges the
 * rest, inspecting every other one first and sending the others on a hunch.
 */
function halfInspecting(): Clerk {
  let fakes = 0;
  return (a, day, _, s) => {
    const rulebook = rulebookForDay(day);
    if (judge(a, rulebook, s.registry).valid) return { decision: 'accept' };
    return fakes++ % 2 === 0 ? { decision: 'challenge', evidence: inspected(a, rulebook, s.registry) } : { decision: 'challenge', evidence: null };
  };
}

describe('same seed, same court, appeals included (snapshot)', () => {
  const summary = (seed: number) =>
    runWeek(seed, halfInspecting()).map((s) => ({
      day: s.day,
      rulings: s.rulings.map((r) => ({
        index: r.index,
        evidence: r.court.evidence?.rule ?? 'hunch',
        rounds: r.court.rounds.map((round) => `${round.size} jurors, fee ${round.fee}: ${round.seats.filter((seat) => seat.vote === 'uphold').length} uphold`),
      })),
      pay: s.end!.pay.total,
      savings: s.end!.after,
    }));

  it('gives identical rulings, rounds and day totals for the same seed', () => {
    const [one, two] = [summary(1), summary(2)];
    expect(summary(1)).toEqual(one);
    expect(two).not.toEqual(one);
    // Not vacuous: both kinds of case, and appeals, in each week.
    for (const days of [one, two]) {
      const rulings = days.flatMap((d) => d.rulings);
      expect(rulings.some((r) => r.evidence !== 'hunch')).toBe(true);
      expect(rulings.some((r) => r.evidence === 'hunch')).toBe(true);
      expect(rulings.some((r) => r.rounds.length > 1)).toBe(true);
    }
    expect({ seed1: one, seed2: two }).toMatchSnapshot();
  });
});
