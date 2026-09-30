import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { MENU } from '../content/menu';
import { NIGHT } from '../content/night';
import { generateDay } from '../gen/day';
import type { NightView } from './Desk';
import { DeskSprite, MOON } from './DeskArt';
import { AudioSwitches } from './Game';
import { exposeGameState } from './gameState';
import { setMusicScene, stopMusic } from './music';
import { SettingsPanel } from './SettingsPanel';
import { Shift } from './Shift';
import { reduce, shiftOver, startWeek, type Action, type GameState } from './week';

/** Every night shift is another week's day 6: the day before Humanity Day, every rule in force. */
export const NIGHT_DAY = 6;
/** Citations that end the night. */
export const CITATIONS = 3;
/** Each shift's clock, shorter than the last: six minutes, then 30 seconds less a shift, down to two and a half. */
export const secondsFor = (shift: number) => Math.max(150, 360 - 30 * (shift - 1));

export type NightState = {
  /** The week the night began with: shift n is week `seed + n - 1`'s day 6. */
  seed: number;
  shift: number;
  /** The shift at the window, as the desk's own reducer keeps it. */
  day: GameState;
  right: number;
  citations: number;
};

export function startNight(seed: number): NightState {
  return { seed, shift: 1, day: startWeek(seed, NIGHT_DAY), right: 0, citations: 0 };
}

/**
 * The desk's own reducer, with the night's rules on top: every stamp is judged at once, a citation is a
 * fake stamped in or a human challenged, and when a queue is done the next one comes in. There is no
 * court and no evening: `close` starts the next shift, the week after's day 6.
 */
export function nightReduce(n: NightState, action: Action): NightState {
  if (n.citations >= CITATIONS) return n;
  if (action.type === 'close') {
    // Only a queue that is done, or sent home, makes way for the next.
    if (!shiftOver(n.day)) return n;
    const shift = n.shift + 1;
    // The lines already said tonight stay said.
    return { ...n, shift, day: { ...startWeek(n.seed + shift - 1, NIGHT_DAY), shown: n.day.shown } };
  }
  const day = reduce(n.day, action);
  if (day === n.day) return n;
  if (action.type !== 'decide') return { ...n, day };
  const last = day.decided[day.decided.length - 1];
  if (last.outcome.correct) return { ...n, day, right: n.right + 1 };
  // A human challenged is a citation tonight, as a fake stamped in is: it prints after the same silent beat,
  // and the lever waits for it to be seen.
  const cited = { ...day, decided: [...day.decided.slice(0, -1), { ...last, citation: last.citation ?? ('fine' as const) }] };
  return { ...n, day: cited, citations: n.citations + 1 };
}

/** How long the third citation stays on the desk before the night is over. */
const LAST_SLIP_MS = 2600;

/** "The Ministry never closes": the night shift, unlocked by any letter, until the third citation. */
export function Night({ seed, best, onDone, onBoard }: { seed: number; best: number | null; onDone: (right: number) => void; onBoard: () => void }) {
  const [take, setTake] = useState(0);
  // Each night again starts on weeks not yet seen tonight, so the best is not a matter of memory.
  return <NightShift key={take} seed={seed + take * 100} best={best} onDone={onDone} onBoard={onBoard} onAgain={() => setTake((t) => t + 1)} />;
}

