import { describe, expect, it } from 'vitest';
import { ASIDES, NOISE, PHRASE_MISTAKES, REMARKS, SLIPS } from '../content/applicants';
import { REGULARS } from '../content/cast';
import { PHRASE, spokenWords } from '../rules/phrase';
import { generateApplicant, type GeneratedApplicant, type PhraseMistake } from './applicant';

const seeds = (n: number) => Array.from({ length: n }, (_, i) => i + 1);
// Three in ten are fakes, as on a real day (the day's queue decides who; see day.test.ts).
const day = seeds(1000).map((seed) => generateApplicant(seed, { fake: seed % 10 < 3 }));
const fakes = day.filter((a) => a.planted.length > 0);
const honest = day.filter((a) => a.planted.length === 0);

const words = (text: string) => spokenWords(text).join(' ').toLowerCase();
const before = ['', ...new Set(Object.values(NOISE).flatMap((n) => n.before))].map(words);
const after = ['', ...new Set(Object.values(NOISE).flatMap((n) => n.after))].map(words);
/** Whether the transcript is the line (or one of its slips), with chatter before or after it and an aside in the middle, or not. */
const saysLine = (transcript: string, line: string) => {
  const said = words(transcript);
  const lines = new Set([line, ...SLIPS.map(([from, to]) => line.replace(from, to))].map(words));
  // Peel off whatever chatter came before and after, then at most one aside from the middle.
  for (const b of before) {
    if (b && !said.startsWith(`${b} `)) continue;
    for (const a of after) {
      if (a && !said.endsWith(` ${a}`)) continue;
      const middle = said.slice(b ? b.length + 1 : 0, a ? said.length - a.length - 1 : said.length);
      if (lines.has(middle)) return true;
      for (const aside of ASIDES.map(words)) {
        for (let at = middle.indexOf(` ${aside} `); at >= 0; at = middle.indexOf(` ${aside} `, at + 1)) {
          if (lines.has(middle.slice(0, at) + middle.slice(at + aside.length + 1))) return true;
        }
      }
    }
  }
  return false;
};

describe('generateApplicant', () => {
  it('gives the same applicant for the same seed', () => {
    for (const seed of seeds(200)) {
      expect(generateApplicant(seed, { fake: seed % 2 === 0 })).toEqual(generateApplicant(seed, { fake: seed % 2 === 0 }));
    }
  });

  it('gives the same applicants as last time (snapshot)', () => {
    expect(seeds(4).map((seed) => generateApplicant(seed, { fake: seed % 2 === 0 }))).toMatchSnapshot();
  });

  it('makes about one fake in four a quiet one-word change, and plants every kind of mistake', () => {
    const quiet = fakes.filter((a) => a.planted[0].mistake === 'quiet-word').length / fakes.length;
    expect(quiet).toBeGreaterThanOrEqual(0.15);
    expect(quiet).toBeLessThanOrEqual(0.35);
    expect(new Set(fakes.map((a) => a.planted[0].mistake))).toEqual(new Set(Object.keys(PHRASE_MISTAKES)));
  });

  it('breaks at most one rule on day 1, and only the phrase rule', () => {
    for (const a of day) {
      expect(a.planted.length).toBeLessThanOrEqual(1);
      for (const p of a.planted) expect(p.rule).toBe('phrase');
    }
  });

  it('has valid applicants say the phrase and fakes a mistake line, with or without chatter and asides', () => {
    for (const a of honest) expect(saysLine(a.video.transcript, PHRASE), a.video.transcript).toBe(true);
    for (const a of fakes) {
      const lines = PHRASE_MISTAKES[a.planted[0].mistake];
      expect(lines.some((line) => saysLine(a.video.transcript, line)), a.video.transcript).toBe(true);
    }
  });

  it('chatters about as often whether valid or not, so chatter is never a tell', () => {
    const lines = (a: GeneratedApplicant) => (a.planted.length > 0 ? PHRASE_MISTAKES[a.planted[0].mistake as PhraseMistake] : [PHRASE]);
    const share = (people: GeneratedApplicant[], test: (a: GeneratedApplicant) => boolean) => {
      const talking = people.filter((a) => a.video.transcript !== '');
      return talking.filter(test).length / talking.length;
    };
    const chatty = (a: GeneratedApplicant) => !lines(a).includes(a.video.transcript);
    const aside = (a: GeneratedApplicant) => ASIDES.some((x) => a.video.transcript.toLowerCase().includes(`, ${x},`) || a.video.transcript.includes(`. ${x[0].toUpperCase()}${x.slice(1)},`));
    expect(share(honest, chatty)).toBeGreaterThan(0.3);
    expect(Math.abs(share(honest, chatty) - share(fakes, chatty))).toBeLessThan(0.12);
    expect(share(honest, aside)).toBeGreaterThan(0.1);
    expect(Math.abs(share(honest, aside) - share(fakes, aside))).toBeLessThan(0.12);
  });

  it('shows the same face in the photo and the video, blinking', () => {
    for (const a of day) {
      expect(a.video.face).toEqual(a.photo);
      expect(a.video.blinked).toBe(true);
    }
  });

  it('gives birth years that fit the face in the photo', () => {
    const range = { young: [1996, 2006], adult: [1965, 1995], old: [1931, 1964] };
    for (const a of day) {
      const [earliest, latest] = range[a.photo.face.age];
      expect(a.birthYear).toBeGreaterThanOrEqual(earliest);
      expect(a.birthYear).toBeLessThanOrEqual(latest);
    }
  });
});

