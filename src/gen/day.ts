// A week at Window 3: every day's queue, from one seed. The week is generated in one go so that
// nobody says the same thing twice, the regulars take turns, and the registry is kept as it would
// stand if the clerk made no mistakes: vouchers are chosen from it, duplicates are planted against
// it, and `planted` describes each applicant under it. Nothing here depends on what the clerk
// decides, so a day's queue is the same however the days before it went; the desk judges it
// against the registry the clerk actually built.
import { FIRST_NAMES, LAST_NAMES, REMARKS, STREETS, TOWNS } from '../content/applicants';
import {
  AGENT, CLERK, CLONE, CUTOUT, DEEPFAKE, FIRST_APPLICANT, INFLUENCER, LIKENESS, PAT, PAT_MOTHER, REGULARS, SYBIL_FARM, TWINS,
  TWINS_FORM, UNIT_ON_FILE_RECORD, UNIT_OWNERS, UNITS, type CastId, type RegularId,
} from '../content/cast';
import {
  CAST_PORTRAITS, CATALOGUE_GENTLEMAN, CLONE_PORTRAIT, DEEPFAKE_SLIP, FARM_HATS, FIRST_APPLICANT_PORTRAIT, INFLUENCER_PHOTO,
  TWIN_TWO, UNIT_FACES, UNIT_LAMPS,
} from '../content/portraits';
import { hearChallenges } from '../court/court';
import { PHRASE } from '../rules/phrase';
import { atWindow, findName, freeVouches, register, remove } from '../rules/registry';
import type { Registrant, Registry, Sign } from '../rules/types';
import { generateApplicant, type GeneratedApplicant, type LookAlike, type Mistakes } from './applicant';
import { generatePortrait, type Accessory, type Portrait } from './portrait';
import { createRng, type Rng } from './rng';

export type DayPlan = {
  applicants: number;
  /** How many of them break a rule: about 30%, as near as the queue's length allows. */
  fakes: number;
  /** How long the shift lasts, in real seconds. Null: no clock. */
  shiftSeconds: number | null;
};

/** The day table in notes/game-design.md. Day 1 is 3 valid out of 5: its tutorial needs a fake besides the unit. */
export const DAYS: readonly DayPlan[] = [
  { applicants: 5, fakes: 2, shiftSeconds: null },
  { applicants: 7, fakes: 2, shiftSeconds: 360 },
  { applicants: 8, fakes: 2, shiftSeconds: 360 },
  { applicants: 8, fakes: 2, shiftSeconds: 360 },
  { applicants: 9, fakes: 3, shiftSeconds: 360 },
  { applicants: 10, fakes: 3, shiftSeconds: 360 },
  { applicants: 6, fakes: 2, shiftSeconds: null },
];

export const LAST_DAY = DAYS.length;

/** The day each rule's newest offenders turn up to test it, and the day Pat has nothing wrong. */
const PAT_DAYS = [1, 2, 3, 4, 6];
const TWIN_DAYS = [5, 6];
/** Townsfolk registered before the week began: the queue's vouchers, until the week's own registrants join them. */
const TOWNSFOLK = 10;
/** Share of weeks in which the Influencer comes on day 1, when her filter breaks no rule yet. */
const INFLUENCER_ON_DAY_1 = 0.4;

export type WeekPlan = {
  queues: GeneratedApplicant[][];
  /** The registry each morning, if the clerk makes no mistakes: mornings[0] is day 1's. */
  mornings: Registry[];
  /** seen[d][i]: the registry the i-th applicant of day d + 1 finds at the window, if the clerk makes no mistakes. */
  seen: Registry[][];
};

/** The week's queues, day 1 first. */
export const generateWeek = (seed: number): GeneratedApplicant[][] => planWeek(seed).queues;

/** One day's queue from the week's seed. */
export const generateDay = (seed: number, day: number): GeneratedApplicant[] => generateWeek(seed)[day - 1];

/** The registry on the morning of a day if the clerk has made no mistakes: where a week started on that day begins. */
export const morningRegistry = (seed: number, day: number): Registry => planWeek(seed).mornings[day - 1];

/** A new day at the registry: every vouch is free again, and anyone withdrawing that morning is gone. */
export const morning = (registry: Registry, day: number): Registry =>
  freeVouches(day === UNIT_ON_FILE_RECORD.withdraws ? remove(registry, UNIT_ON_FILE_RECORD.name) : registry);

