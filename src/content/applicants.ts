// Fill-in applicants: ordinary members of the public (who they are: notes/game-design.md).
// They are sincere. Nobody here is doing a bit; the joke is that they mean it.
import type { PhraseMistake } from '../gen/applicant';
import type { Accessory, Age, BrowStyle, FacialHair, HairColor, HairStyle, Mark, MouthStyle, Outfit } from '../gen/portrait';

export const FIRST_NAMES = [
  'Agnes', 'Bartholomew', 'Chidi', 'Dolores', 'Edmund', 'Fenella', 'Gustavo', 'Hortense',
  'Ingrid', 'Jasper', 'Kiri', 'Leopold', 'Marisol', 'Nadia', 'Oswald', 'Petra',
  'Quentin', 'Rosalind', 'Sunil', 'Tamsin', 'Ulrike', 'Vikram', 'Winifred', 'Yusuf',
] as const;

export const LAST_NAMES = [
  'Pumble', 'Hatchett', 'Fennimore', 'Quillfeather', 'Blandford', 'Thistlewood', 'Lindqvist', 'Marchetti',
  'Ferreira', 'Okafor', 'Abernathy', 'Cobbold', 'Grout', 'Muncaster', 'Tuttle', 'Wimbush',
  'Pargeter', 'Duckworth', 'Oyelaran', 'Kowalczyk', 'Horsfall', 'Nettleship', 'Sallow', 'Brightwater',
] as const;

export const STREETS = [
  'Formsworth Lane', 'Carbon Row', 'Duplicate Close', 'Staple Street', 'Lower Queue Road',
  'Inkwell Terrace', 'Triplicate Avenue', 'Rubber Stamp Mews', 'Pending Way', 'Paperclip Crescent',
] as const;

export const TOWNS = [
  'Greyford', 'East Filing', 'Little Ledgerby', 'Old Stampton', 'Queuesbury', 'Upper Pendingham', 'Sallowfield',
] as const;

export type Street = (typeof STREETS)[number];
export type Town = (typeof TOWNS)[number];

type Lines = readonly string[];

/** Said by someone who wrote their address out by hand: from day 3 they hold it up on paper, never on a phone. */
const COPIED_IT_OUT = "I copied my wallet address out this morning. Forty-two characters. I've never concentrated so hard.";
/** Remarks that say the sign is handwritten. Whoever says one holds their address up on paper. */
export const ON_PAPER: readonly string[] = [COPIED_IT_OUT];

/**
 * What applicants say at the window. Small talk: never part of the video, and no rule reads it.
 * Most remarks are about something the clerk can see (the coat, the mustache, the street on
 * the form), so each person sounds like the person in the photo. "{year}" is their birth year.
 */
