import type { ReactNode } from 'react';
import { RULEBOOK } from '../content/rulebook';
import { NIGHT } from '../content/night';
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

/**
 * Printed the moment a fake is registered. The day's first is a warning; the rest are fines. On the night
 * shift (`night`, the citation's number) there is no pay to fine, only a count to three.
 */
export function CitationSlip({ decided, caseNo, video, night }: { decided: Decided; caseNo: string; /** The video on the papers stamped: a citation for a fault in it reprints it. */ video: Video; night?: number }) {
  const warning = decided.citation === 'warning' && night === undefined;
  const title = night !== undefined ? NIGHT.citation.replace('{n}', String(night)) : warning ? 'Citation · Warning' : 'Citation';
  return (
    <Slip kind="citation" variant={warning ? 'warning' : 'fine'} title={title} number={`No. ${caseNo}`}>
      <p>Issued to: Clerk, Registry Window 3</p>
      {decided.outcome.violations.map((v) => (
        <Breach key={v.rule} lead="Offence: registered an applicant who broke" violation={v} video={video} />
      ))}
      {decided.memo && <p className="memo">{decided.memo}</p>}
      <p className="terms">{night !== undefined ? NIGHT.terms : warning ? CITATION_TERMS.warning : CITATION_TERMS.fine.replace('{fine}', String(PAY.fine))}</p>
    </Slip>
  );
}

/**
 * The night shift's challenge, decided at once: a fake is refused, with the first rule it broke and the
 * evidence; a human challenged is a citation.
 */
export function NightChallengeSlip({ decided, caseNo, name, night, video }: { decided: Decided; caseNo: string; name: string; night: number; video: Video }) {
  const [broke] = decided.outcome.violations;
  if (!broke) {
    return (
      <Slip kind="citation" variant="fine" title={NIGHT.citation.replace('{n}', String(night))} number={`No. ${caseNo}`}>
        <p>Issued to: Clerk, Registry Window 3</p>
        <p>
          {NIGHT.wronged} <strong>{name}</strong>.
        </p>
        <p className="terms">{NIGHT.terms}</p>
      </Slip>
    );
  }
  return (
    <Slip kind="filing" title={NIGHT.refused} number={`Case no. ${caseNo}`}>
      <p>
        <strong>{NIGHT.caseTitle.replace('{name}', name)}</strong>
      </p>
      <Breach lead={NIGHT.refusedLead} violation={broke} video={video} />
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
 * Given the `video`, a fault in the video itself reprints it.
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
          {filmed(v) && video && <CitationFilm video={video} named={v.rule === 'face' && (v.problem === 'machine' || v.problem === 'changes') ? v.frame : null} />}
        </>
      )}
    </>
  );
}

/** A fault that is in the video itself: a light, a face that turns into another, a picture held up, a generator's mark. */
const filmed = (v: Violation) =>
  (v.rule === 'face' && (v.problem === 'machine' || v.problem === 'changes')) || (v.rule === 'living' && (v.problem === 'picture' || v.problem === 'generated'));

/**
 * A citation for a fault in the video reprints it as the desk showed it, the frame its evidence names outlined: the papers
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
