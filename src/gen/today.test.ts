import { describe, expect, it } from 'vitest';
import { generateWeek } from './day';
import { cardLetter, seedForDate, weekCard } from './today';

// notes/game-design.md, Coming back (slice 6): today's week and the card a clerk can copy.
describe('today’s week', () => {
  it('gives the same date the same seed, always', () => {
    expect(seedForDate({ year: 2026, month: 9, day: 29 })).toBe(seedForDate({ year: 2026, month: 9, day: 29 }));
  });

  it('gives different dates different weeks, over ten years of days, each one a seed a link can name', () => {
    const seeds = new Set<number>();
    for (let n = 0; n < 3653; n++) {
      const d = new Date(Date.UTC(2026, 0, 1 + n));
      const seed = seedForDate({ year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate() });
      expect(seed).toBeGreaterThanOrEqual(1);
      expect(seed).toBeLessThanOrEqual(999_999_999);
      seeds.add(seed);
    }
    expect(seeds.size).toBe(3653);
    // And the weeks themselves differ, not only their numbers.
    const [a, b] = [seedForDate({ year: 2026, month: 9, day: 29 }), seedForDate({ year: 2026, month: 9, day: 30 })];
    expect(generateWeek(a)[1].map((x) => x.name)).not.toEqual(generateWeek(b)[1].map((x) => x.name));
  });
});

describe('copy my week', () => {
  const days = [
    { day: 1, marks: ['right', 'right', 'wrong', 'right', 'right'] as const },
    { day: 2, marks: ['right', 'right', 'right', 'right', 'right', 'home', 'home'] as const },
  ];

  it('is one row per day of stamps, then the letter, the grade and the savings', () => {
    const card = weekCard({ title: 'Today’s week, Tuesday 29 September 2026', days, ...cardLetter('reclassified', 'First'), savings: 412 });
    expect(card.split('\n')).toEqual([
      'Registry Window 3 · Today’s week, Tuesday 29 September 2026',
      'Day 1 🟩🟩🟥🟩🟩',
      'Day 2 🟩🟩🟩🟩🟩⬜⬜',
      'Reclassified · Equipment, First Class · 412 PNK',
    ]);
    expect(weekCard({ title: 'Week 7', days, ...cardLetter('fired', 'Third'), savings: -12 }).split('\n').at(-1)).toBe('Terminated · -12 PNK');
    expect(cardLetter('promoted', 'Second')).toEqual({ letter: 'Promoted', grade: 'Clerk, Second Class' });
  });

  it('names nobody: it is built from the stamps alone', () => {
    const card = weekCard({ title: 'Week 1', days, ...cardLetter('promoted', 'First'), savings: 400 });
    for (const a of generateWeek(1).flat()) expect(card).not.toContain(a.name);
  });
});
