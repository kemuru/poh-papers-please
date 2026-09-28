// The words on the clerk's end-of-day statement. The amounts live in src/economy.

export const RENT = 'Rent';

/** Gas fees by day. The network gets busier as the week goes on. */
export const GAS_FEES = [
  'Gas fees',
  'Gas fees',
  'Gas fees (network busy)',
  'Gas fees (network very busy)',
  'Gas fees (a home robot is minting)',
  'Gas fees (the home robot is still minting)',
  'Gas fees (network calm; nobody knows why)',
] as const;

/** One odd bill a day, one of two chosen by the seed. */
export const ODD_BILLS: readonly (readonly [string, string])[] = [
  ['Ministry lanyard (compulsory)', 'Staff photograph (you blinked)'],
  ["Your cat's hardware wallet", 'Replacement stamp ink (green)'],
  ['Seed phrase storage (a small safe for one piece of paper)', 'Vouching insurance (robots not covered)'],
  ['Bucket, for the ceiling', 'Ceiling inspection (you are liable)'],
  ['Pigeon removal (partial)', 'Catering for the jury (the jury has not arrived)'],
  ['Philosophy course (compulsory, after an incident)', 'Membership of the other Ministry (automatic)'],
  ['Leaving card for the Ministry plant', 'Renewal of your own humanity (annual)'],
];
