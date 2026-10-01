// The notice board in the hall, where the Ministry opens (slice 6): the week under way, a vacancy,
// today's week, the night shift, the letters found and the clerk's record. Buttons say plainly what
// they do; the Ministry's voice is in the notices around them.
import type { EndingId, LetterId } from '../economy/endings';

export const BOARD = {
  /** The poster's head and foot: who printed it, and where it hangs. */
  ministry: 'Ministry of Humanity',
  window: 'Registry Window 3',
  title: 'Proof of Humanity',
  subtitle: 'Papers, Please',
  week: { head: 'Your week', continue: 'Continue' },
  vacancy: {
    head: 'Clerk wanted',
    lines: ['Registry Window 3. Seven days, until Humanity Day.', 'Humans only.'],
    action: 'Start a new week',
  },
  today: {
    head: 'Daily week',
    line: 'The same week for every clerk today, to compare.',
    action: 'Play the daily week',
    again: 'Play it again',
    resume: 'Continue the daily week',
    finished: 'Finished: {letter}, {savings} PNK.',
    copy: 'Copy my week',
    copied: 'Copied.',
    /** Where a browser will not let the page copy. */
    uncopied: 'Your browser would not let the Ministry copy it.',
  },
  night: {
    head: 'The Ministry never closes',
    locked: 'Opens once a week has ended with a letter.',
    line: 'Every rule in force, and no court. Three citations and the shift is over.',
    best: 'Best: {count} stamped right.',
    action: 'Take the night shift',
  },
  letters: { head: 'Letters found', count: '{found} of {all}', unfound: 'Not found yet' },
  record: {
    head: 'The clerk’s record',
    weeks: 'Weeks finished',
    savings: 'Best savings',
    grade: 'Best grade',
    night: 'Longest night',
    none: '—',
    pnk: '{savings} PNK',
    class: '{grade} Class',
    stamped: '{count} stamped right',
  },
  setAside: 'The Ministry has revised its forms since your last visit. Your week could not be kept.',
  /**
   * "Copy my week": whose week the card is (today's, by its date, or any other, by its number), then a row of
   * squares a day, and the letter, the grade and the savings. Nobody's name.
   */
  card: {
    today: 'Today’s week, {date}',
    week: 'Week {seed}',
    head: 'Registry Window 3 · {title}',
    day: 'Day {day} {marks}',
    savings: '{savings} PNK',
    letters: {
      fired: 'Terminated',
      replaced: 'Replaced',
      superseded: 'Superseded',
      reclassified: 'Reclassified',
      promoted: 'Promoted',
    } satisfies Record<EndingId, string>,
    grade: { clerk: 'Clerk, {grade} Class', equipment: 'Equipment, {grade} Class' },
  },
  /** The stamp on Likeness's letter, once found: it is not the Ministry's. */
  likenessStamp: 'Likeness',
  confirm: {
    title: 'Start another week?',
    line: 'The week under way will be shredded: {days} at the window and {savings} PNK in savings.',
    keep: 'Keep my week',
    yes: 'Start another week',
    day: '1 day',
    days: '{n} days',
  },
  regions: { board: 'Notice board', notices: 'Notices' },
};

/** How each letter is pinned to the board until it is found: one line that points at the choice, never at the answer. */
export const LETTER_HINTS: Record<LetterId, string> = {
  promoted: 'Your own papers, one way.',
  reclassified: 'Your own papers, the other way.',
  superseded: 'A better haircut, on day 6 of some weeks.',
  replaced: 'Three home robots in one week.',
  fired: 'An empty account.',
  headhunted: 'A letter on day 3, signed.',
};
