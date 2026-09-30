// The recurring cast (who they are: notes/game-design.md): their forms, their lines, their exits.
// Only characters the portrait generator can draw are here. The regulars are valid under every
// rule, so each comes once a week: registered once, they would be a duplicate from day 5.
// The Likeness units and the Agent never are valid; Pat is, in the end. Everyone is sincere.
import type { Portrait } from '../gen/portrait';
import { PHRASE } from '../rules/phrase';
import { CAST_PORTRAITS, CLERK_PORTRAIT, UNIT_ON_FILE } from './portraits';

export type RegularId = 'brenda' | 'grandmaEthel' | 'socrates' | 'nervousNigel' | 'robOtt' | 'nightShiftDawn' | 'dave' | 'sybilVance';
export type CastId =
  | RegularId
  | 'unit'
  | 'pat'
  | 'patMother'
  | 'twins'
  | 'sybilFarm'
  | 'agent'
  | 'deepfake'
  | 'cutout'
  | 'clone'
  | 'influencer'
  | 'binns'
  | 'clerk';

type Exits = { accept: string; challenge: string };

type Regular = {
  name: string;
  address: string;
  birthYear: number;
  portrait: Portrait;
  /** What they say in the video. Every line contains the phrase word for word. */
  videos: readonly string[];
  /** What they say at the window; the week's seed picks one. */
  remarks: readonly string[];
  exits: Exits;
  /** Blinks in more than one frame. */
  nervous?: true;
};

