import { Fragment, type ReactNode } from 'react';
import { RULEBOOK } from '../content/rulebook';
import type { Pose } from '../gen/portrait';
import { frameFaces } from '../rules/face';
import { RULE_DAYS, type Decision } from '../rules/judge';
import { shortAddress } from '../rules/sign';
import type { Applicant, Mark, RuleId, Rulebook, Video } from '../rules/types';
import { formatYear } from './evidence';
import { Inspectable } from './Inspect';
import { PixelPortrait } from './PixelPortrait';

const PHOTO_BG = '#cfd8dc';
const VIDEO_BG = '#8f9b9e';

// A click leaves the focus where it was, so Space still pulls the lever.
const keepFocus = (e: { preventDefault: () => void }) => e.preventDefault();

/** A lookup beside the thing it looks up: one click, or its key, and the registry answers. */
function LookupChip({ label, keyName, onClick }: { label: string; keyName: string; onClick: () => void }) {
  return (
    <button type="button" className="lookup-chip" onClick={onClick} onMouseDown={keepFocus} title={`${label} (${keyName})`}>
      {label} <kbd>{keyName}</kbd>
    </button>
  );
}

export function ProfileCard({
  applicant,
  caseNo,
  stamp,
  onLookUpVoucher,
}: {
  applicant: Applicant;
  caseNo: string;
  stamp?: Decision;
  /** From day 4, while the applicant is at the window: look the voucher up in the registry. */
  onLookUpVoucher?: () => void;
}) {
  return (
    <div className={stamp ? 'doc card stamped' : 'doc card'}>
      <h2 className="doc-title">
        Form 1 · Application for registration as a human <span className="doc-no">{caseNo}</span>
      </h2>
      <div className="card-body">
        <Inspectable item={{ kind: 'photo' }} label="the photo" className="photo-holder">
          <span className={applicant.mirrored ? 'photo mirrored' : 'photo'}>
            <PixelPortrait portrait={applicant.photo} scale={3} background={PHOTO_BG} title={`Photo of ${applicant.name}`} />
          </span>
        </Inspectable>
        <dl className="fields">
          <dt>Name</dt>
          <dd>
            <Inspectable item={{ kind: 'name' }} label="the name">
              <span data-testid="name">{applicant.name}</span>
            </Inspectable>
          </dd>
          <dt>Address</dt>
          <dd>{applicant.address}</dd>
          <dt>Year of birth</dt>
          <dd>
            <Inspectable item={{ kind: 'birth-year' }} label="the year of birth">
              <span data-testid="birth-year">{formatYear(applicant.birthYear)}</span>
            </Inspectable>
          </dd>
          {applicant.wallet !== undefined && (
            <>
              <dt>Wallet</dt>
              <dd>
                <Inspectable item={{ kind: 'wallet' }} label="the wallet">
                  <span data-testid="wallet" title={applicant.wallet}>
                    {shortAddress(applicant.wallet)}
                  </span>
                </Inspectable>
              </dd>
            </>
          )}
          {applicant.voucher !== undefined && (
            <>
              <dt>Vouched for by</dt>
              <dd>
                <Inspectable item={{ kind: 'voucher' }} label="the voucher">
                  <span data-testid="voucher">{applicant.voucher ?? '—'}</span>
                </Inspectable>
                {applicant.voucher && onLookUpVoucher && <LookupChip label="Look up" keyName="V" onClick={onLookUpVoucher} />}
              </dd>
            </>
          )}
        </dl>
      </div>
      {stamp && (
        <div className={`stamp stamp-${stamp}`} data-testid="stamp">
          {stamp === 'accept' ? 'Registered' : 'Challenged'}
        </div>
      )}
    </div>
  );
}

