import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { TERMINAL_KEYS } from '../content/desk';
import type { Portrait } from '../gen/portrait';
import { findFace, findName } from '../rules/registry';
import type { Registrant, Registry } from '../rules/types';
import { formatYear, registeredWhere } from './evidence';
import { Inspectable } from './Inspect';
import { PixelPortrait } from './PixelPortrait';

/** What the clerk last asked the registry. */
export type Lookup = { by: 'name'; name: string } | { by: 'face' };

/**
 * The registry terminal, from day 4. It answers what it is asked, and no more: who is on the
 * books under a name, and whose vouch they are serving today; or who is on file with this face.
 * It never says whether anyone may be registered. That is the clerk's job.
 */
export function RegistryLookup({
  registry,
  voucher,
  face,
  faceSearch = true,
  lookup,
  onLookup,
}: {
  registry: Registry;
  /** The voucher on the form at the window, if there is one to look up. */
  voucher: string | null;
  /** The face in the video at the window, if someone is there. */
  face: Portrait | null;
  /** Whether the face search is on the desk yet: it comes with Rule 5. */
  faceSearch?: boolean;
  lookup: Lookup | null;
  onLookup: (lookup: Lookup) => void;
}) {
  const [typed, setTyped] = useState('');
  const box = useRef<HTMLInputElement>(null);
  // A name looked up from the form lands in the box too, to change and search again; the next
  // applicant finds it empty.
  useEffect(() => {
    if (lookup?.by === 'name') setTyped(lookup.name);
    else if (lookup === null) setTyped('');
  }, [lookup]);
  // Searching hands the keys back to the desk, so A, C, Space and Escape work again at once.
  const search = (e: FormEvent) => {
    e.preventDefault();
    if (!typed.trim()) return;
    onLookup({ by: 'name', name: typed.trim() });
    box.current?.blur();
  };
  const keepFocus = (e: { preventDefault: () => void }) => e.preventDefault();
  return (
    <div className="doc registry" aria-label="Registry lookup">
      <h2 className="doc-title">Registry lookup</h2>
      <form className="lookup-form" onSubmit={search}>
        {/* The terminal's input line, the width of its screen: its prompt, and the name typed after it. */}
        <span className="lookup-line">
          <span className="lookup-prompt" aria-hidden="true">
            &gt;
          </span>
          <input
            ref={box}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                e.preventDefault();
                box.current?.blur();
              }
            }}
            aria-label="Name to look up"
            placeholder="A name"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            spellCheck={false}
            autoComplete="off"
          />
        </span>
        {/* The terminal's return key: the arrow printed on it is all it says. */}
        <button type="submit" className="steel-key lookup-enter" aria-label={TERMINAL_KEYS.search} title={TERMINAL_KEYS.searchTitle} disabled={!typed.trim()}>
          <span className="lookup-return" aria-hidden="true" />
        </button>
      </form>
      {/* The terminal's two keys for whoever is at the window. */}
      <div className="lookup-quick">
        <button className="steel-key" disabled={!voucher} onClick={() => voucher && onLookup({ by: 'name', name: voucher })} onMouseDown={keepFocus}>
          {TERMINAL_KEYS.voucher} <kbd>V</kbd>
        </button>
        {faceSearch && (
          <button className="steel-key" disabled={!face} onClick={() => onLookup({ by: 'face' })} onMouseDown={keepFocus} title={TERMINAL_KEYS.faceTitle}>
            {TERMINAL_KEYS.face} <kbd>F</kbd>
          </button>
        )}
      </div>
      <div className="lookup-result" role="status" aria-live="polite" data-testid="lookup-result">
        {(lookup === null || (lookup.by === 'face' && !face)) && (
          <p className="lookup-idle">{faceSearch ? 'Search a name, or the face in the video.' : 'Search a name.'}</p>
        )}
        {lookup?.by === 'name' && (
          <Inspectable item={{ kind: 'name-record', name: lookup.name }} label={`the registry's answer for ${lookup.name}`} className="record-holder">
            <NameResult name={lookup.name} found={findName(registry, lookup.name)} />
          </Inspectable>
        )}
        {lookup?.by === 'face' && face && (
          <Inspectable item={{ kind: 'face-record' }} label="the registry's answer for the face" className="record-holder">
            <FaceResult face={face} found={findFace(registry, face)} />
          </Inspectable>
        )}
      </div>
    </div>
  );
}

function NameResult({ name, found }: { name: string; found: Registrant | null }) {
  if (!found)
    return (
      <p className="record-none">
        Searched “{name}”. No registered human by that name.
      </p>
    );
  return (
    <Record r={found}>
      <div>
        <dt>Vouching today for</dt> <dd data-testid="vouching">{found.vouching ?? 'nobody'}</dd>
      </div>
    </Record>
  );
}

/** What was searched, beside what the registry has: the clerk compares the faces, not the registry. */
function FaceResult({ face, found }: { face: Portrait; found: Registrant[] }) {
  return (
    <>
      {/* The answer runs round the face searched, and on under it. */}
      <p className={found.length === 0 ? 'record-none searched' : 'record-count searched'}>
        <span className="record-face">
          <PixelPortrait portrait={face} scale={2} background="#cfd8dc" title="The face searched" />
        </span>
        Searched the face in the video. On file with this face: {found.length === 0 ? 'nobody' : found.length}.
      </p>
      {found.map((r) => (
        <Record key={r.name} r={r} />
      ))}
    </>
  );
}

/** "Window 7" and "day 4" are one thing each: the terminal never breaks one across two lines. */
function unbroken(text: string): ReactNode[] {
  return text.split(/((?:Window|day) \d+)/).map((part, i) => (i % 2 ? <span key={i} className="unbroken">{part}</span> : part));
}

function Record({ r, children }: { r: Registrant; children?: ReactNode }) {
  return (
    <div className="record" data-testid="record">
      <span className="record-face">
        <PixelPortrait portrait={r.face} scale={2} background="#cfd8dc" title={`Face on file for ${r.name}`} />
      </span>
      {/* One line to each entry, as the terminal prints it. */}
      <dl>
        <div>
          <dt>Name</dt> <dd data-testid="record-name">{r.name}</dd>
        </div>
        <div>
          <dt>Born</dt> <dd>{formatYear(r.birthYear)}</dd>
        </div>
        <div>
          <dt>Registered</dt> <dd>{unbroken(registeredWhere(r))}</dd>
        </div>
        {children}
      </dl>
    </div>
  );
}
