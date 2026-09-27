import { useEffect, useMemo, useReducer, useState } from 'react';
import { generateWeek } from '../gen/day';
import { reduce, shiftOver, startWeek, type GameState } from './week';
import { exposeGameState } from './gameState';
import { Court, Ending, Statement } from './Screens';
import { Shift } from './Shift';
import { isMusicMuted, setMusicMuted, setMusicScene, stopMusic, type Scene } from './music';
import { isMuted, setMuted } from './sound';
import './desk.css';
import './hall.css';
import './screens.css';

/** A week at Registry Window 3, from the first morning to the letter at the end. */
export function Game({ seed, startDay }: { seed: number; startDay: number }) {
  const week = useMemo(() => generateWeek(seed), [seed]);
  const [state, dispatch] = useReducer(reduce, undefined, () => startWeek(seed, startDay));
  const queue = week[state.day - 1];

  useEffect(() => {
    exposeGameState({ ...state, queue });
  }, [state, queue]);

  // The music never stops between screens; it changes chord.
  const scene = musicScene(state);
  useEffect(() => setMusicScene(scene, state.day), [scene, state.day]);
  useEffect(() => stopMusic, []);

  return (
    <div className={`game phase-${state.phase}`}>
      <header className="topbar">
        <h1>Ministry of Humanity</h1>
        <p>Registry Window 3</p>
        <p className="topbar-savings">
          Savings <strong data-testid="topbar-savings">{state.savings}</strong> PNK
        </p>
        <AudioSwitches />
      </header>
      {state.phase === 'shift' && <Shift key={state.day} state={state} queue={queue} dispatch={dispatch} />}
      {state.phase === 'court' && (
        <Court day={state.day} queue={queue} decided={state.decided} onDone={() => dispatch({ type: 'statement' })} />
      )}
      {state.phase === 'statement' && state.end && (
        <Statement
          day={state.day}
          end={state.end}
          unprocessed={queue.length - state.decided.length}
          onNext={() => dispatch({ type: 'next-day' })}
        />
      )}
      {state.phase === 'ending' && state.end && (
        <Ending kind={state.end.fired ? 'fired' : 'promoted'} day={state.day} savings={state.savings} seed={seed} />
      )}
    </div>
  );
}

/** Which music the moment calls for. */
function musicScene(s: GameState): Scene {
  if (s.phase === 'shift') return !s.opened ? 'morning' : shiftOver(s) ? 'closing' : 'open';
  if (s.phase === 'ending') return s.end?.fired ? 'fired' : 'promoted';
  return s.phase;
}

/** Two switches in the corner: the desk's noises (M) and the waiting-room music. */
function AudioSwitches() {
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
      if (e.key.toLowerCase() === 'm' && !e.repeat && !e.metaKey && !e.ctrlKey) toggleSound();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  // A mouse click leaves the focus where it was, so Space still calls the next applicant.
  const keepFocus = (e: { preventDefault: () => void }) => e.preventDefault();
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
    </div>
  );
}
