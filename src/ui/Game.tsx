import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { CLERK } from '../content/cast';
import { MENU } from '../content/menu';
import { DAYS } from '../gen/day';
import { reduce, shiftOver, type Action, type GameState } from './week';
import { exposeGameState } from './gameState';
import { Menu, type MenuView } from './Menu';
import { browserStorage, canSave, dayAgain, dayBegun, newRun, saveOf, stepOf, writeSave, type Run, type Step } from './save';
import { Court, Ending, Statement } from './Screens';
import { Shift } from './Shift';
import { isMusicMuted, setMusicMuted, setMusicScene, stopMusic, type Scene } from './music';
import { isMuted, setMuted } from './sound';
import './desk.css';
import './hall.css';
import './screens.css';

/** The week as played, and every step that got it there. */
type Played = { state: GameState; steps: Step[] };

/** The reducer, keeping a note of each step that changed something: the save is that list. */
function record(played: Played, action: Action): Played {
  const state = reduce(played.state, action);
  return state === played.state ? played : { state, steps: [...played.steps, stepOf(action)] };
}

/** At the window with the clock able to run: a break or a reload stops the day here. */
const midShift = (s: GameState) => s.phase === 'shift' && s.opened && !shiftOver(s);

/** A week at Registry Window 3, from the first morning to the letter at the end. */
export function Game({ run, onRestart }: { run: Run; onRestart: (run: Run) => void }) {
  const { seed, week } = run;
  const [{ state, steps }, dispatch] = useReducer(record, run, (r): Played => ({ state: r.state, steps: r.steps }));
  const queue = week[state.day - 1];
  const [menu, setMenu] = useState<MenuView | null>(run.setAside ? 'setAside' : run.resumed && midShift(run.state) ? 'resumed' : null);

  useEffect(() => {
    exposeGameState({ ...state, queue });
  }, [state, queue]);

  // Saved after every step; the shift clock every few seconds, and whenever the page may be about to go.
  const store = useMemo(browserStorage, []);
  const saving = useMemo(() => canSave(store), [store]);
  const clock = useRef({ day: run.state.day, seconds: run.clock });
  const clockToday = clock.current.day === state.day ? clock.current.seconds : 0;
  const save = useRef(() => {});
  save.current = () => writeSave(store, saveOf(run, steps, state, clock.current.day === state.day ? clock.current.seconds : 0));
  useEffect(() => save.current(), [steps]);
  const clockSaved = useRef(run.clock);
  const onClock = (seconds: number) => {
    clock.current = { day: state.day, seconds };
    if (Math.abs(seconds - clockSaved.current) >= 5) {
      clockSaved.current = seconds;
      save.current();
    }
  };
  useEffect(() => {
    const flush = () => save.current();
    const onHide = () => document.visibilityState === 'hidden' && flush();
    document.addEventListener('visibilitychange', onHide);
    window.addEventListener('pagehide', flush);
    return () => {
      document.removeEventListener('visibilitychange', onHide);
      window.removeEventListener('pagehide', flush);
    };
  }, []);

  // Escape opens the menu; at the window, the Shift decides (it may be leaving inspect mode first).
  const phase = useRef(state.phase);
  phase.current = state.phase;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || e.repeat || (e.target as HTMLElement).closest?.('dialog')) return;
      if (phase.current === 'shift') return;
      // Or the browser takes the same press as a request to close the menu it opens.
      e.preventDefault();
      setMenu('paused');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // The music never stops between screens; it changes chord.
  const scene = musicScene(state);
  useEffect(() => setMusicScene(scene, state.day), [scene, state.day]);
  useEffect(() => stopMusic, []);

  const openMenu = () => setMenu('paused');
  const newWeek = () => onRestart(newRun(seed + 1));
  const sameDay = () => onRestart(dayAgain(run, steps, state));

  return (
    <div className={`game phase-${state.phase}`}>
      <header className="topbar">
        <h1>Ministry of Humanity</h1>
        <p>
          Registry Window 3 · Clerk <span data-testid="clerk">{CLERK.name}</span>
        </p>
        <p className="topbar-savings">
          Savings <strong data-testid="topbar-savings">{state.savings}</strong> PNK
        </p>
        <AudioSwitches onMenu={openMenu} />
      </header>
      {state.phase === 'shift' && (
        <Shift
          key={state.day}
          state={state}
          queue={queue}
          dispatch={dispatch}
          clock={clockToday}
          onClock={onClock}
          paused={menu !== null}
          onMenu={openMenu}
        />
      )}
      {state.phase === 'court' && (
        <Court
          day={state.day}
          queue={queue}
          rulings={state.rulings}
          onAppeal={(index) => dispatch({ type: 'appeal', index })}
          onDone={() => dispatch({ type: 'statement' })}
        />
      )}
      {state.phase === 'statement' && state.end && (
        <Statement
          day={state.day}
          end={state.end}
          unprocessed={queue.length - state.decided.length}
          onNext={() => dispatch({ type: 'next-day', queue })}
        />
      )}
      {state.phase === 'ending' && <Ending state={state} onNewWeek={newWeek} onDayAgain={sameDay} />}
      {menu && (
        <Menu
          view={menu}
          where={whereNow(state, clockToday)}
          day={state.day}
          days={state.day - run.startDay + 1}
          savings={state.savings}
          dayBegun={dayBegun(steps, state)}
          saving={saving}
          onView={setMenu}
          onClose={() => setMenu(null)}
          onDayAgain={sameDay}
          onNewWeek={newWeek}
        />
      )}
    </div>
  );
}

