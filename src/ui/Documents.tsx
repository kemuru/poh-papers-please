import { Fragment, useMemo, type ReactNode } from 'react';
import { figureLamp, SPECIMEN } from '../content/portraits';
import { RULEBOOK, type Figure } from '../content/rulebook';
import { frameFaces, framePoses } from '../rules/face';
import { RULE_DAYS, type Decision } from '../rules/judge';
import { shortAddress } from '../rules/sign';
import type { Applicant, Mark, RuleId, Rulebook, Video } from '../rules/types';
import { DeskSprite, MARK_NOT, MARK_OK } from './DeskArt';
import { formatYear } from './evidence';
import { Inspectable } from './Inspect';
import { PixelPortrait } from './PixelPortrait';
import { handOf, impression, inkPath } from './stampImpression';

const PHOTO_BG = '#cfd8dc';
const VIDEO_BG = '#8f9b9e';
export const FRAME_TIMES = ['00:01', '00:03', '00:05'];

// A click leaves the focus where it was, so Space still pulls the lever.
const keepFocus = (e: { preventDefault: () => void }) => e.preventDefault();

/** A lookup beside the thing it looks up, a small steel key: one click, or its key, and the registry answers. */
function LookupChip({ label, keyName, onClick }: { label: string; keyName: string; onClick: () => void }) {
  return (
    <button type="button" className="steel-key lookup-chip" onClick={onClick} onMouseDown={keepFocus} title={`${label} (${keyName})`}>
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
      {/* The form's printed title, its number in the corner. */}
      <h2 className="doc-title">
        Application for registration as a human <span className="doc-no">Form 1</span>
      </h2>
      <div className="card-body">
        <div className="photo-column">
          <Inspectable item={{ kind: 'photo' }} label="the photo" className="photo-holder">
            <span className="photo">
              <PhotoPicture applicant={applicant} scale={2} title={`Photo of ${applicant.name}`} />
            </span>
          </Inspectable>
          {/* The case number, typed on by the desk. */}
          <span className="case-no">{caseNo}</span>
        </div>
        <dl className="fields">
          <dt>Name</dt>
          <dd>
            <Inspectable item={{ kind: 'name' }} label="the name">
              <span data-testid="name">{applicant.name}</span>
            </Inspectable>
          </dd>
          <dt>Address</dt>
          <dd>{applicant.address}</dd>
          <dt>Born</dt>
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
              <dt>Voucher</dt>
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
      {stamp && <StampImpression decision={stamp} caseNo={caseNo} />}
    </div>
  );
}

/** The stamp's impression on the form, set down by hand: turned and off its place as this case's stamp came down. */
function StampImpression({ decision, caseNo }: { decision: Decision; caseNo: string }) {
  const word = decision === 'accept' ? 'Registered' : 'Challenged';
  const hand = handOf(caseNo);
  const ink = useMemo(() => impression(word, hand.degrees, hand.wear), [word, hand.degrees, hand.wear]);
  const path = useMemo(() => inkPath(ink), [ink]);
  return (
    <div className={`stamp stamp-${decision}`} data-testid="stamp" style={{ translate: `${hand.dx}px ${hand.dy}px` }}>
      <span className="sr-only">{word}</span>
      <svg aria-hidden="true" width={ink.width * 2} height={ink.height * 2} viewBox={`0 0 ${ink.width} ${ink.height}`} shapeRendering="crispEdges">
        <path d={path} fill="currentColor" />
      </svg>
    </div>
  );
}

const boardOf = (video: Video) => (!video.sign ? undefined : video.sign.kind === 'qr' ? ('qr' as const) : video.sign.phone ? ('phone' as const) : ('writing' as const));

/** The face in one frame of the video, and how it is posed: what FramePicture draws, and the Gazette reprints. */
export function frameShot(video: Video, frame: number) {
  const pose = framePoses(video)[frame - 1];
  const portrait = { ...frameFaces(video)[frame - 1], board: boardOf(video), ...(video.generated ? { mark: true as const } : {}), ...(video.lamp ? { lamp: video.lamp } : {}) };
  return { portrait, pose };
}

/**
 * One frame of the video as the camera took it: posed as Rules 2 and 6 read it, a unit's lamp drawn where its eyes
 * are shut (the twin never has one). `title` names it on the desk; the citation's reprint is not named. `scale` is
 * design pixels to a portrait pixel for a face alone in the frame; two in one frame share its width.
 */
export function FramePicture({ video, frame, title, scale = 2 }: { video: Video; frame: number; title?: string; scale?: number }) {
  const { portrait, pose } = frameShot(video, frame);
  const each = video.with ? scale / 2 : scale;
  return (
    <span className="frame-picture">
      <PixelPortrait portrait={portrait} {...pose} scale={each} background={VIDEO_BG} title={title} />
      {video.with && <PixelPortrait portrait={video.with} {...pose} scale={each} background={VIDEO_BG} title={title && `${title}, beside them`} />}
    </span>
  );
}

