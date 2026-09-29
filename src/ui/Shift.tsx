import { useEffect, useRef, useState, type CSSProperties, type Dispatch } from 'react';
import { EXITS } from '../content/applicants';
import { AGENT, CLONE, CUTOUT, DEEPFAKE, FIRST_APPLICANT, INFLUENCER, PAT, PAT_MOTHER, REGULARS, SYBIL_FARM, TWINS, UNIT_EXITS, type CastId } from '../content/cast';
import { INSPECT_LINES, NEW_TOOL_TIPS } from '../content/desk';
import { WINDOW_LINES } from '../content/hall';
import { RULEBOOK } from '../content/rulebook';
import type { GeneratedApplicant } from '../gen/applicant';
import { DAYS } from '../gen/day';
import { inspect, sameItem, type Finding, type Item } from '../rules/inspect';
import { judge, RULE_DAYS, rulebookForDay, type Decision } from '../rules/judge';
import { sameName } from '../rules/registry';
import type { Applicant, RuleId } from '../rules/types';
import { Booth } from './Booth';
import type { Evidence } from './court';
import { Desk, type InspectView } from './Desk';
import { asPointed, evidenceLine, ruleName } from './evidence';
import { atWindow, shiftOver, type Action, type GameState } from './week';
import { Hall } from './Hall';
import type { Lookup } from './Registry';
import { pick } from './Slips';
import { blip, chime, closing, paper, printer, shutter, thunk, tick } from './sound';

/** How long the printer stays silent after a stamp before a citation comes out. desk.css reads it as --citation-beat. */
const CITATION_BEAT_MS = 900;
/** When a citation has been out long enough to be seen: the beat, the slip's print (.slip in desk.css), a moment. */
const CITATION_SEEN_MS = CITATION_BEAT_MS + 750 + 600;

/** The Ministry is open from 09:00 to 17:00, whatever the clock on the wall says about real time. */
const OPENING_MINUTES = 8 * 60;

export const caseNumber = (day: number, index: number) => `${day}-${String(index + 1).padStart(3, '0')}`;

/**
 * What Inspect found, as the challenge files it: the registry's record of the voucher names them as
 * the form does, not as the clerk typed the search.
 */
export function evidenceOf(rule: RuleId, items: [Item, Item], a: Applicant): Evidence {
  const spelled = (item: Item): Item => (item.kind === 'name-record' && a.voucher && sameName(item.name, a.voucher) ? { ...item, name: a.voucher } : item);
  return { rule, items: [spelled(items[0]), spelled(items[1])] };
}

type ShiftProps = {
  state: GameState;
  queue: GeneratedApplicant[];
  dispatch: Dispatch<Action>;
  /** Seconds of the shift clock already used when the desk was set out: 0, unless picked up from a save. */
  clock: number;
  onClock: (seconds: number) => void;
  /** The menu is open: the clock stops and the desk takes no keys. */
  paused: boolean;
  onMenu: () => void;
};

