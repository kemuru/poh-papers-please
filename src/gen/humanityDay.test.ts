import { describe, expect, it } from 'vitest';
import { CLERK, FIRST_APPLICANT, PAT, RENEWAL, UNIT_OWNERS } from '../content/cast';
import { CLONE_PORTRAIT, UNIT_FACES } from '../content/portraits';
import { litFrames } from '../rules/face';
import { judge, rulebookForDay } from '../rules/judge';
import { findName, remove } from '../rules/registry';
import type { Registrant } from '../rules/types';
import type { GeneratedApplicant } from './applicant';
import { LAST_DAY, morning, planWeek } from './day';

// notes/game-design.md, Humanity Day (slice 5): the week comes back to the window. Judged, as the desk
// judges, against the registry each applicant finds there; `planted` describes correct play, and the
// last tests change that registry the way a clerk's mistakes would.
const SEEDS = Array.from({ length: 100 }, (_, i) => i + 1);
const weeks = SEEDS.map((seed) => ({ seed, plan: planWeek(seed) }));
const day7 = weeks.map(({ seed, plan }) => ({ seed, plan, queue: plan.queues[LAST_DAY - 1], seen: plan.seen[LAST_DAY - 1] }));
const visible = ({ planted, cast, lookAlike, ...a }: GeneratedApplicant) => a;
const rules = (a: GeneratedApplicant, registry: readonly Registrant[]) => judge(visible(a), rulebookForDay(LAST_DAY), registry).violations.map((v) => v.rule);

