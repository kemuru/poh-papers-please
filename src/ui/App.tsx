import { Component, useState, type ReactNode } from 'react';
import { MENU } from '../content/menu';
import { LAST_DAY } from '../gen/day';
import { Game } from './Game';
import { browserStorage, clearSave, loadRun, newRun, type Run } from './save';
import { PortraitGallery } from './PortraitGallery';
import { Stage } from './Stage';

export function App() {
  const params = new URLSearchParams(window.location.search);
  if (import.meta.env.DEV && params.has('portraits')) return <PortraitGallery />;
  return (
    <Stage>
      <OutOfOrder>
        <Week params={params} />
      </OutOfOrder>
    </Stage>
  );
}

/** The week at the desk: the one a link asks for, else the one saved in this browser, else a new one. */
function Week({ params }: { params: URLSearchParams }) {
  const [desk, setDesk] = useState(() => ({ take: 0, run: firstRun(params) }));
  const restart = (run: Run) => {
    // The link's week is behind us: from now on, a reload finds the saved one.
    if (window.location.search) window.history.replaceState(null, '', window.location.pathname);
    setDesk(({ take }) => ({ take: take + 1, run }));
  };
  return <Game key={desk.take} run={desk.run} onRestart={restart} />;
}

/**
 * ?seed=N picks the week and ?day=D starts on that day, with fresh savings: a link always begins
 * its week afresh, and a reload of it begins it again. Without one, the saved week carries on.
 */
function firstRun(params: URLSearchParams): Run {
  if (!params.has('seed') && !params.has('day')) return loadRun(browserStorage());
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
