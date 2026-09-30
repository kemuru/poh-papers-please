// What the rulebook on the desk says, a page per rule. The rules themselves are enforced in src/rules.
import { KEY_WORDS, PHRASE } from '../rules/phrase';
import type { RuleId } from '../rules/types';

/** A figure under one of a rule's checks (`under`, from 0): one face in a video frame, eyes shut, twice, `ok` as the rule allows and `not` as it does not. Captions are printed a line at a time, three at most. */
export type Figure = { under: number; label: string; ok: readonly string[]; not: readonly string[] };

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
  /** Printed under one of the checks. */
  figure?: Figure;
  note: string;
  /** The page's footnote: when the rule was issued, and why. Each rule comes with its reason, usually something registered the day before. */
  cause: string;
};

export const RULEBOOK: Record<RuleId, Entry> = {
  phrase: {
    number: 1,
    title: 'The phrase',
    text: 'In the video, the applicant must say the words in bold, in this order:',
    quote: PHRASE,
    bold: KEY_WORDS,
    note: 'Small words may be swapped or left out; "I\'m" will do for "I am". Anything else said, before, after or in between, is not assessed.',
    cause: 'In force from day 1. The words are the registry’s own.',
  },
  face: {
    number: 2,
    title: 'The face',
    text: 'The photo on the form and every frame of the video show the same face, facing the camera and not mirrored. It is a human face.',
    checks: ['Compare the photo with each frame. A mirror puts a mole on the other cheek.', 'Eyes open or shut, a human face gives off no light.'],
    figure: {
      under: 1,
      label: 'Fig. 2-1: a face in a video frame, eyes shut, no light. Fig. 2-2: the same face, eyes shut, a light between the brows: not a human face.',
      ok: ['Fig. 2-1', 'Eyes shut.', 'No light.'],
      not: ['Fig. 2-2', 'A light:', 'not human.'],
    },
    note: 'Hair, hats, glasses and costumes are not the face, for or against: a costume robot\u2019s head is a costume, bulb and all.',
    cause: 'Issued on day 2, following the registration at Window 3 of a home robot that certified it was a real human.',
  },
  sign: {
    number: 3,
    title: 'The sign',
    text: 'In the video, the applicant holds up the wallet address on the form, in full and the right way up: on paper or on a phone\u2019s screen.',
    checks: ['Compare the sign with the wallet on the form.', 'No QR codes. No ellipsis.'],
    note: 'One character may be wrong; two may not.',
    cause: 'Issued on day 3, following a registration claimed with someone else’s wallet.',
  },
  vouch: {
    number: 4,
    title: 'One vouch',
    text: 'The applicant is vouched for by one registered human, who is not already vouching for someone else today.',
    checks: ['Look the voucher up in the registry.', 'Applicants may not vouch for themselves.'],
    note: 'When a challenge is upheld, whoever vouched for the applicant is removed from the registry as well.',
    cause: 'Issued on day 4, following the registration at Window 6 of a man who vouched for himself.',
  },
  duplicate: {
    number: 5,
    title: 'No duplicates',
    text: 'The face in the video must not be in the registry already.',
    checks: ['Search the face in the registry.'],
    note: 'Twins are registered by filming both twins together. A hat is not a new face.',
    cause: 'Issued on day 5, following the registration of one face four times at Window 5, in four hats.',
  },
  living: {
    number: 6,
    title: 'Living',
    text: 'The applicant must be born between 1900 and today, and alive on camera: filmed, not generated, and seen to blink.',
    checks: ['Read the year of birth.', 'Look for closed eyes in a frame. A picture held up never blinks.', 'A video generator leaves its mark \u2726 in a corner.'],
    note: 'Submitters not able to give recent proof of life are to be considered deceased.',
    cause: 'Issued on day 6, following the registration of a man born in 470 BC.',
  },
};
