import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { JUROR_NAMES } from '../content/court';
import { RULEBOOK } from '../content/rulebook';
import { CAST_RULINGS, DISMISSED_NOTES, FIRST_UNIT_DISMISSED } from '../content/verdicts';
import { PAY } from '../economy/economy';
import type { GeneratedApplicant } from '../gen/applicant';
import { generateWeek } from '../gen/day';
import { litFrames } from '../rules/face';
import { inspect, type Item } from '../rules/inspect';
import { judge, RULES, rulebookForDay } from '../rules/judge';
import type { Registry, Rulebook, Violation } from '../rules/types';
import { canAppeal, type Evidence } from './court';
import { asPointed, evidenceLine, evidenceWords, itemWords } from './evidence';
import { Court } from './Screens';
import { FilingSlip } from './Slips';
import { reduce, startWeek, type GameState, type Ruling } from './week';

// acceptance.md, slice 4: the court screen as the clerk reads it. Real days played through the
// reducer the desk uses (src/ui/week.ts), every court rendered as it sat and again after each round
// of appeals, and the markup read back.
const SEEDS = 40;

/** Words that would give a rule's result away. The evidence names things; it does not grade them. */
const RESULTS = /blink|valid|fake|genuine|forged|verified|mismatch|duplicate|deceased|sybil|match(es)?\b|passed|failed|wrong|broke|upheld|dismissed|robot|machine|human/i;

/** The text of a piece of markup, as the clerk reads it. */
const text = (html: string) =>
  html
    .replace(/<!-- -->/g, '')
    .replace(/<[^>]*>/g, '')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');

/** The inner markup of every element with this attribute, in order. Only for elements that hold no element of their own tag. */
const inner = (html: string, tag: string, attr: string) =>
  [...html.matchAll(new RegExp(`<${tag} [^>]*${attr}[^>]*>([\\s\\S]*?)</${tag}>`, 'g'))].map((m) => m[1]);
const attrOf = (html: string, name: string) => html.match(new RegExp(`${name}="([^"]*)"`))?.[1];