/** Everyone who is somebody in particular: no ordinary applicant gets their name or address. */
const CAST_NAMES = [
  ...Object.values(REGULARS).flatMap((r) => [r.name, r.address]),
  ...UNITS.flatMap((u) => [u.name, u.address]), LIKENESS,
  ...UNIT_OWNERS.flatMap((v) => [v.name, v.address]), UNIT_ON_FILE_RECORD.name, UNIT_ON_FILE_RECORD.address, CLERK.name, CLERK.address,
  PAT.name, PAT.address, PAT_MOTHER.name, ...TWINS.map((t) => t.name), TWINS_FORM.address,
  ...SYBIL_FARM.cousins.map((c) => c.name), SYBIL_FARM.address, AGENT.name, AGENT.address, DEEPFAKE.name, DEEPFAKE.address,
  CUTOUT.name, CUTOUT.address, INFLUENCER.name, INFLUENCER.address, FIRST_APPLICANT.name, FIRST_APPLICANT.address,
];

const REGULAR_IDS = Object.keys(REGULARS) as RegularId[];

const faceKey = (p: Portrait) => `${p.species}:${Object.values(p.face).join(',')}`;

/** The other characters on day 6: two of them, whoever the seed sends. */
type Extra = 'agent' | 'cutout' | 'deepfake' | 'clone' | 'influencer' | FillInFault;
type FillInFault =
  | 'phrase'
  | Extract<Mistakes['photo'], 'another-face' | 'mirrored'>
  | Extract<Mistakes['sign'], 'two-wrong' | 'no-sign' | 'wrong-address'>
  | Extract<Mistakes['vouch'], 'unregistered' | 'busy'>
  | Extract<Mistakes['duplicate'], 'back-in-a-hat'>
  | Extract<Mistakes['living'], 'year-typo'>;
const EXTRAS: readonly (readonly [Extra, number])[] = [
  ['agent', 2], ['cutout', 2], ['deepfake', 1.5], ['clone', 1.5], ['influencer', 1.5],
  ['phrase', 1], ['another-face', 1], ['mirrored', 1], ['two-wrong', 1], ['no-sign', 0.7], ['wrong-address', 0.7],
  ['unregistered', 1], ['busy', 1], ['back-in-a-hat', 1], ['year-typo', 1.5],
];

type Week = {
  rng: Rng;
  /** Names, addresses and remarks already used this week, so nobody repeats. */
  used: Set<string>;
  /** Faces already in the week or on the books: a new ordinary face must not be one of them. */
  faces: Set<string>;
  /** Everyone refused so far this week, if the clerk makes no mistakes. */
  refused: string[];
};

export function planWeek(seed: number): WeekPlan {
  const rng = createRng(seed);
  const w: Week = { rng, used: new Set(CAST_NAMES), faces: new Set(), refused: [] };
  for (const p of [...Object.values(CAST_PORTRAITS), FIRST_APPLICANT_PORTRAIT, CATALOGUE_GENTLEMAN, CLONE_PORTRAIT]) w.faces.add(faceKey(p));

  // Who comes when. Ethel is registered on the first morning; the other regulars come once, from
  // day 2, Socrates before the day his year catches up with him.
  const regularDay = new Map<RegularId, number>([['grandmaEthel', 1]]);
  const others = shuffle(rng, REGULAR_IDS.filter((id) => id !== 'grandmaEthel'));
  const days = shuffle(rng, [2, 3, 4, 5, 6, 7, rng.int(2, 7)]);
  others.forEach((id, i) => regularDay.set(id, days[i]));
  const socratesDay = regularDay.get('socrates')!;
  if (socratesDay > 5) {
    const swap = others.find((id) => regularDay.get(id)! <= 5)!;
    regularDay.set('socrates', regularDay.get(swap)!);
    regularDay.set(swap, socratesDay);
  }
  const lines = new Map(REGULAR_IDS.map((id) => [id, rng.int(0, 99)]));
  const twinDay = rng.pick(TWIN_DAYS);
  const influencerFirst = rng.next() < INFLUENCER_ON_DAY_1;
  const extras = pickExtras(rng, influencerFirst);

  let registry: Registry = startingRegistry(w);
  const plan: WeekPlan = { queues: [], mornings: [], seen: [] };
  DAYS.forEach((dayPlan, i) => {
    const day = i + 1;
    registry = morning(registry, day);
    plan.mornings.push(registry);
    const regulars = REGULAR_IDS.filter((id) => regularDay.get(id) === day).map((id) => regular(id, day, lines.get(id)!));
    const queue = compose(w, day, dayPlan, registry, { regulars, twins: day === twinDay, influencerFirst, extras: day === 6 ? extras : [] });
    const seen: Registry[] = [];
    const challenged: GeneratedApplicant[] = [];
    queue.forEach((a, n) => {
      if (day >= 3) papersForSign(w, a, queue, n);
      if (day >= 4 && a.voucher === undefined) a.voucher = chooseVoucher(w, a, registry, day);
      seen.push(registry);
      registry = atWindow(registry, a);
      if (a.planted.length === 0) registry = register(registry, a, day);
      else challenged.push(a);
    });
    w.refused.push(...challenged.map((a) => a.name));
    // Five o'clock: every fake was challenged, so every challenge is upheld.
    registry = hearChallenges(registry, day, challenged.map((applicant) => ({ applicant, outcome: { correct: true, violations: [] } }))).registry;
    plan.queues.push(queue);
    plan.seen.push(seen);
  });
  return plan;
}

