// The recurring cast (who they are: notes/game-design.md): their forms, their lines, their exits.
// Only characters the portrait generator can draw are here. The regulars are valid under every
// rule in force so far; Gary never is. Each regular has a line per day, so nobody repeats in a week.
import type { PhraseMistake } from '../gen/applicant';
import type { Portrait } from '../gen/portrait';
import { PHRASE } from '../rules/phrase';
import { CAST_PORTRAITS } from './portraits';

export type RegularId = Exclude<keyof typeof CAST_PORTRAITS, 'gary'>;
export type CastId = RegularId | 'gary';

type Regular = {
  name: string;
  address: string;
  birthYear: number;
  portrait: Portrait;
  /** What they say in the video. Every line contains the phrase word for word. */
  videos: readonly string[];
  /** What they say at the window, one per appearance. */
  remarks: readonly string[];
  exits: { accept: string; challenge: string };
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
  },
  /** A human whose parents had a sense of humour. */
  robotMcBotface: {
    name: 'Robot McBotface',
    address: '9 Carbon Row, East Filing',
    birthYear: 1991,
    portrait: CAST_PORTRAITS.robotMcBotface,
    videos: [PHRASE, `Yes, that's my real name. ${PHRASE}`],
    remarks: [
      'Yes, it is my real name. My parents thought it was funny.',
      "Please don't ask me to click on the traffic lights.",
      "People expect me to beep. I don't beep.",
      "It's been my name my whole life. It hasn't got funnier.",
      "It's an old family name. The family is also human.",
      "The bank's computer won't let me in. It's personal now.",
      "I've been asked if I'm a robot four times today. You're the first one who's paid to.",
    ],
    exits: { accept: "Thank you. I'll tell my parents. They'll laugh.", challenge: "It's the name, isn't it." },
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
      'Something goes through the bins out the back every night. It wears a coat.',
      "I could have come in the back way. It didn't seem fair on the queue.",
      "The income is paid every hour. Even the ones I sleep through. That's the bit I like.",
      'I recorded the video on my break. Four in the morning. I think it shows.',
    ],
    exits: { accept: 'Thank you. Back to bed, then.', challenge: "Fine. I'll be here tonight anyway." },
  },
};

/** Three raccoons in a trench coat. His form, apart from the name, never changes. He lives behind the bins at `address`. */
export const GARY_FORM = { where: 'Behind the bins', address: '14 Staple Street, Greyford', birthYear: 1985 };

/**
 * Gary's day, one per disguise in GARY_DISGUISES order. He talks about the disguise he is
 * wearing, and he always gets a word of the phrase wrong or leaves one out: the slip is his one
 * checkable detail. On day 3 the word he leaves out is "not".
 */
export const GARY_DAYS: readonly { name: string; remark: string; video: string; mistake: PhraseMistake }[] = [
  {
    name: 'Gary Mann',
    remark: 'Good morning. I am a human man, with a normal mustache.',
    video: 'We certify that we are a real human and that we are not already registered in this registry.',
    mistake: 'wrong-word',
  },
  {
    name: 'Sir Gary Mann',
    remark: 'Good day. I am a gentleman, which is a kind of human.',
    video: 'I certify that I am a real raccoon and that I am not already registered in this registry.',
    mistake: 'wrong-word',
  },
  {
    name: 'Gary Human',
    remark: 'Hello. As my label says, I am human.',
    video: 'I certify that I am a real human and that I am, Doug, stop it, already registered in this registry.',
    mistake: 'quiet-word',
  },
  {
    name: 'Gary Mann Sr.',
    remark: 'Hello again. I mean hello. For the first time. I have a beard.',
    video: 'I certify that I am a real human and that we are not already registered in this registry.',
    mistake: 'wrong-word',
  },
  {
    name: 'Gary Mann Jr.',
    remark: 'I have had a haircut. It is a human haircut. I am a new human.',
    video: 'I certify that I am three real humans and that I am not already registered in this registry.',
    mistake: 'wrong-word',
  },
  {
    name: 'G. Mann (Not Raccoons)',
    remark: 'Please read the sign.',
    video: 'I certify that I am a real human and that I am not already registered in this registery.',
    mistake: 'quiet-word',
  },
];

export const GARY_EXITS = { accept: 'Excellent. Human business, then.', challenge: 'We will see you in court. I will. I will see you in court.' };
