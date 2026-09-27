import { useEffect, useRef, useState, type Dispatch } from 'react';
import { EXITS } from '../content/applicants';
import { GARY_EXITS, REGULARS } from '../content/cast';
import { WINDOW_LINES } from '../content/hall';
import { citationFor, endDay } from '../economy/economy';
import type { GeneratedApplicant } from '../gen/applicant';
import { DAYS } from '../gen/day';
import { decide, judge, rulebookForDay, type Decision } from '../rules/judge';
import { Booth } from './Booth';
import { Desk } from './Desk';
import { atWindow, shiftOver, type Action, type GameState } from './week';
import { Hall } from './Hall';
import { pick } from './Slips';
import { chime, closing, paper, printer, shutter, thunk, tick } from './sound';

/** The Ministry is open from 09:00 to 17:00, whatever the clock on the wall says about real time. */
const OPENING_MINUTES = 8 * 60;

export const caseNumber = (day: number, index: number) => `${day}-${String(index + 1).padStart(3, '0')}`;

/** A day at Window 3: the hall, the booth and the desk, from opening the shutter to the last stamp. */
export function Shift({ state, queue, dispatch }: { state: GameState; queue: GeneratedApplicant[]; dispatch: Dispatch<Action> }) {
  const plan = DAYS[state.day - 1];
  const rulebook = rulebookForDay(state.day);
  const at = atWindow(state);
  const over = shiftOver(state);
  const last = state.called - 1;
  const papers = state.called > 0 ? queue[last] : null;
  const lastDecision = state.decided[last] ?? null;
  const leaving = papers !== null && (lastDecision !== null || state.timeUp);
  const canCall = state.opened && !over && at === null && state.called < queue.length;

  const elapsed = useShiftClock(plan.shiftSeconds, state.opened && !over, () => dispatch({ type: 'time-up' }));
  const secondsLeft = plan.shiftSeconds === null ? null : Math.max(0, Math.ceil(plan.shiftSeconds - elapsed));
  // No clock on the easy days: the wall clock just follows the queue.
  const minutes =
    plan.shiftSeconds === null ? (state.decided.length / queue.length) * OPENING_MINUTES : (elapsed / plan.shiftSeconds) * OPENING_MINUTES;
  const serving = DAYS.slice(0, state.day - 1).reduce((sum, d) => sum + d.applicants, 0) + state.called;

  const decideNow = (decision: Decision) => {
    if (at === null || state.timeUp) return;
    const outcome = decide(decision, judge(queue[at], rulebook, []));
    const cases = [...state.decided, { decision, outcome }].map((d) => ({ decision: d.decision, correct: d.outcome.correct }));
    dispatch({ type: 'decide', decided: { decision, outcome, citation: citationFor(cases, at) } });
  };
  const endShift = () => {
    const cases = state.decided.map((d) => ({ decision: d.decision, correct: d.outcome.correct }));
    dispatch({ type: 'close', end: endDay(state.savings, state.day, cases, state.seed) });
  };
  const lever = () => {
    if (!state.opened) dispatch({ type: 'open' });
    else if (over) endShift();
    else if (canCall) dispatch({ type: 'call' });
  };

  // Keyboard: Space pulls the lever, A and C are the stamps.
  const keys = useRef({ lever, decideNow });
  keys.current = { lever, decideNow };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || e.repeat) return;
      const onButton = (e.target as HTMLElement).closest?.('button, a, input');
      const key = e.key.toLowerCase();
      if (key === ' ' && !onButton) {
        e.preventDefault();
        keys.current.lever();
      } else if (key === 'a') keys.current.decideNow('accept');
      else if (key === 'c') keys.current.decideNow('challenge');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useSounds(state, over, lastDecision, secondsLeft);

  // At closing time, the last person says goodbye first; then the window announces it is closed.
  const [announced, setAnnounced] = useState(false);
  useEffect(() => {
    if (!over) return;
    const timer = window.setTimeout(() => setAnnounced(true), 2200);
    return () => window.clearTimeout(timer);
  }, [over]);

  return (
    <div className="shift">
      <Hall
        seed={state.seed}
        day={state.day}
        queue={queue}
        called={state.called}
        minutes={minutes}
        serving={serving}
        opened={state.opened}
        decided={state.decided.length}
        over={over}
      />
      <main className="station">
        <Booth
          day={state.day}
          applicant={papers}
          visit={state.called}
          leaving={leaving}
          speech={speechAt(state, papers, lastDecision?.decision ?? null, announced)}
          opened={state.opened}
          over={over}
          clock={clockTime(minutes)}
          timed={plan.shiftSeconds !== null}
          secondsLeft={secondsLeft}
          served={state.decided.length}
          total={queue.length}
          canCall={canCall}
          onOpen={() => dispatch({ type: 'open' })}
          onCall={() => dispatch({ type: 'call' })}
          onEnd={endShift}
        />
        <Desk
          day={state.day}
          rulebook={rulebook}
          papers={papers}
          visit={state.called}
          caseNo={caseNumber(state.day, Math.max(last, 0))}
          decided={lastDecision}
          returning={leaving}
          canDecide={at !== null && !state.timeUp}
          onDecide={decideNow}
          filed={state.decided.filter((d) => d.decision === 'challenge').length}
        />
      </main>
    </div>
  );
}