/** The two day-6 extras: whoever the seed sends, never two of the same kind. */
function pickExtras(rng: Rng, influencerFirst: boolean): Extra[] {
  const pool = EXTRAS.filter(([kind]) => !(kind === 'influencer' && influencerFirst));
  const first = weightedPick(rng, pool);
  return [first, weightedPick(rng, pool.filter(([kind]) => kind !== first))];
}

/** Everyone registered before the week: the clerk, the unit Window 7 registered, the Binnses who own units, and some townsfolk. */
function startingRegistry(w: Week): Registry {
  const before = (r: Omit<Registrant, 'day' | 'vouching'>): Registrant => ({ ...r, day: 0, vouching: null });
  const owners = UNIT_OWNERS.map((v) => before({ name: v.name, address: v.address, birthYear: v.birthYear, face: newFace(w) }));
  const townsfolk = Array.from({ length: TOWNSFOLK }, () => {
    const face = newFace(w);
    return before({ name: freshName(w), address: freshAddress(w), birthYear: w.rng.int(1935, 1995), face });
  });
  return [
    before({ name: CLERK.name, address: CLERK.address, birthYear: CLERK.birthYear, face: CLERK.face }),
    before({
      name: UNIT_ON_FILE_RECORD.name,
      address: UNIT_ON_FILE_RECORD.address,
      birthYear: UNIT_ON_FILE_RECORD.birthYear,
      face: UNIT_ON_FILE_RECORD.face,
      window: UNIT_ON_FILE_RECORD.window,
    }),
    ...owners,
    ...townsfolk,
  ];
}

type Cast = { regulars: GeneratedApplicant[]; twins: boolean; influencerFirst: boolean; extras: Extra[] };

/** The day's people in queue order: the scripted ones in the first half, the day's tester first. */
function compose(w: Week, day: number, plan: DayPlan, registry: Registry, cast: Cast): GeneratedApplicant[] {
  const { rng } = w;
  const unit = day <= UNITS.length ? unitOn(day) : null;
  const pat = PAT_DAYS.includes(day) ? patOn(w, day) : null;
  const mother = day === 4 ? patMother() : null;
  const farm = day === 5 ? SYBIL_FARM.cousins.map((_, i) => cousin(i)) : [];
  const twins = cast.twins ? [twin(0), twin(1)] : [];
  const influencer = day === 1 && cast.influencerFirst ? influencerOn(day) : null;
  const extras = cast.extras.map((kind) => extra(w, kind, day, registry));
  const nigel = cast.regulars.find((a) => a.cast === 'nervousNigel');
  // Day 7 is Humanity Day (slice 5 scripts it); until then its fakes are ordinary slips of the tongue.
  const phraseFakes = day === 7 ? [fillIn(w, day, true), fillIn(w, day, true)] : [];

  const fixed = [unit, pat, mother, ...farm, ...twins, influencer, ...cast.regulars, ...extras, ...phraseFakes].filter((a) => a !== null);
  const scriptedFakes = fixed.filter((a) => a.planted.length > 0).length;
  if (scriptedFakes !== plan.fakes) throw new Error(`Day ${day}: ${scriptedFakes} fakes, the day table says ${plan.fakes}`);
  const fillIns = Array.from({ length: plan.applicants - fixed.length - (day === 1 ? 1 : 0) }, () => fillIn(w, day, false));

  // Some ordinary people look as if they break a rule, and do not.
  const lookAlikes = shuffle(rng, fillIns);
  const tester = testerFor(w, day, { unit, pat, farm, nigel, fillIn: lookAlikes[0] });
  if (tester && tester === lookAlikes[0]) lookAlike(w, tester, day, true);
  if (lookAlikes[1] && day >= 2 && rng.next() < 0.6) lookAlike(w, lookAlikes[1], day, false);

  const n = plan.applicants;
  let queue: GeneratedApplicant[];
  if (day === 1) {
    queue = [first(), pat!, unit!, ...shuffle(rng, [cast.regulars.find((a) => a.cast === 'grandmaEthel')!, influencer ?? fillIns[0]])];
  } else if (day === 4) {
    // Pat's mother is three places behind Pat, and Pat opens the day.
    const rest = shuffle(rng, fixed.concat(fillIns).filter((a) => a !== pat && a !== mother && a !== unit));
    queue = [pat!, ...rest];
    queue.splice(rng.int(1, 2), 0, unit!);
    queue.splice(3, 0, mother!);
  } else {
    const scripted = day === 5 ? [unit!, ...farm] : [unit, pat].filter((a) => a !== null);
    const early = scripted.filter((a) => a !== tester);
    const rest = shuffle(rng, fixed.concat(fillIns).filter((a) => a !== tester && !early.includes(a)));
    queue = arrange(rng, n, tester, early, rest);
  }
  // The second twin comes after the first, and whoever is let down by a busy voucher comes last.
  const [a, b] = twins;
  if (a && queue.indexOf(b) < queue.indexOf(a)) [queue[queue.indexOf(a)], queue[queue.indexOf(b)]] = [b, a];
  const busy = queue.find((x) => x.planted[0]?.mistake === 'busy');
  if (busy) queue = [...queue.filter((x) => x !== busy), busy];
  return queue;
}

