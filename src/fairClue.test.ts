import { describe, expect, it } from 'vitest';
import { PHRASE_MISTAKES } from './content/applicants';
import { generateApplicant } from './gen/applicant';
import { judge, rulebookForDay } from './rules/judge';
import { PHRASE } from './rules/phrase';
import type { Applicant, RuleId } from './rules/types';

// acceptance.md, fair clue check: every planted violation shows as a difference in data the
// player can see, so every mistake is the player's fault, never the game's.
// A new rule without a clue here fails the typecheck.
const words = (text: string) => text.toLowerCase().split(/[^a-z0-9']+/).filter(Boolean).join(' ');
const CLUES: Record<RuleId, (a: Applicant) => boolean> = {
  // The transcript under the video strip and the phrase printed in the rulebook differ by at least one word.
  phrase: (a) => words(a.video.transcript) !== words(PHRASE),
};

const applicants = Array.from({ length: 500 }, (_, i) => generateApplicant(i + 1));

describe('fair clue check', () => {
  it('shows every planted violation in the UI data', () => {
    for (const a of applicants) {
      for (const p of a.planted) expect(CLUES[p.rule](a), `${a.name}: ${p.mistake}`).toBe(true);
    }
  });

  it('shows no clue when nothing was planted', () => {
    for (const a of applicants.filter((x) => x.planted.length === 0)) {
      for (const rule of Object.keys(CLUES) as RuleId[]) expect(CLUES[rule](a)).toBe(false);
    }
  });

  it('gives a clue for every line the generator can plant', () => {
    const [template] = applicants;
    for (const line of Object.values(PHRASE_MISTAKES).flat()) {
      expect(CLUES.phrase({ ...template, video: { ...template.video, transcript: line } }), line).toBe(true);
    }
  });

  it('highlights at least one word in every citation', () => {
    for (const a of applicants) {
      for (const v of judge(a, rulebookForDay(1), []).violations) {
        expect([...v.heard, ...v.expected].some((m) => !m.ok)).toBe(true);
      }
    }
  });
});