function NightShift({ seed, best, onDone, onBoard, onAgain }: { seed: number; best: number | null; onDone: (right: number) => void; onBoard: () => void; onAgain: () => void }) {
  const [n, dispatch] = useReducer(nightReduce, seed, startNight);
  const queue = useMemo(() => generateDay(n.seed + n.shift - 1, NIGHT_DAY), [n.seed, n.shift]);
  const [paused, setPaused] = useState(false);
  const [closed, setClosed] = useState(false);
  const counted = useRef(false);

  useEffect(() => exposeGameState({ ...n.day, queue, night: { shift: n.shift, right: n.right, citations: n.citations, closed } }), [n, queue, closed]);
  // The waiting room's band plays on, as it does all week.
  useEffect(() => setMusicScene(closed ? 'fired' : n.day.opened ? 'open' : 'morning', NIGHT_DAY), [closed, n.day.opened]);
  useEffect(() => stopMusic, []);

  // The night goes in the record once: when the third citation is stamped, or when the clerk leaves it.
  const count = () => {
    if (counted.current || n.right === 0) return;
    counted.current = true;
    onDone(n.right);
  };
  const leave = () => {
    count();
    onBoard();
  };
  // The third citation prints, and the night is over once it has been seen.
  const over = n.citations >= CITATIONS;
  useEffect(() => {
    if (!over) return;
    count();
    const timer = window.setTimeout(() => setClosed(true), LAST_SLIP_MS);
    return () => window.clearTimeout(timer);
    // Once, as the night ends.
  }, [over]);
  // Escape opens the break wherever the desk is not there to take it: while the last slip prints, and at the letter.
  useEffect(() => {
    if (!over) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || e.repeat || (e.target as HTMLElement).closest?.('dialog')) return;
      e.preventDefault();
      setPaused(true);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [over]);

  const view: NightView = { shift: n.shift, seconds: secondsFor(n.shift), right: n.right, citations: n.citations };
  const bestNow = Math.max(best ?? 0, closed ? n.right : 0);
  return (
    <div className="game phase-shift night">
      {/* The desk rail at night: the window's nameplate with the shift on it, and the night's two tallies. */}
      <header className="topbar">
        <h1 className="sr-only">{NIGHT.title}</h1>
        <p className="nameplate">
          <span className="nameplate-window">Window 3</span>
          <span className="nameplate-clerk">{NIGHT.card.shift.replace('{n}', String(n.shift))}</span>
        </p>
        <p className="topbar-savings">
          {NIGHT.topbar.right} <strong data-testid="night-right">{n.right}</strong>
        </p>
        <p className="topbar-tally">
          {NIGHT.topbar.citations} <strong data-testid="night-citations">{NIGHT.topbar.count.replace('{n}', String(n.citations)).replace('{all}', String(CITATIONS))}</strong>
        </p>
        <AudioSwitches onMenu={() => setPaused(true)} />
      </header>
      {closed ? (
        // The night's clock card, punched out: the window closed, the night's figures, and the time clock's stamp.
        <main className="screen ending-screen night-end">
          <div className="ending-desk">
            <article className="clock-card night-end-card" aria-label={NIGHT.end.title} data-testid="night-end">
              <h2 className="clock-card-title night-end-title">
                {NIGHT.end.title}
                <DeskSprite sprite={MOON} />
              </h2>
              {NIGHT.end.lines.map((line) => (
                <p key={line}>{line.replace('{right}', String(n.right)).replace('{shifts}', (n.shift === 1 ? NIGHT.end.shift : NIGHT.end.shifts).replace('{n}', String(n.shift)))}</p>
              ))}
              <div className="night-end-foot">
                <p className="clock-card-tally">{NIGHT.end.best.replace('{best}', String(bestNow))}</p>
                <p className="night-end-stamp">{NIGHT.end.stamp}</p>
              </div>
            </article>
            <div className="ending-ways">
              <button className="screen-button" onClick={onAgain}>
                {NIGHT.end.again}
              </button>
              <button className="board-button" onClick={leave}>
                {MENU.board}
              </button>
            </div>
          </div>
        </main>
      ) : (
        <Shift
          key={n.shift}
          state={n.day}
          queue={queue}
          dispatch={dispatch}
          clock={0}
          onClock={() => {}}
          paused={paused || over}
          onMenu={() => setPaused(true)}
          night={view}
        />
      )}
      {paused && <NightPause onBack={() => setPaused(false)} onBoard={leave} />}
    </div>
  );
}

/** The night's break: back to the window, or out to the notice board. The night is not saved. */
function NightPause({ onBack, onBoard }: { onBack: () => void; onBoard: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = dialog.current!;
    if (!d.open) d.showModal();
    d.querySelector<HTMLElement>('[data-safe]')?.focus();
  }, []);
  return (
    <dialog
      ref={dialog}
      className="menu"
      aria-labelledby="night-pause-title"
      onCancel={(e) => {
        e.preventDefault();
        onBack();
      }}
      onClose={onBack}
    >
      <article className="notice menu-card">
        <p className="notice-head">{MENU.head}</p>
        <h2 id="night-pause-title">{MENU.paused.title}</h2>
        <p>{MENU.paused.line}</p>
        <div className="menu-actions">
          <button className="screen-button" data-safe onClick={onBack}>
            {MENU.back}
          </button>
        </div>
        <div className="menu-restarts">
          <button className="menu-link" onClick={onBoard}>
            {MENU.board}
          </button>
        </div>
        <SettingsPanel />
      </article>
    </dialog>
  );
}
