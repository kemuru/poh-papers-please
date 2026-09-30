import { describe, expect, it } from 'vitest';
import { planWeek } from '../gen/day';
import { generatePortrait } from '../gen/portrait';
import { inspect, type Item } from './inspect';
import { rulebookForDay } from './judge';
import { PHRASE } from './phrase';
import type { Applicant, Registrant, Registry, Rulebook } from './types';

// acceptance.md, slice 3: inspect mode. Two things that disagree name the rule they break; two
// things that agree name nothing.
const WALLET = '0x3F9A2B71C0DE5E1F88A04B6D9C3E7A1B2F40C21E';
const face = generatePortrait(1);
const voucher: Registrant = { name: 'Vera Voucher', address: '', birthYear: 1950, face: generatePortrait(2), day: 0, vouching: null };
const onFile: Registrant = { ...voucher, name: 'Otto Onfile', face: generatePortrait(4) };
const REGISTRY: Registry = [voucher, onFile];
const valid = (over: Partial<Applicant> = {}, video: Partial<Applicant['video']> = {}): Applicant => ({
  name: 'Ada Test',
  address: '1 Test Street',
  birthYear: 1980,
  photo: face,
  video: { face, transcript: PHRASE, blinked: true, sign: { kind: 'address', text: WALLET }, ...video },
  remark: '',
  wallet: WALLET,
  voucher: voucher.name,
  ...over,
});

