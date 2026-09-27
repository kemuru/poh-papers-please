// What the rulebook on the desk says. The rules themselves are enforced in src/rules.
import { KEY_WORDS, PHRASE } from '../rules/phrase';
import type { RuleId } from '../rules/types';

type Entry = {
  number: number;
  title: string;
  text: string;
  quote: string;
  /** Which words of the quote are printed in bold: the ones that count. */
  bold?: readonly boolean[];
  note: string;
};

export const RULEBOOK: Record<RuleId, Entry> = {
  phrase: {
    number: 1,
    title: 'Certification phrase',
    text: 'In the video, the applicant must say the words in bold, in this order:',
    quote: PHRASE,
    bold: KEY_WORDS,
    note: 'Small words may be swapped or left out; "I\'m" will do for "I am". Anything else said, before, after or in between, is not assessed.',
  },
};