/** The first applicant after a new rule tests it: the unit, Pat breaking it, or someone who only looks as if they do. */
function testerFor(
  w: Week,
  day: number,
  who: { unit: GeneratedApplicant | null; pat: GeneratedApplicant | null; farm: GeneratedApplicant[]; nigel?: GeneratedApplicant; fillIn?: GeneratedApplicant },
): GeneratedApplicant | null {
  if (day === 1 || day === 4 || day === 7) return null;
  const options =
    day === 5 ? [who.unit, who.farm[0]] : day === 6 ? [who.unit, who.nigel ?? who.fillIn, who.fillIn] : [who.unit, who.pat, who.fillIn];
  return w.rng.pick(options.filter((a) => a != null)) ?? null;
}

/** `first` at the front, `early` in order at places in the first half, and `rest` in the gaps. */
function arrange(rng: Rng, n: number, first: GeneratedApplicant | null, early: GeneratedApplicant[], rest: GeneratedApplicant[]) {
  const half = Math.ceil(n / 2);
  const queue: (GeneratedApplicant | null)[] = new Array(n).fill(null);
  const from = first ? 1 : 0;
  if (first) queue[0] = first;
  const places = shuffle(rng, Array.from({ length: half - from }, (_, i) => i + from))
    .slice(0, early.length)
    .sort((x, y) => x - y);
  early.forEach((a, i) => (queue[places[i]] = a));
  let next = 0;
  return queue.map((a) => a ?? rest[next++]);
}

// ---------------------------------------------------------------- papers

/** Wallet on the form and sign in the video, from day 3. */
function papersForSign(w: Week, a: GeneratedApplicant, queue: GeneratedApplicant[], n: number) {
  const { rng } = w;
  a.wallet ??= wallet(rng);
  if (a.video.sign !== undefined) return;
  const mistake = a.planted[0]?.rule === 'sign' ? a.planted[0].mistake : null;
  const kind = a.lookAlike?.rule === 'sign' ? a.lookAlike.kind : null;
  let sign: Sign | null = { kind: 'address', text: a.wallet };
  if (mistake === 'no-sign') sign = null;
  else if (mistake === 'qr') sign = { kind: 'qr' };
  else if (mistake === 'two-wrong') sign = { kind: 'address', text: miswrite(rng, a.wallet, 2) };
  else if (mistake === 'wrong-address') {
    // The next person's address, or the one before if they are last. It is their wallet, not a typo.
    const other = queue[n + 1] ?? queue[n - 1];
    other.wallet ??= wallet(rng);
    sign = { kind: 'address', text: other.wallet };
  } else if (kind === 'one-wrong') sign = { kind: 'address', text: miswrite(rng, a.wallet, 1) };
  else if (kind === 'phone') sign = { kind: 'address', text: a.wallet, phone: true };
  a.video = { ...a.video, sign };
}

