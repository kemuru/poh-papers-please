import { describe, expect, it } from 'vitest';
import { PHRASE_MISTAKES } from './content/applicants';
import { GARY_DAYS } from './content/cast';
import { generateWeek } from './gen/day';
import { judge, rulebookForDay } from './rules/judge';
import { PHRASE } from './rules/phrase';
import type { Applicant, RuleId } from './rules/types';

// acceptance.md, fair clue check: every planted violation shows as a difference in data the
// player can see, so every mistake is the player's fault, never the game's.
// A new rule without a clue here fails the typecheck.
const words = (text: string) => text.toLowerCase().split(/[^a-z0-9']+/).filter(Boolean);
/** The words the rulebook prints in bold: the phrase without its small words. */
const BOLD = words(PHRASE).filter((word) => !['that', 'a', 'and', 'already', 'in', 'this'].includes(word));
/** Every bold word turns up in the transcript, in the rulebook's order ("I'm" being "I am"). */
const saysBoldWords = (transcript: string) => {
  let next = 0;
  for (const word of words(transcript).flatMap((w) => (w === "i'm" ? ['i', 'am'] : [w]))) if (word === BOLD[next]) next++;
  return next === BOLD.length;
};
const CLUES: Record<RuleId, (a: Applicant) => boolean> = {
  // A word printed in bold in the rulebook is missing from the transcript under the video strip.
  phrase: (a) => !saysBoldWords(a.video.transcript),
};

const applicants = Array.from({ length: 10 }, (_, i) => generateWeek(i + 1)).flatMap((week) =>
  week.flatMap((queue, i) => queue.map((a) => ({ ...a, day: i + 1 }))),
);

describe('fair clue check', () => {
  it('shows every planted violation in the UI data', () => {
    for (const a of applicants) {
      for (const p of a.planted) expect(CLUES[p.rule](a), `${a.name}: ${p.mistake}`).toBe(true);
    }
  });

  it('shows no clue when nothing was planted', () => {
    for (const a of applicants.filter((x) => x.planted.length === 0)) {
      for (const rule of Object.keys(CLUES) as RuleId[]) expect(CLUES[rule](a), a.video.transcript).toBe(false);
    }
  });

  it('gives a clue for every line the generator can plant', () => {
    const [template] = applicants;
    for (const line of [...Object.values(PHRASE_MISTAKES).flat(), ...GARY_DAYS.map((g) => g.video)]) {
      expect(CLUES.phrase({ ...template, video: { ...template.video, transcript: line } }), line).toBe(true);
    }
  });

  it('highlights at least one word in every citation', () => {
    for (const a of applicants) {
      for (const v of judge(a, rulebookForDay(a.day), []).violations) {
        expect([...v.heard, ...v.expected].some((m) => !m.ok)).toBe(true);
      }
    }
  });
});