export const REMARKS: {
  anyone: Lines;
  age: Record<Age, Lines>;
  outfit: Partial<Record<Outfit, Lines>>;
  accessory: Partial<Record<Accessory, Lines>>;
  facialHair: Partial<Record<FacialHair, Lines>>;
  hair: Partial<Record<HairStyle, Lines>>;
  hairColor: Partial<Record<HairColor, Lines>>;
  brows: Partial<Record<BrowStyle, Lines>>;
  mouth: Partial<Record<MouthStyle, Lines>>;
  mark: Partial<Record<Mark, Lines>>;
  street: Record<Street, Lines>;
  town: Partial<Record<Town, Lines>>;
  /** Gossip from the queue about the week so far, each from the day it can first be heard. */
  rumours: readonly (readonly [day: number, line: string])[];
} = {
  anyone: [
    "I've brought three forms of ID and a character reference from my dentist.",
    'I was told this would take five minutes. That was in March.',
    'I rehearsed it in the car. The car was very supportive.',
    'My mother says I am very human. She would know. She was there.',
    'I have a pulse. I checked on the bus.',
    'I cried at an advert last week. It was for a bank.',
    "I have a favourite spoon. I don't know if that helps.",
    "I've never been registered for anything. Except a raffle. I didn't win the raffle.",
    "I've taken the whole day off to be believed.",
    "People say I have a very human laugh. I won't do it now.",
    'The man at Window 2 sent me here. He said you were nicer.',
    'I filled the form in twice, to be safe. Then I shredded one, to be safe.',
    "My cat is waiting in the car. She isn't applying. She knows what she is.",
    "I'm the only one of me. I've checked.",
    "What happens if I'm not? Hypothetically. For a friend.",
    'The lady outside said to say the sentence exactly. So I did. Then I kept talking.',
    "I just want to be on a list that isn't a waiting list.",
    'You have a very trustworthy window.',
    "I nearly didn't come. Then I thought: if not now, when? Tuesday, probably.",
    "I've prepared a short statement, but I think I'll just stand here.",
    "I recorded the video forty times. That's the best one. Please don't ask for the others.",
    "Everyone in the queue is very quiet. It's like church, but with numbers.",
    "It's my birthday. I thought I'd treat myself to some paperwork.",
    'I did the video in the bathroom. For the acoustics.',
    "I've been outside since six. I wanted to be first. I was fourth.",
    'I tried to register online, but the website asked if I was a robot and I panicked.',
    'I clicked on every traffic light. Every single one. It still said no.',
    "My phone doesn't recognise my face any more. I'm hoping you will.",
    'Please be honest. Do I seem human? Nobody at work will tell me.',
    "My landlord wants proof I exist before he'll fix the boiler.",
    "My doctor won't look at my knee until I'm registered.",
    'I need it for a loyalty card. The coffee place is very strict now.',
    "My dating profile says 'verified human'. I'd like it to be true.",
    "I'd like it noted that I was polite. In case that comes up.",
    "Could you stamp it gently? It's the only copy of me.",
    "I've never been this sure about anything. It's quite nice.",
    "I'm not nervous. My hands are. Separately.",
    "I didn't sleep. I kept practising the sentence. By four it had a tune.",
    'My friend said to look confident. Is this confident? It feels like this.',
    "I was told the money drips. I've brought a cup.",
    'I paid the deposit. It was most of my savings. Well. It was my savings.',
    "If I'm challenged, do I get a lawyer or a jury? I'd prefer a lawyer. Juries have opinions.",
    "I don't know what a registry is, but I would like to be in one.",
    "My neighbour vouched for me, then I vouched for him. We've been doing it all week.",
    COPIED_IT_OUT,
    "Please don't say the word wallet too loudly. My mother doesn't know I have one.",
    "It says submissions are final and cannot be edited. I haven't slept since I read that.",
    'I was registered last year, but it expired in March. I was a bit less human for a fortnight.',
    "My humanity's on another chain at the moment. It's coming back on Thursday.",
    "Whoever vouches for you has to have met you in person. It took a while. I don't go out much.",
    "They said the deposit is refunded 'shortly after'. I've brought a flask.",
    "I'm a juror, part-time. I vote with everyone else. It's very restful.",
    "The form wants the name I'm commonly known by. At home it's 'Oi'.",
    "One person, one vote, they said. I've never been given a whole one before.",
    "I've brought a folding chair for the three and a half days. In case someone challenges me.",
    "If anyone asks, I'm not a computer-generated person. I'm just very symmetrical.",
    "I read the list of reasons you can be removed. I'm not deceased. That's one off.",
  ],
  age: {
    young: [
      "My mum made me come. She says it's a good thing to have.",
      "Do I get a certificate? Like a PDF? I'd frame a PDF.",
      "Is there an app for this? There's an app for everything except this.",
      "I've done a lot of online quizzes. They all said human.",
      'Does this count as ID for getting into clubs?',
      "My manager asked why I needed the morning off. I said 'humanity'. He said fine.",
      "I'm doing it before I'm thirty. Like a pension, but for being a person.",
      "My flatmate got registered last week. He's been unbearable about it.",
      "Is the ID soulbound? I'm twenty-two. I'm not ready to be bound to anything.",
    ],
    adult: [
      "My kids think this is hilarious. I've told them it's serious.",
      "I've got the school run at three, so if I could be human by then.",
      "I've paid the fee, the deposit and the other fee.",
      "I'm doing it before it becomes compulsory. Then I'll complain when it does.",
      "My partner is registered already. It's been a sore point.",
      "I've got a mortgage, two kids and a bad back. What more do you want?",
      'I used to think all this was silly. Then my bank started asking.',
      "I've meant to do this since the first year. I've been very busy being a person.",
    ],
    old: [
      'In my day you just said you were human and people took your word for it.',
      "I've been human since {year}. Without a break.",
      "I'm not in a rush. I retired from rushing.",
      "My grandson set up my wallet. He says the password is 'a secret'. Is that normal?",
      "I remember when this was all forms. Now it's forms and a video.",
      "I've voted in every election since I was allowed. Even the ones about bins.",
      'My late husband was also human. Mostly.',
      'Is this the thing on the computer? My daughter said it was on the computer.',
      "I've outlived two ministries and a pension scheme. I'll outlive this queue.",
    ],
  },
  outfit: {
    suit: [
      "I've got a meeting at eleven. It's with myself, but still.",
      'Can I expense this? Being human, I mean.',
      "I'll need it in triplicate. For the board.",
      'My assistant usually handles this sort of thing. My assistant is also not here.',
      'I came straight from work. I work in a building a lot like this one. More carpet.',
    ],
    hoodie: [
      "I wore the hoodie so I'd match my photo. The photo is also in the hoodie.",
      "I'm not a hacker. People assume.",
      'I wore my smart hoodie.',
      "It's my brother's hoodie. The rest of me is mine.",
    ],
    turtleneck: [
      "I'm in the arts.",
      "Is humanity a construct? Don't answer. I'll use it in a piece.",
      "People say the turtleneck makes me look like a founder. I'm not a founder. I'm a person.",
      "I'm starting a project about identity. You're in it now, I'm afraid.",
    ],
    sweater: [
      "My aunt knitted this. She's also human. Very much so.",
      "It's wool. The sheep isn't applying.",
      "I get cold in most buildings. That's a human thing, isn't it?",
    ],
    shirt: [
      "I ironed a shirt for this. I don't iron shirts.",
      'I read that a collar helps. With being taken seriously.',
      'I dressed for a job interview. It felt like the same sort of thing.',
    ],
    tshirt: [
      "I came as I am. That's the point, isn't it?",
      "I wasn't sure of the dress code for being human, so I kept it casual.",
      'This is my good T-shirt.',
    ],
    trenchcoat: [
      "It's just a coat. It was raining when I left the house.",
      "I've had this coat for years. It's seen a lot of queues.",
      'It came like this from the charity shop. The coat, I mean. Not me.',
    ],
  },
  accessory: {
    glasses: [
      "They're prescription. I'm not in disguise.",
      'I can read the rulebook from here, if you want me to check your work.',
      "I've had these frames since school. The frames are original. So am I.",
    ],
    earrings: [
      "They're clip-ons. Everything else is original.",
      'They were my grandmother\'s. She was also human, before you ask.',
    ],
    pearls: ["They're real. So am I. We came together.", 'I wore the pearls. It felt like an occasion.'],
  },
  facialHair: {
    mustache: [
      "It's a real mustache. You can pull it. Please don't pull it.",
      "The mustache and I go back a long way. It's not a disguise. It's a commitment.",
      'People keep looking at the mustache. I grew it. Slowly. By hand.',
    ],
    beard: [
      "The beard's been with me eleven years. It doesn't need its own form, does it?",
      'I grew it for a play. The play was cancelled. The beard stayed.',
      "It's a real beard. I can tell from the way you're looking at it that I need to say that.",
    ],
    goatee: ['The goatee was a phase. I am still in it.', "My partner hates the goatee. We're working through it."],
    stubble: ['I shaved for this. Partly.', "I ran out of time to shave. I didn't run out of humanity."],
  },
  hair: {
    bald: ['Nothing to hide. As you can see.', "It's all my own head."],
    mohawk: ["The hair isn't a statement. Well. It's a small statement.", 'It took two hours. Please stamp nowhere near it.'],
    pompadour: ["The hair takes forty minutes every morning. I'm very committed to being me."],
    bowl: ["My mum still cuts it. She says it's a very human haircut."],
    receding: ["It's receding at a normal human rate. My doctor confirmed it."],
    spiky: ["It's gel. Gel is natural. Mostly."],
  },
  hairColor: {
    teal: ["It's called Mermaid Teal. I'm still a human. It's just the name of the dye."],
    plum: ["It's called Midnight Plum. It washes out in thirty washes. I don't."],
  },
  brows: {
    angry: [
      "I've been waiting forty minutes.",
      "I'd like to speak to your supervisor's supervisor.",
      "I'm perfectly calm. This is my calm face.",
    ],
    worried: [
      'Is it normal to be this nervous about being a person?',
      "Sorry. I'm always sorry. Is that a human thing? I hope it's a human thing.",
      "What if I said it wrong and I don't know I said it wrong?",
    ],
  },
  mouth: {
    frown: ["I'm not unhappy. My face just rests like this."],
    grin: ["Sorry. I smile when I'm nervous. I'm very nervous. Look at this smile."],
    smirk: ["I'm not smirking. My face does that on its own."],
  },
  mark: {
    scar: [
      "The scar's from a paper cut. At this Ministry. In 2019.",
      "People ask about the scar. It was a stapler. I don't talk about the stapler.",
    ],
    freckles: ['The freckles are real. My mum counted them once. It was a slow Sunday.'],
    mole: ["The mole has been on every form I've ever filled in. It's very experienced."],
    blush: ["I'm not blushing. It's warm in here. Is it warm? It's warm."],
  },
  street: {
    'Formsworth Lane': ["I'm from Formsworth Lane. We fill in a lot of forms. It's in the name."],
    'Carbon Row': ["I'm from Carbon Row. Everyone there is an original. We had it checked."],
    'Duplicate Close': [
      "Yes, I live on Duplicate Close. No, there's only one of me.",
      "Everyone on Duplicate Close gets looked at twice. I'm used to it.",
    ],
    'Staple Street': ['Staple Street. Everything there holds together. Just about.'],
    'Lower Queue Road': ["I live on Lower Queue Road, so this is a nice change."],
    'Inkwell Terrace': ["Inkwell Terrace. We all write in pen. It's that kind of street."],
    'Triplicate Avenue': ["Triplicate Avenue. I get three copies of every letter. I'm only one person."],
    'Rubber Stamp Mews': ["Rubber Stamp Mews. It's quieter than it sounds."],
    'Pending Way': ['I live on Pending Way. The house is still pending.'],
    'Paperclip Crescent': ["Paperclip Crescent. We're very attached to it."],
  },
  town: {
    Queuesbury: ["I'm from Queuesbury, so I don't mind a queue. I mind a short one."],
    'Upper Pendingham': ["In Upper Pendingham we're still waiting to hear back from Lower Pendingham."],
    'East Filing': ["East Filing. West Filing has the better post office. I don't want to talk about it."],
    'Old Stampton': ['Old Stampton. New Stampton is where the fun people went.'],
  },
  rumours: [
    [2, 'I heard one of those home robots tried to register yesterday. Lovely manners, apparently.'],
    [2, "Someone in the queue says there's a philosopher about. Don't let him start."],
    [2, "They say the new clerk at Window 3 reads every word. I've brought my glasses to watch."],
    [3, 'My cousin saw a robot at the bus stop. She only knew because it stood exactly by the sign.'],
    [3, "There's a pigeon in the queue. He's two ahead of me. Nobody is saying anything."],
    [3, "I heard they're paying the jurors now. In what, I asked. Nobody knew."],
    [4, "My uncle vouched for his home robot. They've removed my uncle as well. He's taking it badly."],
    [4, "Is it true about the ceiling? My neighbour says it's been leaking since Tuesday."],
    [4, "There's a man outside handing out leaflets. They just say 'HUMANS ONLY'."],
    [4, "Window 2 is closed again. They're voting on whether they're still Window 2."],
    [4, "They say the jury's on its way. It's been on its way since Tuesday."],
    [5, "Someone in the queue says he's registered at two other windows already. This one's for luck."],
    [5, "My neighbour was registered on Monday. And on Wednesday. He says it's a hobby."],
    [5, 'The pigeon got through, apparently. Good for him.'],
    [5, "Someone said there are two Ministries now, and each one says the other one isn't real."],
    [6, "Is it all right if I'm only mostly human? It's been a very long week."],
    [6, "I heard the Ministry is going to register the queue itself. To save time."],
    [6, "My philosophy teacher went in yesterday. He asked what 'registered' means. He's still in there."],
    [6, "I tried the other Ministry. They said I'd need proof I'm not registered here. So here I am."],
    [7, "They say Window 3 is the only one left. No pressure."],
    [7, "I've been in this queue since Tuesday. I've made friends. One of them is a pigeon."],
    [7, "They say the clerk at Window 3 has been here all week. Imagine."],
  ],
};

