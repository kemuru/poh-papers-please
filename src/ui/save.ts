// The week, kept in the browser between visits: the seed and every step the clerk took, so a
// reload finds the desk as it was left. A save is never trusted as a state: its steps are played
// through the reducer again, and if the game has changed since and they no longer lead where they
// did, the save is set aside and a new week begins.
import type { GeneratedApplicant } from '../gen/applicant';
import { generateWeek, LAST_DAY } from '../gen/day';
import { inspect, sameItem, type Item } from '../rules/inspect';
import { rulebookForDay, type Decision } from '../rules/judge';
import type { RuleId } from '../rules/types';
import type { Evidence } from './court';
import { atWindow, reduce, startWeek, type Action, type GameState } from './week';

export const SAVE_KEY = 'poh-save';
/** Where a save that could not be restored is kept, for whoever is debugging it. */
const SET_ASIDE_KEY = 'poh-save-set-aside';

/**
 * One thing the clerk did. The applicant it was done to is the queue's to say, not the save's. A
 * challenge filed with evidence keeps the evidence; an appeal keeps the place in the queue of its case.
 */
export type Step = 'open' | 'call' | Decision | 'time-up' | 'close' | 'statement' | 'next-day' | { challenge: Evidence } | { appeal: number };

export type Save = {
  v: 1;
  seed: number;
  /** The day the week began on: 1, unless a ?day= link began it later. */
  startDay: number;
  steps: Step[];
  /** Seconds of today's shift clock already used. */
  clock: number;
  /** Where the steps led when they were saved: a changed game will not lead there again. */
  check: string;
};

export type Week = GeneratedApplicant[][];

/** A week as the desk plays it: how it began, what was done, and where that has got to. */
export type Run = {
  seed: number;
  startDay: number;
  week: Week;
  steps: Step[];
  state: GameState;
  /** Seconds of the current day's shift clock already used. */
  clock: number;
  /** Picked up from a save, rather than begun. */
  resumed: boolean;
  /** A save was found and could not be kept. */
  setAside: boolean;
};

type Store = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

/** The browser's storage, or null where it is blocked. */
export function browserStorage(): Store | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

/** Whether saves survive here: private windows and strict settings may refuse them. */
export function canSave(store: Store | null): boolean {
  try {
    store?.setItem(`${SAVE_KEY}-test`, '1');
    store?.removeItem(`${SAVE_KEY}-test`);
    return store !== null;
  } catch {
    return false;
  }
}

export function stepOf(action: Action): Step {
  if (action.type === 'appeal') return { appeal: action.index };
  if (action.type !== 'decide') return action.type;
  return action.decision === 'challenge' && action.evidence ? { challenge: action.evidence } : action.decision;
}

const STEPS = new Set<string>(['open', 'call', 'accept', 'challenge', 'time-up', 'close', 'statement', 'next-day']);
const RULES = new Set<string>(['human', 'phrase', 'photo', 'sign', 'vouch', 'duplicate', 'living'] satisfies RuleId[]);
const PLAIN_ITEMS = new Set<string>(['photo', 'transcript', 'sign', 'name', 'birth-year', 'wallet', 'voucher', 'face-record'] satisfies Item['kind'][]);
const whole = (n: unknown): n is number => Number.isSafeInteger(n) && (n as number) >= 0;

function isItem(item: unknown): item is Item {
  if (typeof item !== 'object' || item === null) return false;
  const i = item as Record<string, unknown>;
  if (typeof i.kind !== 'string') return false;
  // The video has three frames, as frameFaces shows them.
  if (i.kind === 'frame') return i.frame === 1 || i.frame === 2 || i.frame === 3;
  if (i.kind === 'rule') return typeof i.rule === 'string' && RULES.has(i.rule);
  if (i.kind === 'name-record') return typeof i.name === 'string';
  return PLAIN_ITEMS.has(i.kind);
}

function isStep(step: unknown): step is Step {
  if (typeof step === 'string') return STEPS.has(step);
  if (typeof step !== 'object' || step === null) return false;
  if ('appeal' in step) return whole(step.appeal);
  if (!('challenge' in step)) return false;
  const e = step.challenge as Partial<Evidence> | null;
  return typeof e?.rule === 'string' && RULES.has(e.rule) && Array.isArray(e.items) && e.items.length === 2 && e.items.every(isItem);
}

/** The reducer's action for a step, with the applicant and queue it was taken on; null if it could not have been taken. */
function actionOf(step: Step, s: GameState, week: Week): Action | null {
  const queue = week[s.day - 1];
  if (typeof step === 'object') {
    if ('appeal' in step) return { type: 'appeal', index: step.appeal };
    const at = atWindow(s);
    return at === null || !found(step.challenge, queue[at], s) ? null : { type: 'decide', applicant: queue[at], decision: 'challenge', evidence: step.challenge };
  }
  if (step === 'accept' || step === 'challenge') {
    const at = atWindow(s);
    if (at === null) return null;
    return { type: 'decide', applicant: queue[at], decision: step };
  }
  if (step === 'close' || step === 'next-day') return { type: step, queue };
  return { type: step as 'open' | 'call' | 'time-up' | 'statement' };
}

