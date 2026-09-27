import type { ReactNode } from 'react';
import { RULEBOOK } from '../content/rulebook';
import { CITATION_MEMOS, CITATION_TERMS } from '../content/verdicts';
import { PAY } from '../economy/economy';
import type { Violation } from '../rules/types';
import { Words } from './Documents';
import type { Decided } from './week';

/** One line from a pool: the same number always prints the same line. */
export const pick = <T,>(pool: readonly T[], n: number) => pool[Math.abs(n) % pool.length];

/** Printed the moment a fake is registered. The day's first is a warning; the rest are fines. */
export function CitationSlip({ decided, caseNo, n }: { decided: Decided; caseNo: string; n: number }) {
  const warning = decided.citation === 'warning';
  return (
    <Slip kind="citation" variant={warning ? 'warning' : 'fine'} title={warning ? 'Citation · Warning' : 'Citation'} number={`No. ${caseNo}`}>
      <p>Issued to: Clerk, Registry Window 3</p>
      {decided.outcome.violations.map((v) => (
        <Breach key={v.rule} lead="Offence: registered an applicant who broke" violation={v} />
      ))}
      {decided.outcome.violations.map((v) => (
        <p key={v.rule} className="memo">
          {pick(CITATION_MEMOS[v.rule], n)}
        </p>
      ))}
      <p className="terms">{warning ? CITATION_TERMS.warning : CITATION_TERMS.fine.replace('{fine}', String(PAY.fine))}</p>
    </Slip>
  );
}

/** Printed when the clerk challenges: the case waits for the court at the end of the shift. */
export function FilingSlip({ name, caseNo }: { name: string; caseNo: string }) {
  return (
    <Slip kind="filing" title="Case filed" number={`Case no. ${caseNo}`}>
      <p>
        <strong>The Registry v. {name}</strong>
      </p>
      <p>To be heard by the Humanity Court at the end of the shift. Deposit held: {PAY.deposit} PNK.</p>
    </Slip>
  );
}

function Slip({ kind, variant, title, number, children }: { kind: string; variant?: string; title: string; number: string; children: ReactNode }) {
  return (
    <article className={`slip slip-${kind}${variant ? ` slip-${variant}` : ''}`} data-testid={kind} data-variant={variant}>
      <header>
        <strong>{title}</strong>
        <span>{number}</span>
      </header>
      {children}
    </article>
  );
}

/** Names the broken rule and shows the evidence, with the words that do not match marked. */
export function Breach({ lead, violation }: { lead: string; violation: Violation }) {
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
          <Words marks={violation.expected} bold={rule.bold} />
        </dd>
        <dt>Heard</dt>
        <dd>{violation.heard.length > 0 ? <Words marks={violation.heard} /> : <em>(no speech)</em>}</dd>
      </dl>
    </>
  );
}
