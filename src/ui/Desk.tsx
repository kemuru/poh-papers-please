import { useEffect, useMemo, useState } from 'react';
import { generateApplicant } from '../gen/applicant';
import { decide, judge, rulebookForDay, type Decision, type Outcome } from '../rules/judge';
import { ProfileCard, RulebookCard, VideoStrip } from './Documents';
import { exposeGameState } from './gameState';
import { thunk } from './thunk';
import { Verdict } from './Verdict';
import './desk.css';

const DAY = 1;

/** Registry Window 3: one applicant's documents, the rulebook and the clerk's two buttons. */
export function Desk({ seed }: { seed: number }) {
  const applicant = useMemo(() => generateApplicant(seed), [seed]);
  const rulebook = rulebookForDay(DAY);
  const [decided, setDecided] = useState<{ decision: Decision; outcome: Outcome } | null>(null);
  const caseNo = `${DAY}-${String(seed).padStart(5, '0')}`;

  useEffect(() => {
    exposeGameState({ seed, day: DAY, applicant, decision: decided?.decision ?? null, outcome: decided?.outcome ?? null });
  }, [seed, applicant, decided]);

  const choose = (decision: Decision) => {
    thunk();
    // The first decision stands, however fast the second click.
    setDecided((prev) => prev ?? { decision, outcome: decide(decision, judge(applicant, rulebook, [])) });
  };

  return (
    <div className="desk-page">
      <header className="desk-header">
        <h1>Ministry of Humanity</h1>
        <p>Registry Window 3 · Day {DAY}</p>
      </header>
      <main className="desk">
        <div className="desk-column">
          <ProfileCard applicant={applicant} caseNo={caseNo} stamp={decided?.decision} />
          <VideoStrip video={applicant.video} />
        </div>
        <div className="desk-column">
          <RulebookCard rulebook={rulebook} day={DAY} />
          {decided ? (
            <Verdict decision={decided.decision} outcome={decided.outcome} caseNo={caseNo} seed={seed} />
          ) : (
            <section className="actions" aria-label="Decision">
              <div className="buttons">
                <button className="action accept" onClick={() => choose('accept')}>
                  Accept
                </button>
                <button className="action challenge" onClick={() => choose('challenge')}>
                  Challenge
                </button>
              </div>
              <p className="hint">Accept registers the applicant. Challenge files a case with the Humanity Court.</p>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
