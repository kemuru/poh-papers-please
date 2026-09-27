import { useEffect, useRef } from 'react';
import { STATEMENT_FOOTERS } from '../content/hall';
import { CAST_RULINGS, DISMISSED_NOTES, EMPTY_COURT, ENDINGS, UPHELD_NOTES } from '../content/verdicts';
import { PAY, payLines, type DayEnd, type PayLine } from '../economy/economy';
import { RULEBOOK } from '../content/rulebook';
import type { GeneratedApplicant } from '../gen/applicant';
import type { Mark, Violation } from '../rules/types';
import type { Decided } from './week';
import { PixelPortrait } from './PixelPortrait';
import { caseNumber } from './Shift';
import { pick } from './Slips';
import { thunk, tick } from './sound';

// The evening: the court hears the day's challenges, the accounts are read out, and at the
// end of the week (or sooner) a letter arrives.

/** Space or Enter moves on, unless a button has the focus and will do it anyway. */
function useKeyToContinue(onContinue: () => void) {
  const go = useRef(onContinue);
  go.current = onContinue;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key !== ' ' && e.key !== 'Enter') || e.repeat || (e.target as HTMLElement).closest?.('button, a')) return;
      e.preventDefault();
      go.current();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
}

/** Plays `sound` once for each of `count` things as they appear, `gap` seconds apart. */
function useRhythm(count: number, delay: number, gap: number, sound: () => void) {
  useEffect(() => {
    const timers = Array.from({ length: count }, (_, n) => window.setTimeout(sound, (delay + n * gap) * 1000));
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [count, delay, gap, sound]);
}

const HEARING_GAP = 0.9;

export function Court({ day, queue, decided, onDone }: { day: number; queue: GeneratedApplicant[]; decided: Decided[]; onDone: () => void }) {
  const cases = decided.flatMap((d, i) => (d.decision === 'challenge' ? [{ d, a: queue[i], i }] : []));
  useKeyToContinue(onDone);
  useRhythm(cases.length, 0.75, HEARING_GAP, thunk);
  return (
    <main className="screen court-screen">
      <section className="court" aria-label="Humanity Court">
        <header className="court-head">
          <p className="court-kicker">In the matter of the Registry</p>
          <h2>The Humanity Court</h2>
          <p>Session of day {day}. The jury has not been delivered yet, so the court rules on the facts.</p>
        </header>
        {cases.length === 0 && <p className="court-empty">{EMPTY_COURT}</p>}
        <div className={cases.length > 6 ? 'docket crowded' : 'docket'}>
          {cases.map(({ d, a, i }, n) => {
            const upheld = d.outcome.correct;
            const cast = a.cast ? CAST_RULINGS[a.cast] : null;
            const note = cast ? (a.cast === 'gary' ? cast[(day - 1) % cast.length] : pick(cast, i)) : pick(upheld ? UPHELD_NOTES : DISMISSED_NOTES, i + day);
            return (
              <article key={i} className="hearing" data-testid="ruling" style={{ animationDelay: `${0.2 + n * HEARING_GAP}s` }}>
                <div className="hearing-face">
                  <PixelPortrait portrait={a.photo} scale={1.5} background="#cfd8dc" title={`Photo of ${a.name}`} />
                </div>
                <div className="hearing-body">
                  <h3>
                    Case {caseNumber(day, i)} · The Registry v. {a.name}
                  </h3>
                  {upheld ? (
                    <p className="hearing-ruling">
                      <strong>Challenge upheld.</strong> Bounty: +{PAY.bounty} PNK.
                    </p>
                  ) : (
                    <p className="hearing-ruling">
                      <strong>Challenge dismissed.</strong> No rule broken; registered. Deposit: −{PAY.deposit} PNK.
                    </p>
                  )}
                  {upheld &&
                    d.outcome.violations.map((v) => (
                      <p key={v.rule} className="hearing-evidence">
                        {evidenceLine(v)}
                      </p>
                    ))}
                  <p className="court-note">{note}</p>
                </div>
                <div className={upheld ? 'ruling-stamp upheld' : 'ruling-stamp dismissed'} style={{ animationDelay: `${0.75 + n * HEARING_GAP}s` }}>
                  {upheld ? 'Upheld' : 'Dismissed'}
                </div>
              </article>
            );
          })}
        </div>
        <button className="screen-button" onClick={onDone} style={{ animationDelay: `${0.4 + cases.length * HEARING_GAP}s` }}>
          To the accounts
        </button>
      </section>
    </main>
  );
}

/** The evidence in one line, for the docket: what was said instead, or what was never said. */
function evidenceLine(v: Violation): string {
  const broke = `Rule ${RULEBOOK[v.rule].number}:`;
  // Each run of marked words, in order: "We … we are … we are".
  const runs = (marks: Mark[]) => {
    const out: string[] = [];
    marks.forEach((m, k) => {
      if (m.ok) return;
      if (k > 0 && !marks[k - 1].ok) out[out.length - 1] += ` ${m.word}`;
      else out.push(m.word);
    });
    return out.join(' … ');
  };
  const said = runs(v.heard);
  const missing = runs(v.expected);
  if (v.heard.length === 0) return `${broke} said nothing at all.`;
  if (said) return `${broke} said “${said}”, not “${missing}”.`;
  const count = v.expected.filter((m) => !m.ok).length;
  return count > 4 ? `${broke} ${count} words of it never said.` : `${broke} never said “${missing}”.`;
}

const ROW_GAP = 0.22;

/** The clerk's statement, typed out a line at a time, like the end of every day at every desk. */
export function Statement({ day, end, unprocessed, onNext }: { day: number; end: DayEnd; unprocessed: number; onNext: () => void }) {
  const { pay } = end;
  const label = (line: PayLine) =>
    line.kind === 'fines'
      ? `Citations: ${plural(pay.warnings, 'warning')}, ${plural(pay.fines, 'fine')}`
      : `${PAY_LABELS[line.kind]}, ${line.count} × ${Math.abs(line.each)}`;
  const rows: { label: string; amount: number | null; kind?: string }[] = [
    { label: 'Savings brought forward', amount: end.before, kind: 'balance' },
    // Registrations always show, even at nought; the rest only when something happened.
    ...payLines(pay)
      .filter((line) => line.kind === 'registrations' || line.count > 0 || (line.kind === 'fines' && pay.warnings > 0))
      .map((line) => ({ label: label(line), amount: line.amount })),
    ...(unprocessed ? [{ label: `Sent home unprocessed: ${unprocessed}`, amount: null }] : []),
    ...end.bills.map((b) => ({ label: b.item, amount: -b.amount })),
    { label: 'Savings carried forward', amount: end.after, kind: 'total' },
  ];
  const next = end.fired || end.promoted ? 'Continue' : `Begin day ${day + 1}`;
  useKeyToContinue(onNext);
  useRhythm(rows.length, 0.3, ROW_GAP, tick);
  return (
    <main className="screen statement-screen">
      <section className="statement" aria-label="Statement">
        <h2>
          Clerk's statement <span>Day {day}</span>
        </h2>
        <dl>
          {rows.map((r, n) => (
            <div key={r.label} className={`row ${r.kind ?? ''} ${r.amount !== null && r.amount < 0 ? 'minus' : ''}`} style={{ animationDelay: `${0.3 + n * ROW_GAP}s` }}>
              <dt>{r.label}</dt>
              <dd data-testid={r.kind === 'total' ? 'savings' : undefined}>{r.amount === null ? '—' : signed(r.amount, r.kind)}</dd>
            </div>
          ))}
        </dl>
        {end.fired && (
          <p className="statement-alert" style={{ animationDelay: `${0.3 + rows.length * ROW_GAP}s` }}>
            Savings below zero.
          </p>
        )}
        <p className="statement-footer" style={{ animationDelay: `${0.4 + rows.length * ROW_GAP}s` }}>
          {STATEMENT_FOOTERS[day - 1]}
        </p>
        <button className="screen-button" onClick={onNext} style={{ animationDelay: `${0.6 + rows.length * ROW_GAP}s` }}>
          {next}
        </button>
      </section>
    </main>
  );
}

const PAY_LABELS: Record<Exclude<PayLine['kind'], 'fines'>, string> = {
  registrations: 'Registrations',
  upheld: 'Challenges upheld',
  dismissed: 'Deposits forfeited',
};
const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;
const signed = (amount: number, kind?: string) => (kind ? `${amount} PNK` : amount > 0 ? `+${amount}` : String(amount));

export function Ending({ kind, day, savings, seed }: { kind: 'fired' | 'promoted'; day: number; savings: number; seed: number }) {
  const letter = ENDINGS[kind];
  return (
    <main className="screen ending-screen">
      <article className={`notice notice-${kind}`} aria-label="Notice">
        <p className="notice-head">Ministry of Humanity · Human Resources</p>
        <h2>{letter.title}</h2>
        {letter.lines.map((line) => (
          <p key={line}>{line.replace('{day}', String(day))}</p>
        ))}
        <p className="notice-savings">Final savings: {savings} PNK</p>
        <div className="notice-stamp">{kind === 'fired' ? 'Terminated' : 'Promoted'}</div>
        <a className="screen-button" href={`?seed=${seed + 1}`}>
          Start a new week
        </a>
      </article>
    </main>
  );
}