export function VideoStrip({ video, onSearchFace }: { video: Video; /** From day 4: search the registry for the face in the video. */ onSearchFace?: () => void }) {
  const spoke = video.transcript.trim() !== '';
  const faces = frameFaces(video);
  const board = !video.sign ? undefined : video.sign.kind === 'qr' ? ('qr' as const) : video.sign.phone ? ('phone' as const) : ('writing' as const);
  // A still, then the applicant speaking, then blinking: each only if it happened. A printed face does neither.
  const frames: { time: string; pose: Pose }[] = [
    { time: '00:01', pose: { eyes: video.nervous ? 'closed' : 'open', mouth: 'closed' } },
    { time: '00:03', pose: { eyes: 'open', mouth: spoke && !video.still ? 'open' : 'closed' } },
    { time: '00:05', pose: { eyes: video.blinked && !video.still ? 'closed' : 'open', mouth: 'closed' } },
  ];
  return (
    <div className="doc video">
      <div className="doc-head">
        <h2 className="doc-title">Video submission · printout</h2>
        {onSearchFace && <LookupChip label="Search this face" keyName="F" onClick={onSearchFace} />}
      </div>
      <div className="video-row">
        <div className="film">
          {frames.map(({ time, pose }, i) => (
            <Inspectable key={time} item={{ kind: 'frame', frame: i + 1 }} label={`frame ${i + 1}`}>
              <figure className={video.with ? 'frame pair' : 'frame'} data-testid={`frame-${i + 1}`}>
                <span className="frame-picture">
                  <PixelPortrait
                    portrait={{
                      ...faces[i],
                      board,
                      ...(video.generated ? { mark: true as const } : {}),
                      ...(video.panel?.frame === i + 1 ? { panel: video.panel.where } : {}),
                    }}
                    {...pose}
                    scale={2}
                    background={VIDEO_BG}
                    title={`Frame ${i + 1}`}
                  />
                  {video.with && <PixelPortrait portrait={video.with} {...pose} scale={2} background={VIDEO_BG} title={`Frame ${i + 1}, beside them`} />}
                </span>
                <figcaption>{time}</figcaption>
              </figure>
            </Inspectable>
          ))}
        </div>
        {video.sign !== undefined && (
          <Inspectable item={{ kind: 'sign' }} label="the sign" className="sign-holder">
            <div className="sign-still" data-testid="sign">
              <span className="label">{video.sign?.kind === 'address' && video.sign.phone ? 'Phone screen, enlarged' : 'Sign, enlarged'}</span>
              <SignFace sign={video.sign} />
            </div>
          </Inspectable>
        )}
      </div>
      <p className="label">Transcript</p>
      <Inspectable item={{ kind: 'transcript' }} label="the transcript" className="transcript-holder">
        <p className="transcript" data-testid="transcript">
          {spoke ? video.transcript : <em className="no-speech">(no speech detected)</em>}
        </p>
      </Inspectable>
    </div>
  );
}

/** What is on the sign, as big as the printout allows. */
function SignFace({ sign }: { sign: Video['sign'] }) {
  if (!sign) return <span className="sign-none">(nothing held up)</span>;
  if (sign.kind === 'qr') return <span className="qr" role="img" aria-label="A square of dots" />;
  // Handwriting, in groups of fourteen so the start and the end can be read against the form.
  const lines = sign.text.match(/.{1,14}/g) ?? [];
  return (
    <span className={sign.phone ? 'sign-text phone' : 'sign-text'} aria-label={sign.text}>
      {lines.map((line, i) => (
        <span key={i}>{line}</span>
      ))}
    </span>
  );
}

/** The rulebook: a page per rule in force, today's open. */
export function RulebookCard({ rulebook, day, page, onPage }: { rulebook: Rulebook; day: number; page: RuleId; onPage: (rule: RuleId) => void }) {
  return (
    <div className="doc rulebook">
      <h2 className="doc-title">
        Rulebook · Day {day}
      </h2>
      <div className="rule-tabs" role="tablist" aria-label="Rulebook pages">
        {rulebook.map((id) => (
          <button
            key={id}
            role="tab"
            aria-selected={id === page}
            className={RULE_DAYS[id] === day ? 'rule-tab new' : 'rule-tab'}
            title={`${RULEBOOK[id].title} (key ${RULEBOOK[id].number})`}
            onClick={() => onPage(id)}
            onMouseDown={(e) => e.preventDefault()}
          >
            {RULEBOOK[id].number}
          </button>
        ))}
      </div>
      {/* Every page is in the book; only the open one shows. */}
      {rulebook.map((id) => (
        <RulePage key={id} id={id} open={id === page} isNew={RULE_DAYS[id] === day} />
      ))}
    </div>
  );
}

function RulePage({ id, open, isNew }: { id: RuleId; open: boolean; isNew: boolean }) {
  const rule = RULEBOOK[id];
  return (
    <article className="rule" hidden={!open} role="tabpanel">
      <Inspectable item={{ kind: 'rule', rule: id }} label={`Rule ${rule.number}`} className="rule-holder">
        <h3>
          Rule {rule.number}: {rule.title}
          {isNew && <span className="rule-new">New</span>}
        </h3>
        <p>{rule.text}</p>
        {rule.quote && (
          <p className="phrase">
            {rule.quote.split(' ').map((word, i) => (
              <Fragment key={i}>
                {i > 0 && ' '}
                {rule.bold?.[i] ? <b>{word}</b> : <span className="small-word">{word}</span>}
              </Fragment>
            ))}
          </p>
        )}
        {rule.checks && (
          <ul className="rule-checks">
            {rule.checks.map((check) => (
              <li key={check}>{check}</li>
            ))}
          </ul>
        )}
        <p className="rule-note">{rule.note}</p>
      </Inspectable>
    </article>
  );
}

/** A text word by word, with each run of words that do not match marked, and small words (if given) dimmed. */
export function Words({ marks, bold }: { marks: Mark[]; bold?: readonly boolean[] }) {
  const out: ReactNode[] = [];
  let run: string[] = [];
  const flush = () => {
    if (run.length > 0) out.push(<mark>{run.join(' ')}</mark>);
    run = [];
  };
  marks.forEach(({ word, ok }, i) => {
    if (!ok) return void run.push(word);
    flush();
    out.push(bold && !bold[i] ? <span className="small-word">{word}</span> : word);
  });
  flush();
  return out.map((node, i) => (
    <Fragment key={i}>
      {i > 0 && ' '}
      {node}
    </Fragment>
  ));
}