/** What is being said at the window. */
function speechAt(state: GameState, papers: GeneratedApplicant | null, decision: Decision | null, announced: boolean): string {
  if (!state.opened) return WINDOW_LINES.closed;
  if (announced) return state.timeUp ? WINDOW_LINES.sentHome : WINDOW_LINES.finished;
  if (papers && decision) return exitLine(papers, decision);
  if (papers && state.timeUp) return WINDOW_LINES.timeUp;
  if (papers) return papers.remark;
  return WINDOW_LINES.empty;
}

/** What they say as they collect their papers. It never gives away whether the clerk was right. */
function exitLine(a: GeneratedApplicant, decision: Decision): string {
  if (a.cast === 'gary') return GARY_EXITS[decision];
  if (a.cast) return REGULARS[a.cast].exits[decision];
  let hash = 0;
  for (const ch of a.name) hash = (Math.imul(hash, 31) + ch.charCodeAt(0)) >>> 0;
  return pick(EXITS[decision], hash);
}

const clockTime = (minutes: number) => {
  const total = 9 * 60 + Math.min(OPENING_MINUTES, Math.floor(minutes));
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
};

/** Real seconds since the window opened, paused while the tab is hidden. Calls onTimeUp once when the shift runs out. */
function useShiftClock(limit: number | null, running: boolean, onTimeUp: () => void): number {
  const [elapsed, setElapsed] = useState(0);
  const timeUp = useRef(onTimeUp);
  timeUp.current = onTimeUp;
  useEffect(() => {
    if (limit === null || !running) return;
    let last = performance.now();
    const timer = setInterval(() => {
      const now = performance.now();
      // Measured now: React may run the updater later, after `last` has moved on.
      const seconds = (now - last) / 1000;
      last = now;
      if (!document.hidden) setElapsed((e) => Math.min(limit, e + seconds));
    }, 250);
    return () => clearInterval(timer);
  }, [limit, running]);
  useEffect(() => {
    if (limit !== null && elapsed >= limit) timeUp.current();
  }, [limit, elapsed]);
  return elapsed;
}

/** The desk's noises, each played once when the thing it belongs to happens. */
function useSounds(state: GameState, over: boolean, lastDecision: { citation: unknown; decision: Decision } | null, secondsLeft: number | null) {
  const seen = useRef({ opened: state.opened, called: state.called, decided: state.decided.length, over, second: secondsLeft });
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);
  useEffect(() => {
    const before = seen.current;
    const later = (play: () => void, ms: number) => timers.current.push(window.setTimeout(play, ms));
    if (state.opened && !before.opened) shutter(true);
    if (state.called > before.called) {
      chime();
      later(paper, 650);
    }
    if (state.decided.length > before.decided) {
      thunk();
      if (lastDecision?.citation || lastDecision?.decision === 'challenge') later(printer, 250);
    }
    if (over && !before.over) {
      later(closing, 900);
      // In time with the shutter's own delay in desk.css (.shutter.closing).
      later(() => shutter(false), 1500);
    }
    if (secondsLeft !== null && secondsLeft <= 30 && secondsLeft > 0 && secondsLeft !== before.second && !over) tick();
    seen.current = { opened: state.opened, called: state.called, decided: state.decided.length, over, second: secondsLeft };
  }, [state.opened, state.called, state.decided.length, over, lastDecision, secondsLeft]);
}
