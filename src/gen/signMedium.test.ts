import { describe, expect, it } from 'vitest';
import { ON_PAPER } from '../content/applicants';
import type { GeneratedApplicant } from './applicant';
import { generateWeek } from './day';

// From day 3 everyone holds their wallet address up in the video, on paper or on a phone's screen.
// Both are allowed (Rule 3), and the registry's app suggests the phone, so about half use one: the
// honest and the fakes alike, the units too. Only Pat's laminated sign on day 3 is fixed, on paper.
const WEEKS = Array.from({ length: 300 }, (_, i) => generateWeek(i + 1));
const valid = (a: GeneratedApplicant) => a.planted.length === 0;
/** How someone holds their address up; null if they hold up something else, or nothing. */
const medium = (a: GeneratedApplicant) => (a.video.sign?.kind === 'address' ? (a.video.sign.phone ? 'phone' : 'paper') : null);
/** Everyone holding an address up on day `day`, over the 300 weeks. */
const holders = (day: number) => WEEKS.flatMap((week) => week[day - 1]).filter((a) => medium(a) !== null);
const SIGN_DAYS = [3, 4, 5, 6, 7];
const share = (people: GeneratedApplicant[], keep: (a: GeneratedApplicant) => boolean) => people.filter(keep).length / people.length;
const onPhone = (a: GeneratedApplicant) => medium(a) === 'phone';
/** How much likelier someone on a phone is to be valid than someone on paper, in points out of 1. */
const gap = (people: GeneratedApplicant[]) => share(people.filter(onPhone), valid) - share(people.filter((a) => !onPhone(a)), valid);
/** The one fake whose medium the script fixes: Pat's laminated sign on day 3. */
const scripted = (a: GeneratedApplicant, day: number) => day === 3 && a.cast === 'pat';

describe('the sign: paper or phone', () => {
  it('holds the address up on a phone about as often as on paper from day 3: 40 to 60% of address signs, every day', () => {
    for (const day of SIGN_DAYS) {
      const phones = share(holders(day), onPhone);
      expect(phones, `day ${day}`).toBeGreaterThanOrEqual(0.4);
      expect(phones, `day ${day}`).toBeLessThanOrEqual(0.6);
    }
  });

  // Over seeds 1 to 2100, in windows of 300 weeks, no day's gap was over 3.1 points, nor the week's
  // over 1.3. A draw that gave the honest a phone at 55% and the fakes at 45% was 6.7 to 9 points apart
  // on days 4 to 7, and 7.6 over the week.
  // Pat's laminated sign on day 3 is the script's, and the clerk knows Pat by name and face: left aside.
  it('lets no phone say whether the papers are good: the valid share on a phone and on paper is within 5 points, over the week and each day', () => {
    const drawn = (day: number) => holders(day).filter((a) => !scripted(a, day));
    const week = SIGN_DAYS.flatMap(drawn);
    expect(week.filter((a) => !valid(a)).length).toBeGreaterThan(1000);
    expect(Math.abs(gap(week))).toBeLessThan(0.05);
    for (const day of SIGN_DAYS) expect(Math.abs(gap(drawn(day))), `day ${day}`).toBeLessThan(0.05);
  });

  it('gives the fakes a phone as often as the honest: the phone share of each is within 5 points over the week, Pat’s day 3 sign aside', () => {
    const week = SIGN_DAYS.flatMap((day) => holders(day).filter((a) => !scripted(a, day)));
    const honest = share(week.filter(valid), onPhone);
    const fakes = share(week.filter((a) => !valid(a)), onPhone);
    expect(week.filter((a) => !valid(a)).length).toBeGreaterThan(1000);
    expect(Math.abs(honest - fakes), `honest ${honest}, fakes ${fakes}`).toBeLessThan(0.05);
  });

  it('puts both media among the Rule 3 offenders, and in the hands of the look-alike one character out', () => {
    const everyone = SIGN_DAYS.flatMap(holders);
    for (const mistake of ['two-wrong', 'wrong-address'] as const) {
      const offenders = everyone.filter((a) => a.planted.some((p) => p.rule === 'sign' && p.mistake === mistake));
      expect(new Set(offenders.map(medium)), mistake).toEqual(new Set(['paper', 'phone']));
    }
    const oneOut = everyone.filter((a) => a.lookAlike?.rule === 'sign' && a.lookAlike.kind === 'one-wrong');
    expect(new Set(oneOut.map(medium))).toEqual(new Set(['paper', 'phone']));
  });

  it('gives the same medium for the same seed', () => {
    const media = (seed: number) => generateWeek(seed).map((queue) => queue.map((a) => medium(a)));
    for (const seed of [1, 2, 7, 40, 123456]) expect(media(seed)).toEqual(media(seed));
    expect(media(1)).not.toEqual(media(2));
  });

  it('hands paper to whoever says they copied the address out, unless they are the phone look-alike', () => {
    const said = SIGN_DAYS.flatMap(holders).filter((a) => ON_PAPER.includes(a.remark));
    const free = said.filter((a) => !(a.lookAlike?.rule === 'sign' && a.lookAlike.kind === 'phone'));
    expect(free.length).toBeGreaterThan(10);
    expect(new Set(free.map(medium))).toEqual(new Set(['paper']));
  });

  it("gives day 3's unit the same draw as anyone, and Pat the laminated sign Pat promised", () => {
    const units = WEEKS.map((week) => week[2].find((a) => a.cast === 'unit')!);
    expect(share(units, onPhone)).toBeGreaterThan(0.4);
    expect(share(units, onPhone)).toBeLessThan(0.6);
    for (const week of WEEKS) expect(medium(week[2].find((a) => a.cast === 'pat')!)).toBe('paper');
  });

  // The clerk knows Pat by name and face from days 1 and 2; set Pat aside and the only fake left on day
  // 3 is the unit. When its phone was fixed by the script, nobody on paper that day was a fake.
  it('leaves no lean on day 3 either, Pat aside: the unit is as likely on paper as on a phone', () => {
    const day3 = holders(3).filter((a) => a.cast !== 'pat');
    const fakes = day3.filter((a) => !valid(a));
    const units = fakes.filter((a) => a.cast === 'unit');
    expect(units.length).toBe(WEEKS.length);
    // The day's other fakes are ordinary people who got something else wrong, holding their address up like anyone.
    expect(new Set(fakes.map((a) => a.cast))).toEqual(new Set(['unit', null]));
    expect(new Set(units.map(medium))).toEqual(new Set(['paper', 'phone']));
    expect(Math.abs(gap(day3))).toBeLessThan(0.05);
  });
});
