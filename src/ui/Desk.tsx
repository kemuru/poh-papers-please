import { useContext, useLayoutEffect, useRef, useState, type CSSProperties, type PointerEvent, type ReactNode, type RefObject } from 'react';
import { TIP_NOTE_LABEL } from '../content/desk';
import { SUPERVISOR_NOTES } from '../content/hall';
import type { GeneratedApplicant } from '../gen/applicant';
import type { Gazette } from '../gen/gazette';
import type { Item } from '../rules/inspect';
import { RULE_DAYS, type Decision } from '../rules/judge';
import type { Registry, RuleId, Rulebook } from '../rules/types';
import { FramePicture, PhotoPicture, ProfileCard, RulebookCard, VideoStrip } from './Documents';
import { GazettePage, WelcomeLetter } from './Gazette';
import { InspectContext } from './Inspect';
import { RegistryLookup, type Lookup } from './Registry';
import type { Decided } from './week';
import { Envelope, OfferLetter, SecondNote, type MorningPapers } from './Morning';
import { NIGHT } from '../content/night';
import { CitationSlip, FilingSlip, NightChallengeSlip } from './Slips';
import { DeskSprite, KNOB, MAGNIFIER } from './DeskArt';
import { paper, rustle } from './sound';
import { StageScale } from './Stage';

/** The night shift, as the desk shows it: which shift, its clock, and the night's two counts, the stamp on the desk included. */
export type NightView = { shift: number; seconds: number; right: number; citations: number };