/** A day at Window 3: the hall, the booth and the desk, from opening the shutter to the last stamp. */
export function Shift({ state, queue, dispatch, clock, onClock, paused, onMenu }: ShiftProps) {
  const plan = DAYS[state.day - 1];
  const rulebook = rulebookForDay(state.day);
  const at = atWindow(state);
  const over = shiftOver(state);
  const lastIndex = state.called - 1;
  const papers = state.called > 0 ? queue[lastIndex] : null;
  const lastDecision = state.decided[lastIndex] ?? null;
  const leaving = papers !== null && (lastDecision !== null || state.timeUp);
  const canCall = state.opened && !over && at === null && state.called < queue.length;

  const elapsed = useShiftClock(plan.shiftSeconds, clock, state.opened && !over && !paused, () => dispatch({ type: 'time-up' }));
  const reportClock = useRef(onClock);
  reportClock.current = onClock;
  useEffect(() => reportClock.current(elapsed), [elapsed]);
  const secondsLeft = plan.shiftSeconds === null ? null : Math.max(0, Math.ceil(plan.shiftSeconds - elapsed));
  // No clock on the easy days: the wall clock just follows the queue.
  const minutes =
    plan.shiftSeconds === null ? (state.decided.length / queue.length) * OPENING_MINUTES : (elapsed / plan.shiftSeconds) * OPENING_MINUTES;
  const serving = DAYS.slice(0, state.day - 1).reduce((sum, d) => sum + d.applicants, 0) + state.called;

  // The rulebook falls open at the day's new rule; on Humanity Day, at Rule 1, after the cover rule.
  const [page, setPage] = useState<RuleId>(rulebook.find((r) => RULE_DAYS[r] === state.day) ?? rulebook.find((r) => RULE_DAYS[r] === 1)!);
  const [tab, setTab] = useState<'rulebook' | 'registry'>('rulebook');
  const [inspecting, setInspecting] = useState(false);
  const [picked, setPicked] = useState<Item | null>(null);
  const [last, setLast] = useState<{ items: [Item, Item]; finding: Finding | null } | null>(null);
  const [lookup, setLookup] = useState<Lookup | null>(null);
  const [toolsUsed, setToolsUsed] = useState<Lookup['by'][]>([]);
  // The latest discrepancy in force found on whoever is at the window: a challenge takes it to court.
  const [evidence, setEvidence] = useState<Evidence | null>(null);
  // Each applicant starts with a clean desk: nothing picked, nothing found, nothing looked up.
  const [visit, setVisit] = useState(state.called);
  if (visit !== state.called) {
    setVisit(state.called);
    setPicked(null);
    setLast(null);
    setEvidence(null);
    setLookup(null);
    setToolsUsed([]);
  }

  const pickItem = (item: Item) => {
    if (at === null) return;
    if (!picked) {
      setPicked(item);
      setLast(null);
      tick();
      return;
    }
    if (sameItem(picked, item)) return setPicked(null);
    const finding = inspect(picked, item, queue[at], rulebook, state.registry);
    setLast({ items: [picked, item], finding });
    // Two things that agree later on do not unsay the two that did not.
    if (finding?.inForce) setEvidence(evidenceOf(finding.rule, [picked, item], queue[at]));
    setPicked(null);
    if (finding) blip(finding.inForce ? 180 : 320);
    else tick();
  };
  // Inspecting needs someone at the window: with nobody there, nothing on the desk could answer.
  const toggleInspect = () => {
    if (at === null && !inspecting) return;
    setInspecting((on) => !on);
    setPicked(null);
  };
  const turnTo = (rule: RuleId) => {
    if (!rulebook.includes(rule)) return;
    setPage(rule);
    setTab('rulebook');
  };

  const stampedAt = useRef(0);
  const decideNow = (decision: Decision) => {
    if (at === null || state.timeUp) return;
    dispatch({ type: 'decide', applicant: queue[at], decision, ...(decision === 'challenge' ? { evidence } : {}) });
    stampedAt.current = performance.now();
    setInspecting(false);
    setPicked(null);
  };
  // A citation prints a beat after the stamp, and the next step waits for it: the lever pulled early
  // goes through once the slip has been out a moment, so no citation is cleared away unseen.
  const pending = useRef<number | null>(null);
  useEffect(
    () => () => {
      if (pending.current !== null) window.clearTimeout(pending.current);
    },
    [],
  );
  const afterCitation = (step: () => void) => {
    if (pending.current !== null) return;
    const wait = lastDecision?.citation ? stampedAt.current + CITATION_SEEN_MS - performance.now() : 0;
    if (wait <= 0) return step();
    pending.current = window.setTimeout(() => {
      pending.current = null;
      step();
    }, wait);
  };
  const endShift = () => afterCitation(() => dispatch({ type: 'close', queue }));
  const callNext = () => afterCitation(() => dispatch({ type: 'call' }));
  const lever = () => {
    if (!state.opened) dispatch({ type: 'open' });
    else if (over) endShift();
    else if (canCall) callNext();
  };

  // Escape leaves inspect mode; with nothing to leave, it opens the menu.
  const escape = () => (inspecting ? toggleInspect() : onMenu());

  // The registry answers about whoever is at the window, from the day the rule that needs it arrives:
  // the voucher with Rule 4, the face with Rule 5. The answer opens its tab.
  const lookupsOpen = state.day >= RULE_DAYS.vouch && at !== null && !state.timeUp;
  const faceSearchOpen = lookupsOpen && state.day >= RULE_DAYS.duplicate;
  const showLookup = (l: Lookup) => {
    setLookup(l);
    setToolsUsed((used) => (used.includes(l.by) ? used : [...used, l.by]));
    setTab('registry');
  };
  const lookUp = (what: 'voucher' | 'face') => {
    const voucher = at === null ? null : queue[at].voucher;
    if (what === 'face') showLookup({ by: 'face' });
    else if (voucher) showLookup({ by: 'name', name: voucher });
  };

  // Keyboard: Space pulls the lever, A and C are the stamps, I inspects, V and F look up the voucher
  // and the face, 0 to 6 turn the rulebook's pages.
  const keys = useRef({ lever, decideNow, toggleInspect, escape, turnTo, rulebook, paused, lookUp, lookups: lookupsOpen, faceSearch: faceSearchOpen });
  keys.current = { lever, decideNow, toggleInspect, escape, turnTo, rulebook, paused, lookUp, lookups: lookupsOpen, faceSearch: faceSearchOpen };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || e.repeat) return;
      const target = e.target as HTMLElement;
      // Typing a name into the registry is typing, not stamping; and nothing is stamped on a break.
      if (target.closest?.('input, textarea, dialog') || keys.current.paused) return;
      const onButton = target.closest?.('button, a, [role="button"]');
      const key = e.key.toLowerCase();
      if (key === ' ' && !onButton) {
        e.preventDefault();
        keys.current.lever();
      } else if (key === 'a') keys.current.decideNow('accept');
      else if (key === 'c') keys.current.decideNow('challenge');
      else if (key === 'i') keys.current.toggleInspect();
      else if (key === 'v' && keys.current.lookups) keys.current.lookUp('voucher');
      else if (key === 'f' && keys.current.faceSearch) keys.current.lookUp('face');
      else if (key === 'escape') {
        // Handled here: the browser must not take the same press as a request to close the menu it opens.
        e.preventDefault();
        keys.current.escape();
      }
      else if (/^[0-6]$/.test(key)) {
        const rule = keys.current.rulebook.find((r) => RULEBOOK[r].number === Number(key));
        if (rule) keys.current.turnTo(rule);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useSounds(state, over, lastDecision, secondsLeft);

  // At closing time, the last person says goodbye first; then the window announces it is closed.
  const [announced, setAnnounced] = useState(false);
  useEffect(() => {
    if (!over) return;
    const timer = window.setTimeout(() => setAnnounced(true), 2200);
    return () => window.clearTimeout(timer);
  }, [over]);

  return (
    <div className="shift" style={{ '--citation-beat': `${CITATION_BEAT_MS}ms` } as CSSProperties}>
      <Hall
        seed={state.seed}
        day={state.day}
        queue={queue}
        called={state.called}
        minutes={minutes}
        serving={serving}
        opened={state.opened}
        decided={state.decided.length}
        over={over}
      />
      <main className="station">
        <Booth
          day={state.day}
          applicant={papers}
          visit={state.called}
          leaving={leaving}
          speech={speechAt(state, papers, lastDecision?.decision ?? null, announced)}
          opened={state.opened}
          over={over}
          clock={clockTime(minutes)}
          timed={plan.shiftSeconds !== null}
          secondsLeft={secondsLeft}
          served={state.decided.length}
          total={queue.length}
          canCall={canCall}
          onOpen={() => dispatch({ type: 'open' })}
          onCall={callNext}
          onEnd={endShift}
        />
        <Desk
          day={state.day}
          rulebook={rulebook}
          papers={papers}
          visit={state.called}
          caseNo={caseNumber(state.day, Math.max(lastIndex, 0))}
          decided={lastDecision}
          returning={leaving}
          canDecide={at !== null && !state.timeUp}
          onDecide={decideNow}
          filed={state.decided.filter((d) => d.decision === 'challenge').length}
          opened={state.opened}
          gazette={state.gazette}
          registry={state.registry}
          page={page}
          onPage={turnTo}
          inspect={inspectView(state, at, queue, inspecting, picked, last, toolsUsed)}
          onInspect={toggleInspect}
          onPick={pickItem}
          lookup={lookup}
          onLookup={showLookup}
          tab={tab}
          onTab={setTab}
        />
      </main>
    </div>
  );
}