/** From day 4: a voucher who is registered and free today, unless the applicant's fault is the voucher. */
function chooseVoucher(w: Week, a: GeneratedApplicant, registry: Registry, day: number): string {
  const { rng } = w;
  const fault = a.planted[0]?.rule === 'vouch' ? a.planted[0].mistake : null;
  if (fault === 'unregistered') {
    // Often someone who was refused earlier in the week: not registered, unless the clerk let them in.
    // Never Pat, who is sincere and still applying.
    const refused = [...new Set(w.refused)].filter((name) => name !== a.name && name !== PAT.name && !findName(registry, name));
    return a.cast === null && refused.length > 0 && rng.next() < 0.6 ? rng.pick(refused) : freshName(w);
  }
  const ethel = findName(registry, REGULARS.grandmaEthel.name);
  if (fault === 'busy') {
    const busy = registry.filter((r) => r.vouching !== null && r.vouching !== a.name);
    const pick = busy.find((r) => r === ethel) ?? rng.pick(busy);
    return pick.name;
  }
  if (a.lookAlike?.rule === 'vouch' && a.lookAlike.kind === 'ethel' && ethel?.vouching === null) return ethel.name;
  // From day 5 Ethel vouches for her bridge club, one of them a day: the first ordinary person who needs her.
  if (day >= 5 && ethel?.vouching === null && a.planted.length === 0 && a.cast === null && !a.lookAlike) {
    a.lookAlike = { rule: 'vouch', kind: 'ethel' };
    return ethel.name;
  }
  // Ethel, Pat's mother and the unit owners vouch only where the week has them do it.
  const reserved = new Set<string>([CLERK.name, UNIT_ON_FILE_RECORD.name, REGULARS.grandmaEthel.name, PAT_MOTHER.name, ...UNIT_OWNERS.map((v) => v.name)]);
  const free = registry.filter((r) => r.vouching === null && r.face.species === 'human' && !reserved.has(r.name) && r.name !== a.name);
  if (free.length === 0) throw new Error(`Day ${day}: nobody free to vouch for ${a.name}`);
  // The honest and the fakes lean on the same people, the week's registrants more than the town, so
  // who vouched, and since when, says nothing about the rest of the papers.
  const week = free.filter((r) => r.day >= 1);
  const voucher = rng.pick(week.length > 0 && rng.next() < 0.6 ? week : free);
  if (a.planted.length === 0 && !a.lookAlike && voucher.day >= 1) a.lookAlike = { rule: 'vouch', kind: 'week-registrant' };
  return voucher.name;
}

const HEX = '0123456789ABCDEF';
const wallet = (rng: Rng) => `0x${Array.from({ length: 40 }, () => HEX[rng.int(0, 15)]).join('')}`;

/** The address with `count` characters wrong, all where the form shows them: 0x3F9A…C21E. */
function miswrite(rng: Rng, address: string, count: number): string {
  const visible = shuffle(rng, [2, 3, 4, 5, 38, 39, 40, 41]).slice(0, count);
  const chars = [...address];
  for (const i of visible) chars[i] = rng.pick([...HEX].filter((c) => c !== chars[i]));
  return chars.join('');
}

// ---------------------------------------------------------------- people

function freshName(w: Week) {
  return unused(w.used, () => `${w.rng.pick(FIRST_NAMES)} ${w.rng.pick(LAST_NAMES)}`);
}

function freshAddress(w: Week) {
  return unused(w.used, () => `${w.rng.int(1, 199)} ${w.rng.pick(STREETS)}, ${w.rng.pick(TOWNS)}`);
}

function unused(used: Set<string>, roll: () => string): string {
  let value = roll();
  for (let tries = 0; used.has(value) && tries < 50; tries++) value = roll();
  used.add(value);
  return value;
}

/** An ordinary face nobody else in the week has. */
function newFace(w: Week): Portrait {
  for (;;) {
    const face = generatePortrait(w.rng.int(0, 0xffffffff));
    if (!w.faces.has(faceKey(face))) {
      w.faces.add(faceKey(face));
      return face;
    }
  }
}

/** An ordinary member of the public with a face nobody else in the week has. */
function fillIn(w: Week, day: number, fake: boolean): GeneratedApplicant {
  for (;;) {
    const a: GeneratedApplicant = generateApplicant(w.rng.int(0, 0xffffffff), { fake, day, used: w.used });
    if (!w.faces.has(faceKey(a.photo))) {
      w.faces.add(faceKey(a.photo));
      return a;
    }
  }
}

/** A remark anyone could make, for someone whose looks were changed after their remark was chosen. */
function plainRemark(w: Week): string {
  const fresh = REMARKS.anyone.filter((line) => !w.used.has(line));
  const line = w.rng.pick(fresh.length > 0 ? fresh : REMARKS.anyone);
  w.used.add(line);
  return line;
}