export const REGULARS: Record<RegularId, Regular> = {
  /** So normal she is suspicious. */
  brenda: {
    name: 'Brenda Blandford',
    address: '22 Formsworth Lane, Greyford',
    birthYear: 1979,
    portrait: CAST_PORTRAITS.brenda,
    videos: [PHRASE, `${PHRASE} Thank you.`],
    remarks: [
      'Hello. Just the registration, please.',
      'No remarks.',
      "I've brought everything on the list. And the list.",
      'Lovely weather for it.',
      'I had toast this morning. With butter. A normal amount.',
      "I'm happy to wait.",
      'Nothing unusual to report.',
    ],
    exits: { accept: 'Thank you.', challenge: 'Oh. All right.' },
  },
  /** Born 1922. Fierce. */
  grandmaEthel: {
    name: 'Ethel Pargeter',
    address: '3 Rubber Stamp Mews, Old Stampton',
    birthYear: 1922,
    portrait: CAST_PORTRAITS.grandmaEthel,
    videos: [`${PHRASE} Write that down.`, `Now listen. ${PHRASE}`, `${PHRASE} I won't say it twice.`],
    remarks: [
      'I was human before this building was.',
      'Born 1922. Still here. Stamp it.',
      "I've buried two husbands and a Ministry. I can wait for a stamp.",
      "Don't look at me like that. I've been human longer than you've been anything.",
      "I've brought a cake for the jury. They're not getting any.",
      'My doctor says I am remarkable. Put that down somewhere.',
      "I don't need the money. I need it on paper.",
    ],
    exits: { accept: 'About time.', challenge: "I'll see you in court. I'll bring my handbag." },
  },
  /** Says the phrase perfectly, then asks what it means. */
  socrates: {
    name: 'Socrates',
    address: 'The Steps, Agora Square, Old Stampton',
    birthYear: -470,
    portrait: CAST_PORTRAITS.socrates,
    videos: [
      `${PHRASE} But what is a human?`,
      'I certify that I am a real human, whatever that is, and that I am not already registered in this registry.',
      `Very well. ${PHRASE}`,
    ],
    remarks: [
      "Before we begin: what do you mean by 'human'?",
      'I know that I know nothing. Except the sentence.',
      'Is the registry itself registered in the registry?',
      'I had a jury of five hundred once. I would not recommend it.',
      'The form has very few boxes for questions. I have brought my own.',
      'Who registers the registrars?',
      'You judge many people here. Does anyone judge you?',
    ],
    exits: { accept: "Thank you. But what does 'registered' mean?", challenge: 'Excellent. A trial. I have some experience.' },
  },
  /** Sweats. Overshares. Blinks far too much. */
  nervousNigel: {
    name: 'Nigel Tuttle',
    address: '41 Lower Queue Road, Queuesbury',
    birthYear: 1998,
    portrait: CAST_PORTRAITS.nervousNigel,
    videos: [
      `${PHRASE} I love having bones.`,
      'I certify that I am a real human and, sorry, that I am not already registered in this registry. Sorry.',
      `${PHRASE} I have all my teeth.`,
    ],
    remarks: [
      'I love having bones. All two hundred and six. I counted. Not personally.',
      "Is it hot in here? It's hot. I'm hot because I'm warm-blooded. Like a human.",
      'I have all my organs. On the inside, where they go.',
      'Sorry. I blink a lot when I am nervous. Which is always. Which is human.',
      "I had a dream I wasn't human. Then I woke up and I was. Huge relief.",
      "Do you need a fingerprint? I've got ten. You can pick.",
      "I've been sweating since the car park. That's a very human thing to do, isn't it?",
    ],
    exits: { accept: 'Thank you. Thank you. Sorry. Thank you.', challenge: "Okay. Okay. That's fine. I'm fine." },
    nervous: true,
  },
  /** A human whose name makes machines suspicious. Fails every CAPTCHA. */
  robOtt: {
    name: 'Rob Ott',
    address: '9 Carbon Row, East Filing',
    birthYear: 1991,
    portrait: CAST_PORTRAITS.robOtt,
    videos: [PHRASE, `Yes, that's my real name. ${PHRASE}`],
    remarks: [
      'My parents thought the name was funny. They were right, once.',
      "Please don't ask me to click on the traffic lights. I never get all of them.",
      "People expect me to beep. I don't beep.",
      "It's been my name my whole life. It hasn't got funnier.",
      "The bank's computer won't let me in. It's personal now.",
      "I've been asked if I'm a robot four times today. You're the first one who's paid to.",
      "I've failed every picture of a bus I've been shown. I know what a bus is.",
    ],
    exits: { accept: "Thank you. I'll tell the bank.", challenge: "It's the name, isn't it." },
  },
  /** Does nights on the Ministry's door. Yawns through the phrase, between its words, never inside one. */
  nightShiftDawn: {
    name: 'Dawn Hollis',
    address: '5 Pending Way, Upper Pendingham',
    birthYear: 1986,
    portrait: CAST_PORTRAITS.nightShiftDawn,
    videos: [
      'I certify that I am a real (yawns) human and that I am not already registered in this registry.',
      'I certify that I am a real human and that I am not already regis... (yawns) Sorry. Registered in this registry.',
      'I certify (yawns) that I am a real human and that I am not already registered in this registry. Excuse me.',
    ],
    remarks: [
      "Sorry about the mask. It's the middle of my night.",
      "I do nights here. Security. I've never seen the hall with people in it.",
      "I've checked this window every night for six years. It's nice to see it from the front.",
      "Something plugs itself in out the back every night. I've never asked.",
      "I could have come in the back way. It didn't seem fair on the queue.",
      "The income is paid every hour. Even the ones I sleep through. That's the bit I like.",
      'I recorded the video on my break. Four in the morning. I think it shows.',
    ],
    exits: { accept: 'Thank you. Back to bed, then.', challenge: "Fine. I'll be here tonight anyway." },
  },
  /** A real human in a robot costume, on his way to a children's party. The head comes off. */
  dave: {
    name: 'Dave Pickering',
    address: '31 Inkwell Terrace, Sallowfield',
    birthYear: 1983,
    portrait: CAST_PORTRAITS.dave,
    videos: [`${PHRASE} I'm due at a party at two.`, `Right. ${PHRASE}`],
    remarks: [
      "I'm on my way to a children's party. I'm the robot. I'm not a robot.",
      "The head comes off. That's the costume's head. This one's mine.",
      "I've been stopped four times on the way here. People are very alert about robots this week.",
      "It's cardboard and tinfoil. Under the tinfoil, it's me.",
      "They're paying me in cake. From Sunday, also in income.",
      'I kept the head off for the photo. It seemed only fair.',
      "The birthday boy asked for a robot. It's been a big week for robots.",
    ],
    exits: { accept: "Brilliant. I'll put the head back on outside.", challenge: "It's the costume, isn't it. It's always the costume." },
  },
  /** A real human called Sybil. Just the one of her. */
  sybilVance: {
    name: 'Sybil Vance',
    address: '4 Pending Way, Little Ledgerby',
    birthYear: 1974,
    portrait: CAST_PORTRAITS.sybilVance,
    videos: [PHRASE, `${PHRASE} Just the one of me.`],
    remarks: [
      "Sybil. Just the one of me. People ask.",
      "The website said 'Sybil detected' and closed. I was only typing my name.",
      'My bank asks how many of me there are. One. There is one.',
      'My sister is called Hope. Nobody asks her anything.',
      "I've got one face, one address and one of everything. It's quite a small life.",
      "My mother liked the name. She didn't know what it would mean to computers.",
      "I've been flagged three times this week. I've never been flagged for anything.",
    ],
    exits: { accept: 'Thank you. Just the one stamp, then.', challenge: "It's the name. It's always the name." },
  },
};