/** The form's photo as it is printed on the form: a selfie the wrong way round. */
export function PhotoPicture({ applicant, scale, title }: { applicant: Applicant; scale: number; title?: string }) {
  return (
    <span className={applicant.mirrored ? 'photo-picture mirrored' : 'photo-picture'}>
      <PixelPortrait portrait={applicant.photo} scale={scale} background={PHOTO_BG} title={title} />
    </span>
  );
}

export function VideoStrip({ video, onSearchFace }: { video: Video; /** From day 4: search the registry for the face in the video. */ onSearchFace?: () => void }) {
  const spoke = video.transcript.trim() !== '';
  return (
    <div className="doc video">
      {/* The printer's own header line. */}
      <div className="doc-head">
        <h2 className="doc-title">Video submission</h2>
        {onSearchFace && <LookupChip label="Search this face" keyName="F" onClick={onSearchFace} />}
      </div>
      <div className="video-row">
        <div className="film">
          {FRAME_TIMES.map((time, i) => (
            <Inspectable key={time} item={{ kind: 'frame', frame: i + 1 }} label={`frame ${i + 1}`}>
              <figure className={video.with ? 'frame pair' : 'frame'} data-testid={`frame-${i + 1}`}>
                <FramePicture video={video} frame={i + 1} title={`Frame ${i + 1}`} />
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
      {/* Printed on the box's top edge, as a form labels a box. */}
      <p className="label transcript-label">Transcript</p>
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
  // Handwriting, in groups of eleven so the start and the end can be read against the form, and the
  // enlargement, in 20px lettering, still fits beside the frames on the narrowest desk.
  const lines = sign.text.match(/.{1,11}/g) ?? [];
  return (
    <span className={sign.phone ? 'sign-text phone' : 'sign-text'} aria-label={sign.text}>
      {lines.map((line, i) => (
        <span key={i}>{line}</span>
      ))}
    </span>
  );
}

/** The rulebook: a binder with a page per rule in force, today's open, and a numbered tab for each page. */
export function RulebookCard({ rulebook, day, page, onPage }: { rulebook: Rulebook; day: number; page: RuleId; onPage: (rule: RuleId) => void }) {
  return (
    <div className="doc rulebook">
      <h2 className="sr-only">Rulebook</h2>
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
        <RulePage key={id} id={id} open={id === page} isNew={RULE_DAYS[id] === day} day={day} />
      ))}
    </div>
  );
}

function RulePage({ id, open, isNew, day }: { id: RuleId; open: boolean; isNew: boolean; day: number }) {
  const rule = RULEBOOK[id];
  return (
    <article className="rule" hidden={!open} role="tabpanel">
      <Inspectable item={{ kind: 'rule', rule: id }} label={`Rule ${rule.number}`} className="rule-holder">
        <h3>
          <span className="rule-no">Rule {rule.number}:</span> {rule.title}
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
            {rule.checks.map((check, i) => (
              <li key={check}>
                {check}
                {i === rule.figure?.under && <RuleFigure figure={rule.figure} day={day} />}
              </li>
            ))}
          </ul>
        )}
        <p className="rule-note">{rule.note}</p>
        <p className="rule-cause" data-testid="rule-cause">
          {rule.cause}
        </p>
      </Inspectable>
      {/* Today's page is flagged: a red page flag stuck on its top corner, clear of the heading. */}
      {isNew && <span className="rule-flag">New</span>}
    </article>
  );
}

/** Where Fig. 2's stills are cut from the 40×48 portrait: crown to mouth, cheek to cheek, and every pixel a lamp can touch (faceFigure.test.tsx). */
export const FIGURE_CROP = { x: 9, y: 7, width: 22, height: 22 };

/** Fig. 2: the specimen face as a video frame shows it, eyes shut, without and with a light as big as today's unit's. */
function RuleFigure({ figure, day }: { figure: Figure; day: number }) {
  const lit = useMemo(() => ({ ...SPECIMEN, lamp: figureLamp(day) }), [day]);
  const plates = [
    { mark: 'ok', caption: figure.ok, portrait: SPECIMEN },
    { mark: 'not', caption: figure.not, portrait: lit },
  ] as const;
  return (
    <figure className="rule-figure" role="img" aria-label={figure.label}>
      {plates.map(({ mark, caption, portrait }) => (
        <span key={mark} className="rule-plate">
          <span className="rule-still">
            <PixelPortrait portrait={portrait} eyes="closed" scale={2} background={VIDEO_BG} crop={FIGURE_CROP} />
            <RuleMark mark={mark} />
          </span>
          <span className="rule-caption">
            <b>{caption[0]}</b>
            {caption.slice(1).map((line) => (
              <span key={line}>{line}</span>
            ))}
          </span>
        </span>
      ))}
    </figure>
  );
}

/** ✓ or ✗, drawn in pixels, not typed: ink on paper for allowed, paper on ink for not. The caption says it in words too. */
function RuleMark({ mark }: { mark: 'ok' | 'not' }) {
  return <DeskSprite sprite={mark === 'ok' ? MARK_OK : MARK_NOT} className={`rule-mark rule-mark-${mark}`} />;
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
