// The waiting hall and the Ministry's voice, day by day. Day 1 is orderly. It does not stay that way.
// Each list is by day: index 0 is day 1.

/**
 * Read out once each over the hall's PA, the first as the window opens and the rest between
 * applicants. Window 2's story runs through them: it votes (day 4) and leaves the Ministry (day 5),
 * as the real registry forked in two.
 */
export const ANNOUNCEMENTS: readonly (readonly string[])[] = [
  [
    'Welcome to the Ministry of Humanity. Please have your humanity ready.',
    'Applicants are reminded that the queue is for humans. Everyone else, please also queue.',
    'Please hold your wallet address the right way up.',
    'Window 3 is now open. Window 3 is the only window.',
  ],
  [
    'A pigeon has entered the building. It has been asked to take a number.',
    "The Ministry thanks yesterday's applicants for being human. Most of them.",
    'Lost property: one mustache, fake. Please collect it from Window 3.',
    'Anyone who vouches for a raccoon will be removed along with the raccoon.',
  ],
  [
    'Applicants are reminded that a trench coat is not a form of identification.',
    'The pigeon has taken a number. Please do not encourage it.',
    "Humanity Improvement Proposal 4, 'Fewer Raccoons', is open for voting. One human, one vote.",
    'The Ministry has been asked whether it is also human. The Ministry is a building.',
  ],
  [
    'The ceiling in the waiting area is being looked at. Please do not look at the ceiling.',
    'The Ministry does not comment on reports of raccoons.',
    'Humanities may now be moved between chains. Please do not move yours while in the queue.',
    'Window 2 is closed while it votes on whether to leave the Ministry.',
  ],
  [
    'The pigeon has been processed. The Ministry wishes it well.',
    'Applicants who are several people may report themselves at Window 3 and keep a quarter of one of them.',
    'Following a vote, Window 2 has left the Ministry. You are at the real one.',
    'Applicants who counted their legs and got more than two are asked to count again.',
  ],
  [
    'The Ministry would like to clarify that the Ministry is not raccoons.',
    'The Ministry is aware of the other Ministry. The other Ministry is not the Ministry.',
    'Philosophers are asked to keep their questions to the designated area. There is no designated area.',
    'The ceiling is fine.',
  ],
  [
    'The Ministry thanks its clerk for a week of service. The week is not over.',
    'Humanities expiring today should be renewed before leaving the building.',
    'Applicants registered at Window 2 are reminded that they may be human there and not here.',
    'The Ministry reminds applicants that the chin is not a facial feature.',
  ],
];

/** The supervisor's sticky note on the desk each morning. They are having a week too. */
export const SUPERVISOR_NOTES: readonly string[] = [
  'Welcome to Window 3. NEXT calls someone. Read the video, stamp the form. Challenges go to court at five.',
  'First day done. Someone left a mustache on your chair. Please hand it in.',
  'Window 2 is voting on whether to leave the Ministry. Window 3 is not voting. Window 3 is working.',
  'The noise in the ceiling is being dealt with. Do not open the ceiling.',
  'Window 2 has left the Ministry and taken half the stationery. If they offer you a job, you are not interested.',
  'Keep stamping.',
  'It has been an honour. The ceiling says hello.',
];

/** Posters on the waiting hall wall, two a day, in the pixel font: capitals, digits and . , ! ? ' - : only. */
export const POSTERS: readonly (readonly [string, string])[] = [
  ['BE YOURSELF. ONCE.', 'ONE HUMAN, ONE QUEUE'],
  ['BE YOURSELF. ONCE.', 'VOUCH RESPONSIBLY'],
  ['HAVE YOUR HUMANITY READY', 'VOUCH RESPONSIBLY'],
  ['3 RACCOONS? SAY SOMETHING', 'ONE HUMAN, ONE VOTE'],
  ['3 RACCOONS? SAY SOMETHING', 'ONE FACE PER HUMAN'],
  ['NOT RACCOONS', 'THE CEILING IS FINE'],
  ['RENEW YOUR HUMANITY', 'NOT RACCOONS'],
];

export const BANNER = 'WELCOME TO THE NEW REGISTRY';

/** The announcement board between announcements: a plain sign, so nothing funny is on screen for long. */
export const BOARD = {
  waiting: 'Please wait for your number to be called.',
  closed: 'Window 3 is closed. Please leave the building calmly.',
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
};