/** What is being said at the window. */
function speechAt(state: GameState, papers: GeneratedApplicant | null, decision: Decision | null, announced: boolean): string {
  if (!state.opened) return WINDOW_LINES.closed;
  if (announced) return state.timeUp ? WINDOW_LINES.sentHome : WINDOW_LINES.finished;
  if (papers && decision) return exitLine(papers, decision);
  if (papers && state.timeUp) return WINDOW_LINES.timeUp;
  if (papers) return papers.remark;
  return WINDOW_LINES.empty;
}

/** What the cast say as they collect their papers. */
const CAST_EXITS: Record<Exclude<CastId, keyof typeof REGULARS | 'twins'>, { accept: string; challenge: string }> = {
  unit: UNIT_EXITS,
  pat: PAT.exits,
  patMother: PAT_MOTHER.exits,
  sybilFarm: SYBIL_FARM.exits,
  agent: AGENT.exits,
  deepfake: DEEPFAKE.exits,
  cutout: CUTOUT.exits,
  clone: CLONE.exits,
  influencer: INFLUENCER.exits,
};

/** What they say as they collect their papers. It never gives away whether the clerk was right. */
function exitLine(a: GeneratedApplicant, decision: Decision): string {
  if (a.cast === 'twins') return TWINS[a.name === TWINS[0].name ? 0 : 1].exits[decision];
  if (a.cast && a.cast in REGULARS) return REGULARS[a.cast as keyof typeof REGULARS].exits[decision];
  if (a.cast) return CAST_EXITS[a.cast as keyof typeof CAST_EXITS][decision];
  if (a.name === FIRST_APPLICANT.name) return FIRST_APPLICANT.exits[decision];
  let hash = 0;
  for (const ch of a.name) hash = (Math.imul(hash, 31) + ch.charCodeAt(0)) >>> 0;
  return pick(EXITS[decision], hash);
}

