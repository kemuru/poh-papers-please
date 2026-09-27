import { Fragment, type ReactNode } from 'react';
import { RULEBOOK } from '../content/rulebook';
import type { Pose } from '../gen/portrait';
import type { Decision } from '../rules/judge';
import type { Applicant, Mark, Rulebook, Video } from '../rules/types';
import { PixelPortrait } from './PixelPortrait';

const PHOTO_BG = '#cfd8dc';
const VIDEO_BG = '#8f9b9e';

/** Years before year 1 are printed the way the Ministry's records office prints them. */
const formatYear = (year: number) => (year < 1 ? `${-year} BC` : String(year));

export function ProfileCard({ applicant, caseNo, stamp }: { applicant: Applicant; caseNo: string; stamp?: Decision }) {
  return (
    <div className={stamp ? 'doc card stamped' : 'doc card'}>
      <h2 className="doc-title">
        Form 1 · Application for registration as a human <span className="doc-no">{caseNo}</span>
      </h2>
      <div className="card-body">
        <div className="photo">
          <PixelPortrait portrait={applicant.photo} scale={3} background={PHOTO_BG} title={`Photo of ${applicant.name}`} />
        </div>
        <dl className="fields">
          <dt>Name</dt>
          <dd data-testid="name">{applicant.name}</dd>
          <dt>Address</dt>
          <dd>{applicant.address}</dd>
          <dt>Year of birth</dt>
          <dd data-testid="birth-year">{formatYear(applicant.birthYear)}</dd>
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

export function VideoStrip({ video }: { video: Video }) {
  const spoke = video.transcript.trim() !== '';
  // A still, then the applicant speaking, then blinking: each only if it happened.
  const frames: { time: string; pose: Partial<Pose> }[] = [
    { time: '00:01', pose: {} },
    { time: '00:03', pose: { mouth: spoke ? 'open' : 'closed' } },
    { time: '00:05', pose: { eyes: video.blinked ? 'closed' : 'open' } },
  ];
  return (
    <div className="doc video">
      <h2 className="doc-title">Video submission · printout</h2>
      <div className="film">
        {frames.map(({ time, pose }, i) => (
          <figure key={time} className="frame" data-testid={`frame-${i + 1}`}>
            <PixelPortrait portrait={video.face} {...pose} scale={2} background={VIDEO_BG} title={`Frame ${i + 1}`} />
            <figcaption>{time}</figcaption>
          </figure>
        ))}
      </div>
      <p className="label">Transcript</p>
      <p className="transcript" data-testid="transcript">
        {spoke ? video.transcript : <em className="no-speech">(no speech detected)</em>}
      </p>
      <p className="blink">
        <span className="label">Blink detected</span> {video.blinked ? 'Yes' : 'No'}
      </p>
    </div>
  );
}

export function RulebookCard({ rulebook, day }: { rulebook: Rulebook; day: number }) {
  return (
    <div className="doc rulebook">
      <h2 className="doc-title">Rulebook · Day {day}</h2>
      {rulebook.map((id) => {
        const rule = RULEBOOK[id];
        return (
          <article key={id} className="rule">
            <h3>
              Rule {rule.number}: {rule.title}
            </h3>
            <p>{rule.text}</p>
            <p className="phrase">
              {rule.bold
                ? rule.quote.split(' ').map((word, i) => (
                    <Fragment key={i}>
                      {i > 0 && ' '}
                      {rule.bold![i] ? <b>{word}</b> : <span className="small-word">{word}</span>}
                    </Fragment>
                  ))
                : rule.quote}
            </p>
            <p className="rule-note">{rule.note}</p>
          </article>
        );
      })}
    </div>
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