/** Everything on the desk that can be pointed at for this applicant, today. */
const itemsFor = (a: Applicant, rulebook: Rulebook): Item[] => [
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
const pairs = (items: Item[]) => items.flatMap((x, i) => items.slice(i + 1).map((y) => [x, y] as const));

const ALL = rulebookForDay(6);

describe('inspect', () => {
  const cases: [string, Applicant, Item, Item, string][] = [
    ['a word wrong', valid({}, { transcript: PHRASE.replace('human', 'hooman') }), { kind: 'transcript' }, { kind: 'rule', rule: 'phrase' }, 'phrase'],
    ['someone else in the photo', valid({ photo: generatePortrait(50) }), { kind: 'photo' }, { kind: 'frame', frame: 2 }, 'face'],
    ['a mirror selfie', valid({ mirrored: true }), { kind: 'frame', frame: 1 }, { kind: 'photo' }, 'face'],
    ['ears that change', valid({}, { glitch: { frame: 3, face: { ...face, face: { ...face.face, ears: 'big' } } } }), { kind: 'frame', frame: 1 }, { kind: 'frame', frame: 3 }, 'face'],
    ['the photo against the frame where the ears change', valid({}, { glitch: { frame: 2, face: { ...face, face: { ...face.face, ears: 'big' } } } }), { kind: 'photo' }, { kind: 'frame', frame: 2 }, 'face'],
    ['a light between the brows with the eyes shut', valid({}, { lamp: 'glow' }), { kind: 'frame', frame: 3 }, { kind: 'rule', rule: 'face' }, 'face'],
    ['the lit frame against a dark one', valid({}, { lamp: 'small' }), { kind: 'frame', frame: 1 }, { kind: 'frame', frame: 3 }, 'face'],
    ['the photo against the lit frame', valid({}, { lamp: 'bloom' }), { kind: 'photo' }, { kind: 'frame', frame: 3 }, 'face'],
    ['a generated video', valid({}, { generated: true }), { kind: 'rule', rule: 'living' }, { kind: 'frame', frame: 3 }, 'living'],
    ['a printed face held up', valid({}, { still: true, blinked: false }), { kind: 'frame', frame: 1 }, { kind: 'rule', rule: 'living' }, 'living'],
    ['two frames of a printed face, exactly alike', valid({}, { still: true, blinked: false }), { kind: 'frame', frame: 1 }, { kind: 'frame', frame: 3 }, 'living'],
    ['two characters wrong', valid({}, { sign: { kind: 'address', text: WALLET.replace('3F9A', '3E9B') } }), { kind: 'sign' }, { kind: 'wallet' }, 'sign'],
    ['a QR code', valid({}, { sign: { kind: 'qr' } }), { kind: 'rule', rule: 'sign' }, { kind: 'sign' }, 'sign'],
    ['vouched by themselves', valid({ voucher: 'Ada Test' }), { kind: 'voucher' }, { kind: 'name' }, 'vouch'],
    ['a voucher not registered', valid({ voucher: 'Maureen Notyet' }), { kind: 'voucher' }, { kind: 'name-record', name: 'Maureen Notyet' }, 'vouch'],
    ['a face on file', valid({ photo: onFile.face }, { face: onFile.face }), { kind: 'face-record' }, { kind: 'photo' }, 'duplicate'],
    ['born 470 BC', valid({ birthYear: -470 }), { kind: 'birth-year' }, { kind: 'rule', rule: 'living' }, 'living'],
    ['no blink', valid({}, { blinked: false }), { kind: 'rule', rule: 'living' }, { kind: 'frame', frame: 2 }, 'living'],
  ];

  it.each(cases)('names the rule when two things disagree: %s', (_, a, x, y, rule) => {
    expect(inspect(x, y, a, ALL, REGISTRY)).toEqual({ rule, inForce: true });
    // The same two things on an applicant with nothing wrong agree.
    expect(inspect(x, y, valid(), ALL, REGISTRY)).toBeNull();
  });

  it("finds a unit's lamp only in the frames it is lit in, and only under Rule 2", () => {
    const unit = valid({}, { lamp: 'glow' });
    const frame = (n: number): Item => ({ kind: 'frame', frame: n });
    // Frames 1 and 2 are dark: the eyes are open.
    expect(inspect(frame(1), frame(2), unit, ALL, REGISTRY)).toBeNull();
    expect(inspect({ kind: 'photo' }, frame(2), unit, ALL, REGISTRY)).toBeNull();
    // It did blink: Rule 6 has nothing against frame 3.
    expect(inspect(frame(3), { kind: 'rule', rule: 'living' }, unit, ALL, REGISTRY)).toBeNull();
    // Shut twice, lit twice: each lit frame shows it under Rule 2, and the dark one between does not.
    const twice = valid({}, { lamp: 'glow', nervous: true });
    expect(inspect(frame(1), frame(3), twice, ALL, REGISTRY)).toEqual({ rule: 'face', inForce: true });
    for (const n of [1, 3]) expect(inspect(frame(n), { kind: 'rule', rule: 'face' }, twice, ALL, REGISTRY), `frame ${n}`).toEqual({ rule: 'face', inForce: true });
    expect(inspect(frame(2), { kind: 'rule', rule: 'face' }, twice, ALL, REGISTRY)).toBeNull();
  });

  it('finds nothing when two things agree, whichever two', () => {
    for (const [x, y] of pairs(itemsFor(valid(), ALL))) expect(inspect(x, y, valid(), ALL, REGISTRY), `${x.kind} × ${y.kind}`).toBeNull();
  });

  it('says so when two things disagree but no rule covers it yet', () => {
    expect(inspect({ kind: 'photo' }, { kind: 'frame', frame: 1 }, valid({ photo: generatePortrait(50) }), rulebookForDay(1), REGISTRY)).toEqual({
      rule: 'face',
      inForce: false,
    });
    // Day 1's unit: its light shows, and no rule reads a face until day 2.
    expect(inspect({ kind: 'frame', frame: 3 }, { kind: 'frame', frame: 1 }, valid({}, { lamp: 'bloom' }), rulebookForDay(1), REGISTRY)).toEqual({
      rule: 'face',
      inForce: false,
    });
  });

  it('only reads a registry record against the voucher it was looked up for', () => {
    const a = valid({ voucher: 'Maureen Notyet' });
    expect(inspect({ kind: 'voucher' }, { kind: 'name-record', name: 'Someone Else' }, a, ALL, REGISTRY)).toBeNull();
  });

  it('can catch every fault the generator plants with two things on the desk, and finds none on anyone valid', () => {
    for (let seed = 1; seed <= 40; seed++) {
      const week = planWeek(seed);
      week.queues.forEach((queue, d) => {
        const rulebook = rulebookForDay(d + 1);
        queue.forEach((a, n) => {
          const registry = week.seen[d][n];
          const found = pairs(itemsFor(a, rulebook))
            .map(([x, y]) => inspect(x, y, a, rulebook, registry))
            .filter((f) => f?.inForce)
            .map((f) => f!.rule);
          const who = `seed ${seed}, day ${d + 1}, ${a.name}`;
          if (a.planted.length > 0) expect(new Set(found), who).toEqual(new Set(a.planted.map((p) => p.rule)));
          else expect(found, `${who}${a.lookAlike ? ` (${a.lookAlike.kind})` : ''}`).toEqual([]);
        });
      });
    }
  });
});