/** What the strip along the bottom of the blotter says about inspecting. */
function inspectView(
  state: GameState,
  at: number | null,
  queue: GeneratedApplicant[],
  on: boolean,
  picked: Item | null,
  last: { items: [Item, Item]; finding: Finding | null } | null,
  toolsUsed: Lookup['by'][],
): InspectView {
  const flagged = last?.finding ? last.items : [];
  const view = (message: string | null, tone: InspectView['tone'] = 'idle'): InspectView => ({ on, picked, flagged, message, tone });
  // Day 1's second applicant is the one guided inspection of the week.
  const tutorial = state.day === 1 && at === 1;
  if (last?.finding) {
    const { rule, inForce } = last.finding;
    if (!inForce) return view(INSPECT_LINES.notInForce, 'none');
    const a = queue[at ?? 0];
    const found = judge(a, rulebookForDay(state.day), state.registry).violations.find((v) => v.rule === rule);
    const broke = found && asPointed(found, { rule, items: last.items }, a.video);
    const detail = broke ? ` ${evidenceLine(broke).replace(/^./, (c) => c.toUpperCase())}` : '';
    return view(`${INSPECT_LINES.found} · ${ruleName(rule)}.${detail}${tutorial ? ` ${INSPECT_LINES.guidedFound}` : ''}`, 'found');
  }
  if (last) return view(INSPECT_LINES.agree, 'idle');
  if (on && picked) return view(INSPECT_LINES.second);
  if (on) return view(tutorial ? INSPECT_LINES.guidedPoint : INSPECT_LINES.point);
  if (tutorial) return view(INSPECT_LINES.guidedHint, 'hint');
  // The day a registry tool arrives with its rule, its first use is taught at the desk, on whoever comes first, until it is used.
  const arriving = (['vouch', 'duplicate'] as const).find((rule) => RULE_DAYS[rule] === state.day);
  const tip = arriving && NEW_TOOL_TIPS[arriving];
  if (at === 0 && tip && !toolsUsed.includes(tip.tool)) return view(tip.text, 'tip');
  return view(null);
}