/** What the desk is saying about inspecting, and who says it. */
export type InspectView = {
  on: boolean;
  picked: Item | null;
  flagged: Item[];
  message: string | null;
  /**
   * Who says it, and so where it is: `point`, the magnifier's tag while Inspect is on; `found`, `none` and
   * `agree`, the Inspect slip at the foot of the blotter, once two things have been compared; `hint`, day 1's
   * guided look, a note from the supervisor stuck on the blotter's foot (and Inspect ringed); `tip`, a second
   * note from the supervisor stuck on the day's, on how to use a tool; `drawer`, the clerk's own note about
   * Likeness's letter.
   */
  tone: 'point' | 'found' | 'none' | 'agree' | 'hint' | 'tip' | 'drawer';
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
  // What the desk is saying, if anything, and so which of its things says it: one at a time, and that one is the status.
  const { message: say, tone } = p.inspect;
  // Two things that disagree where no rule in force reads it are ringed as noted, never in the challenge's red.
  const noted = tone === 'none' && p.inspect.flagged.length > 0;
  // When these papers were called to the desk: day 1's hint is stuck down once they have landed.
  const [called, setCalled] = useState({ visit: p.visit, at: 0 });
  if (called.visit !== p.visit) setCalled({ visit: p.visit, at: performance.now() });
  // The still (or photo) under the pointer, and the one with the keyboard's focus: while Inspect is on, the
  // magnifier's lens shows the first of them, else the second.
  const desk = useRef<HTMLElement>(null);
  const [pointed, setPointed] = useState<Still | null>(null);
  const [focused, setFocused] = useState<Still | null>(null);
  const still = p.inspect.on && p.papers && !p.returning ? (pointed ?? focused) : null;
  return (
    <InspectContext.Provider value={{ on: p.inspect.on, picked: p.inspect.picked, flagged: p.inspect.flagged, pick: p.onPick }}>
      <section
        ref={desk}
        className={`desk${p.decided ? ' thunked' : ''}${p.inspect.on ? ' inspecting' : ''}${noted ? ' noted' : ''}`}
        aria-label="Desk"
        onPointerOver={(e) => setPointed(stillOf(e.target))}
        onPointerLeave={() => setPointed(null)}
        onFocus={(e) => setFocused(stillOf(e.target))}
        onBlur={(e) => {
          if (!desk.current?.contains(e.relatedTarget as Node | null)) setFocused(null);
        }}
      >
        <div
          className={[
            'desk-papers',
            p.papers && p.decided?.citation ? 'printing citing' : p.papers && p.decided?.decision === 'challenge' ? 'printing' : '',
            // Before the window opens the blotter holds the morning's papers, and its foot is theirs too.
            p.opened ? '' : 'morning',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {!p.opened && (p.night ? <NightCard night={p.night} /> : p.gazette ? <GazettePage gazette={p.gazette} /> : <WelcomeLetter />)}
          {/* Stuck to the paper, and like any paper on the desk, they can be moved off it. */}
          {!p.opened && !p.night && p.morning.note && (
            <Paper label="Second note" className="morning-extra at-note">
              <SecondNote text={p.morning.note} />
            </Paper>
          )}
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
              <Paper key={`form-${p.visit}`} label="Profile card" className={p.returning ? 'paper-form returning' : 'paper-form'} onLand={paper}>
                <ProfileCard
                  applicant={p.papers}
                  caseNo={p.caseNo}
                  stamp={p.decided?.decision}
                  onLookUpVoucher={voucher ? () => p.onLookup({ by: 'name', name: voucher }) : undefined}
                />
              </Paper>
              <Paper key={`video-${p.visit}`} label="Video strip" className={p.returning ? 'paper-video returning' : 'paper-video'} onLand={rustle}>
                <VideoStrip video={p.papers.video} onSearchFace={lookups && faceSearch ? () => p.onLookup({ by: 'face' }) : undefined} />
              </Paper>
            </>
          )}
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
          {say && (tone === 'found' || tone === 'none' || tone === 'agree') && <InspectSlip key={say} tone={tone} text={say} />}
          {say && tone === 'hint' && <HintNote key={say} text={say} since={called.at} />}
          {say && tone === 'drawer' && (
            // Where the letter lay: a note in the clerk's own hand.
            <p key={say} className="own-note" role="status" data-testid="inspector">
              {say}
            </p>
          )}
        </div>

        <div className="desk-side">
          {registryOpen && (
            // Each one's tab on its top edge, in its own stock: the book's buff, the terminal's grey.
            <div className="side-tabs" role="tablist" aria-label="Desk references">
              {(['rulebook', 'registry'] as const).map((tab) => (
                <button key={tab} role="tab" className={`side-tab side-tab-${tab}`} aria-selected={p.tab === tab} onClick={() => p.onTab(tab)} onMouseDown={keepFocus}>
                  {tab === 'rulebook' ? 'Rulebook' : 'Registry'}
                </button>
              ))}
            </div>
          )}
          <Paper label="Rulebook" className="paper-rulebook" hidden={p.tab !== 'rulebook'}>
            <RulebookCard rulebook={p.rulebook} day={p.day} page={p.page} onPage={p.onPage} night={!!p.night} />
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
          <div className="inspect-spot">
            <button
              className={`inspect-tool${p.inspect.on ? ' on' : ''}${tone === 'hint' ? ' hint' : ''}`}
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
            {/* While it is on, the glass has a tag on a string: what it wants pointed at. It hangs over the tray. */}
            {say && tone === 'point' && (
              <p className="inspect-tag" role="status" data-testid="inspector">
                {say}
              </p>
            )}
          </div>
          {/* No court sits on the night shift: its verdicts come at once, and the tray stays in the drawer. */}
          {!p.night && (
            <div className="tray" aria-label={`Court tray: ${p.filed} case${p.filed === 1 ? '' : 's'}`}>
              {/* Its brass plate, screwed on the front. */}
              <span className="tray-plate">For the court</span>
              {/* The wire basket, the case slips in it, each dropped a little askew (out by an art pixel, never turned), and the count in its window. */}
              <span className="tray-basket">
                <span className="tray-slips">
                  {Array.from({ length: Math.min(p.filed, 6) }, (_, i) => (
                    <span key={i} className="tray-slip" style={{ translate: `${(((i * 5) % 3) - 1) * 2}px ${-i * 2}px` }} />
                  ))}
                </span>
                <span className="tray-count">{p.filed}</span>
              </span>
            </div>
          )}
          <div className="sticky-spot">
            <aside className="sticky" aria-label="Note from your supervisor">
              {p.night ? NIGHT.note : SUPERVISOR_NOTES[p.day - 1]}
              <span className="sticky-sign">S.</span>
            </aside>
            {/*
              A second note, stuck on the first: how to use a registry tool the day it comes. It teaches the key the
              day's note names, and the tallest papers of the week leave the blotter's foot no room for it.
            */}
            {say && tone === 'tip' && (
              <aside key={say} className="sticky-tip" aria-label={TIP_NOTE_LABEL}>
                <p role="status" data-testid="inspector">
                  {say}
                </p>
                <span className="sticky-sign">S.</span>
              </aside>
            )}
          </div>
        </div>
        {still !== null && p.papers && <Loupe applicant={p.papers} still={still} desk={desk} layout={`${p.tab} ${p.page} ${p.lookup?.by ?? ''} ${p.inspect.flagged.length} ${p.inspect.message ?? ''}`} />}
      </section>
    </InspectContext.Provider>
  );
}

