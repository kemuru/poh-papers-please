import type { Portrait, Pose } from './gen/portrait';

export type Violation = 'day-1-phrase';

export type VideoFrame = {
  readonly portrait: Portrait;
  readonly pose: Pose;
};

export type Applicant = {
  readonly id: string;
  readonly name: string;
  readonly address: string;
  readonly birthYear: number;
  readonly portrait: Portrait;
  readonly remark: string;
  readonly video: {
    readonly frames: readonly [VideoFrame, VideoFrame, VideoFrame];
    readonly transcript: string;
    readonly blinked: boolean;
  };
  /** Generator truth, never consulted by the rule engine or displayed at the desk. */
  readonly planted: readonly Violation[];
};

export type Rulebook = {
  readonly day: number;
  readonly requiredPhrase: string;
};

export type Registry = readonly Applicant[];

export type Judgment = {
  readonly valid: boolean;
  readonly violations: readonly Violation[];
};
