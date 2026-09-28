import { describe, expect, it } from 'vitest';
import { HEADLINES, RULE_NOTICES } from './content/gazette';
import type { GeneratedApplicant } from './gen/applicant';
import { generateWeek } from './gen/day';
import { createRng } from './gen/rng';
import { judge, RULE_DAYS, rulebookForDay, type Decision } from './rules/judge';
import { reduce, startWeek, type GameState } from './ui/week';

// Whole runs through the reducer the desk uses (src/ui/week.ts), which judges every stamp against
// the registry the clerk has built, hears the challenges and writes the Gazette.

type Choice = { decision: Decision };
/** How a clerk decides: from the applicant, the day, their place in the queue and the state of the desk. */
type Clerk = (a: GeneratedApplicant, day: number, i: number, s: GameState) => Choice;

/**
 * Plays a week from day 1 to its ending. Every day is logged as the court and the accounts left
 * it, with the Gazette that was on the desk that morning.
 */
function runWeek(seed: number, clerk: Clerk) {
  const week = generateWeek(seed);
  let s = startWeek(seed, 1);
  const days: GameState[] = [];
  for (;;) {
    const queue = week[s.day - 1];
    const gazette = s.gazette;
    s = reduce(s, { type: 'open' });
    queue.forEach((a, i) => {
      s = reduce(s, { type: 'call' });
      s = reduce(s, { type: 'decide', applicant: a, ...clerk(a, s.day, i, s) });
    });
    s = reduce(s, { type: 'close', queue });
    days.push({ ...s, gazette });
    s = reduce(reduce(s, { type: 'statement' }), { type: 'next-day', queue });
    if (s.phase === 'ending') return { days, final: s, week };
  }
}

/** Accepts whoever the rulebook, read against the live registry, has nothing against; challenges the rest. */
const careful: Clerk = (a, day, _, s) => {
  const { violations } = judge(a, rulebookForDay(day), s.registry);
  return violations.length === 0 ? { decision: 'accept' } : { decision: 'challenge' };
};
/** Careful, but gets about one in four wrong. */
const sloppy = (seed: number): Clerk => {
  const rng = createRng(seed * 31);
  return (a, day, i, s) => {
    const right = careful(a, day, i, s);
    if (rng.next() < 0.25) return right.decision === 'accept' ? { decision: 'challenge' } : { decision: 'accept' };
    return right;
  };
};

describe('same seed, same week (snapshot)', () => {
  const summary = (seed: number) =>
    runWeek(seed, sloppy(seed)).days.map((s) => ({
      day: s.day,
      applicants: generateWeek(seed)[s.day - 1].map((a) => `${a.name}${a.planted.length ? ` !${a.planted[0].rule}:${a.planted[0].mistake}` : ''}`),
      decided: s.decided.map((d) => `${d.decision}: ${d.outcome.correct ? 'right' : 'wrong'}${d.citation ? `, ${d.citation}` : ''}`),
      court: s.rulings.map((r) => `${r.index}: ${r.upheld ? 'upheld' : 'dismissed'}${r.removed ? `, removed ${r.removed}` : ''}`),
      totals: { pay: s.end!.pay.total, bills: s.end!.bills.reduce((sum, b) => sum + b.amount, 0), savings: s.end!.after },
    }));

  it('gives identical applicants, court results and day totals for the same seed', () => {
    expect(summary(1)).toEqual(summary(1));
    expect(summary(2)).not.toEqual(summary(1));
    expect({ seed1: summary(1), seed2: summary(2) }).toMatchSnapshot();
  });
});

describe('scoring against the live registry', () => {
  /** A later applicant whose voucher is someone refused earlier in the week: invalid, unless the clerk let that person in. */
  function vouchedByAnEarlierFake() {
    for (let seed = 1; seed <= 400; seed++) {
      const week = generateWeek(seed);
      for (let d = 5; d < week.length; d++) {
        for (const later of week[d]) {
          if (later.planted[0]?.rule !== 'vouch' || later.planted[0].mistake !== 'unregistered') continue;
          const fake = week.slice(0, d).flat().find((a) => a.name === later.voucher && a.planted.length > 0);
          if (fake) return { seed, fake, later };
        }
      }
    }
    throw new Error('No week has an applicant vouched for by an earlier fake');
  }

  it('judges an applicant vouched for by a fake the clerk accepted earlier as valid, and otherwise not', () => {
    const { seed, fake, later } = vouchedByAnEarlierFake();
    const outcomeFor = (letFakeIn: boolean) => {
      const clerk: Clerk = (a, day, i, s) =>
        a.name === fake.name && letFakeIn ? { decision: 'accept' } : a.name === later.name ? { decision: 'accept' } : careful(a, day, i, s);
      const { days, week } = runWeek(seed, clerk);
      const day = days.find((s) => week[s.day - 1].some((a) => a.name === later.name))!;
      return day.decided[week[day.day - 1].findIndex((a) => a.name === later.name)];
    };
    const letIn = outcomeFor(true);
    expect(letIn.outcome).toEqual({ correct: true, violations: [] });
    expect(letIn.citation).toBeNull();
    const keptOut = outcomeFor(false);
    expect(keptOut.outcome.correct).toBe(false);
    expect(keptOut.outcome.violations).toMatchObject([{ rule: 'vouch', voucher: fake.name, problem: 'unregistered' }]);
  });

  it('judges a face the clerk registered earlier in the week as a duplicate when it comes back', () => {
    // Pat, let in on day 1 with "hooman", is already registered when Pat comes back on day 6.
    const clerk: Clerk = (a, day, i, s) => (a.cast === 'pat' && day === 1 ? { decision: 'accept' } : careful(a, day, i, s));
    const { days } = runWeek(3, clerk);
    const day6 = days[5];
    const pat = generateWeek(3)[5].findIndex((a) => a.cast === 'pat');
    expect(generateWeek(3)[5][pat].planted).toEqual([]);
    expect(day6.decided[pat].outcome.violations.map((v) => v.rule)).toContain('duplicate');
  });
});

