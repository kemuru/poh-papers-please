import { useEffect } from 'react';
import type { GameState } from '../game';

type DeepReadonly<T> = { readonly [K in keyof T]: DeepReadonly<T[K]> };

declare global {
  interface Window {
    readonly __game?: DeepReadonly<GameState>;
  }
}

function freezeDeep<T extends object>(value: T): DeepReadonly<T> {
  for (const nested of Object.values(value)) {
    if (nested !== null && typeof nested === 'object') freezeDeep(nested);
  }
  return Object.freeze(value) as DeepReadonly<T>;
}

export function useGameDebug(state: GameState) {
  useEffect(() => {
    if (!import.meta.env.DEV && import.meta.env.MODE !== 'test') return;
    const snapshot = freezeDeep(structuredClone(state));
    Object.defineProperty(window, '__game', { configurable: true, get: () => snapshot });
    return () => { Reflect.deleteProperty(window, '__game'); };
  }, [state]);
}
