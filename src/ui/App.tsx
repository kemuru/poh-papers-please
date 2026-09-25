import { useReducer } from 'react';
import { DAY_ONE_RULEBOOK, DESK_COPY as copy, RULE_COPY } from '../content/dayOne';
import { createGame, gameReducer, type Decision } from '../game';
import { ApplicantDesk } from './ApplicantDesk';
import { DecisionReceipt } from './DecisionReceipt';
import { PortraitGallery } from './PortraitGallery';
import { playStamp } from './stampSound';
import { useGameDebug } from './useGameDebug';
import './desk.css';

export function App() {
  if (import.meta.env.DEV && new URLSearchParams(window.location.search).has('portraits')) return <PortraitGallery />;
  return <RegistryDesk />;
}

function initialSeed() {
  const input = new URLSearchParams(window.location.search).get('seed');
  const seed = Number(input);
  return input !== null && /^\d+$/.test(input) && Number.isSafeInteger(seed) && seed <= 0xffffffff ? seed : 1;
}

function RegistryDesk() {
  const [state, dispatch] = useReducer(gameReducer, undefined, () => createGame(initialSeed()));
  useGameDebug(state);
  const decide = (decision: Decision) => {
    dispatch({ type: 'decide', decision });
    if (decision === 'accept') playStamp();
  };

  return (
    <div className="registry-app">
      <header className="ministry-header">
        <div className="ministry-name"><span className="ministry-seal" aria-hidden="true">H</span><div><strong>{copy.ministry}</strong><span>{copy.department}</span></div></div>
        <span className="window-label">{copy.window}</span>
      </header>
      <main className="registry-desk">
        <div className="desk-title"><div><p className="eyebrow">{copy.subtitle}</p><h1>{copy.title}</h1></div><div className="day-badge"><strong>{copy.day}</strong><span>{copy.shift}</span></div></div>
        <div className="shift-heading"><span className="status-light" aria-hidden="true" /><p>{copy.task}</p><span className="application-count">01 / 01</span></div>
        <div className="desk-layout">
          {state.outcome
            ? <DecisionReceipt applicant={state.applicant} outcome={state.outcome} onReplay={() => dispatch({ type: 'replay' })} />
            : <ApplicantDesk applicant={state.applicant} onDecision={decide} />}
          <aside className="desk-sidebar">
            <section className="paper rulebook" aria-labelledby="rulebook-title">
              <div className="rulebook-cover"><span className="eyebrow">{copy.ministry}</span><h2 id="rulebook-title">{copy.rulebook}</h2><span className="rulebook-edition">01</span></div>
              <div className="rulebook-body"><span className="rule-tab">{copy.activeRule}</span><h3>{RULE_COPY['day-1-phrase'].title}</h3><p>{copy.phraseLabel}</p><blockquote>{DAY_ONE_RULEBOOK.requiredPhrase}</blockquote><p className="matching-note">{copy.matching}</p><p className="rule-note">{copy.ruleNote}</p></div>
            </section>
            <section className="supervisor-memo" aria-labelledby="memo-title"><h2 id="memo-title">{copy.memoLabel}</h2><p>{copy.memo}</p><span className="memo-signature" aria-hidden="true">— W. 03</span></section>
          </aside>
        </div>
      </main>
      <footer className="ministry-footer"><span>{copy.ministry} / {copy.window}</span><span>{copy.footer}</span></footer>
    </div>
  );
}
