import { describe, expect, it } from 'vitest';
import { morning } from '../gen/day';
import { generatePortrait } from '../gen/portrait';
import { decide, judge, rulebookForDay } from '../rules/judge';
import { PHRASE } from '../rules/phrase';
import { atWindow, findFace, findName, freeVouches } from '../rules/registry';
import type { Applicant, Registrant, Registry } from '../rules/types';
import { hearChallenges, playDay, stamp } from './court';

// acceptance.md, slice 3: the registry lookup, the registry that remembers, and challenges, which
// name no rule: the court finds whatever is wrong.
const WALLET = '0x3F9A2B71C0DE5E1F88A04B6D9C3E7A1B2F40C21E';
const ethel: Registrant = { name: 'Ethel Pargeter', address: '3 Rubber Stamp Mews', birthYear: 1922, face: generatePortrait(2), day: 1, vouching: null };
const REGISTRY: Registry = [ethel];
const person = (name: string, seed: number, over: Partial<Applicant> = {}): Applicant => {
  const face = generatePortrait(seed);
  return {
    name,
    address: `${seed} Test Street`,
    birthYear: 1980,
    photo: face,
    video: { face, transcript: PHRASE, blinked: true, sign: { kind: 'address', text: WALLET } },
    remark: '',
    wallet: WALLET,
    voucher: ethel.name,
    ...over,
  };
};

describe('registry lookup', () => {
  it('finds a voucher by name, however it is typed, and says whether they are already vouching for someone', () => {
    expect(findName(REGISTRY, '  ethel   PARGETER ')?.name).toBe('Ethel Pargeter');
    expect(findName(REGISTRY, 'Maureen Oakes')).toBeNull();
    const first = person('Bridget First', 10);
    const after = atWindow(REGISTRY, first);
    expect(findName(after, 'Ethel Pargeter')?.vouching).toBe('Bridget First');
    // The second of her bridge club today finds her busy, and the rulebook says so.
    const second = person('Clara Second', 11);
    expect(judge(second, rulebookForDay(4), after).violations).toEqual([
      { rule: 'vouch', voucher: 'Ethel Pargeter', problem: 'busy', vouchingFor: 'Bridget First' },
    ]);
    // Tomorrow her vouch is free again.
    expect(findName(freeVouches(after), 'Ethel Pargeter')?.vouching).toBeNull();
  });

  it('finds a duplicate by face, whatever hat or haircut it comes back in', () => {
    const face = generatePortrait(20);
    const registry = [...REGISTRY, { ...ethel, name: 'Dora Once', face, day: 2 }];
    expect(findFace(registry, { ...face, hair: 'mohawk', accessories: ['flat-cap'] }).map((r) => r.name)).toEqual(['Dora Once']);
    expect(findFace(registry, generatePortrait(21))).toEqual([]);
  });
});

describe('the registry remembers', () => {
  it('finds someone accepted earlier in the week, days later', () => {
    const dora = person('Dora Early', 30);
    let registry = stamp(REGISTRY, 1, dora, 'accept').registry;
    for (let day = 2; day <= 5; day++) registry = morning(registry, day);
    expect(findName(registry, 'Dora Early')).toMatchObject({ name: 'Dora Early', day: 1 });
    expect(findFace(registry, dora.video.face).map((r) => r.name)).toEqual(['Dora Early']);
  });

  it('removes the voucher with an applicant whose challenge is upheld, and registers one whose challenge is dismissed', () => {
    const fake = person('Fergus Fake', 40, { birthYear: 1850 });
    const human = person('Hilda Human', 41, { voucher: 'Dora Early' });
    let registry: Registry = [...REGISTRY, { ...ethel, name: 'Dora Early', face: generatePortrait(30) }];
    const f = stamp(registry, 6, fake, 'challenge');
    registry = f.registry;
    const h = stamp(registry, 6, human, 'challenge');
    registry = h.registry;
    const heard = hearChallenges(registry, 6, [
      { applicant: fake, outcome: f.outcome },
      { applicant: human, outcome: h.outcome },
    ]);
    expect(heard.hearings).toEqual([
      { upheld: true, removed: 'Ethel Pargeter' },
      { upheld: false, removed: null },
    ]);
    expect(findName(heard.registry, 'Ethel Pargeter')).toBeNull();
    expect(findName(heard.registry, 'Hilda Human')).toMatchObject({ day: 6 });
    // Whoever Ethel would have vouched for tomorrow now has an unregistered voucher.
    expect(judge(person('Ivy Tomorrow', 42), rulebookForDay(6), morning(heard.registry, 7)).violations.map((v) => v.rule)).toEqual(['vouch']);
  });
});

describe('a challenge names no rule', () => {
  const selfVouched = person('Owen Selfe', 50, { voucher: 'Owen Selfe' });

  it('is upheld when the applicant broke any rule in force, and the court has every rule they broke', () => {
    const judgment = judge(selfVouched, rulebookForDay(4), REGISTRY);
    expect(decide('challenge', judgment)).toEqual({ correct: true, violations: judgment.violations });
    expect(judgment.violations.map((v) => v.rule)).toEqual(['vouch']);
    // Nothing broken: the challenge is wrong.
    expect(decide('challenge', judge(person('Ada Fine', 51), rulebookForDay(4), REGISTRY)).correct).toBe(false);
  });

  it('names every rule broken when there is more than one, as with a generated video that holds up a QR code', () => {
    const base = person('Alex Test', 52);
    const agent: Applicant = { ...base, video: { ...base.video, generated: true, sign: { kind: 'qr' } } };
    const judgment = judge(agent, rulebookForDay(4), REGISTRY);
    expect(judgment.violations.map((v) => v.rule)).toEqual(['human', 'sign']);
    expect(decide('challenge', judgment)).toEqual({ correct: true, violations: judgment.violations });
    expect(playDay(REGISTRY, 4, [agent], ['challenge']).outcomes[0].violations.map((v) => v.rule)).toEqual(['human', 'sign']);
  });

  it('refuses the applicant who broke a rule, and registers the one who broke none (the deposit is the economy’s: economy.test.ts)', () => {
    const played = playDay(REGISTRY, 4, [selfVouched, person('Ada Fine', 51)], ['challenge', 'challenge']);
    expect(played.outcomes.map((o) => o.correct)).toEqual([true, false]);
    expect(played.hearings).toEqual([
      { upheld: true, removed: null },
      { upheld: false, removed: null },
    ]);
    expect(findName(played.registry, 'Owen Selfe')).toBeNull();
    expect(findName(played.registry, 'Ada Fine')).not.toBeNull();
  });
});