/**
 * Said in the video before or after the phrase. The rule only asks that every word of the phrase
 * is said, so none of this makes anyone invalid: it only gives the clerk more to read.
 * Valid applicants and fakes draw from the same lines, so chatter is never a tell. No line may
 * start the phrase or finish it ("I certify, sorry."): said next to a fake, it could supply the
 * very word the fake left out (the oracle check tries every pairing).
 */
export const NOISE: Record<'anyone' | Age, { before: Lines; after: Lines }> = {
  anyone: {
    before: [
      'Okay, is it on?', 'Right.', 'Hello. Hi.', 'Ahem.', 'Take two.', 'From the top.', 'Okay. Here goes.',
      'Is it recording?', 'Morning.', 'Sorry. Again.', 'Deep breath.', 'Is the red light on?',
    ],
    after: [
      'Can I go now?', 'Thank you.', 'Probably.', 'Over.', 'Was that all right?', 'Bye.', 'Hi, Mum.',
      'Sorry.', 'That is all.', 'Did it record?', 'As far as I know.', 'Amen.',
    ],
  },
  young: { before: ['Wait, is this live?'], after: ['Okay, cut.', 'Is the address readable?'] },
  adult: { before: ['Right, quickly.'], after: ['Moving on.'] },
  old: { before: ['Is this thing on?', 'Hello? Hello.'], after: ['Did I press it?', 'Is that it?'] },
};

