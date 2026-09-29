// "The Ministry never closes" (slice 6): the night shift, unlocked by any letter. Every shift is
// another week's day 6, the day before Humanity Day, which does not come. No court: the rulebook's
// verdict comes at once, and three citations end the night.

export const NIGHT = {
  title: 'The Ministry never closes',
  card: {
    shift: 'Night shift {n}',
    lines: [
      'It is the day before Humanity Day, as it always is now.',
      'Every rule is in force, and there is no court tonight: the rulebook’s verdict comes at once.',
      'Three citations and the night is over.',
    ],
    tally: 'Stamped right so far: {right}. Citations: {citations} of 3.',
  },
  /** On the slip for a fake stamped in, or a human challenged. */
  citation: 'Citation {n} of 3',
  terms: 'Three citations and the night is over.',
  wronged: 'Offence: challenged an applicant who broke no rule.',
  /** On the slip for a fake challenged: the verdict, at once. */
  refused: 'Refused',
  window: 'The queue is done. Another is on its way.',
  /** The clock ran out on the queue: they go home, and the night goes on. */
  timeUp: 'Time. Whoever is left goes home, and another queue is on its way.',
  /** On the slip for a fake refused. "{name}" is theirs. */
  caseTitle: 'The Registry v. {name}',
  refusedLead: 'Broke',
  end: {
    title: 'Window 3 is closed for the night',
    stamp: 'Closed',
    lines: ['The Ministry never closes. Window 3, however, has.', 'You stamped {right} right, over {shifts}.'],
    shift: '1 shift',
    shifts: '{n} shifts',
    best: 'Your best night: {best} stamped right.',
    again: 'Take the night shift again',
  },
  topbar: { right: 'Stamped right', citations: 'Citations', count: '{n} of {all}' },
};
