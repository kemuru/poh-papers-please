import { useContext, useRef, useState, type PointerEvent, type ReactNode } from 'react';
import { SUPERVISOR_NOTES } from '../content/hall';
import type { GeneratedApplicant } from '../gen/applicant';
import type { Decision } from '../rules/judge';
import type { Rulebook } from '../rules/types';
import { ProfileCard, RulebookCard, VideoStrip } from './Documents';
import type { Decided } from './week';
import { CitationSlip, FilingSlip } from './Slips';
import { StageScale } from './Stage';

type Props = {
  day: number;
  rulebook: Rulebook;
  /** The papers on the desk: whoever is at the window, or whoever is collecting theirs. */
  papers: GeneratedApplicant | null;
  /** Changes with every applicant called, so their papers land fresh. */
  visit: number;
  caseNo: string;
  /** The decision on these papers, once stamped. */
  decided: Decided | null;
  /** The papers are going back through the slot: stamped, or the clock ran out. */
  returning: boolean;
  canDecide: boolean;
  onDecide: (decision: Decision) => void;
  /** Cases in the tray for the court. */
  filed: number;
};

/** The clerk's desk. Papers can be pushed around with the mouse; the stamps are on the right. */
export function Desk(p: Props) {
  return (
    <section className={p.decided ? 'desk thunked' : 'desk'} aria-label="Desk">
      <div className={p.papers && (p.decided?.citation || p.decided?.decision === 'challenge') ? 'desk-papers printing' : 'desk-papers'}>
        {p.papers && (
          <>
            <Paper key={`form-${p.visit}`} label="Profile card" className={p.returning ? 'paper-form returning' : 'paper-form'}>
              <ProfileCard applicant={p.papers} caseNo={p.caseNo} stamp={p.decided?.decision} />
            </Paper>
            <Paper key={`video-${p.visit}`} label="Video strip" className={p.returning ? 'paper-video returning' : 'paper-video'}>
              <VideoStrip video={p.papers.video} />
            </Paper>
          </>
        )}
        {!p.papers && <p className="desk-empty">Papers come across the counter.</p>}
        {/* The printer at the top edge of the desk: citations and case slips land where the papers were. */}
        <div className="printer" aria-live="polite">
          {p.papers && p.decided?.citation && <CitationSlip decided={p.decided} caseNo={p.caseNo} n={p.visit + p.day} />}
          {p.papers && p.decided?.decision === 'challenge' && <FilingSlip name={p.papers.name} caseNo={p.caseNo} />}
        </div>
      </div>

      <div className="desk-side">
        <Paper label="Rulebook" className="paper-rulebook">
          <RulebookCard rulebook={p.rulebook} day={p.day} />
        </Paper>
      </div>

      <div className="desk-tools">
        <div className="stamps" role="group" aria-label="Stamps">
          {(['accept', 'challenge'] as const).map((decision) => (
            <button
              key={decision}
              className={`stamp-tool stamp-tool-${decision}${p.decided?.decision === decision ? ' used' : ''}`}
              aria-label={decision === 'accept' ? 'Accept' : 'Challenge'}
              disabled={!p.canDecide}
              onClick={() => p.onDecide(decision)}
            >
              <span className="stamp-knob" aria-hidden="true" />
              <span className="stamp-neck" aria-hidden="true" />
              <span className="stamp-face">{decision === 'accept' ? 'Accept' : 'Challenge'}</span>
              <kbd>{decision === 'accept' ? 'A' : 'C'}</kbd>
            </button>
          ))}
        </div>
        <div className="tray" aria-label={`Court tray: ${p.filed} case${p.filed === 1 ? '' : 's'}`}>
          <span className="tray-label">For the court</span>
          <span className="tray-slips">
            {Array.from({ length: Math.min(p.filed, 6) }, (_, i) => (
              <span key={i} className="tray-slip" style={{ rotate: `${((i * 37) % 9) - 4}deg` }} />
            ))}
          </span>
          <span className="tray-count">{p.filed}</span>
        </div>
        <aside className="sticky" aria-label="Note from your supervisor">
          {SUPERVISOR_NOTES[p.day - 1]}
          <span className="sticky-sign">S.</span>
        </aside>
      </div>
    </section>
  );
}

/** Sheets the clerk has picked up stack from here: above the printer (z-index 60 in desk.css) and its slips (50). */
let topPaper = 100;

/** A sheet on the desk. Drag it with the mouse to move it; it comes to the top of the pile. */
function Paper({ label, className, children }: { label: string; className: string; children: ReactNode }) {
  const [place, setPlace] = useState({ x: 0, y: 0, z: 0, lifted: false });
  const grab = useRef<{ x: number; y: number } | null>(null);
  // The desk is scaled to fit the window; the mouse moves in screen pixels.
  const scale = useContext(StageScale);

  const down = (e: PointerEvent<HTMLElement>) => {
    if (e.button !== 0 || e.pointerType === 'touch') return;
    if ((e.target as HTMLElement).closest('button, a, input')) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    grab.current = { x: e.clientX / scale - place.x, y: e.clientY / scale - place.y };
    setPlace((s) => ({ ...s, z: ++topPaper, lifted: true }));
  };
  const move = (e: PointerEvent<HTMLElement>) => {
    const from = grab.current;
    if (!from) return;
    const clamp = (v: number) => Math.max(-700, Math.min(700, v));
    setPlace((s) => ({ ...s, x: clamp(e.clientX / scale - from.x), y: clamp(e.clientY / scale - from.y) }));
  };
  const up = () => {
    grab.current = null;
    setPlace((s) => ({ ...s, lifted: false }));
  };

  return (
    <section
      aria-label={label}
      className={`paper ${className}${place.lifted ? ' lifted' : ''}`}
      style={{ translate: `${place.x}px ${place.y}px`, zIndex: place.z || undefined }}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
    >
      {children}
    </section>
  );
}
