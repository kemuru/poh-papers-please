import { DESK_COPY as copy } from '../content/dayOne';
import type { Decision } from '../game';
import type { Applicant } from '../model';
import { PixelPortrait } from './PixelPortrait';

export function ApplicantDesk({ applicant, onDecision }: { applicant: Applicant; onDecision: (decision: Decision) => void }) {
  return (
    <div className="application-stack">
      <section className="paper profile-card" aria-labelledby="profile-title" data-testid="profile-card">
        <div className="document-heading">
          <h2 id="profile-title">{copy.profile}</h2>
          <span className="document-number">{applicant.id}</span>
        </div>
        <div className="profile-body">
          <figure className="profile-photo">
            <PixelPortrait portrait={applicant.portrait} scale={3} background="#b7bbb0" title={copy.photo} />
            <figcaption>{copy.photo}</figcaption>
          </figure>
          <div className="profile-details">
            <dl>
              <div><dt>{copy.name}</dt><dd className="applicant-name">{applicant.name}</dd></div>
              <div><dt>{copy.address}</dt><dd>{applicant.address}</dd></div>
              <div><dt>{copy.birthYear}</dt><dd>{applicant.birthYear}</dd></div>
            </dl>
          </div>
        </div>
        <p className="applicant-remark">“{applicant.remark}”</p>
      </section>

      <section className="video-panel" aria-labelledby="video-title" data-testid="video-strip">
        <div className="video-heading">
          <h2 id="video-title">{copy.video}</h2>
          <span className="recording-label"><span aria-hidden="true" />{copy.recording}</span>
        </div>
        <div className="video-frames">
          {applicant.video.frames.map((frame, index) => (
            <figure className="video-frame" key={index}>
              <PixelPortrait portrait={frame.portrait} eyes={frame.pose.eyes} mouth={frame.pose.mouth} scale={2} background="#929e91" title={`${copy.frame} ${index + 1}`} />
              <figcaption>{String(index + 1).padStart(2, '0')} / 03</figcaption>
            </figure>
          ))}
        </div>
        <div className="transcript-panel">
          <div className="transcript-heading"><h3>{copy.transcript}</h3><span>{applicant.video.blinked ? copy.blink : copy.noBlink}</span></div>
          <p data-testid="transcript">{applicant.video.transcript || copy.silence}</p>
        </div>
      </section>

      <section className="decision-panel" aria-labelledby="decision-title">
        <div><h2 id="decision-title">{copy.decisionLabel}</h2><p>{copy.decisionHint}</p></div>
        <div className="decision-buttons">
          <button className="stamp-button accept-button" onClick={() => onDecision('accept')}><span aria-hidden="true">✓</span> {copy.accept}</button>
          <button className="stamp-button challenge-button" onClick={() => onDecision('challenge')}><span aria-hidden="true">!</span> {copy.challenge}</button>
        </div>
      </section>
    </div>
  );
}
