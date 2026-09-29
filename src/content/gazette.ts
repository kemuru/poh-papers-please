// The Registry Gazette: on the desk every morning from day 2, read before the window opens. It is
// the one place that tells the clerk what their stamps did. Wire-service deadpan: it reports, it
// never jokes. The hall's PA is the Ministry's voice; the Gazette never repeats its lines.
// In headlines, "{NAME}" is an applicant's name, "{RULE}" a rule's number and "{COUNT}" a number.

export const GAZETTE_TITLE = 'The Registry Gazette';

/** Headlines by what happened at Window 3 yesterday, the most newsworthy first. Each is printed once a run. */
export const HEADLINES = {
  /** A Likeness unit was registered. */
  unit: [
    'WINDOW 3 REGISTERS A HOME ROBOT; OWNERS "THRILLED"',
    'LIKENESS: OUR UNITS "GIVE OFF NO VISIBLE LIGHT"',
    'REGISTRY ADMITS A HUMAN WITH A WARRANTY',
    'LIKENESS SHARES RISE ON NEWS FROM WINDOW 3',
    'NEWLY REGISTERED HUMAN ASKS WHERE TO SEND THE INCOME',
  ],
  /** Someone who broke a rule was registered. */
  fake: [
    '{NAME} REGISTERED. RULE {RULE} NOT CONSULTED.',
    'WINDOW 3 REGISTERS {NAME}; RULEBOOK "SURPRISED"',
    '{NAME} NOW HUMAN, SAYS REGISTRY. RULE {RULE} DISAGREES.',
    '{NAME}: "I DID NOT THINK THAT WOULD WORK"',
    'RULE {RULE} READ BY NOBODY, INQUIRY FINDS',
    'REGISTRY ADMITS {NAME}, WHO "DID THEIR BEST"',
  ],
  /** A human was challenged, and the court said so. */
  human: [
    'WINDOW 3 FINDS {NAME} NOT HUMAN. {NAME} SURPRISED.',
    'COURT CONFIRMS {NAME} HUMAN, AS {NAME} HAD SAID',
    '{NAME} SENT TO COURT FOR BEING HUMAN; RETURNS HUMAN',
    'WINDOW 3 ASKS {NAME} TO PROVE IT AGAIN',
    'HUMAN CHALLENGED AT WINDOW 3. HUMAN, IT TURNS OUT.',
    '{NAME} "STILL HUMAN" AFTER HEARING',
  ],
  /** The clerk challenged someone who broke a rule, and the jury found nothing: the court registered them. */
  court: [
    'HUMANITY COURT REGISTERS {NAME}; RULE {RULE} NOT RAISED',
    'JURY CLEARS {NAME}. JURORS "VOTED WITH THE OTHERS"',
    '{NAME} REGISTERED BY THE COURT. THE FILE WAS "VERY LONG"',
    'WINDOW 3 CHALLENGED {NAME}. THE JURY DID NOT FIND RULE {RULE}.',
    'THREE JURORS EXAMINE {NAME}; NONE REACHES RULE {RULE}',
    '{NAME} "DELIGHTED" WITH HUMANITY COURT',
  ],
  /** The clock ran out with people still waiting. */
  timeUp: [
    'QUEUE SENT HOME AT FIVE. QUEUE RETURNS.',
    '{COUNT} SENT HOME UNSEEN; WILL TRY AGAIN',
    'WINDOW 3 CLOSES ON TIME. QUEUE DOES NOT.',
    'CLOCK BEATS QUEUE, {COUNT} TO NIL',
    'HUMANS STILL QUEUING AT CLOSING TIME, MINISTRY CONFIRMS',
    'FIVE O\'CLOCK REACHES WINDOW 3 BEFORE {COUNT} APPLICANTS DO',
  ],
  /** Nothing went wrong. */
  clean: [
    'WINDOW 3: NOTHING TO REPORT',
    'REGISTRY GROWS BY {COUNT} HUMANS, ALL HUMAN',
    'CLERK DOES JOB. MINISTRY "CAUTIOUSLY OPTIMISTIC".',
    'NOTHING HAPPENS AT WINDOW 3, AGAIN',
    'A QUIET DAY AT WINDOW 3',
    'WINDOW 3 STAMPS EVERYTHING CORRECTLY; NOBODY NOTICES',
  ],
  /** No yesterday to report: the clerk started later in the week. */
  none: ['WINDOW 3 UNDER NEW MANAGEMENT', 'NEW CLERK AT WINDOW 3; MINISTRY "HOPEFUL"'],
} as const;

/**
 * Under the front page's photo of yesterday's faces: the day in figures. "{day}" is yesterday;
 * "{registered}", "{refused}" and "{home}" are counts.
 */
export const CAPTION = {
  figures: 'Window 3, day {day}: {registered} registered, {refused} refused.',
  home: ' {home} sent home at five.',
  /** A week begun later than day 1: the paper has no yesterday of this clerk's to print. */
  none: 'Window 3 has a new clerk this morning. The previous one has been moved to other duties.',
};

/** How the photo of yesterday's faces stamps each one. */
export const WALL_STAMPS = {
  registered: 'Registered',
  refused: 'Refused',
  court: 'By the court',
  home: 'Sent home',
  removed: 'Removed',
} as const;

/**
 * The morning of day 2: day 1's unit, which no rule could catch, is a home robot, and Rule 2 is the
 * Ministry's answer. The front page reprints the frame it lit up in, the one the clerk saw.
 */
