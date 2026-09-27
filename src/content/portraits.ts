// How the recurring cast looks (who they are: notes/game-design.md).
// Only characters the portrait generator can draw today are here: humans and Gary.
import type { Face, Portrait } from '../gen/portrait';

/** Raccoons are drawn from species art; this face only keeps Gary identical to himself across days. */
const GARY_FACE: Face = {
  skin: 'olive', shape: 'round', eyes: 'beady', eyeColor: 'dark', brows: 'flat',
  nose: 'button', mouth: 'neutral', ears: 'normal', age: 'adult', mark: 'none',
};

/** Three raccoons in a trench coat. The one on top does the talking. */
export const GARY: Portrait = {
  species: 'raccoon',
  face: GARY_FACE,
  hair: 'bald',
  hairColor: 'grey',
  facialHair: 'none',
  outfit: 'trenchcoat',
  outfitColor: 'khaki',
  accessories: [],
};

/** Gary's disguises in the order the design doc lists them. The sign is the day 6 one. */
export const GARY_DISGUISES: Partial<Portrait>[] = [
  { accessories: ['fake-mustache'] },
  { accessories: ['monocle'] },
  { nameTag: 'HUMAN' },
  { accessories: ['fake-beard'] },
  { accessories: ['wig'] },
  { sign: 'NOT RACCOONS' },
];

export const CAST_PORTRAITS = {
  gary: GARY,
  /** So normal she is suspicious. */
  brenda: {
    species: 'human',
    face: {
      skin: 'sand', shape: 'oval', eyes: 'round', eyeColor: 'brown', brows: 'flat',
      nose: 'straight', mouth: 'neutral', ears: 'normal', age: 'adult', mark: 'none',
    },
    hair: 'bob',
    hairColor: 'brown',
    facialHair: 'none',
    outfit: 'sweater',
    outfitColor: 'beige',
    accessories: [],
  },
  /** Born 1922. Fierce. */
  grandmaEthel: {
    species: 'human',
    face: {
      skin: 'porcelain', shape: 'heart', eyes: 'narrow', eyeColor: 'grey', brows: 'angry',
      nose: 'hooked', mouth: 'frown', ears: 'normal', age: 'old', mark: 'none',
    },
    hair: 'bun',
    hairColor: 'white',
    facialHair: 'none',
    outfit: 'sweater',
    outfitColor: 'plum',
    accessories: ['glasses', 'pearls'],
  },
  socrates: {
    species: 'human',
    face: {
      skin: 'olive', shape: 'long', eyes: 'tired', eyeColor: 'dark', brows: 'thick',
      nose: 'wide', mouth: 'neutral', ears: 'big', age: 'old', mark: 'none',
    },
    hair: 'receding',
    hairColor: 'white',
    facialHair: 'beard',
    outfit: 'toga',
    outfitColor: 'white',
    accessories: [],
  },
  /** Sweats. Blinks far too much. */
  nervousNigel: {
    species: 'human',
    face: {
      skin: 'rose', shape: 'long', eyes: 'wide', eyeColor: 'blue', brows: 'worried',
      nose: 'long', mouth: 'grin', ears: 'big', age: 'young', mark: 'blush',
    },
    hair: 'side-part',
    hairColor: 'ginger',
    facialHair: 'none',
    outfit: 'shirt',
    outfitColor: 'white',
    accessories: ['sweat'],
  },
  /** A human whose parents had a sense of humour. */
  robotMcBotface: {
    species: 'human',
    face: {
      skin: 'brown', shape: 'square', eyes: 'almond', eyeColor: 'dark', brows: 'thick',
      nose: 'button', mouth: 'smile', ears: 'normal', age: 'adult', mark: 'none',
    },
    hair: 'short',
    hairColor: 'black',
    facialHair: 'stubble',
    outfit: 'hoodie',
    outfitColor: 'grey',
    accessories: [],
  },
  /** Works nights. Came straight from the depot, in the vest. */
  nightShiftDenise: {
    species: 'human',
    face: {
      skin: 'tan', shape: 'round', eyes: 'tired', eyeColor: 'hazel', brows: 'flat',
      nose: 'small', mouth: 'neutral', ears: 'normal', age: 'adult', mark: 'none',
    },
    hair: 'bun',
    hairColor: 'dark-brown',
    facialHair: 'none',
    outfit: 'hoodie',
    outfitColor: 'navy',
    accessories: ['hi-vis'],
  },
} satisfies Record<string, Portrait>;
