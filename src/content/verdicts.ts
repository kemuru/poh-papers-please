// What the Ministry prints: citations, court rulings and the letters at the end.
// The Ministry does not joke; it only reports.
import type { RuleId } from '../rules/types';
import type { CastId } from './cast';

/** The closing line of a citation, by broken rule. */
export const CITATION_MEMOS: Record<RuleId, readonly string[]> = {
  phrase: [
    'Memo 1-A: The sentence is printed on your desk. The applicant did not say it.',
    'Memo 1-B: Clerks are reminded that nearly the sentence is not the sentence.',
    'Memo 1-C: Clerks are reminded that the words are the test, not the face.',
    'Memo 1-D: The words that count are printed in bold. The Ministry paid extra for the bold.',
    'Memo 1-E: A registry is not a pantry, a ministry or a humane society. Please compare the words.',
  ],
};

/** The bottom line of a citation. "{fine}" is the fine in PNK. */
export const CITATION_TERMS = {
  warning: 'Warning only. The first citation of the day carries no fine. The next one will.',
  fine: 'Fine: {fine} PNK, deducted from today’s pay.',
};

/** The court's closing line when a challenge is upheld. */
export const UPHELD_NOTES = [
  'The application is refused.',
  'The application is refused. The applicant may reapply once they have learned the sentence.',
  'The application is refused. The applicant has been given a copy of the sentence to take home.',
  'The application is refused. The applicant asked if they could say it again now. They could not.',
  'The application is refused. The court notes that the applicant was very nearly right, which is not a category.',
  "The application is refused. Anyone who vouched for the applicant has been removed as well. They are in the queue.",
] as const;

/** The court's closing line when the clerk challenged a real human. */
export const DISMISSED_NOTES = [
  'The applicant has asked for your name.',
  'The applicant would like it noted that they were right.',
  'The Ministry thanks you for your vigilance, which was not required on this occasion.',
  'The applicant has been registered and has filled in a comment card.',
  'The applicant has been registered. The court apologised on your behalf.',
  'The court reminds clerks that the rulebook is the only judge. The face is not in the rulebook.',
  "The applicant's vouchers would like it noted that they were right as well.",
] as const;

/** What the court adds for someone it has met before. Gary's are by day; the rest are why they were right. */
export const CAST_RULINGS: Record<CastId, readonly string[]> = {
  gary: [
    'The applicant was asked to state his name. Three voices answered.',
    'The applicant asked for a lawyer. The lawyer was also raccoons.',
    'The court asked the applicant to stand. The applicant stood up in three places.',
    'The beard has been entered into evidence. It came off during questioning.',
    'The applicant left through the window. All of him.',
    'The court read the sign. The court was not persuaded.',
  ],
  brenda: ['The court examined the applicant closely and found nothing at all. It was unsettling.'],
  grandmaEthel: ["The applicant has asked for your name, your supervisor's name and your mother's name."],
  socrates: [
    "The applicant asked the court to define 'dismissed'. The court adjourned for lunch.",
    'The applicant said his last jury was also drawn by a machine, and look how that went.',
  ],
  nervousNigel: ['The applicant thanked the court eleven times and was escorted out, damp.'],
  robotMcBotface: ['The court confirmed that the applicant is not a robot. The applicant has asked for it in writing.'],
  nightShiftDawn: ['The court finds that a yawn is not a word. The applicant slept through the ruling.'],
};

export const EMPTY_COURT = 'No challenges were filed today. The court has gone home early.';

/** The letters at the end. "{day}" is the day it happened. */
export const ENDINGS = {
  fired: {
    title: 'Notice of termination',
    lines: [
      'Your savings fell below zero at the end of day {day}.',
      'The Ministry cannot employ a clerk who cannot afford the Ministry.',
      'Please return your stamps. The green one first.',
    ],
  },
  promoted: {
    title: 'Notice of promotion',
    lines: [
      'You have completed seven days at Window 3 with your savings intact.',
      'You are promoted to Window 2, with immediate effect.',
      'Window 2 is a cupboard. Please knock before entering.',
    ],
  },
} as const;