/**
 * What two things pointed at came to, on a slip at the foot of the blotter: a discrepancy in the citation's
 * red, its first word stamped, as the clerk found it; anything else in plain black. Never a green all-clear.
 */
function InspectSlip({ tone, text }: { tone: 'found' | 'none' | 'agree'; text: string }) {
  const cut = tone === 'found' ? text.indexOf(' ') : -1;
  return (
    <p className={`inspect-slip inspect-slip-${tone}`} role="status" data-testid="inspector">
      {cut > 0 ? (
        <>
          <b className="inspect-slip-stamp">{text.slice(0, cut)}</b>
          {text.slice(cut)}
        </>
      ) : (
        text
      )}
    </p>
  );
}


/** What the magnifier's lens can be over: the form's photo, or one of the video's three stills. */
type Still = 'photo' | 1 | 2 | 3;

/** The still (or the photo) on the applicant's papers that an event came from, if it came from one. */
function stillOf(target: EventTarget | null): Still | null {
  const key = target instanceof Element ? target.closest('.paper [data-inspect]')?.getAttribute('data-inspect') : null;
  if (key === 'photo') return 'photo';
  const frame = key?.match(/^frame-([123])$/);
  return frame ? (Number(frame[1]) as 1 | 2 | 3) : null;
}

/** The lens's hard shadow, and the gap it keeps from what it lies beside (design pixels). */
const LENS_SHADOW = 4;
const LENS_GAP = 8;

/**
 * The magnifier's lens: while Inspect is on, the still or the photo the clerk points at (or has the keyboard's focus
 * on), three times as big as the desk draws it, six design pixels to a portrait pixel. It lies on the desk where it
 * covers none of what the stills are held against (placeLens), and it shows every still alike: it is the clerk's
 * glass, not a verdict, and there is nothing on it to point at.
 */
function Loupe({ applicant, still, desk, layout }: { applicant: GeneratedApplicant; still: Still; desk: RefObject<HTMLElement | null>; /** Changes when the pages beside the papers do. */ layout: string }) {
  const lens = useRef<HTMLDivElement>(null);
  const scale = useContext(StageScale);
  const [at, setAt] = useState<{ left: number; top: number } | null>(null);
  useLayoutEffect(() => {
    const place = () => desk.current && lens.current && setAt(placeLens(desk.current, lens.current, scale));
    place();
    // Pointed at as the papers come in: laid again where they land.
    const coming = [...(desk.current?.querySelectorAll('.paper-form, .paper-video') ?? [])].flatMap((sheet) => sheet.getAnimations()).filter((a) => a.playState === 'running' || a.playState === 'paused');
    if (coming.length === 0) return;
    let shown = true;
    Promise.all(coming.map((a) => a.finished)).then(
      () => shown && place(),
      () => {},
    );
    return () => {
      shown = false;
    };
  }, [desk, still, scale, layout]);
  return (
    <div ref={lens} className="loupe" aria-hidden="true" data-testid="loupe" style={at ?? { visibility: 'hidden' }}>
      <span className="loupe-glass">
        {still === 'photo' ? <PhotoPicture applicant={applicant} scale={6} /> : <FramePicture video={applicant.video} frame={still} scale={6} />}
      </span>
    </div>
  );
}

type Box = { left: number; top: number; right: number; bottom: number };

/**
 * Where the lens lies, in design pixels from the desk's corner: beside the film if the blotter has the room; else over
 * the form, right of its photo and clear above the film (rising over the hall if it must); else on the blotter's empty
 * foot. Never over the booth, and never over the photo, a still, Rule 2's figure, the registry's faces, the sign or
 * what Inspect just found: failing that on every spot, wherever it covers least of them.
 */
