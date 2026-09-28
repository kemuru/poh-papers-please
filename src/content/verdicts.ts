// What the Ministry prints: citations, court rulings and the letters at the end.
// The Ministry does not joke; it only reports. Every pool here is drawn without replacement for
// the whole run: a line printed once is not printed again (src/gen/lines.ts).
import type { RuleId } from '../rules/types';
import type { CastId } from './cast';

/** The closing line of a citation, by broken rule. */
export const CITATION_MEMOS: Record<RuleId, readonly string[]> = {
  // A unit's citation has a memo of its own: these are for everything else that is not a person.
  // Every memo must fit any fault under its rule: it is chosen by the rule alone.
  human: [
    'Memo 0-A: The registry is for humans. It says so on the front.',
    'Memo 0-B: Clerks are reminded to look at every frame, not only the first.',
    'Memo 0-C: The Ministry registers people, not pictures of people, however good the picture.',
    'Memo 0-D: The applicant was not in the video. Something else was.',
    'Memo 0-E: Rule 0 has been in force since before the Ministry had a building.',
  ],
  phrase: [
    'Memo 1-A: The sentence is printed on your desk. The applicant did not say it.',
    'Memo 1-B: Clerks are reminded that nearly the sentence is not the sentence.',
    'Memo 1-C: Clerks are reminded that the words are the test, not the accent.',
    'Memo 1-D: The words that count are printed in bold. The Ministry paid extra for the bold.',
    'Memo 1-E: A registry is not a pantry, a ministry or a humane society. Please compare the words.',
  ],
  photo: [
    'Memo 2-A: The photograph is of the applicant, or it is of someone else.',
    'Memo 2-C: Hair is not the face. The face is the face.',
    'Memo 2-D: The Ministry registers the person in the video, not the person they would prefer to be.',
  ],
  sign: [
    'Memo 3-B: One wrong character is a slip of the pen. Two is a different wallet.',
    'Memo 3-C: Sympathy is not a rule.',
    'Memo 3-E: Clerks are reminded to compare the sign with the form, not with their hopes.',
  ],
  vouch: [
    'Memo 4-A: A vouch is from one registered human. The registry lookup will say which.',
    'Memo 4-C: Every voucher is looked up. Grandmothers included.',
    'Memo 4-F: Please look the voucher up before you stamp. The lookup is on your desk for that reason.',
  ],
  duplicate: [
    'Memo 5-A: A face may be registered once.',
    'Memo 5-C: The registry already has this face. It does not need another copy.',
    'Memo 5-D: Clerks are reminded to search the face before stamping it.',
    'Memo 5-E: The applicant is now registered twice. Once was the limit.',
  ],
  living: [
    'Memo 6-B: The year of birth is a year. Please check that it is one.',
    'Memo 6-D: The Ministry registers the living. The department for everyone else is closed.',
    'Memo 6-E: Born before 1900 is born too early. The Ministry makes no exception for philosophers.',
  ],
};

/** A unit's citation, by day: the memo for the one thing that gave it away. */
export const UNIT_MEMOS: readonly string[] = [
  'Memo 0-L: In frame 2 the skin by the jaw was a hatch. Clerks are asked to look at every frame.',
  'Memo 0-M: The jaw in frame 1 was on hinges. The applicant was a home robot; its household has been informed.',
  'Memo 0-N: In frame 3 the applicant blinked, and its cheek opened. Humans do only one of those.',
  'Memo 4-L: A company is not a registered human, whatever its brochure says.',
  'Memo 5-L: The factory made this face twice. The registry takes each face once.',
  'Memo 0-P: Likeness Robotics has asked what the income is per unit. The Ministry has not replied.',
];

/** The bottom line of a citation. "{fine}" is the fine in PNK. */
export const CITATION_TERMS = {
  warning: 'Warning only. The first citation of the day carries no fine. The next one will.',
  fine: 'Fine: {fine} PNK, deducted from today’s pay.',
};

