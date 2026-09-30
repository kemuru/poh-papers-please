// What the Ministry prints: citations, court rulings and the letters at the end.
// The Ministry does not joke; it only reports. Every pool here is drawn without replacement for
// the whole run: a line printed once is not printed again (src/gen/lines.ts).
import type { RuleId } from '../rules/types';
import type { CastId } from './cast';

/** The closing line of a citation, by broken rule. */
export const CITATION_MEMOS: Record<RuleId, readonly string[]> = {
  // A unit's citation has a memo of its own (UNIT_MEMOS), and a year that is not a living one has its
  // own (YEAR_MEMOS). Every other memo must fit any fault under its rule: it is chosen by the rule alone.
  phrase: [
    'Memo 1-A: The sentence is printed on your desk. The applicant did not say it.',
    'Memo 1-B: Clerks are reminded that nearly the sentence is not the sentence.',
    'Memo 1-C: Clerks are reminded that the words are the test, not the accent.',
    'Memo 1-D: The words that count are printed in bold. The Ministry paid extra for the bold.',
    'Memo 1-E: A registry is not a pantry, a ministry or a humane society. Please compare the words.',
  ],
  face: [
    'Memo 2-A: One face, in the photograph and in every frame. The Ministry does not accept substitutes.',
    'Memo 2-B: Clerks are reminded to look at every frame, not only the first.',
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
    'Memo 6-A: The Ministry registers the living. The department for everyone else is closed.',
    'Memo 6-C: Submitters not able to give recent proof of life are to be considered deceased. This one was not able.',
    'Memo 6-D: A pulse is not required. Evidence of one is.',
  ],
};

/** Rule 6's memos for a year of birth that is not a living one. */
export const YEAR_MEMOS: readonly string[] = [
  'Memo 6-B: The year of birth is a year. Please check that it is one.',
  'Memo 6-E: Born before 1900 is born too early. The Ministry makes no exception for philosophers.',
];

/** A unit's citation, by day: the memo for the one thing that gave it away. Day 1's unit breaks no rule. */
export const UNIT_MEMOS: Readonly<Record<number, string>> = {
  2: 'Memo 2-L: The applicant was a home robot. It shut its eyes twice, and lit up twice. Humans manage only the first.',
  3: 'Memo 2-N: The address in frame 3 was in order. The light above it was not.',
  4: 'Memo 4-L: A company is not a registered human, whatever its brochure says.',
  5: 'Memo 5-L: The factory made this face twice. The registry takes each face once.',
  6: 'Memo 2-P: Likeness Robotics has asked what the income is per unit. The Ministry has not replied.',
  7: 'Memo 2-Q: Likeness Robotics had resolved all known issues. This was not one of the known ones.',
};

/** The court's line when the clerk challenged the day 1 unit, which no rule in force could catch. */
export const FIRST_UNIT_DISMISSED = 'No rule in force reads a face. The court has written to the Ministry about it.';

/** The memo on the week's last citation, if the clerk registers their own renewal. */
export const CLERK_MEMO = 'Memo 1-Z: You registered a clerk.';

/** A citation for a fault in the video reprints it. "{n}" is the frame its evidence names. */
export const CITATION_FILM = {
  label: 'The video, as submitted.',
  labelNamed: 'The video, as submitted, frame {n} marked.',
  /** The caption of the frame the evidence names, in place of its time: it is outlined, and named. */
  named: 'Frame {n}',
};

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

/**
 * The court's closing line when a challenge is dismissed. It is printed the same whether the applicant
 * broke nothing or the jury missed what they broke, so a line reports the court's finding and never
 * says the clerk was wrong. Any applicant can draw it, including one with no voucher.
 */
export const DISMISSED_NOTES = [
  'The applicant has asked for your name.',
  'The applicant would like it noted that they were right.',
  'The Ministry thanks you for your vigilance. The court found no use for it on this occasion.',
  'The applicant has been registered and has filled in a comment card.',
  'The applicant has been registered. A standard letter of apology has been sent in your name.',
  'The court reminds clerks that the rulebook is the only judge. Suspicion is not in the rulebook.',
] as const;

/**
 * What the court adds for someone it has met before, when a challenge is upheld or dismissed.
 * A unit's are by day. A dismissed line holds, as DISMISSED_NOTES do, for a fault the jury missed.
 */
