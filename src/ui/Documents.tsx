import { Fragment } from 'react';
import { RULEBOOK } from '../content/rulebook';
import type { Pose } from '../gen/portrait';
import type { Decision } from '../rules/judge';
import type { Applicant, Mark, Rulebook, Video } from '../rules/types';
import { PixelPortrait } from './PixelPortrait';

const PHOTO_BG = '#cfd8dc';
const VIDEO_BG = '#8f9b9e';

export function ProfileCard({ applicant, caseNo, stamp }: { applicant: Applicant; caseNo: string; stamp?: Decision }) {
  return (
    <section className={stamp ? 'doc card stamped' : 'doc card'} aria-label="Profile card">
      <h2 className="doc-title">Form 1 · Application for registration as a human</h2>
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
          <dd>{applicant.birthYear}</dd>
          <dt>Application no.</dt>
          <dd>{caseNo}</dd>
        </dl>
      </div>
      <p className="remarks">
        <span className="label">Remarks</span> <span className="hand">{applicant.remark}</span>
      </p>
      {stamp && (
        <div className={`stamp stamp-${stamp}`} data-testid="stamp">
          {stamp === 'accept' ? 'Registered' : 'Challenged'}
        </div>
      )}
    </section>
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
    <section className="doc video" aria-label="Video strip">
      <h2 className="doc-title">Video submission</h2>
      <div className="film">
        {frames.map(({ time, pose }, i) => (
          <figure key={time} className="frame" data-testid={`frame-${i + 1}`}>
            <PixelPortrait portrait={video.face} {...pose} scale={3} background={VIDEO_BG} title={`Frame ${i + 1}`} />
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
    </section>
  );
}

export function RulebookCard({ rulebook, day }: { rulebook: Rulebook; day: number }) {
  return (
    <section className="doc rulebook" aria-label="Rulebook">
      <h2 className="doc-title">Rulebook · Day {day}</h2>
      {rulebook.map((id) => {
        const rule = RULEBOOK[id];
        return (
          <article key={id} className="rule">
            <h3>
              Rule {rule.number}: {rule.title}
            </h3>
            <p>{rule.text}</p>
            <p className="phrase">{rule.quote}</p>
            <p className="rule-note">{rule.note}</p>
          </article>
        );
      })}
    </section>
  );
}

/** A text word by word, with each run of words that do not match marked. */
export function Words({ marks }: { marks: Mark[] }) {
  const runs: { ok: boolean; text: string }[] = [];
  for (const { word, ok } of marks) {
    const last = runs[runs.length - 1];
    if (last?.ok === ok) last.text += ` ${word}`;
    else runs.push({ ok, text: word });
  }
  return runs.map((run, i) => (
    <Fragment key={i}>
      {i > 0 && ' '}
      {run.ok ? run.text : <mark>{run.text}</mark>}
    </Fragment>
  ));
}
