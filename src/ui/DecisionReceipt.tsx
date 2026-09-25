import { useEffect, useRef } from 'react';
import { DAY_ONE_RULEBOOK, DESK_COPY as copy, RULE_COPY } from '../content/dayOne';
import type { Outcome } from '../game';
import type { Applicant } from '../model';

export function DecisionReceipt({ applicant, outcome, onReplay }: { applicant: Applicant; outcome: Outcome; onReplay: () => void }) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus(); }, []);

  return (
    <section className="paper receipt" aria-labelledby="receipt-title" data-testid="decision-receipt">
      <div className="document-heading"><span>{copy.receipt}</span><span className="document-number">{applicant.id}</span></div>
      <div className={`result-stamp ${outcome.kind === 'filed' ? 'filed-stamp' : ''}`} data-testid="result-stamp">
        {outcome.kind === 'filed' ? copy.filedStamp : copy.acceptedStamp}
      </div>
      <p className="receipt-applicant">{applicant.name}</p>
      <h2 id="receipt-title" ref={heading} tabIndex={-1}>
        {outcome.kind === 'filed' ? copy.filedTitle : outcome.kind === 'citation' ? copy.citationTitle : copy.acceptedTitle}
      </h2>
      <p className="receipt-body">{outcome.kind === 'filed' ? copy.filedBody : outcome.kind === 'citation' ? copy.citationBody : copy.acceptedBody}</p>

      {outcome.kind === 'citation' && (
        <div className="citation-slip" data-testid="citation" role="status">
          <p className="eyebrow">{copy.citationLabel}</p>
          {outcome.violations.map((violation) => (
            <div key={violation}><h3>{RULE_COPY[violation].title}</h3><p>{RULE_COPY[violation].explanation}</p></div>
          ))}
          <dl className="phrase-comparison">
            <div><dt>{copy.recordedPhrase}</dt><dd>{applicant.video.transcript || copy.silence}</dd></div>
            <div><dt>{copy.referencePhrase}</dt><dd>{DAY_ONE_RULEBOOK.requiredPhrase}</dd></div>
          </dl>
          <p className="warning-notice">{copy.warning}</p>
        </div>
      )}
      {outcome.kind === 'filed' && <p className="scope-note">{copy.filedScope}</p>}
      <div className="receipt-end"><span>{copy.closed}</span><span aria-hidden="true">• • •</span></div>
      <button className="replay-button" onClick={onReplay}>{copy.replay}</button>
    </section>
  );
}
