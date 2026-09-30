// What the strip along the bottom of the blotter says while the clerk works: inspect mode's answers,
// the one guided inspection of day 1, and how to use each registry tool the day it arrives.

export const INSPECT_LINES = {
  /** "{rule}" is the rule's name: "Rule 1: The phrase". */
  found: 'Discrepancy under {rule}.',
  notInForce: 'These disagree, but no rule in force covers it. Yet.',
  agree: 'No discrepancy.',
  second: 'And the second thing?',
  point: 'Inspect: point at two things on the desk.',
  guidedHint: 'This one needs a closer look. Press INSPECT.',
  guidedPoint: 'Point at the transcript, then at Rule 1 in the rulebook.',
  guidedFound: 'Now challenge.',
};

/**
 * For the first applicant on the day a registry tool arrives with its rule, until the tool is used:
 * how to use it, never whether it is needed.
 */
export const NEW_TOOL_TIPS = {
  vouch: { tool: 'name', text: 'New today: the registry. Press V, or Look up, to see the voucher on its books.' },
  duplicate: { tool: 'face', text: 'New today: the face search. Press F, or Search this face, to see who is on file with it.' },
} as const;

/** Likeness Robotics' letter on the morning of day 3 (notes/game-design.md, The offer): the week's one temptation. */
export const OFFER_LETTER = {
  /** The letterhead: the company, and the department writing. */
  head: 'Likeness Robotics Ltd',
  dept: 'Partner programme',
  lines: [
    'Dear Clerk,',
    'Some households would like their Likeness units registered before Humanity Day. So would we.',
    'For every unit Window 3 registers, we will leave 40 PNK on your desk the next morning, in an envelope.',
    'Discretion appreciated.',
  ],
  sign: 'Likeness Robotics Ltd, a company',
  signIt: 'Sign it',
  handIn: 'Hand it in',
  /** In the strip along the blotter once it is signed. */
  signed: 'Signed. The letter is in the drawer.',
  /** In the strip along the blotter, if the window opens with the letter still on the desk. */
  drawer: 'The letter goes in the drawer, unsigned.',
};

/** On the morning after the clerk stamped in a unit, if the letter was signed. "{amount}" in PNK; "{names}" are yesterday's units. */
export const ENVELOPE = {
  head: 'Likeness Robotics Ltd',
  lines: ['Enclosed: {amount} PNK, for {names}.', 'With thanks. Discretion appreciated.'],
};

/** The supervisor's second note, stuck to the morning paper. "{count}" is how many home robots, in words. */
export const SECOND_NOTES = {
  handedIn: 'Thank you for the letter. Legal has it.',
  twoUnits: 'Two home robots this week. One more and Likeness will want your chair.',
  moreUnits: '{count} home robots this week. Likeness has asked for the measurements of your chair.',
};

/** Numbers as the Ministry writes them in a sentence. */
export const COUNT_WORDS = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
