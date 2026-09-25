import { useMemo, useState, type ReactNode } from 'react';
import { CAST_PORTRAITS, GARY, GARY_DISGUISES } from '../content/portraits';
import { ACCESSORIES, generatePortrait, type Portrait } from '../gen/portrait';
import { PixelPortrait } from './PixelPortrait';

// Development page (open /?portraits): browse seeds, poses, accessories and the cast.

const PHOTO_BG = '#cfd8dc';
const VIDEO_BG = '#8f9b9e';
const GRID_SEEDS = Array.from({ length: 48 }, (_, i) => i + 1);

export function PortraitGallery() {
  const [seed, setSeed] = useState(1);
  const portrait = useMemo(() => generatePortrait(seed), [seed]);
  const grid = useMemo(() => GRID_SEEDS.map((s) => [s, generatePortrait(s)] as const), []);

  return (
    <main style={{ fontFamily: 'monospace', padding: 16, background: '#e4e6e3', color: '#2a2220', minHeight: '100vh' }}>
      <h1>Portrait lab</h1>
      <p>Seed in, face out. The same seed always draws the same face.</p>

      <section>
        <h2>Seed {seed}</h2>
        <label>
          Seed{' '}
          <input type="number" value={seed} onChange={(e) => setSeed(Number(e.target.value) || 0)} style={{ width: 90 }} />
        </label>{' '}
        <button onClick={() => setSeed(seed - 1)}>Previous</button> <button onClick={() => setSeed(seed + 1)}>Next</button>
        <Row>
          <Tile label="Profile photo" testId="photo">
            <PixelPortrait portrait={portrait} scale={5} background={PHOTO_BG} />
          </Tile>
          <Tile label="Frame 1" testId="frame-1">
            <PixelPortrait portrait={portrait} scale={3} background={VIDEO_BG} />
          </Tile>
          <Tile label="Frame 2: speaking" testId="frame-2">
            <PixelPortrait portrait={portrait} mouth="open" scale={3} background={VIDEO_BG} />
          </Tile>
          <Tile label="Frame 3: blink" testId="frame-3">
            <PixelPortrait portrait={portrait} eyes="closed" scale={3} background={VIDEO_BG} />
          </Tile>
          <pre style={{ fontSize: 11, margin: 0 }}>{JSON.stringify(portrait, null, 1)}</pre>
        </Row>
      </section>

      <section>
        <h2>Accessories on seed {seed}</h2>
        <Row>
          {ACCESSORIES.map((item) => (
            <Tile key={item} label={item}>
              <PixelPortrait portrait={{ ...portrait, accessories: [item] }} scale={2} background={PHOTO_BG} />
            </Tile>
          ))}
          <Tile label="name tag">
            <PixelPortrait portrait={{ ...portrait, nameTag: 'HUMAN' }} scale={2} background={PHOTO_BG} />
          </Tile>
          <Tile label="sign">
            <PixelPortrait portrait={{ ...portrait, sign: 'NOT RACCOONS' }} scale={2} background={PHOTO_BG} />
          </Tile>
        </Row>
      </section>

      <section>
        <h2>Cast</h2>
        <Row>
          {Object.entries(CAST_PORTRAITS).map(([name, p]) => (
            <Tile key={name} label={name}>
              <PixelPortrait portrait={p} scale={3} background={PHOTO_BG} />
            </Tile>
          ))}
        </Row>
        <h3>Gary&apos;s disguises</h3>
        <Row>
          {GARY_DISGUISES.map((disguise, i) => (
            <Tile key={i} label={describe({ ...GARY, ...disguise })}>
              <PixelPortrait portrait={{ ...GARY, ...disguise }} scale={3} background={PHOTO_BG} />
            </Tile>
          ))}
        </Row>
      </section>

      <section>
        <h2>Applicants 1 to 48</h2>
        <div data-testid="portrait-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {grid.map(([s, p]) => (
            <button key={s} data-seed={s} onClick={() => setSeed(s)} style={{ padding: 2, border: s === seed ? '2px solid #2a2220' : '2px solid transparent', background: 'none' }}>
              <PixelPortrait portrait={p} scale={2} background={PHOTO_BG} title={`Seed ${s}`} />
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}

function describe(p: Portrait) {
  return [...p.accessories, p.nameTag && `tag "${p.nameTag}"`, p.sign && `sign "${p.sign}"`].filter(Boolean).join(', ');
}

function Row({ children }: { children: ReactNode }) {
  return <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-start' }}>{children}</div>;
}

function Tile({ label, testId, children }: { label: string; testId?: string; children: ReactNode }) {
  return (
    <figure data-testid={testId} style={{ margin: 0 }}>
      {children}
      <figcaption style={{ fontSize: 12 }}>{label}</figcaption>
    </figure>
  );
}
