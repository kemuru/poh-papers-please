// The waiting hall and the Ministry's voice, day by day. Day 1 is orderly. It does not stay that way.
// Each list is by day: index 0 is day 1.

/**
 * Read out once each over the hall's PA, the first as the window opens and the rest between
 * applicants. Window 2's story runs through them: it votes (day 4) and leaves the Ministry (day 5),
 * as the real registry forked in two.
 */
export const ANNOUNCEMENTS: readonly (readonly string[])[] = [
  [
    'Welcome to the Ministry of Humanity. Humanity Day is in six days. Please have your humanity ready.',
    'Applicants are reminded that the queue is for humans. Everyone else, please also queue.',
    'The Universal Basic Income opens on Humanity Day at five o\'clock. It is paid to humans. One each.',
    'Window 3 is now open. It is the only window open.',
  ],
  [
    'A pigeon has entered the building. It has been asked to take a number.',
    'Applicants are reminded that the face in their photograph should be their own.',
    'Lost property: one face, very lifelike. Please collect it from Window 3.',
    'The Ministry registers humans only. Pets may wait in the car.',
  ],
  [
    'Applicants are reminded that a warranty is not a form of identification.',
    'Please write your wallet address in full. The dots are not the address.',
    'The pigeon has taken a number. Please do not encourage it.',
    'The Ministry has been asked whether it is also human. The Ministry is a building.',
  ],
  [
    'The ceiling in the waiting area is being looked at. Please do not look at the ceiling.',
    'A vouch serves one applicant at a time. The Ministry apologises to the bridge club.',
    'Humanities may now be moved between chains. Please do not move yours while in the queue.',
    'Window 2 is closed while it votes on whether to leave the Ministry.',
  ],
  [
    'The pigeon has been processed under Rule 2. The Ministry wishes it well.',
    'Applicants registered more than once may report themselves at Window 3 and keep a quarter of the income.',
    'Following a vote, Window 2 has left the Ministry. You are at the real one.',
    'Two days to Humanity Day. Applicants may be asked to remove their hat.',
  ],
  [
    'The Ministry would like to clarify that the Ministry is not a robot.',
    'The Ministry is aware of the other Ministry. The other Ministry is not the Ministry.',
    'Humanity Day is tomorrow. Applicants are asked to blink where the camera can see, and to be filmed, not generated.',
    'The ceiling is fine.',
  ],
  [
    'The Ministry thanks its clerk for a week of service. The week is not over.',
    'Humanities expiring today should be renewed before leaving the building.',
    'Applicants registered at Window 2 are reminded that they may be human there and not here.',
    'The Ministry reminds applicants that the chin is not a facial feature.',
  ],
];

/**
 * The supervisor's sticky note on the desk each morning. It points at the day's new page in the rulebook,
 * which says the rule, rather than saying it again; and it says how to use a tool the day it arrives.
 */
export const SUPERVISOR_NOTES: readonly string[] = [
  'NEXT calls someone. Rule 1 is in the book. Court at five. You will be fine.',
  'New in the book: Rule 2. The clock starts today.',
  'New in the book: Rule 3. Window 2 is voting. Window 3 is working.',
  'New: Rule 4. Look the voucher up. Do not look up at the ceiling.',
  'New: Rule 5. Search the face. Window 2 has left the Ministry. You are not interested.',
  'New: Rule 6. Humanity Day tomorrow. Keep stamping.',
  'Your registration ran out at nine, so you are last in the queue. It has been an honour.',
];

/**
 * Posters on the waiting hall wall, two a day, in the pixel font: capitals, digits and . , ! ? ' - : only.
 * They repeat, as posters do. CHECK EVERY FRAME goes up with Rule 2 on day 2, and back up on day 4, the
 * morning the Gazette reports that Likeness has changed its lamps.
 */
export const POSTERS: readonly (readonly [string, string])[] = [
  ['BE YOURSELF. ONCE.', 'ONE HUMAN, ONE QUEUE'],
  ['CHECK EVERY FRAME', 'VOUCH RESPONSIBLY'],
  ['HAVE YOUR HUMANITY READY', 'VOUCH RESPONSIBLY'],
  ['CHECK EVERY FRAME', 'ONE HUMAN, ONE VOTE'],
  ['CHECK EVERY FRAME', 'ONE FACE PER HUMAN'],
  ['HUMANS ONLY', 'THE CEILING IS FINE'],
  ['RENEW YOUR HUMANITY', 'HUMANS ONLY'],
];

export const BANNER = 'WELCOME TO THE NEW REGISTRY';

/** What the PA says at five, and keeps saying until the hall is empty. */
export const CLOSING = {
  closed: 'Window 3 is closed. Please leave the building calmly.',
  /** Humanity Day at five. */
  open: 'The Universal Basic Income is now open. Happy Humanity Day.',
};

/** Printed at the foot of the clerk's statement each evening. */
export const STATEMENT_FOOTERS: readonly string[] = [
  'The Ministry thanks you for your service today.',
  'The Ministry thanks you for your service today.',
  'The Ministry thanks you for your service today, and has noticed the pigeon.',
  'The Ministry thanks you for your service today. Please do not take the ceiling home.',
  'The Ministry thanks you.',
  'Thank you.',
  'The Ministry thanks you for a week of service. It is not sure what it would have done without you. Probably the same.',
];

/** What the speech box shows when nobody in particular is talking. */
export const WINDOW_LINES = {
  closed: 'The shutter is down. Window 3 opens when you open it.',
  empty: 'Nobody at the window. The queue is waiting for you to call.',
  /** Said by whoever was at the window when the clock ran out. */
  timeUp: "Oh. Is that the time? I'll come back another day, then.",
  finished: 'That was the last one. The Registry is closed for the day.',
  sentHome: 'The Registry is closed. Everyone still waiting has been sent home.',
  /** Humanity Day, after the last stamp, which is the clerk's own. */
  humanityDay: 'Five o’clock. The Universal Basic Income is open. Nothing else happens.',
};
