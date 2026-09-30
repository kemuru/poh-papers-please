import { useContext, useRef, useState, type PointerEvent, type ReactNode } from 'react';
import { SUPERVISOR_NOTES } from '../content/hall';
import type { GeneratedApplicant } from '../gen/applicant';
import type { Gazette } from '../gen/gazette';
import type { Item } from '../rules/inspect';
import { RULE_DAYS, type Decision } from '../rules/judge';
import type { Registry, RuleId, Rulebook } from '../rules/types';
import { ProfileCard, RulebookCard, VideoStrip } from './Documents';
import { GazettePage, WelcomeLetter } from './Gazette';
import { InspectContext } from './Inspect';
import { RegistryLookup, type Lookup } from './Registry';
import type { Decided } from './week';
import { Envelope, OfferLetter, SecondNote, type MorningPapers } from './Morning';
import { NIGHT } from '../content/night';
import { CitationSlip, FilingSlip, NightChallengeSlip } from './Slips';
import { DeskSprite, KNOB, MAGNIFIER } from './DeskArt';
import { StageScale } from './Stage';

/** The night shift, as the desk shows it: which shift, its clock, and the night's two counts, the stamp on the desk included. */
export type NightView = { shift: number; seconds: number; right: number; citations: number };

/** What inspect mode is saying, in the strip along the bottom of the blotter. */
export type InspectView = {
  on: boolean;
  picked: Item | null;
  flagged: Item[];
  message: string | null;
  /** A hint points at Inspect; a tip teaches a tool without pointing at anything. */
  tone: 'idle' | 'found' | 'none' | 'hint' | 'tip';
};

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
  /** The window is open: before that, the morning's paper lies on the blotter. */
  opened: boolean;
  gazette: Gazette | null;
  registry: Registry;
  /** The rulebook's open page. */
  page: RuleId;
  onPage: (rule: RuleId) => void;
  inspect: InspectView;
  onInspect: () => void;
  onPick: (item: Item) => void;
  lookup: Lookup | null;
  onLookup: (lookup: Lookup) => void;
  tab: 'rulebook' | 'registry';
  onTab: (tab: 'rulebook' | 'registry') => void;
  /** What else is on the blotter with the morning paper. */
  morning: MorningPapers;
  onOffer: (choice: 'signed' | 'handed-in') => void;
  /** On the night shift: no paper in the morning, and no court at five. */
  night?: NightView;
};