/**
 * Said in the middle of the phrase, set off by commas: "a real human and, um, that I am".
 * Harmless, since every key word is still said. None of them is a word of the phrase, so an
 * aside can never fill in a word someone left out.
 */
export const ASIDES: Lines = ['um', 'er', 'sorry', 'hang on', 'as such', 'you know', 'one second', 'bless you'];

/**
 * Small words said differently: harmless, since the rule only asks for the key words. Anyone may
 * say these, valid or not, so a clerk who fails "in the registry" is being stricter than the book.
 */
export const SLIPS: readonly (readonly [RegExp, string])[] = [
  [/in this registry/, 'in the registry'],
  [/not already registered/, 'not yet registered'],
  [/not already registered/, 'not registered'],
  [/I certify that I am/, 'I certify I am'],
  [/and that I am not/, "and that I'm not"],
  [/that I am a real/, "that I'm a real"],
  [/and that I am/, 'and I am'],
];

/**
 * Video transcripts that break the phrase rule, by kind of mistake: each one leaves out or
 * swaps at least one word of the phrase. Keep them under two lines of the video strip.
 */
export const PHRASE_MISTAKES: Record<PhraseMistake, Lines> = {
  'wrong-word': [
    'I certify that I am a real hooman and that I am not already registered in this registry.',
    'I reckon that I am a real human and that I am not already registered in this registry.',
    'I suspect that I am a real human and that I am not already registered in this registry.',
    'I certify that I am a real humanoid and that I am not already registered in this registry.',
    'I certify that I am a realistic human and that I am not already registered in this registry.',
    'I certify that I am a real human and that I am not already registered in this pantry.',
  ],
  'missing-words': [
    'I certify I am a real hooman.',
    'I certify that I am a real human.',
    'I certify that I am not already registered in this registry.',
    'I am a real human and I am not already registered.',
    'I certify that I am a real human and that I am not already.',
    'Real human. Not registered.',
    'Okay, is it on? Hello? Is it on?',
  ],
  /** Says nothing at all. */
  silence: [''],
  /** One key word quietly swapped: caught by reading, missed by skimming. Some change the meaning entirely. */
  'quiet-word': [
    'I certify that I am a real human and that I am now already registered in this registry.',
    'I certify that I am a rare human and that I am not already registered in this registry.',
    'I certify that I am a real humane and that I am not already registered in this registry.',
    'I verify that I am a real human and that I am not already registered in this registry.',
    'I certify that I am a real human and that I am not already registered in this ministry.',
    'I certify that I am a real person and that I am not already registered in this registry.',
    'I certify that I am a real human and that I am not already regulated in this registry.',
    'I certify that you are a real human and that I am not already registered in this registry.',
    'I certify that I am a real human and that I am not already registered in this registery.',
  ],
};

/** What people say as they collect their papers. Nothing here hints at whether they were valid. */
export const EXITS: Record<'accept' | 'challenge', Lines> = {
  accept: [
    'Thank you.', 'Is that it?', 'Lovely.', 'That was easier than the bank.', 'Right. Thanks.',
    "I'll tell my mother.", 'Brilliant. Bye.', 'Do I get a sticker? No? Fine.', 'Do I start dripping now?',
  ],
  challenge: [
    'Right.', 'Fine.', "I'll see you in court, then.", "I'll wait outside.", 'Is there a café?',
    'Understood.', 'Oh.', "I'll get my coat.", "I'd like a jury, please. A nice one.",
  ],
};
