import { describe, expect, it } from 'vitest';
import { REGULARS, TWINS, TWINS_FORM } from '../content/cast';
import { CAST_PORTRAITS, TWIN_TWO } from '../content/portraits';
import { generateWeek, planWeek } from '../gen/day';
import { generatePortrait, type Portrait } from '../gen/portrait';
import { checkHuman } from './human';
import { judge, RULE_DAYS, RULES, rulebookForDay } from './judge';
import { PHRASE } from './phrase';
import type { Applicant, Registrant, Registry, RuleId } from './types';

// acceptance.md, slice 3: each rule tested on one valid and at least two invalid applicants, each
// judged under the whole rulebook, so every invalid one breaks exactly the rule under test.
const WALLET = '0x3F9A2B71C0DE5E1F88A04B6D9C3E7A1B2F40C21E';
const face = generatePortrait(1);
const voucher: Registrant = { name: 'Vera Voucher', address: '2 Test Street, Testbury', birthYear: 1950, face: generatePortrait(2), day: 0, vouching: null };
const busy: Registrant = { ...voucher, name: 'Bert Busy', face: generatePortrait(3), vouching: 'Someone Earlier' };
const onFile: Registrant = { ...voucher, name: 'Otto Onfile', face: generatePortrait(4), day: 2 };
const REGISTRY: Registry = [voucher, busy, onFile];

/** An applicant with nothing wrong under any rule. */
const valid = (over: Partial<Applicant> = {}, video: Partial<Applicant['video']> = {}): Applicant => ({
  name: 'Ada Test',
  address: '1 Test Street, Testbury',
  birthYear: 1980,
  photo: face,
  video: { face, transcript: PHRASE, blinked: true, sign: { kind: 'address', text: WALLET }, ...video },
  remark: '',
  wallet: WALLET,
  voucher: voucher.name,
  ...over,
});

const ALL = rulebookForDay(6);
const broken = (a: Applicant, registry: Registry = REGISTRY) => judge(a, ALL, registry).violations.map((v) => v.rule);
/** The address with the characters at `places` changed. */
const miswritten = (places: number[]) => [...WALLET].map((c, i) => (places.includes(i) ? (c === 'A' ? 'B' : 'A') : c)).join('');

function ruleTest(rule: RuleId, lookAlikes: Applicant[], offenders: Record<string, Applicant>) {
  describe(`Rule ${rule}`, () => {
    it('finds nothing wrong with a valid applicant, or with one who only looks as if they break it', () => {
      for (const a of [valid(), ...lookAlikes]) expect(broken(a), a.name).toEqual([]);
    });
    it(`finds exactly this rule broken by each of ${Object.keys(offenders).length} offenders`, () => {
      expect(Object.keys(offenders).length).toBeGreaterThanOrEqual(2);
      for (const [kind, a] of Object.entries(offenders)) expect(broken(a), kind).toEqual([rule]);
    });
  });
}

ruleTest(
  'human',
  [
    // Anything worn or carried does not count: Dave's costume robot head under his arm, or a twin filmed beside them.
    valid({ photo: { ...face, accessories: ['robot-helmet'] } }, { face: { ...face, accessories: ['robot-helmet'] } }),
    valid({}, { with: generatePortrait(7) }),
    // Nigel's two blinks: the day 2 unit's pose, and no light.
    valid({}, { nervous: true }),
  ],
  {
    'a light between the brows, eyes shut in frame 3': valid({}, { lamp: 'glow' }),
    'ears that change in frame 3': valid({}, { glitch: { frame: 3, face: { ...face, face: { ...face.face, ears: face.face.ears === 'big' ? 'small' : 'big' } } } }),
    'a generated video': valid({}, { generated: true }),
    // Blinked is set so that only Rule 0 is at stake here; the Cutout, who does not blink, breaks Rule 6 as well.
    'a printed face held up': valid({}, { still: true }),
  },
);

describe('Rule 0, the lamp', () => {
  it('finds nothing on a unit whose eyes never shut: its lamp never comes on', () => {
    expect(checkHuman(valid({}, { lamp: 'glow', blinked: false }))).toBeNull();
  });
});

ruleTest('phrase', [valid({}, { transcript: `Ahem. ${PHRASE.replace('I am a', "I'm a")} Thank you.` })], {
  hooman: valid({}, { transcript: PHRASE.replace('human', 'hooman') }),
  silence: valid({}, { transcript: '' }),
  'a key word left out': valid({}, { transcript: PHRASE.replace(' not', '') }),
});

ruleTest('photo', [valid({ photo: { ...face, hair: 'mohawk', accessories: ['glasses'] } })], {
  'someone else': valid({ photo: generatePortrait(99) }),
  'a mirror selfie': valid({ mirrored: true }),
});

ruleTest(
  'sign',
  [valid({}, { sign: { kind: 'address', text: miswritten([4]) } }), valid({}, { sign: { kind: 'address', text: WALLET, phone: true } })],
  {
    'two characters wrong': valid({}, { sign: { kind: 'address', text: miswritten([3, 40]) } }),
    'no sign': valid({}, { sign: null }),
    'a QR code': valid({}, { sign: { kind: 'qr' } }),
    'the address as a wallet shows it': valid({}, { sign: { kind: 'address', text: '0x3F9A…C21E' } }),
  },
);

ruleTest('vouch', [valid({ voucher: 'vera  VOUCHER' })], {
  'nobody': valid({ voucher: null }),
  'themselves': valid({ voucher: 'Ada Test' }),
  'someone not registered': valid({ voucher: 'Maureen Notyet' }),
  'someone already vouching today': valid({ voucher: busy.name }),
});