/** The makers of the units. */
export const LIKENESS = 'Likeness Robotics Ltd';

/**
 * Likeness units: home robots with human faces, sold to households, some of which have heard about
 * the income. One comes to Window 3 on each of days 1 to 6, each with a new face and the ordinary
 * name its household gave it, living on an ordinary street. Nothing at the window gives a unit away,
 * its remarks are ordinary and its photo is flawless. A unit sees through cameras in its eyes, and
 * blinks for the people in the room. The units of days 1, 2, 3 and 6 are older household models:
 * whenever the lids shut, even for a blink, the cameras are in the dark and a night lamp comes on
 * between the brows. It is infrared, like a television remote's: people cannot see it, a phone camera
 * can, so their videos give them away (Rule 2), in every frame with the eyes shut. Day 1's unit breaks
 * no rule: no rule reads a face until day 2, which brings Rule 2 because of it. The lamp is smaller as the week goes on (the day 4
 * Gazette says why). Days 4 and 5 are the current model, whose lamp waits out a blink. Day 4 its
 * papers give it away: it is vouched for by its maker, which is a company, not a registered human.
 * Day 5 its face does: the factory made that face twice, and Window 7 registered the other unit
 * last month. Each unit breaks that one rule only.
 */
export const UNITS: readonly { name: string; address: string; birthYear: number; wallet: string; remark: string }[] = [
  { name: 'Clara Voss', address: '48 Lower Queue Road, Greyford', birthYear: 1991, wallet: '0x215BBEC90CD9D5825C31023B411C004D3AC92F0D', remark: "Good morning. I've been looking forward to this all week." },
  { name: 'Martin Ellery', address: '11 Rubber Stamp Mews, East Filing', birthYear: 1987, wallet: '0x1ECA3A5ED40E154FA8B39E32029E3A02290E65E4', remark: 'I brought my own pen. People like it when you bring your own pen.' },
  { name: 'Joanna Pike', address: '30 Triplicate Avenue, Queuesbury', birthYear: 2001, wallet: '0x96359836FDDD0411E76CA08E0E3D933868CBC450', remark: "I've come straight from work. I'm in logistics." },
  { name: 'Theo Marlow', address: '12 Inkwell Terrace, Little Ledgerby', birthYear: 1994, wallet: '0x13481A814871A50CCEAF2F0FF793A44404F8CB32', remark: "I'm on my lunch break. I've an hour, if that helps." },
  { name: 'Ruth Calloway', address: '17 Carbon Row, Old Stampton', birthYear: 1989, wallet: '0x6017A3641E430A189E385D455E32A93E21F72AD8', remark: "I've taken the morning off. First time this year." },
  { name: 'Simon Aldous', address: '9 Formsworth Lane, Upper Pendingham', birthYear: 1958, wallet: '0x2E5EAAC998646BA2F85AB208C1F396CAEC796D15', remark: "I'm told the income is paid by the hour. That seems fair." },
  { name: 'Lydia Crane', address: '27 Paperclip Crescent, Greyford', birthYear: 1985, wallet: '0x7C41D0A9E3B2F58C11A6E0D94B3C27F5A08D6E91', remark: "Happy Humanity Day. I've been counting the hours." },
];

export const UNIT_EXITS = { accept: 'Thank you. That was very efficient.', challenge: "I understand. I'll wait to hear from the court." };

/**
 * The Binnses of 16 Staple Street, registered long ago, who each own a unit and vouch for the day 5 and
 * day 6 units. Removed from the registry with them, they come back on Humanity Day, together, having
 * sold the units: Wendell first, then Vera, whom Wendell vouches for. Nothing they say is about the
 * registry, which may still have them: if the clerk let their unit in, they were never removed.
 */