export const ROBOT_STORY = {
  headline: 'HOME ROBOT CERTIFIES IT IS HUMAN. MINISTRY HAD NO FURTHER QUESTIONS.',
  /** When the clerk challenged it, and the court found no rule to uphold. */
  challenged: 'WINDOW 3 CHALLENGED A HOME ROBOT. THE COURT FOUND NO RULE.',
  caption: '{name}, frame 3 of her video. Her household confirms she is a Likeness unit. She has been withdrawn.',
};

/** The week's running stories, one line a morning: Likeness Robotics, the fork, Pat, the countdown. */
export const THREAD: Record<number, string> = {
  2: 'Likeness Robotics says the light is its night lamp: infrared, like a television remote’s. A phone camera sees it. People do not.',
  3: 'Window 2 has proposed leaving the Ministry, over a different interpretation of sybil. It is voting.',
  4: 'Likeness has taught its current units to wait out a blink before the night lamp comes on, as a good camera does. Older units have been dimmed.',
  5: 'Window 2 has left the Ministry, taking half the stationery, and says it is the real Ministry. Separately: Pat is practising.',
  6: 'A Likeness unit registered at Window 7 last month has been withdrawn, after an inquiry into its face. Window 7 has been sent Rule 2.',
  7: 'Registrations made two years ago expire today, clerks’ included. The income opens at five. Likeness says all known issues are resolved.',
};

/** The day 4 Gazette, when the clerk handed Likeness's letter in on day 3: the headline, unless a unit was registered, and the thread's first item. */
export const LIKENESS_FINED = {
  headline: 'LIKENESS ROBOTICS FINED FOR WRITING TO A CLERK',
  thread: 'Likeness Robotics has been fined for writing to a clerk at Window 3 with an offer. It has written to the clerk to apologise.',
};

/**
 * The Humanity Day special: the Gazette's last edition, beside the letter at the end of the week. The
 * income's price is the week's last punchline, told once, here. "{name}", "{day}", "{count}" and the
 * rest are filled from the week.
 */
export const SPECIAL = {
  masthead: 'Humanity Day · Special edition',
  headline: 'INCOME OPENS AT FIVE. ONE UBI IS WORTH 0.0003 PNK.',
  price: 'At that rate a registered human earns a day’s rent in fifteen years. The Ministry does not comment on the price of UBI.',
  week: 'The week at Window 3: {registered} registered, {challenged} challenged, {upheld} upheld in court.',
  noUnits: 'No home robots were registered at Window 3 this week.',
  units: 'Home robots registered at Window 3 this week: {units}.',
  unit: '{name} (day {day})',
  unitByCourt: '{name} (day {day}, by the court)',
  pat: 'Pat Oakes was registered on day {day}, at the {attempt} attempt.',
  attempts: ['first', 'second', 'third', 'fourth', 'fifth'],
  likeness: 'Likeness Robotics said it was disappointed by the price, and has withdrawn its remaining units from the queue.',
  /** And, if the clerk handed its letter in: */
  apology: 'It has also written to Window 3 again, to apologise for the last letter.',
  captions: {
    promoted: 'Robin Hale, of Window 3, promoted to Window 2.',
    reclassified: 'Registry equipment, Window 3: item 3-0417, a clerk.',
    superseded: 'Robin Hale, who starts at Window 3 on Monday.',
    replaced: 'Window 3, camera 2, 17:04.',
  },
  /** On the clerk's photograph, Reclassified: the inventory tag. */
  assetTag: '3-0417',
  /** Replaced: the hall camera's still, and what it shows, for a screen reader. */
  camera: {
    stamp: 'CAM 2 · 17:04',
    label: 'The hall camera over Window 3: a unit with the clerk’s face in the clerk’s chair. It blinks, and a light shows between its brows.',
  },
} as const;

/** Clipped to the Fired letter: the Gazette's small ads. */
export const VACANCY = 'Vacancy: clerk, Registry Window 3. Must be able to afford the Ministry. Apply at Window 3.';

/** One small notice a morning. */
export const SMALL_NOTICES: Record<number, string> = {
  2: 'The Ministry confirms that challenge deposits will be refunded shortly after.',
  3: 'Vouches are not sold in books of ten. The Ministry asks whoever is selling them to stop.',
  4: 'A referendum will settle which group chat is the Ministry’s. Voting is in the group chat.',
  5: 'A motion to transfer the treasury to its author has been dismissed as obviously an attack.',
  6: 'Jurors are reminded that they are paid for agreeing with each other, not for reading.',
  7: 'The Ministry does not comment on the price of UBI.',
};

/** The supervisor's letter on the desk on the first morning, where the Gazette will be from tomorrow. */
export const WELCOME = {
  title: 'Welcome to Window 3',
  lines: [
    'Humanity Day is in six days. At five o’clock on day 7, every registered human starts receiving an income. Everyone human wants to be registered by then. So does everything that has heard about the money.',
    'Open the window and press NEXT. Check each application against the rulebook on your right: one rule today, one more each morning. If it all agrees, ACCEPT. If not, CHALLENGE, and the court hears it at five.',
    'Not sure? INSPECT: point at two things, and the desk says whether they disagree. The second applicant will need it.',
  ],
  signature: 'S., Supervisor',
};

export function countdown(day: number) {
  const left = 7 - day;
  return left === 0 ? 'Humanity Day' : left === 1 ? 'Humanity Day tomorrow' : `Humanity Day in ${left} days`;
}
