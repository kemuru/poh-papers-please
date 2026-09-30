// Six o'clock on Humanity Day (notes/game-design.md, Endings): the hall at the first hour of the income, the
// last queue, and the board's answer. Everyone in the queue came for the money, and each says once what they
// want of it; one number answers them all. Nobody jokes: the Ministry reports, the applicants are sincere.
// The lines are chosen from the week by src/gen/finale.ts.

/** The hall itself, the lever, and the board. */
export const SIX = {
  /** The PA, as the scene opens: the first hour is paid, and the hall's lights keep their own hours. */
  pa: "Six o'clock. The first hour of the Universal Basic Income is now being paid at Window 3. The hall lights are on a timer.",
  /** Painted on the board over the numbers, as all week; then the first hour, and what it is paid in. */
  board: { label: 'NOW SERVING', paid: '0.0003', unit: 'PNK' },
  /** The lever: it calls the last queue one at a time, then pays. */
  lever: { next: 'Next', nextName: 'Next in the queue', pay: 'Pay', payName: 'Pay the first hour' },
  /** The small steel key in the corner, and Escape. */
  skip: 'To the letter',
  /** A card on the end of each bench, in the hall's own lettering. */
  benches: { here: 'WINDOW 3', there: 'WINDOW 2' },
  /** For a screen reader: the hall as it is, and what the dark shows. */
  hall: 'The waiting hall at six o’clock, the benches full.',
  dark: 'The hall lights go off, one by one.',
  lamps: 'In the dark, a light has come on between the brows of {count}: {here} on Window 3’s bench, {there} on Window 2’s.',
  noLamps: 'In the dark, nobody’s brows light up.',
  gone: 'The ones with the lights get up and leave.',
  /** "{value}": what the board shows. */
  boardName: 'Now serving: {value}',
};

/**
 * The Sybil Farm: three cousins with one face and three hats. Terry and Kerry share out whatever the face gets
 * (by how many of them the registry holds), and Perry has his own plan, which is his line from day 5.
 */
export const FARM_LINES = {
  terry: {
    0: "None of us is registered, so the face gets nothing. We're sharing it three ways.",
    1: "One of us is registered, so the face gets one income. We're sharing it three ways.",
    2: "Two of us are registered, so the face gets two incomes. We're sharing them three ways.",
    3: 'All three of us are registered, so the face gets three incomes.',
  },
  kerry: {
    // Registered or not, the rota stands.
    0: "Twenty minutes each. I've got the middle twenty.",
    1: "Twenty minutes each. I've got the middle twenty.",
    2: "Forty minutes each. I've got the middle forty.",
    3: "An hour each. We won't need the rota.",
  },
  perry: 'Different hat.',
} as const;

/** The Agent, collecting for its principal, who is busy: registered by the clerk, refused, or never at Window 3 this week. */
export const AGENT_LINES = {
  registered: "Thank you for registering my principal. I'm here for his first hour. He isn't free until the second.",
  refused: "My principal would still like his first hour. He isn't free until the second.",
  absent: "Good evening. I'm here for my principal's first hour. He isn't free until the second.",
};

/**
 * Likeness Robotics, by paper through the slot: another envelope if the clerk signed its letter on day 3, a second
 * apology if they handed it in, and otherwise a plain letter. It wants the same thing each way.
 */
export const LIKENESS_LINES = {
  head: 'Likeness Robotics Ltd',
  signed: 'Enclosed: 40 PNK. Please pay our units’ first hour to Likeness Robotics. We made them.',
  handedIn: 'We apologise again for our letter of day 3. Please pay our units’ first hour to Likeness Robotics. We made them.',
  letter: 'Please pay our units’ first hour to Likeness Robotics. We made them.',
};

/** The clerk's clone: the Robin Hale the registry kept, or the one Window 2 registered. */
export const ROBIN_LINES = {
  onFile: "I've come for Robin Hale's first hour. The registry says that's me.",
  windowTwo: "Window 2 registered me as Robin Hale. I've come for Robin Hale's first hour.",
};

/** Ethel: her line from the queue, unless she said it at the window this week. */
export const ETHEL_LINES = {
  paper: "I don't need the money. I need it on paper.",
  again: "I don't want the money. I want the receipt.",
};

/** Hortense Cobbold, the first person registered every week and the clerk's voucher on Humanity Day. */
export const HORTENSE_LINES = {
  registered: "I don't mind what it is, as long as I'm paid first.",
  /** Removed from the registry with the clerk, as their voucher, when the court upheld their own challenge. */
  removed: "I've been removed with the clerk. I'd like to be first in the queue on Monday.",
};

/** Socrates, last in the queue: the question the lever answers. */
export const SOCRATES_LINES = {
  registered: 'One last question. What is an hour of a human worth?',
  unregistered: 'I am not registered, so I only ask. What is an hour of a human worth?',
};

/** Pat, on the bench since the morning: the only line after the number. "{attempt}" is the attempt that got Pat in. */
export const PAT_LINES = {
  registered: "It's come through. {attempt} time lucky.",
  attempts: ['First', 'Second', 'Third', 'Fourth', 'Fifth'],
  unregistered: "It hasn't come through. I'll try again on Monday.",
};
