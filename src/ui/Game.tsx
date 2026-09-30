import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { BOARD } from '../content/board';
import { CLERK } from '../content/cast';
import { MENU } from '../content/menu';
import { OFFER } from '../economy/economy';
import { headhunted, unitsPaid } from '../economy/endings';
import { cardLetter, weekCard } from '../gen/today';
import { reduce, shiftOver, weekEnd, type Action, type GameState } from './week';
import { exposeGameState } from './gameState';
import { Menu, whereNow, type MenuView } from './Menu';
import type { Finished } from './record';
import { backTo, browserStorage, canSave, dayAgain, dayBegun, fingerprint, newRun, saveOf, stepOf, writeSave, type Run, type Step } from './save';
import { useSettings } from './settings';
import { Court, Ending, Statement } from './Screens';
import { DeskSprite, NOTE, NOTE_OFF, PAUSE, SPEAKER, SPEAKER_OFF } from './DeskArt';
import { Finale } from './Finale';
import { Shift } from './Shift';
import { setMusicScene, stopMusic, toggleMusic, type Scene } from './music';
import { useVolumes } from './SettingsPanel';
import { toggleSound } from './sound';
import { audible } from './volume';
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

type Props = {
  run: Run;
  /** Today's week: the date, as the card names it, and its seed. */
  today: { date: string; label: string; seed: number };
  onRestart: (run: Run) => void;
  /** The week has reached its letter, here and now: the record counts it. */
  onFinished: (week: Finished) => void;
  /** Off to the notice board, with the week as it stands, clock and all. */
  onBoard: (held: Run) => void;
};

/** A week at Registry Window 3, from the first morning to the letter at the end. */
export function Game({ run, today, onRestart, onFinished, onBoard }: Props) {
  const { seed, week } = run;
  const [{ state, steps }, dispatch] = useReducer(record, run, (r): Played => ({ state: r.state, steps: r.steps }));
  const queue = week[state.day - 1];
  // Coming back to a week is the notice board's to show: the desk opens with no card in front of it.
  const [menu, setMenu] = useState<MenuView | null>(null);

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
      // Off to the notice board or another week: the clock as it stood goes with the save.
      flush();
    };
  }, []);

  // Escape opens the menu; at the window, the Shift decides (it may be leaving inspect mode first), and at six
  // o'clock it goes straight to the letter (the menu is still on the rail).
  const phase = useRef(state.phase);
  phase.current = state.phase;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Taken already (six o'clock's Escape goes to the letter, and the letter must not then open the menu over itself).
      if (e.key !== 'Escape' || e.repeat || e.defaultPrevented || (e.target as HTMLElement).closest?.('dialog')) return;
      if (phase.current === 'shift' || phase.current === 'finale') return;
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
  // The week goes to the board as it stands this moment, and to the save too.
  const toBoard = () => {
    save.current();
    onBoard({ ...run, steps, state, clock: clock.current.day === state.day ? clock.current.seconds : 0, resumed: false, setAside: false });
  };
  const newWeek = () => onRestart(newRun(seed + 1));
  const sameDay = () => onRestart(dayAgain(run, steps, state));
  // Any earlier morning of this week, from the menu or the letter's desk: it asks first.
  const [backDay, setBackDay] = useState<number | null>(null);
  const earlier = Array.from({ length: state.day - run.startDay }, (_, i) => run.startDay + i);
  const askBack = (day: number) => {
    setBackDay(day);
    setMenu('back');
  };

  // The week's letter, reached here and now (not a reload of it): the record counts it once. Six o'clock comes
  // before it, but the letter is what is found.
  const title = seed === today.seed ? BOARD.card.today.replace('{date}', today.label) : BOARD.card.week.replace('{seed}', String(seed));
  const ended = state.phase === 'ending' ? weekEnd(state) : null;
  const card = ended ? weekCard({ title, days: state.history.map((d) => ({ day: d.day, marks: d.marks })), ...cardLetter(ended.end.ending, ended.end.grade), savings: state.savings }) : '';
  const counted = useRef(run.state.phase === 'ending');
  useEffect(() => {
    if (!ended || counted.current) return;
    counted.current = true;
    const { ending, grade, offer, unitsStamped } = ended.end;
    onFinished({
      id: `${seed}:${run.startDay}:${steps.length}:${fingerprint(state)}`,
      ending,
      headhunted: headhunted(ending, offer === 'signed', unitsPaid(unitsStamped, offer === 'signed', OFFER.day).length),
      savings: state.savings,
      grade,
      ...(seed === today.seed ? { today: { date: today.date, letter: cardLetter(ending, grade).letter, card } } : {}),
    });
  });

  // The accounts are settled on the statement: from its first line the rail's tally, and the menu, show what
  // the roll carries forward, not the morning's figure it was brought forward from.
  const savings = state.phase === 'statement' && state.end ? state.end.after : state.savings;

  return (
    <div className={`game phase-${state.phase}`}>
      {/* The desk rail: the window's nameplate, the savings on a tally, and the switches. */}
      <header className="topbar">
        <h1 className="sr-only">Ministry of Humanity</h1>
        <p className="nameplate">
          <span className="nameplate-window">Window 3</span>
          <span className="nameplate-clerk">
            Clerk <span data-testid="clerk">{CLERK.name}</span>
          </span>
        </p>
        <p className="topbar-savings">
          Savings <strong data-testid="topbar-savings">{savings}</strong> PNK
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
      {state.phase === 'finale' && (
        // Six o'clock: the first hour of the income, in the hall, then the letter.
        <Finale state={state} week={week} paused={menu !== null} onLetter={() => dispatch({ type: 'letter' })} />
      )}
      {state.phase === 'ending' && (
        // Nothing is left to lose at the letter: a morning is one click, with no question.
        <Ending state={state} card={card} earlier={[...earlier, state.day]} onNewWeek={newWeek} onBack={(day) => onRestart(backTo(run, steps, day))} onBoard={toBoard} />
      )}
      {menu && (
        <Menu
          view={menu}
          where={whereNow(state, clockToday)}
          day={state.day}
          days={state.day - run.startDay + 1}
          savings={savings}
          dayBegun={dayBegun(steps, state)}
          earlier={earlier}
          backDay={backDay}
          saving={saving}
          onView={setMenu}
          onBack={askBack}
          onClose={() => setMenu(null)}
          onDayAgain={sameDay}
          onBackTo={(day) => onRestart(backTo(run, steps, day))}
          onNewWeek={newWeek}
          onBoard={toBoard}
        />
      )}
    </div>
  );
}