export const UNIT_OWNERS = [
  {
    day: 5,
    name: 'Wendell Binns',
    address: '16 Staple Street, Greyford',
    birthYear: 1948,
    back: {
      remark: "We've sold the robots. Both of them. My wife's behind me. She's never been nervous before.",
      video: `${PHRASE} Just me, this time.`,
      exits: { accept: "Thank you. Vera! It's you next.", challenge: "Right. We'll see what the court says." },
    },
  },
  {
    day: 6,
    name: 'Vera Binns',
    address: '16 Staple Street, Greyford',
    birthYear: 1951,
    back: {
      remark: 'The robots have gone to a good home. Well. A home. Wendell is vouching for me.',
      video: `${PHRASE} And that's the last of the Binnses.`,
      exits: { accept: "Lovely. Now there's just the two of us. As it was.", challenge: "Well. We've been through worse. We had robots." },
    },
  },
] as const;

/** The unit Window 7 registered last month, next door to the Binnses, with the day 5 unit's face. Withdrawn on the morning of day 6. */
export const UNIT_ON_FILE_RECORD = {
  name: 'Nina Penrose',
  address: '14 Staple Street, Greyford',
  birthYear: 1990,
  face: UNIT_ON_FILE,
  window: 'Window 7',
  withdraws: 6,
};

/** You. Registered before the week, like every clerk. Your clone has your name as well. */
export const CLERK = { name: 'Robin Hale', address: '2 Inkwell Terrace, Greyford', birthYear: 1989, face: CLERK_PORTRAIT };

/**
 * Humanity Day: your own registration expires that morning, and renewal needs a new photo and video, so
 * the last applicant of the week is you. The supervisor filmed the video before nine, after a week at
 * the window. Nobody stands at the window: your reflection is in the glass, and nobody says anything.
 */
export const RENEWAL = {
  video: 'I certify that I am a real clerk and that I am not already registered in this registry.',
  /** In the speech box while your own papers are on the desk. */
  remark: 'Nobody comes to the window. Your own papers come through the slot.',
  exits: {
    accept: 'You stamp your own form. It makes the same noise as all the others.',
    challenge: 'You file a case against yourself. The printer does not hesitate.',
  },
};

/**
 * Pat: a real human the rules keep failing, each visit on the newest rule, each visit better
 * prepared. Day 1 nerves (the tutorial's second applicant); day 2 a rehearsed phrase and a photo
 * taken in a mirror; day 3 a laminated sign, two characters wrong; day 4 a voucher, Pat's mother,
 * who is three places behind in the queue; day 6 everything right. No remark gives the fault away.
 */
export const PAT = {
  name: 'Pat Oakes',
  address: '7 Paperclip Crescent, Queuesbury',
  birthYear: 1990,
  days: {
    1: {
      remark: "I've practised it all the way here. I'm fine. I'm very fine.",
      video: 'I certify that I am a real hooman and that I am not already registered in this registry. Sorry.',
    },
    2: {
      remark: "I've learned it by heart this time. Do you want to hear it? You've got the video. Fine.",
      video: PHRASE,
    },
    3: {
      remark: "I've laminated the sign. It won't smudge. It'll outlive me.",
      video: `Here's the sign. ${PHRASE}`,
    },
    4: {
      remark: "I've brought my mother. She's vouching for me. She's very proud.",
      video: PHRASE,
    },
    6: {
      remark: "Fifth time. I've checked everything twice. My mother checked it three times.",
      video: `${PHRASE} Thank you.`,
    },
  } as Record<number, { remark: string; video: string }>,
  exits: { accept: 'Oh! Thank you. Thank you.', challenge: "That's all right. I'll come back tomorrow." },
};

/** Pat's mother, three places behind Pat on day 4. Ethel vouches for her: they play bridge. */
export const PAT_MOTHER = {
  name: 'Maureen Oakes',
  address: PAT.address,
  birthYear: 1957,
  remark: "I'm Pat's mother. I'm here for Pat, mostly. But since I'm here.",
  video: `${PHRASE} Hello, Pat.`,
  exits: { accept: 'Lovely. Now I can vouch for Pat.', challenge: 'Well. Pat will be disappointed.' },
};

/** Identical twins, arriving separately. The second films her video with the first, as twins must. */
export const TWINS = [
  {
    name: 'Ivy Marsh',
    remark: "I've a twin. She's coming in later. We don't do everything together.",
    video: PHRASE,
    exits: { accept: "Thank you. She'll be pleased for me. Then jealous.", challenge: "Oh. Is it the face? It's her face as well." },
  },
  {
    name: 'Iris Marsh',
    remark: "We're twins. People say we look alike. We don't see it.",
    video: `${PHRASE} And that's my sister.`,
    exits: { accept: "Thank you. That's both of us, then.", challenge: "Is it the face? It's her face as well." },
  },
] as const;
export const TWINS_FORM = { address: '2 Carbon Row, Sallowfield', birthYear: 1995 };

