// What the rulebook on the desk says. The rules themselves are enforced in src/rules.
import { PHRASE } from '../rules/phrase';
import type { RuleId } from '../rules/types';

export const RULEBOOK: Record<RuleId, { number: number; title: string; text: string; quote: string; note: string }> = {
  phrase: {
    number: 1,
    title: 'Exact certification phrase',
    text: 'In the video, the applicant must say exactly:',
    quote: PHRASE,
    note: 'Word for word. Capitalization and punctuation are not assessed.',
  },
};
