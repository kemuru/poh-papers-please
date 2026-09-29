import { Component, useCallback, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { MENU } from '../content/menu';
import { LAST_DAY } from '../gen/day';
import { seedForDate } from '../gen/today';
import { Board, type SavedWeek } from './Board';
import { Game } from './Game';
import { whereNow } from './Menu';
import { Night } from './Night';
import { readRecord, withEndless, withWeek, writeRecord, type Finished } from './record';
import { browserStorage, clearSave, hasSave, loadRun, newRun, type Run } from './save';
import { browserReducesMotion, readSettings, SettingsContext, writeSettings, type Settings } from './settings';
import { PortraitGallery } from './PortraitGallery';
import { Stage } from './Stage';

export function App() {
  const params = new URLSearchParams(window.location.search);
  if (import.meta.env.DEV && params.has('portraits')) return <PortraitGallery />;
  return (
    <WithSettings>
      <Stage>
        <OutOfOrder>
          <Office params={params} />
        </OutOfOrder>
      </Stage>
    </WithSettings>
  );
}

/** The settings, kept in this browser, for everything under them; reduced motion is a class on the page. */
function WithSettings({ children }: { children: ReactNode }) {
  const store = useMemo(browserStorage, []);
  const [settings, setSettings] = useState(() => readSettings(store));
  const change = useCallback(
    (next: Settings) => {
      setSettings(next);
      writeSettings(store, next);
    },
    [store],
  );
  const reduced = settings.motion === 'reduced' || browserReducesMotion();
  useLayoutEffect(() => {
    document.documentElement.classList.toggle('motion-reduced', reduced);
  }, [reduced]);
  return <SettingsContext.Provider value={{ settings, change }}>{children}</SettingsContext.Provider>;
}

/** Where the clerk is: at the notice board, at the desk with a week, or on the night shift. */
type Screen = { at: 'board' } | { at: 'desk'; take: number; run: Run } | { at: 'night'; take: number };

/** Today, as the player's own computer has it: the week everyone gets today. */
function todayIs() {
  const now = new Date();
  const date = { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
  // "Tuesday 29 September 2026", put together the same way in every browser.
  const name = (part: 'weekday' | 'month') => now.toLocaleDateString('en-GB', { [part]: 'long' });
  return {
    date: `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`,
    label: `${name('weekday')} ${date.day} ${name('month')} ${date.year}`,
    seed: seedForDate(date),
  };
}

/**
 * The Ministry: a link (?seed=, ?day=) goes straight to its week, begun afresh, as links always have;
 * a plain address opens at the notice board, where the week in this browser waits.
 */
function Office({ params }: { params: URLSearchParams }) {
  const store = useMemo(browserStorage, []);
  const [record, setRecord] = useState(() => readRecord(store));
  const [today] = useState(todayIs);
  const [screen, setScreen] = useState<Screen>(() => (linked(params) ? { at: 'desk', take: 0, run: linkRun(params) } : { at: 'board' }));
  // Every week set out on the desk is a new desk, and so is every night shift.
  const takes = useRef(0);

  // Once a link's week is behind us, the address opens at the board.
  const forgetLink = () => {
    if (window.location.search) window.history.replaceState(null, '', window.location.pathname);
  };
  const toDesk = (run: Run) => {
    forgetLink();
    setScreen({ at: 'desk', take: ++takes.current, run });
  };
  const toBoard = () => {
    forgetLink();
    setScreen({ at: 'board' });
  };
  const keep = (next: typeof record) => {
    setRecord(next);
    writeRecord(store, next);
  };
  const finished = (w: Finished) => keep(withWeek(readRecord(store), w));

  if (screen.at === 'board') {
    // Read afresh each time the board is shown: the desk has saved since.
    return <BoardFor record={record} today={today} onDesk={toDesk} onNight={() => setScreen({ at: 'night', take: ++takes.current })} />;
  }
  if (screen.at === 'night') {
    return (
      <Night
        key={screen.take}
        // Tonight's weeks, from a stream of their own: not today's week, whose day 6 would be spoilt.
        seed={1 + ((today.seed * 7 + 12_345) % 999_999_999)}
        best={record.endless}
        onDone={(right) => keep(withEndless(readRecord(store), right))}
        onBoard={toBoard}
      />
    );
  }
  return (
    <Game
      key={screen.take}
      run={screen.run}
      today={today}
      onRestart={toDesk}
      onFinished={finished}
      onBoard={toBoard}
    />
  );
}

/** The board, with the week in this browser played back to where it was left. */
function BoardFor({ record, today, onDesk, onNight }: { record: ReturnType<typeof readRecord>; today: ReturnType<typeof todayIs>; onDesk: (run: Run) => void; onNight: () => void }) {
  const [saved] = useState(() => {
    const store = browserStorage();
    return hasSave(store) ? loadRun(store) : null;
  });
  const week: SavedWeek | null =
    saved && !saved.setAside
      ? {
          where: whereNow(saved.state, saved.clock),
          ended: saved.state.phase === 'ending',
          seed: saved.seed,
          days: saved.state.day - saved.startDay + 1,
          savings: saved.state.savings,
        }
      : null;
  // A week under way from the board is picked up where it was, with no card in front: the board was the break.
  const resume = () => saved && onDesk({ ...saved, resumed: false, setAside: false });
  return (
    <Board
      saved={week}
      setAside={saved?.setAside ?? false}
      record={record}
      today={today}
      onContinue={resume}
      // After a save that could not be kept, its week begins again; otherwise the next week does.
      onNewWeek={() => onDesk(saved?.setAside ? newRun(saved.seed) : newRun((saved?.seed ?? 0) + 1))}
      onToday={() => onDesk(newRun(today.seed))}
      onNight={onNight}
    />
  );
}

const linked = (params: URLSearchParams) => params.has('seed') || params.has('day');

/** ?seed=N picks the week and ?day=D starts on that day, with fresh savings: a link always begins its week afresh. */
function linkRun(params: URLSearchParams): Run {
  const seed = whole(params.get('seed')) ?? 1;
  const day = Math.min(LAST_DAY, Math.max(1, whole(params.get('day')) ?? 1));
  return newRun(seed, day);
}

function whole(value: string | null) {
  return value !== null && /^\d{1,9}$/.test(value) ? Number(value) : null;
}

/** If anything breaks, the window closes politely instead of going blank. */
class OutOfOrder extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <main className="out-of-order" role="alert">
        <h1>Window 3 is out of order</h1>
        <p>The Ministry apologises for the inconvenience. Please reload the page and take a new number.</p>
        <pre>{String(this.state.error)}</pre>
        <button
          className="screen-button"
          onClick={() => {
            // If the saved week is what breaks, a reload would only break again.
            clearSave(browserStorage());
            window.location.assign(window.location.pathname);
          }}
        >
          {MENU.broken}
        </button>
      </main>
    );
  }
}