const clockTime = (minutes: number) => {
  const total = 9 * 60 + Math.min(OPENING_MINUTES, Math.floor(minutes));
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
};

/**
 * Real seconds since the window opened, from `start`: paused while the tab is hidden or the menu is
 * open. Calls onTimeUp once when the shift runs out.
 */
function useShiftClock(limit: number | null, start: number, running: boolean, onTimeUp: () => void): number {
  const [elapsed, setElapsed] = useState(start);
  const timeUp = useRef(onTimeUp);
  timeUp.current = onTimeUp;
  useEffect(() => {
    if (limit === null || !running) return;
    let last = performance.now();
    const timer = setInterval(() => {
      const now = performance.now();
      // Measured now: React may run the updater later, after `last` has moved on. A tick is a
      // quarter of a second; a longer gap is a background tab or a sleeping laptop, not work time.
      const seconds = Math.min(1, (now - last) / 1000);
      last = now;
      if (!document.hidden) setElapsed((e) => Math.min(limit, e + seconds));
    }, 250);
    return () => clearInterval(timer);
  }, [limit, running]);
  useEffect(() => {
    if (limit !== null && elapsed >= limit) timeUp.current();
  }, [limit, elapsed]);
  return elapsed;
}

/** The desk's noises, each played once when the thing it belongs to happens. */
function useSounds(state: GameState, over: boolean, lastDecision: { citation: unknown; decision: Decision } | null, secondsLeft: number | null) {
  const seen = useRef({ opened: state.opened, called: state.called, decided: state.decided.length, over, second: secondsLeft });
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);
  useEffect(() => {
    const before = seen.current;
    const later = (play: () => void, ms: number) => timers.current.push(window.setTimeout(play, ms));
    if (state.opened && !before.opened) shutter(true);
    if (state.called > before.called) {
      chime();
      later(paper, 650);
    }
    if (state.decided.length > before.decided) {
      thunk();
      // A case slip prints at once. A citation waits a beat, in silence, after the stamp: the moment the clerk knows.
      if (lastDecision?.citation) later(printer, CITATION_BEAT_MS);
      else if (lastDecision?.decision === 'challenge') later(printer, 250);
    }
    if (over && !before.over) {
      later(closing, 900);
      // In time with the shutter's own delay in desk.css (.shutter.closing).
      later(() => shutter(false), 1500);
    }
    if (secondsLeft !== null && secondsLeft <= 30 && secondsLeft > 0 && secondsLeft !== before.second && !over) tick();
    seen.current = { opened: state.opened, called: state.called, decided: state.decided.length, over, second: secondsLeft };
  }, [state.opened, state.called, state.decided.length, over, lastDecision, secondsLeft]);
}
