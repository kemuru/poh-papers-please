import { Desk } from './Desk';
import { PortraitGallery } from './PortraitGallery';

export function App() {
  const params = new URLSearchParams(window.location.search);
  if (import.meta.env.DEV && params.has('portraits')) return <PortraitGallery />;
  const seed = seedFrom(params.get('seed'));
  return <Desk key={seed} seed={seed} />;
}

/** The applicant's seed from ?seed=N; seed 1 when there is none. */
function seedFrom(value: string | null) {
  return value !== null && /^\d{1,9}$/.test(value) ? Number(value) : 1;
}
