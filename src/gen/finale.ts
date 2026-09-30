// Six o'clock on Humanity Day (notes/game-design.md, Endings), written from what this week did: what each of the
// last queue says, three by three, and Pat's line after the number. Pure: the same facts always give the same
// lines. The words are src/content/finale.ts's; the facts are read from the week by src/ui/week.ts.
import { AGENT, CLERK, FIRST_APPLICANT, LIKENESS, PAT, REGULARS, SYBIL_FARM } from '../content/cast';
import { AGENT_LINES, ETHEL_LINES, FARM_LINES, HORTENSE_LINES, LIKENESS_LINES, PAT_LINES, ROBIN_LINES, SIX, SOCRATES_LINES } from '../content/finale';
import type { LampSize, Portrait } from './portrait';

/** Everyone with a line at six: the farm, those applying for someone else, the humans, and Pat after the number. */
export type Speaker = 'terry' | 'kerry' | 'perry' | 'agent' | 'likeness' | 'robin' | 'ethel' | 'hortense' | 'socrates' | 'pat';

/** What the week did to the people in the hall at six. */
export type FinaleFacts = {
  /** How many of the farm's three cousins the registry holds. */
  cousinsRegistered: number;
  /** The Agent: registered at Window 3, refused there (or sent home), or never at Window 3 this week. */
  agent: 'registered' | 'refused' | 'absent';
  /** The clerk's clone: the Robin Hale the registry kept, or one Window 2 registered (refused at Window 3, or never there). */
  robinOnFile: boolean;
  offer: 'signed' | 'handed-in' | null;
  /** Hortense Cobbold vouched for the clerk's renewal, and went from the registry with them when the court upheld it. */
  hortenseRemoved: boolean;
  /** Ethel said her line about paper at the window this week, so it is not said again. */
  ethelSaidPaper: boolean;
  socratesRegistered: boolean;
  /** The attempt at which Pat was registered, 1 to 5; null if Pat never was. */
  patAttempt: number | null;
};

/** One line in the hall: who says it (Likeness's comes through the slot, on paper), their name, and the words. */
export type Beat = { speaker: Speaker; name: string; text: string; paper?: 'envelope' | 'letter' };

/** The six o'clock scene's words: the PA, the nine lines of the last queue in order, and Pat's after the number. */
export type SixScript = { pa: string; queue: Beat[]; pat: Beat };

/**
 * Someone on a bench at six. A unit has its night lamp, which comes on in the dark (a current model's `waits` out a
 * few seconds of it first, as it waits out a blink); a speaker has a line.
 */
export type Sitter = { name: string; face: Portrait; lamp: LampSize | null; waits?: true; speaker: Speaker | null };

/**
 * The last queue, in three triples, each two lines setting a pattern for the third to break: the farm sharing
 * one face's income, then Perry; the Agent and Likeness asking for someone else's first hour, then Robin Hale
 * asking for Robin Hale's; Ethel and Hortense wanting something other than the money, then Socrates asking what
 * it is worth. Every line wants something, so the one number the lever brings answers them all.
 */
export function writeSix(f: FinaleFacts): SixScript {
  const cousins = Math.max(0, Math.min(3, f.cousinsRegistered)) as 0 | 1 | 2 | 3;
  const [terry, kerry, perry] = SYBIL_FARM.cousins.map((c) => c.name);
  const attempt = f.patAttempt !== null ? PAT_LINES.attempts[f.patAttempt - 1] : undefined;
  return {
    pa: SIX.pa,
    queue: [
      { speaker: 'terry', name: terry, text: FARM_LINES.terry[cousins] },
      { speaker: 'kerry', name: kerry, text: FARM_LINES.kerry[cousins] },
      { speaker: 'perry', name: perry, text: FARM_LINES.perry },
      { speaker: 'agent', name: AGENT.name, text: AGENT_LINES[f.agent] },
      f.offer === 'signed'
        ? { speaker: 'likeness', name: LIKENESS, text: LIKENESS_LINES.signed, paper: 'envelope' }
        : { speaker: 'likeness', name: LIKENESS, text: f.offer === 'handed-in' ? LIKENESS_LINES.handedIn : LIKENESS_LINES.letter, paper: 'letter' },
      { speaker: 'robin', name: CLERK.name, text: f.robinOnFile ? ROBIN_LINES.onFile : ROBIN_LINES.windowTwo },
      { speaker: 'ethel', name: REGULARS.grandmaEthel.name, text: f.ethelSaidPaper ? ETHEL_LINES.again : ETHEL_LINES.paper },
      { speaker: 'hortense', name: FIRST_APPLICANT.name, text: f.hortenseRemoved ? HORTENSE_LINES.removed : HORTENSE_LINES.registered },
      { speaker: 'socrates', name: REGULARS.socrates.name, text: f.socratesRegistered ? SOCRATES_LINES.registered : SOCRATES_LINES.unregistered },
    ],
    pat: { speaker: 'pat', name: PAT.name, text: attempt ? PAT_LINES.registered.replace('{attempt}', attempt) : PAT_LINES.unregistered },
  };
}
