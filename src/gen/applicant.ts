// Seeded fill-in applicants: ordinary members of the public. Each one carries `planted`, the
// violations it was built with, so tests can check the rule engine against the truth without trusting it.
import { ASIDES, FIRST_NAMES, LAST_NAMES, NOISE, PHRASE_MISTAKES, REMARKS, SLIPS, STREETS, TOWNS, type Street, type Town } from '../content/applicants';
import type { CastId } from '../content/cast';
import { PHRASE } from '../rules/phrase';
import type { Applicant, RuleId } from '../rules/types';
import { generatePortrait, weighted, type Age, type Portrait } from './portrait';
import { createRng, type Rng } from './rng';

export type PhraseMistake = 'wrong-word' | 'missing-words' | 'silence' | 'quiet-word';

/** Every kind of fault the generator plants, by the rule it breaks. */
export type Mistakes = {
  phrase: PhraseMistake;
  /**
   * Someone else's face; a mirror selfie; a beauty filter; a unit, whose night lamp shows between its brows
   * in every frame with its eyes shut; the Deepfake, whose ears change between frames.
   */
  face: 'another-face' | 'mirrored' | 'filter' | 'machine' | 'deepfake';
  /** Two characters wrong; no sign; a QR code; someone else's address. */
  sign: 'two-wrong' | 'no-sign' | 'qr' | 'wrong-address';
  /** Vouched for by a company (a unit's maker); by someone not registered; by someone already vouching today. */
  vouch: 'company' | 'unregistered' | 'busy';
  /** The Sybil Farm's later cousins; your clone; a unit whose factory face Window 7 registered; a registrant back in a hat. */
  duplicate: 'farm' | 'clone' | 'unit' | 'back-in-a-hat';
  /** Born before 1900; a version number for a year; a typo in the year; no blink; the Cutout, a picture held up; the Agent, a generated video. */
  living: 'ancient' | 'version' | 'year-typo' | 'no-blink' | 'printed' | 'generated';
};

/** Every kind of valid applicant built to look like they break a rule. */
export type LookAlikes = {
  phrase: never;
  /** A new haircut or glasses since the photo; Dave, a man in a robot costume, its head under his arm. */
  face: 'new-look' | 'costume';
  /**
   * One character wrong; the address on a phone's screen. Since about half of everyone holds a phone
   * up (day.ts papersForSign), `phone` looks like anyone and tests nothing; it stays so the week's
   * random numbers do not move.
   */
  sign: 'one-wrong' | 'phone';
  vouch: 'ethel' | 'week-registrant';
  duplicate: 'first-cousin' | 'twin';
  living: 'very-old' | 'blinks-a-lot';
};

export type Planted = { [R in RuleId]: { rule: R; mistake: Mistakes[R] } }[RuleId];
export type LookAlike = { [R in RuleId]: { rule: R; kind: LookAlikes[R] } }[RuleId];

/**
 * An applicant with the truth attached: what was planted (under correct play: the registry as it
 * would stand if the clerk made no mistakes), who of the recurring cast they are, and which rule,
 * if any, they were built to look as if they break.
 */
export type GeneratedApplicant = Applicant & { planted: Planted[]; cast: CastId | null; lookAlike?: LookAlike };

/** An ordinary member of the public as first rolled: if they get anything wrong, it is the phrase. */
export type FillIn = GeneratedApplicant & { planted: Extract<Planted, { rule: 'phrase' }>[] };

/** Fakes: mostly clear slips, about one in three a quiet one-word change. */
const MISTAKES: readonly (readonly [PhraseMistake, number])[] = [
  ['wrong-word', 8], ['missing-words', 7], ['silence', 4], ['quiet-word', 9],
];
/** Share of people who say something before or after the phrase in their video. */
const CHATTY = 0.45;
/** Share of people who stop for an aside in the middle of it. */
const ASIDE = 0.25;
/** Share of people who say a small word differently ("in the registry"). */
const SLIP = 0.3;
/** Share of remarks about something visible (the coat, the mustache, the street), rather than small talk. */
const PERSONAL = 0.65;
/** Share of remarks that pass on the queue's gossip, from day 2. */
const GOSSIP = 0.15;
/** Birth years that fit the face in the photo. */
const BIRTH_YEARS: Record<Age, readonly [number, number]> = {
  young: [1996, 2006],
  adult: [1965, 1995],
  old: [1931, 1964],
};
/** The video strip shows at most two lines of 60 characters (the transcript box in desk.css). */
const TRANSCRIPT = { width: 60, lines: 2 } as const;

type Options = {
  /** Whether they get the phrase wrong. */
  fake: boolean;
  /** The day they come in: the queue's gossip depends on it. */
  day?: number;
  /** Names, addresses and remarks already used this week, so nobody repeats. Added to here. */
  used?: Set<string>;
  /** Their face, when the week has already chosen it: a Likeness unit's, which the registry may have on file. */
  photo?: Portrait;
};

