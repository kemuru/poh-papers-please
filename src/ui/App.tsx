import { Component, type ReactNode } from 'react';
import { LAST_DAY } from '../gen/day';
import { Game } from './Game';
import { PortraitGallery } from './PortraitGallery';
import { Stage } from './Stage';

export function App() {
  const params = new URLSearchParams(window.location.search);
  if (import.meta.env.DEV && params.has('portraits')) return <PortraitGallery />;
  // ?seed=N picks the week (seed 1 when there is none); ?day=D starts on that day, with fresh savings.
  const seed = whole(params.get('seed')) ?? 1;
  const day = Math.min(LAST_DAY, Math.max(1, whole(params.get('day')) ?? 1));
  return (
    <Stage>
      <OutOfOrder>
        <Game key={`${seed}-${day}`} seed={seed} startDay={day} />
      </OutOfOrder>
    </Stage>
  );
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
      </main>
    );
  }
}
