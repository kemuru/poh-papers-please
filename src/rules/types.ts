// The applicant as the player sees it, and what the rule engine says about them.
import type { LampSize, Portrait } from '../gen/portrait';

/** What an applicant holds up in their video, from day 3. */
export type Sign =
  /** Written by hand on paper, or shown on a phone's screen; either way, the right way up. */
  | { kind: 'address'; text: string; phone?: true }
  /** A QR code: a square of dots, not the address written out. */
  | { kind: 'qr' };

export type Video = {
  /** The face shown in the three frames. */
  face: Portrait;
  /** Everything said in the video, as transcribed. Empty when nothing was said. */
  transcript: string;
  /** Eyes closed in the third frame. */
  blinked: boolean;
  /** Eyes closed in the first frame as well: a second blink. */
  nervous?: true;
  /** A printed face held up to the camera: every frame the same, mouth and eyes included. */
  still?: true;
  /** One frame where the face is not quite the face in the others. */
  glitch?: { frame: number; face: Portrait };
  /** Someone filmed with them, side by side: a twin, as the policy asks twins to be filmed. */
  with?: Portrait;
  /** Made by a video generator, not filmed: the generator's mark is in the corner of every frame. */
  generated?: true;
  /** A home robot's tell: its eyes are cameras, and whenever they are shut its night lamp is on, an infrared light between the brows that a phone's camera sees and a person does not. Lit in every frame with the eyes shut (litFrames), and no other. */
  lamp?: LampSize;
  /** From day 3: what they hold up to the camera. Null if nothing. */
  sign?: Sign | null;
};

export type Applicant = {
  name: string;
  address: string;
  /** A year, or whatever was written in the box. Years before 1 are BC. */
  birthYear: number | string;
  photo: Portrait;
  video: Video;
  /** Said at the window: small talk. Not part of the video, and no rule reads it. */
  remark: string;
  /** The photo is a mirror image: a selfie taken in the bathroom mirror. */
  mirrored?: true;
  /** From day 3: the wallet the form is for, 0x and forty hex digits. */
  wallet?: string;
  /** From day 4: who vouches for them. Null if nobody does. */
  voucher?: string | null;
};

/** Rule N enters the rulebook on day N (RULE_DAYS in judge.ts). */
export type RuleId = 'phrase' | 'face' | 'sign' | 'vouch' | 'duplicate' | 'living';
/** The rules in force, in rulebook order. */
export type Rulebook = readonly RuleId[];

/** Someone on the registry's books. */
export type Registrant = {
  name: string;
  address: string;
  birthYear: number | string;
  /** The face on file: the face in their video. */
  face: Portrait;
  /** The day of this week they were registered; 0 for before it. */
  day: number;
  /** Registered at another window, if not at Window 3. */
  window?: string;
  /** Whose application their vouch is serving today; null if nobody's. */
  vouching: string | null;
};
/** The humans registered so far, as the registry stands. */
export type Registry = readonly Registrant[];

/** One word of a text; ok is false where the transcript and the rulebook disagree. */
export type Mark = { word: string; ok: boolean };

export type Violation =
  | { rule: 'phrase'; heard: Mark[]; expected: Mark[] }
  /**
   * The face, in that frame (1 to 3): a light between the brows with the eyes shut (as big as `lamp`); a
   * face that turns into another; a photo that is a mirror image; or a photo of another face.
   */
  | { rule: 'face'; problem: 'machine' | 'changes' | 'mirrored' | 'another'; frame: number; lamp?: LampSize }
  /** What was held up, the wallet on the form, and the places (0-based) where they differ. */
  | { rule: 'sign'; sign: Sign | null; wallet: string; wrong: number[] }
  | { rule: 'vouch'; voucher: string | null; problem: 'none' | 'self' | 'unregistered' | 'busy'; vouchingFor?: string }
  /** The face is on file already, under this registration. */
  | { rule: 'duplicate'; match: Registrant }
  /** Born outside 1900 to today; no frame with the eyes shut; every frame the same picture; or a video generator's mark. */
  | { rule: 'living'; problem: 'born' | 'blink' | 'picture' | 'generated'; born: number | string };

export type Judgment = { valid: boolean; violations: Violation[] };
