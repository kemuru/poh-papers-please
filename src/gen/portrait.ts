// Portrait specs: plain data describing how an applicant looks.
// generatePortrait() rolls an ordinary human from a seed; content files build the
// recurring cast by hand. drawPortrait() (drawPortrait.ts) turns a spec into pixels.
import { createRng, type Rng } from './rng';

export const SPECIES = ['human', 'raccoon'] as const;
export const SKIN_TONES = ['porcelain', 'rose', 'sand', 'olive', 'tan', 'brown', 'umber', 'ebony'] as const;
export const HEAD_SHAPES = ['oval', 'round', 'square', 'long', 'heart', 'wide'] as const;
export const EYE_STYLES = ['round', 'almond', 'narrow', 'wide', 'tired', 'beady'] as const;
export const EYE_COLORS = ['brown', 'dark', 'hazel', 'green', 'blue', 'grey'] as const;
export const BROW_STYLES = ['flat', 'thick', 'arched', 'thin', 'angry', 'worried', 'unibrow'] as const;
export const NOSE_STYLES = ['button', 'straight', 'long', 'wide', 'hooked', 'small'] as const;
export const MOUTH_STYLES = ['neutral', 'smile', 'frown', 'smirk', 'grin', 'pout'] as const;
export const EAR_STYLES = ['small', 'normal', 'big'] as const;
export const AGES = ['young', 'adult', 'old'] as const;
export const MARKS = ['none', 'freckles', 'mole', 'blush', 'scar'] as const;
export const HAIR_STYLES = [
  'bald', 'buzz', 'short', 'side-part', 'curly', 'afro', 'long',
  'bob', 'bun', 'mohawk', 'receding', 'spiky', 'pompadour', 'bowl',
] as const;
export const HAIR_COLORS = [
  'black', 'dark-brown', 'brown', 'auburn', 'ginger', 'blond',
  'platinum', 'grey', 'white', 'teal', 'plum',
] as const;
export const FACIAL_HAIR = ['none', 'stubble', 'mustache', 'beard', 'goatee'] as const;
export const OUTFITS = ['tshirt', 'shirt', 'suit', 'sweater', 'hoodie', 'turtleneck', 'trenchcoat', 'toga'] as const;
export const OUTFIT_COLORS = [
  'navy', 'olive', 'maroon', 'mustard', 'teal', 'grey',
  'beige', 'khaki', 'brown', 'plum', 'forest', 'white',
] as const;
export const ACCESSORIES = [
  'glasses', 'monocle', 'earrings', 'pearls', 'fake-mustache', 'fake-beard', 'wig', 'top-hat', 'sweat',
] as const;

export type Species = (typeof SPECIES)[number];
export type SkinTone = (typeof SKIN_TONES)[number];
export type HeadShape = (typeof HEAD_SHAPES)[number];
export type EyeStyle = (typeof EYE_STYLES)[number];
export type EyeColor = (typeof EYE_COLORS)[number];
export type BrowStyle = (typeof BROW_STYLES)[number];
export type NoseStyle = (typeof NOSE_STYLES)[number];
export type MouthStyle = (typeof MOUTH_STYLES)[number];
export type EarStyle = (typeof EAR_STYLES)[number];
export type Age = (typeof AGES)[number];
export type Mark = (typeof MARKS)[number];
export type HairStyle = (typeof HAIR_STYLES)[number];
export type HairColor = (typeof HAIR_COLORS)[number];
export type FacialHair = (typeof FACIAL_HAIR)[number];
export type Outfit = (typeof OUTFITS)[number];
export type OutfitColor = (typeof OUTFIT_COLORS)[number];
export type Accessory = (typeof ACCESSORIES)[number];

/**
 * The features that make someone recognisable. Hair, clothes and accessories
 * live outside it, so a disguise or a new haircut keeps the same face.
 * Non-human species ignore most of these fields.
 */
export type Face = {
  skin: SkinTone;
  shape: HeadShape;
  eyes: EyeStyle;
  eyeColor: EyeColor;
  brows: BrowStyle;
  nose: NoseStyle;
  mouth: MouthStyle;
  ears: EarStyle;
  age: Age;
  mark: Mark;
};

