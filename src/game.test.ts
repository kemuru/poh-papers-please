import { describe, expect, it } from 'vitest';
import { createGame, gameReducer, type Decision } from './game';

describe('one application', () => {
  it('starts at a reproducible, undecided desk', () => {
    const game = createGame(1);
    expect(game).toEqual(createGame(1));
    expect(game).toMatchObject({ seed: 1, day: 1, phase: 'review', decision: null, outcome: null });
  });

  it.each([
    [1, 'accept', { kind: 'registered' }],
    [2, 'accept', { kind: 'citation', violations: ['day-1-phrase'], warning: true }],
    [1, 'challenge', { kind: 'filed' }],
    [2, 'challenge', { kind: 'filed' }],
  ] as const)('seed %i: %s records the correct outcome', (seed, decision, outcome) => {
    const before = createGame(seed);
    const saved = structuredClone(before);
    const after = gameReducer(before, { type: 'decide', decision });
    expect(after).toMatchObject({ phase: 'result', decision, outcome });
    expect(before).toEqual(saved);
  });

  it('records only one decision and resets the same application on replay', () => {
    const original = createGame(2);
    const accepted = gameReducer(original, { type: 'decide', decision: 'accept' });
    expect(gameReducer(accepted, { type: 'decide', decision: 'challenge' })).toBe(accepted);
    expect(gameReducer(accepted, { type: 'replay' })).toEqual(original);
  });

  it('snapshots deterministic decisions and receipts for fixed seeds', () => {
    const outcomes = [1, 2, 3].flatMap((seed) => (['accept', 'challenge'] as Decision[]).map((decision) => {
      const state = gameReducer(createGame(seed), { type: 'decide', decision });
      return { seed: state.seed, decision: state.decision, outcome: state.outcome };
    }));
    expect(outcomes).toMatchSnapshot();
  });
});
