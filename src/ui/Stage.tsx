import { createContext, useEffect, useState, type ReactNode } from 'react';

// Like any game, the Ministry is laid out once, at a fixed height, and scaled to fit the window:
// nothing ever scrolls. Wider windows get a wider hall and desk; very wide ones get dark bars.
const DESIGN = { height: 820, minWidth: 1240, maxWidth: 1760, maxScale: 2 };

/** Screen pixels per design pixel. A paper dragged across the desk divides the mouse by it. */
export const StageScale = createContext(1);

type Fit = { scale: number; width: number; height: number; left: number };

function fit(): Fit {
  const { innerWidth: w, innerHeight: h } = window;
  const scale = Math.min(h / DESIGN.height, w / DESIGN.minWidth, DESIGN.maxScale);
  const width = Math.min(w / scale, DESIGN.maxWidth);
  return { scale, width, height: h / scale, left: (w - width * scale) / 2 };
}

export function Stage({ children }: { children: ReactNode }) {
  const [box, setBox] = useState(fit);
  useEffect(() => {
    const onResize = () => setBox(fit());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return (
    <div className="stage-frame">
      <div
        className="stage"
        style={{ width: box.width, height: box.height, transform: `translate(${box.left}px, 0) scale(${box.scale})` }}
      >
        <StageScale.Provider value={box.scale}>{children}</StageScale.Provider>
      </div>
    </div>
  );
}
