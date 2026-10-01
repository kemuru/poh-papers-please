import { describe, expect, it } from 'vitest';
import { AGENT, CLERK, FIRST_APPLICANT, PAT, REGULARS, SYBIL_FARM } from './content/cast';
import { AGENT_LINES, ETHEL_LINES, FARM_LINES, HORTENSE_LINES, LIKENESS_LINES, PAT_LINES, ROBIN_LINES, SIX, SOCRATES_LINES } from './content/finale';
import { LETTER_CLOSE } from './content/verdicts';
import type { Evidence } from './court/types';
import { OFFER } from './economy/economy';
import type { GeneratedApplicant } from './gen/applicant';
import { generateWeek, LAST_DAY } from './gen/day';
import { writeSix, type Beat, type FinaleFacts, type Speaker } from './gen/finale';
import { writeLetter } from './gen/letters';
import { inspect, type Item } from './rules/inspect';
import { judge, rulebookForDay, type Decision } from './rules/judge';
import type { Applicant, Registry, Rulebook } from './rules/types';
import { fingerprint, loadRun, replay, saveOf, stepOf, writeSave, type Step } from './ui/save';
import { atSix, reduce, startWeek, weekEnd, type Action, type GameState } from './ui/week';

// notes/game-design.md, Endings: six o'clock on Humanity Day, the first hour of the income, played in the hall
// between the accounts and the letter. Which lines the last queue says, chosen from the week; who sits where in the
// dark; and that it reads the week and changes nothing.

type Clerk = (a: GeneratedApplicant, day: number, s: GameState) => { decision: Decision; evidence?: Evidence | null };

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
const careful: Clerk = (a, day, s) =>
  judge(a, rulebookForDay(day), s.registry).valid ? { decision: 'accept' } : { decision: 'challenge', evidence: evidenceFor(a, day, s.registry) };
const unless =
  (override: (a: GeneratedApplicant, day: number) => Decision | undefined): Clerk =>
  (a, day, s) => {
    const d = override(a, day);
    return d ? { decision: d } : careful(a, day, s);
  };

/** A week from `startDay` to six o'clock on Humanity Day (or to a fired clerk's letter), with every step taken. */
/** The week's Likeness units by name, day 1's first: from day 2 each week draws its own. */
const unitNames = (week: readonly (readonly GeneratedApplicant[])[]) => week.map((queue) => queue.find((a) => a.cast === 'unit')!.name);

function toSix(seed: number, clerk: Clerk, { startDay = 1, morning }: { startDay?: number; morning?: (s: GameState) => Action | null } = {}) {
  const week = generateWeek(seed);
  let s = startWeek(seed, startDay);
  const steps: Step[] = [];
  const act = (action: Action) => {
    const next = reduce(s, action);
    if (next !== s) steps.push(stepOf(action));
    s = next;
  };
  for (;;) {
    const queue = week[s.day - 1];
    const early = morning?.(s);
    if (early) act(early);
    act({ type: 'open' });
    for (const a of queue) {
      act({ type: 'call' });
      act({ type: 'decide', applicant: a, ...clerk(a, s.day, s) });
    }
    act({ type: 'close', queue });
    act({ type: 'statement' });
    act({ type: 'next-day', queue });
    if (s.phase === 'finale' || s.phase === 'ending') return { s, week, steps };
  }
}

const facts: FinaleFacts = {
  cousinsRegistered: 1,
  agent: 'absent',
  robinOnFile: false,
  offer: null,
  hortenseRemoved: false,
  ethelSaidPaper: false,
  socratesRegistered: true,
  patAttempt: 5,
};
const say = (f: Partial<FinaleFacts>) => {
  const script = writeSix({ ...facts, ...f });
  const by = Object.fromEntries([...script.queue, script.pat].map((b) => [b.speaker, b])) as Record<Speaker, Beat>;
  return { ...by, queue: script.queue };
};

