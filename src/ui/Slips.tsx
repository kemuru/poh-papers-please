import type { ReactNode } from 'react';
import { RULEBOOK } from '../content/rulebook';
import { CITATION_FILM, CITATION_TERMS } from '../content/verdicts';
import { PAY } from '../economy/economy';
import { shortAddress } from '../rules/sign';
import type { Video, Violation } from '../rules/types';
import { FRAME_TIMES, FramePicture, Words } from './Documents';
import type { Evidence } from './court';
import { evidenceLine, evidenceWords } from './evidence';
import type { Decided } from './week';

/** One line from a pool: the same number always prints the same line. */
export const pick = <T,>(pool: readonly T[], n: number) => pool[Math.abs(n) % pool.length];

/** Printed the moment a fake is registered. The day's first is a warning; the rest are fines. */
export function CitationSlip({ decided, caseNo, video }: { decided: Decided; caseNo: string; /** The video on the papers stamped: a Rule 0 citation reprints it. */ video: Video }) {
  const warning = decided.citation === 'warning';
  return (
    <Slip kind="citation" variant={warning ? 'warning' : 'fine'} title={warning ? 'Citation · Warning' : 'Citation'} number={`No. ${caseNo}`}>
      <p>Issued to: Clerk, Registry Window 3</p>
      {decided.outcome.violations.map((v) => (
        <Breach key={v.rule} lead="Offence: registered an applicant who broke" violation={v} video={video} />
      ))}
      {decided.memo && <p className="memo">{decided.memo}</p>}
      <p className="terms">{warning ? CITATION_TERMS.warning : CITATION_TERMS.fine.replace('{fine}', String(PAY.fine))}</p>
    </Slip>
  );
}

/**
 * Printed when the clerk challenges: the case waits for the court at the end of the shift, with what
 * Inspect found, or with nothing, and the jury looks for itself. It says nothing about who is right.
 */
export function FilingSlip({ name, caseNo, evidence }: { name: string; caseNo: string; evidence: Evidence | null }) {
  return (
    <Slip kind="filing" title="Case filed" number={`Case no. ${caseNo}`}>
      <p>
        <strong>The Registry v. {name}</strong>
      </p>
      <p data-testid="filing-evidence">{evidence ? `Evidence: ${evidenceWords(evidence)}` : 'No evidence filed. The jury will look for itself.'}</p>
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

/**
 * Names the broken rule and shows the evidence: the two things that disagree, with the difference marked.
 * Given the `video`, a Rule 0 breach reprints it.
 */
export function Breach({ lead, violation: v, video }: { lead: string; violation: Violation; video?: Video }) {
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
        <>
          <p className="evidence-line">
            <mark>{capitalise(evidenceLine(v))}</mark>
          </p>
          {v.rule === 'human' && video && <CitationFilm video={video} named={v.problem === 'machine' || v.problem === 'changes' ? v.frame : null} />}
        </>
      )}
    </>
  );
}

/**
 * A Rule 0 citation reprints the video as the desk showed it, the frame its evidence names outlined: the papers
 * have gone back through the slot, so the evidence comes back on the slip. Nothing on it can be pointed at: no
 * Inspectable, no frame test ids, no frame names (the desk's papers are still in the DOM while they leave).
 */
function CitationFilm({ video, named }: { video: Video; named: number | null }) {
  return (
    <figure className="citation-film" role="img" aria-label={named ? CITATION_FILM.labelNamed.replace('{n}', String(named)) : CITATION_FILM.label}>
      <div className="film">
        {FRAME_TIMES.map((time, i) => (
          <figure key={time} className={`frame${video.with ? ' pair' : ''}${named === i + 1 ? ' named' : ''}`}>
            <FramePicture video={video} frame={i + 1} />
            <figcaption>{named === i + 1 ? CITATION_FILM.named.replace('{n}', String(i + 1)).replace('{time}', time) : time}</figcaption>
          </figure>
        ))}
      </div>
    </figure>
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