function placeLens(desk: HTMLElement, lens: HTMLElement, scale: number) {
  const origin = desk.getBoundingClientRect();
  const box = (el: Element | null | undefined): Box | null => {
    const b = el?.getBoundingClientRect();
    if (!b || b.width === 0 || b.height === 0) return null;
    return { left: (b.left - origin.left) / scale, top: (b.top - origin.top) / scale, right: (b.right - origin.left) / scale, bottom: (b.bottom - origin.top) / scale };
  };
  // What the clerk just found stays in view too: the enlarged sign, the things framed as disagreeing, and the slip that says so.
  const kept = [...desk.querySelectorAll('.paper [data-inspect="photo"], .paper [data-inspect^="frame-"], .rule-figure, .record-face, .sign-holder, .inspectable.flagged, .inspect-slip')]
    .map(box)
    .filter((b) => b !== null);
  const [width, height] = [lens.offsetWidth + LENS_SHADOW, lens.offsetHeight + LENS_SHADOW];
  const blotter = box(desk.querySelector('.desk-papers'));
  const photo = box(desk.querySelector('.paper-form [data-inspect="photo"]'));
  const film = box(desk.querySelector('.paper-video .film'));
  const printout = box(desk.querySelector('.paper-video'));
  const ceiling = box(desk.closest('.shift')?.querySelector('.hall'))?.top ?? 0;
  const spots = [
    film && { left: film.right + LENS_GAP, top: film.top },
    photo && film && { left: photo.right + LENS_GAP, top: film.top - LENS_GAP - height },
    blotter && printout && { left: blotter.left + 12, top: printout.bottom + LENS_GAP },
  ]
    .filter((spot) => !!spot)
    .map(({ left, top }) => {
      const r = { left, top, right: left + width, bottom: top + height };
      const covered = kept.reduce((sum, k) => sum + Math.max(0, Math.min(r.right, k.right) - Math.max(r.left, k.left)) * Math.max(0, Math.min(r.bottom, k.bottom) - Math.max(r.top, k.top)), 0);
      const onDesk = r.left >= 0 && r.right <= desk.offsetWidth && r.top >= ceiling && r.bottom <= desk.offsetHeight;
      const onBlotter = onDesk && !!blotter && r.right <= blotter.right + LENS_GAP;
      return { left, top, covered, onDesk, onBlotter };
    });
  const best =
    spots.find((s) => s.onBlotter && s.covered === 0) ??
    spots.find((s) => s.onDesk && s.covered === 0) ??
    [...spots].filter((s) => s.onDesk).sort((a, b) => a.covered - b.covered)[0] ??
    spots[0];
  // On the art grid, like everything on the desk.
  return best ? { left: Math.round(best.left / 2) * 2, top: Math.round(best.top / 2) * 2 } : { left: 0, top: 0 };
}

/** When the video printout is down after a call: its frame on the blotter (paper-down on .paper-video in desk.css). */
const LANDED_MS = 640;

/**
 * Day 1's one guided look: a note from the supervisor, stuck on the foot of the blotter under the papers it is
 * about, where the Inspect slip prints once two things are compared. Stuck down as the papers land, where the
 * eye already is; brought back later (Inspect put down again), it is simply there.
 */
function HintNote({ text, since }: { text: string; since: number }) {
  const [delay] = useState(() => Math.max(0, Math.round(LANDED_MS - (performance.now() - since))));
  return (
    <aside className="hint-note" aria-label={TIP_NOTE_LABEL} style={{ '--landed': `${delay}ms` } as CSSProperties}>
      <p role="status" data-testid="inspector">
        {text}
      </p>
      <span className="sticky-sign">S.</span>
    </aside>
  );
}

/** The night shift's clock card on the blotter, where the morning paper would be: the Ministry never closes. */
function NightCard({ night }: { night: NightView }) {
  const fill = (line: string) => line.replace('{n}', String(night.shift)).replace('{right}', String(night.right)).replace('{citations}', String(night.citations));
  return (
    <article className="clock-card" aria-label={NIGHT.title} data-testid="night-card">
      <h2 className="clock-card-title">{NIGHT.title}</h2>
      <p className="clock-card-shift">{fill(NIGHT.card.shift)}</p>
      {NIGHT.card.lines.map((line) => (
        <p key={line}>{line}</p>
      ))}
      {/* The time clock's own figures, printed at the foot, a line each. */}
      <p className="clock-card-tally">
        {fill(NIGHT.card.tally)
          .split(/(?<=\.) /)
          .map((figure) => (
            <span key={figure}>{figure}</span>
          ))}
      </p>
    </article>
  );
}