/** The clerk's desk. Papers can be pushed around with the mouse; the stamps are on the right. */
export function Desk(p: Props) {
  const registryOpen = p.day >= RULE_DAYS.vouch;
  const faceSearch = p.day >= RULE_DAYS.duplicate;
  // The lookups beside the papers, while the applicant is at the window.
  const lookups = registryOpen && p.canDecide && p.papers;
  const voucher = lookups ? (p.papers?.voucher ?? null) : null;
  const keepFocus = (e: { preventDefault: () => void }) => e.preventDefault();
  return (
    <InspectContext.Provider value={{ on: p.inspect.on, picked: p.inspect.picked, flagged: p.inspect.flagged, pick: p.onPick }}>
      <section className={`desk${p.decided ? ' thunked' : ''}${p.inspect.on ? ' inspecting' : ''}`} aria-label="Desk">
        <div
          className={
            p.papers && p.decided?.citation ? 'desk-papers printing citing' : p.papers && p.decided?.decision === 'challenge' ? 'desk-papers printing' : 'desk-papers'
          }
        >
          {!p.opened && (p.night ? <NightCard night={p.night} /> : p.gazette ? <GazettePage gazette={p.gazette} /> : <WelcomeLetter />)}
          {!p.opened && !p.night && p.morning.note && <SecondNote text={p.morning.note} />}
          {/* On the paper, and like any paper on the desk, they can be moved off it. */}
          {!p.opened && !p.night && p.morning.envelope && (
            <Paper label="Envelope" className="morning-extra at-envelope">
              <Envelope credit={p.morning.envelope} />
            </Paper>
          )}
          {!p.opened && !p.night && p.morning.letter && (
            <Paper label="Likeness Robotics' letter" className="morning-extra at-letter">
              <OfferLetter onSign={() => p.onOffer('signed')} onHandIn={() => p.onOffer('handed-in')} />
            </Paper>
          )}
          {p.papers && (
            <>
              <Paper key={`form-${p.visit}`} label="Profile card" className={p.returning ? 'paper-form returning' : 'paper-form'}>
                <ProfileCard
                  applicant={p.papers}
                  caseNo={p.caseNo}
                  stamp={p.decided?.decision}
                  onLookUpVoucher={voucher ? () => p.onLookup({ by: 'name', name: voucher }) : undefined}
                />
              </Paper>
              <Paper key={`video-${p.visit}`} label="Video strip" className={p.returning ? 'paper-video returning' : 'paper-video'}>
                <VideoStrip video={p.papers.video} onSearchFace={lookups && faceSearch ? () => p.onLookup({ by: 'face' }) : undefined} />
              </Paper>
            </>
          )}
          {p.opened && !p.papers && <p className="desk-empty">Papers come across the counter.</p>}
          {/* The printer at the top edge of the desk: citations and case slips land where the papers were. */}
          <div className="printer" aria-live="polite">
            {p.papers && p.decided && p.night ? (
              p.decided.decision === 'challenge' ? (
                <NightChallengeSlip decided={p.decided} caseNo={p.caseNo} name={p.papers.name} night={p.night.citations} video={p.papers.video} />
              ) : (
                p.decided.citation && <CitationSlip decided={p.decided} caseNo={p.caseNo} video={p.papers.video} night={p.night.citations} />
              )
            ) : (
              <>
                {p.papers && p.decided?.citation && <CitationSlip decided={p.decided} caseNo={p.caseNo} video={p.papers.video} />}
                {p.papers && p.decided?.decision === 'challenge' && <FilingSlip name={p.papers.name} caseNo={p.caseNo} evidence={p.decided.evidence ?? null} />}
              </>
            )}
          </div>
          {p.inspect.message && (
            <p className={`inspector inspector-${p.inspect.tone}`} role="status" data-testid="inspector">
              {p.inspect.message}
            </p>
          )}
        </div>

        <div className="desk-side">
          {registryOpen && (
            <div className="side-tabs" role="tablist" aria-label="Desk references">
              {(['rulebook', 'registry'] as const).map((tab) => (
                <button key={tab} role="tab" aria-selected={p.tab === tab} onClick={() => p.onTab(tab)} onMouseDown={keepFocus}>
                  {tab === 'rulebook' ? 'Rulebook' : 'Registry'}
                </button>
              ))}
            </div>
          )}
          <Paper label="Rulebook" className="paper-rulebook" hidden={p.tab !== 'rulebook'}>
            <RulebookCard rulebook={p.rulebook} day={p.day} page={p.page} onPage={p.onPage} />
          </Paper>
          {registryOpen && (
            <Paper label="Registry" className="paper-registry" hidden={p.tab !== 'registry'}>
              <RegistryLookup
                registry={p.registry}
                voucher={p.canDecide ? (p.papers?.voucher ?? null) : null}
                face={faceSearch && p.canDecide && p.papers ? p.papers.video.face : null}
                faceSearch={faceSearch}
                lookup={p.lookup}
                onLookup={p.onLookup}
              />
            </Paper>
          )}
        </div>

        <div className="desk-tools">
          <div className="stamps" role="group" aria-label="Stamps">
            {(['accept', 'challenge'] as const).map((decision) => (
              <button
                key={decision}
                className={`stamp-tool stamp-tool-${decision}${p.decided?.decision === decision ? ' used' : ''}`}
                aria-label={decision === 'accept' ? 'Accept' : 'Challenge'}
                disabled={!p.canDecide}
                // The stamp comes down when the button is pressed, not when it is let go: a solid thunk
                // under the finger. A keyboard press (no pointer) still stamps on click.
                onPointerDown={(e) => {
                  if (e.button === 0) p.onDecide(decision);
                }}
                onClick={(e) => {
                  if (e.detail === 0) p.onDecide(decision);
                }}
              >
                {/* The key cap sits on the stamp's handle. */}
                <span className="stamp-knob">
                  <DeskSprite sprite={KNOB} />
                  <kbd>{decision === 'accept' ? 'A' : 'C'}</kbd>
                </span>
                <span className="stamp-neck" aria-hidden="true" />
                <span className="stamp-face">{decision === 'accept' ? 'Accept' : 'Challenge'}</span>
              </button>
            ))}
          </div>
          <button
            className={`inspect-tool${p.inspect.on ? ' on' : ''}${p.inspect.tone === 'hint' ? ' hint' : ''}`}
            aria-pressed={p.inspect.on}
            disabled={!p.inspect.on && !p.canDecide}
            aria-label="Inspect"
            onClick={p.onInspect}
            onMouseDown={keepFocus}
          >
            {/* The key cap sits on the glass. */}
            <span className="inspect-glass">
              <DeskSprite sprite={MAGNIFIER} />
              <kbd>I</kbd>
            </span>
            Inspect
          </button>
          {/* No court sits on the night shift: its verdicts come at once, and the tray stays in the drawer. */}
          {!p.night && (
            <div className="tray" aria-label={`Court tray: ${p.filed} case${p.filed === 1 ? '' : 's'}`}>
              <span className="tray-label">For the court</span>
              {/* The case slips, each dropped a little askew: out by an art pixel, never turned. */}
              <span className="tray-slips">
                {Array.from({ length: Math.min(p.filed, 6) }, (_, i) => (
                  <span key={i} className="tray-slip" style={{ translate: `${(((i * 5) % 3) - 1) * 2}px ${-i * 2}px` }} />
                ))}
              </span>
              <span className="tray-count">{p.filed}</span>
            </div>
          )}
          <aside className="sticky" aria-label="Note from your supervisor">
            {SUPERVISOR_NOTES[p.day - 1]}
            <span className="sticky-sign">S.</span>
          </aside>
        </div>
      </section>
    </InspectContext.Provider>
  );
}


