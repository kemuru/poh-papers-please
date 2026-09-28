import { useEffect, useState } from 'react';
import type { GeneratedApplicant } from '../gen/applicant';
import { PixelPortrait } from './PixelPortrait';
import { blip } from './sound';

type Props = {
  day: number;
  /** Whoever is at the window, or on their way out. */
  applicant: GeneratedApplicant | null;
  /** Changes with every applicant called, so each one walks up afresh. */
  visit: number;
  /** Stamped, or sent home by the clock: collecting their papers and going. */
  leaving: boolean;
  /** What is being said at the window right now. */
  speech: string;
  opened: boolean;
  over: boolean;
  /** The time on the Ministry's clock: "11:24". */
  clock: string;
  /** Whether the shift ends when the clock reaches 17:00. */
  timed: boolean;
  /** Seconds left on the shift clock, or null on days without one. */
  secondsLeft: number | null;
  served: number;
  total: number;
  canCall: boolean;
  onOpen: () => void;
  onCall: () => void;
  onEnd: () => void;
};

/** Registry Window 3 from the clerk's side: the glass, whoever is behind it, and the controls. */
export function Booth(p: Props) {
  const shutterDown = !p.opened || p.over;
  return (
    <section className="booth" aria-label="Window">
      <div className="booth-glass">
        <div className="booth-room" />
        {p.applicant && (
          <div key={p.visit} className={p.leaving ? 'visitor leaving' : 'visitor'}>
            <PixelPortrait portrait={p.applicant.photo} scale={5} title={`${p.applicant.name}, at the window`} />
          </div>
        )}
        <div className="glare" />
        <div className="grille" aria-hidden="true" />
        <div className={shutterDown ? (p.over ? 'shutter down closing' : 'shutter down') : 'shutter'} aria-hidden={!shutterDown}>
          <span>{p.over ? 'Closed' : `Window 3 · Day ${p.day}`}</span>
        </div>
      </div>
      <div className="counter" aria-hidden="true">
        <div className="counter-slot" />
      </div>

      <Speech key={`${p.visit}-${p.speech}`} text={p.speech} voice={p.applicant && !p.over ? voiceOf(p.applicant) : null} />

      <div className="hud">
        <div className="hud-cell">
          <span className="hud-label">Day</span>
          <span className="hud-value">{p.day}</span>
        </div>
        <div className={p.secondsLeft !== null && p.secondsLeft <= 60 && !p.over ? 'hud-cell hud-clock hurry' : 'hud-cell hud-clock'}>
          <span className="hud-label">{p.timed ? 'Time' : 'Time · no limit'}</span>
          <span className="hud-value" data-testid="clock">
            {p.clock}
          </span>
        </div>
        <div className="hud-cell">
          <span className="hud-label">Seen</span>
          <span className="hud-value">
            {p.served}/{p.total}
          </span>
        </div>
      </div>

      <div className="booth-actions">
        {!p.opened ? (
          <button className="lever open" onClick={p.onOpen}>
            Open the window <kbd>Space</kbd>
          </button>
        ) : p.over ? (
          <button className="lever end" onClick={p.onEnd}>
            End shift <kbd>Space</kbd>
          </button>
        ) : (
          <button className="lever call" onClick={p.onCall} disabled={!p.canCall} aria-label="Call next applicant">
            Next <kbd>Space</kbd>
          </button>
        )}
      </div>
    </section>
  );
}

/** The words appear as they are said, one blip a syllable. The whole line is in the page from the start. */
function Speech({ text, voice }: { text: string; voice: number[] | null }) {
  const [shown, setShown] = useState(0);
  // The effect restarts only for a new line or a new voice, not for every re-render of the booth.
  const voiceKey = voice?.join(',') ?? '';
  useEffect(() => {
    const pitches = voiceKey ? voiceKey.split(',').map(Number) : null;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(text.length);
      return;
    }
    let i = 0;
    const timer = setInterval(() => {
      i += 1;
      setShown(i);
      if (pitches && i % 3 === 1 && /\w/.test(text[i] ?? '')) blip(pitches[Math.floor(i / 3) % pitches.length] * (0.94 + (i % 4) * 0.03));
      if (i >= text.length) clearInterval(timer);
    }, 24);
    return () => clearInterval(timer);
  }, [text, voiceKey]);
  return (
    <div className={voice !== null ? 'speech speaking' : 'speech'} data-testid="speech">
      <span className="sr-only">{text}</span>
      <p aria-hidden="true">
        {text.slice(0, shown)}
        <span className="speech-rest">{text.slice(shown)}</span>
      </p>
    </div>
  );
}

/** Everyone has their own voice: higher for the young, lower for the old. */
function voiceOf(a: GeneratedApplicant): number[] {
  let hash = 0;
  for (const ch of a.name) hash = (Math.imul(hash, 31) + ch.charCodeAt(0)) >>> 0;
  return [{ young: 330, adult: 250, old: 200 }[a.photo.face.age] * (0.9 + (hash % 20) / 100)];
}
