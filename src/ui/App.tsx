import { PortraitGallery } from './PortraitGallery';

export function App() {
  if (import.meta.env.DEV && new URLSearchParams(window.location.search).has('portraits')) return <PortraitGallery />;
  return (
    <main>
      <h1>Proof of Humanity: Papers, Please</h1>
      <p>The registry desk is closed. Please return during office hours.</p>
    </main>
  );
}