describe('the last queue at six', () => {
  it('is nine lines in three triples, in order, the farm first and Socrates last, and Pat after the number', () => {
    const { queue, pat } = say({});
    expect(queue.map((b) => b.speaker)).toEqual(['terry', 'kerry', 'perry', 'agent', 'likeness', 'robin', 'ethel', 'hortense', 'socrates']);
    expect(queue.map((b) => b.name)).toEqual([...SYBIL_FARM.cousins.map((c) => c.name), AGENT.name, 'Likeness Robotics Ltd', CLERK.name, REGULARS.grandmaEthel.name, FIRST_APPLICANT.name, REGULARS.socrates.name]);
    expect(pat).toMatchObject({ speaker: 'pat', name: PAT.name });
    // Every line is said once in the hall: no two alike, and none the PA's.
    const lines = [...queue.map((b) => b.text), pat.text, SIX.pa];
    expect(new Set(lines).size).toBe(lines.length);
  });

  it('shares out one face’s income by how many of the farm the registry holds, and Perry always has his hat', () => {
    for (const n of [0, 1, 2, 3] as const) {
      const lines = say({ cousinsRegistered: n });
      expect(lines.terry.text).toBe(FARM_LINES.terry[n]);
      expect(lines.kerry.text).toBe(FARM_LINES.kerry[n]);
      expect(lines.perry.text).toBe('Different hat.');
    }
    // Perry's line is his own, from day 5 at the window.
    expect(SYBIL_FARM.cousins[2].remark).toBe(FARM_LINES.perry);
  });

  it('has the Agent collect for its principal as the week left it: registered, refused, or never at Window 3', () => {
    for (const agent of ['registered', 'refused', 'absent'] as const) expect(say({ agent }).agent.text).toBe(AGENT_LINES[agent]);
  });

  it('sends Likeness’s line through the slot: an envelope if its letter was signed, an apology if handed in, a letter otherwise', () => {
    expect(say({ offer: 'signed' }).likeness).toMatchObject({ paper: 'envelope', text: LIKENESS_LINES.signed });
    expect(say({ offer: 'handed-in' }).likeness).toMatchObject({ paper: 'letter', text: LIKENESS_LINES.handedIn });
    expect(say({ offer: null }).likeness).toMatchObject({ paper: 'letter', text: LIKENESS_LINES.letter });
  });

  it('has the other Robin Hale ask for Robin Hale’s first hour, as the one on file or as Window 2’s', () => {
    expect(say({ robinOnFile: true }).robin.text).toBe(ROBIN_LINES.onFile);
    expect(say({ robinOnFile: false }).robin.text).toBe(ROBIN_LINES.windowTwo);
  });

  it('lets Ethel want it on paper, unless she said so at the window this week; that line is one of hers', () => {
    expect(REGULARS.grandmaEthel.remarks).toContain(ETHEL_LINES.paper);
    expect(say({ ethelSaidPaper: false }).ethel.text).toBe(ETHEL_LINES.paper);
    expect(say({ ethelSaidPaper: true }).ethel.text).toBe(ETHEL_LINES.again);
  });

  it('has Hortense want to be first, or, removed with the clerk, first on Monday; and Socrates ask what it is worth', () => {
    expect(say({ hortenseRemoved: false }).hortense.text).toBe(HORTENSE_LINES.registered);
    expect(say({ hortenseRemoved: true }).hortense.text).toBe(HORTENSE_LINES.removed);
    expect(say({ socratesRegistered: true }).socrates.text).toBe(SOCRATES_LINES.registered);
    expect(say({ socratesRegistered: false }).socrates.text).toBe(SOCRATES_LINES.unregistered);
    for (const text of Object.values(SOCRATES_LINES)) expect(text).toMatch(/What is an hour of a human worth\?$/);
  });

  it('gives Pat the attempt that got Pat in, or Monday', () => {
    expect(say({ patAttempt: 5 }).pat.text).toBe("It's come through. Fifth time lucky.");
    expect(say({ patAttempt: 2 }).pat.text).toBe("It's come through. Second time lucky.");
    expect(say({ patAttempt: null }).pat.text).toBe(PAT_LINES.unregistered);
  });
});

