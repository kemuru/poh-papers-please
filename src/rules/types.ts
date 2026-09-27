// The applicant as the player sees it, and what the rule engine says about them.
import type { Portrait } from '../gen/portrait';

export type Video = {
  /** The face shown in the three frames. */
  face: Portrait;
  /** Everything said in the video, as transcribed. Empty when nothing was said. */
  transcript: string;
  blinked: boolean;
};

export type Applicant = {
  name: string;
  address: string;
  birthYear: number;
  photo: Portrait;
  video: Video;
  /** Said at the window: small talk. Not part of the video, and no rule reads it. */
  remark: string;
};

export type RuleId = 'phrase';
/** The rules in force, in rulebook order. */
export type Rulebook = readonly RuleId[];
/** The humans already registered. */
export type Registry = readonly Applicant[];

/** One word of a text; ok is false where the transcript and the rulebook disagree. */
export type Mark = { word: string; ok: boolean };

export type Violation = { rule: 'phrase'; heard: Mark[]; expected: Mark[] };

export type Judgment = { valid: boolean; violations: Violation[] };
