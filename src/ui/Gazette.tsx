import { GAZETTE_TITLE, WELCOME } from '../content/gazette';
import { RULEBOOK } from '../content/rulebook';
import type { Gazette } from '../gen/gazette';
import { RULE_DAYS, RULES } from '../rules/judge';

/** The morning paper, on the blotter until the window opens. Nothing in it costs shift time. */
export function GazettePage({ gazette }: { gazette: Gazette }) {
  const rule = RULES.find((r) => RULE_DAYS[r] === gazette.day);
  return (
    <article className="gazette" aria-label="The Registry Gazette" data-testid="gazette">
      <header className="gazette-mast">
        <span>Day {gazette.day}</span>
        <h2>{GAZETTE_TITLE}</h2>
        <span>{gazette.countdown}</span>
      </header>
      <h3 className="gazette-headline" data-testid="headline">
        {gazette.headline}
      </h3>
      <div className="gazette-columns">
        <section className="gazette-report" data-testid="report">
          {gazette.report.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </section>
        <section className="gazette-notice" data-testid="rule-notice">
          <h4>Ministry notice{rule ? ` · Rule ${RULEBOOK[rule].number}: ${RULEBOOK[rule].title}` : ''}</h4>
          <p>{gazette.notice}</p>
        </section>
      </div>
      <footer className="gazette-foot">
        <p>{gazette.thread}</p>
        <p className="gazette-small">{gazette.small}</p>
      </footer>
    </article>
  );
}

/** Day 1: the supervisor's letter, where the Gazette will be from tomorrow. */
export function WelcomeLetter() {
  return (
    <article className="welcome" aria-label="Welcome letter" data-testid="welcome">
      <h2>{WELCOME.title}</h2>
      {WELCOME.lines.map((line) => (
        <p key={line}>{line}</p>
      ))}
      <p className="welcome-sign">{WELCOME.signature}</p>
    </article>
  );
}
