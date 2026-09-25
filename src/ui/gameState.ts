import type { GeneratedApplicant } from '../gen/applicant';
import type { Decision, Outcome } from '../rules/judge';

export type GameSnapshot = {
  seed: number;
  day: number;
  applicant: GeneratedApplicant;
  decision: Decision | null;
  outcome: Outcome | null;
};

declare global {
  interface Window {
    /** Dev and test builds only: a frozen copy of the game state, for tests and debugging. */
    __game?: GameSnapshot;
  }
}

export function exposeGameState(state: GameSnapshot) {
  if (import.meta.env.DEV || import.meta.env.MODE === 'test') window.__game = deepFreeze(structuredClone(state));
}

function deepFreeze<T>(value: T): T {
  if (typeof value === 'object' && value !== null) {
    Object.values(value).forEach(deepFreeze);
    Object.freeze(value);
  }
  return value;
}