/** Sheets the clerk has picked up stack from here: above the printer (z-index 60 in desk.css) and its slips (50). */
let topPaper = 100;

/** Where a sheet may be moved to, as its offset from where it lies: its bounds on each axis. */
type Reach = { x: [number, number]; y: [number, number] };

/** Moved an art pixel at a time, within its reach: a paper between the desk's pixels would blur its print. */
const clamp = (v: number, [low, high]: [number, number]) => Math.max(Math.ceil(low / 2) * 2, Math.min(Math.floor(high / 2) * 2, Math.round(v / 2) * 2));

/** The animations that put a sheet down on the blotter (desk.css): the frame each one starts on is the frame it lands. */
const LANDINGS = new Set(['card-down', 'paper-down']);

/**
 * A sheet on the desk. Drag it with the mouse to move it; it comes to the top of the pile. Not while inspecting.
 * `onLand` sounds it as it touches down, from the animation that draws that frame, so the two cannot drift apart.
 */
function Paper({ label, className, hidden, onLand, children }: { label: string; className: string; hidden?: boolean; onLand?: () => void; children: ReactNode }) {
  const [place, setPlace] = useState({ x: 0, y: 0, z: 0, lifted: false });
  const grab = useRef<{ x: number; y: number; reach: Reach } | null>(null);
  // The desk is scaled to fit the window; the mouse moves in screen pixels.
  const scale = useContext(StageScale);
  const { on: inspecting } = useContext(InspectContext);

  const down = (e: PointerEvent<HTMLElement>) => {
    if (e.button !== 0 || e.pointerType === 'touch' || inspecting) return;
    if ((e.target as HTMLElement).closest('button, a, input, [role="button"]')) return;
    const sheet = e.currentTarget;
    sheet.setPointerCapture(e.pointerId);
    // Grabbed while it is still sliding in, it stops where it is, in the hand: what was left of its slide is taken
    // as moved by hand, and its reach below is worked out from where it lies, not from where the slide had got to.
    const slide = new DOMMatrixReadOnly(getComputedStyle(sheet).transform);
    sheet.getAnimations().forEach((animation) => animation.finish());
    // It stays on what it lies on (the blotter, or the desk for the book), so it can always be taken back and every
    // key on it stays in reach, whatever the size of the stage: a third of it across the blotter at least, and all
    // of it on the desk, never over the booth nor off the stage; its head may go up over the printer at the
    // blotter's top edge, as far as the desk's, and its foot no lower than the blotter's.
    const desk = (sheet.closest('.desk') ?? sheet).getBoundingClientRect();
    const under = (sheet.closest('.desk-papers') ?? sheet.closest('.desk') ?? sheet).getBoundingClientRect();
    const at = sheet.getBoundingClientRect();
    // Where it lies, in design pixels: where it is, less how far it has been moved.
    const rest = {
      left: at.left / scale - place.x,
      right: at.right / scale - place.x,
      top: at.top / scale - place.y,
      bottom: at.bottom / scale - place.y,
    };
    const third = at.width / scale / 3;
    const bounds = (low: number, high: number): [number, number] => [Math.min(0, low), Math.max(0, high)];
    const reach: Reach = {
      x: bounds(
        Math.max(under.left / scale - 2 * third, desk.left / scale) - rest.left,
        Math.min(under.right / scale + 2 * third, desk.right / scale) - rest.right,
      ),
      y: bounds(desk.top / scale - rest.top, under.bottom / scale - rest.bottom),
    };
    const x = clamp(place.x + slide.e, reach.x);
    const y = clamp(place.y + slide.f, reach.y);
    grab.current = { x: e.clientX / scale - x, y: e.clientY / scale - y, reach };
    setPlace({ x, y, z: ++topPaper, lifted: true });
  };
  const move = (e: PointerEvent<HTMLElement>) => {
    const from = grab.current;
    if (!from) return;
    setPlace((s) => ({ ...s, x: clamp(e.clientX / scale - from.x, from.reach.x), y: clamp(e.clientY / scale - from.y, from.reach.y) }));
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
      onAnimationStart={(e) => {
        if (e.target === e.currentTarget && LANDINGS.has(e.animationName)) onLand?.();
      }}
    >
      {children}
    </section>
  );
}