function first(): GeneratedApplicant {
  const f = FIRST_APPLICANT;
  const face = FIRST_APPLICANT_PORTRAIT;
  return { name: f.name, address: f.address, birthYear: f.birthYear, photo: face, video: { face, transcript: f.video, blinked: true }, remark: f.remark, planted: [], cast: null };
}

/**
 * The day's Likeness unit: a new face, an ordinary name, a flawless photo, the phrase word for word,
 * and one thing that gives it away. Built without the week's random numbers, so nobody else changes.
 */
function unitOn(day: number): GeneratedApplicant {
  const u = UNITS[day - 1];
  const face = UNIT_FACES[day - 1];
  const tell = UNIT_LAMPS[day - 1];
  const a: GeneratedApplicant = {
    name: u.name, address: u.address, birthYear: u.birthYear, photo: face, remark: u.remark, cast: 'unit',
    video: { face, transcript: PHRASE, blinked: true, ...(tell ?? {}) },
    planted: tell ? [{ rule: 'human', mistake: 'machine' }] : [],
  };
  if (day >= 3) a.wallet = u.wallet;
  // Day 3: the address on its phone, in full and the right way up.
  if (day === 3) a.video = { ...a.video, sign: { kind: 'address', text: u.wallet, phone: true } };
  if (day === 4) {
    a.voucher = LIKENESS;
    a.planted = [{ rule: 'vouch', mistake: 'company' }];
  }
  if (day === 5) {
    // Its owner vouches for it; the registry already has its face, from Window 7.
    a.voucher = UNIT_OWNERS[0].name;
    a.planted = [{ rule: 'duplicate', mistake: 'unit' }];
  }
  if (day === 6) a.voucher = UNIT_OWNERS[1].name;
  return a;
}

/** Pat, better prepared each visit, failing each visit on the newest rule, until day 6. */
function patOn(w: Week, day: number): GeneratedApplicant {
  const face = CAST_PORTRAITS.pat;
  const { remark, video } = PAT.days[day];
  const a: GeneratedApplicant = {
    name: PAT.name, address: PAT.address, birthYear: PAT.birthYear, photo: face, video: { face, transcript: video, blinked: true },
    remark, planted: [], cast: 'pat',
  };
  if (day === 1) a.planted = [{ rule: 'phrase', mistake: 'wrong-word' }];
  if (day === 2) {
    a.mirrored = true;
    a.planted = [{ rule: 'photo', mistake: 'mirrored' }];
  }
  if (day === 3) a.planted = [{ rule: 'sign', mistake: 'two-wrong' }];
  if (day === 4) {
    a.voucher = PAT_MOTHER.name;
    a.planted = [{ rule: 'vouch', mistake: 'unregistered' }];
  }
  if (day === 6) a.voucher = PAT_MOTHER.name;
  if (day >= 3) a.wallet = wallet(w.rng);
  return a;
}

function patMother(): GeneratedApplicant {
  const m = PAT_MOTHER;
  const face = CAST_PORTRAITS.patMother;
  return {
    name: m.name, address: m.address, birthYear: m.birthYear, photo: face, video: { face, transcript: m.video, blinked: true },
    remark: m.remark, voucher: REGULARS.grandmaEthel.name, planted: [], cast: 'patMother', lookAlike: { rule: 'vouch', kind: 'ethel' },
  };
}

/** A regular on their line of the week: valid under every rule in force. */
function regular(id: RegularId, day: number, n: number): GeneratedApplicant {
  const r = REGULARS[id];
  const a: GeneratedApplicant = {
    name: r.name, address: r.address, birthYear: r.birthYear, photo: r.portrait,
    video: { face: r.portrait, transcript: r.videos[n % r.videos.length], blinked: true, ...(r.nervous ? { nervous: true as const } : {}) },
    remark: r.remarks[n % r.remarks.length], planted: [], cast: id,
  };
  if (id === 'dave') a.lookAlike = { rule: 'human', kind: 'costume' };
  if (id === 'nervousNigel' && day >= 6) a.lookAlike = { rule: 'living', kind: 'blinks-a-lot' };
  return a;
}

function twin(i: 0 | 1): GeneratedApplicant {
  const t = TWINS[i];
  const face = i === 0 ? CAST_PORTRAITS.twins : TWIN_TWO;
  // The second twin films her video with the first, as the policy asks of twins.
  const video = { face, transcript: t.video, blinked: true, ...(i === 1 ? { with: CAST_PORTRAITS.twins } : {}) };
  return {
    name: t.name, address: TWINS_FORM.address, birthYear: TWINS_FORM.birthYear, photo: face, video, remark: t.remark,
    planted: [], cast: 'twins', ...(i === 1 ? { lookAlike: { rule: 'duplicate', kind: 'twin' } as LookAlike } : {}),
  };
}

