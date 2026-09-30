import { createContext, useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { RAIL, shiftFloor } from './room';

// Like any game, the Ministry is laid out once and scaled to fit the window: nothing ever scrolls.
// Wider windows get a wider hall and desk; very wide ones get dark bars. The desk is drawn on one
// pixel grid (an art pixel is 2 design pixels, the pixel fonts included), and pixels are only crisp
// when each lands on whole screen pixels. So the scale snaps to a step where one art pixel is a whole
// number of device pixels whenever one fits (at 1.25× or 1.5× as well as at 1× and 2×), and the layout
// takes the room that frees: a little taller or wider, never scrolled. Only a window too small for
// any crisp step gets the plain fractional fit, and softer pixels.
const DESIGN = { height: 820, minWidth: 1240, maxWidth: 1760, maxScale: 2 };
/**
 * The shortest any screen may be laid out at to reach the next crisp step: the hall gives way, the papers do
 * not. The shift asks for more on a narrow stage, where its papers are tallest (shiftFloor, room.ts).
 */
const CRISP_MIN_HEIGHT = 760;
/** A crisp step below the fit is taken only if it keeps this much of the fit's size. */
const CRISP_KEEP = 0.75;

/** Screen pixels per design pixel. A paper dragged across the desk divides the mouse by it. */
export const StageScale = createContext(1);

type Fit = { scale: number; width: number; height: number; left: number };

export function fit(w: number, h: number, dpr: number): Fit {
  const fitted = Math.min(h / DESIGN.height, w / DESIGN.minWidth, DESIGN.maxScale);
  // One art pixel (2 design pixels) to a whole number of device pixels.
  const step = 1 / (2 * dpr);
  const below = Math.floor(fitted / step + 1e-9) * step;
  const above = below + step;
  // A step above the fit lays the stage out shorter than designed: taken only where every screen still fits,
  // the shift's desk in its tallest state under the shortest hall included, at the width that step gives.
  const fits = (scale: number) => h / scale >= Math.max(CRISP_MIN_HEIGHT, shiftFloor(Math.min(w / scale, DESIGN.maxWidth)));
  const scale =
    above <= DESIGN.maxScale && w / above >= DESIGN.minWidth && fits(above)
      ? above
      : below > 0 && below >= fitted * CRISP_KEEP
        ? below
        : fitted;
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