/** The court's closing line when a challenge is upheld. */
export const UPHELD_NOTES = [
  'The application is refused.',
  'The application is refused. The applicant may reapply once they have read the rulebook.',
  'The application is refused. The applicant asked if they could try again now. They could not.',
  'The application is refused. The applicant has taken a copy of the rulebook home. It is not for home.',
  'The application is refused. The jury agreed with itself, as it is paid to.',
  'The application is refused. The applicant has been given a leaflet about next week.',
  'The application is refused. The applicant thanked the court, which is not required.',
] as const;

/** The court's closing line when a challenge is dismissed and the applicant broke nothing. */
export const DISMISSED_NOTES = [
  'The applicant has asked for your name.',
  'The applicant would like it noted that they were right.',
  'The Ministry thanks you for your vigilance, which was not required on this occasion.',
  'The applicant has been registered and has filled in a comment card.',
  'The applicant has been registered. The court apologised on your behalf.',
  'The court reminds clerks that the rulebook is the only judge. Suspicion is not in the rulebook.',
  "The applicant's vouchers would like it noted that they were right as well.",
] as const;

/**
 * What the court adds for someone it has met before, when a challenge is upheld or dismissed.
 * A unit's are by day.
 */
export const CAST_RULINGS: Record<CastId, { upheld?: readonly string[]; dismissed?: readonly string[] }> = {
  unit: {
    upheld: [
      'The court asked the applicant where it was born. It gave the address of a factory.',
      'The applicant offered to open the rest of its face for the court. The court declined.',
      'The applicant offered the court its serial number, to save time.',
      'Likeness Robotics sent a letter of support. The court has asked it to stop sending letters.',
      'The court was shown the registration at Window 7: the same face, under another name.',
      'The applicant thanked the court and asked to be told the outcome by email.',
    ],
  },
  brenda: { dismissed: ['The court examined the applicant closely and found nothing at all. It was unsettling.'] },
  grandmaEthel: { dismissed: ["The applicant has asked for your name, your supervisor's name and your mother's name."] },
  socrates: {
    dismissed: [
      "The applicant asked the court to define 'dismissed'. The court adjourned for lunch.",
      'The applicant said his last jury was also drawn by a machine, and look how that went.',
    ],
  },
  nervousNigel: { dismissed: ['The applicant thanked the court eleven times and was escorted out, damp.'] },
  robOtt: { dismissed: ['The court confirmed that the applicant is not a robot. The applicant has asked for it in writing.'] },
  nightShiftDawn: { dismissed: ['The court finds that a yawn is not a word. The applicant slept through the ruling.'] },
  dave: { dismissed: ['The court asked the applicant to take the helmet off. It was already off.'] },
  sybilVance: { dismissed: ['The court counted the applicant. The court got one.'] },
  pat: {
    upheld: [
      'The court notes that the applicant was very nearly right, which is not a category.',
      'The applicant asked what time the Ministry opens tomorrow.',
      'The applicant has asked to keep the rulebook. The applicant has been given a leaflet.',
      'The applicant thanked the jury. The jury was not sure where to look.',
    ],
    dismissed: ['The court found nothing wrong. The applicant has asked for the ruling in a frame.'],
  },
  patMother: { dismissed: ["The applicant is Pat's mother. The court was told this several times."] },
  twins: { dismissed: ['The court was shown one face on two people and found two humans. It was a long afternoon.'] },
  sybilFarm: {
    upheld: ['The applicant was asked to remove the hat. The court recognised him.', 'The court has seen this face twice today. Once was enough.'],
    dismissed: ['The court finds that the first of anything is new.'],
  },
  agent: {
    upheld: [
      'The applicant offered to summarise the ruling. The court declined.',
      'The court asked the applicant to attend in person. It sent a video.',
    ],
  },
  deepfake: { upheld: ['The court asked the applicant to hold still. The ears did not.'] },
  cutout: { upheld: ['The court asked the applicant to blink. Someone behind the applicant blinked.'] },
  clone: { upheld: ['The court compared the applicant with the clerk. The court preferred the haircut, and upheld the challenge anyway.'] },
  influencer: {
    upheld: ['The court compared the photograph with the video. The court preferred the photograph, and upheld the challenge anyway.'],
    dismissed: ['The applicant has asked if the court would like to follow her.'],
  },
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
      'Window 2 has left the Ministry. The promotion stands.',
    ],
  },
} as const;