/** Where the week stands, for the top of the menu. */
function whereNow(s: GameState, clockSeconds: number): string {
  const limit = DAYS[s.day - 1].shiftSeconds;
  const line = (() => {
    if (s.phase !== 'shift') return MENU.where[s.phase];
    if (!s.opened) return MENU.where.morning;
    if (shiftOver(s)) return MENU.where.closing;
    return limit === null ? MENU.where.open : MENU.where.left;
  })();
  const left = Math.max(0, Math.ceil((limit ?? 0) - clockSeconds));
  return line.replace('{day}', String(s.day)).replace('{left}', `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`);
}

/** Which music the moment calls for. */
function musicScene(s: GameState): Scene {
  if (s.phase === 'shift') return !s.opened ? 'morning' : shiftOver(s) ? 'closing' : 'open';
  if (s.phase === 'ending') return s.ending ?? 'promoted';
  return s.phase;
}

// A mouse click leaves the focus where it was, so Space still calls the next applicant.
const keepFocus = (e: { preventDefault: () => void }) => e.preventDefault();

/** The switches in the corner: the desk's noises (M), the waiting-room music, and the menu (Esc). */
function AudioSwitches({ onMenu }: { onMenu: () => void }) {
  const [muted, setSound] = useState(isMuted);
  const [musicMuted, setMusic] = useState(isMusicMuted);
  const toggleSound = () => {
    setMuted(!isMuted());
    setSound(isMuted());
  };
  const toggleMusic = () => {
    setMusicMuted(!isMusicMuted());
    setMusic(isMusicMuted());
  };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // An M typed into the registry's name box is a letter, not the sound switch.
      if ((e.target as HTMLElement).closest?.('input, textarea')) return;
      if (e.key.toLowerCase() === 'm' && !e.repeat && !e.metaKey && !e.ctrlKey) toggleSound();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  return (
    <div className="audio-switches">
      <button className="mute" aria-pressed={muted} aria-label="Sound" title="Sound on or off (M)" onClick={toggleSound} onMouseDown={keepFocus}>
        <span className="mute-label">Sound</span>
        {muted ? 'Off' : 'On'}
      </button>
      <button className="mute" aria-pressed={musicMuted} aria-label="Music" title="Music on or off" onClick={toggleMusic} onMouseDown={keepFocus}>
        <span className="mute-label">Music</span>
        {musicMuted ? 'Off' : 'On'}
      </button>
      <button className="mute menu-button" aria-label={MENU.button} title={`${MENU.button} (${MENU.key})`} onClick={onMenu} onMouseDown={keepFocus}>
        <span className="mute-label">{MENU.button}</span>
        {MENU.key}
      </button>
    </div>
  );
}
