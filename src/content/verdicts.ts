// What the Ministry prints after a decision. The Ministry does not joke; it only reports.
import type { RuleId } from '../rules/types';

/** Printed when a real human is registered. */
export const REGISTERED_NOTES = [
  'Registration complete. Please call the next applicant.',
  'Registered. The registry now holds one more human.',
  'Registration complete. No further action is required.',
] as const;

/** The closing line of a citation, by broken rule. */
export const CITATION_MEMOS: Record<RuleId, readonly string[]> = {
  phrase: [
    'Memo 1-A: The sentence is printed on your desk. The applicant did not say it.',
    'Memo 1-B: Registration requires the sentence, the whole sentence and nothing but the sentence.',
    'Memo 1-C: Clerks are reminded that the words are the test, not the face.',
    'Memo 1-D: The certification is one sentence long. Please compare all of it.',
  ],
};

/** The court's closing line when a challenge is upheld. */
export const UPHELD_NOTES = [
  'The application is refused.',
  'The application is refused. The applicant may reapply once they have learned the sentence.',
  'The application is refused. The applicant has been given a copy of the sentence to take home.',
] as const;

/** The court's closing line when the clerk challenged a real human. */
export const DISMISSED_NOTES = [
  'The applicant has asked for your name.',
  'The applicant would like it noted that they were right.',
  'The Ministry thanks you for your vigilance, which was not required on this occasion.',
  'The applicant has been registered and has filled in a comment card.',
] as const;
