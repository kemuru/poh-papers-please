import { createContext, useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { RAIL } from './room';

// Like any game, the Ministry is laid out once and scaled to fit the window: nothing ever scrolls, and nothing is
// cut. Every window gets the same hall and the same papers at the same size (room.ts): a wider window sees more of
// the room at either end, a taller one more of the desk under the papers, and only one wider than any desk gets dark
// bars. Until 1 Oct 2026 a big monitor's stage drew the evidence twice as big and took the room for it from the hall.
// The desk is drawn on one pixel grid (an art pixel is 2 design pixels, the pixel fonts included), and pixels are only
// crisp when each lands on whole screen pixels. So the scale snaps down to a step where one art pixel is a whole
// number of device pixels (at 1.25× or 1.5× as well as at 1× and 2×) whenever that keeps enough of the fit, and the
// layout takes the room that frees; otherwise it takes the plain fractional fit, and softer pixels.
const DESIGN = { minWidth: 1400, maxWidth: 1920, height: 820, maxScale: 2 };
/**
 * A crisp step below the fit is always taken at full size or more (the type reads well from scale 1, and a 1080p
 * monitor stays crisp at 1 rather than soft at 1.16); below full size, only if it keeps this much of the fit's size.
 * Until 30 Sep 2026 that was 0.75, and a 13-inch MacBook's window with the Dock and a bookmarks bar (1320×759) took
 * 0.75 and set every word a quarter smaller; it now takes its fit, about 0.93.
 */
const CRISP_KEEP = 0.85;

/** Screen pixels per design pixel. A paper dragged across the desk divides the mouse by it. */
export const StageScale = createContext(1);

type Fit = { scale: number; width: number; height: number; left: number };

export function fit(w: number, h: number, dpr: number): Fit {
  // Never narrower or shorter than the design: there the desk's tallest state fits under the hall (room.ts).
  const fitted = Math.min(h / DESIGN.height, w / DESIGN.minWidth, DESIGN.maxScale);
  // One art pixel (2 design pixels) to a whole number of device pixels.
  const step = 1 / (2 * dpr);
  const below = Math.floor(fitted / step + 1e-9) * step;
  const scale = below > 0 && (below >= 1 || below >= fitted * CRISP_KEEP) ? below : fitted;
  const width = Math.min(w / scale, DESIGN.maxWidth);
  // The stage starts on a whole device pixel, so its pixels do too.
  const left = Math.round(((w - width * scale) / 2) * dpr) / dpr;
  return { scale, width, height: h / scale, left };
}

const measure = () => fit(window.innerWidth, window.innerHeight, window.devicePixelRatio || 1);

export function Stage({ children }: { children: ReactNode }) {
  const [box, setBox] = useState(measure);
  useEffect(() => {
    const onResize = () => setBox(measure());
    window.addEventListener('resize', onResize);
    // A browser zoom changes the device pixel ratio, and with it the crisp steps.
    const zoom = window.matchMedia(`(resolution: ${window.devicePixelRatio || 1}dppx)`);
    zoom.addEventListener?.('change', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      zoom.removeEventListener?.('change', onResize);
    };
  }, [box.scale]);
  return (
    <div className="stage-frame">
      <div
        className="stage"
        // The desk rail's height is the one the stage allows for (room.ts): desk.css draws .topbar with it.
        style={{ width: box.width, height: box.height, transform: `translate(${box.left}px, 0) scale(${box.scale})`, '--rail': `${RAIL}px` } as CSSProperties}
      >
        <StageScale.Provider value={box.scale}>{children}</StageScale.Provider>
      </div>
    </div>
  );
}