/** An ordinary member of the public, who says the phrase (with or without chatter) or gets it wrong. */
export function generateApplicant(seed: number, { fake, day = 1, used = new Set(), photo: chosen }: Options): FillIn {
  const rng = createRng(seed);
  // The portrait gets its own seed so its features are independent of everything rolled here.
  const photo = chosen ?? generatePortrait(rng.int(0, 0xffffffff));
  const [earliest, latest] = BIRTH_YEARS[photo.face.age];
  const name = unused(used, () => `${rng.pick(FIRST_NAMES)} ${rng.pick(LAST_NAMES)}`);
  const street = rng.pick(STREETS);
  const town = rng.pick(TOWNS);
  const address = unused(used, () => `${rng.int(1, 199)} ${street}, ${town}`);
  const birthYear = rng.int(earliest, latest);
  const mistake = fake ? weighted(rng, MISTAKES) : null;
  const said = slip(rng, mistake ? rng.pick(PHRASE_MISTAKES[mistake]) : PHRASE);
  return {
    name,
    address,
    birthYear,
    photo,
    video: { face: photo, transcript: mistake === 'silence' ? said : chatter(rng, said, photo.face.age), blinked: true },
    remark: remark(rng, { photo, street, town, day }, used).replace('{year}', String(birthYear)),
    planted: mistake ? [{ rule: 'phrase', mistake }] : [],
    cast: null,
  };
}

/** A fresh value from `roll`, remembered in `used`. Gives up on freshness after a few tries. */
function unused(used: Set<string>, roll: () => string): string {
  let value = roll();
  for (let tries = 0; used.has(value) && tries < 20; tries++) value = roll();
  used.add(value);
  return value;
}

/**
 * Sometimes an aside in the middle ("and, um, that"), sometimes a word before or after ("Okay,
 * is it on?", "Probably."). Whatever does not fit the strip's two lines is left unsaid.
 */
function chatter(rng: Rng, said: string, age: Age): string {
  const words = said.split(' ');
  const aside = rng.next() < ASIDE && words.length > 2 ? rng.pick(ASIDES) : null;
  const at = rng.int(1, words.length - 1);
  const chatty = rng.next() < CHATTY;
  const where = rng.next();
  const before = chatty && where < 0.55 ? rng.pick([...NOISE.anyone.before, ...NOISE[age].before]) : '';
  const after = chatty && where >= 0.45 ? rng.pick([...NOISE.anyone.after, ...NOISE[age].after]) : '';
  const middle = aside ? withAside(words, at, aside) : said;
  for (const text of [[before, middle, after], [before, said, after], [said]].map((parts) => parts.filter(Boolean).join(' '))) {
    if (transcriptLines(text) <= TRANSCRIPT.lines) return text;
  }
  return said;
}

/** Sometimes a small word said differently: "in the registry", "I'm". Never a key word, so never a mistake. */
function slip(rng: Rng, line: string): string {
  const [from, to] = rng.pick(SLIPS);
  return rng.next() < SLIP ? line.replace(from, to) : line;
}

/** The words with an aside set off by commas after the first `at` of them: "human and, um, that". */
function withAside(words: string[], at: number, aside: string): string {
  const before = words[at - 1];
  const ends = /[.?!]$/.test(before);
  const said = ends ? `${aside[0].toUpperCase()}${aside.slice(1)},` : `${aside},`;
  return [...words.slice(0, at - 1), ends || before.endsWith(',') ? before : `${before},`, said, ...words.slice(at)].join(' ');
}

/** Lines the transcript takes in the video strip: greedy word wrap, as the browser does it. */
function transcriptLines(text: string): number {
  let lines = 0;
  let width = Infinity;
  for (const word of text.split(' ').filter(Boolean)) {
    if (width + 1 + word.length <= TRANSCRIPT.width) width += 1 + word.length;
    else {
      lines++;
      width = word.length;
    }
  }
  return lines;
}

type Seen = { photo: Portrait; street: Street; town: Town; day: number };

/** Something they would say: usually about what the clerk can see, sometimes gossip, otherwise small talk. */
function remark(rng: Rng, { photo, street, town, day }: Seen, used: Set<string>): string {
  const fresh = (lines: readonly string[] | undefined) => (lines ?? []).filter((line) => !used.has(line));
  const personal = [
    REMARKS.age[photo.face.age],
    REMARKS.outfit[photo.outfit],
    REMARKS.hair[photo.hair],
    REMARKS.hairColor[photo.hairColor],
    REMARKS.facialHair[photo.facialHair],
    REMARKS.brows[photo.face.brows],
    REMARKS.mouth[photo.face.mouth],
    REMARKS.mark[photo.face.mark],
    ...photo.accessories.map((item) => REMARKS.accessory[item]),
    REMARKS.street[street],
    REMARKS.town[town],
  ]
    .map(fresh)
    .filter((lines) => lines.length > 0);
  // Gossip is about the last day or two, so the week's news travels down the queue.
  const gossip = fresh(REMARKS.rumours.filter(([from]) => from <= day && from >= day - 1).map(([, line]) => line));
  const roll = rng.next();
  const pool =
    roll < PERSONAL && personal.length > 0
      ? rng.pick(personal)
      : roll < PERSONAL + GOSSIP && gossip.length > 0
        ? gossip
        : fresh(REMARKS.anyone).length > 0
          ? fresh(REMARKS.anyone)
          : REMARKS.anyone;
  const line = rng.pick(pool);
  used.add(line);
  return line;
}
