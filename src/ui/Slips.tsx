import type { ReactNode } from 'react';
import { RULEBOOK } from '../content/rulebook';
import { CITATION_TERMS } from '../content/verdicts';
import { PAY } from '../economy/economy';
import { shortAddress } from '../rules/sign';
import type { Violation } from '../rules/types';
import { Words } from './Documents';
import { evidenceLine } from './evidence';
import type { Decided } from './week';

/** One line from a pool: the same number always prints the same line. */
export const pick = <T,>(pool: readonly T[], n: number) => pool[Math.abs(n) % pool.length];

/** Printed the moment a fake is registered. The day's first is a warning; the rest are fines. */
export function CitationSlip({ decided, caseNo }: { decided: Decided; caseNo: string }) {
  const warning = decided.citation === 'warning';
  return (
    <Slip kind="citation" variant={warning ? 'warning' : 'fine'} title={warning ? 'Citation · Warning' : 'Citation'} number={`No. ${caseNo}`}>
      <p>Issued to: Clerk, Registry Window 3</p>
      {decided.outcome.violations.map((v) => (
        <Breach key={v.rule} lead="Offence: registered an applicant who broke" violation={v} />
      ))}
      {decided.memo && <p className="memo">{decided.memo}</p>}
      <p className="terms">{warning ? CITATION_TERMS.warning : CITATION_TERMS.fine.replace('{fine}', String(PAY.fine))}</p>
    </Slip>
  );
}

/** Printed when the clerk challenges: the case waits for the court at the end of the shift, which finds what is wrong. */
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

/** Names the broken rule and shows the evidence: the two things that disagree, with the difference marked. */
export function Breach({ lead, violation: v }: { lead: string; violation: Violation }) {
  const rule = RULEBOOK[v.rule];
  return (
    <>
      <p>
        {lead}{' '}
        <strong className="rule-name">
          Rule {rule.number}: {rule.title}
        </strong>
        .
      </p>
      {v.rule === 'phrase' ? (
        <dl className="evidence">
          <dt>Required</dt>
          <dd>
            <Words marks={v.expected} bold={rule.bold} />
          </dd>
          <dt>Heard</dt>
          <dd>{v.heard.length > 0 ? <Words marks={v.heard} /> : <em>(no speech)</em>}</dd>
        </dl>
      ) : v.rule === 'sign' && v.sign?.kind === 'address' && v.sign.text.length === v.wallet.length ? (
        <dl className="evidence">
          <dt>Form</dt>
          <dd>{shortAddress(v.wallet)}</dd>
          <dt>Sign</dt>
          <dd>
            <Marked text={shortAddress(v.sign.text)} against={shortAddress(v.wallet)} />
          </dd>
        </dl>
      ) : (
        <p className="evidence-line">
          <mark>{capitalise(evidenceLine(v))}</mark>
        </p>
      )}
    </>
  );
}

/** The text with every character that differs from `against` marked. */
function Marked({ text, against }: { text: string; against: string }) {
  return (
    <>
      {[...text].map((ch, i) => (ch.toUpperCase() === against[i]?.toUpperCase() ? ch : <mark key={i}>{ch}</mark>))}
    </>
  );
}

const capitalise = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
