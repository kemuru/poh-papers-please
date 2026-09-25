import type { ReactNode } from 'react';
import { RULEBOOK } from '../content/rulebook';
import { CITATION_MEMOS, DISMISSED_NOTES, REGISTERED_NOTES, UPHELD_NOTES } from '../content/verdicts';
import type { Decision, Outcome } from '../rules/judge';
import type { Violation } from '../rules/types';
import { Words } from './Documents';

type Props = { decision: Decision; outcome: Outcome; caseNo: string; seed: number };

/** One line from a pool: the same seed always prints the same line. */
const pick = <T,>(pool: readonly T[], seed: number) => pool[seed % pool.length];

export function Verdict({ decision, outcome, caseNo, seed }: Props) {
  return (
    <section className="verdict" aria-label="Verdict">
      {decision === 'challenge' ? (
        <>
          <Slip kind="filing" title="Case filed" number={`Case no. ${caseNo}`}>
            <p>To be heard by the Humanity Court at the end of the shift.</p>
          </Slip>
          <p className="shift-end">End of shift. The Humanity Court is in session.</p>
          <Slip kind="ruling" title="Ruling" number={`Case no. ${caseNo}`}>
            {outcome.correct ? (
              <>
                <p>
                  <strong>Challenge upheld.</strong>
                </p>
                {outcome.violations.map((v) => (
                  <Breach key={v.rule} lead="The applicant broke" violation={v} />
                ))}
                <p>{pick(UPHELD_NOTES, seed)}</p>
              </>
            ) : (
              <>
                <p>
                  <strong>Challenge dismissed.</strong> The applicant broke no rule in force today and has been registered.
                </p>
                <p>{pick(DISMISSED_NOTES, seed)}</p>
              </>
            )}
          </Slip>
        </>
      ) : outcome.correct ? (
        <Slip kind="note" title="Registration" number={`Application no. ${caseNo}`}>
          <p>{pick(REGISTERED_NOTES, seed)}</p>
        </Slip>
      ) : (
        <Slip kind="citation" title="Citation" number={`No. ${caseNo}`}>
          <p>Issued to: Clerk, Registry Window 3</p>
          {outcome.violations.map((v) => (
            <Breach key={v.rule} lead="Offence: registered an applicant who broke" violation={v} />
          ))}
          {outcome.violations.map((v) => (
            <p key={v.rule} className="memo">
              {pick(CITATION_MEMOS[v.rule], seed)}
            </p>
          ))}
          <p className="small">This citation has been added to your file.</p>
        </Slip>
      )}
      <a className="next" href={`?seed=${seed + 1}`}>
        Next applicant
      </a>
    </section>
  );
}

function Slip({ kind, title, number, children }: { kind: string; title: string; number: string; children: ReactNode }) {
  return (
    <article className={`slip slip-${kind}`} data-testid={kind}>
      <header>
        <strong>{title}</strong>
        <span>{number}</span>
      </header>
      {children}
    </article>
  );
}

/** Names the broken rule and shows the evidence, with the words that do not match marked. */
function Breach({ lead, violation }: { lead: string; violation: Violation }) {
  const rule = RULEBOOK[violation.rule];
  return (
    <>
      <p>
        {lead}{' '}
        <strong className="rule-name">
          Rule {rule.number}: {rule.title}
        </strong>
        .
      </p>
      <dl className="evidence">
        <dt>Required</dt>
        <dd>
          <Words marks={violation.expected} />
        </dd>
        <dt>Heard</dt>
        <dd>{violation.heard.length > 0 ? <Words marks={violation.heard} /> : <em>(no speech)</em>}</dd>
      </dl>
    </>
  );
}