describe('the hall at six, read from the week', () => {
  it('comes after the accounts on Humanity Day for every letter but Fired’s, and changes nothing on the way to the letter', () => {
    const { s } = toSix(1, careful);
    expect(s).toMatchObject({ phase: 'finale', day: LAST_DAY, ending: 'reclassified' });
    const letter = reduce(s, { type: 'letter' });
    expect(letter).toEqual({ ...s, phase: 'ending' });
    // Only from six o'clock.
    expect(reduce(letter, { type: 'letter' })).toBe(letter);
    // The letter is the same one either side of six.
    expect(weekEnd(s)).toEqual(weekEnd(letter));
  });

  it('never comes to a fired clerk, who has the letter that evening', () => {
    const { s, week } = toSix(1, () => ({ decision: 'challenge' }));
    expect(s).toMatchObject({ phase: 'ending', ending: 'fired' });
    expect(atSix(s, week)).toBeNull();
    expect(reduce(s, { type: 'letter' })).toBe(s);
  });

  it('for a careful week, puts every unit but the first on Window 2’s bench, lit in the dark, and none on Window 3’s', () => {
    for (const seed of [1, 2, 3]) {
      const { s, week } = toSix(seed, careful);
      const six = atSix(s, week)!;
      expect(six.here.filter((x) => x.lamp), `seed ${seed}`).toEqual([]);
      expect(six.there.filter((x) => x.lamp).map((x) => x.name)).toEqual(unitNames(week).slice(1));
      // The current models' lamps (days 4 and 5) wait out the dark first.
      expect(six.there.filter((x) => x.waits).map((x) => x.name)).toEqual(unitNames(week).slice(3, 5));
      // The clerk went with their voucher; Pat got in on day 6, at the fifth attempt.
      expect(six.facts).toMatchObject({ robinOnFile: false, hortenseRemoved: true, socratesRegistered: true, patAttempt: 5, offer: null });
      // The farm's first cousin was registered on day 5, and shares; in seed 1 he vouched on day 6 for someone who
      // left words out of the phrase, and went from the registry with her, so the face has nothing to share.
      expect(six.facts.cousinsRegistered, `seed ${seed}`).toBe(seed === 1 ? 0 : 1);
      expect(six.facts.cousinsRegistered).toBe(s.registry.filter((r) => SYBIL_FARM.cousins.some((c) => c.name === r.name)).length);
      expect(writeSix(six.facts).queue[7].text).toBe(HORTENSE_LINES.removed);
      // Every speaker has a seat, and the other Robin Hale sits at the end nearest Window 2.
      const seated = [...six.here, ...six.there].map((x) => x.speaker).filter(Boolean);
      expect(new Set(seated)).toEqual(new Set(['terry', 'kerry', 'perry', 'agent', 'robin', 'ethel', 'hortense', 'socrates', 'pat']));
      expect(six.there.at(-1)).toMatchObject({ name: CLERK.name, speaker: 'robin' });
      expect(six.serving).toBe(55);
    }
  });

  it('seats the units the clerk let in on Window 3’s bench, among the people they registered', () => {
    const { s, week } = toSix(1, unless((a, day) => (a.cast === 'unit' && day <= 4 ? 'accept' : undefined)));
    expect(s.ending).toBe('replaced');
    const six = atSix(s, week)!;
    expect(six.here.filter((x) => x.lamp).map((x) => x.name)).toEqual(unitNames(week).slice(1, 4));
    expect(six.there.filter((x) => x.lamp).map((x) => x.name)).toEqual(unitNames(week).slice(4));
    // The clerk registered their own renewal? No: they challenged it, with evidence, and it went.
    expect(six.facts.hortenseRemoved).toBe(true);
  });

  it('seats the Robin Hale the registry kept on Window 3’s bench, where he asks for his first hour as the one on file', () => {
    const { s, week } = toSix(29, unless((a) => (a.cast === 'clone' ? 'accept' : undefined)), { startDay: 6 });
    expect(s.ending).toBe('superseded');
    const six = atSix(s, week)!;
    expect(six.facts.robinOnFile).toBe(true);
    expect(six.here.find((x) => x.speaker === 'robin')).toMatchObject({ name: CLERK.name });
    expect(six.there.some((x) => x.speaker === 'robin')).toBe(false);
    expect(writeSix(six.facts).queue[5].text).toBe(ROBIN_LINES.onFile);
  });

  it('reads Likeness’s letter as the clerk left it on day 3', () => {
    const on3 = (choice: 'signed' | 'handed-in') => (s: GameState): Action | null => (s.day === OFFER.day ? { type: 'offer', choice } : null);
    const signed = toSix(1, careful, { startDay: 3, morning: on3('signed') });
    expect(writeSix(atSix(signed.s, signed.week)!.facts).queue[4]).toMatchObject({ paper: 'envelope', text: LIKENESS_LINES.signed });
    const handed = toSix(1, careful, { startDay: 3, morning: on3('handed-in') });
    expect(writeSix(atSix(handed.s, handed.week)!.facts).queue[4].text).toBe(LIKENESS_LINES.handedIn);
  });

  it('knows whether Ethel said her line about paper at the window, which only a week begun on day 1 saw', () => {
    const seed = Array.from({ length: 300 }, (_, i) => i + 1).find(
      (n) => generateWeek(n)[0].find((a) => a.cast === 'grandmaEthel')?.remark === ETHEL_LINES.paper,
    )!;
    expect(seed).toBeDefined();
    const whole = toSix(seed, careful);
    expect(atSix(whole.s, whole.week)!.facts.ethelSaidPaper).toBe(true);
    const late = toSix(seed, careful, { startDay: 7 });
    expect(atSix(late.s, late.week)!.facts.ethelSaidPaper).toBe(false);
  });

  it('is kept in the save: a reload at six comes back to six, and the step to the letter plays back', () => {
    const { s, week, steps } = toSix(3, careful, { startDay: 6 });
    expect(s.phase).toBe('finale');
    expect(replay(3, 6, steps, week)).toEqual(s);
    const items = new Map<string, string>();
    const store = { getItem: (k: string) => items.get(k) ?? null, setItem: (k: string, v: string) => void items.set(k, v), removeItem: (k: string) => void items.delete(k) };
    writeSave(store, saveOf({ seed: 3, startDay: 6 }, steps, s, 0));
    expect(loadRun(store)).toMatchObject({ resumed: true, setAside: false, state: { phase: 'finale' } });
    const letter = reduce(s, { type: 'letter' });
    const after = replay(3, 6, [...steps, stepOf({ type: 'letter' })], week)!;
    expect(fingerprint(after)).toBe(fingerprint(letter));
    expect(after.phase).toBe('ending');
  });
});

describe('the letters after six', () => {
  it('each end on the Ministry’s line, whatever the fate; Fired’s, which never reaches six, does not', () => {
    const base = { day: 7, savings: 300, grade: 'First' as const, unitsStamped: [], self: 'upheld' as const, voucherRemoved: null, voucherFirst: false, fakesRegistered: 0, humansChallenged: 0, offer: null };
    for (const ending of ['promoted', 'reclassified', 'superseded', 'replaced'] as const) {
      const self = ending === 'promoted' ? 'accepted' : 'upheld';
      expect(writeLetter({ ...base, ending, self }).close, ending).toBe(LETTER_CLOSE);
    }
    expect(LETTER_CLOSE).toBe('Window 3 opens at nine on Monday.');
    expect(writeLetter({ ...base, ending: 'fired', day: 3, savings: -5 }).close).toBeNull();
  });
});
