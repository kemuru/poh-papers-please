// Dev-only page (not part of the build): http://localhost:5173/dev/portraits.html
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ACCESSORIES, type Accessory } from '../../gen/portrait';
import { Portrait } from '../Portrait';

const SEEDS = Array.from({ length: 24 }, (_, i) => i + 1);
const ACCESSORY_SEED = 1;
const ACCESSORY_SETS: (readonly Accessory[])[] = [[], ...ACCESSORIES.map((a) => [a]), ACCESSORIES];

const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, 96px)', gap: 16 } as const;
const cell = { margin: 0, textAlign: 'center', fontSize: 12 } as const;

function PortraitsPage() {
  return (
    <main style={{ fontFamily: 'monospace', padding: 16 }}>
      <h1>Portraits</h1>
      <section data-testid="portrait-grid" style={grid}>
        {SEEDS.map((seed) => (
          <figure key={seed} style={cell}>
            <Portrait seed={seed} alt={`Portrait, seed ${seed}`} />
            <figcaption>seed {seed}</figcaption>
          </figure>
        ))}
      </section>
      <h2>Accessories, seed {ACCESSORY_SEED}</h2>
      <section style={grid}>
        {ACCESSORY_SETS.map((set) => {
          const label = set.length === 0 ? 'none' : set.length === ACCESSORIES.length ? 'all' : set[0];
          return (
            <figure key={label} style={cell}>
              <Portrait seed={ACCESSORY_SEED} accessories={set} alt={`Portrait, seed ${ACCESSORY_SEED}, ${label}`} />
              <figcaption>{label}</figcaption>
            </figure>
          );
        })}
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PortraitsPage />
  </StrictMode>,
);
