// The notice board in the hall, where the Ministry opens (slice 6): the week under way, a vacancy,
// today's week, the night shift, the letters found and the clerk's record. Buttons say plainly what
// they do; the Ministry's voice is in the notices around them.
import type { LetterId } from '../economy/endings';

export const BOARD = {
  kicker: 'Ministry of Humanity · Registry Window 3',
  title: 'Proof of Humanity',
  subtitle: 'Papers, Please',
  week: { head: 'Your week', continue: 'Continue' },
  vacancy: {
    head: 'Clerk wanted',
    lines: ['Registry Window 3. Seven days, until Humanity Day.', 'Humans only.'],
    action: 'Start a new week',
  },
  today: {
    head: 'Today’s week',
    line: 'The same week for every clerk today.',
    action: 'Begin today’s week',
    again: 'Begin it again',
    resume: 'Continue today’s week',
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
  letters: { head: 'Letters found', count: '{found} of {all}' },
  record: {
    head: 'The clerk’s record',
    weeks: 'Weeks finished',
    savings: 'Best savings',
    grade: 'Best grade',
    night: 'Longest night',
    none: '—',
  },
  setAside: 'The Ministry has revised its forms since your last visit. Your week could not be kept.',
  confirm: {
    title: 'Start another week?',
    line: 'The week under way will be shredded: {days} at the window and {savings} PNK in savings.',
    keep: 'Keep my week',
    yes: 'Start another week',
  },
};

/** How each letter is pinned to the board until it is found: one line that points at the choice, never at the answer. */
export const LETTER_HINTS: Record<LetterId, string> = {
  promoted: 'Your own papers, one way.',
  reclassified: 'Your own papers, the other way.',
  superseded: 'A better haircut, on day 6.',
  replaced: 'Three home robots in one week.',
  fired: 'An empty account.',
  headhunted: 'A letter on day 3, signed.',
};