/** Everything on the desk the clerk can point at, as src/court/jury.test.ts lists it. */
const itemsFor = (a: GeneratedApplicant, rulebook: Rulebook): Item[] => [
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

/** What a careful clerk's Inspect finds on them: the first two things on the desk that disagree under a rule in force. */
function inspected(a: GeneratedApplicant, rulebook: Rulebook, registry: Registry): Evidence {
  const items = itemsFor(a, rulebook);
  for (const [i, x] of items.entries()) {
    for (const y of items.slice(i + 1)) {
      const finding = inspect(x, y, a, rulebook, registry);
      if (finding?.inForce) return { rule: finding.rule, items: [x, y] };
    }
  }
  throw new Error(`nothing on the desk shows what ${a.name} broke`);
}

/** A hearing as the court screen printed it, with what was true at the window. */
type Hearing = {
  seed: number;
  day: number;
  applicant: GeneratedApplicant;
  /** What judge() found at the window, against the live registry. */
  broke: Violation[];
  ruling: Ruling;
  /** The ruling's article on the court screen. */
  html: string;
};

/**
 * One day through the reducer: every fake challenged, every other one with what Inspect found and the
 * rest on a hunch; one valid applicant in three challenged on a hunch too. Then every dismissed hunch
 * is appealed, all of them a round at a time, until each is upheld or out of rounds. The court is
 * rendered as it sat and after each round of appeals.
 */
function playDay(seed: number, day: number, queue: GeneratedApplicant[]): Hearing[] {
  const rulebook = rulebookForDay(day);
  const broke: Violation[][] = [];
  let s: GameState = reduce(startWeek(seed, day), { type: 'open' });
  queue.forEach((a, i) => {
    s = reduce(s, { type: 'call' });
    const { violations } = judge(a, rulebook, s.registry);
    broke.push(violations);
    if (violations.length === 0) {
      s = reduce(s, { type: 'decide', applicant: a, decision: (seed + i) % 3 === 0 ? 'challenge' : 'accept' });
      return;
    }
    const evidence = (seed + day + i) % 2 === 0 ? inspected(a, rulebook, s.registry) : null;
    s = reduce(s, { type: 'decide', applicant: a, decision: 'challenge', evidence });
  });
  s = reduce(s, { type: 'close', queue });
  const hearings: Hearing[] = [];
  for (;;) {
    const html = renderToStaticMarkup(<Court day={day} queue={queue} rulings={s.rulings} onAppeal={() => {}} onDone={() => {}} />);
    const articles = html.split('<article ').slice(1).map((a) => a.slice(0, a.indexOf('</article>')));
    expect(articles).toHaveLength(s.rulings.length);
    s.rulings.forEach((ruling, n) => hearings.push({ seed, day, applicant: queue[ruling.index], broke: broke[ruling.index], ruling, html: articles[n] }));
    const open = s.rulings.filter((r) => canAppeal(r.court));
    if (open.length === 0) return hearings;
    for (const r of open) s = reduce(s, { type: 'appeal', index: r.index });
  }
}

/** Each hearing once: a court re-rendered after an appeal prints the other cases again, unchanged. */
const everyHearing: Hearing[] = (() => {
  const seen = new Map<string, Hearing>();
  for (let seed = 1; seed <= SEEDS; seed++) {
    generateWeek(seed).forEach((queue, d) =>
      playDay(seed, d + 1, queue).forEach((h) => seen.set(`${seed}/${h.day}/${h.ruling.index}/${h.ruling.court.rounds.length}`, h)),
    );
  }
  return [...seen.values()];
})();

const upheld = everyHearing.filter((h) => h.ruling.upheld);
const dismissed = everyHearing.filter((h) => !h.ruling.upheld);
const hunches = everyHearing.filter((h) => h.ruling.court.evidence === null);
const withEvidence = everyHearing.filter((h) => h.ruling.court.evidence !== null);

/** A violation's kind, down to the branch of evidenceLine that prints it. */
function variant(v: Violation): string {
  switch (v.rule) {
    case 'phrase':
      return v.heard.length === 0 ? 'phrase:silence' : v.heard.some((m) => !m.ok) ? 'phrase:said' : 'phrase:missing';
    case 'face':
      return `face:${v.problem}`;
    case 'sign':
      return !v.sign ? 'sign:none' : v.sign.kind === 'qr' ? 'sign:qr' : v.sign.text.length !== v.wallet.length ? 'sign:short' : 'sign:characters';
    case 'vouch':
      return `vouch:${v.problem}`;
    case 'duplicate':
      return 'duplicate';
    case 'living':
      return `living:${v.problem}`;
  }
}

/** The lines under a ruling that name a rule: "Rule 3: the sign says 0x12…, the form 0x13…: 2 characters differ." */
const ruleLines = (html: string) => inner(html, 'p', 'class="hearing-evidence"').map(text).filter((line) => /^Rule \d+: /.test(line));
const rulingLine = (html: string) => text(inner(html, 'p', 'class="hearing-ruling"')[0] ?? '');
const noteOf = (html: string) => {
  const note = inner(html, 'p', 'class="court-note"')[0];
  return note === undefined ? null : text(note);
};
/** The ruling as printed under the stamp, less the court's closing note: the ruling, what it names, and the appeal button. */
const wording = (h: Hearing) => {
  const outcome = h.html.slice(h.html.indexOf('class="hearing-outcome"'));
  const note = noteOf(h.html);
  const printed = text(outcome.slice(outcome.indexOf('>') + 1));
  return (note ? printed.replace(note, '') : printed).trim();
};

describe('every ruling names every rule broken and the things that disagree', () => {
  it('is not vacuous: every rule, every kind of fault, upheld on evidence, on a hunch and on appeal; dismissed on the valid and on missed fakes', () => {
    const named = upheld.flatMap((h) => h.ruling.court.violations);
    expect(new Set(named.map((v) => v.rule))).toEqual(new Set(RULES));
    // Every kind of fault that reached the court is named in some upheld ruling. (The generator plants
    // no short sign, no missing voucher and no self-vouch, so evidenceLine's branches for them are not reached.)
    const kinds = new Set(everyHearing.flatMap((h) => h.broke).map(variant));
    expect(new Set(named.map(variant))).toEqual(kinds);
    expect(kinds.size).toBeGreaterThanOrEqual(16);
    expect(upheld.filter((h) => h.ruling.court.violations.length > 1).length).toBeGreaterThan(10);
    expect(upheld.filter((h) => h.ruling.court.evidence !== null).length).toBeGreaterThan(200);
    expect(upheld.filter((h) => h.ruling.court.evidence === null && h.ruling.court.rounds.length === 1).length).toBeGreaterThan(100);
    expect(upheld.filter((h) => h.ruling.court.rounds.length > 1).length).toBeGreaterThan(20);
    expect(dismissed.filter((h) => h.broke.length === 0).length).toBeGreaterThan(200);
    expect(dismissed.filter((h) => h.broke.length > 0).length).toBeGreaterThan(20);
  });

  it('upheld: "Rule N:" and the evidence line for every violation, in rulebook order, and nothing else', () => {
    for (const h of upheld) {
      const { court } = h.ruling;
      const where = `seed ${h.seed}, day ${h.day}, ${h.applicant.name}`;
      // The court carries every rule judge() found at the window, not only the one in the evidence.
      expect(court.violations, where).toEqual(h.broke);
      expect(court.violations.length, where).toBeGreaterThan(0);
      expect(rulingLine(h.html), where).toMatch(/^Challenge upheld\. /);
      expect(ruleLines(h.html), where).toEqual(court.violations.map((v) => `Rule ${RULEBOOK[v.rule].number}: ${evidenceLine(v, 'court')}`));
      expect(attrOf(h.html, 'data-upheld')).toBe('true');
    }
  });

  it('dismissed: the same ruling, word for word, whether the applicant broke nothing or the jury missed what they broke', () => {
    const byRound = new Map<number, { valid: Set<string>; missed: Set<string> }>();
    for (const h of dismissed) {
      const where = `seed ${h.seed}, day ${h.day}, ${h.applicant.name}`;
      const missed = h.broke.length > 0;
      expect(rulingLine(h.html), where).toBe(`Challenge dismissed. No rule broken; registered. Deposit: −${PAY.deposit} PNK.`);
      expect(attrOf(h.html, 'data-upheld')).toBe('false');
      // It names no rule and none of what they broke: only the jurors' votes say anything.
      expect(ruleLines(h.html), where).toEqual([]);
      expect(inner(h.html, 'p', 'class="hearing-evidence"'), where).toEqual([]);
      for (const v of h.broke) for (const at of ['desk', 'court'] as const) expect(text(h.html), where).not.toContain(evidenceLine(v, at));
      // The closing note comes from the same pool either way; day 1's unit, whom no rule could catch that day
      // (it is always valid), has a line of its own.
      const note = noteOf(h.html);
      const firstUnit = h.applicant.cast === 'unit' && h.day === 1 ? [FIRST_UNIT_DISMISSED] : [];
      const pool = [...((h.applicant.cast && CAST_RULINGS[h.applicant.cast].dismissed) || []), ...DISMISSED_NOTES, ...firstUnit];
      if (note !== null) expect(pool, where).toContain(note);
      // It is about something on the desk: a voucher only when there is one.
      if (note !== null && /voucher/i.test(note)) expect(h.applicant.voucher, `${where}: ${note}`).toBeTruthy();
      const rounds = h.ruling.court.rounds.length;
      const seen = byRound.get(rounds) ?? { valid: new Set(), missed: new Set() };
      seen[missed ? 'missed' : 'valid'].add(wording(h));
      byRound.set(rounds, seen);
    }
    // Round by round, one wording for everyone: the ruling, the next appeal while there is one, the stamp.
    for (const [rounds, { valid, missed }] of byRound) {
      expect([...new Set([...valid, ...missed])], `after ${rounds} rounds`).toHaveLength(1);
    }
    // Missed fakes and valid applicants both reach the first and the second dismissal.
    for (const [rounds, appeal] of [[1, 'Appeal · 7 jurors · 10 PNK'], [2, 'Appeal · 15 jurors · 20 PNK']] as const) {
      const { valid, missed } = byRound.get(rounds)!;
      expect(valid).toEqual(missed);
      expect([...valid][0]).toBe(`Challenge dismissed. No rule broken; registered. Deposit: −${PAY.deposit} PNK.${appeal}Dismissed`);
    }
  });

  it('puts a voucher and a face on file as they stood at the window, not as the court leaves them; the desk says it as it is', () => {
    // Otherwise one board could say "Ingrid Oyelaran is not registered." beside Ingrid's own case, dismissed and registered,
    // or name a Sybil Farm cousin's face as "registered already" beside the ruling that removed him.
    for (const h of everyHearing) expect(text(h.html), `seed ${h.seed}, day ${h.day}, ${h.applicant.name}`).not.toMatch(/ is not registered\.|is registered already/);
    const named = upheld.flatMap((h) => h.ruling.court.violations);
    const vouches = named.flatMap((v) => (v.rule === 'vouch' ? [v] : []));
    expect(vouches.filter((v) => v.problem === 'unregistered').length).toBeGreaterThan(5);
    expect(vouches.filter((v) => v.problem === 'busy').length).toBeGreaterThan(0);
    for (const v of named) {
      if (v.rule === 'vouch' && v.problem === 'unregistered') {
        expect(evidenceLine(v, 'court')).toBe(`${v.voucher} was not registered when the applicant applied.`);
        expect(evidenceLine(v)).toBe(`${v.voucher} is not registered.`);
      } else if (v.rule === 'duplicate') {
        expect(evidenceLine(v, 'court')).toBe(evidenceLine(v).replace('the face is registered already', 'the face was registered already'));
        expect(evidenceLine(v)).toMatch(/^the face is registered already, as /);
      } else expect(evidenceLine(v, 'court')).toBe(evidenceLine(v));
    }
    // A busy voucher is in the past tense at both.
    for (const v of vouches) if (v.problem === 'busy') expect(evidenceLine(v, 'court')).toBe(`${v.voucher} was already vouching for ${v.vouchingFor}.`);
  });

  it('prints the evidence a case came with, as the case slip printed it', () => {
    expect(withEvidence.length).toBeGreaterThan(200);
    for (const h of withEvidence) {
      const evidence = h.ruling.court.evidence!;
      const printed = `Evidence: ${evidenceWords(evidence)}`;
      expect(text(inner(h.html, 'p', 'data-testid="evidence-line"')[0])).toBe(printed);
      const slip = renderToStaticMarkup(<FilingSlip name={h.applicant.name} caseNo="1-001" evidence={evidence} />);
      expect(text(inner(slip, 'p', 'data-testid="filing-evidence"')[0])).toBe(printed);
      // A case with evidence is a line: no jury is shown.
      expect(h.html).not.toContain('data-testid="round"');
    }
  });
});

describe('a juror can be drawn more than once in a case, with one vote per draw', () => {
  /** The faces, votes and names of one jury as printed. */
  const printedRounds = (h: Hearing) =>
    h.html
      .split('data-testid="round"')
      .slice(1)
      .map((round) => ({
        size: Number(attrOf(round, 'data-size')),
        seats: [...round.matchAll(/<li ([^>]*)>([\s\S]*?)<\/li>/g)].map(([, attrs, body]) => ({
          juror: Number(attrOf(attrs, 'data-juror')),
          vote: attrOf(attrs, 'data-vote'),
          testid: attrOf(attrs, 'data-testid'),
          face: body.match(/<svg[\s\S]*?<\/svg>/g) ?? [],
          marks: body.match(/class="vote-mark"/g)?.length ?? 0,
          bubbles: body.match(/class="bubble"/g)?.length ?? 0,
        })),
      }));

  it('prints one juror per seat, with its own face and one vote, a juror in two seats twice', () => {
    const faces = new Map<number, string>();
    const repeats = new Map<number, number>();
    let firstJuryTwice = 0;
    for (const h of hunches) {
      const printed = printedRounds(h);
      expect(printed.map((r) => r.size)).toEqual(h.ruling.court.rounds.map((r) => r.size));
      h.ruling.court.rounds.forEach((round, n) => {
        const { seats } = printed[n];
        expect(seats).toHaveLength(round.size);
        expect(seats.map((s) => s.testid)).toEqual(round.seats.map(() => 'juror'));
        expect(seats.map((s) => s.juror)).toEqual(round.seats.map((s) => s.juror));
        expect(seats.map((s) => s.vote)).toEqual(round.seats.map((s) => s.vote));
        for (const seat of seats) {
          expect(seat.face).toHaveLength(1);
          expect(seat.marks).toBe(1);
          // The same juror, the same face, in every seat they take, at whatever size the jury is drawn.
          const [svg = ''] = seat.face;
          const face = svg.slice(svg.indexOf('>') + 1);
          expect(faces.get(seat.juror) ?? face).toBe(face);
          faces.set(seat.juror, face);
          expect(svg).toContain(`aria-label="${JUROR_NAMES[seat.juror]}"`);
        }
        const twice = seats.length - new Set(seats.map((s) => s.juror)).size;
        if (twice > 0) repeats.set(round.size, (repeats.get(round.size) ?? 0) + 1);
        if (twice > 0 && round.size === 3) {
          firstJuryTwice++;
          // A first jury shows every seat's bubble, the juror in two seats included.
          if (!h.html.includes('collapsed')) expect(seats.map((s) => s.bubbles)).toEqual([1, 1, 1]);
        }
      });
    }
    expect(new Set(faces.values()).size).toBe(faces.size);
    expect(firstJuryTwice).toBeGreaterThan(50);
    expect(repeats.get(7)).toBeGreaterThan(20);
    expect(repeats.get(15)).toBeGreaterThan(10);
  });
});

describe("a jury's size shows at once, its tally only once the last seat has sat, before the stamp", () => {
  const delay = (style: string) => Number(style.match(/animation-delay:([\d.]+)s/)?.[1]);

  it('holds the count back until every seat of its round has sat, and keeps it on the juries appealed from', () => {
    let rounds = 0;
    for (const h of hunches) {
      const where = `seed ${h.seed}, day ${h.day}, ${h.applicant.name}`;
      const stamp = delay(h.html.match(/<div class="ruling-stamp[^"]*" style="([^"]*)"/)![1]);
      const printed = h.html.split('data-testid="round"').slice(1);
      expect(printed, where).toHaveLength(h.ruling.court.rounds.length);
      // Every jury but the last has been appealed from: its tally is not held back again.
      expect([...h.html.matchAll(/class="(jury [^"]*)"/g)].map((m) => m[1].split(' ').includes('past')), where).toEqual(
        h.ruling.court.rounds.map((_, n) => n < h.ruling.court.rounds.length - 1),
      );
      h.ruling.court.rounds.forEach(({ size, seats }, n) => {
        const head = inner(printed[n], 'p', 'class="jury-head"')[0];
        expect(text(head.slice(0, head.indexOf('<span'))), where).toBe(n === 0 ? `Jury of ${size}` : `Appeal ${n} · jury of ${size}`);
        const [, style, tally] = head.match(/<span class="jury-tally" style="([^"]*)">([\s\S]*?)<\/span>/)!;
        expect(text(tally), where).toBe(` · ${seats.filter((s) => s.vote === 'uphold').length} of ${size} uphold`);
        const sat = [...printed[n].matchAll(/<li [^>]*style="([^"]*)"/g)].map((m) => delay(m[1]));
        expect(sat, where).toHaveLength(size);
        expect(delay(style), where).toBeGreaterThan(Math.max(...sat));
        expect(delay(style), where).toBeLessThan(stamp);
        rounds++;
      });
    }
    expect(rounds).toBeGreaterThan(hunches.length);
  });
});

describe('the evidence in words', () => {
  /** One item of every kind: the compiler holds this to the Item type. */
  const ONE_OF_EACH: { [K in Item['kind']]: Extract<Item, { kind: K }> } = {
    photo: { kind: 'photo' },
    frame: { kind: 'frame', frame: 2 },
    transcript: { kind: 'transcript' },
    sign: { kind: 'sign' },
    name: { kind: 'name' },
    'birth-year': { kind: 'birth-year' },
    wallet: { kind: 'wallet' },
    voucher: { kind: 'voucher' },
    rule: { kind: 'rule', rule: 'sign' },
    'name-record': { kind: 'name-record', name: 'Ethel Pargeter' },
    'face-record': { kind: 'face-record' },
  };

  it('reads as the case slip prints it: the rule, then what disagrees with what', () => {
    expect(evidenceWords({ rule: 'phrase', items: [{ kind: 'transcript' }, { kind: 'rule', rule: 'phrase' }] })).toBe('Rule 1, the transcript against the rule.');
    // The rule's page is named last, whichever was pointed at first.
    expect(evidenceWords({ rule: 'phrase', items: [{ kind: 'rule', rule: 'phrase' }, { kind: 'transcript' }] })).toBe('Rule 1, the transcript against the rule.');
    expect(evidenceWords({ rule: 'sign', items: [{ kind: 'sign' }, { kind: 'wallet' }] })).toBe('Rule 3, the sign against the form.');
    expect(evidenceWords({ rule: 'face', items: [{ kind: 'photo' }, { kind: 'frame', frame: 1 }] })).toBe('Rule 2, the photo against frame 1.');
    expect(evidenceWords({ rule: 'duplicate', items: [{ kind: 'face-record' }, { kind: 'photo' }] })).toBe('Rule 5, the face search against the photo.');
    expect(evidenceWords({ rule: 'vouch', items: [{ kind: 'voucher' }, { kind: 'name-record', name: 'Ethel Pargeter' }] })).toBe(
      "Rule 4, the voucher against the registry's record of Ethel Pargeter.",
    );
  });

  it('has words for every kind of thing on the desk, none of them a result', () => {
    for (const item of Object.values(ONE_OF_EACH)) {
      const words = itemWords(item);
      expect(words, item.kind).toMatch(/^(the |frame \d|Rule \d)/);
      expect(words, item.kind).not.toMatch(/undefined|null|NaN/);
      expect(words, item.kind).not.toMatch(RESULTS);
    }
  });

  it('says what the clerk found on every fake of the week, and nothing about how the court will rule', () => {
    for (const h of withEvidence) {
      const evidence = h.ruling.court.evidence!;
      const words = evidenceWords(evidence);
      expect(words).toMatch(new RegExp(`^Rule ${RULEBOOK[evidence.rule].number}, (.+) against (.+)\\.$`));
      const [, x, y] = words.match(/^Rule \d+, (.+) against (.+)\.$/)!;
      expect(x, words).not.toBe(y);
      expect(words.replace(h.applicant.voucher ?? '\0', ''), words).not.toMatch(RESULTS);
    }
  });
});

describe('the frame the clerk pointed at', () => {
  it('is the frame the court names, when the fault shows there too: the day 2 unit, filed with frame 3 against Rule 2', () => {
    // Seed 1, day 2: the unit's eyes are shut and its lamp lit in frames 1 and 3; judge() names frame 1.
    const queue = generateWeek(1)[1];
    const unitAt = queue.findIndex((a) => a.cast === 'unit');
    const unit = queue[unitAt];
    expect(litFrames(unit.video)).toEqual([1, 3]);
    const rulebook = rulebookForDay(2);
    const evidence: Evidence = { rule: 'face', items: [{ kind: 'frame', frame: 3 }, { kind: 'rule', rule: 'face' }] };
    let s: GameState = reduce(startWeek(1, 2), { type: 'open' });
    queue.forEach((a, i) => {
      s = reduce(s, { type: 'call' });
      if (i === unitAt) {
        expect(inspect(evidence.items[0], evidence.items[1], a, rulebook, s.registry)).toEqual({ rule: 'face', inForce: true });
        expect(judge(a, rulebook, s.registry).violations).toEqual([{ rule: 'face', problem: 'machine', frame: 1, lamp: 'glow' }]);
        s = reduce(s, { type: 'decide', applicant: a, decision: 'challenge', evidence });
      } else s = reduce(s, { type: 'decide', applicant: a, decision: 'accept' });
    });
    s = reduce(s, { type: 'close', queue });
    const html = renderToStaticMarkup(<Court day={2} queue={queue} rulings={s.rulings} onAppeal={() => {}} onDone={() => {}} />);
    const card = html.split('<article ').find((article) => article.includes(`The Registry v. ${unit.name}`))!;
    expect(text(inner(card, 'p', 'data-testid="evidence-line"')[0])).toBe('Evidence: Rule 2, frame 3 against the rule.');
    expect(ruleLines(card)).toEqual(['Rule 2: in frame 3 the eyes are shut, and there is a light between the brows.']);
  });

  it('names a lit frame only if one was pointed at, a photo that is someone else in the frame pointed at, and nothing else', () => {
    const video = generateWeek(1)[1].find((a) => a.cast === 'unit')!.video;
    const lamp: Violation = { rule: 'face', problem: 'machine', frame: 1 };
    const frame = (n: number): Item => ({ kind: 'frame', frame: n });
    const onFace = (x: Item, y: Item): Evidence => ({ rule: 'face', items: [x, y] });
    expect(asPointed(lamp, onFace(frame(3), { kind: 'rule', rule: 'face' }), video)).toEqual({ ...lamp, frame: 3 });
    expect(asPointed(lamp, onFace(frame(2), frame(3)), video)).toEqual({ ...lamp, frame: 3 });
    expect(asPointed(lamp, onFace(frame(3), frame(1)), video)).toEqual({ ...lamp, frame: 3 });
    // The photo against a dark frame names no lit frame: the court keeps judge()'s.
    expect(asPointed(lamp, onFace({ kind: 'photo' }, frame(2)), video)).toEqual(lamp);
    expect(asPointed(lamp, null, video)).toEqual(lamp);
    expect(asPointed(lamp, { rule: 'sign', items: [{ kind: 'sign' }, { kind: 'wallet' }] }, video)).toEqual(lamp);
    // A face that changes is in one frame only, whatever was pointed at.
    const changes: Violation = { rule: 'face', problem: 'changes', frame: 2 };
    expect(asPointed(changes, onFace(frame(1), frame(2)), video)).toEqual(changes);
    const another: Violation = { rule: 'face', problem: 'another', frame: 1 };
    expect(asPointed(another, onFace({ kind: 'photo' }, frame(3)), video)).toEqual({ ...another, frame: 3 });
    const mirror: Violation = { rule: 'face', problem: 'mirrored', frame: 1 };
    expect(asPointed(mirror, onFace(frame(3), { kind: 'photo' }), video)).toEqual(mirror);
  });
});