/** The Sybil Farm's i-th cousin, in their own hat. The first is a human; the rest are his face again. */
function cousin(i: number): GeneratedApplicant {
  const c = SYBIL_FARM.cousins[i];
  const face: Portrait = { ...CAST_PORTRAITS.sybilFarm, accessories: [FARM_HATS[i] as Accessory] };
  return {
    name: c.name, address: SYBIL_FARM.address, birthYear: SYBIL_FARM.birthYear, photo: face, video: { face, transcript: c.video, blinked: true },
    remark: c.remark, cast: 'sybilFarm',
    ...(i === 0 ? { planted: [], lookAlike: { rule: 'duplicate', kind: 'first-cousin' } as LookAlike } : { planted: [{ rule: 'duplicate', mistake: 'farm' }] }),
  };
}

function influencerOn(day: number): GeneratedApplicant {
  const i = INFLUENCER;
  const face = CAST_PORTRAITS.influencer;
  return {
    name: i.name, address: i.address, birthYear: i.birthYear, photo: INFLUENCER_PHOTO, video: { face, transcript: i.video, blinked: true },
    remark: i.remark, cast: 'influencer', planted: day >= 2 ? [{ rule: 'photo', mistake: 'filter' }] : [],
  };
}

/** One of day 6's extras: a character, or an ordinary person with one ordinary fault. */
function extra(w: Week, kind: Extra, day: number, registry: Registry): GeneratedApplicant {
  const { rng } = w;
  const castFace = (id: CastId & keyof typeof CAST_PORTRAITS) => CAST_PORTRAITS[id];
  switch (kind) {
    case 'agent': {
      const face = castFace('agent');
      // Its video was generated, not filmed, which Rule 0 catches; and it gets one more thing wrong.
      const fault = rng.pick(['phrase', 'sign', 'living'] as const);
      return {
        name: AGENT.name, address: AGENT.address, birthYear: fault === 'living' ? AGENT.version : AGENT.birthYear, photo: face,
        video: {
          face, transcript: fault === 'phrase' ? AGENT.paraphrase : PHRASE, blinked: true, generated: true,
          ...(fault === 'sign' ? { sign: { kind: 'qr' } as Sign } : {}),
        },
        remark: AGENT.remarks[fault], cast: 'agent',
        planted: [
          { rule: 'human', mistake: 'generated' },
          fault === 'phrase' ? { rule: 'phrase', mistake: 'missing-words' } : fault === 'sign' ? { rule: 'sign', mistake: 'qr' } : { rule: 'living', mistake: 'version' },
        ],
      };
    }
    case 'cutout': {
      const face = castFace('cutout');
      return {
        name: CUTOUT.name, address: CUTOUT.address, birthYear: CUTOUT.birthYear, photo: face, remark: CUTOUT.remark, cast: 'cutout',
        // A printed face held up to the camera: a picture, not a person (Rule 0), and a picture does not blink (Rule 6).
        video: { face, transcript: CUTOUT.video, blinked: false, still: true },
        planted: [{ rule: 'human', mistake: 'printed' }, { rule: 'living', mistake: 'no-blink' }],
      };
    }
    case 'deepfake': {
      const face = castFace('deepfake');
      return {
        name: DEEPFAKE.name, address: DEEPFAKE.address, birthYear: DEEPFAKE.birthYear, photo: face, remark: DEEPFAKE.remark, cast: 'deepfake',
        video: { face, transcript: PHRASE, blinked: true, glitch: { frame: rng.int(2, 3), face: DEEPFAKE_SLIP } },
        planted: [{ rule: 'human', mistake: 'deepfake' }],
      };
    }
    case 'clone':
      return {
        name: CLERK.name, address: CLERK.address, birthYear: CLERK.birthYear, photo: CLONE_PORTRAIT, remark: CLONE.remark, cast: 'clone',
        video: { face: CLONE_PORTRAIT, transcript: CLONE.video, blinked: true }, planted: [{ rule: 'duplicate', mistake: 'clone' }],
      };
    case 'influencer':
      return influencerOn(day);
    case 'phrase':
      return fillIn(w, day, true);
    default:
      return faultyFillIn(w, kind, registry);
  }
}