describe('remarks', () => {
  /** For each personal remark, what the applicant must look like (or where they must live) to say it. */
  const about = new Map<string, (a: GeneratedApplicant) => boolean>();
  const add = <K extends string>(pools: Partial<Record<K, readonly string[]>>, has: (a: GeneratedApplicant, key: K) => boolean) => {
    for (const [key, lines] of Object.entries(pools) as [K, readonly string[]][]) {
      for (const line of lines) about.set(line, (a) => has(a, key));
    }
  };
  add(REMARKS.age, (a, age) => a.photo.face.age === age);
  add(REMARKS.outfit, (a, outfit) => a.photo.outfit === outfit);
  add(REMARKS.accessory, (a, item) => a.photo.accessories.includes(item));
  add(REMARKS.facialHair, (a, hair) => a.photo.facialHair === hair);
  add(REMARKS.hair, (a, hair) => a.photo.hair === hair);
  add(REMARKS.hairColor, (a, color) => a.photo.hairColor === color);
  add(REMARKS.brows, (a, brows) => a.photo.face.brows === brows);
  add(REMARKS.mouth, (a, mouth) => a.photo.face.mouth === mouth);
  add(REMARKS.mark, (a, mark) => a.photo.face.mark === mark);
  add(REMARKS.street, (a, street) => a.address.includes(`${street},`));
  add(REMARKS.town, (a, town) => a.address.endsWith(`, ${town}`));
  const rumourDay = new Map(REMARKS.rumours.map(([from, line]) => [line, from]));
  /** The pool line a remark came from, with the birth year put back as "{year}". */
  const template = (a: GeneratedApplicant) => a.remark.replace(String(a.birthYear), '{year}');

  const week = seeds(20000).map((seed) => generateApplicant(seed, { fake: false, day: 1 + (seed % 7) }));
  const said = new Set(week.map(template));

  it('are about something the clerk can see, whenever they are personal', () => {
    for (const a of week) {
      const fits = about.get(template(a));
      if (fits) expect(fits(a), `${a.remark} (${a.name}, ${a.address})`).toBe(true);
    }
  });

  it('are personal about two times in three', () => {
    const personal = week.filter((a) => about.has(template(a))).length / week.length;
    expect(personal).toBeGreaterThan(0.5);
    expect(personal).toBeLessThan(0.8);
  });

  it('only pass on gossip from the day it can be heard', () => {
    week.forEach((a, i) => {
      const from = rumourDay.get(a.remark);
      if (from !== undefined) expect(from, a.remark).toBeLessThanOrEqual(1 + ((i + 1) % 7));
    });
  });

  it('can all come up', () => {
    const pools = [
      REMARKS.anyone,
      ...[REMARKS.age, REMARKS.outfit, REMARKS.accessory, REMARKS.facialHair, REMARKS.hair, REMARKS.hairColor,
        REMARKS.brows, REMARKS.mouth, REMARKS.mark, REMARKS.street, REMARKS.town].flatMap((p) => Object.values(p)),
      REMARKS.rumours.map(([, line]) => line),
    ];
    for (const line of pools.flat()) expect(said, line).toContain(line);
  });

  it('fill the year in for whoever mentions it', () => {
    const dated = week.filter((a) => template(a).includes('{year}'));
    expect(dated.length).toBeGreaterThan(0);
    for (const a of dated) expect(a.remark).not.toContain('{year}');
  });
});

describe('transcripts', () => {
  /** Greedy word wrap, as the browser does it in a monospace box. */
  const wrap = (text: string, width: number) =>
    text.split(' ').reduce<string[]>((lines, word) => {
      const last = lines[lines.length - 1];
      if (last !== undefined && `${last} ${word}`.length <= width) lines[lines.length - 1] = `${last} ${word}`;
      else lines.push(word);
      return lines;
    }, []);

  // game-design.md: at most two lines. The transcript box in desk.css is 60 characters wide.
  it('fit on two lines of the video strip', () => {
    const cast = Object.values(REGULARS).flatMap((r) => r.videos);
    const generated = day.map((a) => a.video.transcript);
    for (const line of [PHRASE, ...Object.values(PHRASE_MISTAKES).flat(), ...cast, ...generated]) {
      expect(wrap(line, 60).length, line).toBeLessThanOrEqual(2);
    }
  });
});