export type Portrait = {
  species: Species;
  face: Face;
  hair: HairStyle;
  hairColor: HairColor;
  facialHair: FacialHair;
  outfit: Outfit;
  outfitColor: OutfitColor;
  accessories: Accessory[];
  /** Text on a sticker worn on the chest. */
  nameTag?: string;
  /** Text on a cardboard sign held in front of the chest. */
  sign?: string;
};

/** What changes between video frames. A profile photo uses the defaults. */
export type Pose = {
  eyes: 'open' | 'closed';
  mouth: 'closed' | 'open';
};

type Table<T> = readonly (readonly [T, number])[];

const HAIR_TABLE: Table<HairStyle> = [
  ['bald', 1], ['buzz', 3], ['short', 5], ['side-part', 4], ['curly', 3], ['afro', 2], ['long', 4],
  ['bob', 3], ['bun', 2], ['mohawk', 1], ['receding', 1], ['spiky', 2], ['pompadour', 1], ['bowl', 1],
];
const HAIR_COLOR_TABLE: Table<HairColor> = [
  ['black', 4], ['dark-brown', 4], ['brown', 4], ['auburn', 2], ['ginger', 1], ['blond', 2],
  ['platinum', 1], ['grey', 1], ['teal', 0.3], ['plum', 0.3],
];
const OUTFIT_TABLE: Table<Outfit> = [
  ['tshirt', 4], ['shirt', 3], ['suit', 2], ['sweater', 3], ['hoodie', 2], ['turtleneck', 1], ['trenchcoat', 0.5],
];

/** An ordinary member of the public. Never generates disguises, props or togas; those are cast content. */
export function generatePortrait(seed: number): Portrait {
  const rng = createRng(seed);
  const age = weighted<Age>(rng, [['young', 3], ['adult', 5], ['old', 2]]);
  const face: Face = {
    skin: rng.pick(SKIN_TONES),
    shape: rng.pick(HEAD_SHAPES),
    eyes: rng.pick(EYE_STYLES),
    eyeColor: weighted(rng, [['brown', 4], ['dark', 3], ['hazel', 1], ['green', 1], ['blue', 2], ['grey', 1]]),
    brows: weighted(rng, [
      ['flat', 3], ['thick', 3], ['arched', 3], ['thin', 3], ['angry', 1], ['worried', 1], ['unibrow', 0.5],
    ]),
    nose: rng.pick(NOSE_STYLES),
    mouth: rng.pick(MOUTH_STYLES),
    ears: weighted(rng, [['small', 2], ['normal', 5], ['big', 2]]),
    age,
    mark: weighted(rng, [['none', 12], ['freckles', 2], ['mole', 2], ['blush', 2], ['scar', 1]]),
  };
  const hair = age === 'old' && rng.next() < 0.4 ? rng.pick(['bald', 'receding', 'bun'] as const) : weighted(rng, HAIR_TABLE);
  const hairColor = age === 'old' && rng.next() < 0.75 ? rng.pick(['grey', 'white'] as const) : weighted(rng, HAIR_COLOR_TABLE);
  const facialHair = weighted<FacialHair>(rng, [['none', 60], ['stubble', 15], ['mustache', 8], ['beard', 12], ['goatee', 5]]);
  const outfit = weighted(rng, OUTFIT_TABLE);
  const outfitColor = rng.pick(OUTFIT_COLORS);
  const accessories: Accessory[] = [];
  if (rng.next() < (age === 'old' ? 0.5 : 0.2)) accessories.push('glasses');
  if (rng.next() < 0.12) accessories.push('earrings');
  if (rng.next() < (age === 'old' ? 0.12 : 0.03)) accessories.push('pearls');
  return { species: 'human', face, hair, hairColor, facialHair, outfit, outfitColor, accessories };
}

function weighted<T>(rng: Rng, table: Table<T>): T {
  const total = table.reduce((sum, [, weight]) => sum + weight, 0);
  let roll = rng.next() * total;
  for (const [value, weight] of table) {
    roll -= weight;
    if (roll < 0) return value;
  }
  return table[table.length - 1][0];
}
