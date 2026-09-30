import { describe, expect, it } from 'vitest';
import { UNIT_FACES } from './content/portraits';
import { CLERK, FIRST_APPLICANT } from './content/cast';
import { HEADLINES, LIKENESS_FINED, SPECIAL } from './content/gazette';
import { CLERK_MEMO } from './content/verdicts';
import type { Evidence } from './court/types';
import { OFFER, STARTING_SAVINGS } from './economy/economy';
import { endingTonight, gradeOf, headhunted, REPLACED_AT, type EndingId } from './economy/endings';
import type { GeneratedApplicant } from './gen/applicant';
import { generateWeek, LAST_DAY } from './gen/day';
import { writeGazette, writeSpecial } from './gen/gazette';
import { writeClip, writeLetter, type WeekEnd } from './gen/letters';
import { inspect, type Item } from './rules/inspect';
import { judge, rulebookForDay, type Decision } from './rules/judge';
import type { Applicant, Registry, Rulebook } from './rules/types';
import { replay, type Step } from './ui/save';
import { reduce, startWeek, weekEnd, type Action, type GameState } from './ui/week';

// notes/game-design.md, Endings (slice 5): which letter the week ends with, what it says, and Likeness's
// offer, played through the reducer the desk uses (src/ui/week.ts), against the registry the clerk builds.

type Choice = { decision: Decision; evidence?: Evidence | null };
type Clerk = (a: GeneratedApplicant, day: number, s: GameState) => Choice;

/** Everything on the desk the clerk can point at. */
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

/** What Inspect finds on them: the first two things on the desk that disagree under a rule in force. */
function evidenceFor(a: Applicant, day: number, registry: Registry): Evidence | null {
  const rulebook = rulebookForDay(day);
  const items = deskItems(a, rulebook);
  for (const [i, x] of items.entries()) {
    for (const y of items.slice(i + 1)) {
      const found = inspect(x, y, a, rulebook, registry);
      if (found?.inForce) return { rule: found.rule, items: [x, y] };
    }
  }
  return null;
}

/** By the rulebook against the live registry, every fake challenged with what Inspect found. */
const careful: Clerk = (a, day, s) => {
  if (judge(a, rulebookForDay(day), s.registry).valid) return { decision: 'accept' };
  return { decision: 'challenge', evidence: evidenceFor(a, day, s.registry) };
};
/** Careful, except as `override` says. */
const unless =
  (override: (a: GeneratedApplicant, day: number) => Decision | undefined): Clerk =>
  (a, day, s) => {
    const d = override(a, day);
    return d ? { decision: d } : careful(a, day, s);
  };

/** A week from `startDay` to its letter; `morning` may act on a morning before the window opens. Returns every evening and the end. */
function runWeek(seed: number, clerk: Clerk, { startDay = 1, morning }: { startDay?: number; morning?: (s: GameState) => Action | null } = {}) {
  const week = generateWeek(seed);
  let s = startWeek(seed, startDay);
  const evenings: GameState[] = [];
  for (;;) {
    const queue = week[s.day - 1];
    const act = morning?.(s);
    if (act) s = reduce(s, act);
    s = reduce(s, { type: 'open' });
    for (const a of queue) {
      s = reduce(s, { type: 'call' });
      s = reduce(s, { type: 'decide', applicant: a, ...clerk(a, s.day, s) });
    }
    s = reduce(reduce(s, { type: 'close', queue }), { type: 'statement' });
    evenings.push(s);
    s = reduce(s, { type: 'next-day', queue });
    // Every letter but Fired's comes after six o'clock, played in the hall: the clerk goes on to the letter.
    if (s.phase === 'finale') s = reduce(s, { type: 'letter' });
    if (s.phase === 'ending') return { evenings, end: s };
  }
}

const SEEDS = Array.from({ length: 12 }, (_, i) => i + 1);