describe('no line from a content pool twice in one run', () => {
  const clerks: [string, Clerk][] = [
    ['careful', careful],
    ['sloppy', sloppy(7)],
    ['always accept', () => ({ decision: 'accept' })],
    ['always challenge', () => ({ decision: 'challenge' })],
  ];

  it.each(clerks)('%s: memos, court notes and the Gazette are each printed once', (_, clerk) => {
    for (let seed = 1; seed <= 8; seed++) {
      const { days, final } = runWeek(seed, clerk);
      const memos = days.flatMap((s) => s.decided.flatMap((d) => (d.memo ? [d.memo] : [])));
      const notes = days.flatMap((s) => s.rulings.flatMap((r) => (r.note ? [r.note] : [])));
      const gazettes = days.flatMap((s) => (s.gazette ? [s.gazette] : []));
      expect(gazettes.map((g) => g.day)).toEqual(days.slice(1).map((s) => s.day));
      const items = gazettes.flatMap((g) => [g.headline, g.notice, g.thread, g.small, ...g.report]);
      const headlines = gazettes.map((g) => g.headlineLine);
      for (const lines of [memos, notes, items, headlines]) expect(lines.length - new Set(lines).size, `seed ${seed}`).toBe(0);
      // The run's shown list holds each of them once, too.
      expect(final.shown.length).toBe(new Set(final.shown).size);
    }
  });

  it('keeps remarks, names and addresses to one person each within a week, the new cast included', () => {
    for (let seed = 1; seed <= 20; seed++) {
      const people = generateWeek(seed).flat();
      expect(new Set(people.map((a) => a.remark)).size).toBe(people.length);
      const fillIns = people.filter((a) => a.cast === null);
      expect(new Set(fillIns.map((a) => a.name)).size).toBe(fillIns.length);
      expect(new Set(fillIns.map((a) => a.address)).size).toBe(fillIns.length);
    }
  });
});

describe('the morning Gazette', () => {
  it('reports yesterday’s actual decisions and gives the reason for the day’s new rule, from day 2', () => {
    for (let seed = 1; seed <= 6; seed++) {
      const { days } = runWeek(seed, sloppy(seed));
      for (const [n, s] of days.slice(0, -1).entries()) {
        const g = days[n + 1].gazette!;
        const today = s.day + 1;
        expect(g.day).toBe(today);
        const queue = generateWeek(seed)[s.day - 1];
        const named = queue.filter((a) => g.report.some((line) => line.includes(a.name)) || g.headline.includes(a.name.toUpperCase()));
        expect(named.length, `day ${today}: ${g.report.join(' ')}`).toBeGreaterThan(0);
        expect(g.report[0]).toContain(`Day ${s.day} at Window 3: ${s.decided.filter((d, i) => d.decision === 'accept' || !s.rulings.find((r) => r.index === i)?.upheld).length} registered`);
        if (today <= 6) {
          expect(g.notice).toBe(RULE_NOTICES[today]);
          expect(g.notice).toMatch(/^(Following|A registration)/);
          expect(rulebookForDay(today).filter((r) => RULE_DAYS[r] === today)).toHaveLength(1);
        }
      }
    }
  });

  it('leads with a Likeness unit when the clerk registered one, and with a human sent to court when that happened', () => {
    const unitIn: Clerk = (a, day, i, s) => (a.cast === 'unit' && day === 1 ? { decision: 'accept' } : careful(a, day, i, s));
    const day2 = runWeek(1, unitIn).days[1].gazette!;
    expect(HEADLINES.unit).toContain(day2.headlineLine);
    const firstChallenged: Clerk = (a, day, i, s) => (day === 1 && i === 0 ? { decision: 'challenge' } : careful(a, day, i, s));
    const humanDay2 = runWeek(1, firstChallenged).days[1].gazette!;
    expect(HEADLINES.human).toContain(humanDay2.headlineLine);
    expect(humanDay2.headline).toContain(generateWeek(1)[0][0].name.toUpperCase());
  });
});