ruleTest('duplicate', [valid({ photo: { ...face, accessories: ['top-hat'] } }, { face: { ...face, accessories: ['top-hat'] } })], {
  'a face on file': valid({ photo: onFile.face }, { face: onFile.face }),
  'a face on file, in a hat': valid({ photo: { ...onFile.face, accessories: ['bobble-hat'] } }, { face: { ...onFile.face, accessories: ['bobble-hat'] } }),
});

ruleTest('living', [valid({ birthYear: 1904 }), valid({}, { nervous: true })], {
  'born in 470 BC': valid({ birthYear: -470 }),
  'born 1197': valid({ birthYear: 1197 }),
  'born v4': valid({ birthYear: 'v4' }),
  'no blink': valid({}, { blinked: false }),
});

describe('the rulebook, day by day', () => {
  it('has Rule 0 from before the week, and adds the rest on the days of the design table: phrase, photo, the sign, one vouch, no duplicates, living', () => {
    expect(RULE_DAYS).toEqual({ human: 0, phrase: 1, photo: 2, sign: 3, vouch: 4, duplicate: 5, living: 6 });
    expect([1, 2, 3, 4, 5, 6, 7].map((d) => rulebookForDay(d).length)).toEqual([2, 3, 4, 5, 6, 7, 7]);
    expect(rulebookForDay(1)[0]).toBe('human');
  });

  it('has each rule in force from its day onward, never before', () => {
    const offenders: Record<RuleId, Applicant> = {
      human: valid({}, { generated: true }),
      phrase: valid({}, { transcript: '' }),
      photo: valid({ mirrored: true }),
      sign: valid({}, { sign: null }),
      vouch: valid({ voucher: 'Maureen Notyet' }),
      duplicate: valid({ photo: onFile.face }, { face: onFile.face }),
      living: valid({ birthYear: -470 }),
    };
    for (const rule of RULES) {
      for (let day = 1; day <= 7; day++) {
        const { valid: ok, violations } = judge(offenders[rule], rulebookForDay(day), REGISTRY);
        expect(rulebookForDay(day).includes(rule), `${rule} on day ${day}`).toBe(day >= RULE_DAYS[rule]);
        expect(ok, `${rule} on day ${day}`).toBe(day < RULE_DAYS[rule]);
        expect(violations.map((v) => v.rule)).toEqual(day < RULE_DAYS[rule] ? [] : [rule]);
      }
    }
  });
});

describe('rules are rules', () => {
  /** A regular's form with the papers the later rules ask for. */
  const papers = (r: { name: string; address: string; birthYear: number | string; portrait: Portrait }, video = PHRASE): Applicant =>
    valid({ name: r.name, address: r.address, birthYear: r.birthYear, photo: r.portrait }, { face: r.portrait, transcript: video });

  it('Socrates is valid on days 1 to 5 and invalid on day 6, for the living rule alone', () => {
    const socrates = papers(REGULARS.socrates, REGULARS.socrates.videos[0]);
    for (let day = 1; day <= 5; day++) expect(judge(socrates, rulebookForDay(day), REGISTRY).valid, `day ${day}`).toBe(true);
    expect(judge(socrates, rulebookForDay(6), REGISTRY).violations.map((v) => v.rule)).toEqual(['living']);
  });

  it('Dave, robot costume and all, is valid on every day, and every time he comes', () => {
    const dave = papers(REGULARS.dave, REGULARS.dave.videos[0]);
    for (let day = 1; day <= 7; day++) expect(judge(dave, rulebookForDay(day), REGISTRY).valid, `day ${day}`).toBe(true);
    let seen = 0;
    for (let seed = 1; seed <= 40; seed++) {
      const week = planWeek(seed);
      week.queues.forEach((queue, d) =>
        queue.forEach((a, n) => {
          if (a.cast !== 'dave') return;
          seen++;
          expect(a.planted).toEqual([]);
          expect(judge(a, rulebookForDay(d + 1), week.seen[d][n]).valid).toBe(true);
        }),
      );
    }
    expect(seen).toBeGreaterThan(30);
  });

  it('the second Twin is valid only when filmed with the first', () => {
    const first: Registrant = { name: TWINS[0].name, address: TWINS_FORM.address, birthYear: TWINS_FORM.birthYear, face: CAST_PORTRAITS.twins, day: 5, vouching: null };
    const registry = [...REGISTRY, first];
    const second = valid({ name: TWINS[1].name, photo: TWIN_TWO }, { face: TWIN_TWO, transcript: TWINS[1].video });
    const together = { ...second, video: { ...second.video, with: CAST_PORTRAITS.twins } };
    for (let day = 5; day <= 7; day++) {
      expect(judge(together, rulebookForDay(day), registry).valid, `together, day ${day}`).toBe(true);
      expect(judge(second, rulebookForDay(day), registry).violations.map((v) => v.rule), `alone, day ${day}`).toEqual(['duplicate']);
    }
    // Filmed with someone else is not filmed with your twin.
    expect(judge({ ...second, video: { ...second.video, with: generatePortrait(7) } }, rulebookForDay(5), registry).valid).toBe(false);
    // And in the generated weeks, the second twin always comes filmed with the first, after her.
    for (let seed = 1; seed <= 20; seed++) {
      const queue = generateWeek(seed).flat();
      const [a, b] = [queue.findIndex((x) => x.name === TWINS[0].name), queue.findIndex((x) => x.name === TWINS[1].name)];
      expect(a).toBeLessThan(b);
      expect(queue[b].video.with).toBeDefined();
      expect(queue[b].planted).toEqual([]);
    }
  });
});
