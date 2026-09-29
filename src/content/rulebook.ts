// What the rulebook on the desk says, a page per rule. The rules themselves are enforced in src/rules.
import { KEY_WORDS, PHRASE } from '../rules/phrase';
import type { RuleId } from '../rules/types';

type Entry = {
  number: number;
  title: string;
  text: string;
  /** Quoted under the text, with the words that count in bold. */
  quote?: string;
  /** Which words of the quote are printed in bold: the ones that count. */
  bold?: readonly boolean[];
  /** What to compare, as a short list. */
  checks?: readonly string[];
  note: string;
};

export const RULEBOOK: Record<RuleId, Entry> = {
  human: {
    number: 0,
    title: 'A real human',
    text: 'The applicant must be a real human being. The registration policy, in its own words:',
    quote: 'The submitter must be a real human and not a computer-generated person or avatar.',
    bold: [false, false, false, false, false, true, true, false, true, false, true, true, false, true],
    checks: [
      'In every frame, eyes open or shut: the same human face, giving off no light.',
      'Three identical frames are a picture held up, not a person.',
      'A video generator leaves its mark ✦ in a corner.',
    ],
    note: 'Anything worn, painted or carried does not count, for or against: a costume robot’s head is a costume, bulb and all.',
  },
  phrase: {
    number: 1,
    title: 'Certification phrase',
    text: 'In the video, the applicant must say the words in bold, in this order:',
    quote: PHRASE,
    bold: KEY_WORDS,
    note: 'Small words may be swapped or left out; "I\'m" will do for "I am". Anything else said, before, after or in between, is not assessed.',
  },
  photo: {
    number: 2,
    title: 'Photo',
    text: 'The photo on the form must be of the face in the video, facing the camera, and not mirrored.',
    checks: ['Compare the photo with the face in the video.', 'A mirror puts a mole on the other cheek.'],
    note: 'Hair is not the face. Nor are hats, glasses or a new haircut. The chin is not considered part of the internal facial features.',
  },
  sign: {
    number: 3,
    title: 'The sign',
    text: 'In the video, the applicant holds up the wallet address on the form, in full and the right way up: on paper or on a phone’s screen.',
    checks: ['Compare the sign with the wallet on the form.', 'No QR codes. No ellipsis.'],
    note: 'One character may be wrong; two may not.',
  },
  vouch: {
    number: 4,
    title: 'One vouch',
    text: 'The applicant is vouched for by one registered human, who is not already vouching for someone else today.',
    checks: ['Look the voucher up in the registry.', 'Applicants may not vouch for themselves.'],
    note: 'When a challenge is upheld, whoever vouched for the applicant is removed from the registry as well.',
  },
  duplicate: {
    number: 5,
    title: 'No duplicates',
    text: 'The face in the video must not be in the registry already.',
    checks: ['Search the face in the registry.'],
    note: 'Twins are registered by filming both twins together. A hat is not a new face.',
  },
  living: {
    number: 6,
    title: 'Living',
    text: 'The applicant must be born between 1900 and today, and blink in the video.',
    checks: ['Read the year of birth.', 'Look for closed eyes in a frame.'],
    note: 'Submitters not able to give recent proof of life are to be considered deceased.',
  },
};