/** The night shift's card on the blotter, where the morning paper would be. */
function NightCard({ night }: { night: NightView }) {
  const fill = (line: string) => line.replace('{n}', String(night.shift)).replace('{right}', String(night.right)).replace('{citations}', String(night.citations));
  return (
    <article className="welcome night-card" aria-label={NIGHT.title} data-testid="night-card">
      <h2>{NIGHT.title}</h2>
      <p className="night-shift">{fill(NIGHT.card.shift)}</p>
      {NIGHT.card.lines.map((line) => (
        <p key={line}>{line}</p>
      ))}
      <p className="night-tally">{fill(NIGHT.card.tally)}</p>
    </article>
  );
}

/** Sheets the clerk has picked up stack from here: above the printer (z-index 60 in desk.css) and its slips (50). */
let topPaper = 100;

/** A sheet on the desk. Drag it with the mouse to move it; it comes to the top of the pile. Not while inspecting. */
function Paper({ label, className, hidden, children }: { label: string; className: string; hidden?: boolean; children: ReactNode }) {
  const [place, setPlace] = useState({ x: 0, y: 0, z: 0, lifted: false });
  const grab = useRef<{ x: number; y: number } | null>(null);
  // The desk is scaled to fit the window; the mouse moves in screen pixels.
  const scale = useContext(StageScale);
  const { on: inspecting } = useContext(InspectContext);

  const down = (e: PointerEvent<HTMLElement>) => {
    if (e.button !== 0 || e.pointerType === 'touch' || inspecting) return;
    if ((e.target as HTMLElement).closest('button, a, input, [role="button"]')) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    grab.current = { x: e.clientX / scale - place.x, y: e.clientY / scale - place.y };
    setPlace((s) => ({ ...s, z: ++topPaper, lifted: true }));
  };
  const move = (e: PointerEvent<HTMLElement>) => {
    const from = grab.current;
    if (!from) return;
    // Moved an art pixel at a time: a paper between the desk's pixels would blur its print.
    const clamp = (v: number) => Math.max(-700, Math.min(700, Math.round(v / 2) * 2));
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
      hidden={hidden}
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
