// Fill-in applicants: ordinary members of the public (who they are: notes/game-design.md).
import type { PhraseMistake } from '../gen/applicant';

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

/** Small talk, written in the Remarks box of the form. Never part of the video. */
export const REMARKS = [
  "Sorry, I'm on my lunch break.",
  'I was told this would take five minutes.',
  'Is this the queue for parking permits?',
  'The man at Window 2 sent me here.',
  "I've got a bus at quarter past.",
  'I rehearsed it in the car.',
  "My mother says I'm very human.",
  'I brought a sandwich in case it runs long.',
  "I've never been registered for anything. Except a raffle.",
  'I filled the form in twice, to be safe.',
  'My cat is waiting in the car.',
  "Do I need to take my hat off? I'm not wearing a hat.",
  "I've been human for as long as I can remember.",
  'Is there a pen I can borrow? Never mind, I have a pen.',
  'I took the afternoon off for this.',
] as const;

/**
 * Video transcripts that break the phrase rule, by kind of mistake. Every one differs from
 * the phrase in at least one word. Keep them under two lines of the video strip.
 * "Ding." and "Certainly! Here is my certification:" belong to the Toaster and the Chatbot.
 */
export const PHRASE_MISTAKES: Record<PhraseMistake, readonly string[]> = {
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
  ],
  'extra-words': [
    'Okay, is it recording? I certify that I am a real human and that I am not already registered in this registry.',
    'Hello. Yes. Hi. I certify that I am a real human and that I am not already registered in this registry.',
    'I certify that I am a real human and that I am not already registered in this registry. Can I go now?',
    'I certify that I am a real human and that I am not already registered in this registry. Probably.',
    'I certify that I am a real human and that I am not already registered in this registry, as far as I know.',
    'I certify that I am a real human and that I am not already registered in this registry. Over.',
  ],
  /** Says nothing at all. */
  silence: [''],
  /** One quiet word out of place: caught by reading, missed by skimming. */
  'quiet-word': [
    'I certify that I am a real human and that I am not already registered in the registry.',
    'I certify that I am a real human and that I am not registered in this registry.',
    'I certify I am a real human and that I am not already registered in this registry.',
    "I certify that I am a real human and that I'm not already registered in this registry.",
    'I certify that I am a real human and that I am not yet registered in this registry.',
    'I certify that I am a very real human and that I am not already registered in this registry.',
    'I certify that I am a real person and that I am not already registered in this registry.',
  ],
};