describe('Humanity Day', () => {
  it('queues seven: the unit in the first half, the Binnses one after the other, one slip of the tongue, and last the clerk', () => {
    for (const { seed, queue } of day7) {
      expect(queue, `seed ${seed}`).toHaveLength(7);
      const unit = queue.findIndex((a) => a.cast === 'unit');
      expect(unit, `seed ${seed}`).toBeLessThan(queue.length / 2);
      const wendell = queue.findIndex((a) => a.name === UNIT_OWNERS[0].name);
      expect(queue[wendell + 1].name, `seed ${seed}`).toBe(UNIT_OWNERS[1].name);
      expect(queue[6]).toMatchObject({ name: CLERK.name, cast: 'clerk' });
      // The clerk aside, the queue is four in six valid; the other fake is an ordinary slip of the tongue.
      const six = queue.slice(0, 6);
      expect(six.filter((a) => a.planted.length === 0), `seed ${seed}`).toHaveLength(4);
      expect(six.filter((a) => a.cast === null && a.planted[0]?.rule === 'phrase'), `seed ${seed}`).toHaveLength(1);
    }
  });

  it('sends the last unit with a lit slit in its one blink frame, and papers that pass Rules 1 to 6', () => {
    for (const { seed, queue, seen } of day7) {
      const i = queue.findIndex((a) => a.cast === 'unit');
      const unit = queue[i];
      expect(unit.photo).toEqual(UNIT_FACES[6]);
      expect(unit.video.lamp).toBe('slit');
      expect(litFrames(unit.video), `seed ${seed}`).toEqual([3]);
      expect(unit.planted).toEqual([{ rule: 'human', mistake: 'machine' }]);
      expect(rules(unit, seen[i]), `seed ${seed}`).toEqual(['human']);
      // Vouched for by someone ordinary and registered: nothing on the form says "unit".
      expect(unit.voucher && findName(seen[i], unit.voucher), `seed ${seed}`).toBeTruthy();
    }
  });

  it('has the clerk say "a real clerk", vouched for by the week\'s first registration when her vouch is free, breaking Rule 1 only', () => {
    let hortense = 0;
    for (const { seed, queue, seen } of day7) {
      const clerk = queue[6];
      expect(clerk.video.transcript).toBe(RENEWAL.video);
      expect(clerk.photo).toEqual(CLERK.face);
      expect(clerk.planted).toEqual([{ rule: 'phrase', mistake: 'wrong-word' }]);
      expect(rules(clerk, seen[6]), `seed ${seed}`).toEqual(['phrase']);
      const heard = judge(visible(clerk), rulebookForDay(LAST_DAY), seen[6]).violations[0];
      expect(heard.rule === 'phrase' && heard.heard.filter((m) => !m.ok).map((m) => m.word)).toEqual(['clerk']);
      if (clerk.voucher === FIRST_APPLICANT.name) hortense++;
      else expect(findName(seen[6], FIRST_APPLICANT.name), `seed ${seed}: Hortense is registered, so she vouches`).toBeNull();
    }
    expect(hortense).toBeGreaterThan(SEEDS.length / 2);
  });

  it("drops the clerk's own registration that morning, and keeps a Robin Hale registered this week", () => {
    for (const { seed, plan } of weeks.slice(0, 10)) {
      expect(findName(plan.mornings[5], CLERK.name), `seed ${seed}, day 6`).not.toBeNull();
      expect(findName(plan.mornings[6], CLERK.name), `seed ${seed}, day 7`).toBeNull();
      const clone: Registrant = { name: CLERK.name, address: CLERK.address, birthYear: CLERK.birthYear, face: CLONE_PORTRAIT, day: 6, vouching: null };
      const kept = morning([...plan.mornings[5], clone], LAST_DAY).filter((r) => r.name === CLERK.name);
      expect(kept).toEqual([clone]);
    }
  });

  it('makes the clerk a duplicate as well, if the clerk registered the clone on day 6', () => {
    for (const { seed, queue, seen } of day7.slice(0, 20)) {
      const clone: Registrant = { name: CLERK.name, address: CLERK.address, birthYear: CLERK.birthYear, face: CLONE_PORTRAIT, day: 6, vouching: null };
      expect(rules(queue[6], [...seen[6], clone]), `seed ${seed}`).toEqual(['phrase', 'duplicate']);
    }
  });

  it('brings the Binnses back with the faces the registry had for them: valid once removed, a face on file if their unit was let in', () => {
    for (const { seed, plan, queue, seen } of day7) {
      for (const [k, owner] of UNIT_OWNERS.entries()) {
        const i = queue.findIndex((a) => a.name === owner.name);
        const a = queue[i];
        const record = plan.mornings[0].find((r) => r.name === owner.name)!;
        expect(a.photo, `seed ${seed}: ${owner.name}`).toEqual(record.face);
        expect(a.photo.face.age).toBe('old');
        expect(a.planted).toEqual([]);
        expect(rules(a, seen[i]), `seed ${seed}: ${owner.name}`).toEqual([]);
        // The clerk let their unit in, so the court never removed them: they are still on file.
        expect(rules(a, [...seen[i], record]), `seed ${seed}: ${owner.name}`).toContain('duplicate');
        if (k === 1) expect(a.voucher).toBe(UNIT_OWNERS[0].name);
      }
    }
  });

  it('keeps Pat on the registry to the end: registered at last, Pat vouches for nobody, so no upheld challenge takes Pat off', () => {
    for (let seed = 1; seed <= 300; seed++) {
      const plan = planWeek(seed);
      expect(findName(plan.mornings[6], PAT.name), `seed ${seed}`).not.toBeNull();
      expect(plan.queues.flat().filter((a) => a.voucher === PAT.name), `seed ${seed}`).toEqual([]);
    }
  });

  it('never gives a Binns an old face somebody else already has (seed 6832 gave Vera Ethel’s)', () => {
    for (const seed of [6832, ...SEEDS.slice(0, 20)]) {
      const plan = planWeek(seed);
      const day7 = plan.queues[LAST_DAY - 1];
      for (const owner of UNIT_OWNERS) {
        const i = day7.findIndex((a) => a.name === owner.name);
        expect(rules(day7[i], plan.seen[LAST_DAY - 1][i]), `seed ${seed}: ${owner.name}`).toEqual([]);
      }
    }
  });

  it("gives Vera a good vouch only if Wendell was registered at the window before her", () => {
    for (const { seed, queue, seen } of day7) {
      const i = queue.findIndex((a) => a.name === UNIT_OWNERS[1].name);
      expect(findName(seen[i], UNIT_OWNERS[0].name), `seed ${seed}`).not.toBeNull();
      // Challenged, Wendell is registered by the court at five, which is after Vera.
      expect(rules(queue[i], remove(seen[i], UNIT_OWNERS[0].name)), `seed ${seed}`).toEqual(['vouch']);
    }
  });
});