describe('the letter the week ends with', () => {
  it('is Reclassified for a careful clerk who challenges their own renewal with evidence: Equipment, First Class', () => {
    for (const seed of SEEDS) {
      const { end, evenings } = runWeek(seed, careful);
      expect(end.ending, `seed ${seed}`).toBe('reclassified');
      expect(evenings).toHaveLength(LAST_DAY);
      const w = weekEnd(end)!;
      expect(w.end.grade, `seed ${seed}`).toBe('First');
      expect(w.end.self).toBe('upheld');
      // Upheld, the clerk's challenge took their voucher with it, as every upheld challenge does.
      const vouched = generateWeek(seed)[LAST_DAY - 1].at(-1)!.voucher;
      expect(w.end.voucherRemoved).toBe(vouched);
      const letter = writeLetter(w.end);
      expect(letter.grade).toBe('Grade: Equipment, First Class.');
      if (vouched === FIRST_APPLICANT.name) expect(letter.lines.join(' ')).toContain('She was the first person you registered this week.');
    }
  });

  it('says the clerk’s voucher was the first person they registered only when the week shows it', () => {
    // Begun on Humanity Day by a link, the week has no day 1 to show it.
    const { end } = runWeek(1, careful, { startDay: 7 });
    const w = weekEnd(end)!;
    expect(w.end.voucherRemoved).toBe(FIRST_APPLICANT.name);
    expect(w.end.voucherFirst).toBe(false);
    expect(writeLetter(w.end).lines.join(' ')).not.toContain('first person you registered');
    // Challenged on day 1, Hortense Cobbold was registered by the court, not by the clerk.
    const courtFirst = runWeek(1, unless((a, day) => (day === 1 && a.name === FIRST_APPLICANT.name ? 'challenge' : undefined)));
    expect(weekEnd(courtFirst.end)!.end.voucherFirst).toBe(false);
  });

  it('is Promoted for a clerk who stamps their own renewal in, with the week’s last citation, and the voucher kept', () => {
    for (const seed of SEEDS.slice(0, 6)) {
      const { end, evenings } = runWeek(seed, unless((a) => (a.cast === 'clerk' ? 'accept' : undefined)));
      expect(end.ending, `seed ${seed}`).toBe('promoted');
      const own = evenings[LAST_DAY - 1].decided.at(-1)!;
      expect(own).toMatchObject({ decision: 'accept', outcome: { correct: false }, memo: CLERK_MEMO });
      const w = weekEnd(end)!;
      expect(w.end).toMatchObject({ self: 'accepted', voucherRemoved: null });
      expect(writeLetter(w.end).lines.join(' ')).toContain('A note has been placed on your file: “Registered a clerk.”');
    }
  });

  it('is decided at five on Humanity Day: three units stamped in by day 4 are Replaced then, not that evening', () => {
    const { end, evenings } = runWeek(1, unless((a, day) => (a.cast === 'unit' && day <= 4 ? 'accept' : undefined)));
    expect(evenings.map((e) => e.day)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(end.ending).toBe('replaced');
    const w = weekEnd(end)!;
    // Day 1's unit broke no rule: stamping it in was right, and it is not counted.
    expect(w.end.unitsStamped.map((u) => u.day)).toEqual([2, 3, 4]);
    expect(writeLetter(w.end).lines[0]).toBe('This week you stamped three home robots into the registry: Martin Ellery (day 2), Joanna Pike (day 3) and Theo Marlow (day 4).');
    // Two units are not enough; and a unit the court registered is not the clerk's stamp.
    expect(runWeek(1, unless((a, day) => (a.cast === 'unit' && day <= 3 ? 'accept' : undefined))).end.ending).toBe('reclassified');
  });

  it('is Superseded when the clone let in on day 6 is on file, whatever the clerk does with their own renewal', () => {
    // Seed 29: the clone is on day 6.
    expect(generateWeek(29)[5].some((a) => a.cast === 'clone')).toBe(true);
    for (const self of ['accept', 'challenge'] as const) {
      const { end } = runWeek(29, unless((a) => (a.cast === 'clone' ? 'accept' : a.cast === 'clerk' ? self : undefined)), { startDay: 6 });
      expect(end.ending, self).toBe('superseded');
      expect(end.registry.filter((r) => r.name === CLERK.name && r.day === 6)).toHaveLength(1);
    }
  });

  it('is Fired the first evening from day 2 with savings below zero, before anything else', () => {
    const { end, evenings } = runWeek(1, () => ({ decision: 'challenge' }));
    expect(end.ending).toBe('fired');
    expect(end.day).toBe(evenings.length);
    expect(end.day).toBeLessThan(LAST_DAY);
    expect(end.savings).toBeLessThan(0);
    const letter = writeLetter(weekEnd(end)!.end);
    expect(letter.lines[1]).toMatch(/^This week you challenged \d+ applicants who broke no rule\.$/);
  });

  it('takes its endings in order: Fired, then at five Replaced, Superseded, and the clerk’s own renewal', () => {
    const facts = { fired: false, lastDay: true, unitsStamped: 0, cloneOnFile: false, clerkRegistered: false };
    const table: [Partial<typeof facts>, EndingId | null][] = [
      [{ lastDay: false }, null],
      [{ lastDay: false, fired: true }, 'fired'],
      [{ fired: true, unitsStamped: 3, cloneOnFile: true }, 'fired'],
      [{ unitsStamped: REPLACED_AT, cloneOnFile: true, clerkRegistered: true }, 'replaced'],
      [{ unitsStamped: REPLACED_AT - 1, cloneOnFile: true }, 'superseded'],
      [{ clerkRegistered: true }, 'promoted'],
      [{}, 'reclassified'],
    ];
    for (const [f, ending] of table) expect(endingTonight({ ...facts, ...f }), JSON.stringify(f)).toBe(ending);
  });

  it('grades by the stamps the rulebook agreed with, and the savings left', () => {
    expect(gradeOf(95, 100, STARTING_SAVINGS)).toBe('First');
    expect(gradeOf(95, 100, STARTING_SAVINGS - 1)).toBe('Second');
    expect(gradeOf(94, 100, 1000)).toBe('Second');
    expect(gradeOf(80, 100, 0)).toBe('Second');
    expect(gradeOf(79, 100, 1000)).toBe('Third');
    expect(gradeOf(0, 0, 1000)).toBe('Third');
  });
});

describe('Likeness’s offer', () => {
  const sign = (s: GameState): Action | null => (s.day === OFFER.day ? { type: 'offer', choice: 'signed' } : null);
  const handIn = (s: GameState): Action | null => (s.day === OFFER.day ? { type: 'offer', choice: 'handed-in' } : null);

  it('is on day 3’s morning only, once, before the window opens', () => {
    const day2 = startWeek(1, 2);
    expect(reduce(day2, { type: 'offer', choice: 'signed' })).toBe(day2);
    const day3 = startWeek(1, 3);
    const signed = reduce(day3, { type: 'offer', choice: 'signed' });
    expect(signed.offer).toBe('signed');
    expect(reduce(signed, { type: 'offer', choice: 'handed-in' })).toBe(signed);
    const opened = reduce(day3, { type: 'open' });
    expect(reduce(opened, { type: 'offer', choice: 'signed' })).toBe(opened);
  });

  it('signed, pays 40 for each unit the clerk stamps in, on the next day’s statement; a unit the court registers earns nothing', () => {
    const week = generateWeek(1);
    // The day 3 unit stamped in; the day 6 unit challenged on a hunch the first jury dismisses or not, as it falls.
    const { end, evenings } = runWeek(1, unless((a, day) => (a.cast === 'unit' && day === 3 ? 'accept' : undefined)), { startDay: 3, morning: sign });
    const [d3, d4] = evenings;
    expect(d3.end!.credits).toEqual([]);
    expect(d4.end!.credits).toEqual([{ kind: 'fee', count: 1, each: OFFER.fee, for: [week[2].find((a) => a.cast === 'unit')!.name] }]);
    expect(evenings.slice(2).every((e) => e.end!.credits.length === 0)).toBe(true);
    // One unit, the offer signed, the week survived: Likeness's letter is clipped to the clerk's.
    expect(end.ending).toBe('reclassified');
    const clip = writeClip(weekEnd(end)!.end)!;
    expect(clip.lines.join(' ')).toContain('We understand the clerk is now equipment. We would like to buy it.');
    expect(writeLetter(weekEnd(end)!.end).note).toBeNull();
  });

  it('handed in, pays a 30 PNK commendation that evening and leads the day 4 Gazette with Likeness fined', () => {
    const { evenings } = runWeek(1, careful, { startDay: 3, morning: handIn });
    const [d3, d4] = evenings;
    expect(d3.end!.credits).toEqual([{ kind: 'commendation', count: 1, each: OFFER.commendation }]);
    expect(d3.end!.after).toBe(d3.end!.before + d3.end!.pay.total + OFFER.commendation - d3.end!.bills.reduce((n, b) => n + b.amount, 0));
    expect(d4.gazette!.headline).toBe(LIKENESS_FINED.headline);
    expect(d4.gazette!.thread.startsWith(LIKENESS_FINED.thread)).toBe(true);
    expect(d4.gazette!.thread).toContain('Likeness has taught its current units to wait out a blink');
  });

  it('handed in, still lets a registered unit lead the paper', () => {
    const unitIn = { name: 'Joanna Pike', face: UNIT_FACES[2], unit: true, decision: 'accept' as const, broke: ['face' as const] };
    const gazette = writeGazette(4, { day: 3, cases: [unitIn], sentHome: [] }, [], { handedIn: true });
    expect(HEADLINES.unit).toContain(gazette.headlineLine);
    expect(gazette.thread.startsWith(LIKENESS_FINED.thread)).toBe(true);
  });

  it('is clipped as a job letter to a Humanity Day letter, with one or two units, and never to Replaced or Fired', () => {
    expect(headhunted('promoted', true, 1)).toBe(true);
    expect(headhunted('reclassified', true, 2)).toBe(true);
    expect(headhunted('superseded', true, 1)).toBe(true);
    expect(headhunted('promoted', true, 0)).toBe(false);
    expect(headhunted('promoted', false, 1)).toBe(false);
    expect(headhunted('replaced', true, 3)).toBe(false);
    expect(headhunted('fired', true, 1)).toBe(false);
  });

  it('is kept in the save as a step, and plays back to the same morning', () => {
    const steps: Step[] = ['sign', 'open', 'call'];
    const s = replay(1, 3, steps, generateWeek(1))!;
    expect(s).toMatchObject({ offer: 'signed', opened: true, called: 1 });
    expect(replay(1, 2, ['sign'], generateWeek(1))).toBeNull();
  });
});

describe('the Humanity Day special', () => {
  const base = { registered: [], challenged: 0, upheld: 0, patDay: 6, patDays: [1, 2, 3, 4, 6] };

  it('reports what came of the first hour, not its price (the hall’s board told that), and names every unit registered, the court’s too', () => {
    const special = writeSpecial('promoted', {
      ...base,
      registered: [
        { name: 'Ada Plain', day: 1, unit: false, by: 'stamp' },
        { name: 'Clara Voss', day: 1, unit: true, by: 'stamp' },
        { name: 'Ruth Calloway', day: 5, unit: true, by: 'court' },
      ],
    });
    expect(special.headline).toBe(SPECIAL.headline);
    // Told once, in the hall at six: the paper neither repeats the price nor explains it.
    expect(Object.values(special).join(' ')).not.toMatch(/0\.0003|fifteen years/);
    expect(special.report).toContain('Home robots registered at Window 3 this week: Clara Voss (day 1) and Ruth Calloway (day 5, by the court).');
    expect(special.report).toContain('Pat Oakes was registered on day 6, at the fifth attempt.');
    expect(special.caption).toBe(SPECIAL.captions.promoted);
  });

  it('says which attempt got Pat in, and nothing about Pat if Pat never was', () => {
    expect(writeSpecial('reclassified', { ...base, patDay: 2 }).report).toContain('Pat Oakes was registered on day 2, at the second attempt.');
    expect(writeSpecial('reclassified', { ...base, patDay: null }).report.join(' ')).not.toContain('Pat');
  });

  it('comes with every letter that reaches six o’clock, from a whole week’s numbers', () => {
    const { end } = runWeek(2, careful);
    const w = weekEnd(end)!;
    const registered = w.numbers.registered.length;
    expect(registered).toBeGreaterThan(30);
    expect(w.numbers.patDay).toBe(6);
    const special = writeSpecial(end.ending as Exclude<EndingId, 'fired'>, w.numbers);
    expect(special.report[0]).toBe(`The week at Window 3: ${registered} registered, ${w.numbers.challenged} challenged, ${w.numbers.upheld} upheld in court.`);
    expect(special.report[1]).toBe(SPECIAL.noUnits);
  });
});

describe('the letters', () => {
  const week: WeekEnd = {
    ending: 'fired', day: 4, savings: -12, grade: 'Third', unitsStamped: [], self: null, voucherRemoved: null, voucherFirst: false,
    fakesRegistered: 3, humansChallenged: 1, offer: null,
  };

  it('name only what cost a fired clerk their savings', () => {
    expect(writeLetter(week).lines[1]).toBe('This week you registered 3 applicants who broke a rule, and challenged 1 applicant who broke none.');
    expect(writeLetter({ ...week, humansChallenged: 0 }).lines[1]).toBe('This week you registered 3 applicants who broke a rule.');
    expect(writeLetter({ ...week, fakesRegistered: 0, humansChallenged: 0 }).lines).toHaveLength(3);
  });

  it('say what Likeness’s offer left behind, when no job letter is clipped to them', () => {
    const promoted: WeekEnd = { ...week, ending: 'promoted', self: 'accepted', fakesRegistered: 0, humansChallenged: 0 };
    expect(writeLetter({ ...promoted, offer: 'handed-in' }).note).toBe('Your commendation of day 3 is on file.');
    expect(writeLetter({ ...promoted, offer: 'signed' }).note).toContain('found in your drawer');
    // Likeness pays, and thanks, only for units stamped in once its letter was signed: the day 3 unit, not day 1's.
    expect(writeLetter({ ...promoted, offer: 'signed', unitsStamped: [{ name: 'Joanna Pike', day: 3 }] }).note).toBeNull();
    expect(writeClip({ ...promoted, offer: 'signed', unitsStamped: [{ name: 'Joanna Pike', day: 3 }] })!.lines[1]).toBe('Thank you for your partnership this week: Joanna Pike (day 3).');
    expect(writeClip({ ...promoted, offer: 'signed', unitsStamped: [{ name: 'Clara Voss', day: 1 }] })).toBeNull();
    expect(writeLetter({ ...promoted, offer: 'signed', unitsStamped: [{ name: 'Clara Voss', day: 1 }] }).note).toContain('found in your drawer');
    expect(writeLetter({ ...promoted, ending: 'replaced', offer: 'signed', unitsStamped: [1, 2, 3].map((d) => ({ name: `U${d}`, day: d })) }).note).toBe(
      'Your partner fees will now be paid to the unit.',
    );
  });
});