/** An ordinary person with one ordinary fault. */
function faultyFillIn(w: Week, kind: Exclude<FillInFault, 'phrase'>, registry: Registry): GeneratedApplicant {
  const { rng } = w;
  const a = fillIn(w, 6, false);
  switch (kind) {
    case 'another-face':
      a.photo = newFace(w);
      a.planted = [{ rule: 'photo', mistake: 'another-face' }];
      break;
    case 'mirrored': {
      // A mole shows which way round a face is. A remark about the mark it had would not fit the mole.
      if (REMARKS.mark[a.photo.face.mark]?.includes(a.remark) && a.photo.face.mark !== 'mole') a.remark = plainRemark(w);
      const face = { ...a.photo, face: { ...a.photo.face, mark: 'mole' as const } };
      a.photo = face;
      a.video = { ...a.video, face };
      a.mirrored = true;
      a.planted = [{ rule: 'photo', mistake: 'mirrored' }];
      break;
    }
    case 'two-wrong':
    case 'no-sign':
    case 'wrong-address':
      a.planted = [{ rule: 'sign', mistake: kind }];
      break;
    case 'unregistered':
    case 'busy':
      a.planted = [{ rule: 'vouch', mistake: kind }];
      break;
    case 'back-in-a-hat': {
      // Someone registered earlier this week, back under another name, in a hat.
      const cast = new Set(CAST_NAMES);
      const earlier = registry.filter((r) => r.day >= 1 && r.face.species === 'human' && !cast.has(r.name));
      const them = rng.pick(earlier);
      const face: Portrait = { ...them.face, accessories: [...them.face.accessories.filter((x) => x === 'glasses'), rng.pick(FARM_HATS)] };
      a.photo = face;
      a.video = { ...a.video, face };
      a.remark = plainRemark(w);
      a.planted = [{ rule: 'duplicate', mistake: 'back-in-a-hat' }];
      break;
    }
    case 'year-typo': {
      // The century slips to "11": 1997 becomes 1197, 2003 becomes 1103. A remark that says the real
      // year would give the typo away.
      if (a.remark.includes(String(a.birthYear))) a.remark = plainRemark(w);
      a.birthYear = 1100 + (Number(a.birthYear) % 100);
      a.planted = [{ rule: 'living', mistake: 'year-typo' }];
      break;
    }
  }
  return a;
}

/** Makes a valid ordinary person look as if they break one of the day's rules, without breaking it. */
function lookAlike(w: Week, a: GeneratedApplicant, day: number, newRule: boolean) {
  const { rng } = w;
  const rules = (['photo', 'sign', 'living'] as const).filter((rule) => (newRule ? DAYS_OF[rule] === day : DAYS_OF[rule] <= day));
  const rule = rules.length > 0 ? rng.pick(rules) : null;
  if (rule === 'photo') {
    // A new haircut since the photo, or glasses on in one and off in the other: hair and glasses are not the face.
    const hairs = (['short', 'buzz', 'bob', 'curly', 'side-part', 'bald'] as const).filter((h) => h !== a.photo.hair);
    const glasses = a.photo.accessories.includes('glasses');
    a.video = {
      ...a.video,
      face: rng.next() < 0.5
        ? { ...a.photo, hair: rng.pick(hairs) }
        : { ...a.photo, accessories: glasses ? a.photo.accessories.filter((x) => x !== 'glasses') : [...a.photo.accessories, 'glasses'] },
    };
    a.lookAlike = { rule: 'photo', kind: 'new-look' };
  } else if (rule === 'sign') {
    a.lookAlike = { rule: 'sign', kind: rng.next() < 0.6 ? 'one-wrong' : 'phone' };
  } else if (rule === 'living') {
    a.birthYear = rng.int(1900, 1915);
    a.photo = { ...a.photo, face: { ...a.photo.face, age: 'old' } };
    a.video = { ...a.video, face: { ...a.video.face, face: { ...a.video.face.face, age: 'old' } } };
    w.faces.add(faceKey(a.photo));
    a.remark = plainRemark(w);
    a.lookAlike = { rule: 'living', kind: 'very-old' };
  }
}

const DAYS_OF = { photo: 2, sign: 3, living: 6 } as const;

function weightedPick<T>(rng: Rng, table: readonly (readonly [T, number])[]): T {
  const total = table.reduce((sum, [, weight]) => sum + weight, 0);
  let roll = rng.next() * total;
  for (const [value, weight] of table) {
    roll -= weight;
    if (roll < 0) return value;
  }
  return table[table.length - 1][0];
}

function shuffle<T>(rng: Rng, items: readonly T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = rng.int(0, i);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
