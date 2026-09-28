// The applicant as the player sees it, and what the rule engine says about them.
import type { PanelSpot, Portrait } from '../gen/portrait';

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
  /** Eyes closed in the first frame as well: someone who blinks far too much. */
  nervous?: true;
  /** A printed face held up to the camera: every frame the same, mouth and eyes included. */
  still?: true;
  /** One frame where the face is not quite the face in the others. */
  glitch?: { frame: number; face: Portrait };
  /** Someone filmed with them, side by side: a twin, as the policy asks twins to be filmed. */
  with?: Portrait;
  /** Made by a video generator, not filmed: the generator's mark is in the corner of every frame. */
  generated?: true;
  /** A machine's tell: in this one frame the skin at this spot stands open onto machinery. */
  panel?: { frame: number; where: PanelSpot };
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

export type RuleId = 'human' | 'phrase' | 'photo' | 'sign' | 'vouch' | 'duplicate' | 'living';
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
  /**
   * The video is not of a real human: skin open onto machinery in that frame, a face that changes
   * to another in that frame, a picture held up (every frame the same), or a video generator's mark
   * in the corner of every frame.
   */
  | { rule: 'human'; problem: 'machine' | 'changes' | 'picture' | 'generated'; frame: number; where?: PanelSpot }
  | { rule: 'phrase'; heard: Mark[]; expected: Mark[] }
  /** The photo is not the face in that frame (1 to 3), or it is a mirror image. */
  | { rule: 'photo'; frame: number; mirrored: boolean }
  /** What was held up, the wallet on the form, and the places (0-based) where they differ. */
  | { rule: 'sign'; sign: Sign | null; wallet: string; wrong: number[] }
  | { rule: 'vouch'; voucher: string | null; problem: 'none' | 'self' | 'unregistered' | 'busy'; vouchingFor?: string }
  /** The face is on file already, under this registration. */
  | { rule: 'duplicate'; match: Registrant }
  | { rule: 'living'; problem: 'born' | 'blink'; born: number | string };

export type Judgment = { valid: boolean; violations: Violation[] };