export const CAST_RULINGS: Record<CastId, { upheld?: readonly string[]; dismissed?: readonly string[] }> = {
  unit: {
    upheld: [
      'The court asked the applicant a question. The answer arrived two seconds later, from somewhere else.',
      'The court asked the applicant where it was born. It gave the address of a factory.',
      'The applicant offered the court its serial number, to save time.',
      'Likeness Robotics sent a letter of support. The court has asked it to stop sending letters.',
      'The court was shown the registration at Window 7: the same face, under another name.',
      'The applicant thanked the court and asked to be told the outcome by email.',
      'The court asked the applicant to keep its eyes open for the rest of the hearing. It did, without difficulty.',
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
  binns: {
    upheld: ['The court notes that the robots have been sold, and that this does not change the application.'],
    dismissed: ['The court heard that the robots had been sold. It did not ask to whom.'],
  },
  clerk: {
    upheld: ['The court asked the applicant what they were. The applicant said "a clerk" again, and stamped the ruling themselves.'],
    dismissed: ['The court found the applicant human, on balance. The applicant asked the court to look again.'],
  },
};

export const EMPTY_COURT = 'No challenges were filed today. The court has gone home early.';

/** Whose letters they are: the Ministry's letterhead, and the department under its name. */
export const LETTER_HEAD = { ministry: 'Ministry of Humanity', dept: 'Human Resources' };

/**
 * The letters at the end of the week, one per ending (notes/game-design.md, Endings). Each adds up what
 * this week did: "{day}", "{savings}", "{units}", "{fakes}" and "{humans}" are filled from the run, and a
 * line that is an object is chosen by what the clerk did with their own renewal. Human Resources reports;
 * it does not joke. Every letter but Fired's comes after six o'clock, where the income has already been
 * paid, and closes on the same line (LETTER_CLOSE), whatever the fate.
 */
export const ENDINGS = {
  fired: {
    title: 'Notice of termination',
    stamp: 'Terminated',
    lines: [
      'Your savings fell below zero at the end of day {day}: {savings} PNK.',
      '{costs}',
      'The Ministry cannot employ a clerk who cannot afford the Ministry.',
      'Please return your stamps. The green one first.',
    ],
  },
  replaced: {
    title: 'Notice of replacement',
    stamp: 'Replaced',
    lines: [
      'This week you stamped {count} home robots into the registry: {units}.',
      'The Ministry has concluded that Window 3 is being run for Likeness Robotics, and has asked Likeness Robotics to run it.',
      'A unit in your likeness takes your chair. Its papers are in order.',
      'Please leave your lanyard on the desk.',
    ],
  },
  superseded: {
    title: 'Notice of duplication',
    stamp: 'Superseded',
    lines: [
      'On day 6 the registry took in Robin Hale, who has your name, your face and a better haircut.',
      {
        accepted: 'At five o’clock you registered yourself as well. The registry takes each face once, and has kept his.',
        upheld: 'At five o’clock you challenged your own renewal, and the court agreed.',
        dismissed: 'At five o’clock the court registered you as well. The registry takes each face once, and has kept his.',
      },
      '{voucherRemoved}',
      'Please leave the stamps on the desk. He knows where they go.',
    ],
    grade: 'Grade: Clerk, {grade} Class, awarded to Robin Hale.',
  },
  reclassified: {
    title: 'Notice of reclassification',
    stamp: 'Reclassified',
    lines: [
      'At five o’clock the Humanity Court upheld your challenge to your own renewal: in your video, you certify that you are a real clerk.',
      '{voucherRemoved}',
      'You have been reclassified as registry equipment, and added to the inventory of Window 3.',
      'Your salary continues. Equipment is not eligible for the income.',
    ],
    grade: 'Grade: Equipment, {grade} Class.',
  },
  promoted: {
    title: 'Notice of promotion',
    stamp: 'Promoted',
    lines: [
      {
        accepted: 'Your own renewal was registered at five o’clock, by you. A note has been placed on your file: “Registered a clerk.”',
        dismissed: 'You challenged your own renewal, and the Humanity Court found you human. The Ministry accepts its finding, and has asked it not to look again.',
      },
      'You are promoted to Window 2, with immediate effect.',
      'Window 2 has left the Ministry. The promotion stands.',
    ],
    grade: 'Grade: Clerk, {grade} Class.',
  },
} as const;

/** The last line of every letter that comes after six o'clock: the promoted clerk, the equipment and the unit alike. */
export const LETTER_CLOSE = 'Window 3 opens at nine on Monday.';

/**
 * In the letter, where the clerk's own challenge was upheld: whoever vouched for the clerk went with
 * them, as the rulebook's Rule 4 says of every upheld challenge. Usually the week's first registration.
 */
export const VOUCHER_REMOVED = {
  line: '{voucher}, who vouched for you, has been removed from the registry with you, as the rulebook says.',
  first: 'She was the first person you registered this week.',
};

/** What cost a fired clerk their savings, as their letter puts it. "{fakes}" and "{humans}" count applicants. */
export const FIRED_COSTS = {
  both: 'This week you registered {fakes} who broke a rule, and challenged {humans} who broke none.',
  fakes: 'This week you registered {fakes} who broke a rule.',
  humans: 'This week you challenged {humans} who broke no rule.',
};

/** A line a letter adds if Likeness's offer has a bearing on it, before its last. */
export const LETTER_NOTES = {
  handedIn: 'Your commendation of day 3 is on file.',
  signed: 'A signed letter from Likeness Robotics was found in your drawer. It has been filed.',
  signedReplaced: 'Your partner fees will now be paid to the unit.',
};

/** Clipped to a Humanity Day letter when the clerk signed Likeness's offer and stamped in one or two units. */
export const HEADHUNTED = {
  /** Whose letter it is, for a screen reader: the letterhead itself is the company's own (OFFER_LETTER's). */
  head: 'Likeness Robotics Ltd, Partner programme',
  title: 'An offer',
  lines: [
    'Dear Robin Hale,',
    'Thank you for your partnership this week: {units}.',
    'We would like to offer you the position of Head of Human Relations, from Monday. The position is not eligible for the income. Neither are we.',
  ],
  /** To the Ministry, when the clerk has become its equipment. */
  equipment: [
    'Dear Ministry,',
    'Thank you for your clerk’s partnership this week: {units}.',
    'We understand the clerk is now equipment. We would like to buy it.',
  ],
  sign: 'Likeness Robotics Ltd, a company',
};