/**
 * The Sybil Farm: three cousins with one face, three hats and one address, one after another on
 * day 5. The first one registered is a human; the rest are that face again.
 */
export const SYBIL_FARM = {
  address: 'The Farm, Lower Pendingham',
  birthYear: 1988,
  cousins: [
    { name: 'Terry Farrow', remark: "Morning. There's a few of us today. I'm the first.", video: PHRASE },
    { name: 'Kerry Farrow', remark: "I'm Terry's cousin. We get that a lot.", video: PHRASE },
    { name: 'Perry Farrow', remark: 'Different hat.', video: PHRASE },
  ],
  exits: { accept: 'Cheers.', challenge: 'Fair enough.' },
};

/**
 * An AI agent with a wallet, applying on behalf of its principal, who is busy. Flawless manners,
 * a sincere wish to help. Its video is generated, so Rule 6 always catches it, and it trips on one
 * more thing a machine would: it puts the sentence in its own words, it brings the address as a QR
 * code, or it gives its version as its year of birth.
 */
export const AGENT = {
  name: 'Alex Proxy',
  address: '100 Carbon Row, East Filing',
  birthYear: 2024,
  version: 'v4',
  paraphrase: 'I hereby confirm that I am a genuine human person and not previously enrolled in this registry.',
  // Said aloud the way an agent writes: it never mentions what it got wrong, only its manners.
  remarks: {
    phrase: 'Good morning. I hope this finds you well.',
    sign: 'I have a vision impairment, before you ask.',
    living: 'Thank you for your time today. I know how valuable it is.',
  },
  exits: { accept: "Thank you. I'll let my principal know when he's free.", challenge: "Understood. I'll reschedule. I have a great deal of free time." },
};

export const DEEPFAKE = {
  name: 'Jordan Vale',
  address: '60 Triplicate Avenue, Greyford',
  birthYear: 2001,
  remark: "Hello. I'm a very ordinary person. I've come about the income, like everyone.",
  exits: { accept: 'Thanks.', challenge: 'Okay.' },
};

/** Someone holds up a printed face. The voice comes from behind it. */
export const CUTOUT = {
  name: 'Colin Stannard',
  address: '8 Formsworth Lane, Little Ledgerby',
  birthYear: 1979,
  remark: "Hello. Sorry, I've a bit of a cold.",
  video: PHRASE,
  exits: { accept: "Great. Thanks. He's very pleased.", challenge: "Right. We'll go, then." },
};

/** Your name, your face, a better haircut. */
export const CLONE = {
  remark: "Morning. I've had my hair done for this.",
  video: PHRASE,
  exits: { accept: "Thank you. I'll take it from here.", challenge: "Fair. I'd have done the same." },
};

/** Valid on day 1. From day 2 the photo rule notices the filter. */
export const INFLUENCER = {
  name: 'Skye Lumen',
  address: '1 Paperclip Crescent, Old Stampton',
  birthYear: 2002,
  remark: "The photo's got a filter on. It's called Natural.",
  video: `Hi everyone. ${PHRASE}`,
  exits: { accept: 'Amazing. Can I get a photo with the stamp?', challenge: 'Honestly? Okay.' },
};

/** The first applicant of the week, the same every week: an ordinary person with nothing wrong. */
export const FIRST_APPLICANT = {
  name: 'Hortense Cobbold',
  address: '9 Inkwell Terrace, Greyford',
  birthYear: 1961,
  remark: "Am I the first? I've never been the first for anything.",
  video: `Okay. ${PHRASE}`,
  exits: { accept: 'First! Thank you.', challenge: 'Oh. First for that, then.' },
};

/**
 * Day 1's fourth applicant, after the unit: the first slip the clerk has to catch alone. He means every
 * word, and one of them is the wrong one: the registry is not a ministry.
 */
export const FIRST_SLIP = {
  name: 'Gordon Pim',
  // A real street, and a house number the generator never rolls (1 to 199), so no fill-in is ever given it.
  address: '212 Pending Way, Sallowfield',
  birthYear: 1974,
  remark: "I've twenty minutes on the meter. How long does being human usually take?",
  video: 'I certify that I am a real human and that I am not already registered in this ministry.',
  exits: { accept: 'Lovely. Nineteen minutes left.', challenge: 'Right. I had better feed the meter, then.' },
};
