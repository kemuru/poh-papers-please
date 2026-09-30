import { describe, expect, it } from 'vitest';
import { generateWeek } from '../gen/day';
import { judge, rulebookForDay } from '../rules/judge';
import { canAppeal } from './court';
import { reduce, startWeek, type GameState, type Ruling } from './week';

// An appeal is heard in place: it changes its own case and nothing printed on the others, and a
// court note, once printed, is never printed again (GameState.shown).
const SEEDS = 100;

type Appealed = { before: GameState; after: GameState; index: number };

/**
 * Whole weeks through the reducer, by a clerk who is always right, challenges every fake on a hunch
 * and one valid applicant in four on a hunch too, then appeals every dismissal, a round at a time.
 * Every appeal is logged with the state either side of it, and every note with the card it was on.
 */
function playWeek(seed: number) {
  const week = generateWeek(seed);
  const appeals: Appealed[] = [];
  /** Every court note printed this week, with the card it was printed on. */
  const printed = new Map<string, Set<string>>();
  const log = (s: GameState) => {
    for (const r of s.rulings) {
      if (r.note === null) continue;
      const cards = printed.get(r.note) ?? new Set();
      cards.add(`${s.day}/${r.index}`);
      printed.set(r.note, cards);
    }
  };
  let s = startWeek(seed, 1);
  for (;;) {
    const queue = week[s.day - 1];
    s = reduce(s, { type: 'open' });
    queue.forEach((a, i) => {
      s = reduce(s, { type: 'call' });
      const fake = judge(a, rulebookForDay(s.day), s.registry).violations.length > 0;
      s = reduce(s, { type: 'decide', applicant: a, decision: fake || (seed + s.day + i) % 4 === 0 ? 'challenge' : 'accept' });
    });
    s = reduce(s, { type: 'close', queue });
    log(s);
    for (;;) {
      const open = s.rulings.find((r) => canAppeal(r.court));
      if (!open) break;
      const before = s;
      s = reduce(s, { type: 'appeal', index: open.index });
      appeals.push({ before, after: s, index: open.index });
      log(s);
    }
    s = reduce(s, { type: 'statement' });
    s = reduce(reduce(s, { type: 'next-day', queue }), { type: 'letter' });
    if (s.phase === 'ending') return { appeals, printed, shown: s.shown };
  }
}

const weeks = Array.from({ length: SEEDS }, (_, i) => ({ seed: i + 1, ...playWeek(i + 1) }));
const appeals = weeks.flatMap((w) => w.appeals.map((a) => ({ seed: w.seed, ...a })));
const others = (s: GameState, index: number) => s.rulings.filter((r) => r.index !== index);
const printedAs = (r: Ruling) => ({ index: r.index, upheld: r.upheld, note: r.note, removed: r.removed, rounds: r.court.rounds.length });
const flipped = appeals.filter((a) => a.after.rulings.find((r) => r.index === a.index)!.upheld);

describe('an appeal is heard in place', () => {
  it('is not vacuous: many appeals, some won, on days with other cases in court', () => {
    expect(appeals.length).toBeGreaterThan(300);
    expect(flipped.length).toBeGreaterThan(50);
    expect(appeals.filter((a) => others(a.before, a.index).some((r) => r.note !== null)).length).toBeGreaterThan(200);
  });

  it('leaves every other case as it was printed: its ruling, its note and whoever was removed with it', () => {
    for (const { seed, before, after, index } of appeals) {
      expect(others(after, index).map(printedAs), `seed ${seed}, day ${before.day}, appeal on ${index}`).toEqual(others(before, index).map(printedAs));
    }
  });

  it('keeps every line printed before it in the lines shown, and prints none of them again', () => {
    for (const { seed, before, after, index } of appeals) {
      const where = `seed ${seed}, day ${before.day}, appeal on ${index}`;
      for (const line of before.shown) expect(after.shown, where).toContain(line);
      expect(new Set(after.shown).size, where).toBe(after.shown.length);
      const was = before.rulings.find((r) => r.index === index)!;
      const now = after.rulings.find((r) => r.index === index)!;
      // The same finding keeps its note; a new one gets a line not printed before.
      if (now.upheld === was.upheld) expect(now.note, where).toBe(was.note);
      else if (now.note !== null) expect(before.shown, where).not.toContain(now.note);
      if (now.note !== null) expect(after.shown, where).toContain(now.note);
    }
  });

  it('never prints a court note on two cards in a week', () => {
    for (const { seed, printed } of weeks) {
      for (const [note, cards] of printed) expect([...cards], `seed ${seed}: ${note}`).toHaveLength(1);
    }
  });
});
