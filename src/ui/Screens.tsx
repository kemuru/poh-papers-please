import { useEffect, useRef } from 'react';
import { STATEMENT_FOOTERS } from '../content/hall';
import { MENU } from '../content/menu';
import { EMPTY_COURT, ENDINGS } from '../content/verdicts';
import { PAY, payLines, type DayEnd, type PayLine } from '../economy/economy';
import { RULEBOOK } from '../content/rulebook';
import type { GeneratedApplicant } from '../gen/applicant';
import { evidenceLine } from './evidence';
import type { Decided, Ruling } from './week';
import { PixelPortrait } from './PixelPortrait';
import { caseNumber } from './Shift';
import { thunk, tick } from './sound';

// The evening: the court hears the day's challenges, the accounts are read out, and at the
// end of the week (or sooner) a letter arrives.

/** Space or Enter moves on, unless a button has the focus and will do it anyway. */
function useKeyToContinue(onContinue: () => void) {
  const go = useRef(onContinue);
  go.current = onContinue;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key !== ' ' && e.key !== 'Enter') || e.repeat || (e.target as HTMLElement).closest?.('button, a, dialog')) return;
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

export function Court({ day, queue, decided, rulings, onDone }: { day: number; queue: GeneratedApplicant[]; decided: Decided[]; rulings: Ruling[]; onDone: () => void }) {
  useKeyToContinue(onDone);
  useRhythm(rulings.length, 0.75, HEARING_GAP, thunk);
  return (
    <main className="screen court-screen">
      <section className="court" aria-label="Humanity Court">
        <header className="court-head">
          <p className="court-kicker">In the matter of the Registry</p>
          <h2>The Humanity Court</h2>
          <p>Session of day {day}. The jury has not been delivered yet, so the court rules on the facts.</p>
        </header>
        {rulings.length === 0 && <p className="court-empty">{EMPTY_COURT}</p>}
        <div className={rulings.length > 6 ? 'docket crowded' : 'docket'}>
          {rulings.map((r, n) => {
            const a = queue[r.index];
            const d = decided[r.index];
            return (
              <article key={r.index} className="hearing" data-testid="ruling" style={{ animationDelay: `${0.2 + n * HEARING_GAP}s` }}>
                <div className="hearing-face">
                  <PixelPortrait portrait={a.photo} scale={1.5} background="#cfd8dc" title={`Photo of ${a.name}`} />
                </div>
                <div className="hearing-body">
                  <h3>
                    Case {caseNumber(day, r.index)} · The Registry v. {a.name}
                  </h3>
                  {r.upheld ? (
                    <p className="hearing-ruling">
                      <strong>Challenge upheld.</strong> Bounty: +{PAY.bounty} PNK.
                    </p>
                  ) : (
                    <p className="hearing-ruling">
                      <strong>Challenge dismissed.</strong> No rule broken; registered. Deposit: −{PAY.deposit} PNK.
                    </p>
                  )}
                  {r.upheld &&
                    d.outcome.violations.map((v) => (
                      <p key={v.rule} className="hearing-evidence">
                        Rule {RULEBOOK[v.rule].number}: {evidenceLine(v)}
                      </p>
                    ))}
                  {r.removed && <p className="hearing-evidence">Removed from the registry with them: {r.removed}, who vouched for them.</p>}
                  {r.note && <p className="court-note">{r.note}</p>}
                </div>
                <div className={r.upheld ? 'ruling-stamp upheld' : 'ruling-stamp dismissed'} style={{ animationDelay: `${0.75 + n * HEARING_GAP}s` }}>
                  {r.upheld ? 'Upheld' : 'Dismissed'}
                </div>
              </article>
            );
          })}
        </div>
        <button className="screen-button" onClick={onDone} style={{ animationDelay: `${0.4 + rulings.length * HEARING_GAP}s` }}>
          To the accounts
        </button>
      </section>
    </main>
  );
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

export function Ending({ kind, day, savings, onNewWeek, onDayAgain }: { kind: 'fired' | 'promoted'; day: number; savings: number; onNewWeek: () => void; onDayAgain: () => void }) {
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
        <div className="notice-actions">
          <button className="screen-button" onClick={onNewWeek}>
            {MENU.newWeek}
          </button>
          {kind === 'fired' && (
            <button className="menu-link" onClick={onDayAgain}>
              {MENU.dayAgain.replace('{day}', String(day))}
            </button>
          )}
        </div>
      </article>
    </main>
  );
}
