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
    'HOME ROBOT REGISTERED AS HUMAN. MINISTRY "LOOKING INTO IT".',
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
 * Yesterday's figures and one of the people behind them. "{day}" is yesterday; "{registered}",
 * "{challenged}", "{upheld}" are counts; "{name}" is someone who came to the window.
 */
export const REPORT = {
  figures: 'Day {day} at Window 3: {registered} registered, {challenged} challenged, {upheld} upheld in court.',
  welcomed: 'The Ministry welcomes {name} to the registry.',
  refused: '{name} was refused, and has been seen in the queue.',
  removed: 'Also removed: {voucher}, who vouched for {name}.',
  none: 'The previous clerk has been moved to other duties.',
};

/** Each morning's new rule, as a Ministry notice with its cause. Day 7 has no new rule. */
export const RULE_NOTICES: Record<number, string> = {
  2: 'Following yesterday’s registration of a photograph of a more attractive man, the photograph must now be of the applicant, facing the camera and not mirrored.',
  3: 'A registration was claimed yesterday with someone else’s wallet. Applicants must now hold up their wallet address, in full, in their video.',
  4: 'Following the registration at Window 6 of a man who vouched for himself, each applicant must now be vouched for by one registered human, not themselves. The registry lookup is open at Window 3.',
  5: 'Following the registration of one face four times at Window 5, in four hats, a face may now be registered once.',
  6: 'Following the registration of a man born in 470 BC, applicants must now be living: born between 1900 and today, and seen to blink.',
  7: 'There is no new rule today. Rule 0 remains in force, as it always has. Clerks whose registrations expire today will be renewed at their own windows, like anyone. The Universal Basic Income opens at five o’clock.',
};

/** The week's running stories, one item a morning: the countdown, the fork, Pat, the Likeness units. */
export const THREAD: Record<number, string> = {
  2: 'Queues are expected to grow before Humanity Day. The queue has been told, and has grown. Likeness Robotics reminds owners that its home units are not eligible for the income, "at present". It adds that the light between a unit’s brows when it shuts its eyes is a night lamp, and a standard feature.',
  3: 'Window 2 has proposed leaving the Ministry, over a different interpretation of sybil. It is voting. Likeness Robotics confirms that its home units blink, for the comfort of the household, and see perfectly well while doing so.',
  4: 'Window 2 is voting. Under its rules the vote has an automatic extension of six months. Likeness Robotics has dimmed the night lamp in its older units, in response to customer feedback.',
  5: 'Window 2 has left the Ministry, taking half the stationery, and says it is the real Ministry. Separately: Pat is practising.',
  6: 'A Likeness unit registered at Window 7 last month has been withdrawn, after an inquiry into its face. Window 7 has been sent a copy of Rule 0.',
  7: 'The income opens at five. It is paid by the hour, for life, one income per human. Likeness Robotics says all known issues with its units have been resolved.',
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

/** The supervisor's letter on the desk on the first morning, where the Gazette will be from tomorrow. At the narrowest desk (1240×820) it leaves about a line of the blotter free; any longer, and the hall shrinks for it until the window opens (e2e/rule0.spec.ts). */
export const WELCOME = {
  title: 'Welcome to Window 3',
  lines: [
    'Humanity Day is in six days. At five o’clock on day 7 every registered human starts receiving an income: one UBI an hour, for life. Everyone who is human wants to be registered by then. So does everything that has heard about the money.',
    // \u00a0 is a no-break space: "Rule 0" is never split across two lines.
    'Open the window and press NEXT. Read the papers against the rulebook on your right, starting with Rule\u00a00: the registry is for real humans. If everything agrees, ACCEPT. If not, CHALLENGE: the case goes to court at five.',
    // The first unit comes today, and nothing at the window gives it away: what it is, and why it lights up.
    'Rule\u00a00 is read in the video, not at the window. Some applicants are home robots with human faces. Their eyes are cameras: when one blinks, a night lamp between its brows comes on to see by. It is infrared: only the video sees it (Fig.\u00a00-2).',
    'If you are not sure, INSPECT: point at two things and the desk will tell you if they disagree. The second applicant today will need it.',
  ],
  signature: 'S., Supervisor',
};

export function countdown(day: number) {
  const left = 7 - day;
  return left === 0 ? 'Humanity Day' : left === 1 ? 'Humanity Day tomorrow' : `Humanity Day in ${left} days`;
}
