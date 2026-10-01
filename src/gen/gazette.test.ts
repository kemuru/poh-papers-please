import { describe, expect, it } from 'vitest';
import { FIRST_UNIT } from '../content/cast';
import { HEADLINES, ROBOT_STORY, WALL_STAMPS } from '../content/gazette';
import { writeGazette, type CaseReport } from './gazette';
import { generatePortrait } from './portrait';

// Slice 4: a dismissed challenge registers the applicant, whatever they broke. By the next morning the
// court has risen, and the Gazette reports what was registered, not only what was stamped in, and
// puts a fake the jury missed down to the court, not to the clerk who challenged it.
const face = generatePortrait(1);
const human: CaseReport = { name: 'Ada Plain', face, unit: false, decision: 'accept', broke: [] };
const yesterday = (cases: CaseReport[]) => ({ day: 2, cases, sentHome: [] });
const lead = (cases: CaseReport[]) => writeGazette(3, yesterday(cases), []);

describe('the Gazette after the court', () => {
  const missedUnit: CaseReport = { name: 'Martin Ellery', face, unit: true, decision: 'challenge', broke: ['face'], upheld: false, removed: null };
  const missedFake: CaseReport = { name: 'Gordon Pim', face, unit: false, decision: 'challenge', broke: ['phrase'], upheld: false, removed: null };

  it('reports a fake the court registered, its challenge dismissed, as the court’s doing, by name and rule', () => {
    for (const missed of [missedUnit, missedFake]) {
      const gazette = lead([human, missed]);
      expect(HEADLINES.court).toContain(gazette.headlineLine);
      expect(gazette.headline).toContain(missed.name.toUpperCase());
      expect(gazette.headline).not.toMatch(/\{/);
    }
    expect(lead([human, missedFake]).headline).not.toBe(writeGazette(3, yesterday([human]), []).headline);
    // The one it is about is ringed on the photo, stamped as the court left it.
    const gazette = lead([human, missedFake]);
    expect(gazette.subject).toBe(missedFake.name);
    expect(gazette.wall.map((w) => `${w.name}: ${WALL_STAMPS[w.stamp]}`)).toEqual(['Ada Plain: Registered', 'Gordon Pim: By the court']);
  });

  it('still leads with a fake the clerk stamped in, before one the court let through', () => {
    const stampedIn: CaseReport = { ...missedUnit, decision: 'accept', upheld: undefined, removed: undefined };
    expect(HEADLINES.unit).toContain(lead([human, stampedIn, missedFake]).headlineLine);
    expect(HEADLINES.fake).toContain(lead([human, { ...missedFake, decision: 'accept', upheld: undefined, removed: undefined }, missedUnit]).headlineLine);
  });

  it('can print every unit headline: a unit registered every day prints each one, one a morning, days 3 to 7', () => {
    // A headline starts from the morning's day in its pool: with more lines than mornings, some line is never
    // reached. Day 2's paper is the day 1 unit's story.
    const stampedIn: CaseReport = { ...missedUnit, decision: 'accept', upheld: undefined, removed: undefined };
    const shown: string[] = [];
    for (let day = 3; day <= 7; day++) {
      const gazette = writeGazette(day, { day: day - 1, cases: [human, stampedIn], sentHome: [] }, shown);
      expect(HEADLINES.unit, `day ${day}`).toContain(gazette.headlineLine);
      shown.push(gazette.headlineLine);
    }
    expect(new Set(shown)).toEqual(new Set(HEADLINES.unit));
  });

  it('says a line of its own story again once that pool is spent, never a clean day that was not', () => {
    // Every court line already printed this run: the court's story still leads, and no "all human" line stands in for it.
    const gazette = writeGazette(7, yesterday([human, missedFake]), [...HEADLINES.court]);
    expect(HEADLINES.court).toContain(gazette.headlineLine);
    expect(gazette.headline).toContain(missedFake.name.toUpperCase());
  });

  it('never blames the window for a challenge the jury dismissed', () => {
    const window = /WINDOW 3 REGISTERS|NOT CONSULTED|READ BY NOBODY/;
    for (const line of HEADLINES.court) expect(line).not.toMatch(window);
  });

  it('still reads an upheld challenge as nothing registered, and a dismissed one on a human as a human in court', () => {
    const refused: CaseReport = { name: 'Owen Selfe', face, unit: false, decision: 'challenge', broke: ['vouch'], upheld: true, removed: null };
    expect(HEADLINES.clean).toContain(lead([human, refused]).headlineLine);
    const wronged: CaseReport = { name: 'Bea Real', face, unit: false, decision: 'challenge', broke: [], upheld: false, removed: null };
    expect(HEADLINES.human).toContain(lead([human, wronged]).headlineLine);
  });

  it('shows a voucher removed with a sybil right after them, and whoever the clock sent home last', () => {
    const voucherFace = generatePortrait(2);
    const sybil: CaseReport = { name: 'Owen Selfe', face, unit: false, decision: 'challenge', broke: ['duplicate'], upheld: true, removed: 'Vera Voucher', removedFace: voucherFace };
    const g = writeGazette(3, { day: 2, cases: [human, sybil], sentHome: [{ name: 'Late Larry', face }] }, []);
    expect(g.wall.map((w) => `${w.name}: ${w.stamp}`)).toEqual(['Ada Plain: registered', 'Owen Selfe: refused', 'Vera Voucher: removed', 'Late Larry: home']);
    expect(g.wall[2].face).toBe(voucherFace);
    expect(g.caption).toBe('Window 3, day 2: 1 registered, 1 refused. 1 sent home at five.');
  });
});

describe('the morning Rule 2 comes in', () => {
  it("reprints day 1's unit, registered by the stamp or by the court, and says what it was", () => {
    const unit = (decision: 'accept' | 'challenge'): CaseReport => ({ name: FIRST_UNIT.name, face, unit: true, decision, broke: [], ...(decision === 'challenge' ? { upheld: false, removed: null } : {}) });
    const stamped = writeGazette(2, { day: 1, cases: [human, unit('accept')], sentHome: [] }, []);
    expect(stamped).toMatchObject({ robot: true, wall: [], headline: ROBOT_STORY.headline, subject: FIRST_UNIT.name });
    expect(stamped.caption).toContain(FIRST_UNIT.name);
    expect(writeGazette(2, { day: 1, cases: [human, unit('challenge')], sentHome: [] }, []).headline).toBe(ROBOT_STORY.challenged);
    // A week begun on day 2 still gets the Ministry's news.
    expect(writeGazette(2, null, []).headline).toBe(ROBOT_STORY.headline);
  });
});
