import { describe, expect, it } from 'vitest';
import { HEADLINES } from '../content/gazette';
import { writeGazette, type CaseReport } from './gazette';

// Slice 4: a dismissed challenge registers the applicant, whatever they broke. By the next morning the
// court has risen, and the Gazette reports what was registered, not only what was stamped in, and
// puts a fake the jury missed down to the court, not to the clerk who challenged it.
const human: CaseReport = { name: 'Ada Plain', unit: false, decision: 'accept', broke: [] };
const yesterday = (cases: CaseReport[]) => ({ day: 2, cases, unprocessed: 0 });
const lead = (cases: CaseReport[]) => writeGazette(3, yesterday(cases), []);

describe('the Gazette after the court', () => {
  const missedUnit: CaseReport = { name: 'Martin Ellery', unit: true, decision: 'challenge', broke: ['human'], upheld: false, removed: null };
  const missedFake: CaseReport = { name: 'Clara Voss', unit: false, decision: 'challenge', broke: ['phrase'], upheld: false, removed: null };

  it('reports a fake the court registered, its challenge dismissed, as the court’s doing, by name and rule', () => {
    for (const missed of [missedUnit, missedFake]) {
      const gazette = lead([human, missed]);
      expect(HEADLINES.court).toContain(gazette.headlineLine);
      expect(gazette.headline).toContain(missed.name.toUpperCase());
      expect(gazette.headline).not.toMatch(/\{/);
    }
    expect(lead([human, missedFake]).headline).not.toBe(writeGazette(3, yesterday([human]), []).headline);
  });

  it('still leads with a fake the clerk stamped in, before one the court let through', () => {
    const stampedIn: CaseReport = { ...missedUnit, decision: 'accept', upheld: undefined, removed: undefined };
    expect(HEADLINES.unit).toContain(lead([human, stampedIn, missedFake]).headlineLine);
    expect(HEADLINES.fake).toContain(lead([human, { ...missedFake, decision: 'accept', upheld: undefined, removed: undefined }, missedUnit]).headlineLine);
  });

  it('never blames the window for a challenge the jury dismissed', () => {
    const window = /WINDOW 3 REGISTERS|NOT CONSULTED|READ BY NOBODY/;
    for (const line of HEADLINES.court) expect(line).not.toMatch(window);
  });

  it('still reads an upheld challenge as nothing registered, and a dismissed one on a human as a human in court', () => {
    const refused: CaseReport = { name: 'Owen Selfe', unit: false, decision: 'challenge', broke: ['vouch'], upheld: true, removed: null };
    expect(HEADLINES.clean).toContain(lead([human, refused]).headlineLine);
    const wronged: CaseReport = { name: 'Bea Real', unit: false, decision: 'challenge', broke: [], upheld: false, removed: null };
    expect(HEADLINES.human).toContain(lead([human, wronged]).headlineLine);
  });
});