/** Which music the moment calls for. */
function musicScene(s: GameState): Scene {
  if (s.phase === 'shift') return !s.opened ? 'morning' : shiftOver(s) ? 'closing' : 'open';
  if (s.phase === 'ending') return s.ending ?? 'promoted';
  // Six o'clock: the hall's quiet, as at closing time (the lever hushes it for the beat before the number).
  if (s.phase === 'finale') return 'closing';
  return s.phase;
}

// A mouse click leaves the focus where it was, so Space still calls the next applicant.
const keepFocus = (e: { preventDefault: () => void }) => e.preventDefault();

/** The switches in the corner: the desk's noises (M), the waiting-room music, and the menu (Esc). */
export function AudioSwitches({ onMenu }: { onMenu: () => void }) {
  const { settings } = useSettings();
  const shortcuts = useRef(settings.shortcuts);
  shortcuts.current = settings.shortcuts;
  // Each switch is lit while its channel can be heard: muted, or set to 0 on its fader in the settings, it goes dark.
  const volumes = useVolumes();
  const muted = !audible(volumes.sound);
  const musicMuted = !audible(volumes.music);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // An M typed into the registry's name box is a letter, not the sound switch.
      if ((e.target as HTMLElement).closest?.('input, textarea') || !shortcuts.current) return;
      if (e.key.toLowerCase() === 'm' && !e.repeat && !e.metaKey && !e.ctrlKey) toggleSound();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  // Three switches on the rail, each drawn with what it does and a lamp that is lit while it is on.
  return (
    <div className="audio-switches">
      <button className="switch" aria-pressed={muted} aria-label="Sound" title={settings.shortcuts ? 'Sound on or off (M)' : 'Sound on or off'} onClick={toggleSound} onMouseDown={keepFocus}>
        <DeskSprite sprite={muted ? SPEAKER_OFF : SPEAKER} />
        <span className="switch-lamp" aria-hidden="true" />
        <kbd>M</kbd>
      </button>
      <button className="switch" aria-pressed={musicMuted} aria-label="Music" title="Music on or off" onClick={toggleMusic} onMouseDown={keepFocus}>
        <DeskSprite sprite={musicMuted ? NOTE_OFF : NOTE} />
        <span className="switch-lamp" aria-hidden="true" />
      </button>
      <button className="switch menu-button" aria-label={MENU.button} title={`${MENU.button} (${MENU.key})`} onClick={onMenu} onMouseDown={keepFocus}>
        <DeskSprite sprite={PAUSE} />
        <kbd>{MENU.key}</kbd>
      </button>
    </div>
  );
}
