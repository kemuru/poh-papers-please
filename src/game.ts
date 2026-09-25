import { DAY_ONE_RULEBOOK } from './content/dayOne';
import { generateApplicant } from './gen/applicant';
import type { Applicant, Violation } from './model';
import { judge } from './rules/judge';

export type Decision = 'accept' | 'challenge';
export type Outcome =
  | { readonly kind: 'registered' }
  | { readonly kind: 'citation'; readonly violations: readonly Violation[]; readonly warning: true }
  | { readonly kind: 'filed' };

export type GameState = {
  readonly seed: number;
  readonly day: 1;
  readonly applicant: Applicant;
  readonly phase: 'review' | 'result';
  readonly decision: Decision | null;
  readonly outcome: Outcome | null;
};

export type GameAction = { readonly type: 'decide'; readonly decision: Decision } | { readonly type: 'replay' };

export function createGame(seed: number): GameState {
  return { seed, day: 1, applicant: generateApplicant(seed), phase: 'review', decision: null, outcome: null };
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  if (action.type === 'replay') return createGame(state.seed);
  if (state.phase !== 'review') return state;

  let outcome: Outcome;
  if (action.decision === 'challenge') {
    outcome = { kind: 'filed' };
  } else {
    const judgment = judge(state.applicant, DAY_ONE_RULEBOOK, []);
    outcome = judgment.valid
      ? { kind: 'registered' }
      : { kind: 'citation', violations: judgment.violations, warning: true };
  }
  return { ...state, phase: 'result', decision: action.decision, outcome };
}