/**
 * Whether Inspect finds this evidence on the applicant at the window: two things that disagree under
 * its rule, in force today, against the registry as the desk had it before the stamp.
 */
function found(e: Evidence, a: GeneratedApplicant, s: GameState): boolean {
  const [x, y] = e.items;
  const finding = sameItem(x, y) ? null : inspect(x, y, a, rulebookForDay(s.day), s.registry);
  return finding !== null && finding.inForce && finding.rule === e.rule;
}

/** The week the steps lead to, or null if one of them no longer leads anywhere. */
export function replay(seed: number, startDay: number, steps: readonly Step[], week: Week): GameState | null {
  let s = startWeek(seed, startDay);
  for (const step of steps) {
    const action = actionOf(step, s, week);
    const next = action && reduce(s, action);
    if (!next || next === s) return null;
    s = next;
  }
  return s;
}

/** A short digest of where the week stands: the day, the screen, the money, every stamp and everyone on the books. */
export function fingerprint(s: GameState): string {
  const stamps = s.decided.map((d) => `${d.decision[0]}${d.outcome.correct ? '+' : '-'}`).join('');
  const facts = [s.day, s.phase, s.called, s.savings, s.timeUp, stamps, s.registry.map((r) => r.name).join(',')].join('|');
  let hash = 0x811c9dc5;
  for (let i = 0; i < facts.length; i++) hash = Math.imul(hash ^ facts.charCodeAt(i), 0x01000193);
  return (hash >>> 0).toString(16);
}

export function saveOf(run: Pick<Run, 'seed' | 'startDay'>, steps: Step[], state: GameState, clock: number): Save {
  return { v: 1, seed: run.seed, startDay: run.startDay, steps, clock, check: fingerprint(state) };
}

export function writeSave(store: Store | null, save: Save) {
  try {
    store?.setItem(SAVE_KEY, JSON.stringify(save));
  } catch {
    // Full or refused: the week goes on in memory.
  }
}

export function clearSave(store: Store | null) {
  try {
    store?.removeItem(SAVE_KEY);
  } catch {
    // Nothing to clear.
  }
}

/** A week begun afresh. */
export function newRun(seed: number, startDay = 1, week: Week = generateWeek(seed)): Run {
  return { seed, startDay, week, steps: [], state: startWeek(seed, startDay), clock: 0, resumed: false, setAside: false };
}

/** The week in storage, played back to where it was left; a new week if there is none, or it cannot be kept. */
export function loadRun(store: Store | null): Run {
  let raw: string | null = null;
  try {
    raw = store?.getItem(SAVE_KEY) ?? null;
  } catch {
    return newRun(1);
  }
  if (raw === null) return newRun(1);
  const save = parse(raw);
  // A save this version of the game cannot replay is set aside like one that replays differently.
  let week: Week | null = null;
  let state: GameState | null = null;
  try {
    week = save && generateWeek(save.seed);
    state = save && week && replay(save.seed, save.startDay, save.steps, week);
  } catch {
    state = null;
  }
  if (save && week && state && fingerprint(state) === save.check) {
    // The shift clock as it stood, closing time included, once the window has opened that day.
    const clock = state.phase === 'shift' && state.opened ? save.clock : 0;
    return { seed: save.seed, startDay: save.startDay, week, steps: save.steps, state, clock, resumed: true, setAside: false };
  }
  try {
    store?.setItem(SET_ASIDE_KEY, raw);
    store?.removeItem(SAVE_KEY);
  } catch {
    // It will be set aside next time.
  }
  return { ...newRun(save?.seed ?? 1), setAside: true };
}

function parse(raw: string): Save | null {
  try {
    const save = JSON.parse(raw) as Partial<Save> | null;
    if (
      save?.v === 1 &&
      whole(save.seed) &&
      whole(save.startDay) &&
      save.startDay >= 1 &&
      save.startDay <= LAST_DAY &&
      Array.isArray(save.steps) &&
      save.steps.every(isStep) &&
      typeof save.clock === 'number' &&
      save.clock >= 0 &&
      typeof save.check === 'string'
    )
      return save as Save;
  } catch {
    // Not JSON: not a save.
  }
  return null;
}

/**
 * Where today began in the steps: just after last night's. On the letter at the end, the last
 * step is the one that brought the letter, and today began before it.
 */
function morningOf(steps: readonly Step[], state: GameState): number {
  const before = state.phase === 'ending' ? steps.lastIndexOf('next-day') - 1 : steps.length - 1;
  return before < 0 ? 0 : steps.lastIndexOf('next-day', before) + 1;
}

/** The same week, back at this morning's paper: every step up to last night's, and none since. */
export function dayAgain(run: Run, steps: readonly Step[], state: GameState): Run {
  const kept = steps.slice(0, morningOf(steps, state));
  const morning = replay(run.seed, run.startDay, kept, run.week);
  return morning ? { ...run, steps: kept, state: morning, clock: 0, resumed: false, setAside: false } : newRun(run.seed, run.startDay, run.week);
}

/** Whether anything has happened since this morning's paper. */
export const dayBegun = (steps: readonly Step[], state: GameState) => steps.length > morningOf(steps, state);
