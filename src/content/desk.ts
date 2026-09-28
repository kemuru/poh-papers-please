// What the strip along the bottom of the blotter says while the clerk works: inspect mode's answers,
// the one guided inspection of day 1, and how to use each registry tool the day it arrives.

export const INSPECT_LINES = {
  found: 'Discrepancy',
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
