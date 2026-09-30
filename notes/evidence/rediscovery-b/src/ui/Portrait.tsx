import { drawPortrait, type Accessory } from '../gen/portrait';

type Props = { seed: number; accessories?: readonly Accessory[]; size?: number; alt: string };

export function Portrait({ seed, accessories, size = 96, alt }: Props) {
  const src = `data:image/svg+xml,${encodeURIComponent(drawPortrait(seed, accessories))}`;
  return <img src={src} width={size} height={size} alt={alt} style={{ imageRendering: 'pixelated' }} />;
}
