import type { GeneratedApplicant } from '../gen/applicant';
import type { GameState } from './week';

/** Everything the UI knows, plus the day's queue with the truth attached; on the night shift, the night's counts too. */
export type GameSnapshot = GameState & {
  queue: GeneratedApplicant[];
  night?: { shift: number; right: number; citations: number; closed: boolean };
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
