import { useMemo } from 'react';
import { drawPortrait, PORTRAIT_HEIGHT, PORTRAIT_WIDTH, type PixelImage } from '../gen/drawPortrait';
import type { Portrait, Pose } from '../gen/portrait';

type Props = {
  portrait: Portrait;
  eyes?: Pose['eyes'];
  mouth?: Pose['mouth'];
  /** Screen pixels per portrait pixel. */
  scale?: number;
  background?: string;
  title?: string;
  /** Only this part of the portrait, in portrait pixels: the rulebook's figure shows the face, not the shirt. */
  crop?: { x: number; y: number; width: number; height: number };
};

export function PixelPortrait({ portrait, eyes = 'open', mouth = 'closed', scale = 3, background, title, crop }: Props) {
  const paths = useMemo(() => pixelPaths(drawPortrait(portrait, { eyes, mouth })), [portrait, eyes, mouth]);
  const { x, y, width, height } = crop ?? { x: 0, y: 0, width: PORTRAIT_WIDTH, height: PORTRAIT_HEIGHT };
  return (
    <svg
      viewBox={`${x} ${y} ${width} ${height}`}
      width={width * scale}
      height={height * scale}
      shapeRendering="crispEdges"
      role="img"
      aria-label={title}
    >
      {background && <rect width={PORTRAIT_WIDTH} height={PORTRAIT_HEIGHT} fill={background} />}
      {paths.map(({ color, d }) => (
        <path key={color} fill={color} d={d} />
      ))}
    </svg>
  );
}

/** One SVG path per colour, built from horizontal runs: about 30 elements instead of 1920 rects. */
export function pixelPaths({ width, height, pixels }: PixelImage): { color: string; d: string }[] {
  const runs = new Map<string, string>();
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; ) {
      const color = pixels[y * width + x];
      let end = x + 1;
      while (end < width && pixels[y * width + end] === color) end++;
      if (color !== null) runs.set(color, `${runs.get(color) ?? ''}M${x} ${y}h${end - x}v1h${x - end}z`);
      x = end;
    }
  }
  return [...runs].map(([color, d]) => ({ color, d }));
}
