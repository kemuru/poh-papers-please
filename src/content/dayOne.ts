import type { Rulebook, Violation } from '../model';

export const DAY_ONE_RULEBOOK: Rulebook = {
  day: 1,
  requiredPhrase: 'I certify that I am a real human and that I am not already registered in this registry.',
};

export const PHRASE_VARIANTS = {
  valid: [
    DAY_ONE_RULEBOOK.requiredPhrase,
    'i certify that i am a real human and that i am not already registered in this registry',
    'I certify that I am a real human, and that I am not already registered in this registry!',
  ],
  typo: 'I certify that I am a real hooman and that I am not already registered in this registry.',
  missing: 'I certify that I am a real human.',
  extra: 'I certify that I am a real human and that I am not already registered in this registry. Please.',
  silence: '',
} as const;

export const APPLICANT_CONTENT = {
  firstNames: ['Ada', 'Mabel', 'Otis', 'Nell', 'Cecil', 'Vera', 'Ida', 'Wilbur'],
  lastNames: ['Pencilby', 'Folder', 'Stapleton', 'Quill', 'Ledger', 'Carbon', 'Blotter', 'Twill'],
  streets: ['Carbon Lane', 'Queue Street', 'Form Avenue', 'Stamp Road', 'Counter Close'],
  remarks: [
    'I was told to bring myself in person.',
    'My lunch break has been extended without permission.',
    'I have completed the optional mandatory section.',
    'The other window sent me to this window.',
  ],
  dave: {
    name: 'Dave',
    remarks: ['The costume is for a party. The paperwork is for me.', 'I have a human-sized appointment.'],
  },
  gary: {
    name: 'Gary',
    remarks: ['One application. One coat. Standard procedure.', 'The mustache is included in the photograph.'],
  },
} as const;

export const RULE_COPY: Record<Violation, { title: string; explanation: string }> = {
  'day-1-phrase': {
    title: 'Rule 1 · Certification phrase',
    explanation: 'The recorded declaration does not contain exactly the required words in order.',
  },
};

export const DESK_COPY = {
  ministry: 'Ministry of Humanity',
  department: 'Office of Individual Registration',
  title: 'Proof of Humanity',
  subtitle: 'Papers, Please',
  window: 'Registry window 03',
  day: 'Day 01',
  shift: 'No time limit',
  task: 'One application requires your attention.',
  memoLabel: 'Supervisor’s instruction',
  memo: 'Read the declaration. Compare it with Rule 1. Approve compliant applications; file a challenge for the rest. Clothing is not evidence.',
  profile: 'Application for registration',
  name: 'Full name',
  address: 'Residential address',
  birthYear: 'Year of birth',
  photo: 'Profile photograph',
  video: 'Recorded declaration',
  recording: 'Recording on file',
  frame: 'Frame',
  transcript: 'Certified transcript',
  silence: '[No speech recorded]',
  blink: 'Blink recorded',
  noBlink: 'No blink recorded',
  rulebook: 'Clerk’s rulebook',
  activeRule: 'In force today',
  phraseLabel: 'The applicant must say:',
  matching: 'Every word must match, in order. Ignore capitalization, punctuation and spacing.',
  ruleNote: 'Only the declaration is checked today.',
  decisionLabel: 'Clerk’s decision',
  decisionHint: 'Check the transcript before applying a stamp.',
  accept: 'Accept',
  challenge: 'Challenge',
  footer: 'Humanity is a status. Please complete the form.',
  receipt: 'Decision receipt',
  acceptedStamp: 'Registered',
  acceptedTitle: 'Application approved',
  acceptedBody: 'The declaration complies with Rule 1. Registration has been entered in the record.',
  citationTitle: 'Citation issued',
  citationLabel: 'Notice of procedural error',
  citationBody: 'Registration was entered with a noncompliant declaration. The form is complete. The work is not.',
  warning: 'First mistake · Warning only. No fine.',
  filedStamp: 'Case filed',
  filedTitle: 'Awaiting hearing',
  filedBody: 'Your challenge has been filed. No ruling has been made. Hearings take place at the end of a full shift.',
  filedScope: 'This desk handles one application. Court hearings are not available in this version.',
  referencePhrase: 'Required declaration',
  recordedPhrase: 'Declaration received',
  replay: 'Review this application again',
  closed: 'End of application',
} as const;
